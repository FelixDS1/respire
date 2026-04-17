'use client'

import Link from 'next/link'

// TODO: replace this with your Calendly (or equivalent) link once created
const CALENDLY_LINK = '#'

const features = [
  {
    title: 'Gérez vos rendez-vous',
    body: 'Publiez vos disponibilités en quelques clics. Vos patients réservent directement en ligne — fini les allers-retours par e-mail.',
  },
  {
    title: 'Paiements intégrés',
    body: 'Les règlements sont gérés automatiquement via Stripe. Vous recevez votre paiement sans aucune démarche administrative.',
  },
  {
    title: 'Messagerie sécurisée',
    body: 'Échangez avec vos patients via notre messagerie chiffrée, avant et après chaque séance.',
  },
]

export default function PourLesTherapeutesPage() {
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
          Pour les thérapeutes
        </p>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.2, marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          Concentrez-vous sur vos patients.<br />
          <span style={{ color: 'var(--blue-primary)' }}>Nous gérons le reste.</span>
        </h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', marginBottom: '44px', fontFamily: 'Georgia, serif', maxWidth: '600px', margin: '0 auto 44px' }}>
          Rejoignez Respire et accédez à une plateforme pensée pour les professionnels de santé mentale — agenda en ligne, paiements automatisés, et messagerie sécurisée avec vos patients.
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
            Créer mon profil
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
            Réserver un appel de 15 min
          </a>
        </div>
        {CALENDLY_LINK === '#' && (
          <p style={{ fontSize: '0.75rem', color: '#9EB3C2', fontFamily: 'Georgia, serif' }}>
            La prise de rendez-vous téléphonique sera disponible prochainement.
          </p>
        )}

        <div style={{ marginTop: '12px' }}>
          <Link href="/login" style={{ fontSize: '0.85rem', color: '#8A9BAD', textDecoration: 'none', fontFamily: 'Georgia, serif' }}>
            Déjà inscrit ? Se connecter →
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
          {features.map(f => (
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
