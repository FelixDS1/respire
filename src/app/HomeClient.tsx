'use client'

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
  profiles: { full_name: string | null }
}

interface Props {
  previewTherapist: PreviewTherapist | null
  previewSlots: Slot[]
}

function PreviewCard({ therapist, slots }: { therapist: PreviewTherapist; slots: Slot[] }) {
  const { lang } = useLanguage()
  const displayed = (therapist.consultation_fee ?? 0) + 4
  const outOfPocket = Math.max(displayed - 55, 6)

  return (
    <div style={{ background: '#EDE9E0', borderRadius: '20px', padding: '1.5rem 1.8rem' }}>
      <p style={{
        fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(44,40,32,0.4)', marginBottom: '0.75rem', fontFamily: 'Georgia, serif',
      }}>
        {lang === 'en' ? 'Available therapist' : 'Thérapeute disponible'}
      </p>

      <p style={{
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontSize: '1.5rem', fontWeight: 300, color: '#2C2820',
        marginBottom: '0.75rem', lineHeight: 1.2,
      }}>
        {therapist.profiles?.full_name}
      </p>

      {therapist.specialties && therapist.specialties.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
          {therapist.specialties.slice(0, 3).map(s => (
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

      {therapist.consultation_fee && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '1.5rem', fontWeight: 300, color: '#2C2820',
            }}>
              {displayed}€
            </span>
            <span style={{
              fontSize: '0.72rem', color: 'rgba(44,40,32,0.45)',
              fontFamily: 'system-ui, sans-serif', fontWeight: 300,
            }}>
              / {lang === 'en' ? 'session' : 'séance'}
            </span>
          </div>
          {therapist.sector && (
            <p style={{ fontSize: '0.72rem', color: '#7A9E7E', marginBottom: '1.2rem' }}>
              {lang === 'en'
                ? `≈ ${outOfPocket}€ out-of-pocket with Sécu + mutuelle`
                : `≈ ${outOfPocket}€ reste à charge avec Sécu + mutuelle`}
            </p>
          )}
        </>
      )}

      {slots.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
    </div>
  )
}

export default function HomeClient({ previewTherapist, previewSlots }: Props) {
  const { t, lang } = useLanguage()

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

          <h1 className="hero-title" style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '3.6rem', fontWeight: 300, lineHeight: 1.15,
            margin: '0 0 1.5rem 0',
          }}>
            <span style={{ whiteSpace: 'pre-line' }}>{heroMain} </span>
            <em style={{ fontStyle: 'italic', color: '#9C7B5A' }}>{heroLast}</em>
          </h1>

          <p style={{
            fontSize: '0.92rem', lineHeight: 1.85,
            color: 'rgba(44,40,32,0.6)', fontWeight: 300,
            maxWidth: '400px', marginBottom: '2rem',
          }}>
            {t.home.heroSubtitle}
          </p>

          <div className="home-cta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/therapists" style={{
              display: 'inline-block',
              padding: '15px 38px',
              backgroundColor: 'var(--blue-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontFamily: 'Georgia, serif',
            }}>
              {t.home.cta}
            </Link>
            <Link href="/pour-les-therapeutes" style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: 'transparent',
              color: 'var(--blue-primary)',
              borderRadius: '8px',
              border: '1px solid var(--blue-primary)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
            }}>
              {t.home.therapistCta}
            </Link>
          </div>
        </div>

        {/* Right column: preview card — hidden on mobile */}
        <div className="hide-mobile">
          {previewTherapist && (
            <PreviewCard therapist={previewTherapist} slots={previewSlots} />
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
          <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { num: '01', title: t.home.step1Title, body: t.home.step1Body },
              { num: '02', title: t.home.step2Title, body: t.home.step2Body },
              { num: '03', title: t.home.step3Title, body: t.home.step3Body },
            ].map(step => (
              <div key={step.num}>
                <div style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '5rem', fontWeight: 300, lineHeight: 1,
                  color: 'rgba(44,40,32,0.1)', marginBottom: '0.5rem',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '1.25rem', fontWeight: 400,
                  marginBottom: '0.6rem', color: '#2C2820',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '0.84rem', lineHeight: 1.8,
                  color: 'rgba(44,40,32,0.55)', fontWeight: 300,
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
              fontFamily: 'var(--font-cormorant), Georgia, serif',
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
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-block', fontFamily: 'Georgia, serif',
            }}>
              {lang === 'en' ? 'Create my account' : 'Créer mon compte'}
            </Link>
            <Link href="/pour-les-therapeutes" style={{
              background: 'transparent', color: 'rgba(242,239,232,0.6)',
              border: '0.5px solid rgba(242,239,232,0.25)',
              borderRadius: '999px', padding: '0.8rem 1.8rem',
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
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
