import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [profileResult, therapistResult] = await Promise.all([
    admin.from('profiles').update({ avatar_url: url }).eq('id', user.id),
    admin.from('therapists').update({ photo_url: url }).eq('id', user.id),
  ])

  if (profileResult.error) {
    console.error('avatar save profiles error:', JSON.stringify(profileResult.error))
    return NextResponse.json({ error: profileResult.error.message }, { status: 500 })
  }
  if (therapistResult.error) {
    // Non-fatal for patients
    console.warn('avatar save therapists (non-fatal):', JSON.stringify(therapistResult.error))
  }

  return NextResponse.json({ ok: true })
}
