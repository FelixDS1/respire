// PREMIUM — Secure messaging feature: server component entry point

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MessagesClient from './MessagesClient'

export const metadata = {
  title: 'Messages — Respire',
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string; name?: string }>
}) {
  const { with: withId, name: withName } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch current user's profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  let conversations: {
    other_user_id: string
    other_user_name: string
    other_user_avatar: string | null
    last_message: string
    last_message_at: string
    unread_count: number
  }[] = []

  if (profile.role === 'therapist') {
    // Fetch all distinct patients this therapist has exchanged messages with
    // along with the latest message and unread count per conversation
    const { data: sentMessages } = await supabase
      .from('messages')
      .select('patient_id, content, created_at, read_at, sender_id')
      .eq('therapist_id', user.id)
      .order('created_at', { ascending: false })

    if (sentMessages && sentMessages.length > 0) {
      // Group by patient_id
      const byPatient = new Map<string, typeof sentMessages>()
      for (const msg of sentMessages) {
        if (!msg.patient_id) continue
        if (!byPatient.has(msg.patient_id)) byPatient.set(msg.patient_id, [])
        byPatient.get(msg.patient_id)!.push(msg)
      }

      // Fetch patient names + avatars
      const patientIds = Array.from(byPatient.keys())
      const { data: patientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', patientIds)

      const nameMap = new Map<string, string>()
      const avatarMap = new Map<string, string | null>()
      for (const p of patientProfiles ?? []) {
        nameMap.set(p.id, p.full_name)
        avatarMap.set(p.id, p.avatar_url ?? null)
      }

      for (const [patientId, msgs] of byPatient.entries()) {
        const sorted = msgs.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const unread = msgs.filter(m => m.sender_id === patientId && !m.read_at).length
        conversations.push({
          other_user_id: patientId,
          other_user_name: nameMap.get(patientId) ?? 'Patient',
          other_user_avatar: avatarMap.get(patientId) ?? null,
          last_message: sorted[0].content,
          last_message_at: sorted[0].created_at,
          unread_count: unread,
        })
      }
    }
  } else {
    // Patient: fetch all distinct therapists this patient has exchanged messages with
    const { data: sentMessages } = await supabase
      .from('messages')
      .select('therapist_id, content, created_at, read_at, sender_id')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (sentMessages && sentMessages.length > 0) {
      // Group by therapist_id
      const byTherapist = new Map<string, typeof sentMessages>()
      for (const msg of sentMessages) {
        if (!msg.therapist_id) continue
        if (!byTherapist.has(msg.therapist_id)) byTherapist.set(msg.therapist_id, [])
        byTherapist.get(msg.therapist_id)!.push(msg)
      }

      // Fetch therapist names + avatars
      const therapistIds = Array.from(byTherapist.keys())
      const { data: therapistProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', therapistIds)

      const nameMap = new Map<string, string>()
      const avatarMap = new Map<string, string | null>()
      for (const p of therapistProfiles ?? []) {
        nameMap.set(p.id, p.full_name)
        avatarMap.set(p.id, p.avatar_url ?? null)
      }

      for (const [therapistId, msgs] of byTherapist.entries()) {
        const sorted = msgs.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const unread = msgs.filter(m => m.sender_id === therapistId && !m.read_at).length
        conversations.push({
          other_user_id: therapistId,
          other_user_name: nameMap.get(therapistId) ?? 'Thérapeute',
          other_user_avatar: avatarMap.get(therapistId) ?? null,
          last_message: sorted[0].content,
          last_message_at: sorted[0].created_at,
          unread_count: unread,
        })
      }
    }
  }

  // Sort conversations by most recent message
  conversations.sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )

  return (
    <MessagesClient
      currentUserId={user.id}
      currentUserRole={profile.role}
      initialConversations={conversations}
      withId={withId ?? null}
      withName={withName ?? null}
    />
  )
}
