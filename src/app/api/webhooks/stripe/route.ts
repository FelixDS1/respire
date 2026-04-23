import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }

  const { slot_id, patient_id, therapist_id, consultation_fee, stripe_account_id } = session.metadata!

  // Idempotency — if slot already booked, refund this payment and bail
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('availability_id', slot_id)
    .single()

  if (existing) {
    // Refund the duplicate payment so the second person isn't charged
    try {
      if (session.payment_intent) {
        await stripe.refunds.create({ payment_intent: session.payment_intent as string })
      }
    } catch (refundErr) {
      console.error('webhook: duplicate refund failed', refundErr)
    }
    return NextResponse.json({ received: true })
  }

  // Mark slot as booked
  await supabase
    .from('availability')
    .update({ is_booked: true })
    .eq('id', slot_id)

  // Create appointment
  const { error: insertError } = await supabase.from('appointments').insert({
    patient_id,
    therapist_id,
    availability_id: slot_id,
    status: 'confirmed',
    stripe_payment_intent_id: session.payment_intent as string,
    consultation_fee: parseInt(consultation_fee, 10),
    therapist_stripe_account_id: stripe_account_id,
    transfer_released: false,
  })

  if (insertError) {
    console.error('webhook: appointment insert failed', insertError)
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: 'Appointment insert failed' }, { status: 500 })
  }

  // Fetch details for emails + message
  const [{ data: slot }, { data: therapist }, { data: patient }] = await Promise.all([
    supabase.from('availability').select('date, start_time, end_time').eq('id', slot_id).single(),
    supabase.from('therapists').select('profiles(full_name, email)').eq('id', therapist_id).single(),
    supabase.from('profiles').select('full_name, email').eq('id', patient_id).single(),
  ])

  const therapistProfile = therapist?.profiles as unknown as { full_name: string | null; email: string | null } | null
  const therapistName = therapistProfile?.full_name ?? 'votre thérapeute'

  if (slot) {
    const date = new Date(slot.date + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const time = slot.start_time.slice(0, 5)

    // Google Calendar link
    const gcalStart = slot.date.replace(/-/g, '') + 'T' + slot.start_time.replace(/:/g, '')
    const gcalEnd = slot.date.replace(/-/g, '') + 'T' + slot.end_time.replace(/:/g, '')
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Séance avec ${therapistName}`)}&dates=${gcalStart}/${gcalEnd}&details=${encodeURIComponent('Séance réservée via Respire')}`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://respire-one.vercel.app'

    const appointmentBlock = `
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #DDE3EA; margin: 24px 0;">
        <tr><td style="padding: 20px;">
          <p style="margin: 0 0 8px 0; font-family: Georgia, serif; color: #1C2B3A;"><strong>Date :</strong> ${date}</p>
          <p style="margin: 0; font-family: Georgia, serif; color: #1C2B3A;"><strong>Heure :</strong> ${time}</p>
        </td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" style="margin: 0 0 12px 0;">
        <tr>
          <td style="padding-right: 12px;">
            <a href="${gcalUrl}" style="display: inline-block; padding: 12px 20px; background-color: #1C2B3A; color: #ffffff; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">Ajouter à Google Agenda</a>
          </td>
          <td>
            <a href="${siteUrl}" style="display: inline-block; padding: 12px 20px; border: 1px solid #1C2B3A; color: #1C2B3A; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">Accéder à l'application</a>
          </td>
        </tr>
      </table>`

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

    const from = process.env.RESEND_FROM ?? 'Respire <onboarding@resend.dev>'

    const emailPromises: Promise<unknown>[] = []

    if (patient?.email) {
      emailPromises.push(resend.emails.send({
        from,
        to: patient.email,
        subject: 'Votre rendez-vous est confirmé — Respire',
        html: emailWrapper(`
          <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; color: #1C2B3A; margin: 0 0 24px 0;">Rendez-vous confirmé</h2>
          <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 16px 0;">Bonjour ${patient.full_name ?? ''},</p>
          <p style="font-family: Georgia, serif; color: #4A6070; margin: 0;">Votre séance avec ${therapistName} a bien été réservée et le paiement confirmé.</p>
          ${appointmentBlock}
        `),
      }))
    }

    if (therapistProfile?.email) {
      emailPromises.push(resend.emails.send({
        from,
        to: therapistProfile.email,
        subject: 'Nouvelle réservation — Respire',
        html: emailWrapper(`
          <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; color: #1C2B3A; margin: 0 0 24px 0;">Nouvelle réservation</h2>
          <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 16px 0;">Bonjour ${therapistProfile.full_name ?? ''},</p>
          <p style="font-family: Georgia, serif; color: #4A6070; margin: 0;">${patient?.full_name ?? 'Un membre'} a réservé une séance avec vous.</p>
          ${appointmentBlock}
        `),
      }))
    }

    // If session is within 24h, send reminder now and mark it sent so the
    // cron job doesn't send a duplicate later
    const sessionStart = new Date(`${slot.date}T${slot.start_time}`)
    const hoursUntilSession = (sessionStart.getTime() - Date.now()) / (1000 * 60 * 60)

    if (hoursUntilSession <= 24) {
      if (patient?.email) {
        emailPromises.push(resend.emails.send({
          from,
          to: patient.email,
          subject: 'Rappel : votre séance est bientôt — Respire',
          html: emailWrapper(`
            <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; color: #1C2B3A; margin: 0 0 24px 0;">Votre séance approche</h2>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 16px 0;">Bonjour ${patient.full_name ?? ''},</p>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0;">Votre séance avec ${therapistName} a lieu dans moins de 24h. Pensez à vous connecter quelques minutes avant.</p>
            ${appointmentBlock}
          `),
        }))
      }
      if (therapistProfile?.email) {
        emailPromises.push(resend.emails.send({
          from,
          to: therapistProfile.email,
          subject: 'Rappel : séance bientôt — Respire',
          html: emailWrapper(`
            <h2 style="font-family: Georgia, serif; font-weight: normal; font-size: 24px; color: #1C2B3A; margin: 0 0 24px 0;">Séance dans moins de 24h</h2>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0 0 16px 0;">Bonjour ${therapistProfile.full_name ?? ''},</p>
            <p style="font-family: Georgia, serif; color: #4A6070; margin: 0;">Vous avez une séance avec ${patient?.full_name ?? 'un patient'} dans moins de 24h.</p>
            ${appointmentBlock}
          `),
        }))
      }

      // Mark reminder sent so the cron doesn't send a duplicate
      await supabase
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('availability_id', slot_id)
    }

    await Promise.all([
      ...emailPromises,
      supabase.from('messages').insert({
        sender_id: patient_id,
        recipient_id: therapist_id,
        therapist_id,
        patient_id,
        content: `📅 ${patient?.full_name ?? 'Un membre'} a réservé une séance pour le ${date} à ${time}.`,
      }),
    ])
  }

  return NextResponse.json({ received: true })
}
