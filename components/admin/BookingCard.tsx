'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { BookingWithRelations } from '@/types'

interface Props {
  booking: BookingWithRelations
  onAction?: () => void
}

export function BookingCard({ booking, onAction }: Props) {
  const [loading,  setLoading]  = useState<'confirm' | 'deny' | null>(null)
  const [actError, setActError] = useState<string | null>(null)

  async function act(action: 'confirm' | 'deny') {
    setLoading(action)
    setActError(null)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/${action}`, { method: 'POST' })
      if (res.ok) {
        onAction?.()
      } else {
        setActError('Action failed. Please try again.')
        setLoading(null)
      }
    } catch {
      setActError('Network error. Please try again.')
      setLoading(null)
    }
  }

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    denied:    'bg-red-100 text-red-700',
    expired:   'bg-stone-100 text-stone-500',
    cancelled: 'bg-stone-100 text-stone-500',
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{booking.clients.name}</p>
          <p className="text-stone-500 text-sm">{booking.services.name}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[booking.status] ?? ''}`}>
          {booking.status}
        </span>
      </div>

      <div className="text-sm text-stone-600">
        <p>{format(new Date(booking.start_time), "EEEE, MMMM d 'at' h:mm a")}</p>
        <p>{booking.clients.phone}</p>
      </div>

      {booking.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => act('confirm')}
            disabled={loading !== null}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {loading === 'confirm' ? 'Confirming...' : 'Confirm'}
          </button>
          <button
            onClick={() => act('deny')}
            disabled={loading !== null}
            className="flex-1 bg-red-100 hover:bg-red-200 disabled:bg-red-50 text-red-700 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {loading === 'deny' ? 'Denying...' : 'Deny'}
          </button>
        </div>
      )}
      {actError && <p className="text-red-600 text-xs mt-1">{actError}</p>}
    </div>
  )
}
