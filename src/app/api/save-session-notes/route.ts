import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { appointmentId, notes } = await req.json()
  if (!appointmentId) return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, therapist_id')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.therapist_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await supabase.from('appointments').update({ session_notes: notes ?? null }).eq('id', appointmentId)

  return NextResponse.json({ ok: true })
}
