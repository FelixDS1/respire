import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { ext } = body
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowed.includes(ext?.toLowerCase())) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const path = `${user.id}/avatar.${ext.toLowerCase()}`

    const { data, error } = await admin.storage
      .from('avatars')
      .createSignedUploadUrl(path, { upsert: true })

    if (error) {
      console.error('avatar-upload-url error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

    return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
  } catch (err) {
    console.error('avatar-upload-url fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
