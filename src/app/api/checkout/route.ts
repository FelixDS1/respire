import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { slotId } = await req.json()
  if (!slotId) {
    return NextResponse.json({ error: 'Créneau manquant' }, { status: 400 })
  }

  // Get slot
  const { data: slot } = await supabase
    .from('availability')
    .select('*')
    .eq('id', slotId)
    .eq('is_booked', false)
    .single()

  if (!slot) {
    return NextResponse.json({ error: 'Créneau non disponible' }, { status: 404 })
  }

  // Get therapist
  const { data: therapist } = await supabase
    .from('therapists')
    .select('consultation_fee, stripe_account_id, stripe_onboarding_complete, profiles(full_name)')
    .eq('id', slot.therapist_id)
    .single()

  if (!therapist || !therapist.consultation_fee) {
    return NextResponse.json({ error: 'Informations thérapeute manquantes' }, { status: 400 })
  }

  if (!therapist.stripe_account_id || !therapist.stripe_onboarding_complete) {
    return NextResponse.json({ error: 'Ce thérapeute ne peut pas encore recevoir de paiements' }, { status: 400 })
  }

  const therapistName = (therapist.profiles as unknown as { full_name: string | null })?.full_name ?? 'Thérapeute'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: (therapist.consultation_fee + 4) * 100,
          product_data: {
            name: `Séance avec ${therapistName}`,
            description: `${slot.date} à ${slot.start_time.slice(0, 5)}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      // No transfer_data — funds are held in the platform account until after
      // the session completes, then released via the daily release-transfers cron.
      // The €4 platform fee is retained naturally (we only transfer consultation_fee).
    },
    metadata: {
      slot_id: slotId,
      patient_id: user.id,
      therapist_id: slot.therapist_id,
      consultation_fee: String(therapist.consultation_fee),
      stripe_account_id: therapist.stripe_account_id,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/therapists/${slot.therapist_id}`,
  })

  return NextResponse.json({ url: session.url })
}
