import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

// Called hourly by Vercel Cron. Sends 24h reminder emails to patients and
// therapists for sessions starting in the next 23–25 hours.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Window: sessions starting between 50 and 70 minutes from now
  const now = new Date()
  const windowStart = new Date(now.getTime() + 50 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 70 * 60 * 1000)

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      therapist_id,
      availability(date, start_time, end_time)
    `)
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)

  if (error) {
    console.error('send-reminders: fetch error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter to appointments in the 23–25h window
  const due = (appointments ?? []).filter((appt) => {
    const av = Array.isArray(appt.availability) ? appt.availability[0] : appt.availability
    if (!av) return false
    const sessionStart = new Date(`${av.date}T${av.start_time}`)
    return sessionStart >= windowStart && sessionStart <= windowEnd
  })

  if (due.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  const from = process.env.RESEND_FROM ?? 'Respire <onboarding@resend.dev>'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://respire.pro'

  const emailWrapper = (body: string) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F9;">
      <tr><td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; padding: 48px;">
          <tr><td>
            <p style="font-family: Georgia, serif; font-size: 18px; letter-spacing: 0.08em; color: #1C2B3A; margin: 0 0 40px 0;">RESPIRE</p>
            ${body}
            <p style="font-family: Georgia, serif; font-size: 12px; color: #8A9BAC; margin: 40px 0 0 0;">Respire · contact@respire.pro</p>
          </td></tr>
        </table>
      </td></tr>
    </table>`

  const results = await Promise.allSettled(
    due.map(async (appt) => {
      const av = Array.isArray(appt.availability) ? appt.availability[0] : appt.availability as { date: string; start_time: string; end_time: string } | null
      if (!av) throw new Error(`Appointment ${appt.id}: no availability`)

      const [{ data: therapist }, { data: patient }] = await Promise.all([
        supabase.from('therapists').select('profiles(full_name, email)').eq('user_id', appt.therapist_id).single(),
        supabase.from('profiles').select('full_name, email').eq('id', appt.patient_id).single(),
      ])

      const therapistProfile = therapist?.profiles as unknown as { full_name: string | null; email: string | null } | null
      const therapistName = therapistProfile?.full_name ?? 'votre thérapeute'

      const date = new Date(av.date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
      const time = av.start_time.slice(0, 5)

      const appointmentBlock = `
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #DDE3EA; margin: 24px 0;">
          <tr><td style="padding: 20px;">
            <p style="margin: 0 0 8px 0; font-family: Georgia, serif; color: #1C2B3A;"><strong>Date :</strong> ${date}</p>
            <p style="margin: 0 0 8px 0; font-family: Georgia, serif; color: #1C2B3A;"><strong>Heure :</strong> ${time}</p>
          </td></tr>
        </table>
        <a href="${siteUrl}/account" style="display: inline-block; padding: 12px 20px; background-color: #1C2B3A; color: #ffffff; font-family: Georgia, serif; font-size: 13px; text-decoration: none; margin-bottom: 12px;">Accéder à mon espace</a>`

      const emailPromises: Promise<unknown>[] = []

      if (patient?.email) {
        emailPromises.push(resend.emails.send({
          from,
          to: patient.email,
          subject: 'Rappel : votre séance commence dans 1 heure — Respire',
          html: emailWrapper(`
            <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; color: #1C2B3A; margin: 0 0 24px 0;">Votre séance commence dans 1 heure</h2>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 16px 0;">Bonjour ${patient.full_name ?? ''},</p>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 8px 0;">Vous avez une séance avec ${therapistName} dans environ 1 heure.</p>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0;">Pensez à vous connecter quelques minutes avant l'heure prévue.</p>
            ${appointmentBlock}
          `),
        }))
      }

      if (therapistProfile?.email) {
        emailPromises.push(resend.emails.send({
          from,
          to: therapistProfile.email,
          subject: 'Rappel : séance dans 1 heure — Respire',
          html: emailWrapper(`
            <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; color: #1C2B3A; margin: 0 0 24px 0;">Séance dans 1 heure</h2>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 16px 0;">Bonjour ${therapistProfile.full_name ?? ''},</p>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0;">Vous avez une séance avec ${patient?.full_name ?? 'un patient'} dans environ 1 heure.</p>
            ${appointmentBlock}
          `),
        }))
      }

      await Promise.all(emailPromises)

      await supabase
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', appt.id)

      return appt.id
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason?.message)

  if (failed.length) {
    console.error('send-reminders: some reminders failed', failed)
  }

  return NextResponse.json({ processed: due.length, succeeded, failed })
}
