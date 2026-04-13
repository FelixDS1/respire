'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 20000

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>('loading')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    function stopPolling() {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    async function checkStatus() {
      try {
        const res = await fetch(`/api/booking-confirm?session_id=${encodeURIComponent(sessionId!)}`)
        const data = await res.json()
        if (data.confirmed) {
          stopPolling()
          setStatus('confirmed')
        }
      } catch {
        // Keep polling on transient errors
      }
    }

    // Poll immediately, then every POLL_INTERVAL_MS
    checkStatus()
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS)

    // Give up after POLL_TIMEOUT_MS — payment was taken; webhook may still arrive
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      // Show confirmed anyway — Stripe already charged, webhook will arrive eventually
      setStatus('confirmed')
    }, POLL_TIMEOUT_MS)

    return stopPolling
  }, [sessionId])

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-sm text-center">

        {status === 'loading' && (
          <p className="text-sm" style={{ color: '#4A6070' }}>Confirmation en cours...</p>
        )}

        {status === 'confirmed' && (
          <>
            <div
              className="w-12 h-12 mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'var(--blue-accent)', border: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--blue-primary)', fontSize: '1.25rem' }}>✓</span>
            </div>
            <h1 className="text-2xl font-light mb-3" style={{ color: 'var(--text)' }}>
              Réservation confirmée
            </h1>
            <p className="text-sm font-light mb-8" style={{ color: '#4A6070', lineHeight: '1.8' }}>
              Vous recevrez une confirmation par e-mail dans quelques instants.
            </p>
            <Link href="/therapists" className="text-sm" style={{ color: 'var(--blue-primary)' }}>
              ← Retour aux thérapeutes
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-light mb-3" style={{ color: 'var(--text)' }}>
              Une erreur est survenue
            </h1>
            <p className="text-sm font-light mb-8" style={{ color: '#4A6070' }}>
              Votre paiement a peut-être été traité. Contactez-nous si vous ne recevez pas de confirmation.
            </p>
            <Link href="/therapists" className="text-sm" style={{ color: 'var(--blue-primary)' }}>
              ← Retour aux thérapeutes
            </Link>
          </>
        )}

      </div>
    </div>
  )
}

export default function BookingSuccess() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: '#4A6070' }}>Chargement...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
