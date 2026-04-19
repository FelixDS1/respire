import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const { redirectTo } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  // Redirect if already onboarded
  if (profile.role === 'patient' && profile.bio) redirect('/account')
  if (profile.role === 'therapist') {
    const { data: therapist } = await supabase
      .from('therapists')
      .select('adeli_number, rpps_number')
      .eq('id', user.id)
      .single()
    if (therapist?.adeli_number || therapist?.rpps_number) redirect('/dashboard')
  }

  return (
    <OnboardingClient
      userId={user.id}
      role={profile.role}
      fullName={profile.full_name}
      redirectAfter={redirectTo ?? null}
    />
  )
}
