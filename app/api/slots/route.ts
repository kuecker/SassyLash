import { NextRequest, NextResponse } from 'next/server'
import { fromZonedTime } from 'date-fns-tz'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateSlots } from '@/lib/slots'

const TZ = process.env.BUSINESS_TIMEZONE ?? 'America/Denver'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date      = searchParams.get('date')       // "2026-07-06"
  const serviceId = searchParams.get('serviceId')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'Missing date or serviceId' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Interpret the date string as midnight in the business timezone.
  // On a UTC server, new Date('2026-07-06T00:00:00') has local fields = midnight,
  // so fromZonedTime converts those local fields "as if in TZ" → UTC equivalent.
  const requestedDate = fromZonedTime(new Date(date + 'T00:00:00'), TZ)
  const dayOfWeek = requestedDate.getUTCDay()

  // Query bookings for the full local day in business timezone (midnight → midnight+1)
  const nextDayDate = fromZonedTime(new Date(date + 'T00:00:00'), TZ)
  nextDayDate.setUTCDate(nextDayDate.getUTCDate() + 1)

  const [{ data: avail }, { data: service }, { data: bookings }] = await Promise.all([
    supabase
      .from('availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single(),
    supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .eq('active', true)
      .single(),
    supabase
      .from('bookings')
      .select('start_time, end_time')
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', requestedDate.toISOString())
      .lt('start_time',  nextDayDate.toISOString()),
  ])

  if (!avail || !service) {
    return NextResponse.json({ slots: [] })
  }

  const slots = generateSlots(
    requestedDate,
    service.duration_minutes,
    avail.start_time,
    avail.end_time,
    bookings ?? [],
    TZ
  )

  return NextResponse.json({ slots })
}
