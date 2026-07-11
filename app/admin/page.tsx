'use client'

import { useEffect, useState, useCallback } from 'react'
import { BookingCard } from '@/components/admin/BookingCard'
import type { BookingWithRelations } from '@/types'

type Tab = 'pending' | 'upcoming' | 'past'

export default function AdminDashboard() {
  const [tab,       setTab]      = useState<Tab>('pending')
  const [bookings,  setBookings] = useState<BookingWithRelations[]>([])
  const [loading,   setLoading]  = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings?tab=${tab}`)
      if (!res.ok) {
        setLoadError('Failed to load appointments. Please refresh.')
        setLoading(false)
        return
      }
      const { bookings } = await res.json()
      setLoadError(null)
      setBookings((bookings as BookingWithRelations[]) ?? [])
    } catch {
      setLoadError('Failed to load appointments. Please refresh.')
    }
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  const tabs: Tab[] = ['pending', 'upcoming', 'past']

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Appointments</h1>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-stone-400 text-sm">No {tab} appointments.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <BookingCard key={b.id} booking={b} onAction={load} />
          ))}
        </div>
      )}
    </div>
  )
}
