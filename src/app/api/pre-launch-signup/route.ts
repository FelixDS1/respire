// SQL migration needed:
// create table pre_launch_signups (
//   id uuid primary key default gen_random_uuid(),
//   name text not null,
//   email text not null unique,
//   phone text,
//   created_at timestamptz default now()
// );
// alter table pre_launch_signups enable row level security;
// create policy "Service role only" on pre_launch_signups using (false);

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { name, email, phone, referral } = await req.json()

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('pre_launch_signups')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ ok: true, alreadySignedUp: true })
  }

  const { error } = await supabaseAdmin.from('pre_launch_signups').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    referral_source: referral?.trim() || null,
  })

  if (error) {
    console.error('pre_launch_signups insert error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
