// PREMIUM — Secure messaging feature
//
// Run in Supabase:
// create table messages (
//   id uuid primary key default gen_random_uuid(),
//   sender_id uuid references auth.users(id) on delete cascade,
//   recipient_id uuid references auth.users(id) on delete cascade,
//   therapist_id uuid references therapists(id) on delete cascade,
//   patient_id uuid references auth.users(id) on delete cascade,
//   content text not null,
//   created_at timestamptz default now(),
//   read_at timestamptz
// );
// create index on messages(therapist_id, patient_id, created_at);
// alter table messages enable row level security;
// create policy "Users can read their own messages" on messages
//   for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
// create policy "Authenticated users can insert" on messages
//   for insert with check (auth.uid() = sender_id);

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipient_id, content } = await req.json()

  if (!recipient_id || !content?.trim()) {
    return NextResponse.json({ error: 'Missing recipient_id or content' }, { status: 400 })
  }

  // Determine sender role
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!senderProfile) {
    return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 })
  }

  // Determine recipient role
  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', recipient_id)
    .single()

  if (!recipientProfile) {
    return NextResponse.json({ error: 'Recipient profile not found' }, { status: 404 })
  }

  // Derive therapist_id and patient_id from sender/recipient roles
  let therapist_id: string
  let patient_id: string

  if (senderProfile.role === 'therapist' && recipientProfile.role === 'patient') {
    therapist_id = user.id
    patient_id = recipient_id
  } else if (senderProfile.role === 'patient' && recipientProfile.role === 'therapist') {
    therapist_id = recipient_id
    patient_id = user.id
  } else {
    return NextResponse.json(
      { error: 'Messages can only be sent between a therapist and a patient' },
      { status: 400 }
    )
  }

  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id,
      content: content.trim(),
      therapist_id,
      patient_id,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting message:', insertError)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message })
}
