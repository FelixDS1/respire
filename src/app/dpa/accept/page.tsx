import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DPA_CURRENT_VERSION } from '@/lib/constants'
import DpaAcceptClient from './DpaAcceptClient'

export default async function DpaAcceptPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'therapist') redirect('/')

  const { data: therapist } = await supabase
    .from('therapists')
    .select('dpa_version')
    .eq('id', user.id)
    .single()

  // Already up to date — send them to dashboard
  if ((therapist?.dpa_version ?? 0) >= DPA_CURRENT_VERSION) {
    redirect('/dashboard')
  }

  return <DpaAcceptClient userId={user.id} currentVersion={DPA_CURRENT_VERSION} />
}
