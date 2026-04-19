import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Called daily by Vercel Cron. Releases held funds to therapists for sessions
// that have already taken place.
export async function GET(req: NextRequest) {
  // Protect with a shared secret so only Vercel Cron can call this
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find confirmed appointments whose session date has passed and transfer not yet released
  const now = new Date().toISOString()

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      consultation_fee,
      therapist_stripe_account_id,
      stripe_payment_intent_id,
      availability(date, end_time)
    `)
    .eq('status', 'confirmed')
    .eq('transfer_released', false)

  if (error) {
    console.error('release-transfers: fetch error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const due = (appointments ?? []).filter((appt) => {
    const availability = appt.availability as unknown as { date: string; end_time: string } | null
    if (!availability) return false
    const sessionEnd = new Date(`${availability.date}T${availability.end_time}`)
    return sessionEnd < new Date()
  })

  const results = await Promise.allSettled(
    due.map(async (appt) => {
      if (!appt.therapist_stripe_account_id || !appt.consultation_fee) {
        throw new Error(`Appointment ${appt.id}: missing stripe account or fee`)
      }

      await stripe.transfers.create({
        amount: appt.consultation_fee * 100, // cents
        currency: 'eur',
        destination: appt.therapist_stripe_account_id,
        metadata: { appointment_id: appt.id },
      })

      await supabase
        .from('appointments')
        .update({ transfer_released: true })
        .eq('id', appt.id)

      return appt.id
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason?.message)

  if (failed.length) {
    console.error('release-transfers: some transfers failed', failed)
  }

  return NextResponse.json({ processed: due.length, succeeded, failed })
}
