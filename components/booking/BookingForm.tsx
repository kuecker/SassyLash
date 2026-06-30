'use client'

import { useState } from 'react'
import type { ServiceRow, TimeSlot } from '@/types'
import { format } from 'date-fns'

interface Props {
  service: ServiceRow
  slot: TimeSlot
  onSuccess: () => void
  onError: (msg: string) => void
}

export function BookingForm({ service, slot, onSuccess, onError }: Props) {
  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, start: slot.start, name, phone, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        onError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        onSuccess()
      }
    } catch {
      onError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-rose-800">{service.name}</p>
        <p className="text-rose-600">{format(new Date(slot.start), "EEEE, MMMM d 'at' h:mm a")}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        {loading ? 'Requesting...' : 'Request Appointment'}
      </button>
    </form>
  )
}
