import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { path, contentType, data } = body as { path: string; contentType: string; data: number[] }

    if (!path || !data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Ensure the path is scoped to the authenticated user
    if (!path.startsWith(user.id + '/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const buffer = Buffer.from(data)
    const { error } = await admin.storage
      .from('Credentials')
      .upload(path, buffer, { upsert: true, contentType })

    if (error) {
      console.error('upload-diploma storage error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Save diploma_url to therapists table
    const { error: updateError } = await admin
      .from('therapists')
      .update({ diploma_url: path })
      .eq('id', user.id)

    if (updateError) {
      console.error('upload-diploma therapists update error:', JSON.stringify(updateError))
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ path })
  } catch (e: any) {
    console.error('upload-diploma unhandled error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
