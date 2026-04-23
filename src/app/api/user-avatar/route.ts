import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ avatar_url: null })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ avatar_url: null }, { status: 401 })

  // Try therapists table first (photo_url), then profiles (avatar_url)
  const { data: tRow } = await supabase
    .from('therapists')
    .select('photo_url')
    .eq('user_id', id)
    .single()

  if (tRow?.photo_url) {
    return NextResponse.json({ avatar_url: tRow.photo_url })
  }

  const { data: pRow } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', id)
    .single()

  return NextResponse.json({ avatar_url: pRow?.avatar_url ?? null })
}
