import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { photo_url, rpps_number, adeli_number, credentials_urls, dpa_accepted_at, dpa_version } = body

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await admin.from('therapists').upsert({
      id: user.id,
      photo_url: photo_url ?? null,
      rpps_number: rpps_number ?? null,
      adeli_number: adeli_number ?? null,
      credentials_urls: credentials_urls ?? [],
      dpa_accepted_at: dpa_accepted_at ?? null,
      dpa_version: dpa_version ?? null,
    })

    if (error) {
      console.error('onboarding/therapist-step1 error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('onboarding/therapist-step1 fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
