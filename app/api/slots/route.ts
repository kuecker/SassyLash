import { NextRequest, NextResponse } from 'next/server'
import { fromZonedTime } from 'date-fns-tz'
import { generateSlots } from '@/lib/slots'
import { getAvailability } from '@/lib/db/availability'
import { getService } from '@/lib/db/services'
import { activeBookingsForDate } from '@/lib/db/bookings'

const TZ = process.env.BUSINESS_TIMEZONE ?? 'America/Denver'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date      = searchParams.get('date')       // "2026-07-06"
  const serviceId = searchParams.get('serviceId')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'Missing date or serviceId' }, { status: 400 })
  }

  // Interpret the date string as midnight in the business timezone.
  const requestedDate = fromZonedTime(new Date(date + 'T00:00:00'), TZ)
  const dayOfWeek = requestedDate.getUTCDay()

  const [avail, service, bookings] = await Promise.all([
    getAvailability(dayOfWeek),
    getService(serviceId),
    activeBookingsForDate(date),
  ])

  if (!avail || !avail.is_active || !service || !service.active) {
    return NextResponse.json({ slots: [] })
  }

  const slots = generateSlots(
    requestedDate,
    service.duration_minutes,
    avail.start_time,
    avail.end_time,
    bookings,
    TZ
  )

  return NextResponse.json({ slots })
}
