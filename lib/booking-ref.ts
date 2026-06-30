const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateBookingRef(): string {
  let ref = ''
  for (let i = 0; i < 6; i++) {
    ref += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return ref
}
