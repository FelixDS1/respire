import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()

  // ── Stats ────────────────────────────────────────────────────────────────
  const [
    { count: patientCount },
    { count: recentSignups },
    { count: therapistTotal },
    { count: therapistVerified },
    { count: appointmentTotal },
    { count: appointmentsLast30 },
    { data: feesData },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient').gte('created_at', daysAgo(7)),
    admin.from('therapists').select('*', { count: 'exact', head: true }),
    admin.from('therapists').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    admin.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    admin.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed').gte('created_at', daysAgo(30)),
    admin.from('appointments').select('consultation_fee').eq('status', 'confirmed').eq('transfer_released', true),
  ])

  const revenueReleased = (feesData ?? []).reduce((sum: number, r: { consultation_fee: number | null }) => sum + (r.consultation_fee ?? 0), 0)

  const stats = {
    patientCount: patientCount ?? 0,
    recentSignups: recentSignups ?? 0,
    therapistTotal: therapistTotal ?? 0,
    therapistVerified: therapistVerified ?? 0,
    appointmentTotal: appointmentTotal ?? 0,
    appointmentsLast30: appointmentsLast30 ?? 0,
    revenueReleased,
  }

  // ── Churn ────────────────────────────────────────────────────────────────
  const [
    { data: everBookedData },
    { data: recentlyBookedData },
    { data: oldPatients },
  ] = await Promise.all([
    admin.from('appointments').select('patient_id').eq('status', 'confirmed'),
    admin.from('appointments').select('patient_id').eq('status', 'confirmed').gte('created_at', daysAgo(45)),
    admin.from('profiles').select('id, full_name, email, created_at').eq('role', 'patient').lt('created_at', daysAgo(14)),
  ])

  const everBookedSet = new Set((everBookedData ?? []).map((a: { patient_id: string }) => a.patient_id))
  const recentlyBookedSet = new Set((recentlyBookedData ?? []).map((a: { patient_id: string }) => a.patient_id))

  // Never activated: signed up 14+ days ago, never booked
  const neverActivated = (oldPatients ?? []).filter((p: { id: string }) => !everBookedSet.has(p.id))

  // Went quiet: booked before, but not in the last 45 days
  const wentQuietIds = [...everBookedSet].filter(id => !recentlyBookedSet.has(id))
  let wentQuiet: { id: string; full_name: string | null; email: string | null }[] = []
  if (wentQuietIds.length > 0) {
    const { data } = await admin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', wentQuietIds)
    wentQuiet = data ?? []
  }

  // ── Therapists & verifications ────────────────────────────────────────────
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

  const therapistsWithUrls = await Promise.all(
    (therapists ?? []).map(async (t) => {
      const urls: string[] = []
      for (const path of (t.credentials_urls ?? [])) {
        const { data } = await admin.storage.from('Credentials').createSignedUrl(path, 3600)
        if (data?.signedUrl) urls.push(data.signedUrl)
      }
      return { ...t, signedUrls: urls }
    })
  )

  const { data: pendingStudents } = await admin
    .from('patient_students')
    .select('patient_id, student_id_url, student_cert_url, student_verified, profiles!patient_students_patient_id_fkey(full_name, email)')
    .eq('is_student', true)
    .eq('student_verified', false)

  const studentsWithUrls = await Promise.all(
    (pendingStudents ?? []).map(async (s) => {
      const signedUrls = { idUrl: s.student_id_url ?? null, certUrl: s.student_cert_url ?? null }
      return { ...s, signedUrls }
    })
  )

  const { data: waitlistSignups } = await admin
    .from('pre_launch_signups')
    .select('id, name, email, phone, created_at')
    .order('created_at', { ascending: false })

  return (
    <AdminClient
      therapists={therapistsWithUrls as any}
      pendingStudents={studentsWithUrls as any}
      waitlistSignups={waitlistSignups ?? []}
      stats={stats}
      neverActivated={neverActivated as any}
      wentQuiet={wentQuiet}
    />
  )
}
