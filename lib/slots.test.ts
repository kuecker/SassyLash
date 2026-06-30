import { describe, it, expect } from 'vitest'
import { generateSlots } from './slots'

const monday = new Date('2026-07-06T00:00:00.000Z') // A Monday in UTC

describe('generateSlots', () => {
  it('generates all slots when no bookings exist', () => {
    const slots = generateSlots(monday, 60, '09:00', '17:00', [])
    // 9am to 5pm in 1hr increments = 8 slots
    expect(slots).toHaveLength(8)
    expect(slots[0].label).toBe('9:00 AM')
    expect(slots[7].label).toBe('4:00 PM')
  })

  it('excludes slot when booking overlaps', () => {
    const bookings = [{
      start_time: new Date('2026-07-06T14:00:00.000Z').toISOString(),
      end_time:   new Date('2026-07-06T15:00:00.000Z').toISOString(),
    }]
    const slots = generateSlots(monday, 60, '09:00', '17:00', bookings)
    expect(slots).toHaveLength(7)
    expect(slots.find(s => s.label === '2:00 PM')).toBeUndefined()
  })

  it('generates 4 slots for a 2hr service 9am-5pm', () => {
    const slots = generateSlots(monday, 120, '09:00', '17:00', [])
    // 9am, 11am, 1pm, 3pm = 4 slots
    expect(slots).toHaveLength(4)
    expect(slots[0].label).toBe('9:00 AM')
    expect(slots[3].label).toBe('3:00 PM')
  })

  it('generates 16 slots for a 30min service 9am-5pm', () => {
    const slots = generateSlots(monday, 30, '09:00', '17:00', [])
    expect(slots).toHaveLength(16)
  })

  it('returns empty array when all slots booked', () => {
    const bookings = [{
      start_time: new Date('2026-07-06T09:00:00.000Z').toISOString(),
      end_time:   new Date('2026-07-06T17:00:00.000Z').toISOString(),
    }]
    const slots = generateSlots(monday, 60, '09:00', '17:00', bookings)
    expect(slots).toHaveLength(0)
  })
})
