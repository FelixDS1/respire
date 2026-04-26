'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'

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
  student_price: number | null
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
  isStudentVerified?: boolean
}

// Mobile-only dropdown pill — shows current value, opens options on tap
function FilterDropdown({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = options.find(o => o.value === value)?.label ?? options[0]?.label
  const isFiltered = value !== options[0]?.value

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '7px 14px',
          borderRadius: '999px',
          border: '1px solid var(--blue-primary)',
          backgroundColor: isFiltered ? 'var(--blue-primary)' : 'transparent',
          color: isFiltered ? 'white' : 'var(--blue-primary)',
          fontSize: '0.8rem',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
        }}
      >
        {current}
        <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 30,
          minWidth: '170px',
          overflow: 'hidden',
        }}>
          {options.map((opt, i) => (
            <button
              key={opt.value}
              onMouseDown={e => {
                e.preventDefault()
                onChange(opt.value)
                setOpen(false)
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '11px 16px',
                fontSize: '0.85rem',
                fontFamily: 'Georgia, serif',
                color: opt.value === value ? 'var(--blue-primary)' : 'var(--text)',
                backgroundColor: opt.value === value ? 'var(--blue-accent)' : 'transparent',
                border: 'none',
                borderBottom: i < options.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
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

export default function TherapistsClient({ therapists, thisWeekIds, nextWeekIds, isStudentVerified = false }: Props) {
  const { t, lang } = useLanguage()

  // inputText drives the dropdown only — does NOT filter therapists
  const [inputText, setInputText] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [selectedPills, setSelectedPills] = useState<string[]>([])
  const [availFilter, setAvailFilter] = useState<'all' | 'this_week' | 'next_week'>('all')
  const [consultFilter, setConsultFilter] = useState<'all' | 'presentiel' | 'video'>('all')
  const [professionFilter, setProfessionFilter] = useState<'all' | 'Psychologue'>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const searchWrapperRef = useRef<HTMLDivElement>(null)

  const thisWeekSet = new Set(thisWeekIds)
  const nextWeekSet = new Set(nextWeekIds)

  // All known specialties: full catalogue from specialtyTranslations + anything extra from DB
  const allSpecialties = Array.from(
    new Set([
      ...Object.keys(specialtyTranslations),
      ...therapists.flatMap(t => t.specialties ?? []),
    ])
  ).sort((a, b) => normalize(a).localeCompare(normalize(b)))

  // Suggestions: specialties where any word starts with the typed prefix
  const suggestions = inputText.trim().length > 0
    ? allSpecialties.filter(specialty => {
        const query = normalize(inputText.trim())
        const frWords = normalize(specialty).split(/\s+/)
        const enWords = normalize(specialtyTranslations[specialty] ?? specialty).split(/\s+/)
        return [...frWords, ...enWords].some(word => word.startsWith(query))
      }).slice(0, 10)
    : []

  // Close dropdown when clicking outside the search area
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function selectSuggestion(specialty: string) {
    if (!selectedPills.includes(specialty)) {
      setSelectedPills(prev => [...prev, specialty])
    }
    setInputText('')
    setDropdownOpen(false)
  }

  function togglePill(pill: string) {
    setSelectedPills(prev =>
      prev.includes(pill) ? prev.filter(p => p !== pill) : [...prev, pill]
    )
  }

  function clearAll() {
    setInputText('')
    setSelectedPills([])
    setAvailFilter('all')
    setConsultFilter('all')
    setProfessionFilter('all')
    setDropdownOpen(false)
  }

  // Therapist list updates only when selectedPills / other filters change — not on every keystroke
  const filtered = therapists.filter(th => {
    if (selectedPills.length > 0 && !selectedPills.some(pill => th.specialties?.includes(pill))) return false
    if (availFilter === 'this_week' && !thisWeekSet.has(th.id)) return false
    if (availFilter === 'next_week' && !nextWeekSet.has(th.id)) return false
    if (consultFilter === 'presentiel' && th.consultation_type !== 'presentiel' && th.consultation_type !== 'both') return false
    if (consultFilter === 'video' && th.consultation_type !== 'video' && th.consultation_type !== 'both') return false
    if (professionFilter !== 'all' && th.profession !== professionFilter) return false
    return true
  })

  const hasActiveFilters =
    selectedPills.length > 0 ||
    availFilter !== 'all' ||
    consultFilter !== 'all' ||
    professionFilter !== 'all'

  const showDropdown = dropdownOpen && suggestions.length > 0

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-x" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>

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
            {' '}{lang === 'fr' ? 'à Paris' : 'in Paris'}
          </p>
        </div>

        {/* ── Specialty search with dropdown ── */}
        <div style={{ marginBottom: '20px' }}>
          <div ref={searchWrapperRef} style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              value={inputText}
              onChange={e => {
                setInputText(e.target.value)
                setDropdownOpen(true)
              }}
              onFocus={() => {
                if (inputText.trim()) setDropdownOpen(true)
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setDropdownOpen(false)
                  setInputText('')
                }
              }}
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
                borderRadius: showDropdown ? '8px 8px 0 0' : '8px',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                zIndex: 20,
                maxHeight: '260px',
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}>
                {suggestions.map((specialty, i) => {
                  const label = lang === 'en' ? (specialtyTranslations[specialty] ?? specialty) : specialty
                  const alreadySelected = selectedPills.includes(specialty)
                  return (
                    <button
                      key={specialty}
                      // onMouseDown + preventDefault prevents the input blur from firing
                      // before the click registers, which would close the dropdown first
                      onMouseDown={e => {
                        e.preventDefault()
                        if (!alreadySelected) selectSuggestion(specialty)
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '0.88rem',
                        fontFamily: 'Georgia, serif',
                        color: alreadySelected ? '#8A9BAD' : 'var(--text)',
                        background: 'none',
                        border: 'none',
                        borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: alreadySelected ? 'default' : 'pointer',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={e => {
                        if (!alreadySelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--blue-accent)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      {label}
                      {alreadySelected && (
                        <span style={{ fontSize: '0.72rem', color: '#8A9BAD', marginLeft: '8px' }}>
                          {lang === 'fr' ? '· déjà sélectionné' : '· already selected'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected specialty pills */}
          {selectedPills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedPills.map(pill => (
                <button
                  key={pill}
                  onClick={() => togglePill(pill)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 14px', borderRadius: '999px',
                    backgroundColor: 'var(--blue-primary)', color: 'white',
                    fontSize: '0.8rem', fontFamily: 'Georgia, serif',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {lang === 'en' ? (specialtyTranslations[pill] ?? pill) : pill}
                  <span style={{ fontSize: '1rem', lineHeight: 1, opacity: 0.8 }}>×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Filters — desktop: all pills in a row ── */}
        <div className="filter-desktop" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '32px' }}>
          <PillToggle label={lang === 'fr' ? 'Toutes disponibilités' : 'All availability'} active={availFilter === 'all'} onClick={() => setAvailFilter('all')} />
          <PillToggle label={lang === 'fr' ? 'Cette semaine' : 'This week'} active={availFilter === 'this_week'} onClick={() => setAvailFilter('this_week')} />
          <PillToggle label={lang === 'fr' ? 'Semaine prochaine' : 'Next week'} active={availFilter === 'next_week'} onClick={() => setAvailFilter('next_week')} />
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
          <PillToggle label={lang === 'fr' ? 'Présentiel & vidéo' : 'In-person & video'} active={consultFilter === 'all'} onClick={() => setConsultFilter('all')} />
          <PillToggle label={lang === 'fr' ? 'Présentiel' : 'In-person'} active={consultFilter === 'presentiel'} onClick={() => setConsultFilter('presentiel')} />
          <PillToggle label={lang === 'fr' ? 'Vidéo' : 'Video'} active={consultFilter === 'video'} onClick={() => setConsultFilter('video')} />
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
          <PillToggle label={lang === 'fr' ? 'Tous les thérapeutes' : 'All therapists'} active={professionFilter === 'all'} onClick={() => setProfessionFilter('all')} />
          <PillToggle label={lang === 'fr' ? 'Psychologues' : 'Psychologists'} active={professionFilter === 'Psychologue'} onClick={() => setProfessionFilter('Psychologue')} />
        </div>

        {/* ── Filters — mobile: one dropdown pill per group ── */}
        <div className="filter-mobile" style={{ marginBottom: '20px' }}>
          <FilterDropdown
            value={availFilter}
            onChange={v => setAvailFilter(v as typeof availFilter)}
            options={[
              { value: 'all', label: lang === 'fr' ? 'Disponibilités' : 'Availability' },
              { value: 'this_week', label: lang === 'fr' ? 'Cette semaine' : 'This week' },
              { value: 'next_week', label: lang === 'fr' ? 'Semaine prochaine' : 'Next week' },
            ]}
          />
          <FilterDropdown
            value={consultFilter}
            onChange={v => setConsultFilter(v as typeof consultFilter)}
            options={[
              { value: 'all', label: lang === 'fr' ? 'Format' : 'Format' },
              { value: 'presentiel', label: lang === 'fr' ? 'Présentiel' : 'In-person' },
              { value: 'video', label: 'Vidéo' },
            ]}
          />
          <FilterDropdown
            value={professionFilter}
            onChange={v => setProfessionFilter(v as typeof professionFilter)}
            options={[
              { value: 'all', label: lang === 'fr' ? 'Profession' : 'Profession' },
              { value: 'Psychologue', label: lang === 'fr' ? 'Psychologues' : 'Psychologists' },
            ]}
          />
        </div>

        {/* ── Result count ── */}
        <p style={{ fontSize: '0.78rem', color: '#8A9BAD', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>
          {filtered.length} {lang === 'fr' ? `résultat${filtered.length !== 1 ? 's' : ''}` : `result${filtered.length !== 1 ? 's' : ''}`}
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
              const applicableFee = isStudentVerified && therapist.student_price !== null
                ? therapist.student_price
                : therapist.consultation_fee
              const price = applicableFee ? applicableFee + 3 : null
              const hasStudentPrice = therapist.student_price !== null && therapist.student_price !== undefined
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
                      padding: '20px 12px',
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: isHovered ? 'var(--surface)' : 'transparent',
                      transition: 'background-color 0.15s',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="therapist-card-row" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                      {/* Left: photo */}
                      <div className="therapist-card-photo" style={{
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
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                          />
                        )}
                      </div>

                      {/* Center: name, specialty tags, bio excerpt, mobile price */}
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h2 style={{
                            fontSize: '1.1rem',
                            fontWeight: 400,
                            fontFamily: 'Georgia, serif',
                            color: 'var(--text)',
                            margin: 0,
                          }}>
                            {name}
                          </h2>
                          {/* Mobile price — shown only on mobile via CSS */}
                          {price && (
                            <span className="therapist-card-mobile-price" style={{
                              display: 'none',
                              fontSize: '1.1rem',
                              fontWeight: 300,
                              fontFamily: 'Georgia, serif',
                              color: 'var(--text)',
                              flexShrink: 0,
                              marginLeft: '8px',
                            }}>
                              {price}€
                            </span>
                          )}
                        </div>
                        {therapist.location && (
                          <p style={{ fontSize: '0.75rem', color: '#4A6070', fontFamily: 'Georgia, serif', margin: '0 0 6px' }}>
                            {therapist.location}
                          </p>
                        )}
                        {therapist.specialties && therapist.specialties.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                            {therapist.specialties.slice(0, 4).map(s => (
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
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          } as React.CSSProperties}>
                            {bio}
                          </p>
                        )}
                        <span style={{ display: 'block', marginTop: '10px', fontSize: '0.82rem', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif' }}>
                          {t.therapists.viewProfile} →
                        </span>
                      </div>

                      {/* Right: price col — hidden on mobile */}
                      <div className="therapist-card-price-col" style={{
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
                            <span style={{ fontSize: '1.7rem', fontWeight: 300, fontFamily: 'Georgia, serif', color: 'var(--text)', lineHeight: 1 }}>
                              {price}€
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#8A9BAD', fontFamily: 'Georgia, serif' }}>
                              {t.therapists.perSession}
                            </span>
                          </div>
                        )}
                        {therapist.sector && (
                          <p style={{ fontSize: '0.73rem', color: '#8A9BAD', fontFamily: 'Georgia, serif', margin: 0 }}>
                            {lang === 'fr' ? 'Secteur' : 'Sector'} {therapist.sector}
                          </p>
                        )}
                        {hasStudentPrice && (
                          <span style={{
                            fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px',
                            backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif',
                            whiteSpace: 'nowrap',
                          }}>
                            {lang === 'fr' ? 'Tarif étudiant disponible' : 'Student rate available'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

      </div>

    </main>
  )
}
