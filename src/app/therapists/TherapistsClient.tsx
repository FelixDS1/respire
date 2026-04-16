'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'

const ALL_SPECIALTIES = Object.keys(specialtyTranslations)

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
  sector: string | null
  is_verified: boolean
  profiles: {
    full_name: string | null
  }
}

export default function TherapistsClient({ therapists }: { therapists: Therapist[] }) {
  const { t, lang } = useLanguage()
  const [filters, setFilters] = useState<string[]>([])
  const [filterInput, setFilterInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [availFilter, setAvailFilter] = useState<'all' | 'this_week' | 'next_week'>('all')
  const [consultFilter, setConsultFilter] = useState<'all' | 'presentiel' | 'video' | 'both'>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = filterInput.trim()
    ? ALL_SPECIALTIES.filter(frTerm => {
        if (filters.includes(frTerm)) return false
        const label = lang === 'en' ? (specialtyTranslations[frTerm] ?? frTerm) : frTerm
        return normalize(label).includes(normalize(filterInput))
      }).slice(0, 6)
    : []

  function addFilter(frTerm: string) {
    if (filters.length >= 3 || filters.includes(frTerm)) return
    setFilters(prev => [...prev, frTerm])
    setFilterInput('')
    setShowSuggestions(false)
  }

  function removeFilter(frTerm: string) {
    setFilters(prev => prev.filter(f => f !== frTerm))
  }

  const filtered = filters.length === 0
    ? therapists
    : therapists.filter(t =>
        t.specialties?.some(s => filters.includes(s))
      )

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)' }}>
          {t.therapists.title}
        </h1>
        <p className="text-sm" style={{ color: '#4A6070' }}>
          {filtered.length} {filtered.length !== 1 ? t.therapists.available_many : t.therapists.available_one}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Filter bar */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Quick filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <select
            value={availFilter}
            onChange={e => setAvailFilter(e.target.value as typeof availFilter)}
            style={{ border: '1px solid var(--border)', padding: '8px 14px', fontSize: '0.9rem', backgroundColor: 'white', color: 'var(--text)', cursor: 'pointer', borderRadius: '6px' }}
          >
            <option value="all">{lang === 'fr' ? 'Toutes disponibilités' : 'All availability'}</option>
            <option value="this_week">{lang === 'fr' ? 'Cette semaine' : 'This week'}</option>
            <option value="next_week">{lang === 'fr' ? 'Semaine prochaine' : 'Next week'}</option>
          </select>
          <select
            value={consultFilter}
            onChange={e => setConsultFilter(e.target.value as typeof consultFilter)}
            style={{ border: '1px solid var(--border)', padding: '8px 14px', fontSize: '0.9rem', backgroundColor: 'white', color: 'var(--text)', cursor: 'pointer', borderRadius: '6px' }}
          >
            <option value="all">{lang === 'fr' ? 'Présentiel & vidéo' : 'In-person & video'}</option>
            <option value="presentiel">{lang === 'fr' ? 'Présentiel uniquement' : 'In-person only'}</option>
            <option value="video">{lang === 'fr' ? 'Vidéo uniquement' : 'Video only'}</option>
            <option value="both">{lang === 'fr' ? 'Les deux' : 'Both'}</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-widest" style={{ color: '#8A9BAD' }}>
            {lang === 'fr' ? 'Filtrer par' : 'Filter by'}
          </span>

          {/* Selected filter chips */}
          {filters.map(frTerm => (
            <span key={frTerm} className="flex items-center gap-2 text-xs px-3 py-1"
              style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', border: '1px solid var(--blue-primary)' }}>
              {lang === 'en' ? (specialtyTranslations[frTerm] ?? frTerm) : frTerm}
              <button onClick={() => removeFilter(frTerm)}
                style={{ color: 'var(--blue-primary)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </span>
          ))}

          {/* Input */}
          {filters.length < 3 && (
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                value={filterInput}
                onChange={e => { setFilterInput(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && suggestions[0]) addFilter(suggestions[0])
                }}
                placeholder={lang === 'fr' ? 'Ajouter une spécialité...' : 'Add an area of expertise...'}
                className="text-sm outline-none"
                style={{
                  border: '1px solid var(--border)', backgroundColor: 'white',
                  color: 'var(--text)', padding: '5px 12px', minWidth: '220px',
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 10,
                  backgroundColor: 'white', border: '1px solid var(--border)',
                  minWidth: '220px', marginTop: '2px',
                }}>
                  {suggestions.map(frTerm => (
                    <button key={frTerm} onMouseDown={() => addFilter(frTerm)}
                      className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                      style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {lang === 'en' ? (specialtyTranslations[frTerm] ?? frTerm) : frTerm}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear all */}
          {filters.length > 0 && (
            <button onClick={() => setFilters([])}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer' }}>
              {lang === 'fr' ? 'Effacer' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        {filtered.length === 0 ? (
          <p className="text-sm" style={{ color: '#4A6070' }}>
            {filters.length > 0
              ? (lang === 'fr' ? 'Aucun thérapeute ne correspond à ces spécialités.' : 'No therapists match these areas of expertise.')
              : t.therapists.none}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((therapist) => {
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
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-normal" style={{ color: 'var(--text)' }}>
                          {therapist.profiles?.full_name ?? 'Thérapeute'}
                        </h2>
                      </div>
                      {therapist.specialties && therapist.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {therapist.specialties.map((s) => (
                            <span key={s} className="text-sm px-3 py-1"
                              style={{
                                backgroundColor: filters.includes(s) ? 'var(--blue-primary)' : 'var(--blue-accent)',
                                color: filters.includes(s) ? 'white' : 'var(--blue-primary)',
                                borderRadius: '4px',
                              }}>
                              {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                            </span>
                          ))}
                        </div>
                      )}
                      {bio && (
                        <p className="text-base font-light leading-relaxed" style={{ color: '#4A6070' }}>
                          {bio.length > 160 ? bio.slice(0, 160) + '...' : bio}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {therapist.consultation_fee && (
                        <>
                          <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>
                            {therapist.consultation_fee + 4}€ <span className="font-light" style={{ color: '#4A6070' }}>{t.therapists.perSession}</span>
                          </p>
                          {therapist.sector && (
                            <>
                              <p className="text-xs" style={{ color: '#8A9BAD' }}>Secteur {therapist.sector}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--blue-primary)' }}>
                                ~{Math.max((therapist.consultation_fee + 4) - 55, 6)}€ après remboursement Sécu + mutuelle
                              </p>
                            </>
                          )}
                        </>
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
            <Link href="/about" className="hover:opacity-70 transition-opacity">{lang === 'fr' ? 'Nous contacter' : 'Contact us'}</Link>
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">{t.footer.privacy}</Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">{t.footer.terms}</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
