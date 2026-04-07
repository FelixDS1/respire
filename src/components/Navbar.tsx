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

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const roleLabel = role === 'therapist'
    ? (lang === 'en' ? 'Therapist' : 'Thérapeute')
    : role === 'patient'
    ? 'Patient'
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
              {role === 'therapist' && (
                <Link href="/dashboard" style={{ color: 'var(--blue-primary)' }} className="hover:opacity-70 transition-opacity">
                  {t.nav.dashboard}
                </Link>
              )}
              <span className="flex items-center gap-2">
                <span style={{ color: '#4A6070' }}>{userEmail}</span>
                {roleLabel && (
                  <span className="text-xs px-2 py-0.5" style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    {roleLabel}
                  </span>
                )}
              </span>
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
