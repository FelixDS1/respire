'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const G = 'Georgia, serif'

interface DashboardData {
  name: string
  role: string
  sessions: string
  revenue: string
  nextPatient: string
  nextTime: string
}

function DashboardCard({ data, fr }: { data: DashboardData; fr: boolean }) {
  return (
    <div style={{
      background: '#EDE9E0', borderRadius: '20px',
      padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
    }}>
      <div>
        <p style={{
          fontFamily: G, fontSize: '0.65rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(44,40,32,0.4)', margin: '0 0 0.5rem',
        }}>
          {fr ? 'Votre espace thérapeute' : 'Your therapist dashboard'}
        </p>
        <p style={{ fontFamily: G, fontSize: '1.2rem', margin: '0 0 0.15rem', color: '#2C2820' }}>
          {data.name}
        </p>
        <p style={{ fontFamily: G, fontSize: '0.75rem', color: 'rgba(44,40,32,0.45)', fontWeight: 300, margin: 0 }}>
          {data.role}
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(44,40,32,0.12)', margin: 0 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[
          { value: data.sessions, label: fr ? 'séances ce mois' : 'sessions this month' },
          { value: data.revenue, label: fr ? 'encaissés' : 'collected' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#F2EFE8', borderRadius: '12px', padding: '1rem 1.2rem' }}>
            <p style={{ fontFamily: G, fontSize: '2rem', fontWeight: 300, margin: '0 0 0.2rem', color: '#2C2820' }}>
              {stat.value}
            </p>
            <p style={{ fontFamily: G, fontSize: '0.7rem', color: 'rgba(44,40,32,0.45)', margin: 0 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: '#F2EFE8', borderRadius: '12px', padding: '1rem 1.2rem' }}>
        <p style={{
          fontFamily: G, fontSize: '0.65rem', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(44,40,32,0.4)', margin: '0 0 0.6rem',
        }}>
          {fr ? 'Prochain rendez-vous' : 'Next appointment'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: G, fontSize: '0.92rem', color: '#2C2820' }}>{data.nextPatient}</span>
          <span style={{ fontFamily: G, fontSize: '0.85rem', color: '#9C7B5A' }}>{data.nextTime}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: G, fontSize: '0.8rem', color: 'rgba(44,40,32,0.5)' }}>
          {fr ? 'Sans abonnement. Sans commission.' : 'No subscription. No commission.'}
        </span>
        <span style={{ fontFamily: G, fontSize: '1.4rem', fontWeight: 300, color: '#2C2820' }}>
          100%
        </span>
      </div>
    </div>
  )
}

