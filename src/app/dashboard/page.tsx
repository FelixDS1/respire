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
    .select('id, status, no_show, session_notes, patient_id, availability(date, start_time), profiles!appointments_patient_id_fkey(full_name)')
    .eq('therapist_id', user.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  const { data: scheduleData } = await supabase
    .from('therapist_schedules')
    .select('*')
    .eq('therapist_id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  const { data: timeBlocksData } = await supabase
    .from('time_blocks')
    .select('*')
    .eq('therapist_id', user.id)
    .gte('date', today)
    .order('date')
    .order('start_time')

  return (
    <DashboardClient
      userId={user.id}
      profile={profile}
      initialTherapist={{
        bio: therapistData?.bio ?? '',
        bio_en: therapistData?.bio_en ?? '',
        specialties: therapistData?.specialties ?? [],
        consultation_fee: therapistData?.consultation_fee ?? 0,
        languages: therapistData?.languages ?? [],
        location: therapistData?.location ?? '',
        profession: therapistData?.profession ?? '',
      }}
      initialSlots={slotsData ?? []}
      initialAppointments={(apptData ?? []) as any}
      initialSchedule={scheduleData ?? null}
      initialTimeBlocks={timeBlocksData ?? []}
    />
  )
}
