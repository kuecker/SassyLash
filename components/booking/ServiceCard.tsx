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
      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-150 ${
        selected
          ? 'border-warm-garnet-border bg-blushed-petal'
          : 'border-chalk bg-warm-white hover:border-petal-border'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-deep-walnut">{service.name}</h3>
          <p className="font-body text-driftwood text-sm mt-1">{service.description}</p>
        </div>
        <span className="font-body text-sm text-fog whitespace-nowrap mt-0.5 flex-shrink-0">{duration}</span>
      </div>
    </button>
  )
}
