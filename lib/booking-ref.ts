import { randomInt } from 'crypto'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateBookingRef(): string {
  let ref = ''
  for (let i = 0; i < 6; i++) {
    ref += CHARS[randomInt(0, CHARS.length)]
  }
  return ref
}
