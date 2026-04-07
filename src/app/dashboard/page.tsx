import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'therapist') redirect('/')

  const { data: therapistData } = await supabase
    .from('therapists')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: slotsData } = await supabase
    .from('availability')
    .select('*, appointments(id)')
    .eq('therapist_id', user.id)
    .order('date')
    .order('start_time')

  const { data: apptData } = await supabase
    .from('appointments')
    .select('id, status, availability(date, start_time), profiles!appointments_patient_id_fkey(full_name)')
    .eq('therapist_id', user.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      userId={user.id}
      profile={profile}
      initialTherapist={{
        bio: therapistData?.bio ?? '',
        specialties: therapistData?.specialties ?? [],
        consultation_fee: therapistData?.consultation_fee ?? 0,
        languages: therapistData?.languages ?? [],
        location: therapistData?.location ?? '',
      }}
      initialSlots={slotsData ?? []}
      initialAppointments={(apptData ?? []) as any}
    />
  )
}
