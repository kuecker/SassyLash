import { listClients } from '@/lib/db/clients'
import { listBookingsForClient } from '@/lib/db/bookings'
import { ClientTable } from '@/components/admin/ClientTable'

export default async function ClientsPage() {
  const clients = (await listClients())
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const clientsWithStats = await Promise.all(clients.map(async (c) => {
    const bookings = await listBookingsForClient(c.phone)
    return {
      id:               c.id,
      name:             c.name,
      phone:            c.phone,
      email:            c.email,
      created_at:       c.created_at,
      booking_count:    bookings.length,
      last_appointment: bookings
        .filter(b => b.status === 'confirmed')
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0]
        ?.start_time ?? null,
    }
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
