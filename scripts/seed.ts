/**
 * Seeds the DynamoDB table with services + availability (ports 002_seed.sql).
 * Idempotent: fixed ids, overwrites on re-run.
 *
 *   SASSY_TABLE=<name> npm run seed
 *   # local DynamoDB: DYNAMO_ENDPOINT=http://localhost:8000 SASSY_TABLE=sassy npm run seed
 */
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE } from '../lib/db/client'
import { K } from '../lib/db/keys'

// Fixed ids so re-seeding is idempotent and booking links stay stable.
const SERVICES = [
  { id: 'svc-full-set', name: 'Full Set', duration_minutes: 120, description: 'Complete new set of eyelash extensions. Perfect for first-time clients.', active: true },
  { id: 'svc-regular',  name: 'Regular',  duration_minutes: 60,  description: 'Lash fill for existing extensions. Recommended every 2–3 weeks.', active: true },
  { id: 'svc-mini',     name: 'Mini',     duration_minutes: 30,  description: 'Quick fill for minor touch-ups. Best for 1–2 weeks after a regular fill.', active: true },
]

// Mon–Fri (1–5) active 9–5, Sat/Sun inactive.
const AVAILABILITY = Array.from({ length: 7 }, (_, dow) => ({
  id: `avail-${dow}`,
  day_of_week: dow,
  start_time: '09:00',
  end_time: '17:00',
  is_active: dow >= 1 && dow <= 5,
}))

async function main() {
  const items = [
    ...SERVICES.map((s) => ({
      PutRequest: { Item: { PK: K.servicesPk(), SK: K.serviceSk(s.id), ...s } },
    })),
    ...AVAILABILITY.map((a) => ({
      PutRequest: { Item: { PK: K.availPk(), SK: K.availSk(a.day_of_week), ...a } },
    })),
  ]

  // BatchWrite caps at 25 items/request; 10 here fits in one.
  await ddb.send(new BatchWriteCommand({ RequestItems: { [TABLE]: items } }))
  console.log(`Seeded ${SERVICES.length} services + ${AVAILABILITY.length} availability rows into ${TABLE}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
