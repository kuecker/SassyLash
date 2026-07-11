import { randomUUID } from 'node:crypto'
import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { ddb, TABLE } from './client'
import { K, GSI } from './keys'
import { baseSlots, slotLockKey } from '@/lib/booking-slots'
import type { BookingStatus, BookingWithRelations } from '@/types'

// DynamoDB booking item. Denormalizes the client + service snapshot onto the
// booking so the admin views need no joins (Supabase did a relational join).
export type BookingItem = {
  id: string
  short_ref: string
  client_phone: string
  client_name: string
  client_email: string
  service_id: string
  service_name: string
  duration_minutes: number
  start_time: string        // ISO
  end_time: string          // ISO
  booking_date: string      // local YYYY-MM-DD (business tz), backs GSI2
  status: BookingStatus
  slot_locks: string[]      // SLOTLOCK PKs this booking holds (for cleanup)
  message_id: string | null // was twilio_message_sid
  notes: string | null
  created_at: string
  updated_at: string
}

const ACTIVE: BookingStatus[] = ['pending', 'confirmed']

function stripKeys<T extends Record<string, unknown>>(item: T): BookingItem {
  const { PK, SK, GSI1PK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, GSI4PK, GSI4SK, ...rest } = item
  return rest as unknown as BookingItem
}

export async function getBooking(id: string): Promise<BookingItem | null> {
  const out = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: K.bookingPk(id), SK: K.bookingPk(id) },
  }))
  return out.Item ? stripKeys(out.Item) : null
}

export async function getBookingByRef(shortRef: string): Promise<BookingItem | null> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: GSI.ref,
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': K.refPk(shortRef) },
    Limit: 1,
  }))
  const item = out.Items?.[0]
  return item ? stripKeys(item) : null
}

// Active (pending|confirmed) bookings on a given local date — feeds slot generation.
export async function activeBookingsForDate(
  localDate: string
): Promise<{ start_time: string; end_time: string }[]> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: GSI.byDate,
    KeyConditionExpression: 'GSI2PK = :pk',
    FilterExpression: '#s IN (:pending, :confirmed)',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':pk': K.datePk(localDate),
      ':pending': 'pending',
      ':confirmed': 'confirmed',
    },
    ProjectionExpression: 'start_time, end_time',
  }))
  return (out.Items ?? []) as { start_time: string; end_time: string }[]
}

export async function listBookingsByStatus(status: BookingStatus): Promise<BookingItem[]> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: GSI.byStatus,
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': K.statusPk(status) },
  }))
  return (out.Items ?? []).map(stripKeys)
}

export async function listBookingsForClient(phone: string): Promise<BookingItem[]> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: GSI.byClient,
    KeyConditionExpression: 'GSI4PK = :pk',
    ExpressionAttributeValues: { ':pk': K.clientGsiPk(phone) },
  }))
  return (out.Items ?? []).map(stripKeys)
}

export { ACTIVE }

// Rehydrate the nested {clients, services} shape the admin UI expects from the
// denormalized booking item (the old Supabase join returned this shape).
export function toBookingWithRelations(b: BookingItem): BookingWithRelations {
  return {
    id: b.id,
    short_ref: b.short_ref,
    client_id: b.client_phone,
    service_id: b.service_id,
    start_time: b.start_time,
    end_time: b.end_time,
    status: b.status,
    twilio_message_sid: b.message_id,
    notes: b.notes,
    created_at: b.created_at,
    updated_at: b.updated_at,
    clients: {
      id: b.client_phone,
      name: b.client_name,
      phone: b.client_phone,
      email: b.client_email,
      created_at: b.created_at,
    },
    services: {
      id: b.service_id,
      name: b.service_name,
      duration_minutes: b.duration_minutes,
      description: null,
      active: true,
    },
  }
}

// ── Writes ────────────────────────────────────────────────────────────────

export type CreateBookingInput = {
  shortRef: string
  client: { phone: string; name: string; email: string }
  serviceId: string
  serviceName: string
  durationMinutes: number
  startTime: string   // ISO
  timezone: string
}

export type CreateBookingResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'slot_unavailable' | 'client_has_pending' }

