'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const G = 'Georgia, serif'
const CG = 'var(--font-cormorant), Georgia, serif' // founder quote only

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(44,40,32,0.4)',
  fontFamily: G,
  marginBottom: '1.2rem',
}

export default function About() {
  const { lang, t } = useLanguage()
  const fr = lang === 'fr'

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '5rem 3rem 4rem' }}>
        <p style={{
          fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#9C7B5A', marginBottom: '1.5rem', fontFamily: G,
        }}>
          {fr ? 'À propos' : 'About'}
        </p>

        {/* Same format as homepage h1 */}
        <h1 style={{
          fontFamily: G, fontSize: '4.5rem', fontWeight: 300,
          lineHeight: 1.1, maxWidth: '680px', margin: '0 0 1.5rem 0',
        }}>
          {fr
            ? <>Vous méritez de <em style={{ fontStyle: 'italic', color: '#9C7B5A' }}>respirer.</em></>
            : <>You deserve to <em style={{ fontStyle: 'italic', color: '#9C7B5A' }}>breathe.</em></>}
        </h1>

        <p style={{
          fontFamily: G, fontSize: '0.95rem', lineHeight: 1.9,
          color: 'rgba(44,40,32,0.6)', fontWeight: 300, maxWidth: '520px', margin: 0,
        }}>
          {fr
            ? 'On se force à vivre en courant. Quand on ralentit, on culpabilise. Prenez du temps pour respirer.'
            : 'We force ourselves to keep running. When we slow down, we feel guilty. Take time to breathe.'}
        </p>
      </section>

      {/* ── Pourquoi Respire + Nos engagements ── */}
      <section style={{ margin: '0 2rem' }}>
        <div className="about-split-card" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          borderRadius: '24px', overflow: 'hidden',
        }}>
          {/* Left */}
          <div className="about-split-left" style={{ background: '#EDE9E0', padding: '3.5rem' }}>
            <span style={labelStyle}>
              {fr ? 'Pourquoi Respire existe' : 'Why Respire exists'}
            </span>
            <h2 style={{
              fontFamily: G, fontSize: '2rem', fontWeight: 300,
              fontStyle: 'italic', lineHeight: 1.3, marginBottom: '1.2rem', color: '#2C2820',
            }}>
              {fr ? 'Simplifier le suivi psychologique.' : 'Simplifying mental health care.'}
            </h2>
            <p style={{
              fontFamily: G, fontSize: '1.15rem', fontStyle: 'italic',
              color: '#9C7B5A', lineHeight: 1.5, margin: 0, fontWeight: 300,
            }}>
              {fr ? "Plus c'est simple, mieux vous êtes servis." : 'The simpler it is, the better served you are.'}
            </p>
          </div>

          {/* Right */}
          <div className="about-split-right" style={{ background: '#E5E0D5', padding: '3.5rem' }}>
            <span style={labelStyle}>
              {fr ? 'Nos engagements' : 'Our commitments'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                fr ? 'Être simples au niveau de nos (vos) démarches.' : 'To be simple when it comes to our (your) process.',
                fr ? 'Être honnêtes avec nos membres et nos thérapeutes.' : 'To be honest with our members and our therapists.',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: G, fontSize: '3.5rem', fontWeight: 300,
                    color: 'rgba(44,40,32,0.15)', width: '48px', flexShrink: 0, lineHeight: 1,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={{
                    fontFamily: G, fontSize: '1.2rem', fontWeight: 300,
                    lineHeight: 1.45, paddingTop: '0.6rem', margin: 0, color: '#2C2820',
                  }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section style={{ margin: '2rem' }}>
        <div style={{ background: '#EDE9E0', borderRadius: '24px', padding: '4rem 3rem' }}>
          <p style={{ ...labelStyle, marginBottom: '3rem' }}>
            {fr ? 'Comment ça marche' : 'How it works'}
          </p>
          <div className="about-steps-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem',
          }}>
            {[
              { num: '01', title: t.home.step1Title, body: t.home.step1Body },
              { num: '02', title: t.home.step2Title, body: t.home.step2Body },
              { num: '03', title: t.home.step3Title, body: t.home.step3Body },
            ].map(step => (
              <div key={step.num}>
                <div style={{
                  fontFamily: G, fontSize: '4rem', fontWeight: 300,
                  lineHeight: 1, color: 'rgba(44,40,32,0.1)', marginBottom: '0.5rem',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontFamily: G, fontSize: '1.4rem', fontWeight: 400,
                  marginBottom: '0.75rem', color: '#2C2820',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: G, fontSize: '1.1rem', lineHeight: 1.75,
                  color: 'rgba(44,40,32,0.6)', fontWeight: 300, margin: 0,
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder note ── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 3rem' }}>
        <span style={labelStyle}>
          {fr ? 'Note du fondateur' : 'A note from the founder'}
        </span>
        {/* Quote stays in Cormorant Garamond italic */}
        <p style={{
          fontFamily: CG, fontSize: '1.3rem', fontStyle: 'italic',
          fontWeight: 300, lineHeight: 1.8, color: '#2C2820',
          marginBottom: '1.2rem', maxWidth: '560px',
        }}>
          {fr
            ? "Je m'appelle Félix, j'habite à Paris. Bien que j'ai toujours voulu trouver un(e) psy, j'ai longtemps hésité à me lancer — et si je ne trouvais pas la/le psy qui me correspondait\u00a0? Ça vous parle\u00a0?"
            : "My name is Félix, I live in Paris. Although I always wanted to find a therapist, I hesitated for a long time — what if I couldn't find the therapist who was right for me? Sound familiar?"}
        </p>
        <span style={{ fontFamily: G, fontSize: '0.78rem', color: '#9C7B5A', letterSpacing: '0.1em' }}>
          — Félix
        </span>
      </section>

      {/* ── CTA strip ── */}
      <section style={{ margin: '2rem' }}>
        <div className="about-cta-inner" style={{
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
              {fr ? 'Prêt à commencer ?' : 'Ready to start?'}
            </p>
            <h2 style={{
              fontFamily: G, fontSize: '2.2rem', fontWeight: 300,
              fontStyle: 'italic', color: '#F2EFE8', lineHeight: 1.2, margin: 0,
            }}>
              {fr ? 'Vous avez le droit de respirer.' : 'You deserve to breathe.'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              background: '#F2EFE8', color: '#2C2820', borderRadius: '999px',
              padding: '0.8rem 1.8rem', border: 'none', fontFamily: G,
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-block',
            }}>
              {fr ? 'Créer mon compte' : 'Create my account'}
            </Link>
            <Link href="/pour-les-therapeutes" style={{
              background: 'transparent', color: 'rgba(242,239,232,0.6)',
              border: '0.5px solid rgba(242,239,232,0.25)', borderRadius: '999px',
              padding: '0.8rem 1.8rem', fontFamily: G,
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-block',
            }}>
              {fr ? 'Vous êtes thérapeute ?' : 'Are you a therapist?'}
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
