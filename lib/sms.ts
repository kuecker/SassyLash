import {
  PinpointSMSVoiceV2Client,
  SendTextMessageCommand,
} from '@aws-sdk/client-pinpoint-sms-voice-v2'
import { format } from 'date-fns'

// Outbound SMS via AWS End User Messaging (Pinpoint SMS v2). Drop-in replacement
// for the old Twilio module — same five message shapes and copy. OriginationIdentity
// is the registered phone number / pool id (SMS_ORIGINATION_IDENTITY).
const sms = new PinpointSMSVoiceV2Client({})

const ORIGIN      = process.env.SMS_ORIGINATION_IDENTITY!
const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER!
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL!

// Strip control characters and newlines to prevent SMS content injection
function sanitize(value: string, maxLength = 60): string {
  return value.replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, maxLength)
}

async function send(to: string, body: string): Promise<string> {
  const out = await sms.send(new SendTextMessageCommand({
    DestinationPhoneNumber: to,
    OriginationIdentity: ORIGIN,
    MessageBody: body,
    MessageType: 'TRANSACTIONAL',
  }))
  return out.MessageId ?? ''
}

export async function sendOwnerNotification(booking: {
  short_ref:    string
  client_name:  string
  service_name: string
  start_time:   string
}): Promise<string> {
  const dateStr = format(new Date(booking.start_time), "EEE MMM d '@' h:mm a")
  const name    = sanitize(booking.client_name)
  const service = sanitize(booking.service_name)
  return send(
    OWNER_PHONE,
    `New booking request: ${name}, ${service}, ${dateStr}. Reply YES ${booking.short_ref} to confirm or NO ${booking.short_ref} to deny.`
  )
}

export async function sendClientConfirmation(booking: {
  client_phone: string
  client_name:  string
  service_name: string
  start_time:   string
}): Promise<void> {
  const dateStr = format(new Date(booking.start_time), "EEEE, MMMM d 'at' h:mm a")
  const name    = sanitize(booking.client_name)
  const service = sanitize(booking.service_name)
  await send(
    booking.client_phone,
    `Hi ${name}! Your ${service} appointment at Sassy Lash & Skin is confirmed for ${dateStr}. See you then!`
  )
}

export async function sendClientDenial(booking: {
  client_phone: string
  client_name:  string
  service_name: string
  start_time:   string
}): Promise<void> {
  const dateStr = format(new Date(booking.start_time), 'MMMM d')
  const name    = sanitize(booking.client_name)
  const service = sanitize(booking.service_name)
  await send(
    booking.client_phone,
    `Hi ${name}, unfortunately we couldn't accommodate your ${service} on ${dateStr}. Please visit ${APP_URL} to find another time.`
  )
}

export async function sendClientExpiry(booking: {
  client_phone: string
  client_name:  string
  service_name: string
}): Promise<void> {
  const name    = sanitize(booking.client_name)
  const service = sanitize(booking.service_name)
  await send(
    booking.client_phone,
    `Hi ${name}, your ${service} booking request expired before it could be confirmed. Please visit ${APP_URL} to rebook.`
  )
}

export async function sendOwnerInvalidReply(): Promise<void> {
  await send(
    OWNER_PHONE,
    `Reply YES [REF] or NO [REF] to act on a booking. Example: "YES A3X9K2". No matching pending booking found.`
  )
}
