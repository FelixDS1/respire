'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">

          <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text)' }}>
            Mot de passe oublié
          </h1>

          {sent ? (
            <>
              <p className="text-sm mb-6" style={{ color: '#4A6070', lineHeight: '1.7' }}>
                Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail.
              </p>
              <Link href="/login" style={{ color: 'var(--blue-primary)', fontSize: '0.875rem' }}>
                Retour à la connexion
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm mb-8" style={{ color: '#4A6070' }}>
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--blue-primary)' }}
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
                <Link href="/login" className="text-sm text-center hover:opacity-70"
                  style={{ color: '#4A6070' }}>
                  Retour à la connexion
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
