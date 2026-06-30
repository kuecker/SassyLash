import { createServiceRoleClient } from '@/lib/supabase/server'
import { AvailabilityEditor } from '@/components/admin/AvailabilityEditor'

export default async function AvailabilityPage() {
  const db = createServiceRoleClient()
  const { data: availability } = await db
    .from('availability')
    .select('*')
    .order('day_of_week')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Business Hours</h1>
      <p className="text-stone-500 text-sm">
        Toggle days on/off and set open/close times. Changes take effect immediately for new bookings.
      </p>
      <AvailabilityEditor initialAvailability={availability ?? []} />
    </div>
  )
}
