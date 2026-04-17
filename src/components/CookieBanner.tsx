'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
      flexWrap: 'wrap',
    }}>
      <p style={{ fontSize: '0.8rem', color: '#4A6070', lineHeight: 1.6, flex: 1, minWidth: '240px' }}>
        Ce site utilise des cookies strictement nécessaires à son fonctionnement (authentification, session).
        Aucun cookie publicitaire ou de suivi n'est utilisé.{' '}
        <Link href="/privacy" style={{ color: 'var(--blue-primary)' }}>En savoir plus</Link>
      </p>
      <button
        onClick={accept}
        className="text-sm transition-opacity hover:opacity-80"
        style={{
          backgroundColor: 'var(--blue-primary)', color: 'white',
          border: 'none', cursor: 'pointer', padding: '8px 24px', whiteSpace: 'nowrap',
        }}
      >
        J'ai compris
      </button>
    </div>
  )
}
