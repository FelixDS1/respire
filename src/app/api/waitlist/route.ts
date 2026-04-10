// SQL migration needed:
// create table waitlist (
//   id uuid primary key default gen_random_uuid(),
//   patient_id uuid references auth.users(id) on delete cascade,
//   therapist_id uuid references therapists(id) on delete cascade,
//   created_at timestamptz default now(),
//   unique(patient_id, therapist_id)
// );
// alter table waitlist enable row level security;
// create policy "Patients manage their own waitlist" on waitlist
//   using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { therapistId } = await req.json()
  if (!therapistId) return NextResponse.json({ error: 'Missing therapistId' }, { status: 400 })

  const { data: existing } = await supabase
    .from('waitlist')
    .select('id')
    .eq('patient_id', user.id)
    .eq('therapist_id', therapistId)
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true, alreadyOnList: true })

  await supabase.from('waitlist').insert({ patient_id: user.id, therapist_id: therapistId })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { therapistId } = await req.json()
  if (!therapistId) return NextResponse.json({ error: 'Missing therapistId' }, { status: 400 })

  await supabase.from('waitlist').delete()
    .eq('patient_id', user.id)
    .eq('therapist_id', therapistId)

  return NextResponse.json({ ok: true })
}
