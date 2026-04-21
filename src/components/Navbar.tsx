'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()

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

  const profileHref = role === 'therapist' ? '/dashboard' : '/account'

  const linkStyle: React.CSSProperties = {
    color: 'var(--text)',
    fontSize: '1rem',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
  }

  // Mobile bottom nav active state
  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  const navItemStyle = (href: string): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    textDecoration: 'none',
    color: isActive(href) ? 'var(--blue-primary)' : 'rgba(44,40,32,0.4)',
    flex: 1,
    padding: '6px 0',
  })

  const navLabelStyle: React.CSSProperties = {
    fontSize: '0.6rem',
    letterSpacing: '0.04em',
    fontFamily: 'Georgia, serif',
  }

  return (
    <>
      {/* ── Top nav (desktop + mobile logo) ── */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(250,248,245,0.97)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="nav-inner" style={{
          width: '100%',
          padding: '14px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>

          {/* Logo — desktop only */}
          <Link href="/" className="hide-mobile" style={{
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

          {/* Mobile header row: Respire left · tagline right */}
          <div className="show-mobile" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 400,
              color: 'var(--blue-primary)',
              letterSpacing: '0.04em',
              textDecoration: 'none',
            }}>
              Respire
            </Link>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(44,40,32,0.45)',
            }}>
              Paris · Thérapie pour tous
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
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

            <button
              onClick={toggle}
              style={{
                fontSize: '0.85rem', letterSpacing: '0.08em', color: '#6B8A9E',
                background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
                padding: '4px 10px', borderRadius: '4px', fontFamily: 'Georgia, serif',
              }}
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <div className="mobile-nav-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'rgba(250,248,245,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        zIndex: 50,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>

        {/* Respire → home */}
        <Link href="/" style={navItemStyle('/')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span style={navLabelStyle}>Respire</span>
        </Link>

        {/* Nos Psys → /therapists */}
        <Link href="/therapists" style={navItemStyle('/therapists')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={navLabelStyle}>Nos Psys</span>
        </Link>

        {/* Messages → /messages */}
        <Link href="/messages" style={{ ...navItemStyle('/messages'), position: 'relative' }}>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '2px', left: '50%', transform: 'translateX(4px)',
              backgroundColor: 'var(--blue-primary)', color: 'white',
              borderRadius: '10px', fontSize: '9px', lineHeight: 1,
              padding: '2px 5px', minWidth: '14px', textAlign: 'center',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={navLabelStyle}>Messages</span>
        </Link>

        {/* Mon Profil → /account or /dashboard */}
        <Link href={profileHref} style={navItemStyle(profileHref)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={navLabelStyle}>Mon Profil</span>
        </Link>

      </div>
    </>
  )
}
