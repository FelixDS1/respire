'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
      return
    }
    router.push('/')
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    color: 'var(--text)',
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text)' }}>
            Nouveau mot de passe
          </h1>

          {!ready ? (
            <p className="text-sm" style={{ color: '#4A6070' }}>Vérification du lien...</p>
          ) : (
            <>
              <p className="text-sm mb-8" style={{ color: '#4A6070' }}>
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                {error && <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--blue-primary)' }}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
