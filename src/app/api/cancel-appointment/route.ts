import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { appointmentId } = await req.json()
  if (!appointmentId) return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch appointment and verify ownership
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, patient_id, availability_id, stripe_payment_intent_id, status, availability(date, start_time)')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.patient_id !== user.id) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  if (appt.status === 'cancelled') {
    return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
  }

  // Check 24h window
  const availability = appt.availability as unknown as { date: string; start_time: string }
  const sessionStart = new Date(`${availability.date}T${availability.start_time}`)
  const hoursUntil = (sessionStart.getTime() - Date.now()) / 3600000
  const refundEligible = hoursUntil >= 24

  // Issue Stripe refund if eligible
  let refunded = false
  if (refundEligible && appt.stripe_payment_intent_id) {
    try {
      await stripe.refunds.create({ payment_intent: appt.stripe_payment_intent_id })
      refunded = true
    } catch (e) {
      console.error('Stripe refund error:', e)
      return NextResponse.json({ error: 'Refund failed. Please contact support.' }, { status: 500 })
    }
  }

  // Mark appointment cancelled and free the slot
  await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId)
  await supabase.from('availability').update({ is_booked: false }).eq('id', appt.availability_id)

  return NextResponse.json({ ok: true, refunded })
}
