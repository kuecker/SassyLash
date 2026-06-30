'use client'

import type { TimeSlot } from '@/types'

interface Props {
  slots: TimeSlot[]
  selected: TimeSlot | null
  onSelect: (slot: TimeSlot) => void
  loading: boolean
}

export function SlotGrid({ slots, selected, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-stone-500 text-sm py-4">
        No available slots for this date. Please select another day.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map(slot => {
        const isSelected = selected?.start === slot.start
        return (
          <button
            key={slot.start}
            onClick={() => onSelect(slot)}
            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
              isSelected
                ? 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-stone-200 bg-white hover:border-rose-200 text-stone-700'
            }`}
          >
            {slot.label}
          </button>
        )
      })}
    </div>
  )
}
