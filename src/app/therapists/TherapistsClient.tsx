'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'

const COMMON_PILLS = ['Anxiété', 'Stress', 'TCC', 'Dépression', 'Relations', 'Deuil']

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
  consultation_type: string | null
  profession: string | null
  is_verified: boolean
  profiles: {
    full_name: string | null
  }
}

interface Props {
  therapists: Therapist[]
  thisWeekIds: string[]
  nextWeekIds: string[]
}

function PillToggle({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid var(--blue-primary)',
        backgroundColor: active ? 'var(--blue-primary)' : 'transparent',
        color: active ? 'white' : 'var(--blue-primary)',
        fontSize: '0.8rem',
        fontFamily: 'Georgia, serif',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.12s, color 0.12s',
      }}
    >
      {label}
    </button>
  )
}

export default function TherapistsClient({ therapists, thisWeekIds, nextWeekIds }: Props) {
  const { t, lang } = useLanguage()
  const [searchText, setSearchText] = useState('')
  const [selectedPills, setSelectedPills] = useState<string[]>([])
  const [availFilter, setAvailFilter] = useState<'all' | 'this_week' | 'next_week'>('all')
  const [consultFilter, setConsultFilter] = useState<'all' | 'presentiel' | 'video'>('all')
  const [professionFilter, setProfessionFilter] = useState<'all' | 'Psychologue' | 'Psychiatre'>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const thisWeekSet = new Set(thisWeekIds)
  const nextWeekSet = new Set(nextWeekIds)

  function togglePill(pill: string) {
    setSelectedPills(prev =>
      prev.includes(pill) ? prev.filter(p => p !== pill) : [...prev, pill]
    )
  }

  function clearAll() {
    setSearchText('')
    setSelectedPills([])
    setAvailFilter('all')
    setConsultFilter('all')
    setProfessionFilter('all')
  }

  const filtered = therapists.filter(th => {
    // Text search: any specialty must match the typed text
    if (searchText.trim()) {
      const norm = normalize(searchText.trim())
      const hasMatch = th.specialties?.some(s => normalize(s).includes(norm))
      if (!hasMatch) return false
    }
    // Selected pills: AND — therapist must have every selected specialty
    for (const pill of selectedPills) {
      if (!th.specialties?.includes(pill)) return false
    }
    // Availability
    if (availFilter === 'this_week' && !thisWeekSet.has(th.id)) return false
    if (availFilter === 'next_week' && !nextWeekSet.has(th.id)) return false
    // Consultation type
    if (consultFilter === 'presentiel' && th.consultation_type !== 'presentiel' && th.consultation_type !== 'both') return false
    if (consultFilter === 'video' && th.consultation_type !== 'video' && th.consultation_type !== 'both') return false
    // Profession
    if (professionFilter !== 'all' && th.profession !== professionFilter) return false
    return true
  })

  const hasActiveFilters =
    searchText.trim() !== '' ||
    selectedPills.length > 0 ||
    availFilter !== 'all' ||
    consultFilter !== 'all' ||
    professionFilter !== 'all'

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '48px 0 28px' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 300,
            fontFamily: 'Georgia, serif',
            color: 'var(--text)',
            margin: '0 0 6px',
          }}>
            {t.therapists.title}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#8A9BAD', fontFamily: 'Georgia, serif', margin: 0 }}>
            {filtered.length}{' '}
            {filtered.length !== 1 ? t.therapists.available_many : t.therapists.available_one}
            {' '}à Paris
          </p>
        </div>

        {/* ── Specialty search ── */}
        <div style={{ marginBottom: '20px' }}>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder={
              lang === 'fr'
                ? 'Rechercher une problématique… (ex: anxiété, deuil, relations)'
                : 'Search for an issue… (e.g. anxiety, grief, relationships)'
            }
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '0.92rem',
              fontFamily: 'Georgia, serif',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '12px',
            }}
          />
          {/* Common specialty quick-select pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {COMMON_PILLS.map(pill => {
              const label = lang === 'en' ? (specialtyTranslations[pill] ?? pill) : pill
              return (
                <PillToggle
                  key={pill}
                  label={label}
                  active={selectedPills.includes(pill)}
                  onClick={() => togglePill(pill)}
                />
              )
            })}
          </div>
        </div>

        {/* ── Availability + format filters ── */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '32px' }}>
          <PillToggle
            label={lang === 'fr' ? 'Toutes disponibilités' : 'All availability'}
            active={availFilter === 'all'}
            onClick={() => setAvailFilter('all')}
          />
          <PillToggle
            label={lang === 'fr' ? 'Cette semaine' : 'This week'}
            active={availFilter === 'this_week'}
            onClick={() => setAvailFilter('this_week')}
          />
          <PillToggle
            label={lang === 'fr' ? 'Semaine prochaine' : 'Next week'}
            active={availFilter === 'next_week'}
            onClick={() => setAvailFilter('next_week')}
          />

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

          <PillToggle
            label={lang === 'fr' ? 'Présentiel & vidéo' : 'In-person & video'}
            active={consultFilter === 'all'}
            onClick={() => setConsultFilter('all')}
          />
          <PillToggle
            label={lang === 'fr' ? 'Présentiel' : 'In-person'}
            active={consultFilter === 'presentiel'}
            onClick={() => setConsultFilter('presentiel')}
          />
          <PillToggle
            label={lang === 'fr' ? 'Vidéo' : 'Video'}
            active={consultFilter === 'video'}
            onClick={() => setConsultFilter('video')}
          />

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

          <PillToggle
            label={lang === 'fr' ? 'Psychologues & psychiatres' : 'Psychologists & psychiatrists'}
            active={professionFilter === 'all'}
            onClick={() => setProfessionFilter('all')}
          />
          <PillToggle
            label={lang === 'fr' ? 'Psychologues' : 'Psychologists'}
            active={professionFilter === 'Psychologue'}
            onClick={() => setProfessionFilter('Psychologue')}
          />
          <PillToggle
            label={lang === 'fr' ? 'Psychiatres' : 'Psychiatrists'}
            active={professionFilter === 'Psychiatre'}
            onClick={() => setProfessionFilter('Psychiatre')}
          />
        </div>

        {/* ── Result count ── */}
        <p style={{ fontSize: '0.78rem', color: '#8A9BAD', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* ── Card list ── */}
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 0' }}>
              <p style={{ fontSize: '1rem', color: '#4A6070', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>
                Aucun thérapeute ne correspond à votre recherche.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  style={{
                    padding: '10px 28px',
                    border: '1px solid var(--blue-primary)',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: 'var(--blue-primary)',
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'fr' ? 'Effacer tous les filtres' : 'Clear all filters'}
                </button>
              )}
            </div>
          ) : (
            filtered.map(therapist => {
              const bio = lang === 'en' && therapist.bio_en ? therapist.bio_en : therapist.bio
              const name = therapist.profiles?.full_name ?? 'Thérapeute'
              const price = therapist.consultation_fee ? therapist.consultation_fee + 4 : null
              const reimbursement = price ? Math.max(price - 55, 6) : null
              const isHovered = hoveredId === therapist.id

              return (
                <Link
                  key={therapist.id}
                  href={`/therapists/${therapist.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    onMouseEnter={() => setHoveredId(therapist.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: 'flex',
                      gap: '24px',
                      alignItems: 'flex-start',
                      padding: '24px 12px',
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: isHovered ? 'var(--surface)' : 'transparent',
                      transition: 'background-color 0.15s',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    {/* Left: rectangular photo */}
                    <div style={{
                      flexShrink: 0,
                      width: '100px',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--blue-accent)',
                    }}>
                      {therapist.photo_url && (
                        <img
                          src={therapist.photo_url}
                          alt={name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      )}
                    </div>

                    {/* Center: name, specialty tags, bio excerpt */}
                    <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                      <h2 style={{
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        fontFamily: 'Georgia, serif',
                        color: 'var(--text)',
                        margin: '0 0 8px',
                      }}>
                        {name}
                      </h2>
                      {therapist.specialties && therapist.specialties.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                          {therapist.specialties.slice(0, 6).map(s => (
                            <span key={s} style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              backgroundColor: selectedPills.includes(s)
                                ? 'var(--blue-primary)'
                                : 'var(--blue-accent)',
                              color: selectedPills.includes(s) ? 'white' : 'var(--blue-primary)',
                              fontFamily: 'Georgia, serif',
                              whiteSpace: 'nowrap',
                            }}>
                              {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                            </span>
                          ))}
                        </div>
                      )}
                      {bio && (
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: 300,
                          lineHeight: 1.65,
                          color: '#4A6070',
                          fontFamily: 'Georgia, serif',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        } as React.CSSProperties}>
                          {bio}
                        </p>
                      )}
                    </div>

                    {/* Right: price, sector, reimbursement, location, CTA */}
                    <div style={{
                      flexShrink: 0,
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '5px',
                      minWidth: '140px',
                      paddingTop: '2px',
                    }}>
                      {price && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{
                            fontSize: '1.7rem',
                            fontWeight: 300,
                            fontFamily: 'Georgia, serif',
                            color: 'var(--text)',
                            lineHeight: 1,
                          }}>
                            {price}€
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#8A9BAD', fontFamily: 'Georgia, serif' }}>
                            {t.therapists.perSession}
                          </span>
                        </div>
                      )}
                      {therapist.sector && (
                        <p style={{ fontSize: '0.73rem', color: '#8A9BAD', fontFamily: 'Georgia, serif', margin: 0 }}>
                          Secteur {therapist.sector}
                        </p>
                      )}
                      {reimbursement !== null && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '20px',
                          backgroundColor: '#EEFAF0',
                          color: '#2E7D32',
                          fontFamily: 'Georgia, serif',
                          whiteSpace: 'nowrap',
                          border: '1px solid #C8E6C9',
                        }}>
                          ~{reimbursement}€ après remboursement
                        </span>
                      )}
                      {therapist.location && (
                        <p style={{ fontSize: '0.75rem', color: '#4A6070', fontFamily: 'Georgia, serif', margin: 0 }}>
                          {therapist.location}
                        </p>
                      )}
                      <span style={{
                        marginTop: '8px',
                        fontSize: '0.82rem',
                        color: 'var(--blue-primary)',
                        fontFamily: 'Georgia, serif',
                      }}>
                        {t.therapists.viewProfile}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', marginTop: '5rem' }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '28px 56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.88rem',
          color: '#4A6070',
          fontFamily: 'Georgia, serif',
        }}>
          <span>© 2026 Respire</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/about" style={{ color: '#4A6070', textDecoration: 'none' }}>
              {lang === 'fr' ? 'Nous contacter' : 'Contact us'}
            </Link>
            <Link href="/privacy" style={{ color: '#4A6070', textDecoration: 'none' }}>{t.footer.privacy}</Link>
            <Link href="/terms" style={{ color: '#4A6070', textDecoration: 'none' }}>{t.footer.terms}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
