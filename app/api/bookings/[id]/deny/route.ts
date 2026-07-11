import { NextRequest, NextResponse } from 'next/server'
import { requestIsOwner } from '@/lib/auth/cognito'
import { getBooking, releaseBooking } from '@/lib/db/bookings'
import { sendClientDenial } from '@/lib/sms'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requestIsOwner(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const booking = await getBooking(id)
  if (!booking || booking.status !== 'pending') {
    return NextResponse.json({ error: 'Booking not found or not pending' }, { status: 404 })
  }

  await releaseBooking(booking, 'denied')

  try {
    await sendClientDenial({
      client_phone: booking.client_phone,
      client_name:  booking.client_name,
      service_name: booking.service_name,
      start_time:   booking.start_time,
    })
  } catch (e) {
    console.error('Failed to send client denial SMS:', e)
  }

  return NextResponse.json({ ok: true })
}
