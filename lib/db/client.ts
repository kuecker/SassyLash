import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Table name is injected by SST (see sst.config.ts `environment`) or set locally
// for the seed script / tests against DynamoDB Local.
export const TABLE = process.env.SASSY_TABLE ?? 'sassy'

const base = new DynamoDBClient(
  // DYNAMO_ENDPOINT lets scripts/tests target DynamoDB Local; unset in AWS.
  process.env.DYNAMO_ENDPOINT ? { endpoint: process.env.DYNAMO_ENDPOINT } : {}
)

export const ddb = DynamoDBDocumentClient.from(base, {
  marshallOptions: { removeUndefinedValues: true },
})
