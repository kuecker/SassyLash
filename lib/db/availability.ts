import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE } from './client'
import { K } from './keys'
import type { AvailabilityRow } from '@/types'

export async function getAvailability(dayOfWeek: number): Promise<AvailabilityRow | null> {
  const out = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: K.availPk(), SK: K.availSk(dayOfWeek) },
  }))
  return (out.Item as AvailabilityRow) ?? null
}

export async function listAvailability(): Promise<AvailabilityRow[]> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': K.availPk() },
  }))
  return (out.Items ?? []) as AvailabilityRow[]
}

export async function updateAvailability(
  dayOfWeek: number,
  patch: { start_time?: string; end_time?: string; is_active?: boolean }
): Promise<void> {
  const sets: string[] = []
  const names: Record<string, string> = {}
  const values: Record<string, string | boolean> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue
    sets.push(`#${k} = :${k}`)
    names[`#${k}`] = k
    values[`:${k}`] = v
  }
  if (sets.length === 0) return
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { PK: K.availPk(), SK: K.availSk(dayOfWeek) },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }))
}
