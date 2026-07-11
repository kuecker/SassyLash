import Link from 'next/link'
import { listServices } from '@/lib/db/services'
import { listAvailability } from '@/lib/db/availability'
import { BookingPageClient } from './BookingPageClient'

export default async function Home() {
  const [allServices, allAvailability] = await Promise.all([
    listServices(),
    listAvailability(),
  ])

  const services = allServices
    .filter((s) => s.active)
    .sort((a, b) => b.duration_minutes - a.duration_minutes)

  const availableDays = allAvailability
    .filter((a) => a.is_active)
    .map((a) => a.day_of_week)

  return (
    <main className="min-h-screen">
      <header className="bg-warm-white border-b border-chalk px-4 py-7 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-deep-walnut">Sassy Lash &amp; Skin</h1>
        <p className="font-body text-sm text-driftwood mt-2">Book your appointment</p>
      </header>
      <div className="max-w-lg mx-auto px-4 py-10">
        <BookingPageClient services={services ?? []} availableDays={availableDays} />
      </div>
      <footer className="border-t border-chalk px-4 py-6 text-center">
        <Link href="/legal" className="font-body text-sm text-driftwood hover:text-deep-walnut underline underline-offset-2">
          Privacy Policy &amp; SMS Terms
        </Link>
      </footer>
    </main>
  )
}
