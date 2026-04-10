import { createServerSupabaseClient } from '@/lib/supabase-server'
import TherapistsClient from './TherapistsClient'

export default async function TherapistsPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('therapists')
    .select('*, profiles(full_name)')
    .not('bio', 'is', null)
    .not('consultation_fee', 'is', null)
  return <TherapistsClient therapists={data ?? []} />
}
