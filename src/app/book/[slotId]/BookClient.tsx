'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
}

interface Therapist {
  id: string
  consultation_fee: number | null
  sector: string | null
  profiles: { full_name: string | null }
}

interface Props {
  slot: Slot
  therapist: Therapist
  isBooked: boolean
  userId: string | null
}

export default function BookClient({ slot, therapist, isBooked, userId }: Props) {
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  async function handlePayment() {
    if (!userId) {
      window.location.href = `/login?redirectTo=/book/${slot.id}`
      return
    }
    setPaying(true)
    setError('')

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: slot.id }),
    })

    const data = await res.json()

    if (!res.ok || !data.url) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setPaying(false)
      return
    }

    window.location.href = data.url
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5)
  }

  if (isBooked) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#4A6070' }}>Ce créneau n'est plus disponible.</p>
          <Link href="/therapists" style={{ color: 'var(--blue-primary)', fontSize: '0.875rem' }}>
            ← Retour aux thérapeutes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-[1400px] mx-auto px-14 py-12">
        <div className="max-w-md">

          <h1 className="text-2xl font-light mb-8" style={{ color: 'var(--text)' }}>
            Confirmer la réservation
          </h1>

          <div className="bg-[var(--surface)] p-6 mb-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
              Récapitulatif
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#4A6070' }}>Thérapeute</span>
                <span style={{ color: 'var(--text)' }}>{therapist?.profiles?.full_name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#4A6070' }}>Date</span>
                <span className="capitalize" style={{ color: 'var(--text)' }}>{formatDate(slot.date)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#4A6070' }}>Heure</span>
                <span style={{ color: 'var(--text)' }}>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="flex justify-between">
                <span style={{ color: 'var(--text)' }}>Total</span>
                <span style={{ color: 'var(--text)' }}>
                  {therapist?.consultation_fee ? `${therapist.consultation_fee + 4}€` : '—'}
                </span>
              </div>
              {therapist?.consultation_fee && therapist?.sector && (() => {
                const outOfPocket = Math.max((therapist.consultation_fee + 4) - 55, 6)
                return (
                  <div style={{ backgroundColor: 'var(--blue-accent)', padding: '8px 10px', marginTop: '4px' }}>
                    <p className="text-xs" style={{ color: 'var(--blue-primary)', lineHeight: 1.6 }}>
                      Reste à charge estimé avec Sécu + mutuelle : <strong>~{outOfPocket}€</strong>
                    </p>
                    {therapist.sector === '2' && (
                      <p style={{ fontSize: '0.6rem', color: '#4A6070', marginTop: '2px' }}>
                        Hors dépassements couverts par certaines mutuelles premium
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          {error && <p className="text-sm mb-4" style={{ color: '#C0392B' }}>{error}</p>}

          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--blue-primary)' }}
          >
            {paying ? 'Redirection vers le paiement...' : userId ? 'Procéder au paiement' : 'Se connecter pour réserver'}
          </button>

          <p className="text-xs text-center mt-4" style={{ color: '#4A6070' }}>
            Paiement sécurisé par Stripe
          </p>

        </div>
      </div>
    </main>
  )
}
