import { addMinutes, format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import type { TimeSlot } from '@/types'

export function generateSlots(
  date: Date,
  durationMinutes: number,
  startTime: string,
  endTime: string,
  existingBookings: { start_time: string; end_time: string }[],
  timezone = 'UTC'
): TimeSlot[] {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  // `date` is midnight UTC representing the requested local date.
  // Get local date components in business timezone.
  const zonedDate = toZonedTime(date, timezone)
  const y = zonedDate.getFullYear()
  const m = zonedDate.getMonth()
  const d = zonedDate.getDate()

  // Build UTC timestamps for business-hours start/end in the business timezone.
  const dayStart = fromZonedTime(new Date(y, m, d, startH, startM, 0), timezone)
  const dayEnd   = fromZonedTime(new Date(y, m, d, endH,   endM,   0), timezone)

  const slots: TimeSlot[] = []
  let current = dayStart

  while (true) {
    const slotEnd = addMinutes(current, durationMinutes)
    if (slotEnd > dayEnd) break

    const overlaps = existingBookings.some(b => {
      const bStart = new Date(b.start_time)
      const bEnd   = new Date(b.end_time)
      return current < bEnd && slotEnd > bStart
    })

    if (!overlaps) {
      // Label in business timezone
      const label = format(toZonedTime(current, timezone), 'h:mm a')
      slots.push({
        start: current.toISOString(),
        end:   slotEnd.toISOString(),
        label,
      })
    }

    current = addMinutes(current, durationMinutes)
  }

  return slots
}
