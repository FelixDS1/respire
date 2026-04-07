'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'patient' | 'therapist'>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError || !data.user) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      email,
      role,
    })

    if (profileError) {
      setError('Une erreur est survenue lors de la création du profil.')
      setLoading(false)
      return
    }

    if (role === 'therapist') {
      await supabase.from('therapists').insert({ id: data.user.id })
    }

    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text)' }}>Créer un compte</h1>
          <p className="text-sm mb-8" style={{ color: '#4A6070' }}>
            Déjà inscrit ?{' '}
            <Link href="/login" style={{ color: 'var(--blue-primary)' }}>Se connecter</Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className="py-2 text-sm transition-all"
                style={{
                  border: `1px solid ${role === 'patient' ? 'var(--blue-primary)' : 'var(--border)'}`,
                  backgroundColor: role === 'patient' ? 'var(--blue-accent)' : 'white',
                  color: role === 'patient' ? 'var(--blue-primary)' : '#4A6070'
                }}
              >
                Je suis patient
              </button>
              <button
                type="button"
                onClick={() => setRole('therapist')}
                className="py-2 text-sm transition-all"
                style={{
                  border: `1px solid ${role === 'therapist' ? 'var(--blue-primary)' : 'var(--border)'}`,
                  backgroundColor: role === 'therapist' ? 'var(--blue-accent)' : 'white',
                  color: role === 'therapist' ? 'var(--blue-primary)' : '#4A6070'
                }}
              >
                Je suis thérapeute
              </button>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text)' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text)' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 text-sm outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text)' }}
              />
              <p className="text-xs mt-1" style={{ color: '#4A6070' }}>8 caractères minimum</p>
            </div>

            {error && (
              <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: 'var(--blue-primary)' }}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>

            <p className="text-xs text-center" style={{ color: '#4A6070' }}>
              En vous inscrivant, vous acceptez nos{' '}
              <Link href="/terms" style={{ color: 'var(--blue-primary)' }}>conditions d'utilisation</Link>
              {' '}et notre{' '}
              <Link href="/privacy" style={{ color: 'var(--blue-primary)' }}>politique de confidentialité</Link>.
            </p>

          </form>
        </div>
      </div>

    </main>
  )
}
