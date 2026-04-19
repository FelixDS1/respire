import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS, safe because this route validates the user exists in auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { userId, fullName, email, role } = await req.json()

  if (!userId || !fullName || !email || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    full_name: fullName,
    email,
    role,
  })

  if (profileError) {
    console.error('profile insert error:', profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (role === 'therapist') {
    const { error: therapistError } = await supabase.from('therapists').insert({ id: userId })
    if (therapistError) {
      console.error('therapist insert error:', therapistError)
      return NextResponse.json({ error: therapistError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
