import { createServerSupabaseClient } from '@/lib/supabase-server'
import TherapistsClient from './TherapistsClient'

export default async function TherapistsPage() {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('therapists')
    .select('*, profiles(full_name)')
    .not('bio', 'is', null)
    .not('consultation_fee', 'is', null)

  // Compute week date ranges
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() // 0=Sun … 6=Sat
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const thisWeekEnd = new Date(today)
  thisWeekEnd.setDate(today.getDate() + daysToSunday)
  const nextWeekStart = new Date(thisWeekEnd)
  nextWeekStart.setDate(thisWeekEnd.getDate() + 1)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6)

  const todayStr = today.toISOString().split('T')[0]
  const nextWeekEndStr = nextWeekEnd.toISOString().split('T')[0]
  const thisWeekEndStr = thisWeekEnd.toISOString().split('T')[0]
  const nextWeekStartStr = nextWeekStart.toISOString().split('T')[0]

  // Fetch all unbooked slots up to end of next week in one query
  const { data: slots } = await supabase
    .from('availability')
    .select('therapist_id, date')
    .eq('is_booked', false)
    .gte('date', todayStr)
    .lte('date', nextWeekEndStr)

  const thisWeekIds = new Set<string>()
  const nextWeekIds = new Set<string>()
  for (const slot of slots ?? []) {
    if (slot.date <= thisWeekEndStr) thisWeekIds.add(slot.therapist_id)
    if (slot.date >= nextWeekStartStr) nextWeekIds.add(slot.therapist_id)
  }

  return (
    <TherapistsClient
      therapists={data ?? []}
      thisWeekIds={Array.from(thisWeekIds)}
      nextWeekIds={Array.from(nextWeekIds)}
    />
  )
}
