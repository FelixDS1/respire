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
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Close menu when route changes (link clicked)
  function closeMenu() { setMenuOpen(false) }

  const roleLabel = role === 'therapist'
    ? (lang === 'en' ? 'Therapist' : 'Thérapeute')
    : 'Membre'

  const linkStyle: React.CSSProperties = {
    color: 'var(--text)',
    fontSize: '1rem',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
  }

  const mobileLinkStyle: React.CSSProperties = {
    color: 'var(--text)',
    fontSize: '1.1rem',
    textDecoration: 'none',
    padding: '14px 0',
    borderBottom: '1px solid var(--border)',
    display: 'block',
    fontFamily: 'Georgia, serif',
  }

  return (
    <>
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

          {/* Logo */}
          <Link href="/" onClick={closeMenu} style={{
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

          {/* Mobile: right side — unread badge + hamburger */}
          <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: '16px' }}>
            {userEmail && unreadCount > 0 && (
              <Link href="/messages" onClick={closeMenu} style={{ position: 'relative', color: 'var(--blue-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                Messages
                <span style={{
                  position: 'absolute', top: '-8px', right: '-12px',
                  backgroundColor: 'var(--blue-primary)', color: 'white',
                  borderRadius: '10px', fontSize: '10px', lineHeight: 1,
                  padding: '2px 5px', minWidth: '16px', textAlign: 'center',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', display: 'flex', flexDirection: 'column',
                gap: '5px', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {menuOpen ? (
                /* X icon */
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <line x1="2" y1="2" x2="20" y2="20" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="20" y1="2" x2="2" y2="20" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                /* Hamburger icon */
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <line x1="2" y1="5" x2="20" y2="5" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2" y1="11" x2="20" y2="11" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2" y1="17" x2="20" y2="17" stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            padding: '8px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Link href="/therapists" onClick={closeMenu} style={mobileLinkStyle}>{t.nav.findTherapist}</Link>
            <Link href="/about" onClick={closeMenu} style={mobileLinkStyle}>{t.nav.about}</Link>

            {userEmail ? (
              <>
                <Link
                  href={role === 'therapist' ? '/dashboard' : '/account'}
                  onClick={closeMenu}
                  style={mobileLinkStyle}
                >
                  {lang === 'en' ? 'My Profile' : 'Mon Profil'}
                  <span style={{ fontSize: '0.72rem', marginLeft: '8px', padding: '2px 8px', backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', borderRadius: '4px' }}>
                    {roleLabel}
                  </span>
                </Link>
                <Link href="/messages" onClick={closeMenu} style={{ ...mobileLinkStyle, position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Messages
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: 'var(--blue-primary)', color: 'white',
                      borderRadius: '10px', fontSize: '10px', lineHeight: 1,
                      padding: '2px 6px',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <a href="/api/logout" style={{ ...mobileLinkStyle, color: '#8A9BAD' }}>{t.nav.logout}</a>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} style={mobileLinkStyle}>{t.nav.login}</Link>
                <Link href="/signup" onClick={closeMenu} style={{
                  ...mobileLinkStyle,
                  backgroundColor: 'var(--blue-primary)', color: 'white',
                  padding: '14px 20px', borderRadius: '8px', textAlign: 'center',
                  border: 'none', marginTop: '8px',
                }}>
                  {t.nav.signup}
                </Link>
              </>
            )}

            <button
              onClick={toggle}
              style={{
                marginTop: '16px', alignSelf: 'flex-start',
                fontSize: '0.85rem', letterSpacing: '0.08em', color: '#6B8A9E',
                background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
                padding: '6px 14px', borderRadius: '4px', fontFamily: 'Georgia, serif',
              }}
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        )}
      </nav>
    </>
  )
}
