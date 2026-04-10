// SQL migration needed:
// create table checkins (
//   id uuid primary key default gen_random_uuid(),
//   patient_id uuid references auth.users(id) on delete cascade,
//   appointment_id uuid references appointments(id) on delete cascade unique,
//   mood_score int not null check (mood_score between 1 and 5),
//   note text,
//   created_at timestamptz default now()
// );
// alter table checkins enable row level security;
// create policy "Patients manage own checkins" on checkins
//   using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
// create policy "Therapists can read checkins for their appointments" on checkins
//   for select using (
//     exists (
//       select 1 from appointments a
//       join therapists t on t.id = a.therapist_id
//       where a.id = checkins.appointment_id
//       and t.id = (select id from therapists where id = auth.uid())
//     )
//   );

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId, moodScore, note } = await req.json()
  if (!appointmentId || !moodScore) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (moodScore < 1 || moodScore > 5) return NextResponse.json({ error: 'Invalid mood score' }, { status: 400 })

  const { data: appt } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('patient_id', user.id)
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

  await supabase.from('checkins').upsert({
    patient_id: user.id,
    appointment_id: appointmentId,
    mood_score: moodScore,
    note: note?.trim() || null,
  }, { onConflict: 'appointment_id' })

  return NextResponse.json({ ok: true })
}
