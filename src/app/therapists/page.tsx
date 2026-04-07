import { createServerSupabaseClient } from '@/lib/supabase-server'
import TherapistsClient from './TherapistsClient'

export default async function TherapistsPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('therapists')
    .select('*, profiles(full_name)')
  return <TherapistsClient therapists={data ?? []} />
}
