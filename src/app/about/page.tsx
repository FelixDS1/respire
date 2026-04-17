'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

// Blue gradient tones — each step slightly lighter
const STEP_GRADIENTS = [
  'linear-gradient(135deg, #0F1F35 0%, #1B3D5F 100%)',
  'linear-gradient(135deg, #1B3D5F 0%, #235F8A 100%)',
  'linear-gradient(135deg, #235F8A 0%, #2E7DB5 100%)',
]
// Dark navy used for second value card (same as hero panel)
const DARK_NAVY = '#1C2B3A'

const content = {
  fr: {
    eyebrow: 'À propos',
    mission: 'Vous méritez\nde respirer.',
    subtitleLarge: 'La vie est parfois compliquée, stressante, on se force à vivre en courant.',
    subtitleSmall: "Quand on ralentit, on culpabilise de ne pas s'essouffler. Essayez de sortir de ce cercle vicieux. Prenez du temps pour vous, pour réfléchir à vous, pour respirer.",
    whyEyebrow: 'Pourquoi Respire existe',
    whyHeading: 'Simplifier le suivi psychologique.',
    whyBody: "Votre santé commence d'abord dans votre tête. Trouver une bonne relation patient(e)/psy est un travail incertain. Les plateformes qui existent pour faciliter cette tâche posent trop de questions fastidieuses, et manquent de transparence.",
    valuesEyebrow: 'Nos engagements',
    values: [
      'Être simples au niveau de nos (vos) démarches.',
      'Être honnêtes avec nos membres et nos thérapeutes.',
    ],
    founderEyebrow: 'Note du fondateur',
    founder: "Je m'appelle Félix, j'habite à Paris. Bien que j'ai toujours voulu trouver un(e) psy, j'ai toujours eu peur de me lancer — et si je ne trouvais pas la/le psy qui me\u00a0correspondait\u00a0? J'ai créé Respire pour répondre à ma crainte.",
    founderName: '— Félix, fondateur',
    ctaHeading: 'Prêt à commencer ?',
    ctaMemberLabel: 'Créer mon compte',
    ctaTherapistLabel: 'Vous êtes thérapeute ?',
    contact: 'Contact',
    email: 'E-mail',
  },
  en: {
    eyebrow: 'About',
    mission: 'You deserve\nto breathe.',
    subtitleLarge: 'Life is sometimes complicated, stressful — we force ourselves to keep running.',
    subtitleSmall: "When we slow down, we feel guilty for not being out of breath. Try to break out of this vicious cycle. Take time for yourself, to reflect, to breathe.",
    whyEyebrow: 'Why Respire exists',
    whyHeading: 'Simplifying mental health care.',
    whyBody: "Your health starts in your head. Finding the right patient/therapist relationship is uncertain work. The platforms built to help with this ask too many tedious questions and lack transparency.",
    valuesEyebrow: 'Our commitments',
    values: [
      'To be simple when it comes to our (your) process.',
      'To be honest with our members and our therapists.',
    ],
    founderEyebrow: 'A note from the founder',
    founder: "My name is Félix, I live in Paris. Although I always wanted to find a therapist, I was always afraid to take the leap — what if I couldn't find the therapist who was\u00a0right\u00a0for\u00a0me? I created Respire to answer that fear.",
    founderName: '— Félix, founder',
    ctaHeading: 'Ready to start?',
    ctaMemberLabel: 'Create my account',
    ctaTherapistLabel: 'Are you a therapist?',
    contact: 'Contact',
    email: 'Email',
  },
}

function InflateBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height
    const intensity = Math.sqrt(dx * dx + dy * dy)
    el.style.transform = `translate(${dx * 8 * intensity}px, ${dy * 8 * intensity}px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.03)`
    el.style.transition = 'transform 0.1s ease-out'
  }

  function handleMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0,0) rotateX(0) rotateY(0) scale(1)'
    el.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', cursor: 'default', ...style }}
    >
      {children}
    </div>
  )
}

