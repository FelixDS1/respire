import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'patient') redirect('/')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, status, therapist_id, availability(date, start_time, end_time), therapists(consultation_fee, profiles(full_name))')
    .eq('patient_id', user.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  const { data: waitlistEntries } = await supabase
    .from('waitlist')
    .select('therapist_id, therapists(profiles(full_name))')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <AccountClient
      userId={user.id}
      profile={profile}
      appointments={(appointments ?? []) as any}
      waitlistEntries={(waitlistEntries ?? []) as any}
    />
  )
}
