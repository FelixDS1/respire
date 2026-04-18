import { createServerSupabaseClient } from '@/lib/supabase-server'
import TherapistsClient from './TherapistsClient'

export default async function TherapistsPage() {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('therapists')
    .select('*, profiles(full_name)')
    .not('bio', 'is', null)
    .not('consultation_fee', 'is', null)

  // Compute week date ranges
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() // 0=Sun … 6=Sat
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const thisWeekEnd = new Date(today)
  thisWeekEnd.setDate(today.getDate() + daysToSunday)
  const nextWeekStart = new Date(thisWeekEnd)
  nextWeekStart.setDate(thisWeekEnd.getDate() + 1)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6)

  const todayStr = today.toISOString().split('T')[0]
  const nextWeekEndStr = nextWeekEnd.toISOString().split('T')[0]
  const thisWeekEndStr = thisWeekEnd.toISOString().split('T')[0]
  const nextWeekStartStr = nextWeekStart.toISOString().split('T')[0]

  // Fetch all unbooked slots up to end of next week in one query
  const { data: slots } = await supabase
    .from('availability')
    .select('therapist_id, date')
    .eq('is_booked', false)
    .gte('date', todayStr)
    .lte('date', nextWeekEndStr)

  const thisWeekIds = new Set<string>()
  const nextWeekIds = new Set<string>()
  for (const slot of slots ?? []) {
    if (slot.date <= thisWeekEndStr) thisWeekIds.add(slot.therapist_id)
    if (slot.date >= nextWeekStartStr) nextWeekIds.add(slot.therapist_id)
  }

  // Auto-translate bio for therapists missing bio_en — saves result to DB for future requests
  const therapistsData = data ?? []
  const needsTranslation = therapistsData.filter(t => t.bio && !t.bio_en)
  let translatedTherapists = therapistsData

  if (needsTranslation.length > 0 && process.env.ANTHROPIC_API_KEY) {
    const results = await Promise.all(
      needsTranslation.map(async t => {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY!,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 1024,
              messages: [{
                role: 'user',
                content: `Translate the following therapist biography to English. Preserve the personal, warm, professional tone. Return only the translated text — no commentary, no quotes.\n\n${t.bio}`,
              }],
            }),
          })
          if (!res.ok) return null
          const json = await res.json()
          const bio_en: string | null = json.content?.[0]?.text ?? null
          if (bio_en) {
            await supabase.from('therapists').update({ bio_en }).eq('id', t.id)
            return { id: t.id, bio_en }
          }
        } catch { /* silently skip */ }
        return null
      })
    )
    const translationMap = new Map(results.filter(Boolean).map(r => [r!.id, r!.bio_en]))
    translatedTherapists = therapistsData.map(t =>
      translationMap.has(t.id) ? { ...t, bio_en: translationMap.get(t.id) } : t
    )
  }

  return (
    <TherapistsClient
      therapists={translatedTherapists}
      thisWeekIds={Array.from(thisWeekIds)}
      nextWeekIds={Array.from(nextWeekIds)}
    />
  )
}
