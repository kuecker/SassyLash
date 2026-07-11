import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE } from './client'
import { K } from './keys'
import type { ServiceRow } from '@/types'

export async function listServices(): Promise<ServiceRow[]> {
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': K.servicesPk() },
  }))
  return (out.Items ?? []) as ServiceRow[]
}

export async function getService(id: string): Promise<ServiceRow | null> {
  const out = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: K.servicesPk(), SK: K.serviceSk(id) },
  }))
  return (out.Item as ServiceRow) ?? null
}
