'use client'

import { useState, useRef } from 'react'

interface Props {
  patientId: string | null
  isStudent: boolean
  studentVerified: boolean
}

export default function StudentCTA({ patientId, isStudent, studentVerified }: Props) {
  const [open, setOpen] = useState(false)
  const [studentIdDoc, setStudentIdDoc] = useState<File | null>(null)
  const [studentCertDoc, setStudentCertDoc] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const studentIdInputRef = useRef<HTMLInputElement>(null)
  const studentCertInputRef = useRef<HTMLInputElement>(null)

  // Don't show if: not logged in, not a patient, already student (verified or pending)
  if (!patientId || isStudent) return null

  async function uploadFile(file: File, path: string): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'student-docs')
    fd.append('path', path)
    const res = await fetch('/api/upload-file', { method: 'POST', body: fd })
    let json: { publicUrl?: string; error?: string } = {}
    try { json = await res.json() } catch { /* empty */ }
    if (!res.ok) { setError('Erreur téléversement : ' + (json.error ?? `HTTP ${res.status}`)); return null }
    return json.publicUrl ?? ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!studentIdDoc) { setError('Veuillez téléverser votre carte étudiante.'); return }
    if (!studentCertDoc) { setError('Veuillez téléverser votre certificat de scolarité.'); return }

    setSubmitting(true)
    const idExt = studentIdDoc.name.split('.').pop()
    const idUrl = await uploadFile(studentIdDoc, `${patientId}/id_${Date.now()}.${idExt}`)
    if (!idUrl) { setSubmitting(false); return }

    const certExt = studentCertDoc.name.split('.').pop()
    const certUrl = await uploadFile(studentCertDoc, `${patientId}/cert_${Date.now()}.${certExt}`)
    if (!certUrl) { setSubmitting(false); return }

    const res = await fetch('/api/student-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id_url: idUrl, student_cert_url: certUrl }),
    })
    let json: { error?: string } = {}
    try { json = await res.json() } catch { /* empty */ }
    if (!res.ok) { setError(json.error ?? 'Erreur'); setSubmitting(false); return }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
        <p style={{ fontSize: '0.8rem', color: '#4A6070' }}>Documents reçus, merci !</p>
      </div>
    )
  }

  if (!open) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#4A6070', padding: 0 }}
        >
          Êtes-vous étudiant(e) ?
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
      backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '20px', width: '300px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>Statut étudiant</p>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#8A9BAD', lineHeight: 1 }}>×</button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#4A6070', marginBottom: '16px' }}>
        Transmettez vos justificatifs pour bénéficier des tarifs étudiants une fois validés.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#4A6070', marginBottom: '4px' }}>Carte étudiante</p>
          <button
            type="button"
            onClick={() => studentIdInputRef.current?.click()}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)', color: '#4A6070', cursor: 'pointer', textAlign: 'left' }}
          >
            {studentIdDoc ? studentIdDoc.name : 'Choisir un fichier'}
          </button>
          <input ref={studentIdInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) setStudentIdDoc(f) }} />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#4A6070', marginBottom: '4px' }}>Certificat de scolarité</p>
          <button
            type="button"
            onClick={() => studentCertInputRef.current?.click()}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)', color: '#4A6070', cursor: 'pointer', textAlign: 'left' }}
          >
            {studentCertDoc ? studentCertDoc.name : 'Choisir un fichier'}
          </button>
          <input ref={studentCertInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) setStudentCertDoc(f) }} />
        </div>
        {error && <p style={{ fontSize: '0.75rem', color: '#C0392B' }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '10px', fontSize: '0.85rem', backgroundColor: 'var(--blue-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: submitting ? 0.5 : 1 }}
        >
          {submitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}
