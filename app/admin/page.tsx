'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('bookings')
      .select('*, clients(*), services(*)')
      .order('start_time', { ascending: tab !== 'past' })

    if (tab === 'pending') {
      query = query.eq('status', 'pending')
    } else if (tab === 'upcoming') {
      query = query.eq('status', 'confirmed').gte('start_time', now)
    } else {
      // Past tab: denied/expired/cancelled at any time, plus confirmed past appointments
      query = supabase
        .from('bookings')
        .select('*, clients(*), services(*)')
        .or(`status.in.(denied,expired,cancelled),and(status.eq.confirmed,start_time.lt.${now})`)
        .order('start_time', { ascending: false })
    }

    const { data, error: queryError } = await query
    if (queryError) {
      setLoadError('Failed to load appointments. Please refresh.')
      setLoading(false)
      return
    }
    setLoadError(null)
    setBookings((data as BookingWithRelations[]) ?? [])
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
