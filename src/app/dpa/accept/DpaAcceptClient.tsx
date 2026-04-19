'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DpaAcceptClient({ userId, currentVersion }: { userId: string; currentVersion: number }) {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAccept() {
    if (!accepted) { setError('Veuillez cocher la case pour continuer.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/accept-dpa', { method: 'POST' })
      if (!res.ok) {
        const json = await res.json()
        setError('Une erreur est survenue : ' + (json.error ?? res.status))
        setSaving(false)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.')
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-light mb-3" style={{ color: 'var(--text)' }}>
          Mise à jour de l'accord de traitement des données
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: '#4A6070' }}>
          Notre accord de traitement des données (DPA) a été mis à jour. Merci de le lire et de l'accepter avant d'accéder à votre espace.
        </p>

        <a
          href="/dpa"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm mb-8 underline hover:opacity-70"
          style={{ color: 'var(--blue-primary)' }}
        >
          Lire l'accord de traitement des données →
        </a>

        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => { setAccepted(e.target.checked); setError('') }}
            className="mt-0.5 flex-shrink-0"
          />
          <span className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
            J'ai lu et j'accepte la nouvelle version de l'accord de traitement des données de Respire.
          </span>
        </label>

        {error && <p className="text-sm mb-4" style={{ color: '#C0392B' }}>{error}</p>}

        <button
          onClick={handleAccept}
          disabled={saving}
          className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
        >
          {saving ? 'Enregistrement...' : 'Accepter et continuer'}
        </button>
      </div>
    </main>
  )
}
