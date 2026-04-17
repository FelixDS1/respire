'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const content = {
  fr: {
    eyebrow: 'À propos',
    mission: 'Vous méritez de respirer.',
    whyTitle: 'Pourquoi Respire existe',
    why: [
      'Respire existe pour simplifier le suivi psychologique.',
      "Votre santé commence d'abord dans votre tête. Trouver une bonne relation patient/psy est un travail incertain. Les plateformes qui existent pour faciliter cette tâche posent trop de questions fastidieuses, et manquent de transparence.",
      'Chez Respire, on simplifie.',
    ],
    valuesTitle: 'Nos engagements',
    values: [
      'Être simples au niveau des démarches.',
      'Être honnêtes avec nos membres et nos thérapeutes.',
    ],
    founderTitle: 'Note du fondateur',
    founder: "Je m'appelle Félix, j'habite à Paris. Bien que j'ai toujours voulu trouver un(e) psy, j'ai toujours eu peur de me lancer — et si je ne trouvais pas la bonne personne pour moi ? J'ai créé Respire pour répondre à cette crainte.",
    founderName: '— Félix',
    ctaMemberLabel: 'Créer mon compte',
    ctaTherapistLabel: 'Vous êtes thérapeute ?',
    contact: 'Contact',
    email: 'E-mail',
  },
  en: {
    eyebrow: 'About',
    mission: 'You deserve to breathe.',
    whyTitle: 'Why Respire exists',
    why: [
      'Respire exists to simplify mental health care.',
      'Your health starts in your head. Finding the right therapist is uncertain work. The platforms built to help with this ask too many tedious questions and lack transparency.',
      'At Respire, we keep it simple.',
    ],
    valuesTitle: 'Our commitments',
    values: [
      'To be simple — no unnecessary steps.',
      'To be honest with our members and our therapists.',
    ],
    founderTitle: 'A note from the founder',
    founder: "My name is Félix, I live in Paris. Although I always wanted to find a therapist, I was always afraid to take the leap — what if I didn't find the right person for me? I created Respire to answer that fear.",
    founderName: '— Félix',
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

      {/* Mission */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 56px 56px' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
          {c.eyebrow}
        </p>
        <h1 style={{ fontSize: '3.4rem', fontWeight: 300, lineHeight: 1.2, marginBottom: '0', fontFamily: 'Georgia, serif' }}>
          {c.mission}
        </h1>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Why we exist */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '52px 56px' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue-primary)', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>
          {c.whyTitle}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {c.why.map((para, i) => (
            <p key={i} style={{
              fontSize: i === 0 ? '1.35rem' : '1.05rem',
              fontWeight: 300,
              lineHeight: 1.9,
              color: i === 2 ? 'var(--blue-primary)' : '#4A6070',
              fontFamily: 'Georgia, serif',
              fontStyle: i === 2 ? 'italic' : 'normal',
            }}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Values */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '52px 56px' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue-primary)', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>
          {c.valuesTitle}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {c.values.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ color: 'var(--blue-primary)', fontFamily: 'Georgia, serif', fontSize: '1.2rem', lineHeight: 1.6, flexShrink: 0 }}>—</span>
              <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.8, color: '#4A6070', fontFamily: 'Georgia, serif', margin: 0 }}>
                {v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Founder's note */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '52px 56px' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue-primary)', marginBottom: '28px', fontFamily: 'Georgia, serif' }}>
          {c.founderTitle}
        </h2>
        <blockquote style={{ margin: 0, padding: '0 0 0 24px', borderLeft: '2px solid var(--blue-primary)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '16px' }}>
            {c.founder}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--blue-primary)', fontFamily: 'Georgia, serif' }}>
            {c.founderName}
          </p>
        </blockquote>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* CTAs */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '52px 56px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '15px 38px',
              backgroundColor: 'var(--blue-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
            }}
          >
            {c.ctaMemberLabel}
          </Link>
          <Link
            href="/pour-les-therapeutes"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: 'transparent',
              color: 'var(--blue-primary)',
              borderRadius: '8px',
              border: '1px solid var(--blue-primary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontFamily: 'Georgia, serif',
            }}
          >
            {c.ctaTherapistLabel}
          </Link>
        </div>
      </section>

      {/* Contact */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 56px 80px' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
          {c.contact}
        </h2>
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
