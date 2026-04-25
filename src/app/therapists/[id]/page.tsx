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

  const stripeReady = !!therapist.stripe_account_id

  // Check if logged-in user is a verified student
  let isStudentVerified = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: studentData } = await supabase
      .from('patient_students')
      .select('student_verified')
      .eq('patient_id', user.id)
      .single()
    isStudentVerified = studentData?.student_verified ?? false
  }

  type SlotItem = NonNullable<typeof slots>[number]
  const byDate: Record<string, SlotItem[]> = {}
  for (const slot of (stripeReady ? slots : []) ?? []) {
    if (!byDate[slot.date]) byDate[slot.date] = []
    byDate[slot.date].push(slot)
  }

  return <TherapistProfileClient therapist={therapist as any} byDate={byDate} stripeReady={stripeReady} isStudentVerified={isStudentVerified} />
}
