import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const appointmentId = req.nextUrl.searchParams.get('appointmentId')
  if (!appointmentId) {
    return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch appointment — verify caller is the patient or therapist
  const { data: appt, error: fetchErr } = await supabase
    .from('appointments')
    .select('id, patient_id, therapist_id, video_room_url, availability(date, start_time, end_time)')
    .eq('id', appointmentId)
    .single()

  if (fetchErr || !appt) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  if (appt.patient_id !== user.id && appt.therapist_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Return existing room URL (idempotent)
  if (appt.video_room_url) {
    return NextResponse.json({ url: appt.video_room_url })
  }

  // Create a new Daily.co room
  const avRaw = Array.isArray(appt.availability) ? appt.availability[0] : appt.availability
  const av = avRaw as { date: string; start_time: string; end_time: string } | null
  // Room expires 30 minutes after the session end time (or 2h from now as fallback)
  const expiry = av
    ? Math.floor(new Date(`${av.date}T${av.end_time}`).getTime() / 1000) + 1800
    : Math.floor(Date.now() / 1000) + 7200

  const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      // No explicit name → Daily generates a random, unguessable slug
      privacy: 'public',
      properties: {
        exp: expiry,
        enable_chat: false,
        enable_screenshare: false,
        start_video_off: false,
        start_audio_off: false,
        // Prevent the call from being recorded or broadcast
        enable_recording: 'none',
      },
    }),
  })

  if (!dailyRes.ok) {
    const err = await dailyRes.json().catch(() => ({}))
    console.error('Daily.co room creation failed', err)
    return NextResponse.json({ error: 'Failed to create video room' }, { status: 500 })
  }

  const room = await dailyRes.json()
  const roomUrl: string = room.url

  // Persist so both parties get the same URL and we don't create duplicate rooms
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await adminClient
    .from('appointments')
    .update({ video_room_url: roomUrl })
    .eq('id', appointmentId)

  return NextResponse.json({ url: roomUrl })
}
