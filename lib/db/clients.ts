import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { ddb, TABLE } from './client'
import { K, GSI } from './keys'
import type { ClientRow } from '@/types'

// Client id == phone (natural unique key). Client items also carry
// GSI4PK='CLIENTS' so the admin list is a single query (bookings use
// GSI4PK='CLIENT#<phone>' on the same index — see bookings.ts).
export async function getClientByPhone(phone: string): Promise<ClientRow | null> {
  const out = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: K.clientPk(phone), SK: K.clientPk(phone) },
  }))
  return (out.Item as ClientRow) ?? null
}

export async function upsertClient(input: {
  name: string
  phone: string
  email: string
}): Promise<ClientRow> {
  const existing = await getClientByPhone(input.phone)
  if (existing) return existing

  const row: ClientRow = {
    id: input.phone,
    name: input.name,
    phone: input.phone,
    email: input.email,
    created_at: new Date().toISOString(),
  }
  try {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: K.clientPk(input.phone),
        SK: K.clientPk(input.phone),
        GSI4PK: 'CLIENTS',
        GSI4SK: input.phone,
        ...row,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
    return row
  } catch (e) {
    // Lost a race with a concurrent insert — return the winner.
    if (e instanceof ConditionalCheckFailedException) {
      const w = await getClientByPhone(input.phone)
      if (w) return w
    }
    throw e
  }
}

export async function listClients(): Promise<ClientRow[]> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: GSI.byClient,
    KeyConditionExpression: 'GSI4PK = :pk',
    ExpressionAttributeValues: { ':pk': 'CLIENTS' },
  }))
  return (out.Items ?? []) as ClientRow[]
}
