import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { photo_url, rpps_number, adeli_number, credentials_urls, dpa_accepted_at, dpa_version } = body

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await admin.from('therapists').upsert({
      id: user.id,
      photo_url: photo_url ?? null,
      rpps_number: rpps_number ?? null,
      adeli_number: adeli_number ?? null,
      credentials_urls: credentials_urls ?? [],
      dpa_accepted_at: dpa_accepted_at ?? null,
      dpa_version: dpa_version ?? null,
    })

    if (error) {
      console.error('onboarding/therapist-step1 error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send admin notification — non-fatal if it fails
    try {
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = process.env.RESEND_FROM ?? 'Respire <onboarding@resend.dev>'
        const name = profile?.full_name ?? user.email ?? 'Thérapeute inconnu'
        const identifier = rpps_number
          ? `RPPS : ${rpps_number}`
          : adeli_number
          ? `ADELI : ${adeli_number}`
          : 'Numéro non renseigné'

        await resend.emails.send({
          from,
          to: adminEmail,
          subject: `Nouveau thérapeute à vérifier — ${name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #2C2820;">
              <p style="font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #9C7B5A; margin-bottom: 24px;">Respire · Notification admin</p>
              <h1 style="font-size: 1.6rem; font-weight: 300; margin-bottom: 8px;">Nouveau thérapeute inscrit</h1>
              <p style="color: #4A6070; margin-bottom: 24px; font-size: 0.95rem;">Un thérapeute vient de soumettre ses justificatifs et attend votre vérification.</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #EDE9E0; color: #8A9BAD; font-size: 0.85rem; width: 120px;">Nom</td><td style="padding: 8px 0; border-bottom: 1px solid #EDE9E0; font-size: 0.85rem;">${name}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #EDE9E0; color: #8A9BAD; font-size: 0.85rem;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #EDE9E0; font-size: 0.85rem;">${profile?.email ?? user.email ?? '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #8A9BAD; font-size: 0.85rem;">Identifiant</td><td style="padding: 8px 0; font-size: 0.85rem;">${identifier}</td></tr>
              </table>
              <a href="https://respire.pro/admin" style="display: inline-block; background: #2C2820; color: #F2EFE8; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 0.85rem; letter-spacing: 0.05em;">Vérifier le profil →</a>
            </div>
          `,
        })
      }
    } catch (emailErr) {
      console.error('therapist-step1 notification email failed (non-fatal):', emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('onboarding/therapist-step1 fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
