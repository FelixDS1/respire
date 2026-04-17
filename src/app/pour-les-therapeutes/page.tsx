'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

// TODO: replace this with your Calendly (or equivalent) link once created
const CALENDLY_LINK = '#'

export default function PourLesTherapeutesPage() {
  const { lang } = useLanguage()

  const content = {
    fr: {
      eyebrow: 'Pour les thérapeutes',
      headline: 'Publiez votre agenda.',
      headlineAccent: 'Sans commission cachée.',
      body: 'Avec Respire, vos patients réservent directement en ligne, échangent avec vous via messagerie sécurisée, et règlent la séance au moment de la réservation. Vous fixez vos honoraires — et vous les percevez intégralement. Sans abonnement, sans commission cachée.',
      cta: 'Créer mon profil',
      callCta: 'Réserver un appel de 15 min',
      callSoon: 'La prise de rendez-vous téléphonique sera disponible prochainement.',
      login: 'Déjà inscrit ? Se connecter →',
      features: [
        {
          title: 'Agenda en ligne',
          body: 'Publiez vos disponibilités en quelques clics. Vos patients réservent directement — fini les allers-retours par e-mail ou téléphone.',
        },
        {
          title: 'Messagerie sécurisée',
          body: 'Échangez avec vos patients avant et après chaque séance via une messagerie chiffrée, intégrée à votre espace.',
        },
        {
          title: 'Honoraires préservés',
          body: 'Vous fixez vos tarifs, vous les percevez intégralement. Sans abonnement, sans commission cachée.',
        },
      ],
    },
    en: {
      eyebrow: 'For therapists',
      headline: 'Publish your availability.',
      headlineAccent: 'No hidden fees.',
      body: 'With Respire, your patients book directly online, message you through a secure inbox, and pay at the time of booking. You set your rate — and you keep it in full. No subscription, no hidden commission.',
      cta: 'Create my profile',
      callCta: 'Book a 15-minute call',
      callSoon: 'Phone booking will be available soon.',
      login: 'Already registered? Log in →',
      features: [
        {
          title: 'Online scheduling',
          body: 'Publish your availability in a few clicks. Patients book directly — no more back-and-forth by email or phone.',
        },
        {
          title: 'Secure messaging',
          body: 'Exchange with your patients before and after each session through an encrypted inbox built into your dashboard.',
        },
        {
          title: 'Full fee retention',
          body: 'You set your rates, you receive them in full. No subscription, no hidden commission.',
        },
      ],
    },
  }

  const c = content[lang as 'fr' | 'en'] ?? content.fr
  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Decorative background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.4, top: '-180px', right: '-120px' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.25, bottom: '-80px', left: '-100px' }} />
      </div>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '80px 56px 56px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--blue-primary)', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
          {c.eyebrow}
        </p>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.2, marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          {c.headline}<br />
          <span style={{ color: 'var(--blue-primary)' }}>{c.headlineAccent}</span>
        </h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', marginBottom: '44px', fontFamily: 'Georgia, serif', maxWidth: '600px', margin: '0 auto 44px' }}>
          {c.body}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Link
            href="/signup?role=therapist"
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
            {c.cta}
          </Link>
          <a
            href={CALENDLY_LINK}
            style={{
              display: 'inline-block',
              padding: '14px 30px',
              backgroundColor: 'transparent',
              color: 'var(--blue-primary)',
              borderRadius: '8px',
              border: '1px solid var(--blue-primary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontFamily: 'Georgia, serif',
              opacity: CALENDLY_LINK === '#' ? 0.4 : 1,
              pointerEvents: CALENDLY_LINK === '#' ? 'none' : 'auto',
            }}
          >
            {c.callCta}
          </a>
        </div>
        {CALENDLY_LINK === '#' && (
          <p style={{ fontSize: '0.75rem', color: '#9EB3C2', fontFamily: 'Georgia, serif' }}>
            {c.callSoon}
          </p>
        )}

        <div style={{ marginTop: '12px' }}>
          <Link href="/login" style={{ fontSize: '0.85rem', color: '#8A9BAD', textDecoration: 'none', fontFamily: 'Georgia, serif' }}>
            {c.login}
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '56px 56px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {c.features.map(f => (
            <div
              key={f.title}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: '0 2px 16px rgba(28,43,58,0.06)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '12px', color: 'var(--text)', fontFamily: 'Georgia, serif' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: '#4A6070', fontFamily: 'Georgia, serif' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#4A6070', fontFamily: 'Georgia, serif' }}>
          <span>© 2026 Respire</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/privacy" style={{ color: '#4A6070', textDecoration: 'none' }}>Confidentialité</Link>
            <Link href="/terms" style={{ color: '#4A6070', textDecoration: 'none' }}>Conditions</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
