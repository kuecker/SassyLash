import { NextRequest, NextResponse } from 'next/server'
import { requestIsOwner } from '@/lib/auth/cognito'
import { updateAvailability } from '@/lib/db/availability'

// Owner-gated availability update for the AvailabilityEditor (replaces the
// direct Supabase write the client component used to make under RLS).
export async function PATCH(request: NextRequest) {
  if (!(await requestIsOwner(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { day_of_week?: number; start_time?: string; end_time?: string; is_active?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { day_of_week, start_time, end_time, is_active } = body
  if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json({ error: 'Invalid day_of_week' }, { status: 400 })
  }

  await updateAvailability(day_of_week, { start_time, end_time, is_active })
  return NextResponse.json({ ok: true })
}
