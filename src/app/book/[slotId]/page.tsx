'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { use } from 'react'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  therapist_id: string
  is_booked: boolean
}

interface Therapist {
  id: string
  consultation_fee: number | null
  profiles: { full_name: string | null }
}

export default function BookPage({ params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = use(params)
  const router = useRouter()
  const [slot, setSlot] = useState<Slot | null>(null)
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: slotData } = await supabase
        .from('availability')
        .select('*')
        .eq('id', slotId)
        .single()

      if (!slotData || slotData.is_booked) {
        setError('Ce créneau n\'est plus disponible.')
        setLoading(false)
        return
      }

      const { data: therapistData } = await supabase
        .from('therapists')
        .select('id, consultation_fee, profiles(full_name)')
        .eq('id', slotData.therapist_id)
        .single()

      setSlot(slotData)
      setTherapist(therapistData as Therapist)
      setLoading(false)
    }

    load()
  }, [slotId, router])

  async function handlePayment() {
    setPaying(true)
    setError('')

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId }),
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
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: '#4A6070' }}>Chargement...</p>
      </main>
    )
  }

  if (error && !slot) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#4A6070' }}>{error}</p>
          <Link href="/therapists" style={{ color: 'var(--blue-primary)', fontSize: '0.875rem' }}>
            ← Retour aux thérapeutes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="max-w-md">

          <h1 className="text-2xl font-light mb-8" style={{ color: 'var(--text)' }}>
            Confirmer la réservation
          </h1>

          {/* Summary */}
          <div className="bg-white p-6 mb-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
              Récapitulatif
            </h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#4A6070' }}>Thérapeute</span>
                <span style={{ color: 'var(--text)' }}>
                  {therapist?.profiles?.full_name ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#4A6070' }}>Date</span>
                <span className="capitalize" style={{ color: 'var(--text)' }}>
                  {slot ? formatDate(slot.date) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#4A6070' }}>Heure</span>
                <span style={{ color: 'var(--text)' }}>
                  {slot ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}` : '—'}
                </span>
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="flex justify-between font-normal">
                <span style={{ color: 'var(--text)' }}>Total</span>
                <span style={{ color: 'var(--text)' }}>
                  {therapist?.consultation_fee ? `${therapist.consultation_fee}€` : '—'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm mb-4" style={{ color: '#C0392B' }}>{error}</p>
          )}

          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--blue-primary)' }}
          >
            {paying ? 'Redirection vers le paiement...' : 'Procéder au paiement'}
          </button>

          <p className="text-xs text-center mt-4" style={{ color: '#4A6070' }}>
            Paiement sécurisé par Stripe
          </p>

        </div>
      </div>

    </main>
  )
}
