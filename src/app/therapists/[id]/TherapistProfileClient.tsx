'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'
import { createClient } from '@/lib/supabase'

function MonSoutienPill() {
  const [show, setShow] = useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        display: 'inline-block',
        fontSize: '0.72rem', padding: '3px 9px', borderRadius: '20px',
        backgroundColor: 'var(--green-soft)', color: 'var(--green-primary)',
        fontFamily: 'Georgia, serif', whiteSpace: 'nowrap', cursor: 'default',
      }}>
        Partenaire Mon Soutien Psy
      </span>
      {show && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#2C2820', color: '#F2EFE8',
          fontSize: '0.72rem', fontFamily: 'Georgia, serif',
          padding: '6px 10px', borderRadius: '8px',
          whiteSpace: 'nowrap', zIndex: 40,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>
          20€ après remboursement sécu / 0€ avec votre mutuelle
        </span>
      )}
    </span>
  )
}

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
  student_price: number | null
  languages: string[] | null
  location: string | null
  sector: string | null
  is_verified: boolean
  is_mon_soutien_psy: boolean | null
  diploma_institution: string | null
  profiles: {
    full_name: string | null
    email: string | null
  }
}

interface Props {
  therapist: Therapist
  byDate: Record<string, Slot[]>
  stripeReady: boolean
  isStudentVerified?: boolean
}

