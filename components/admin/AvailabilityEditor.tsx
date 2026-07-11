'use client'

import { useState } from 'react'
import type { AvailabilityRow } from '@/types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Props {
  initialAvailability: AvailabilityRow[]
}

export function AvailabilityEditor({ initialAvailability }: Props) {
  const [rows,   setRows]   = useState(initialAvailability)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved,  setSaved]  = useState<string | null>(null)

  async function update(id: string, day_of_week: number, patch: Partial<AvailabilityRow>) {
    setSaving(id)
    setSaved(null)
    await fetch('/api/admin/availability', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_of_week, ...patch }),
    })
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
    setSaving(null)
    setSaved(id)
    setTimeout(() => setSaved(null), 1500)
  }

  return (
    <div className="space-y-3">
      {[...rows]
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map(row => (
          <div key={row.id} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => update(row.id, row.day_of_week, { is_active: !row.is_active })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    row.is_active ? 'bg-rose-500' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      row.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`font-medium ${row.is_active ? 'text-stone-800' : 'text-stone-400'}`}>
                  {DAY_NAMES[row.day_of_week]}
                </span>
              </div>

              {row.is_active && (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={row.start_time.slice(0, 5)}
                    onChange={e => update(row.id, row.day_of_week, { start_time: e.target.value })}
                    className="border border-stone-300 rounded-lg px-2 py-1"
                  />
                  <span className="text-stone-400">to</span>
                  <input
                    type="time"
                    value={row.end_time.slice(0, 5)}
                    onChange={e => update(row.id, row.day_of_week, { end_time: e.target.value })}
                    className="border border-stone-300 rounded-lg px-2 py-1"
                  />
                  {saving === row.id && <span className="text-xs text-stone-400">Saving...</span>}
                  {saved  === row.id && <span className="text-xs text-green-600">Saved</span>}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  )
}
