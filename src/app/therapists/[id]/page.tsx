import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Therapist {
  id: string
  bio: string | null
  specialties: string[] | null
  photo_url: string | null
  consultation_fee: number | null
  languages: string[] | null
  location: string | null
  profiles: {
    full_name: string | null
    email: string | null
  }
}

async function getTherapist(id: string): Promise<Therapist | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('therapists')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single()
  return data as Therapist | null
}

async function getAvailability(therapistId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .eq('is_booked', false)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  return data ?? []
}

export default async function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [therapist, availability] = await Promise.all([
    getTherapist(id),
    getAvailability(id),
  ])

  if (!therapist) notFound()

  // Group availability by date
  const byDate: Record<string, typeof availability> = {}
  for (const slot of availability) {
    if (!byDate[slot.date]) byDate[slot.date] = []
    byDate[slot.date].push(slot)
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5)
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-12">

        {/* Left column — profile */}
        <div className="col-span-2">

          {/* Photo + name */}
          <div className="flex gap-6 items-start mb-8">
            <div
              className="flex-shrink-0 w-24 h-24"
              style={{ backgroundColor: 'var(--blue-accent)', border: '1px solid var(--border)' }}
            >
              {therapist.photo_url && (
                <img
                  src={therapist.photo_url}
                  alt={therapist.profiles?.full_name ?? ''}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text)' }}>
                {therapist.profiles?.full_name ?? 'Thérapeute'}
              </h1>
              {therapist.location && (
                <p className="text-sm" style={{ color: '#4A6070' }}>{therapist.location}</p>
              )}
              {therapist.languages && therapist.languages.length > 0 && (
                <p className="text-sm mt-1" style={{ color: '#4A6070' }}>
                  Langues : {therapist.languages.join(', ')}
                </p>
              )}
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)', marginBottom: '2rem' }} />

          {/* Specialties */}
          {therapist.specialties && therapist.specialties.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
                Spécialités
              </h2>
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1"
                    style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {therapist.bio && (
            <div className="mb-8">
              <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
                Présentation
              </h2>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text)', lineHeight: '1.9' }}>
                {therapist.bio}
              </p>
            </div>
          )}

        </div>

        {/* Right column — booking */}
        <div>
          <div className="bg-white p-6" style={{ border: '1px solid var(--border)' }}>

            {therapist.consultation_fee && (
              <p className="text-lg font-light mb-1" style={{ color: 'var(--text)' }}>
                {therapist.consultation_fee}€
                <span className="text-sm ml-1" style={{ color: '#4A6070' }}>/ séance</span>
              </p>
            )}

            <hr style={{ borderColor: 'var(--border)', margin: '1rem 0' }} />

            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
              Disponibilités
            </h2>

            {Object.keys(byDate).length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>
                Aucun créneau disponible pour le moment.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(byDate).slice(0, 5).map(([date, slots]) => (
                  <div key={date}>
                    <p className="text-xs mb-2 capitalize" style={{ color: '#4A6070' }}>
                      {formatDate(date)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <Link
                          key={slot.id}
                          href={`/book/${slot.id}`}
                          className="text-xs px-3 py-1 transition-colors hover:opacity-80"
                          style={{
                            border: '1px solid var(--blue-primary)',
                            color: 'var(--blue-primary)',
                            backgroundColor: 'white'
                          }}
                        >
                          {formatTime(slot.start_time)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white', marginTop: '4rem' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center text-sm" style={{ color: '#4A6070' }}>
          <span>© 2026 Respire</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">Confidentialité</Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
