'use client'

import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'

interface Therapist {
  id: string
  bio: string | null
  bio_en: string | null
  specialties: string[] | null
  photo_url: string | null
  consultation_fee: number | null
  languages: string[] | null
  location: string | null
  profiles: {
    full_name: string | null
  }
}

export default function TherapistsClient({ therapists }: { therapists: Therapist[] }) {
  const { t, lang } = useLanguage()

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)' }}>
          {t.therapists.title}
        </h1>
        <p className="text-sm" style={{ color: '#4A6070' }}>
          {therapists.length} {therapists.length !== 1 ? t.therapists.available_many : t.therapists.available_one}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {therapists.length === 0 ? (
          <p className="text-sm" style={{ color: '#4A6070' }}>{t.therapists.none}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {therapists.map((therapist) => {
              const bio = lang === 'en' && therapist.bio_en ? therapist.bio_en : therapist.bio
              return (
                <Link
                  key={therapist.id}
                  href={`/therapists/${therapist.id}`}
                  className="block bg-white p-6 transition-shadow hover:shadow-sm"
                  style={{ border: '1px solid var(--border)', textDecoration: 'none' }}
                >
                  <div className="flex gap-6 items-start">

                    <div
                      className="flex-shrink-0 w-20 h-20"
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

                    <div className="flex-1">
                      <h2 className="text-base font-normal mb-1" style={{ color: 'var(--text)' }}>
                        {therapist.profiles?.full_name ?? 'Thérapeute'}
                      </h2>
                      {therapist.specialties && therapist.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {therapist.specialties.map((s) => (
                            <span key={s} className="text-xs px-2 py-1"
                              style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                              {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                            </span>
                          ))}
                        </div>
                      )}
                      {bio && (
                        <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>
                          {bio.length > 160 ? bio.slice(0, 160) + '...' : bio}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {therapist.consultation_fee && (
                        <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>
                          {therapist.consultation_fee}€ <span className="font-light" style={{ color: '#4A6070' }}>{t.therapists.perSession}</span>
                        </p>
                      )}
                      {therapist.location && (
                        <p className="text-xs" style={{ color: '#4A6070' }}>{therapist.location}</p>
                      )}
                      <p className="text-xs mt-3" style={{ color: 'var(--blue-primary)' }}>
                        {t.therapists.viewProfile}
                      </p>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>
        )}
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
