'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { generateIcs, downloadIcs } from '@/lib/ics'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 20000

interface AppointmentInfo {
  date: string
  startTime: string
  endTime: string
  therapistName: string | null
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>('loading')
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null)
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
          if (data.appointment) setAppointmentInfo(data.appointment)
          setStatus('confirmed')
        }
      } catch {
        // Keep polling on transient errors
      }
    }

    checkStatus()
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS)

    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setStatus('confirmed')
    }, POLL_TIMEOUT_MS)

    return stopPolling
  }, [sessionId])

  function handleAddToCalendar() {
    if (!appointmentInfo) return
    const name = appointmentInfo.therapistName ?? 'Thérapeute'
    const ics = generateIcs({
      title: `Séance avec ${name} — Respire Psy`,
      date: appointmentInfo.date,
      startTime: appointmentInfo.startTime,
      endTime: appointmentInfo.endTime,
      description: `Séance de thérapie avec ${name}, réservée via Respire Psy.`,
    })
    downloadIcs(`respire-seance-${appointmentInfo.date}.ics`, ics)
  }

  function formatAppointment(info: AppointmentInfo) {
    const date = new Date(info.date + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    const start = info.startTime.slice(0, 5)
    const end = info.endTime.slice(0, 5)
    return `${date}, ${start} – ${end}`
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>

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

            {appointmentInfo && (
              <p className="text-sm mb-2 capitalize" style={{ color: 'var(--text)', fontWeight: 300 }}>
                {formatAppointment(appointmentInfo)}
                {appointmentInfo.therapistName && (
                  <> · {appointmentInfo.therapistName}</>
                )}
              </p>
            )}

            <p className="text-sm font-light mb-6" style={{ color: '#4A6070', lineHeight: '1.8' }}>
              Vous recevrez une confirmation par e-mail dans quelques instants.
            </p>

            {appointmentInfo && (
              <button
                onClick={handleAddToCalendar}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  backgroundColor: 'var(--blue-primary)', color: 'white',
                  border: 'none', borderRadius: '4px',
                  padding: '10px 20px', fontSize: '0.82rem',
                  letterSpacing: '0.04em', cursor: 'pointer',
                  marginBottom: '24px',
                }}
              >
                <span>＋</span>
                Ajouter au calendrier
              </button>
            )}

            <div>
              <Link href="/account" className="text-sm" style={{ color: 'var(--blue-primary)' }}>
                Voir mes rendez-vous →
              </Link>
            </div>
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
