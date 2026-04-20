'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage, specialtyTranslations } from '@/lib/language'

interface Slot {
  id: string
  date: string
  start_time: string
}

interface PreviewTherapist {
  id: string
  consultation_fee: number | null
  sector: string | null
  specialties: string[] | null
  photo_url: string | null
  bio: string | null
  location: string | null
  profiles: { full_name: string | null }
}

interface PreviewItem {
  therapist: PreviewTherapist
  slots: Slot[]
}

interface Props {
  previews: PreviewItem[]
}

// Matches the listing card style exactly
function PreviewCard({ therapist, slots }: { therapist: PreviewTherapist; slots: Slot[] }) {
  const { lang, t } = useLanguage()
  const price = therapist.consultation_fee ? therapist.consultation_fee + 4 : null
  const reimbursement = price ? Math.max(price - 55, 6) : null
  const bio = lang === 'en' ? therapist.bio : therapist.bio

  return (
    <div style={{
      background: '#EDE9E0',
      borderRadius: '20px',
      padding: '1.5rem 1.8rem',
    }}>
      {/* Small muted label */}
      <p style={{
        fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(44,40,32,0.4)', marginBottom: '0.9rem', fontFamily: 'Georgia, serif',
      }}>
        {lang === 'en' ? 'Available therapist' : 'Thérapeute disponible'}
      </p>

      {/* Name — matches listing h2 */}
      <h2 style={{
        fontSize: '1.1rem', fontWeight: 400, fontFamily: 'Georgia, serif',
        color: 'var(--text)', margin: '0 0 4px 0',
      }}>
        {therapist.profiles?.full_name}
      </h2>

      {/* Location */}
      {therapist.location && (
        <p style={{ fontSize: '0.75rem', color: '#4A6070', fontFamily: 'Georgia, serif', margin: '0 0 8px' }}>
          {therapist.location}
        </p>
      )}

      {/* Specialty pills — exact listing style */}
      {therapist.specialties && therapist.specialties.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
          {therapist.specialties.slice(0, 4).map(s => (
            <span key={s} style={{
              fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px',
              backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)',
              fontFamily: 'Georgia, serif', whiteSpace: 'nowrap',
            }}>
              {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
            </span>
          ))}
        </div>
      )}

      {/* Bio excerpt — matches listing style */}
      {bio && (
        <p style={{
          fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.65,
          color: '#4A6070', fontFamily: 'Georgia, serif',
          margin: '0 0 8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {bio}
        </p>
      )}

      {/* Price + sector + reimbursement row — matches listing right col */}
      {price && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '3px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 300, fontFamily: 'Georgia, serif', color: 'var(--text)', lineHeight: 1 }}>
              {price}€
            </span>
            <span style={{ fontSize: '0.78rem', color: '#8A9BAD', fontFamily: 'Georgia, serif' }}>
              {t.therapists.perSession}
            </span>
          </div>
          {therapist.sector && (
            <p style={{ fontSize: '0.73rem', color: '#8A9BAD', fontFamily: 'Georgia, serif', margin: '0 0 5px' }}>
              {lang === 'fr' ? 'Secteur' : 'Sector'} {therapist.sector}
            </p>
          )}
          {reimbursement !== null && (
            <span style={{
              fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px',
              backgroundColor: '#EEFAF0', color: '#2E7D32', fontFamily: 'Georgia, serif',
              whiteSpace: 'nowrap', border: '1px solid #C8E6C9', display: 'inline-block',
            }}>
              ~{reimbursement}€ {lang === 'fr' ? 'après remboursement' : 'after reimbursement'}
            </span>
          )}
        </div>
      )}

      {/* Time slot pills */}
      {slots.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {slots.map((slot, i) => (
            <Link
              key={slot.id}
              href={`/book/${slot.id}`}
              style={{
                background: i === 0 ? '#9C7B5A' : '#F2EFE8',
                borderRadius: '999px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.72rem',
                border: `0.5px solid ${i === 0 ? '#9C7B5A' : 'rgba(44,40,32,0.15)'}`,
                color: i === 0 ? '#F2EFE8' : '#2C2820',
                textDecoration: 'none',
                fontFamily: 'Georgia, serif',
              }}
            >
              {slot.start_time.slice(0, 5)}
            </Link>
          ))}
        </div>
      )}

      {/* View profile link — matches listing style */}
      <Link
        href={`/therapists/${therapist.id}`}
        style={{ display: 'block', fontSize: '0.82rem', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', textDecoration: 'none' }}
      >
        {lang === 'fr' ? 'Voir le profil' : 'View profile'} →
      </Link>
    </div>
  )
}

export default function HomeClient({ previews }: Props) {
  const { t, lang } = useLanguage()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (previews.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIdx(i => (i + 1) % previews.length)
        setVisible(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [previews.length])

  const current = previews[currentIdx] ?? null

  // Split last word for italic styling
  const heroTitle = t.home.heroTitle
  const lastSpaceIdx = heroTitle.lastIndexOf(' ')
  const heroMain = heroTitle.slice(0, lastSpaceIdx)
  const heroLast = heroTitle.slice(lastSpaceIdx + 1)

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Subtle decorative background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.3, top: '-200px', right: '-120px' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.18, bottom: '-80px', left: '-100px' }} />
      </div>

      {/* ── Hero ── */}
      <section className="home-hero" style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1400px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '3rem', alignItems: 'center',
        padding: '5rem 3rem 4rem',
      }}>
        {/* Left column */}
        <div>
          <p style={{
            fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#9C7B5A', marginBottom: '1.5rem', fontFamily: 'Georgia, serif',
          }}>
            {lang === 'en' ? 'Paris · Therapy for everyone' : 'Paris · Thérapie pour tous'}
          </p>

          {/* H1 — Georgia, same as before, italic last word in brown */}
          <h1 className="hero-title" style={{
            fontFamily: 'Georgia, serif',
            fontSize: '3.4rem', fontWeight: 300, lineHeight: 1.2,
            margin: '0 0 1.5rem 0',
          }}>
            <span style={{ whiteSpace: 'pre-line' }}>{heroMain} </span>
            <em style={{ fontStyle: 'italic', color: '#9C7B5A' }}>{heroLast}</em>
          </h1>

          <p style={{
            fontSize: '0.92rem', lineHeight: 1.85,
            color: 'rgba(44,40,32,0.6)', fontWeight: 300,
            maxWidth: '400px', marginBottom: '2rem',
            fontFamily: 'Georgia, serif',
          }}>
            {t.home.heroSubtitle}
          </p>

          {/* CTA pills — same size, left filled brown, right outlined black */}
          <div className="home-cta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/therapists" style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: 'var(--blue-primary)',
              color: 'white',
              borderRadius: '999px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
              border: '2px solid var(--blue-primary)',
            }}>
              {t.home.cta}
            </Link>
            <Link href="/pour-les-therapeutes" style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: '#2C2820',
              borderRadius: '999px',
              border: '2px solid #2C2820',
              textDecoration: 'none',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
            }}>
              {t.home.therapistCta}
            </Link>
          </div>
        </div>

        {/* Right column: preview card — hidden on mobile, cycles between therapists */}
        <div className="hide-mobile" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          {current && (
            <PreviewCard therapist={current.therapist} slots={current.slots} />
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="home-hiw-section" style={{ position: 'relative', zIndex: 1, margin: '0 2rem' }}>
        <div className="home-hiw-inner" style={{ background: '#EDE9E0', borderRadius: '24px', padding: '4rem 3rem' }}>
          <p style={{
            fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(44,40,32,0.4)', marginBottom: '3rem', fontFamily: 'Georgia, serif',
          }}>
            {t.home.howItWorks}
          </p>
          <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {[
              { num: '01', title: t.home.step1Title, body: t.home.step1Body },
              { num: '02', title: t.home.step2Title, body: t.home.step2Body },
              { num: '03', title: t.home.step3Title, body: t.home.step3Body },
            ].map(step => (
              <div key={step.num}>
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '4rem', fontWeight: 300, lineHeight: 1,
                  color: 'rgba(44,40,32,0.12)', marginBottom: '0.75rem',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.4rem', fontWeight: 400,
                  marginBottom: '0.75rem', color: '#2C2820', lineHeight: 1.2,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '1.1rem', lineHeight: 1.75,
                  color: 'rgba(44,40,32,0.6)', fontWeight: 300,
                  fontFamily: 'Georgia, serif',
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="home-cta-strip" style={{ position: 'relative', zIndex: 1, margin: '2rem' }}>
        <div className="home-cta-strip-inner" style={{
          background: '#2C2820',
          borderRadius: '24px',
          padding: '3.5rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontSize: '0.8rem', color: 'rgba(242,239,232,0.45)',
              fontWeight: 300, marginBottom: '0.4rem', fontFamily: 'Georgia, serif',
            }}>
              {lang === 'en' ? 'Ready to start?' : 'Prêt à commencer ?'}
            </p>
            <h2 style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2.2rem', fontWeight: 300, fontStyle: 'italic',
              color: '#F2EFE8', lineHeight: 1.2, margin: 0,
            }}>
              {lang === 'en' ? 'You deserve to breathe.' : 'Vous avez le droit de respirer.'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              background: '#F2EFE8', color: '#2C2820',
              borderRadius: '999px', padding: '0.8rem 1.8rem',
              fontSize: '0.9rem', letterSpacing: '0.06em',
              textDecoration: 'none', display: 'inline-block', fontFamily: 'Georgia, serif',
              border: '2px solid #F2EFE8',
            }}>
              {lang === 'en' ? 'Create my account' : 'Créer mon compte'}
            </Link>
            <Link href="/pour-les-therapeutes" style={{
              background: 'transparent', color: 'rgba(242,239,232,0.7)',
              border: '1px solid rgba(242,239,232,0.3)',
              borderRadius: '999px', padding: '0.8rem 1.8rem',
              fontSize: '0.9rem', letterSpacing: '0.06em',
              textDecoration: 'none', display: 'inline-block', fontFamily: 'Georgia, serif',
            }}>
              {t.home.therapistCta}
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
