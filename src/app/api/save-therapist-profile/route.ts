import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { error } = await supabase.from('therapists').update({
    bio: body.bio ?? null,
    bio_en: body.bio_en ?? null,
    specialties: body.specialties ?? [],
    consultation_fee: body.consultation_fee ?? null,
    languages: body.languages ?? [],
    location: body.location ?? null,
    profession: body.profession ?? null,
    sector: body.sector ?? null,
    consultation_type: body.consultation_type ?? 'both',
    diploma_institution: body.diploma_institution ?? null,
  }).eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
