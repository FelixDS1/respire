import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  if (!therapist?.stripe_account_id) {
    return NextResponse.json({ error: 'No Stripe account' }, { status: 400 })
  }

  const account = await stripe.accounts.retrieve(therapist.stripe_account_id)
  const complete = account.charges_enabled && account.details_submitted

  await supabase
    .from('therapists')
    .update({ stripe_onboarding_complete: complete })
    .eq('id', user.id)

  return NextResponse.json({ complete, charges_enabled: account.charges_enabled, details_submitted: account.details_submitted })
}
