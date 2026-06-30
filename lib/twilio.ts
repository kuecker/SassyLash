import twilio from 'twilio'
import { format } from 'date-fns'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER!
const FROM_PHONE  = process.env.TWILIO_PHONE_NUMBER!
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL!

export async function sendOwnerNotification(booking: {
  short_ref:    string
  client_name:  string
  service_name: string
  start_time:   string
}): Promise<string> {
  const dateStr = format(new Date(booking.start_time), "EEE MMM d '@' h:mm a")
  const msg = await client.messages.create({
    to:   OWNER_PHONE,
    from: FROM_PHONE,
    body: `New booking request: ${booking.client_name}, ${booking.service_name}, ${dateStr}. Reply YES ${booking.short_ref} to confirm or NO ${booking.short_ref} to deny.`,
  })
  return msg.sid
}

export async function sendClientConfirmation(booking: {
  client_phone: string
  client_name:  string
  service_name: string
  start_time:   string
}): Promise<void> {
  const dateStr = format(new Date(booking.start_time), "EEEE, MMMM d 'at' h:mm a")
  await client.messages.create({
    to:   booking.client_phone,
    from: FROM_PHONE,
    body: `Hi ${booking.client_name}! Your ${booking.service_name} appointment at Sassy Lash & Skin is confirmed for ${dateStr}. See you then!`,
  })
}

export async function sendClientDenial(booking: {
  client_phone: string
  client_name:  string
  service_name: string
  start_time:   string
}): Promise<void> {
  const dateStr = format(new Date(booking.start_time), 'MMMM d')
  await client.messages.create({
    to:   booking.client_phone,
    from: FROM_PHONE,
    body: `Hi ${booking.client_name}, unfortunately we couldn't accommodate your ${booking.service_name} on ${dateStr}. Please visit ${APP_URL} to find another time.`,
  })
}

export async function sendClientExpiry(booking: {
  client_phone: string
  client_name:  string
  service_name: string
}): Promise<void> {
  await client.messages.create({
    to:   booking.client_phone,
    from: FROM_PHONE,
    body: `Hi ${booking.client_name}, your ${booking.service_name} booking request expired before it could be confirmed. Please visit ${APP_URL} to rebook.`,
  })
}

export async function sendOwnerInvalidReply(): Promise<void> {
  await client.messages.create({
    to:   OWNER_PHONE,
    from: FROM_PHONE,
    body: `Reply YES [REF] or NO [REF] to act on a booking. Example: "YES A3X9K2". No matching pending booking found.`,
  })
}
