'use client'

import { useState } from 'react'

interface Therapist {
  id: string
  is_verified: boolean
  rpps_number: string | null
  adeli_number: string | null
  credentials_urls: string[] | null
  signedUrls: string[]
  profiles: { full_name: string | null; email: string | null } | null
}

interface PendingStudent {
  patient_id: string
  student_id_url: string | null
  student_cert_url: string | null
  student_verified: boolean
  profiles: { full_name: string | null; email: string | null } | null
  signedUrls: { idUrl: string | null; certUrl: string | null }
}

export default function AdminClient({ therapists, pendingStudents = [] }: { therapists: Therapist[]; pendingStudents?: PendingStudent[] }) {
  const [list, setList] = useState(therapists)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [students, setStudents] = useState(pendingStudents)
  const [verifyingStudent, setVerifyingStudent] = useState<string | null>(null)

  async function verify(id: string) {
    setVerifying(id)
    try {
      await fetch('/api/admin/verify-therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId: id }),
      })
      setList(prev => prev.map(t => t.id === id ? { ...t, is_verified: true } : t))
    } finally {
      setVerifying(null)
    }
  }

  async function verifyStudent(patientId: string) {
    setVerifyingStudent(patientId)
    try {
      await fetch('/api/admin/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      setStudents(prev => prev.filter(s => s.patient_id !== patientId))
    } finally {
      setVerifyingStudent(null)
    }
  }

  const pending = list.filter(t => !t.is_verified)
  const verified = list.filter(t => t.is_verified)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>Admin</h1>
        <p className="text-sm mb-10" style={{ color: '#4A6070' }}>Vérification des thérapeutes et étudiants</p>

        {/* Student verifications */}
        {students.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: '#C0392B' }}>
              Étudiants en attente de vérification ({students.length})
            </h2>
            <div className="flex flex-col gap-4">
              {students.map(s => (
                <div key={s.patient_id} className="bg-[var(--surface)] px-6 py-5" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                        {s.profiles?.full_name ?? '—'}
                      </p>
                      <p className="text-xs" style={{ color: '#4A6070' }}>{s.profiles?.email ?? '—'}</p>
                    </div>
                    <span className="text-xs px-2 py-1" style={{ backgroundColor: '#FFF3F3', color: '#C0392B' }}>
                      En attente
                    </span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    {s.signedUrls.idUrl && (
                      <a href={s.signedUrls.idUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs hover:opacity-70"
                        style={{ color: 'var(--blue-primary)', border: '1px solid var(--border)', padding: '4px 10px', backgroundColor: 'var(--surface)' }}>
                        Carte étudiante →
                      </a>
                    )}
                    {s.signedUrls.certUrl && (
                      <a href={s.signedUrls.certUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs hover:opacity-70"
                        style={{ color: 'var(--blue-primary)', border: '1px solid var(--border)', padding: '4px 10px', backgroundColor: 'var(--surface)' }}>
                        Certificat de scolarité →
                      </a>
                    )}
                  </div>
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => verifyStudent(s.patient_id)}
                      disabled={verifyingStudent === s.patient_id}
                      className="text-sm transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ backgroundColor: 'var(--blue-primary)', color: 'white', border: 'none', cursor: 'pointer', padding: '6px 20px' }}
                    >
                      {verifyingStudent === s.patient_id ? 'Vérification...' : 'Valider le statut étudiant'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending therapists */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: '#C0392B' }}>
            Thérapeutes en attente ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm" style={{ color: '#4A6070' }}>Aucun thérapeute en attente.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pending.map(t => (
                <TherapistCard key={t.id} t={t} onVerify={verify} verifying={verifying} />
              ))}
            </div>
          )}
        </section>

        {/* Verified therapists */}
        <section>
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
            Vérifiés ({verified.length})
          </h2>
          {verified.length === 0 ? (
            <p className="text-sm" style={{ color: '#4A6070' }}>Aucun thérapeute vérifié.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {verified.map(t => (
                <TherapistCard key={t.id} t={t} onVerify={verify} verifying={verifying} />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

function TherapistCard({ t, onVerify, verifying }: {
  t: Therapist
  onVerify: (id: string) => void
  verifying: string | null
}) {
  return (
    <div className="bg-[var(--surface)] px-6 py-5" style={{ border: '1px solid var(--border)' }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            {t.profiles?.full_name ?? '—'}
          </p>
          <p className="text-xs mb-1" style={{ color: '#4A6070' }}>{t.profiles?.email ?? '—'}</p>
          {t.rpps_number && (
            <p className="text-xs" style={{ color: '#4A6070' }}>
              RPPS : <strong style={{ color: 'var(--text)' }}>{t.rpps_number}</strong>
            </p>
          )}
          {t.adeli_number && (
            <p className="text-xs" style={{ color: '#4A6070' }}>
              ADELI : <strong style={{ color: 'var(--text)' }}>{t.adeli_number}</strong>
            </p>
          )}
          {!t.rpps_number && !t.adeli_number && (
            <p className="text-xs" style={{ color: '#8A9BAD' }}>Numéro non renseigné</p>
          )}
        </div>
        <span className="text-xs px-2 py-1"
          style={{
            backgroundColor: t.is_verified ? 'var(--blue-accent)' : '#FFF3F3',
            color: t.is_verified ? 'var(--blue-primary)' : '#C0392B',
          }}>
          {t.is_verified ? '✓ Vérifié' : 'En attente'}
        </span>
      </div>

      {/* Credential files */}
      {t.signedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {t.signedUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--blue-primary)', border: '1px solid var(--border)', padding: '4px 10px', backgroundColor: 'var(--surface)' }}>
              Justificatif {i + 1} →
            </a>
          ))}
        </div>
      )}

      {/* Verify button */}
      {!t.is_verified && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onVerify(t.id)}
            disabled={verifying === t.id}
            className="text-sm transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: 'var(--blue-primary)', color: 'white', border: 'none', cursor: 'pointer', padding: '6px 20px' }}
          >
            {verifying === t.id ? 'Vérification...' : 'Marquer comme vérifié'}
          </button>
        </div>
      )}
    </div>
  )
}
