import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { student_id_url, student_cert_url } = body

    if (!student_id_url || !student_cert_url) {
      return NextResponse.json({ error: 'Documents manquants' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await admin.from('patient_students').upsert({
      patient_id: user.id,
      is_student: true,
      student_id_url,
      student_cert_url,
      student_verified: false,
    }, { onConflict: 'patient_id' })

    if (error) {
      console.error('student-submit error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('student-submit fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
