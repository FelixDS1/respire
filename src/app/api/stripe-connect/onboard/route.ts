import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Confirm user is a therapist
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'therapist') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if therapist already has a Stripe account
  const { data: therapist } = await supabase
    .from('therapists')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  let accountId = therapist?.stripe_account_id

  // Create a new Express account if none exists
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: profile.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        mcc: '8099', // Health practitioners
        name: profile.full_name ?? undefined,
      },
    })

    accountId = account.id

    await supabase
      .from('therapists')
      .update({ stripe_account_id: accountId, stripe_onboarding_complete: false })
      .eq('id', user.id)
  }

  // Generate a fresh onboarding link (links expire after a few minutes)
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
