// Single-table key builders. Every item lives in one table (see sst.config.ts).
// PK/SK are the primary keys; GSI1-4 back the app's access patterns.

export const K = {
  // Static catalogue partitions (small, queried whole)
  servicesPk: () => 'SERVICES',
  serviceSk: (id: string) => `SVC#${id}`,

  availPk: () => 'AVAIL',
  availSk: (dow: number) => `DOW#${dow}`,

  // Client keyed by its natural unique id: phone
  clientPk: (phone: string) => `CLIENT#${phone}`,

  // Booking keyed by uuid
  bookingPk: (id: string) => `BOOKING#${id}`,

  // Locks (guarded by attribute_not_exists in the create transaction)
  slotLockPk: (date: string, hhmm: string) => `SLOTLOCK#${date}#${hhmm}`,
  pendingLockPk: (phone: string) => `PENDINGLOCK#${phone}`,

  // GSI partitions
  refPk: (shortRef: string) => `REF#${shortRef}`,
  datePk: (localDate: string) => `DATE#${localDate}`,
  statusPk: (status: string) => `STATUS#${status}`,
  clientGsiPk: (phone: string) => `CLIENT#${phone}`,
} as const

export const GSI = {
  ref: 'GSI1',
  byDate: 'GSI2',
  byStatus: 'GSI3',
  byClient: 'GSI4',
} as const
