export type ServiceRow = {
  id: string
  name: string
  duration_minutes: number
  description: string | null
  active: boolean
}

export type ClientRow = {
  id: string
  name: string
  phone: string
  email: string
  created_at: string
}

export type AvailabilityRow = {
  id: string
  day_of_week: number
  start_time: string   // "09:00:00"
  end_time: string     // "17:00:00"
  is_active: boolean
}

export type BookingStatus = 'pending' | 'confirmed' | 'denied' | 'cancelled' | 'expired'

export type BookingRow = {
  id: string
  short_ref: string
  client_id: string
  service_id: string
  start_time: string
  end_time: string
  status: BookingStatus
  twilio_message_sid: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type BookingWithRelations = BookingRow & {
  clients: ClientRow
  services: ServiceRow
}

export type TimeSlot = {
  start: string   // ISO string
  end: string     // ISO string
  label: string   // "9:00 AM"
}
