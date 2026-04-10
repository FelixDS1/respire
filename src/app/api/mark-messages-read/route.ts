// PREMIUM — Secure messaging feature: mark messages as read

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { other_user_id } = await req.json()

  if (!other_user_id) {
    return NextResponse.json({ error: 'Missing other_user_id' }, { status: 400 })
  }

  // Mark all messages from other_user_id to current user as read
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('sender_id', other_user_id)
    .eq('recipient_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
