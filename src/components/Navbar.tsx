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
    : role === 'patient'
    ? 'Membre'
    : null

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white' }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl tracking-wide" style={{ color: 'var(--blue-primary)' }}>
          Respire
        </Link>

        <div className="flex items-center gap-8 text-sm">
          <Link href="/therapists" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
            {t.nav.findTherapist}
          </Link>
          <Link href="/about" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
            {t.nav.about}
          </Link>

          {userEmail ? (
            <>
              {role === 'patient' && (
                <Link href="/account" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <span style={{ color: 'var(--blue-primary)' }}>
                    {lang === 'en' ? 'My Profile' : 'Mon Profil'}
                  </span>
                  <span className="text-xs px-2 py-0.5" style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    Membre
                  </span>
                </Link>
              )}
              {role === 'therapist' && (
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <span style={{ color: 'var(--blue-primary)' }}>
                    {lang === 'en' ? 'My Profile' : 'Mon Profil'}
                  </span>
                  <span className="text-xs px-2 py-0.5" style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    {roleLabel}
                  </span>
                </Link>
              )}
              {/* PREMIUM — Messages link, visible only when logged in */}
              <Link href="/messages" className="relative hover:opacity-70 transition-opacity" style={{ color: 'var(--text)' }}>
                {lang === 'en' ? 'Messages' : 'Messages'}
                {unreadCount > 0 && (
                  <span
                    className="absolute text-white"
                    style={{
                      top: '-8px',
                      right: '-10px',
                      backgroundColor: 'var(--blue-primary)',
                      borderRadius: '10px',
                      fontSize: '10px',
                      lineHeight: 1,
                      padding: '2px 5px',
                      minWidth: '16px',
                      textAlign: 'center',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <a href="/api/logout" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
                {t.nav.logout}
              </a>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
                {t.nav.login}
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--blue-primary)' }}
              >
                {t.nav.signup}
              </Link>
            </>
          )}

          <button
            onClick={toggle}
            className="text-xs tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: '#4A6070', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </div>
    </nav>
  )
}
