import { describe, it, expect } from 'vitest'
import { generateBookingRef } from './booking-ref'

describe('generateBookingRef', () => {
  it('generates a 6-character string', () => {
    expect(generateBookingRef()).toHaveLength(6)
  })

  it('uses only allowed characters (no 0, O, 1, I)', () => {
    for (let i = 0; i < 100; i++) {
      const ref = generateBookingRef()
      expect(ref).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    }
  })

  it('generates unique refs', () => {
    const refs = new Set(Array.from({ length: 1000 }, generateBookingRef))
    expect(refs.size).toBeGreaterThan(990)
  })
})
