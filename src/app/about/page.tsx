'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const LILY_PINK = '#C4849A'

const content = {
  fr: {
    eyebrow: 'À propos',
    mission: 'Vous méritez de respirer.',
    subtitle: "La vie est parfois compliquée, stressante, on se force à vivre en courant. Quand on ralentit, on culpabilise de ne pas s'essouffler. Essayez de sortir de ce cercle vicieux. Prenez du temps pour vous, pour réfléchir à vous, pour respirer.",
    whyEyebrow: 'Pourquoi Respire existe',
    whyHeading: 'Simplifier le suivi psychologique.',
    whyBody: "Votre santé commence d'abord dans votre tête. Trouver une bonne relation patient(e)/psy est un travail incertain. Les plateformes qui existent pour faciliter cette tâche posent trop de questions fastidieuses, et manquent de transparence.",
    valuesEyebrow: 'Nos engagements',
    values: [
      'Être simples au niveau de nos (vos) démarches.',
      'Être honnêtes avec nos membres et nos thérapeutes.',
    ],
    founderEyebrow: 'Note du fondateur',
    founder: "Je m'appelle Félix, j'habite à Paris. Bien que j'ai toujours voulu trouver un(e) psy, j'ai longtemps eu peur de me lancer — et si je ne trouvais pas la/le psy qui me\u00a0correspondait\u00a0? Je pense que c'est un problème universel et j'ai créé Respire pour y répondre.",
    ctaHeading: 'Prêt à commencer ?',
    ctaMemberLabel: 'Créer mon compte',
    ctaTherapistLabel: 'Vous êtes thérapeute ?',
    contact: 'Contact',
    email: 'E-mail',
  },
  en: {
    eyebrow: 'About',
    mission: 'You deserve to breathe.',
    subtitle: "Life is sometimes complicated, stressful — we force ourselves to keep running. When we slow down, we feel guilty for not being out of breath. Try to break out of this vicious cycle. Take time for yourself, to reflect, to breathe.",
    whyEyebrow: 'Why Respire exists',
    whyHeading: 'Simplifying mental health care.',
    whyBody: "Your health starts in your head. Finding the right patient/therapist relationship is uncertain work. The platforms built to help with this ask too many tedious questions and lack transparency.",
    valuesEyebrow: 'Our commitments',
    values: [
      'To be simple when it comes to our (your) process.',
      'To be honest with our members and our therapists.',
    ],
    founderEyebrow: 'A note from the founder',
    founder: "My name is Félix, I live in Paris. Although I always wanted to find a therapist, I was always afraid to take the leap — what if I couldn't find the therapist who was\u00a0right\u00a0for\u00a0me? I think this is a universal problem and I created Respire to address it.",
    ctaHeading: 'Ready to start?',
    ctaMemberLabel: 'Create my account',
    ctaTherapistLabel: 'Are you a therapist?',
    contact: 'Contact',
    email: 'Email',
  },
}

function InflateBox({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
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
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', cursor: 'default', ...style }}
    >
      {children}
    </div>
  )
}

const bodyStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 300,
  lineHeight: 1.9,
  fontFamily: 'Georgia, serif',
  margin: 0,
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--blue-primary)',
  fontFamily: 'Georgia, serif',
  marginBottom: '20px',
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
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Background shapes ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '640px', height: '640px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.52, top: '-220px', right: '-130px' }} />
        <div style={{ position: 'absolute', width: '480px', height: '480px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.32, bottom: '8%', left: '-110px' }} />
        <div style={{ position: 'absolute', width: '340px', height: '340px', borderRadius: '70px', backgroundColor: 'var(--blue-accent)', opacity: 0.24, top: '33%', left: '20%', transform: 'rotate(25deg)' }} />
        <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.26, top: '10%', right: '26%' }} />
        <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.22, top: '58%', right: '18%' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.2, top: '20%', left: '5%' }} />
        <div style={{ position: 'absolute', width: '180px', height: '260px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.18, bottom: '30%', right: '36%', transform: 'rotate(-18deg)' }} />
        <div style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', border: '2px solid var(--blue-primary)', opacity: 0.12, top: '52%', left: '9%' }} />
        <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '20px', backgroundColor: 'var(--green-soft)', opacity: 0.22, bottom: '22%', right: '11%', transform: 'rotate(15deg)' }} />
      </div>

      {/* ── Hero ── */}
      <section className="about-section" style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', padding: '72px 56px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
            {c.eyebrow}
          </p>
          <h1 className="about-hero-title" style={{ fontSize: '4rem', fontWeight: 300, lineHeight: 1.15, fontFamily: 'Georgia, serif', margin: 0 }}>
            {c.mission}
          </h1>
        </div>

        <InflateBox className="about-hero-panel about-box" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 56px' }}>
          <p style={{ ...bodyStyle, color: '#4A6070', textAlign: 'center' }}>
            {c.subtitle}
          </p>
        </InflateBox>
      </section>

      {/* ── Why we exist ── */}
      <section className="about-section" style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', padding: '0 56px 40px' }}>
        <div className="about-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '24px' }}>
          <InflateBox className="about-box" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 40px' }}>
            <p style={labelStyle}>{c.whyEyebrow}</p>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 300, lineHeight: 1.3, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.whyHeading}
            </h2>
          </InflateBox>

          <InflateBox className="about-box" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ ...bodyStyle, color: '#4A6070' }}>
              {c.whyBody}
            </p>
          </InflateBox>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-section" style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', padding: '0 56px 40px' }}>
        <p style={labelStyle}>{c.valuesEyebrow}</p>
        <div style={{ position: 'relative' }}>
          <div className="about-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', perspective: '1000px', position: 'relative', zIndex: 1 }}>
            <InflateBox className="about-box" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '44px 40px', boxShadow: '0 2px 16px rgba(44,26,14,0.06)' }}>
              <span className="about-deco-number" style={{ display: 'block', fontSize: '4rem', fontWeight: 300, color: 'var(--border)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '24px', userSelect: 'none' }}>01</span>
              <p style={{ ...bodyStyle, color: 'var(--text)', fontWeight: 400 }}>{c.values[0]}</p>
            </InflateBox>

            <InflateBox className="about-box" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '44px 40px', boxShadow: '0 2px 16px rgba(44,26,14,0.06)' }}>
              <span className="about-deco-number" style={{ display: 'block', fontSize: '4rem', fontWeight: 300, color: 'var(--border)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '24px', userSelect: 'none' }}>02</span>
              <p style={{ ...bodyStyle, color: 'var(--text)', fontWeight: 400 }}>{c.values[1]}</p>
            </InflateBox>
          </div>
        </div>
      </section>

      {/* ── Steps + Founder, CTA & Contact ── */}
      <section className="about-section" style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', padding: '0 56px 72px' }}>
        <div className="about-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '24px', alignItems: 'stretch' }}>

          {/* Left: stacked steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map((step) => (
              <InflateBox
                key={step.number}
                className="about-box"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 2px 16px rgba(44,26,14,0.06)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--border)', fontFamily: 'Georgia, serif', lineHeight: 1, flexShrink: 0 }}>
                    {step.number}
                  </span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.3 }}>
                    {step.title}
                  </p>
                </div>
                <p style={{ ...bodyStyle, fontSize: '0.95rem', color: '#4A6070' }}>
                  {step.body}
                </p>
              </InflateBox>
            ))}
          </div>

          {/* Right: founder note + CTA + contact */}
          <InflateBox className="about-box" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '52px 48px', boxShadow: '0 2px 16px rgba(44,26,14,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ ...labelStyle, fontSize: '0.9rem' }}>{c.founderEyebrow}</p>
              <p style={{ ...bodyStyle, color: '#4A6070', marginBottom: '16px' }}>
                {c.founder}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '16px' }}>
              <p style={{ ...bodyStyle, fontSize: '1.4rem', color: 'var(--text)', marginBottom: '16px' }}>
                {c.ctaHeading}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/signup" style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: 'var(--blue-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>
                  {c.ctaMemberLabel.toUpperCase()}
                </Link>
                <Link href="/pour-les-therapeutes" style={{ display: 'inline-block', padding: '11px 28px', backgroundColor: 'transparent', color: 'var(--blue-primary)', borderRadius: '8px', border: '1px solid var(--blue-primary)', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>
                  {c.ctaTherapistLabel.toUpperCase()}
                </Link>
              </div>

              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A9BAD', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>
                {c.email}
              </p>
              <p style={{ ...bodyStyle, fontSize: '0.95rem', color: '#4A6070' }}>
                contact@respire.fr
              </p>
            </div>
          </InflateBox>
        </div>
      </section>

    </main>
  )
}
