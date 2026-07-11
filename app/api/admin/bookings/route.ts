import { NextRequest, NextResponse } from 'next/server'
import { requestIsOwner } from '@/lib/auth/cognito'
import { listBookingsByStatus, toBookingWithRelations } from '@/lib/db/bookings'
import type { BookingStatus } from '@/types'

// Owner-gated bookings feed for the admin dashboard (replaces the direct
// Supabase query the client component used to make under RLS).
export async function GET(request: NextRequest) {
  if (!(await requestIsOwner(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tab = new URL(request.url).searchParams.get('tab') ?? 'pending'
  const now = Date.now()

  let items
  if (tab === 'pending') {
    items = (await listBookingsByStatus('pending'))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  } else if (tab === 'upcoming') {
    items = (await listBookingsByStatus('confirmed'))
      .filter((b) => new Date(b.start_time).getTime() >= now)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  } else {
    // Past: denied/expired/cancelled at any time + confirmed appointments in the past
    const statuses: BookingStatus[] = ['denied', 'expired', 'cancelled', 'confirmed']
    const groups = await Promise.all(statuses.map((s) => listBookingsByStatus(s)))
    items = groups
      .flat()
      .filter((b) => b.status !== 'confirmed' || new Date(b.start_time).getTime() < now)
      .sort((a, b) => b.start_time.localeCompare(a.start_time))
  }

  return NextResponse.json({ bookings: items.map(toBookingWithRelations) })
}
