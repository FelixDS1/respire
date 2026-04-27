'use client'

import { useState } from 'react'
import Link from 'next/link'

const G = 'Georgia, serif'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontFamily: G,
  fontSize: '0.95rem',
  border: '1px solid rgba(44,40,32,0.18)',
  borderRadius: '10px',
  backgroundColor: '#F2EFE8',
  color: '#2C2820',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function ListeAttentePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [referral, setReferral] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadySignedUp, setAlreadySignedUp] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/pre-launch-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, referral }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Une erreur est survenue.')
        setLoading(false)
        return
      }
      setAlreadySignedUp(!!json.alreadySignedUp)
      setDone(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'var(--blue-accent)', opacity: 0.25, top: '-150px', right: '-100px' }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', backgroundColor: 'var(--green-soft)', opacity: 0.15, bottom: '-80px', left: '-80px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'block', marginBottom: '2.5rem', textDecoration: 'none' }}>
          <p style={{ fontFamily: G, fontSize: '1.1rem', fontWeight: 400, color: '#2C2820', letterSpacing: '0.05em' }}>
            respire
          </p>
        </Link>

        {done ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontFamily: G, fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', color: '#9C7B5A', marginBottom: '1rem', lineHeight: 1.2 }}>
              {alreadySignedUp ? 'Vous êtes déjà inscrit·e.' : 'Bienvenue sur la liste.'}
            </p>
            <p style={{ fontFamily: G, fontSize: '0.92rem', color: 'rgba(44,40,32,0.6)', lineHeight: 1.75, marginBottom: '2rem' }}>
              {alreadySignedUp
                ? "Votre adresse e-mail figure déjà sur notre liste. Nous vous contacterons dès l'ouverture."
                : "Nous vous contacterons dès que Respire ouvrira ses portes. Merci de votre confiance."}
            </p>
            <Link href="/" style={{
              display: 'inline-block', fontFamily: G, fontSize: '0.88rem',
              color: 'var(--blue-primary)', textDecoration: 'none',
            }}>
              ← Retour à l'accueil
            </Link>
          </div>
        ) : (
          <>
            {/* Heading */}
            <h1 style={{ fontFamily: G, fontSize: '2.2rem', fontWeight: 300, lineHeight: 1.25, color: '#2C2820', margin: '0 0 0.75rem' }}>
              Rejoignez la liste<br />
              <em style={{ fontStyle: 'italic', color: '#9C7B5A' }}>d'attente</em>
            </h1>
            <p style={{ fontFamily: G, fontSize: '0.92rem', color: 'rgba(44,40,32,0.6)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '340px' }}>
              Respire arrive bientôt — la plateforme qui simplifie l'accès au suivi psychologique qui vous correspond. Inscrivez-vous pour être notifié lors de notre lancement.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div>
                <label style={{ display: 'block', fontFamily: G, fontSize: '0.8rem', color: 'rgba(44,40,32,0.55)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Prénom et nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Marie Dupont"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: G, fontSize: '0.8rem', color: 'rgba(44,40,32,0.55)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="marie@exemple.fr"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: G, fontSize: '0.8rem', color: 'rgba(44,40,32,0.55)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Téléphone{' '}
                  <span style={{ color: 'rgba(44,40,32,0.35)', fontSize: '0.75rem' }}>— facultatif, pour un éventuel appel avec le fondateur :)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: G, fontSize: '0.8rem', color: 'rgba(44,40,32,0.55)', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Comment avez-vous entendu parler de nous ?
                </label>
                <select
                  value={referral}
                  onChange={e => setReferral(e.target.value)}
                  style={{ ...inputStyle, color: referral ? '#2C2820' : 'rgba(44,40,32,0.4)', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232C2820' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
                >
                  <option value="" disabled>Choisir…</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Un(e) ami(e)">Un(e) ami(e)</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {error && (
                <p style={{ fontFamily: G, fontSize: '0.85rem', color: '#C0392B' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  padding: '14px 0',
                  backgroundColor: '#2C2820',
                  color: '#F2EFE8',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: G,
                  fontSize: '0.95rem',
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                  width: '100%',
                }}
              >
                {loading ? 'Envoi…' : "M'inscrire sur la liste"}
              </button>

              <p style={{ fontFamily: G, fontSize: '0.75rem', color: 'rgba(44,40,32,0.4)', textAlign: 'center', lineHeight: 1.6 }}>
                Vos données ne seront jamais revendues. Consultez notre{' '}
                <Link href="/privacy" style={{ color: 'var(--blue-primary)' }}>politique de confidentialité</Link>.
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
