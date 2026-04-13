import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Service-role client — needed to read appointment regardless of RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Polled by the success page to check whether the webhook has confirmed the booking.
// Read-only — never writes anything.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  // Retrieve session from Stripe to get the payment_intent_id
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ confirmed: false })
  }

  const paymentIntentId = session.payment_intent as string

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  return NextResponse.json({ confirmed: !!appointment })
}
