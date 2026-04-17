'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const content = {
  fr: {
    eyebrow: 'À propos',
    mission: 'Vous méritez\nde respirer.',
    subtitleLarge: 'La vie est compliquée, stressante, on se force à vivre en courant.',
    subtitleSmall: "Quand on ralentit, on culpabilise de ne pas s'essouffler. Essayez de sortir de ce cercle vicieux, de temps en temps. Prenez du temps pour vous, pour réfléchir à vous, pour respirer.",
    whyEyebrow: 'Pourquoi Respire existe',
    whyHeading: 'Simplifier le suivi psychologique.',
    whyBody: "Votre santé commence d'abord dans votre tête. Trouver une bonne relation patient(e)/psy est un travail incertain. Les plateformes qui existent pour faciliter cette tâche posent trop de questions fastidieuses, et manquent de transparence.",
    whyClose: 'Chez Respire, on simplifie.',
    valuesEyebrow: 'Nos engagements',
    values: [
      'Être simples au niveau de nos (vos) démarches.',
      'Être honnêtes avec nos membres et nos thérapeutes.',
    ],
    founderEyebrow: 'Note du fondateur',
    founder: "Je m'appelle Félix, j'habite à Paris. Bien que j'ai toujours voulu trouver un(e) psy, j'ai toujours eu peur de me lancer — et si je ne trouvais pas la/le psy qui me correspondait ? J'ai créé Respire pour répondre à ma crainte.",
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
    subtitleLarge: 'Life is complicated, stressful — we force ourselves to keep running.',
    subtitleSmall: "When we slow down, we feel guilty for not being out of breath. Try to break out of this vicious cycle, from time to time. Take time for yourself, to reflect, to breathe.",
    whyEyebrow: 'Why Respire exists',
    whyHeading: 'Simplifying mental health care.',
    whyBody: "Your health starts in your head. Finding the right patient/therapist relationship is uncertain work. The platforms built to help with this ask too many tedious questions and lack transparency.",
    whyClose: 'At Respire, we keep it simple.',
    valuesEyebrow: 'Our commitments',
    values: [
      'To be simple when it comes to our (your) process.',
      'To be honest with our members and our therapists.',
    ],
    founderEyebrow: 'A note from the founder',
    founder: "My name is Félix, I live in Paris. Although I always wanted to find a therapist, I was always afraid to take the leap — what if I couldn't find the therapist who was right for me? I created Respire to answer that fear.",
    founderName: '— Félix, founder',
    ctaHeading: 'Ready to start?',
    ctaMemberLabel: 'Create my account',
    ctaTherapistLabel: 'Are you a therapist?',
    contact: 'Contact',
    email: 'Email',
  },
}

export default function About() {
  const { lang, t } = useLanguage()
  const c = content[lang as 'fr' | 'en'] ?? content.fr

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── Hero: mission left, dark subtitle panel right ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '420px' }}>

          {/* Left: label + big heading */}
          <div style={{ padding: '72px 56px 72px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>
              {c.eyebrow}
            </p>
            <h1 style={{ fontSize: '4rem', fontWeight: 300, lineHeight: 1.15, fontFamily: 'Georgia, serif', whiteSpace: 'pre-line', margin: 0 }}>
              {c.mission}
            </h1>
          </div>

          {/* Right: dark panel */}
          <div style={{ backgroundColor: 'var(--text)', padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
            <p style={{ fontSize: '1.45rem', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.subtitleLarge}
            </p>
            <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.subtitleSmall}
            </p>
          </div>
        </div>
      </section>

      {/* ── Why we exist: narrow label+heading left, body right ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', borderTop: '1px solid var(--border)' }}>

          {/* Left */}
          <div style={{ padding: '56px 48px 56px 0', borderRight: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
              {c.whyEyebrow}
            </p>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 300, lineHeight: 1.3, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.whyHeading}
            </h2>
          </div>

          {/* Right */}
          <div style={{ padding: '56px 0 56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.whyBody}
            </p>
            <p style={{ fontSize: '1.05rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.whyClose}
            </p>
          </div>
        </div>
      </section>

      {/* ── Values: numbered cards in a bordered container ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px 72px' }}>
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          {c.valuesEyebrow}
        </p>
        <div style={{ border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {c.values.map((v, i) => (
            <div
              key={i}
              style={{
                padding: '44px 40px 40px',
                borderRight: i === 0 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--surface)',
              }}
            >
              <span style={{
                display: 'block',
                fontSize: '4rem',
                fontWeight: 300,
                color: 'var(--border)',
                fontFamily: 'Georgia, serif',
                lineHeight: 1,
                marginBottom: '24px',
                userSelect: 'none',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.5, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>
                {v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Founder: brown panel left with F, text right ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr' }}>

          {/* Left: coloured panel with big F */}
          <div style={{
            backgroundColor: 'var(--blue-primary)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            padding: '48px 44px',
            minHeight: '360px',
          }}>
            <span style={{
              fontSize: '14rem',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.15)',
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
              userSelect: 'none',
            }}>
              F
            </span>
          </div>

          {/* Right: founder text */}
          <div style={{ padding: '52px 0 52px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.founderEyebrow}
            </p>
            <p style={{ fontSize: '1.15rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 }}>
              {c.founder}
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {c.founderName}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px 80px' }}>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '52px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>
            {c.ctaHeading}
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                backgroundColor: 'var(--blue-primary)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.04em',
              }}
            >
              {c.ctaMemberLabel.toUpperCase()}
            </Link>
            <Link
              href="/pour-les-therapeutes"
              style={{
                display: 'inline-block',
                padding: '11px 28px',
                backgroundColor: 'transparent',
                color: 'var(--blue-primary)',
                borderRadius: '8px',
                border: '1px solid var(--blue-primary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.04em',
              }}
            >
              {c.ctaTherapistLabel.toUpperCase()}
            </Link>
          </div>
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
