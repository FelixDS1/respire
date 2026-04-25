import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { bio, avatar_url, is_student, student_id_url, student_cert_url } = body

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await admin.from('profiles').update({
      bio: bio ?? null,
      avatar_url: avatar_url ?? null,
    }).eq('id', user.id)

    if (error) {
      console.error('onboarding/patient error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If patient indicated student status, upsert into patient_students table
    if (is_student !== undefined) {
      const { error: studentErr } = await admin.from('patient_students').upsert({
        patient_id: user.id,
        is_student: is_student ?? false,
        student_id_url: student_id_url ?? null,
        student_cert_url: student_cert_url ?? null,
        student_verified: false,
      }, { onConflict: 'patient_id' })

      if (studentErr) {
        console.error('onboarding/patient student upsert error:', JSON.stringify(studentErr))
        return NextResponse.json({ error: studentErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('onboarding/patient fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
