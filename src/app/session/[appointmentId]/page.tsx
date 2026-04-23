'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const G = 'Georgia, serif'

export default function SessionPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const router = useRouter()
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Lock body scroll while in session
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    if (!appointmentId) return
    fetch(`/api/video-room?appointmentId=${encodeURIComponent(appointmentId)}`)
      .then(r => r.json())
      .then(json => {
        if (json.url) setRoomUrl(json.url)
        else setError(json.error ?? 'Impossible de rejoindre la séance.')
      })
      .catch(() => setError('Impossible de rejoindre la séance.'))
      .finally(() => setLoading(false))
  }, [appointmentId])

  // Loading
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: '#1C2B3A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.15)',
          borderTopColor: 'rgba(255,255,255,0.6)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <p style={{ fontFamily: G, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Connexion à la séance…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: '#1C2B3A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '20px',
      }}>
        <p style={{ fontFamily: G, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          {error}
        </p>
        <Link href="/account" style={{
          fontFamily: G, fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.45)',
          textDecoration: 'underline',
        }}>
          ← Retour
        </Link>
      </div>
    )
  }

  // Live session
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: '#1C2B3A',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Minimal header */}
      <div style={{
        flexShrink: 0,
        height: '48px',
        backgroundColor: '#1C2B3A',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: G, fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.06em',
        }}>
          RESPIRE · Séance en cours
        </span>
        <button
          onClick={() => router.back()}
          style={{
            fontFamily: G, fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.45)',
            background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '999px', padding: '5px 16px',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Quitter
        </button>
      </div>

      {/* Daily.co iframe */}
      <iframe
        src={roomUrl!}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        title="Séance vidéo Respire"
      />
    </div>
  )
}
