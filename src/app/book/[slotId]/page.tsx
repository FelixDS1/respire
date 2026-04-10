import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import BookClient from './BookClient'

export default async function BookPage({ params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: slot } = await supabase
    .from('availability')
    .select('*')
    .eq('id', slotId)
    .single()

  if (!slot) notFound()

  // Check if booked via appointments table (more reliable than is_booked flag)
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('availability_id', slotId)
    .single()

  const isBooked = slot.is_booked || !!existing

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id, consultation_fee, sector, profiles(full_name)')
    .eq('id', slot.therapist_id)
    .single()

  return (
    <BookClient
      slot={slot}
      therapist={therapist as any}
      isBooked={isBooked}
    />
  )
}