/**
 * Atomically create a pending booking. Reproduces the old `create_booking`
 * plpgsql guarantees via one TransactWriteItems:
 *   - one SLOTLOCK per 30-min base unit, each `attribute_not_exists` → overlap
 *     with any active booking cancels the transaction (slot_unavailable)
 *   - one PENDINGLOCK per client, `attribute_not_exists` → one-pending-per-client
 *   - the booking item itself
 * All-or-nothing: if any guard fails, nothing is written.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const id = randomUUID()
  const now = new Date().toISOString()
  const start = new Date(input.startTime)
  const end = new Date(start.getTime() + input.durationMinutes * 60_000).toISOString()

  const slots = baseSlots(input.startTime, input.durationMinutes, input.timezone)
  const lockKeys = slots.map(slotLockKey)
  const bookingDate = slots[0].date

  const booking: BookingItem = {
    id,
    short_ref: input.shortRef,
    client_phone: input.client.phone,
    client_name: input.client.name,
    client_email: input.client.email,
    service_id: input.serviceId,
    service_name: input.serviceName,
    duration_minutes: input.durationMinutes,
    start_time: input.startTime,
    end_time: end,
    booking_date: bookingDate,
    status: 'pending',
    slot_locks: lockKeys,
    message_id: null,
    notes: null,
    created_at: now,
    updated_at: now,
  }

  const transactItems = [
    // Slot locks first, so their indexes line up with CancellationReasons[0..n).
    ...slots.map((s) => ({
      Put: {
        TableName: TABLE,
        Item: { PK: slotLockKey(s), SK: slotLockKey(s), booking_id: id },
        ConditionExpression: 'attribute_not_exists(PK)',
      },
    })),
    {
      Put: {
        TableName: TABLE,
        Item: { PK: K.pendingLockPk(input.client.phone), SK: K.pendingLockPk(input.client.phone), booking_id: id },
        ConditionExpression: 'attribute_not_exists(PK)',
      },
    },
    {
      Put: {
        TableName: TABLE,
        Item: {
          PK: K.bookingPk(id),
          SK: K.bookingPk(id),
          GSI1PK: K.refPk(input.shortRef),
          GSI2PK: K.datePk(bookingDate),
          GSI2SK: input.startTime,
          GSI3PK: K.statusPk('pending'),
          GSI3SK: now,
          GSI4PK: K.clientGsiPk(input.client.phone),
          GSI4SK: input.startTime,
          ...booking,
        },
      },
    },
  ]

  try {
    await ddb.send(new TransactWriteCommand({ TransactItems: transactItems }))
    return { ok: true, id }
  } catch (e) {
    if (e instanceof TransactionCanceledException) {
      const reasons = e.CancellationReasons ?? []
      const pendingIdx = slots.length
      if (reasons[pendingIdx]?.Code === 'ConditionalCheckFailed') {
        return { ok: false, reason: 'client_has_pending' }
      }
      // Any of the slot-lock guards (indexes 0..slots.length) failing = overlap.
      return { ok: false, reason: 'slot_unavailable' }
    }
    throw e
  }
}

function statusUpdate(id: string, status: BookingStatus, now: string) {
  return {
    TableName: TABLE,
    Key: { PK: K.bookingPk(id), SK: K.bookingPk(id) },
    UpdateExpression: 'SET #s = :st, GSI3PK = :g3, updated_at = :u',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':st': status,
      ':g3': K.statusPk(status),
      ':u': now,
    },
  }
}

// Confirm: pending → confirmed. Slot locks stay (slot remains taken); the
// client's pending lock is released so they can book again later.
export async function confirmBooking(b: BookingItem): Promise<void> {
  const now = new Date().toISOString()
  await ddb.send(new TransactWriteCommand({
    TransactItems: [
      { Update: statusUpdate(b.id, 'confirmed', now) },
      { Delete: { TableName: TABLE, Key: { PK: K.pendingLockPk(b.client_phone), SK: K.pendingLockPk(b.client_phone) } } },
    ],
  }))
}

// Release: deny / expire / cancel. Frees the slot locks and the pending lock.
export async function releaseBooking(
  b: BookingItem,
  status: 'denied' | 'expired' | 'cancelled'
): Promise<void> {
  const now = new Date().toISOString()
  await ddb.send(new TransactWriteCommand({
    TransactItems: [
      { Update: statusUpdate(b.id, status, now) },
      { Delete: { TableName: TABLE, Key: { PK: K.pendingLockPk(b.client_phone), SK: K.pendingLockPk(b.client_phone) } } },
      ...b.slot_locks.map((pk) => ({
        Delete: { TableName: TABLE, Key: { PK: pk, SK: pk } },
      })),
    ],
  }))
}

// Persist the outbound SMS id after owner notification (best-effort).
export async function setBookingMessageId(id: string, messageId: string): Promise<void> {
  await ddb.send(new TransactWriteCommand({
    TransactItems: [{
      Update: {
        TableName: TABLE,
        Key: { PK: K.bookingPk(id), SK: K.bookingPk(id) },
        UpdateExpression: 'SET message_id = :m',
        ExpressionAttributeValues: { ':m': messageId },
      },
    }],
  }))
}
