import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Protect with ADMIN_USER_ID env var
  if (user.id !== process.env.ADMIN_USER_ID) redirect('/')

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: therapists } = await admin
    .from('therapists')
    .select('id, is_verified, adeli_number, credentials_urls, profiles(full_name, email)')
    .order('is_verified', { ascending: true })

  // Generate signed URLs for credential files
  const therapistsWithUrls = await Promise.all(
    (therapists ?? []).map(async (t) => {
      const urls: string[] = []
      for (const path of (t.credentials_urls ?? [])) {
        const { data } = await admin.storage
          \.from('Credentials')
          .createSignedUrl(path, 3600)
        if (data?.signedUrl) urls.push(data.signedUrl)
      }
      return { ...t, signedUrls: urls }
    })
  )

  return <AdminClient therapists={therapistsWithUrls as any} />
}
