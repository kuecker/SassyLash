import { addMinutes, parseISO } from 'date-fns'
import type { TimeSlot } from '@/types'

/**
 * Format a UTC Date as a 12-hour time label (e.g. "9:00 AM", "4:00 PM").
 * Uses UTC hours/minutes directly to avoid local-timezone shifting.
 */
function formatUTCLabel(date: Date): string {
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  const displayMin = minutes.toString().padStart(2, '0')
  return `${displayHour}:${displayMin} ${period}`
}

export function generateSlots(
  date: Date,
  durationMinutes: number,
  startTime: string,
  endTime: string,
  existingBookings: { start_time: string; end_time: string }[]
): TimeSlot[] {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  // Build UTC boundaries from the UTC date components of `date`.
  // Using Date.UTC avoids local-timezone offsets that date-fns set() would apply.
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  const dayStart = new Date(Date.UTC(year, month, day, startH, startM, 0, 0))
  const dayEnd   = new Date(Date.UTC(year, month, day, endH,   endM,   0, 0))

  const slots: TimeSlot[] = []
  let current = dayStart

  while (true) {
    const slotEnd = addMinutes(current, durationMinutes)
    if (slotEnd > dayEnd) break

    const overlaps = existingBookings.some(b => {
      const bStart = parseISO(b.start_time)
      const bEnd   = parseISO(b.end_time)
      return current < bEnd && slotEnd > bStart
    })

    if (!overlaps) {
      slots.push({
        start: current.toISOString(),
        end:   slotEnd.toISOString(),
        label: formatUTCLabel(current),
      })
    }

    current = addMinutes(current, durationMinutes)
  }

  return slots
}
