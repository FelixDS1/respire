import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bio, dob, nir } = await req.json()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ bio: bio?.trim() || null, date_of_birth: dob || null })
      .eq('id', user.id)

    if (profileError) {
      console.error('save-profile profiles error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { error: sensitiveError } = await supabase
      .from('patient_sensitive')
      .upsert(
        { patient_id: user.id, nir: nir?.trim() || null, updated_at: new Date().toISOString() },
        { onConflict: 'patient_id' }
      )

    if (sensitiveError) {
      console.error('save-profile sensitive error:', sensitiveError)
      return NextResponse.json({ error: sensitiveError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('save-profile unhandled error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