export default function PourLesTherapeutesPage() {
  const { lang } = useLanguage()
  const fr = lang !== 'en'

  const sylvain: DashboardData = {
    name: 'Sylvain Loup',
    role: fr ? 'Psychothérapeute · 75011' : 'Psychotherapist · 75011',
    sessions: '18',
    revenue: '1 170€',
    nextPatient: 'Lucas M.',
    nextTime: fr ? 'Demain, 11:00' : 'Tomorrow, 11:00',
  }

  const features = fr ? [
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
  ] : [
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
  ]

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section className="therapist-hero" style={{
        maxWidth: '1400px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '3rem', alignItems: 'center',
        padding: '5rem 3rem 4rem',
      }}>

        {/* Left */}
        <div>
          <p style={{
            fontFamily: G, fontSize: '0.68rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#9C7B5A', marginBottom: '1.5rem',
          }}>
            {fr ? 'Pour les thérapeutes' : 'For therapists'}
          </p>

          <h1 style={{
            fontFamily: G, fontSize: '3.4rem', fontWeight: 300,
            lineHeight: 1.2, marginBottom: '1.5rem',
          }}>
            <span style={{ color: '#2C2820' }}>
              {fr ? 'Gérez vos rendez-vous.' : 'Appointments booked.'}
            </span>
            <em style={{ fontStyle: 'italic', color: '#9C7B5A', display: 'block' }}>
              {fr ? 'Sans commission cachée.' : 'No hidden fees.'}
            </em>
          </h1>

          <p style={{
            fontFamily: G, fontSize: '0.92rem', lineHeight: 1.85,
            color: 'rgba(44,40,32,0.6)', fontWeight: 300,
            maxWidth: '400px', marginBottom: '2rem',
          }}>
            {fr
              ? 'Vous fixez vos honoraires — et vous les percevez intégralement.'
              : 'You set your rate — and you keep it in full.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span className="inflate-pill" style={{ display: 'inline-block', alignSelf: 'flex-start' }}>
              <Link href="/signup?role=therapist" style={{
                display: 'inline-block',
                fontFamily: G, fontSize: '1rem',
                background: 'var(--blue-primary)', color: 'white',
                borderRadius: '999px', padding: '14px 32px',
                border: '2px solid var(--blue-primary)',
                textDecoration: 'none',
              }}>
                {fr ? 'Créer mon profil' : 'Create my profile'}
              </Link>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: G, fontSize: '0.95rem', color: 'rgba(44,40,32,0.55)', margin: 0, lineHeight: 1.5 }}>
                {fr
                  ? 'Vous voulez en savoir plus ? Réservez un appel de 15 minutes avec notre fondateur.'
                  : 'Want to learn more? Book a 15-minute call with our founder.'}
              </p>
              <span className="inflate-pill" style={{ display: 'inline-block', flexShrink: 0 }}>
                {/* TODO: replace # with Calendly link once set up */}
                <a href="#" style={{
                  display: 'inline-block',
                  fontFamily: G, fontSize: '0.88rem',
                  background: 'transparent', color: '#2C2820',
                  borderRadius: '999px', padding: '10px 24px',
                  border: '1.5px solid rgba(44,40,32,0.35)',
                  textDecoration: 'none',
                }}>
                  {fr ? 'Réservez votre appel' : 'Book your call'}
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Right — Sylvain Loup's dashboard */}
        <div className="hide-mobile">
          <DashboardCard data={sylvain} fr={fr} />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ margin: '0 2rem' }}>
        <div style={{ background: '#EDE9E0', borderRadius: '24px', padding: '4rem 3rem' }}>
          <p style={{
            fontFamily: G, fontSize: '0.68rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(44,40,32,0.4)', marginBottom: '3rem',
          }}>
            {fr ? 'Ce que Respire vous offre' : 'What Respire offers you'}
          </p>

          <div className="therapist-features-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem',
          }}>
            {features.map((f, i) => (
              <div key={f.title} className="inflate-card" style={{ background: '#F2EFE8', borderRadius: '16px', padding: '2rem' }}>
                <div style={{
                  fontFamily: G, fontSize: '4rem', fontWeight: 300,
                  color: 'rgba(44,40,32,0.08)', lineHeight: 1, marginBottom: '0.5rem',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{
                  fontFamily: G, fontSize: '1.4rem', fontWeight: 400,
                  marginBottom: '0.75rem', color: '#2C2820',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontFamily: G, fontSize: '1.1rem', lineHeight: 1.75,
                  color: 'rgba(44,40,32,0.6)', fontWeight: 300, margin: 0,
                }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section style={{ margin: '2rem' }}>
        <div className="therapist-cta-inner" style={{
          background: '#2C2820', borderRadius: '24px',
          padding: '3.5rem 3rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          gap: '2rem', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontFamily: G, fontSize: '0.8rem',
              color: 'rgba(242,239,232,0.45)', fontWeight: 300, marginBottom: '0.4rem',
            }}>
              {fr ? 'Prêt à rejoindre Respire ?' : 'Ready to join Respire?'}
            </p>
            <h2 style={{
              fontFamily: G, fontSize: '2.2rem', fontWeight: 300,
              fontStyle: 'italic', color: '#F2EFE8', lineHeight: 1.2, margin: 0,
            }}>
              {fr ? 'Votre pratique, à votre rythme.' : 'Your practice, your pace.'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' }}>
            <span className="inflate-pill" style={{ display: 'inline-block' }}>
              <Link href="/signup?role=therapist" style={{
                fontFamily: G, fontSize: '0.9rem',
                background: '#F2EFE8', color: '#2C2820',
                borderRadius: '999px', padding: '0.8rem 1.8rem',
                border: '2px solid #F2EFE8',
                textDecoration: 'none', display: 'inline-block',
              }}>
                {fr ? 'Créer mon profil' : 'Create my profile'}
              </Link>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: G, fontSize: '0.88rem', color: 'rgba(242,239,232,0.5)', margin: 0, lineHeight: 1.5 }}>
                {fr
                  ? 'Vous voulez en savoir plus ? Réservez un appel de 15 minutes avec notre fondateur.'
                  : 'Want to learn more? Book a 15-minute call with our founder.'}
              </p>
              <span className="inflate-pill" style={{ display: 'inline-block', flexShrink: 0 }}>
                {/* TODO: replace # with Calendly link once set up */}
                <a href="#" style={{
                  fontFamily: G, fontSize: '0.85rem',
                  background: 'transparent', color: 'rgba(242,239,232,0.75)',
                  border: '1px solid rgba(242,239,232,0.3)',
                  borderRadius: '999px', padding: '0.7rem 1.5rem',
                  textDecoration: 'none', display: 'inline-block',
                }}>
                  {fr ? 'Réservez votre appel' : 'Book your call'}
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
