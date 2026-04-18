/**
 * Generates an iCalendar (.ics) string for a single appointment.
 * Uses floating (local) time so the user's calendar app picks the correct timezone.
 */
export function generateIcs({
  title,
  date,
  startTime,
  endTime,
  description,
}: {
  title: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:MM or HH:MM:SS
  endTime: string    // HH:MM or HH:MM:SS
  description?: string
}): string {
  const fmt = (d: string, t: string) => {
    const day = d.replace(/-/g, '')
    const time = t.replace(/:/g, '').slice(0, 6).padEnd(6, '0')
    return `${day}T${time}`
  }

  const now = fmt(
    new Date().toISOString().slice(0, 10),
    new Date().toISOString().slice(11, 19)
  )

  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@respire.fr`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Respire//Respire//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${fmt(date, startTime)}`,
    `DTEND:${fmt(date, endTime)}`,
    `SUMMARY:${title}`,
  ]

  if (description) {
    // Fold long lines per RFC 5545 (max 75 octets)
    lines.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Triggers a .ics file download in the browser.
 */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
