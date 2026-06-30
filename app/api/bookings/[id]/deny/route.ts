import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { sendClientDenial } from '@/lib/twilio'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceRoleClient()

  const { data: booking } = await db
    .from('bookings')
    .select('*, clients(*), services(*)')
    .eq('id', id)
    .eq('status', 'pending')
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found or not pending' }, { status: 404 })
  }

  const { error: updateError } = await db
    .from('bookings')
    .update({ status: 'denied', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }

  try {
    await sendClientDenial({
      client_phone: booking.clients.phone,
      client_name:  booking.clients.name,
      service_name: booking.services.name,
      start_time:   booking.start_time,
    })
  } catch (e) {
    console.error('Failed to send client denial SMS:', e)
  }

  return NextResponse.json({ ok: true })
}
