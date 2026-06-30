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
      <header className="bg-white border-b border-stone-200 px-4 py-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sassy Lash &amp; Skin</h1>
        <p className="text-stone-500 text-sm mt-1">Book your appointment below</p>
      </header>
      <div className="max-w-lg mx-auto px-4 py-8">
        <BookingPageClient services={services ?? []} availableDays={availableDays} />
      </div>
    </main>
  )
}
