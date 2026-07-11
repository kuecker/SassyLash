import { listBookingsByStatus, releaseBooking } from '@/lib/db/bookings'
import { sendClientExpiry } from '@/lib/sms'

// Hourly expiry sweep. Invoked directly by EventBridge Scheduler (see
// sst.config.ts) — no HTTP surface, so no CRON_SECRET; invocation is
// IAM-authenticated. Expires pending bookings older than 24h, frees their slot
// locks (via releaseBooking), and notifies the client. Replaces
// app/api/cron/expire/route.ts.
export async function handler(): Promise<{ expired: number }> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const pending = await listBookingsByStatus('pending')
  const toExpire = pending.filter((b) => new Date(b.created_at).getTime() < cutoff)

  if (toExpire.length === 0) return { expired: 0 }

  for (const b of toExpire) {
    try {
      await releaseBooking(b, 'expired')
    } catch (e) {
      console.error(`Failed to expire booking ${b.id}:`, e)
    }
  }

  await Promise.allSettled(
    toExpire.map((b) =>
      sendClientExpiry({
        client_phone: b.client_phone,
        client_name:  b.client_name,
        service_name: b.service_name,
      })
    )
  )

  return { expired: toExpire.length }
}
