import { NextRequest, NextResponse } from 'next/server'
import { generateBookingRef } from '@/lib/booking-ref'
import { sendOwnerNotification } from '@/lib/sms'
import { getService } from '@/lib/db/services'
import { upsertClient } from '@/lib/db/clients'
import { createBooking, setBookingMessageId } from '@/lib/db/bookings'

const TZ = process.env.BUSINESS_TIMEZONE ?? 'America/Denver'

export async function POST(request: NextRequest) {
  let body: { serviceId?: string; start?: string; name?: string; phone?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { serviceId, start, name, phone, email } = body

  if (!serviceId || !start || !name || !phone || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Basic length + format guards
  if (name.length > 100 || email.length > 200 || phone.length > 20) {
    return NextResponse.json({ error: 'Invalid field length' }, { status: 400 })
  }
  if (!/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Reject past bookings and anything more than 90 days out (limits abuse window)
  const startDate = new Date(start)
  const maxDate   = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  if (isNaN(startDate.getTime()) || startDate > maxDate) {
    return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
  }
  if (startDate.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Cannot book a slot in the past.' }, { status: 400 })
  }

  const service = await getService(serviceId)
  if (!service || !service.active) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  // Upsert client by phone (natural unique key)
  let client
  try {
    client = await upsertClient({ name, phone, email })
  } catch (e) {
    console.error('Failed to upsert client:', e)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }

  // Atomic booking creation (prevents double-booking + one-pending-per-client)
  const shortRef = generateBookingRef()
  const result = await createBooking({
    shortRef,
    client: { phone: client.phone, name: client.name, email: client.email },
    serviceId: service.id,
    serviceName: service.name,
    durationMinutes: service.duration_minutes,
    startTime: startDate.toISOString(),
    timezone: TZ,
  })

  if (!result.ok) {
    if (result.reason === 'client_has_pending') {
      return NextResponse.json({ error: 'You already have a pending booking request.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'This slot is no longer available.' }, { status: 409 })
  }

  // Notify owner (non-blocking — don't fail the booking if SMS fails)
  try {
    const sid = await sendOwnerNotification({
      short_ref:    shortRef,
      client_name:  name,
      service_name: service.name,
      start_time:   startDate.toISOString(),
    })
    if (sid) await setBookingMessageId(result.id, sid)
  } catch (e) {
    console.error('Failed to send owner SMS:', e)
  }

  return NextResponse.json({ bookingId: result.id, shortRef }, { status: 201 })
}