export default function About() {
  const { lang, t } = useLanguage()
  const c = content[lang as 'fr' | 'en'] ?? content.fr

  const steps = [
    { number: '1', title: t.home.step1Title, body: t.home.step1Body },
    { number: '2', title: t.home.step2Title, body: t.home.step2Body },
    { number: '3', title: t.home.step3Title, body: t.home.step3Body },
  ]

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '72px 56px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '52px 0' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>
              {c.eyebrow}
            </p>
            <h1 style={{ fontSize: '4rem', fontWeight: 300, lineHeight: 1.15, fontFamily: 'Georgia, serif', whiteSpace: 'pre-line', margin: 0 }}>
              {c.mission}
            </h1>
          </div>

          <InflateBox style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: DARK_NAVY, borderRadius: '16px', padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px', height: '100%', boxSizing: 'border-box' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.65, color: 'rgba(255,255,255,0.92)', fontFamily: 'Georgia, serif', margin: 0 }}>
                {c.subtitleLarge}
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif', margin: 0 }}>
                {c.subtitleSmall}
              </p>
            </div>
          </InflateBox>
        </div>
      </section>

      {/* ── Why we exist ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '24px' }}>
          <InflateBox style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 40px' }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
              {c.whyEyebrow}
            </p>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 300, lineHeight: 1.3, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.whyHeading}
            </h2>
          </InflateBox>

          <InflateBox style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.whyBody}
            </p>
          </InflateBox>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px 40px' }}>
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
          {c.valuesEyebrow}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', perspective: '1000px' }}>
          {/* Value 1 — light surface */}
          <InflateBox style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '44px 40px', boxShadow: '0 2px 16px rgba(28,43,58,0.06)' }}>
            <span style={{ display: 'block', fontSize: '4rem', fontWeight: 300, color: 'var(--border)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '24px', userSelect: 'none' }}>
              01
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.5, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.values[0]}
            </p>
          </InflateBox>

          {/* Value 2 — dark navy */}
          <InflateBox style={{ backgroundColor: DARK_NAVY, borderRadius: '16px', padding: '44px 40px', boxShadow: '0 2px 16px rgba(28,43,58,0.12)' }}>
            <span style={{ display: 'block', fontSize: '4rem', fontWeight: 300, color: 'rgba(255,255,255,0.15)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '24px', userSelect: 'none' }}>
              02
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.values[1]}
            </p>
          </InflateBox>
        </div>
      </section>

      {/* ── Steps (left) + Founder & CTA (right) ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '24px', alignItems: 'start' }}>

          {/* Left: stacked blue gradient steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', perspective: '1000px' }}>
            {steps.map((step, i) => (
              <InflateBox
                key={step.number}
                style={{ background: STEP_GRADIENTS[i], borderRadius: '16px', padding: '28px 32px', boxShadow: '0 2px 16px rgba(15,31,53,0.18)' }}
              >
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '10px' }}>
                  {step.number}
                </span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: 'white', fontFamily: 'Georgia, serif', marginBottom: '6px' }}>
                  {step.title}
                </p>
                <p style={{ fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', margin: 0 }}>
                  {step.body}
                </p>
              </InflateBox>
            ))}
          </div>

          {/* Right: founder note + CTA integrated */}
          <InflateBox style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '52px 48px', boxShadow: '0 2px 16px rgba(28,43,58,0.06)' }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', marginBottom: '24px' }}>
              {c.founderEyebrow}
            </p>
            <p style={{ fontSize: '1.15rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '20px' }}>
              {c.founder}
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', marginBottom: '36px' }}>
              {c.founderName}
            </p>

            {/* CTA integrated below founder note */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--text)', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>
                {c.ctaHeading}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/signup" style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: 'var(--blue-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>
                  {c.ctaMemberLabel.toUpperCase()}
                </Link>
                <Link href="/pour-les-therapeutes" style={{ display: 'inline-block', padding: '11px 28px', backgroundColor: 'transparent', color: 'var(--blue-primary)', borderRadius: '8px', border: '1px solid var(--blue-primary)', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>
                  {c.ctaTherapistLabel.toUpperCase()}
                </Link>
              </div>
            </div>
          </InflateBox>
        </div>
      </section>

      {/* Contact */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 56px 80px' }}>
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
          {c.contact}
        </p>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A9BAD', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
          {c.email}
        </p>
        <p style={{ fontSize: '1.1rem', fontFamily: 'Georgia, serif', color: 'var(--text)', fontWeight: 300 }}>
          contact@respire.fr
        </p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#4A6070', fontFamily: 'Georgia, serif' }}>
          <span>© 2026 Respire</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/privacy" style={{ color: '#4A6070', textDecoration: 'none' }}>{t.footer.privacy}</Link>
            <Link href="/terms" style={{ color: '#4A6070', textDecoration: 'none' }}>{t.footer.terms}</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
