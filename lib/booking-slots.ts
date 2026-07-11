import { formatInTimeZone } from 'date-fns-tz'

// Bookings are decomposed onto a fixed 30-minute base grid (the GCD of the
// service durations 30/60/120). A booking occupies `duration/30` consecutive
// base slots; each becomes a SLOTLOCK item guarded by attribute_not_exists,
// which is how DynamoDB reproduces the old Postgres overlap check atomically.
export const BASE_UNIT_MIN = 30

export type BaseSlot = { date: string; hhmm: string } // local date + HH:mm in business tz

export function baseSlots(startISO: string, durationMinutes: number, timezone: string): BaseSlot[] {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0 || durationMinutes % BASE_UNIT_MIN !== 0) {
    throw new Error('invalid_duration')
  }
  const count = durationMinutes / BASE_UNIT_MIN
  const start = new Date(startISO)
  if (Number.isNaN(start.getTime())) throw new Error('invalid_start')

  const out: BaseSlot[] = []
  for (let i = 0; i < count; i++) {
    const t = new Date(start.getTime() + i * BASE_UNIT_MIN * 60_000)
    out.push({
      date: formatInTimeZone(t, timezone, 'yyyy-MM-dd'),
      hhmm: formatInTimeZone(t, timezone, 'HH:mm'),
    })
  }
  return out
}

// Stable lock partition key for a base slot (mirrors K.slotLockPk).
export function slotLockKey(slot: BaseSlot): string {
  return `SLOTLOCK#${slot.date}#${slot.hhmm}`
}
