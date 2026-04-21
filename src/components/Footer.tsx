'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

export default function Footer() {
  const { lang, t } = useLanguage()

  return (
    <footer className="footer-desktop" style={{
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--surface)',
      position: 'sticky',
      bottom: 0,
      zIndex: 40,
    }}>
      <div className="footer-inner" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '14px 56px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Left: logo */}
        <span style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: '1.1rem',
          color: 'var(--blue-primary)',
          letterSpacing: '0.04em',
        }}>
          Respire
        </span>

        {/* Center: nav links */}
        <div className="footer-links" style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/about" style={{ fontSize: '0.72rem', color: 'rgba(44,40,32,0.35)', textDecoration: 'none' }}>
            {lang === 'fr' ? 'Nous contacter' : 'Contact us'}
          </Link>
          <Link href="/privacy" style={{ fontSize: '0.72rem', color: 'rgba(44,40,32,0.35)', textDecoration: 'none' }}>
            {t.footer.privacy}
          </Link>
          <Link href="/terms" style={{ fontSize: '0.72rem', color: 'rgba(44,40,32,0.35)', textDecoration: 'none' }}>
            {t.footer.terms}
          </Link>
        </div>

        {/* Right: email + copyright */}
        <span style={{ fontSize: '0.72rem', color: 'rgba(44,40,32,0.3)', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <a href="mailto:contact@respire.fr" style={{ color: '#9C7B5A', textDecoration: 'none' }}>
            contact@respire.fr
          </a>
          · © 2026 Respire
        </span>
      </div>
    </footer>
  )
}
