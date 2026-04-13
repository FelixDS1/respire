import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface Break {
  start: string  // "12:00"
  end: string    // "14:00"
}

interface Schedule {
  therapist_id: string
  days_of_week: number[]
  start_time: string
  end_time: string
  session_duration: number
  buffer_minutes: number
  advance_weeks: number
  breaks: Break[]
}

interface TimeBlock {
  date: string
  end_date: string | null
  start_time: string
  end_time: string
}

function toMinutes(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function toTimeString(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function generateSlots(schedule: Schedule, timeBlocks: TimeBlock[], cutoffDateStr: string, cutoffMins: number) {
  const slots: { therapist_id: string; date: string; start_time: string; end_time: string; is_booked: boolean }[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + schedule.advance_weeks * 7)

  const startMins = toMinutes(schedule.start_time)
  const endMins = toMinutes(schedule.end_time)
  const increment = schedule.session_duration + schedule.buffer_minutes
  const breaks = schedule.breaks ?? []

  // Expand multi-day time blocks into per-date index
  const blocksByDate: Record<string, TimeBlock[]> = {}
  for (const tb of timeBlocks) {
    const start = new Date(tb.date + 'T00:00:00')
    const end = new Date((tb.end_date ?? tb.date) + 'T00:00:00')
    const cur = new Date(start)
    while (cur <= end) {
      const ds = cur.toISOString().split('T')[0]
      if (!blocksByDate[ds]) blocksByDate[ds] = []
      blocksByDate[ds].push(tb)
      cur.setDate(cur.getDate() + 1)
    }
  }

  const current = new Date(today)
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    const dateStr = current.toISOString().split('T')[0]
    const dayBlocks = blocksByDate[dateStr] ?? []

    if (schedule.days_of_week.includes(dayOfWeek)) {
      for (let mins = startMins; mins + schedule.session_duration <= endMins; mins += increment) {
        const slotEnd = mins + schedule.session_duration

        // Enforce 24-hour advance booking minimum
        if (dateStr < cutoffDateStr) continue
        if (dateStr === cutoffDateStr && mins < cutoffMins) continue

        // Skip if overlaps a recurring break
        if (breaks.some(b => {
          const bStart = toMinutes(b.start)
          const bEnd = toMinutes(b.end)
          return mins < bEnd && slotEnd > bStart
        })) continue

        // Skip if overlaps a one-off time block
        if (dayBlocks.some(tb => {
          const tbStart = toMinutes(tb.start_time)
          const tbEnd = toMinutes(tb.end_time)
          return mins < tbEnd && slotEnd > tbStart
        })) continue

        slots.push({
          therapist_id: schedule.therapist_id,
          date: dateStr,
          start_time: toTimeString(mins),
          end_time: toTimeString(slotEnd),
          is_booked: false,
        })
      }
    }

    current.setDate(current.getDate() + 1)
  }

  return slots
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Accept schedule payload from client and upsert server-side
  const body = await req.json().catch(() => ({}))
  if (body.schedule) {
    await supabase.from('therapist_schedules').upsert({
      therapist_id: user.id,
      ...body.schedule,
    })
  }

  const { data: schedule } = await supabase
    .from('therapist_schedules')
    .select('*')
    .eq('therapist_id', user.id)
    .single()

  if (!schedule) return NextResponse.json({ error: 'No schedule found' }, { status: 404 })

  // 24-hour advance booking cutoff
  const now = new Date()
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const cutoffDateStr = cutoff.toISOString().split('T')[0]
  const cutoffMins = cutoff.getHours() * 60 + cutoff.getMinutes()

  // Fetch one-off time blocks
  const today = new Date().toISOString().split('T')[0]
  const { data: timeBlocks } = await supabase
    .from('time_blocks')
    .select('date, end_date, start_time, end_time')
    .eq('therapist_id', user.id)
    .gte('date', today)

  // Find booked slot IDs so we don't delete them
  const { data: bookedAppts } = await supabase
    .from('appointments')
    .select('availability_id')
    .eq('therapist_id', user.id)

  const bookedIds = (bookedAppts ?? [])
    .map(a => a.availability_id)
    .filter(Boolean)

  // Delete all future unbooked slots
  let deleteQuery = supabase
    .from('availability')
    .delete()
    .eq('therapist_id', user.id)
    .gte('date', today)

  if (bookedIds.length > 0) {
    deleteQuery = deleteQuery.not('id', 'in', `(${bookedIds.join(',')})`)
  }

  await deleteQuery

  // Generate and insert new slots in batches of 100
  const slots = generateSlots(schedule, timeBlocks ?? [], cutoffDateStr, cutoffMins)
  const batchSize = 100
  for (let i = 0; i < slots.length; i += batchSize) {
    await supabase.from('availability').insert(slots.slice(i, i + batchSize))
  }

  return NextResponse.json({ success: true, count: slots.length })
}
