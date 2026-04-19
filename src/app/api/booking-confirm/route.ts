import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Polled by the success page to check whether the webhook has confirmed the booking.
// Read-only — never writes anything.
export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
    .select('id, availability(date, start_time, end_time), therapists(profiles(full_name))')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!appointment) return NextResponse.json({ confirmed: false })

  const av = appointment.availability as unknown as { date: string; start_time: string; end_time: string } | null
  const th = appointment.therapists as unknown as { profiles: { full_name: string } | null } | null

  return NextResponse.json({
    confirmed: true,
    appointment: av ? {
      date: av.date,
      startTime: av.start_time,
      endTime: av.end_time,
      therapistName: th?.profiles?.full_name ?? null,
    } : null,
  })
}
