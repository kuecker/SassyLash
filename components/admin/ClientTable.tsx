'use client'

import { useState } from 'react'
import { format } from 'date-fns'

interface ClientWithStats {
  id: string
  name: string
  phone: string
  email: string
  created_at: string
  booking_count: number
  last_appointment: string | null
}

interface Props {
  clients: ClientWithStats[]
}

export function ClientTable({ clients }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (clients.length === 0) {
    return <p className="text-stone-400 text-sm">No clients yet.</p>
  }

  return (
    <div className="space-y-2">
      {clients.map(c => (
        <div key={c.id} className="bg-white border border-stone-200 rounded-xl">
          <button
            className="w-full text-left p-4 flex items-center justify-between"
            onClick={() => setSelected(selected === c.id ? null : c.id)}
          >
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-stone-500 text-sm">{c.phone} · {c.email}</p>
            </div>
            <div className="text-right text-sm text-stone-400">
              <p>{c.booking_count} appt{c.booking_count !== 1 ? 's' : ''}</p>
              {c.last_appointment && (
                <p>Last: {format(new Date(c.last_appointment), 'MMM d, yyyy')}</p>
              )}
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}
