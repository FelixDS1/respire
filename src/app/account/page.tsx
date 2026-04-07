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

  const today = new Date().toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, status, availability(date, start_time, end_time), therapists(consultation_fee, profiles(full_name))')
    .eq('patient_id', user.id)
    .eq('status', 'confirmed')
    .gte('availability.date', today)
    .order('created_at', { ascending: false })

  return (
    <AccountClient
      userId={user.id}
      profile={profile}
      appointments={(appointments ?? []) as any}
    />
  )
}
