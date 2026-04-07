'use client'

import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'

interface Slot {
  id: string
  date: string
  start_time: string
}

interface Therapist {
  id: string
  bio: string | null
  bio_en: string | null
  specialties: string[] | null
  photo_url: string | null
  consultation_fee: number | null
  languages: string[] | null
  location: string | null
  is_verified: boolean
  profiles: {
    full_name: string | null
    email: string | null
  }
}

interface Props {
  therapist: Therapist
  byDate: Record<string, Slot[]>
}

export default function TherapistProfileClient({ therapist, byDate }: Props) {
  const { t, lang } = useLanguage()

  const bio = lang === 'en' && therapist.bio_en ? therapist.bio_en : therapist.bio

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5)
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-12">

        {/* Left column */}
        <div className="col-span-2">

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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-light" style={{ color: 'var(--text)' }}>
                  {therapist.profiles?.full_name ?? 'Thérapeute'}
                </h1>
                {therapist.is_verified
                  ? <span className="text-xs px-2 py-0.5" style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                      {lang === 'en' ? '✓ Verified' : '✓ Vérifié'}
                    </span>
                  : <span className="text-xs px-2 py-0.5" style={{ backgroundColor: '#F5F5F5', color: '#4A6070' }}>
                      {lang === 'en' ? 'Pending verification' : 'En cours de vérification'}
                    </span>
                }
              </div>
              {therapist.location && (
                <p className="text-sm" style={{ color: '#4A6070' }}>{therapist.location}</p>
              )}
              {therapist.languages && therapist.languages.length > 0 && (
                <p className="text-sm mt-1" style={{ color: '#4A6070' }}>
                  {t.profile.languages} : {therapist.languages.join(', ')}
                </p>
              )}
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)', marginBottom: '2rem' }} />

          {therapist.specialties && therapist.specialties.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
                {t.profile.specialties}
              </h2>
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.map((s) => (
                  <span key={s} className="text-xs px-3 py-1"
                    style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {bio && (
            <div className="mb-8">
              <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
                {t.profile.about}
              </h2>
              <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text)', lineHeight: '1.9' }}>
                {bio}
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
                <span className="text-sm ml-1" style={{ color: '#4A6070' }}>{t.profile.perSession}</span>
              </p>
            )}

            <hr style={{ borderColor: 'var(--border)', margin: '1rem 0' }} />

            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
              {t.profile.availability}
            </h2>

            {Object.keys(byDate).length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>{t.profile.noSlots}</p>
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

      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white', marginTop: '4rem' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center text-sm" style={{ color: '#4A6070' }}>
          <span>© 2026 Respire</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">{t.footer.privacy}</Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">{t.footer.terms}</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
