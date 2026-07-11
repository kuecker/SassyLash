import { describe, it, expect } from 'vitest'
import { baseSlots, slotLockKey, BASE_UNIT_MIN } from './booking-slots'

describe('baseSlots', () => {
  it('a 30-min service occupies exactly one base slot', () => {
    const slots = baseSlots('2026-07-13T15:00:00.000Z', 30, 'UTC')
    expect(slots).toEqual([{ date: '2026-07-13', hhmm: '15:00' }])
  })

  it('a 60-min service occupies two consecutive base slots', () => {
    const slots = baseSlots('2026-07-13T15:00:00.000Z', 60, 'UTC')
    expect(slots.map((s) => s.hhmm)).toEqual(['15:00', '15:30'])
  })

  it('a 120-min service occupies four consecutive base slots', () => {
    const slots = baseSlots('2026-07-13T09:00:00.000Z', 120, 'UTC')
    expect(slots.map((s) => s.hhmm)).toEqual(['09:00', '09:30', '10:00', '10:30'])
  })

  it('renders date + time in the business timezone, not UTC', () => {
    // 02:30Z is 20:30 the previous day in America/Denver (UTC-6, DST)
    const slots = baseSlots('2026-07-13T02:30:00.000Z', 30, 'America/Denver')
    expect(slots[0]).toEqual({ date: '2026-07-12', hhmm: '20:30' })
  })

  it('rejects a duration that is not a multiple of the base unit', () => {
    expect(() => baseSlots('2026-07-13T15:00:00.000Z', 45, 'UTC')).toThrow('invalid_duration')
  })

  it('rejects a zero or negative duration', () => {
    expect(() => baseSlots('2026-07-13T15:00:00.000Z', 0, 'UTC')).toThrow('invalid_duration')
  })

  it('slotLockKey is stable and matches the SLOTLOCK partition format', () => {
    expect(slotLockKey({ date: '2026-07-13', hhmm: '09:30' })).toBe('SLOTLOCK#2026-07-13#09:30')
  })

  it('BASE_UNIT_MIN divides every supported service duration', () => {
    for (const d of [30, 60, 120]) expect(d % BASE_UNIT_MIN).toBe(0)
  })
})
