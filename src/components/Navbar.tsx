'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/lib/language'

interface Props {
  initialEmail: string | null
  initialRole: string | null
}

export default function Navbar({ initialEmail, initialRole }: Props) {
  const { t, lang, toggle } = useLanguage()
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail)
  const [role, setRole] = useState<string | null>(initialRole)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: unknown, session: { user?: { id: string; email?: string } } | null) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(profile?.role ?? null)
      } else {
        setUserEmail(null)
        setRole(null)
        setUnreadCount(0)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userEmail) return
    const fetchUnread = () =>
      fetch('/api/unread-messages-count')
        .then(r => r.json())
        .then(json => setUnreadCount(json.count ?? 0))
        .catch(() => {})
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => clearInterval(interval)
  }, [userEmail])

  const roleLabel = role === 'therapist'
    ? (lang === 'en' ? 'Therapist' : 'Thérapeute')
    : 'Membre'

  const linkStyle: React.CSSProperties = {
    color: 'var(--text)',
    fontSize: '1rem',
    textDecoration: 'none',
    opacity: 1,
    transition: 'opacity 0.15s',
  }

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        width: '100%',
        padding: '14px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>

        {/* Logo — far left, large */}
        <Link href="/" style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2rem',
          fontWeight: 400,
          color: 'var(--blue-primary)',
          letterSpacing: '0.04em',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          Respire
        </Link>

        {/* Nav items — right side, language toggle at far right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>

          <Link href="/therapists" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {t.nav.findTherapist}
          </Link>
          <Link href="/about" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {t.nav.about}
          </Link>

          {userEmail ? (
            <>
              {role === 'patient' && (
                <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <span style={{ color: 'var(--blue-primary)', fontSize: '1rem' }}>
                    {lang === 'en' ? 'My Profile' : 'Mon Profil'}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    Membre
                  </span>
                </Link>
              )}
              {role === 'therapist' && (
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <span style={{ color: 'var(--blue-primary)', fontSize: '1rem' }}>
                    {lang === 'en' ? 'My Profile' : 'Mon Profil'}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    {roleLabel}
                  </span>
                </Link>
              )}

              <Link href="/messages" style={{ ...linkStyle, position: 'relative' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {lang === 'en' ? 'Messages' : 'Messages'}
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-12px',
                    backgroundColor: 'var(--blue-primary)', color: 'white',
                    borderRadius: '10px', fontSize: '10px', lineHeight: 1,
                    padding: '2px 5px', minWidth: '16px', textAlign: 'center',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <a href="/api/logout" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {t.nav.logout}
              </a>
            </>
          ) : (
            <>
              <Link href="/login" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {t.nav.login}
              </Link>
              <Link href="/signup" style={{
                backgroundColor: 'var(--blue-primary)', color: 'white',
                padding: '9px 22px', fontSize: '1rem', textDecoration: 'none',
                borderRadius: '6px', transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {t.nav.signup}
              </Link>
            </>
          )}

          {/* Language toggle — far right */}
          <button
            onClick={toggle}
            style={{
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              color: '#6B8A9E',
              background: 'none',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '4px',
              fontFamily: 'Georgia, serif',
            }}
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </div>
    </nav>
  )
}
