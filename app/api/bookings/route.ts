import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateBookingRef } from '@/lib/booking-ref'
import { sendOwnerNotification } from '@/lib/twilio'
import { addMinutes } from 'date-fns'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { serviceId, start, name, phone, email } = body

  if (!serviceId || !start || !name || !phone || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('id', serviceId)
    .eq('active', true)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const startTime = new Date(start)
  const endTime   = addMinutes(startTime, service.duration_minutes)

  // Upsert client — look up by phone, create if not found
  let clientId: string
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('phone', phone)
    .single()

  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({ name, phone, email })
      .select('id')
      .single()

    if (clientError || !newClient) {
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
    clientId = newClient.id
  }

  // Atomic booking creation via RPC (prevents double-booking)
  const shortRef = generateBookingRef()
  const { data: bookingId, error: rpcError } = await supabase.rpc('create_booking', {
    p_client_id:  clientId,
    p_service_id: serviceId,
    p_start_time: startTime.toISOString(),
    p_end_time:   endTime.toISOString(),
    p_short_ref:  shortRef,
  })

  if (rpcError) {
    if (rpcError.message.includes('slot_unavailable')) {
      return NextResponse.json({ error: 'This slot is no longer available.' }, { status: 409 })
    }
    if (rpcError.message.includes('slot_in_past')) {
      return NextResponse.json({ error: 'Cannot book a slot in the past.' }, { status: 400 })
    }
    if (rpcError.message.includes('client_has_pending')) {
      return NextResponse.json({ error: 'You already have a pending booking request.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Send SMS to owner (non-blocking — don't fail booking if SMS fails)
  try {
    await sendOwnerNotification({
      short_ref:    shortRef,
      client_name:  name,
      service_name: service.name,
      start_time:   startTime.toISOString(),
    })
  } catch (e) {
    console.error('Failed to send owner SMS:', e)
  }

  return NextResponse.json({ bookingId, shortRef }, { status: 201 })
}
