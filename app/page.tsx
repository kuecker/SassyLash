import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { BookingPageClient } from './BookingPageClient'

export default async function Home() {
  const db = createServiceRoleClient()

  const [{ data: services }, { data: availability }] = await Promise.all([
    db.from('services').select('*').eq('active', true).order('duration_minutes', { ascending: false }),
    db.from('availability').select('*').eq('is_active', true),
  ])

  const availableDays = (availability ?? []).map((a: { day_of_week: number }) => a.day_of_week)

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
