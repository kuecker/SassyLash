'use client'

import type { ServiceRow } from '@/types'

interface Props {
  service: ServiceRow
  selected: boolean
  onSelect: (service: ServiceRow) => void
}

export function ServiceCard({ service, selected, onSelect }: Props) {
  const duration =
    service.duration_minutes >= 60
      ? `${service.duration_minutes / 60} hr${service.duration_minutes > 60 ? 's' : ''}`
      : `${service.duration_minutes} min`

  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
        selected
          ? 'border-rose-400 bg-rose-50'
          : 'border-stone-200 bg-white hover:border-rose-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{service.name}</h3>
          <p className="text-stone-500 text-sm mt-1">{service.description}</p>
        </div>
        <span className="text-sm text-stone-400 whitespace-nowrap ml-4 mt-1">{duration}</span>
      </div>
    </button>
  )
}
