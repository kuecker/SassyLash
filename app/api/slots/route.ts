import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateSlots } from '@/lib/slots'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date      = searchParams.get('date')       // "2026-07-06"
  const serviceId = searchParams.get('serviceId')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'Missing date or serviceId' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Parse as UTC to avoid local-timezone day-of-week shifting
  const requestedDate = new Date(date + 'T00:00:00.000Z')
  const dayOfWeek = requestedDate.getUTCDay()

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
      .gte('start_time', date + 'T00:00:00.000Z')
      .lt('start_time', new Date(new Date(date + 'T00:00:00.000Z').getTime() + 86400000).toISOString()),
  ])

  if (!avail || !service) {
    return NextResponse.json({ slots: [] })
  }

  const slots = generateSlots(
    requestedDate,
    service.duration_minutes,
    avail.start_time,
    avail.end_time,
    bookings ?? []
  )

  return NextResponse.json({ slots })
}
