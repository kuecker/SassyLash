'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ServiceRow, TimeSlot } from '@/types'
import { format } from 'date-fns'

interface Props {
  service: ServiceRow
  slot: TimeSlot
  date: Date
  onSuccess: () => void
  onError: (msg: string) => void
}

export function BookingForm({ service, slot, date, onSuccess, onError }: Props) {
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setLocalError(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, start: slot.start, name, phone, email }),
      })

      const data = await res.json()

      if (res.status !== 201) {
        const msg = data.error ?? 'Something went wrong. Please try again.'
        setLocalError(msg)
        onError(msg)
      } else {
        onSuccess()
      }
    } catch {
      const msg = 'Network error. Please try again.'
      setLocalError(msg)
      onError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blushed-petal border border-petal-border rounded-lg p-4 text-sm">
        <p className="font-display font-medium text-deep-walnut">{service.name}</p>
        <p className="font-body text-driftwood mt-0.5">
          {format(date, "EEEE, MMMM d")} at {slot.label}
        </p>
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-deep-walnut mb-1">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full font-body border border-chalk rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-petal-border bg-warm-white text-deep-walnut placeholder:text-fog"
        />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-deep-walnut mb-1">Phone Number</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full font-body border border-chalk rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-petal-border bg-warm-white text-deep-walnut placeholder:text-fog"
        />
        <p className="mt-1.5 font-body text-xs text-driftwood leading-relaxed">
          By providing your phone number, you agree to receive transactional text messages about your appointment.
          Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. See our{' '}
          <Link href="/legal" className="text-warm-garnet hover:text-warm-garnet-deep underline underline-offset-2">
            Privacy Policy &amp; SMS Terms
          </Link>
          .
        </p>
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-deep-walnut mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full font-body border border-chalk rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-petal-border bg-warm-white text-deep-walnut placeholder:text-fog"
        />
      </div>

      {localError && (
        <div className="bg-error-surface border border-petal-border text-error-text px-4 py-3 rounded-lg text-sm font-body">
          {localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-warm-garnet hover:bg-warm-garnet-deep disabled:opacity-50 text-white font-display font-semibold py-3 px-6 rounded-xl transition-colors duration-150"
      >
        {loading ? 'Requesting...' : 'Request Appointment'}
      </button>
    </form>
  )
}
