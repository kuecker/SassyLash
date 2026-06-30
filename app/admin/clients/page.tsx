import { createServiceRoleClient } from '@/lib/supabase/server'
import { ClientTable } from '@/components/admin/ClientTable'

export default async function ClientsPage() {
  const db = createServiceRoleClient()

  const { data: clients } = await db
    .from('clients')
    .select('*, bookings(id, start_time, status)')
    .order('created_at', { ascending: false })

  const clientsWithStats = (clients ?? []).map((c: {
    id: string
    name: string
    phone: string
    email: string
    created_at: string
    bookings: { id: string; start_time: string; status: string }[]
  }) => ({
    id:               c.id,
    name:             c.name,
    phone:            c.phone,
    email:            c.email,
    created_at:       c.created_at,
    booking_count:    c.bookings.length,
    last_appointment: c.bookings
      .filter(b => b.status === 'confirmed')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0]
      ?.start_time ?? null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Clients</h1>
        <span className="text-stone-400 text-sm">{clientsWithStats.length} total</span>
      </div>
      <ClientTable clients={clientsWithStats} />
    </div>
  )
}
