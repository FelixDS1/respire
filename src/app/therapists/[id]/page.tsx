import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import TherapistProfileClient from './TherapistProfileClient'

export default async function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: therapist }, { data: slots }] = await Promise.all([
    supabase.from('therapists').select('*, profiles(full_name, email)').eq('id', id).single(),
    supabase.from('availability').select('*')
      .eq('therapist_id', id).eq('is_booked', false)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date').order('start_time'),
  ])

  if (!therapist) notFound()

  const byDate: Record<string, typeof slots> = {}
  for (const slot of slots ?? []) {
    if (!byDate[slot.date]) byDate[slot.date] = []
    byDate[slot.date].push(slot)
  }

  return <TherapistProfileClient therapist={therapist} byDate={byDate} />
}
