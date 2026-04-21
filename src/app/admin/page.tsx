import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If ADMIN_USER_ID not set, show the current user's ID to help configure it
  if (!process.env.ADMIN_USER_ID) {
    return (
      <main style={{ padding: '4rem 2rem', fontFamily: 'Georgia, serif' }}>
        <h1 style={{ marginBottom: '1rem' }}>Admin — configuration requise</h1>
        <p style={{ marginBottom: '0.5rem', color: '#C0392B' }}>
          La variable d'environnement <code>ADMIN_USER_ID</code> n'est pas définie.
        </p>
        <p style={{ marginBottom: '0.5rem' }}>
          Ajoutez-la dans Vercel → Settings → Environment Variables :
        </p>
        <code style={{ display: 'block', background: '#F2EFE8', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
          ADMIN_USER_ID = {user.id}
        </code>
        <p style={{ marginTop: '1rem', color: '#4A6070', fontSize: '0.85rem' }}>
          Redéployez ensuite pour que la variable soit prise en compte.
        </p>
      </main>
    )
  }

  if (user.id !== process.env.ADMIN_USER_ID) redirect('/')

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: therapists, error } = await admin
    .from('therapists')
    .select('id, is_verified, rpps_number, adeli_number, credentials_urls, profiles(full_name, email)')
    .order('is_verified', { ascending: true })

  if (error) {
    return (
      <main style={{ padding: '4rem 2rem', fontFamily: 'Georgia, serif' }}>
        <h1 style={{ marginBottom: '1rem' }}>Admin</h1>
        <p style={{ color: '#C0392B' }}>Erreur de chargement : {error.message}</p>
      </main>
    )
  }

  // Generate signed URLs for credential files
  const therapistsWithUrls = await Promise.all(
    (therapists ?? []).map(async (t) => {
      const urls: string[] = []
      for (const path of (t.credentials_urls ?? [])) {
        const { data } = await admin.storage
          .from('Credentials')
          .createSignedUrl(path, 3600)
        if (data?.signedUrl) urls.push(data.signedUrl)
      }
      return { ...t, signedUrls: urls }
    })
  )

  return <AdminClient therapists={therapistsWithUrls as any} />
}
