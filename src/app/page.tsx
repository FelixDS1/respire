'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

function TreeOfLife() {
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="57" y="90" width="6" height="40" rx="3" fill="var(--blue-primary)" opacity="0.7"/>
      <path d="M60 90 Q40 70 25 55" stroke="var(--blue-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M60 90 Q80 70 95 55" stroke="var(--blue-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M60 85 Q45 65 35 45" stroke="var(--blue-primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M60 85 Q75 65 85 45" stroke="var(--blue-primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M60 80 Q60 55 60 35" stroke="var(--blue-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M40 72 Q30 60 22 50" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M35 60 Q25 50 18 42" stroke="var(--blue-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M40 72 Q42 60 40 48" stroke="var(--blue-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M80 72 Q90 60 98 50" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M85 60 Q95 50 102 42" stroke="var(--blue-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M80 72 Q78 60 80 48" stroke="var(--blue-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M60 65 Q50 55 44 44" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M60 65 Q70 55 76 44" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="25" cy="55" r="3" fill="var(--blue-primary)" opacity="0.5"/>
      <circle cx="95" cy="55" r="3" fill="var(--blue-primary)" opacity="0.5"/>
      <circle cx="60" cy="32" r="3.5" fill="var(--blue-primary)" opacity="0.6"/>
      <circle cx="35" cy="45" r="2.5" fill="var(--blue-primary)" opacity="0.4"/>
      <circle cx="85" cy="45" r="2.5" fill="var(--blue-primary)" opacity="0.4"/>
      <circle cx="18" cy="42" r="2" fill="var(--blue-primary)" opacity="0.35"/>
      <circle cx="102" cy="42" r="2" fill="var(--blue-primary)" opacity="0.35"/>
      <circle cx="22" cy="50" r="2" fill="var(--blue-primary)" opacity="0.35"/>
      <circle cx="98" cy="50" r="2" fill="var(--blue-primary)" opacity="0.35"/>
      <circle cx="44" cy="44" r="2" fill="var(--blue-primary)" opacity="0.4"/>
      <circle cx="76" cy="44" r="2" fill="var(--blue-primary)" opacity="0.4"/>
      <circle cx="40" cy="48" r="2" fill="var(--blue-primary)" opacity="0.35"/>
      <circle cx="80" cy="48" r="2" fill="var(--blue-primary)" opacity="0.35"/>
      <path d="M60 130 Q45 125 35 118" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M60 130 Q75 125 85 118" stroke="var(--blue-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M55 132 Q40 128 28 124" stroke="var(--blue-primary)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
      <path d="M65 132 Q80 128 92 124" stroke="var(--blue-primary)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
    </svg>
  )
}

function StepBubble({ number, title, body }: {
  number: string
  title: string
  body: string
}) {
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
      <span style={{
        fontSize: '3.2rem',
        fontWeight: 300,
        color: 'var(--blue-primary)',
        fontFamily: 'Georgia, serif',
        display: 'block',
        marginBottom: '16px',
        lineHeight: 1,
      }}>
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

export default function Home() {
  const { t } = useLanguage()
  const [treeHover, setTreeHover] = useState(false)

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Full-page decorative background layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.45, top: '-250px', right: '-150px' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.3, bottom: '-100px', left: '-120px' }} />
        <div style={{ position: 'absolute', width: '360px', height: '360px', borderRadius: '60px', backgroundColor: 'var(--blue-accent)', opacity: 0.2, top: '200px', left: '25%', transform: 'rotate(25deg)' }} />
        <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.2, top: '80px', right: '30%' }} />
        <div style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '2px solid var(--blue-primary)', opacity: 0.08, top: '320px', left: '12%' }} />
        <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '20px', backgroundColor: 'var(--green-soft)', opacity: 0.18, bottom: '30%', right: '15%', transform: 'rotate(15deg)' }} />
      </div>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '52px 56px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3.4rem', fontWeight: 300, lineHeight: 1.2, marginBottom: '24px', fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}>
            {t.home.heroTitle}
          </h1>
          <p style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.9, color: '#4A6070', marginBottom: '40px', fontFamily: 'Georgia, serif' }}>
            {t.home.heroSubtitle}
          </p>
          <Link
            href="/therapists"
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
            {t.home.cta}
          </Link>
        </div>

        {/* Right: tree visual */}
        <div style={{ position: 'relative', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{ position: 'relative', zIndex: 1, width: '340px', height: '400px' }}
            className={treeHover ? 'tree-breathe' : ''}
            onMouseEnter={() => setTreeHover(true)}
            onMouseLeave={() => setTreeHover(false)}
          >
            <TreeOfLife />
          </div>
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'Georgia, serif', fontSize: '1.1rem', letterSpacing: '0.3em', color: 'var(--blue-primary)', opacity: 0.55, whiteSpace: 'nowrap' }}>
            RESPIRE
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 56px' }}>
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* How it works */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '36px 56px 72px' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 300, color: 'var(--text)', marginBottom: '36px', fontFamily: 'Georgia, serif' }}>
          {t.home.howItWorks}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', perspective: '1000px', alignItems: 'stretch' }}>
          <StepBubble number="1" title={t.home.step1Title} body={t.home.step1Body} />
          <StepBubble number="2" title={t.home.step2Title} body={t.home.step2Body} />
          <StepBubble number="3" title={t.home.step3Title} body={t.home.step3Body} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
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
