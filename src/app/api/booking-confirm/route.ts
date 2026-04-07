import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()

  if (!sessionId) {
    return NextResponse.json({ error: 'Session manquante' }, { status: 400 })
  }

  // Verify payment with Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 400 })
  }

  const { slot_id, patient_id, therapist_id } = session.metadata!

  const supabase = await createServerSupabaseClient()

  // Check if appointment already exists (avoid duplicates)
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('availability_id', slot_id)
    .single()

  if (existing) {
    return NextResponse.json({ success: true, alreadyConfirmed: true })
  }

  // Mark slot as booked
  await supabase
    .from('availability')
    .update({ is_booked: true })
    .eq('id', slot_id)

  // Create appointment
  await supabase.from('appointments').insert({
    patient_id,
    therapist_id,
    availability_id: slot_id,
    status: 'confirmed',
    stripe_payment_intent_id: session.payment_intent as string,
  })

  // Get details for email
  const { data: slot } = await supabase
    .from('availability')
    .select('date, start_time, end_time')
    .eq('id', slot_id)
    .single()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('profiles(full_name, email)')
    .eq('id', therapist_id)
    .single()

  const { data: patient } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', patient_id)
    .single()

  if (slot && patient?.email) {
    const therapistName = (therapist?.profiles as { full_name: string | null } | null)?.full_name ?? 'votre thérapeute'
    const date = new Date(slot.date + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    const time = slot.start_time.slice(0, 5)

    await resend.emails.send({
      from: 'Respire <onboarding@resend.dev>',
      to: patient.email,
      subject: 'Votre rendez-vous est confirmé — Respire',
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1C2B3A;">
          <h2 style="font-weight: normal; margin-bottom: 8px;">Rendez-vous confirmé</h2>
          <p style="color: #4A6070; margin-bottom: 24px;">Bonjour ${patient.full_name ?? ''},</p>
          <p style="color: #4A6070;">Votre séance a bien été réservée et le paiement confirmé.</p>

          <div style="border: 1px solid #DDE3EA; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Thérapeute :</strong> ${therapistName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Date :</strong> ${date}</p>
            <p style="margin: 0;"><strong>Heure :</strong> ${time}</p>
          </div>

          <p style="color: #4A6070; font-size: 14px;">Respire</p>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true })
}