export default function TherapistProfileClient({ therapist, byDate, stripeReady, isStudentVerified = false }: Props) {
  const { t, lang } = useLanguage()
  const [onWaitlist, setOnWaitlist] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  // Calendar state — start on first month that has availability, or today
  const firstAvailable = Object.keys(byDate).sort()[0]
  const initialMonth = firstAvailable
    ? new Date(firstAvailable + 'T00:00:00')
    : new Date()
  initialMonth.setDate(1)
  const [calendarMonth, setCalendarMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState<string | null>(firstAvailable ?? null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return
      supabase.from('waitlist')
        .select('id')
        .eq('patient_id', user.id)
        .eq('therapist_id', therapist.id)
        .maybeSingle()
        .then(({ data }: { data: { id: string } | null }) => { if (data) setOnWaitlist(true) })
    })
  }, [therapist.id])

  async function toggleWaitlist() {
    setWaitlistLoading(true)
    try {
      const method = onWaitlist ? 'DELETE' : 'POST'
      const res = await fetch('/api/waitlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId: therapist.id }),
      })
      if (res.ok) {
        setOnWaitlist(!onWaitlist)
        if (!onWaitlist) setWaitlistDone(true)
      }
    } finally {
      setWaitlistLoading(false)
    }
  }

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
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="page-x" style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 56px', flex: 1 }}>

        {/* Top section: large photo + info side by side */}
        <div className="profile-top" style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div className="profile-photo-wrap" style={{ flexShrink: 0, width: '240px', height: '280px', backgroundColor: 'var(--blue-accent)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            {therapist.photo_url && (
              <img
                src={therapist.photo_url}
                alt={therapist.profiles?.full_name ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--text)', margin: 0 }}>
                {therapist.profiles?.full_name ?? 'Thérapeute'}
              </h1>
              {(therapist.profiles?.full_name === 'Sylvain Loup' || therapist.profiles?.full_name === 'Sophie Martin') && (
                <span style={{
                  fontSize: '0.65rem', padding: '3px 9px', borderRadius: '20px',
                  backgroundColor: 'rgba(44,40,32,0.08)', color: 'rgba(44,40,32,0.45)',
                  fontFamily: 'Georgia, serif', letterSpacing: '0.05em',
                }}>
                  compte exemple
                </span>
              )}
            </div>
            {therapist.location && (
              <p style={{ fontSize: '0.95rem', color: '#4A6070', marginBottom: '4px' }}>{therapist.location}</p>
            )}
            {therapist.languages && therapist.languages.length > 0 && (
              <p style={{ fontSize: '0.95rem', color: '#4A6070', marginBottom: '20px' }}>
                {t.profile.languages} : {therapist.languages.join(', ')}
              </p>
            )}

            {therapist.specialties && therapist.specialties.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue-primary)', marginBottom: '12px' }}>
                  {t.profile.specialties}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {therapist.specialties.map((s) => (
                    <span key={s} style={{ fontSize: '0.9rem', padding: '6px 14px', backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', borderRadius: '4px' }}>
                      {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {bio && (
              <div style={{ marginBottom: therapist.diploma_institution ? '20px' : undefined }}>
                <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue-primary)', marginBottom: '12px' }}>
                  {t.profile.about}
                </h2>
                <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.9, color: 'var(--text)' }}>
                  {bio}
                </p>
              </div>
            )}

            {therapist.diploma_institution && (
              <div>
                <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue-primary)', marginBottom: '8px' }}>
                  {lang === 'fr' ? 'Formation' : 'Education'}
                </h2>
                <p style={{ fontSize: '0.95rem', fontWeight: 300, color: 'var(--text)' }}>
                  {therapist.diploma_institution}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom section: price + calendar as a row */}
        <div className="profile-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '40px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>

          {/* Price info */}
          <div>
            {therapist.consultation_fee && (() => {
              const applicableFee = isStudentVerified && therapist.student_price !== null
                ? therapist.student_price!
                : therapist.consultation_fee!
              const displayedPrice = applicableFee
              return (
                <>
                  <p style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text)', marginBottom: '4px' }}>
                    {displayedPrice}€
                    <span style={{ fontSize: '0.9rem', marginLeft: '6px', color: '#4A6070' }}>{t.profile.perSession}</span>
                  </p>
                  {isStudentVerified && therapist.student_price !== null && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', marginBottom: '4px' }}>
                      {lang === 'fr' ? 'Tarif étudiant appliqué' : 'Student rate applied'}
                    </p>
                  )}
                  {!isStudentVerified && therapist.student_price !== null && (
                    <p style={{ fontSize: '0.75rem', color: '#4A6070', marginBottom: '4px' }}>
                      {lang === 'fr'
                        ? `Tarif étudiant : ${therapist.student_price}€`
                        : `Student rate: ${therapist.student_price}€`}
                    </p>
                  )}
                </>
              )
            })()}
            {therapist.is_mon_soutien_psy && (
              <div style={{ marginTop: '6px' }}>
                <MonSoutienPill />
              </div>
            )}

            {/* Waitlist */}
            <div style={{ marginTop: '16px' }}>
              {waitlistDone ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--blue-primary)' }}>
                  {lang === 'fr' ? '✓ Vous êtes sur la liste d\'attente' : '✓ You\'re on the waitlist'}
                </p>
              ) : (
                <button
                  onClick={toggleWaitlist}
                  disabled={waitlistLoading}
                  style={{ fontSize: '0.85rem', color: onWaitlist ? '#8A9BAD' : 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: waitlistLoading ? 0.4 : 1 }}
                >
                  {waitlistLoading
                    ? '...'
                    : onWaitlist
                      ? (lang === 'fr' ? 'Quitter la liste d\'attente' : 'Leave waitlist')
                      : (lang === 'fr' ? 'Aucun créneau ? Rejoindre la liste d\'attente →' : 'No slot? Join the waitlist →')}
                </button>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div>

            <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--blue-primary)' }}>
              {t.profile.availability}
            </h2>

            {!stripeReady ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>
                {lang === 'fr'
                  ? 'Ce thérapeute n\'accepte pas encore de réservations en ligne.'
                  : 'This therapist is not yet accepting online bookings.'}
              </p>
            ) : Object.keys(byDate).length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>{t.profile.noSlots}</p>
            ) : (() => {
              const year = calendarMonth.getFullYear()
              const month = calendarMonth.getMonth()
              const firstDay = new Date(year, month, 1).getDay()
              // Sunday=0 → shift so Monday=0
              const startOffset = (firstDay + 6) % 7
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const monthLabel = calendarMonth.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { month: 'long', year: 'numeric' })
              const today = new Date().toISOString().slice(0, 10)

              const cells: (number | null)[] = [
                ...Array(startOffset).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ]

              const dayHeaders = lang === 'en'
                ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                : ['L', 'M', 'M', 'J', 'V', 'S', 'D']

              return (
                <div>
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                      className="text-xs px-1 hover:opacity-60"
                      style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ←
                    </button>
                    <span className="text-xs capitalize" style={{ color: 'var(--text)' }}>{monthLabel}</span>
                    <button
                      onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                      className="text-xs px-1 hover:opacity-60"
                      style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      →
                    </button>
                  </div>

                  {/* Day headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
                    {dayHeaders.map((d, i) => (
                      <div key={i} className="text-center" style={{ fontSize: '0.6rem', color: '#8A9BAC', padding: '2px 0' }}>{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} />
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const hasSlots = !!byDate[dateStr]
                      const isSelected = dateStr === selectedDate
                      const isPast = dateStr < today
                      return (
                        <button
                          key={i}
                          disabled={!hasSlots || isPast}
                          onClick={() => setSelectedDate(dateStr)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '5px 0',
                            textAlign: 'center',
                            cursor: hasSlots && !isPast ? 'pointer' : 'default',
                            backgroundColor: isSelected
                              ? 'var(--blue-primary)'
                              : hasSlots && !isPast
                                ? 'var(--blue-accent)'
                                : 'transparent',
                            color: isSelected
                              ? 'white'
                              : hasSlots && !isPast
                                ? 'var(--blue-primary)'
                                : '#C0CDD6',
                            border: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>

                  {/* Time slots for selected date */}
                  {selectedDate && byDate[selectedDate] && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs mb-2 capitalize" style={{ color: '#4A6070' }}>
                        {formatDate(selectedDate)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {byDate[selectedDate].map((slot) => (
                          <Link
                            key={slot.id}
                            href={`/book/${slot.id}`}
                            className="text-xs px-3 py-1 transition-colors hover:opacity-80"
                            style={{
                              border: '1px solid var(--blue-primary)',
                              color: 'var(--blue-primary)',
                              backgroundColor: 'var(--surface)',
                            }}
                          >
                            {formatTime(slot.start_time)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Waitlist */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              {waitlistDone ? (
                <p className="text-xs" style={{ color: 'var(--blue-primary)' }}>
                  {lang === 'fr' ? '✓ Vous êtes sur la liste d\'attente' : '✓ You\'re on the waitlist'}
                </p>
              ) : (
                <button
                  onClick={toggleWaitlist}
                  disabled={waitlistLoading}
                  className="text-xs hover:opacity-70 transition-opacity disabled:opacity-40"
                  style={{ color: onWaitlist ? '#8A9BAD' : 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {waitlistLoading
                    ? '...'
                    : onWaitlist
                      ? (lang === 'fr' ? 'Quitter la liste d\'attente' : 'Leave waitlist')
                      : (lang === 'fr' ? 'Aucun créneau disponible ? Rejoindre la liste d\'attente →' : 'No slot available? Join the waitlist →')}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

    </main>
  )
}
