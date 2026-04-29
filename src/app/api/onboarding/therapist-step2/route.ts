import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { bio, specialties, languages, consultation_fee, location, consultation_type } = body

    if (!bio?.trim()) return NextResponse.json({ error: 'Bio manquante' }, { status: 400 })
    if (!consultation_fee || isNaN(Number(consultation_fee))) return NextResponse.json({ error: 'Tarif invalide' }, { status: 400 })
    if (!location) return NextResponse.json({ error: 'Localisation manquante' }, { status: 400 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await admin.from('therapists').upsert({
      id: user.id,
      bio: bio.trim(),
      specialties: specialties ?? [],
      languages: languages ?? [],
      consultation_fee: Number(consultation_fee),
      location,
      consultation_type,
    })

    if (error) {
      console.error('onboarding/therapist-step2 error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('onboarding/therapist-step2 fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
