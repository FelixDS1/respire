'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-fill fields from saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('respire_remember')
    if (saved) {
      try {
        const { email: e, password: p } = JSON.parse(saved)
        if (e) setEmail(e)
        if (p) setPassword(p)
        setRemember(true)
      } catch {
        localStorage.removeItem('respire_remember')
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    if (remember) {
      localStorage.setItem('respire_remember', JSON.stringify({ email, password }))
    } else {
      localStorage.removeItem('respire_remember')
    }

    router.push(redirectTo)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text)' }}>Connexion</h1>
          <p className="text-sm mb-8" style={{ color: '#4A6070' }}>
            Pas encore de compte ?{' '}
            <Link href={`/signup${redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--blue-primary)' }}>S'inscrire</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm outline-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm" style={{ color: 'var(--text)' }}>Mot de passe</label>
                <Link href="/forgot-password" className="text-xs hover:opacity-70"
                  style={{ color: 'var(--blue-primary)' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm outline-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  borderRadius: '8px',
                }}
              />
            </div>

            <label className="flex items-center gap-2 text-sm" style={{ color: '#4A6070', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--blue-primary)', cursor: 'pointer' }}
              />
              Se souvenir de moi
            </label>

            {error && (
              <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: 'var(--blue-primary)', borderRadius: '8px', border: 'none' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>

    </main>
  )
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
