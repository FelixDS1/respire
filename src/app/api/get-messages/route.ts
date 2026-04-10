// PREMIUM — Fetch messages for a conversation via server-side Supabase client

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const otherUserId = searchParams.get('other_user_id')
  if (!otherUserId) return NextResponse.json({ error: 'Missing other_user_id' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  let query = supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (profile.role === 'therapist') {
    query = query.eq('therapist_id', user.id).eq('patient_id', otherUserId)
  } else {
    query = query.eq('therapist_id', otherUserId).eq('patient_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: data ?? [] })
}
