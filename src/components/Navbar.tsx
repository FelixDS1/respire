'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUserEmail(session?.user?.email ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          setRole(profile?.role ?? null)
        }
      } catch {
        // show logged-out state
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(profile?.role ?? null)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white' }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl tracking-wide" style={{ color: 'var(--blue-primary)' }}>
          Respire
        </Link>

        <div className="flex items-center gap-8 text-sm">
          <Link href="/therapists" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
            Trouver un thérapeute
          </Link>
          <Link href="/about" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
            À propos
          </Link>

          {userEmail ? (
            <>
              {role === 'therapist' && (
                <Link href="/dashboard" style={{ color: 'var(--blue-primary)' }} className="hover:opacity-70 transition-opacity">
                  Tableau de bord
                </Link>
              )}
              <span style={{ color: '#4A6070' }}>{userEmail}</span>
              <a href="/api/logout" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
                Déconnexion
              </a>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--text)' }} className="hover:opacity-70 transition-opacity">
                Connexion
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--blue-primary)' }}
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
