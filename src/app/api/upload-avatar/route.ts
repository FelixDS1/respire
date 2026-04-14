import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    console.log('upload-avatar: start')
    const supabase = await createServerSupabaseClient()
    console.log('upload-avatar: got supabase client')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('upload-avatar: user=', user?.id ?? 'null')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    console.log('upload-avatar: file=', file?.name, file?.size)
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const path = `${user.id}/avatar.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('upload-avatar: uploading to storage, path=', path, 'size=', buffer.length)

    const { error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, buffer, { upsert: true, contentType: file.type || 'image/jpeg' })

    if (error) {
      console.error('upload-avatar: storage error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('upload-avatar: storage upload OK')
    const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`

    await Promise.all([
      supabaseAdmin.from('profiles').update({ photo_url: publicUrl }).eq('id', user.id),
      supabaseAdmin.from('therapists').update({ photo_url: publicUrl }).eq('id', user.id),
    ])

    console.log('upload-avatar: done, url=', url)
    return NextResponse.json({ url })
  } catch (e: any) {
    console.error('upload-avatar unhandled error:', e?.message, e?.stack)
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
