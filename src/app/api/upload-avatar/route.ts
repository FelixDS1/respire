import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 })
    }

    const path = `${user.id}/avatar.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, buffer, { upsert: true, contentType: file.type || 'image/jpeg' })

    if (error) {
      console.error('upload-avatar storage error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`

    const [profileResult, therapistResult] = await Promise.all([
      supabaseAdmin.from('profiles').update({ avatar_url: url }).eq('id', user.id),
      supabaseAdmin.from('therapists').update({ photo_url: url }).eq('id', user.id),
    ])

    if (profileResult.error) {
      console.error('upload-avatar profiles update error:', JSON.stringify(profileResult.error))
      return NextResponse.json({ error: 'Failed to save avatar URL: ' + profileResult.error.message }, { status: 500 })
    }
    if (therapistResult.error) {
      // Non-fatal for patients who have no therapist row
      console.warn('upload-avatar therapists update (non-fatal):', JSON.stringify(therapistResult.error))
    }

    return NextResponse.json({ url })
  } catch (e: any) {
    console.error('upload-avatar unhandled error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
