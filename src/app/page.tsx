import { createServerSupabaseClient } from '@/lib/supabase-server'
import HomeClient from './HomeClient'

interface Slot {
  id: string
  date: string
  start_time: string
  therapist_id: string
}

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: slots } = await supabase
    .from('availability')
    .select('id, date, start_time, therapist_id')
    .eq('is_booked', false)
    .gte('date', today)
    .order('date')
    .order('start_time')
    .limit(200)

  const previews: { therapist: Record<string, unknown>; slots: Slot[] }[] = []

  if (slots && slots.length > 0) {
    const therapistIds = [...new Set((slots as Slot[]).map(s => s.therapist_id))]

    const { data: therapists } = await supabase
      .from('therapists')
      .select('id, consultation_fee, specialties, photo_url, bio, location, profiles(full_name)')
      .in('id', therapistIds)
      .not('stripe_account_id', 'is', null)
      .not('consultation_fee', 'is', null)
      .limit(6)

    for (const t of therapists ?? []) {
      const therapistSlots = (slots as Slot[])
        .filter(s => s.therapist_id === (t as { id: string }).id)
        .slice(0, 4)
      if (therapistSlots.length > 0) {
        previews.push({ therapist: t as Record<string, unknown>, slots: therapistSlots })
      }
    }
  }

  return <HomeClient previews={previews as any} />
}
