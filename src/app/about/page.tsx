'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

function StepBubble({ number, title, body }: { number: string; title: string; body: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    const intensity = Math.sqrt(dx * dx + dy * dy)
    el.style.transform = `translate(${dx * 10 * intensity}px, ${dy * 10 * intensity}px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale(1.04)`
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
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '44px 36px 36px',
        cursor: 'default',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        boxShadow: '0 2px 16px rgba(28,43,58,0.07)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontSize: '3.2rem', fontWeight: 300, color: 'var(--blue-primary)', display: 'block', marginBottom: '16px', lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {number}
      </span>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '12px', color: 'var(--text)', fontFamily: 'Georgia, serif' }}>
        {title}
      </h3>
      <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.8, color: '#4A6070', fontFamily: 'Georgia, serif' }}>
        {body}
      </p>
    </div>
  )
}

export default function About() {
  const { t, lang } = useLanguage()

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Hero / Mission */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 56px 52px' }}>
        <div style={{ maxWidth: '760px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.25, marginBottom: '28px', fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}>
            {t.about.heroTitle}
          </h1>
          <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}>
            {t.about.missionBody}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* How it works */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '36px 56px 72px' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 300, color: 'var(--text)', marginBottom: '36px', fontFamily: 'Georgia, serif' }}>
          {t.about.howItWorks}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', perspective: '1000px', alignItems: 'stretch' }}>
          <StepBubble number="1" title={t.about.step1Title} body={t.about.step1Body} />
          <StepBubble number="2" title={t.about.step2Title} body={t.about.step2Body} />
          <StepBubble number="3" title={t.about.step3Title} body={t.about.step3Body} />
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Contact */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '56px 56px 80px' }}>
        <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--blue-primary)', marginBottom: '40px', fontFamily: 'Georgia, serif' }}>
          {t.about.contact}
        </h2>
        <div>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A9BAD', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
            {t.about.email}
          </p>
          <p style={{ fontSize: '1.1rem', fontFamily: 'Georgia, serif', color: 'var(--text)', fontWeight: 300 }}>
            contact@respire.fr
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
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
