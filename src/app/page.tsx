'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const LILY_PINK = '#C4849A'

function Lily() {
  const blue = 'var(--blue-primary)'
  const pink = LILY_PINK
  const cx = 60, cy = 62

  // Lance-shaped petal pointing straight up from center
  const petalPath = 'M 60,62 C 52,60 47,48 47,36 C 47,24 53,16 60,14 C 67,16 73,24 73,36 C 73,48 68,60 60,62 Z'
  const midribPath = 'M 60,62 L 60,16'

  return (
    <svg viewBox="0 0 120 145" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>

      {/* Stem */}
      <path d="M 60,68 C 59,86 59,108 60,138" stroke={blue} strokeWidth="1.5" strokeLinecap="round" opacity="0.46"/>

      {/* Narrow lance leaves along stem */}
      <path d="M 60,97 C 51,93 40,90 28,88" stroke={blue} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.32"/>
      <path d="M 60,113 C 69,108 80,104 91,101" stroke={blue} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.32"/>

      {/* Back petals — alternate triplet (slightly less opaque) */}
      {[0, 120, 240].map(angle => (
        <g key={`b${angle}`} transform={`rotate(${angle}, ${cx}, ${cy})`}>
          <path d={petalPath} fill="white" fillOpacity="0.74" stroke={blue} strokeWidth="0.75" opacity="0.48"/>
          <path d={midribPath} stroke={blue} strokeWidth="0.38" strokeLinecap="round" opacity="0.13"/>
        </g>
      ))}

      {/* Front petals — alternate triplet */}
      {[60, 180, 300].map(angle => (
        <g key={`f${angle}`} transform={`rotate(${angle}, ${cx}, ${cy})`}>
          <path d={petalPath} fill="white" fillOpacity="0.80" stroke={blue} strokeWidth="0.80" opacity="0.54"/>
          <path d={midribPath} stroke={blue} strokeWidth="0.38" strokeLinecap="round" opacity="0.17"/>
        </g>
      ))}

      {/* Faint pink glow at heart — innermost to outermost */}
      <circle cx={cx} cy={cy} r="18" fill={pink} opacity="0.09"/>
      <circle cx={cx} cy={cy} r="11" fill={pink} opacity="0.15"/>
      <circle cx={cx} cy={cy} r="5.5" fill={pink} opacity="0.26"/>

      {/* 6 stamens — thin filaments with elongated anthers */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = angle * Math.PI / 180
        const ex = cx + Math.sin(rad) * 18
        const ey = cy - Math.cos(rad) * 18
        return (
          <g key={`s${i}`}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={pink} strokeWidth="0.55" opacity="0.48" strokeLinecap="round"/>
            <ellipse cx={ex} cy={ey} rx="1" ry="1.8" fill={pink} opacity="0.58" transform={`rotate(${angle}, ${ex}, ${ey})`}/>
          </g>
        )
      })}

      {/* Central pistil */}
      <circle cx={cx} cy={cy} r="2.8" fill={pink} opacity="0.45"/>
      <circle cx={cx} cy={cy} r="1.2" fill={pink} opacity="0.65"/>
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
        backgroundColor: 'var(--surface)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
              {t.home.therapistCta}
            </Link>
          </div>
        </div>

        {/* Right: lily illustration */}
        <div style={{ position: 'relative', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{ position: 'relative', zIndex: 1, width: '340px', height: '400px' }}
            className={treeHover ? 'tree-breathe' : ''}
            onMouseEnter={() => setTreeHover(true)}
            onMouseLeave={() => setTreeHover(false)}
          >
            <Lily />
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
        <div style={{ position: 'relative' }}>
          {/* Simple connector line — sits behind the white card backgrounds */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '44%', height: '1px', backgroundColor: LILY_PINK, opacity: 0.28, zIndex: 0, pointerEvents: 'none' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', perspective: '1000px', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
            <StepBubble number="1" title={t.home.step1Title} body={t.home.step1Body} />
            <StepBubble number="2" title={t.home.step2Title} body={t.home.step2Body} />
            <StepBubble number="3" title={t.home.step3Title} body={t.home.step3Body} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
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
