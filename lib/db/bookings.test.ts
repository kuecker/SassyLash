import { describe, it, expect, beforeEach } from 'vitest'
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { ddb } from './client'
import { createBooking } from './bookings'

const ddbMock = mockClient(ddb as unknown as DynamoDBDocumentClient)

const input = {
  shortRef: 'A3X9K2',
  client: { phone: '+12532228675', name: 'Jane', email: 'jane@example.com' },
  serviceId: 'svc-full-set',
  serviceName: 'Full Set',
  durationMinutes: 120, // → 4 base slots
  startTime: '2026-07-13T15:00:00.000Z',
  timezone: 'UTC',
}

function cancelledWith(codes: (string | undefined)[]) {
  return new TransactionCanceledException({
    message: 'cancelled',
    $metadata: {},
    CancellationReasons: codes.map((Code) => (Code ? { Code } : { Code: 'None' })),
  })
}

describe('createBooking', () => {
  beforeEach(() => ddbMock.reset())

  it('writes one transaction: N slot locks + pending lock + booking item', async () => {
    ddbMock.on(TransactWriteCommand).resolves({})
    const res = await createBooking(input)

    expect(res.ok).toBe(true)
    const call = ddbMock.commandCalls(TransactWriteCommand)[0]
    const items = call.args[0].input.TransactItems!
    // 4 slot locks + 1 pending lock + 1 booking = 6
    expect(items).toHaveLength(6)
    // slot locks are the first four, each guarded by attribute_not_exists
    for (let i = 0; i < 4; i++) {
      expect(items[i].Put!.ConditionExpression).toBe('attribute_not_exists(PK)')
      expect(items[i].Put!.Item!.PK).toMatch(/^SLOTLOCK#/)
    }
    // pending lock is index 4
    expect(items[4].Put!.Item!.PK).toBe('PENDINGLOCK#+12532228675')
    // booking is last, carries all four GSI partitions
    const booking = items[5].Put!.Item!
    expect(booking.PK).toMatch(/^BOOKING#/)
    expect(booking.GSI1PK).toBe('REF#A3X9K2')
    expect(booking.status).toBe('pending')
    expect(booking.slot_locks).toHaveLength(4)
  })

  it('maps a slot-lock conflict to slot_unavailable', async () => {
    // First slot lock (index 0) fails its condition
    ddbMock.on(TransactWriteCommand).rejects(
      cancelledWith(['ConditionalCheckFailed', undefined, undefined, undefined, undefined, undefined])
    )
    const res = await createBooking(input)
    expect(res).toEqual({ ok: false, reason: 'slot_unavailable' })
  })

  it('maps a pending-lock conflict to client_has_pending', async () => {
    // Slot locks pass; pending lock (index 4) fails
    ddbMock.on(TransactWriteCommand).rejects(
      cancelledWith([undefined, undefined, undefined, undefined, 'ConditionalCheckFailed', undefined])
    )
    const res = await createBooking(input)
    expect(res).toEqual({ ok: false, reason: 'client_has_pending' })
  })
})
