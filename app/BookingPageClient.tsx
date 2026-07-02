'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ServiceCard } from '@/components/booking/ServiceCard'
import { DatePicker } from '@/components/booking/DatePicker'
import { SlotGrid } from '@/components/booking/SlotGrid'
import { BookingForm } from '@/components/booking/BookingForm'
import type { ServiceRow, TimeSlot } from '@/types'

interface Props {
  services: ServiceRow[]
  availableDays: number[]
}

export function BookingPageClient({ services, availableDays }: Props) {
  const router = useRouter()
  const [service, setService] = useState<ServiceRow | null>(null)
  const [date,    setDate]    = useState<Date | null>(null)
  const [slots,   setSlots]   = useState<TimeSlot[]>([])
  const [slot,    setSlot]    = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!service || !date) return
    setSlot(null)
    setSlots([])
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const dateStr = format(date, 'yyyy-MM-dd')
    fetch(`/api/slots?date=${dateStr}&serviceId=${service.id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
      .catch(err => {
        if (err.name === 'AbortError') return
        setSlots([])
        setError('Could not load available times. Please try again.')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [service, date])

  const step = !service ? 1 : !date ? 2 : !slot ? 3 : 4

  return (
    <div className="space-y-9">
      {error && (
        <div className="bg-error-surface border border-petal-border text-error-text px-4 py-3 rounded-lg text-sm font-body">
          {error}
        </div>
      )}

      <section>
        <h2 className="font-body text-xs font-semibold text-fog uppercase tracking-widest mb-4">
          1. Select a Service
        </h2>
        <div className="space-y-3">
          {services.map(s => (
            <ServiceCard
              key={s.id}
              service={s}
              selected={service?.id === s.id}
              onSelect={s => { setService(s); setDate(null); setSlot(null) }}
            />
          ))}
        </div>
      </section>

      {step >= 2 && (
        <section>
          <h2 className="font-body text-xs font-semibold text-fog uppercase tracking-widest mb-4">
            2. Choose a Date
          </h2>
          <DatePicker
            selected={date}
            onSelect={d => { setDate(d); setSlot(null) }}
            availableDays={availableDays}
          />
        </section>
      )}

      {step >= 3 && (
        <section>
          <h2 className="font-body text-xs font-semibold text-fog uppercase tracking-widest mb-4">
            3. Pick a Time
          </h2>
          <SlotGrid
            slots={slots}
            selected={slot}
            onSelect={setSlot}
            loading={loading}
          />
        </section>
      )}

      {step >= 4 && slot && service && date && (
        <section>
          <h2 className="font-body text-xs font-semibold text-fog uppercase tracking-widest mb-4">
            4. Your Information
          </h2>
          <BookingForm
            service={service}
            slot={slot}
            date={date}
            onSuccess={() => router.push('/confirmation')}
            onError={setError}
          />
        </section>
      )}
    </div>
  )
}
