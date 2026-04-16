'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

function Leaves({ cx, cy, s = 1 }: { cx: number, cy: number, s?: number }) {
  const config = [
    { a: -38, d: 7.5, op: 0.42 },
    { a: -16, d: 8.5, op: 0.50 },
    { a:   4, d: 9,   op: 0.55 },
    { a:  24, d: 8.5, op: 0.50 },
    { a:  44, d: 7.5, op: 0.42 },
  ]
  return (
    <>
      {config.map(({ a, d, op }, i) => {
        const rad = a * Math.PI / 180
        const ex = cx + Math.sin(rad) * d * s
        const ey = cy - Math.cos(rad) * d * s
        return (
          <ellipse
            key={i}
            cx={ex} cy={ey}
            rx={3.2 * s} ry={5.8 * s}
            fill="var(--blue-primary)"
            opacity={op}
            transform={`rotate(${a}, ${ex}, ${ey})`}
          />
        )
      })}
    </>
  )
}

function TreeOfLife() {
  const C = 'var(--blue-primary)'
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>

      {/* Trunk — filled, tapered organic shape */}
      <path
        d="M56 138 C54 124 53 110 55 98 C57 91 59 88 60 85 C61 88 63 91 65 98 C67 110 66 124 64 138 Z"
        fill={C} opacity="0.62"
      />

      {/* Roots */}
      <path d="M57 133 Q47 137 36 139" stroke={C} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.28"/>
      <path d="M63 133 Q73 137 84 139" stroke={C} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.28"/>
      <path d="M60 136 Q55 139 50 140" stroke={C} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.18"/>
      <path d="M60 136 Q65 139 70 140" stroke={C} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.18"/>

      {/* Main branches */}
      <path d="M59 88 Q40 77 18 54" stroke={C} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M60 87 Q51 69 40 40" stroke={C} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.50"/>
      <path d="M60 85 Q59 60 60 22" stroke={C} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.53"/>
      <path d="M60 87 Q69 69 80 40" stroke={C} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.50"/>
      <path d="M61 88 Q80 77 102 54" stroke={C} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.55"/>

      {/* Secondary — far left */}
      <path d="M18 54 Q11 43 6 32" stroke={C} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.40"/>
      <path d="M18 54 Q20 40 23 28" stroke={C} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.37"/>

      {/* Secondary — left center */}
      <path d="M40 40 Q33 27 28 18" stroke={C} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.37"/>
      <path d="M40 40 Q43 26 45 16" stroke={C} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.34"/>

      {/* Secondary — center */}
      <path d="M60 22 Q54 14 50 8" stroke={C} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.32"/>
      <path d="M60 22 Q66 14 70 8" stroke={C} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.32"/>

      {/* Secondary — right center */}
      <path d="M80 40 Q77 26 75 16" stroke={C} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.34"/>
      <path d="M80 40 Q87 27 92 18" stroke={C} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.37"/>

      {/* Secondary — far right */}
      <path d="M102 54 Q100 40 97 28" stroke={C} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.37"/>
      <path d="M102 54 Q109 43 114 32" stroke={C} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.40"/>

      {/* Leaf clusters at branch tips */}
      <Leaves cx={6}   cy={32} s={0.90}/>
      <Leaves cx={23}  cy={28} s={0.82}/>
      <Leaves cx={28}  cy={18} s={0.88}/>
      <Leaves cx={45}  cy={16} s={0.82}/>
      <Leaves cx={50}  cy={8}  s={0.78}/>
      <Leaves cx={60}  cy={10} s={0.95}/>
      <Leaves cx={70}  cy={8}  s={0.78}/>
      <Leaves cx={75}  cy={16} s={0.82}/>
      <Leaves cx={92}  cy={18} s={0.88}/>
      <Leaves cx={97}  cy={28} s={0.82}/>
      <Leaves cx={114} cy={32} s={0.90}/>

      {/* Mid-canopy clusters for fullness */}
      <Leaves cx={14}  cy={46} s={0.68}/>
      <Leaves cx={36}  cy={32} s={0.62}/>
      <Leaves cx={84}  cy={32} s={0.62}/>
      <Leaves cx={106} cy={46} s={0.68}/>
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
