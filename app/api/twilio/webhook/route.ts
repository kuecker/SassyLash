import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendClientConfirmation, sendClientDenial, sendOwnerInvalidReply } from '@/lib/twilio'

function twimlResponse(): NextResponse {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

export async function POST(request: NextRequest) {
  // Validate request comes from Twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const signature = request.headers.get('x-twilio-signature') ?? ''
  const url = process.env.NEXT_PUBLIC_APP_URL + '/api/twilio/webhook'

  const formData = await request.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => { params[key] = value.toString() })

  const isValid = twilio.validateRequest(authToken, signature, url, params)
  if (!isValid && process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const body = (params['Body'] ?? '').trim().toUpperCase()
  const words = body.split(/\s+/)
  const action = words[0]  // YES or NO
  const ref    = words[1]  // e.g. A3X9K2 (optional)

  if (action !== 'YES' && action !== 'NO') {
    await sendOwnerInvalidReply()
    return twimlResponse()
  }

  const db = createServiceRoleClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let booking: any = null

  if (ref) {
    const { data } = await db
      .from('bookings')
      .select('*, clients(*), services(*)')
      .eq('short_ref', ref)
      .eq('status', 'pending')
      .single()
    booking = data
  }

  if (!booking) {
    // Fall back to oldest pending booking
    const { data } = await db
      .from('bookings')
      .select('*, clients(*), services(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    booking = data
  }

  if (!booking) {
    await sendOwnerInvalidReply()
    return twimlResponse()
  }

  if (action === 'YES') {
    await db
      .from('bookings')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', booking.id)

    try {
      await sendClientConfirmation({
        client_phone: booking.clients.phone,
        client_name:  booking.clients.name,
        service_name: booking.services.name,
        start_time:   booking.start_time,
      })
    } catch (e) {
      console.error('Failed to send client confirmation SMS:', e)
    }
  } else {
    await db
      .from('bookings')
      .update({ status: 'denied', updated_at: new Date().toISOString() })
      .eq('id', booking.id)

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
  }

  return twimlResponse()
}
