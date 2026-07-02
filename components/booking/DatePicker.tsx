'use client'

import { addDays, format, startOfToday } from 'date-fns'

interface Props {
  selected: Date | null
  onSelect: (date: Date) => void
  availableDays: number[]  // [1,2,3,4,5] = Mon-Fri
}

export function DatePicker({ selected, onSelect, availableDays }: Props) {
  const today = startOfToday()
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i + 1))
    .filter(d => availableDays.includes(d.getDay()))

  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {days.map(day => {
        const isSelected = selected?.toDateString() === day.toDateString()
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className={`flex flex-col items-center p-2 rounded-lg border transition-all duration-150 ${
              isSelected
                ? 'border-warm-garnet-border bg-blushed-petal text-warm-garnet'
                : 'border-chalk bg-warm-white hover:border-petal-border text-deep-walnut'
            }`}
          >
            <span className="font-body text-xs text-fog">{format(day, 'EEE')}</span>
            <span className="font-display font-semibold">{format(day, 'd')}</span>
            <span className="font-body text-xs">{format(day, 'MMM')}</span>
          </button>
        )
      })}
    </div>
  )
}
