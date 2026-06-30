import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendClientExpiry } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const db = createServiceRoleClient()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: expired } = await db
    .from('bookings')
    .select('*, clients(*), services(*)')
    .eq('status', 'pending')
    .lt('created_at', cutoff)

  if (!expired || expired.length === 0) {
    return NextResponse.json({ expired: 0 })
  }

  const ids = expired.map((b: any) => b.id)

  await db
    .from('bookings')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .in('id', ids)

  await Promise.allSettled(
    expired.map((b: any) =>
      sendClientExpiry({
        client_phone: b.clients.phone,
        client_name:  b.clients.name,
        service_name: b.services.name,
      })
    )
  )

  return NextResponse.json({ expired: ids.length })
}

export const GET = POST
