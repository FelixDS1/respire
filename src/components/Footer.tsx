'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

export default function Footer() {
  const { lang, t } = useLanguage()

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--surface)',
      position: 'sticky',
      bottom: 0,
      zIndex: 40,
    }}>
      <div className="footer-inner" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px 56px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.88rem',
        color: '#4A6070',
        fontFamily: 'Georgia, serif',
      }}>
        <span>© 2026 Respire</span>
        <div className="footer-links" style={{ display: 'flex', gap: '24px' }}>
          <Link href="/about" style={{ color: '#4A6070', textDecoration: 'none' }}>
            {lang === 'fr' ? 'Nous contacter' : 'Contact us'}
          </Link>
          <Link href="/privacy" style={{ color: '#4A6070', textDecoration: 'none' }}>
            {t.footer.privacy}
          </Link>
          <Link href="/terms" style={{ color: '#4A6070', textDecoration: 'none' }}>
            {t.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  )
}
