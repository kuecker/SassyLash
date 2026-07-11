import {
  getBookingByRef,
  listBookingsByStatus,
  confirmBooking,
  releaseBooking,
} from '@/lib/db/bookings'
import {
  sendClientConfirmation,
  sendClientDenial,
  sendOwnerInvalidReply,
} from '@/lib/sms'

// Inbound owner SMS replies. AWS End User Messaging two-way SMS publishes each
// inbound message to an SNS topic; this Lambda is subscribed to it. Because SNS
// invokes the Lambda directly (IAM-authenticated), the payload is trusted — no
// signature check needed (unlike the old HTTP Twilio webhook). We still verify
// the sender is the owner and ignore everything else. Replaces
// app/api/twilio/webhook/route.ts. STOP/HELP are handled by AWS at the carrier
// level, so no app code is required.

type SnsEvent = { Records: { Sns: { Message: string } }[] }
type InboundSms = { originationNumber?: string; messageBody?: string }

const normalize = (p: string) => p.replace(/[\s\-().+]/g, '')

export async function handler(event: SnsEvent): Promise<void> {
  const owner = normalize(process.env.OWNER_PHONE_NUMBER ?? '')

  for (const record of event.Records) {
    let payload: InboundSms
    try {
      payload = JSON.parse(record.Sns.Message)
    } catch {
      continue
    }

    const from = normalize(payload.originationNumber ?? '')
    if (!from || !owner || from !== owner) continue // ignore non-owner senders

    const body = (payload.messageBody ?? '').trim().toUpperCase()
    const [action, ref] = body.split(/\s+/)

    if (action !== 'YES' && action !== 'NO') {
      try { await sendOwnerInvalidReply() } catch (e) { console.error('invalid-reply SMS failed:', e) }
      continue
    }

    // Prefer the referenced booking; fall back to the oldest pending one.
    let booking = ref ? await getBookingByRef(ref) : null
    if (booking && booking.status !== 'pending') booking = null
    if (!booking) {
      const pending = await listBookingsByStatus('pending') // GSI3SK=created_at asc → oldest first
      booking = pending[0] ?? null
    }
    if (!booking) {
      try { await sendOwnerInvalidReply() } catch (e) { console.error('invalid-reply SMS failed:', e) }
      continue
    }

    if (action === 'YES') {
      await confirmBooking(booking)
      try {
        await sendClientConfirmation({
          client_phone: booking.client_phone,
          client_name:  booking.client_name,
          service_name: booking.service_name,
          start_time:   booking.start_time,
        })
      } catch (e) { console.error('confirmation SMS failed:', e) }
    } else {
      await releaseBooking(booking, 'denied')
      try {
        await sendClientDenial({
          client_phone: booking.client_phone,
          client_name:  booking.client_name,
          service_name: booking.service_name,
          start_time:   booking.start_time,
        })
      } catch (e) { console.error('denial SMS failed:', e) }
    }
  }
}
