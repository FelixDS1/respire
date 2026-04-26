'use client'

import { useState } from 'react'

interface Stats {
  patientCount: number
  recentSignups: number
  therapistTotal: number
  therapistVerified: number
  appointmentTotal: number
  appointmentsLast30: number
  revenueReleased: number
}

interface ChurnPatient {
  id: string
  full_name: string | null
  email: string | null
  created_at?: string
}

interface WaitlistSignup {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

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

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: '#EDE9E0', borderRadius: '14px', padding: '1.2rem 1.5rem',
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44,40,32,0.4)', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#2C2820', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', color: '#8A9BAD', margin: 0 }}>{sub}</p>}
    </div>
  )
}

export default function AdminClient({
  therapists,
  pendingStudents = [],
  waitlistSignups = [],
  stats,
  neverActivated = [],
  wentQuiet = [],
}: {
  therapists: Therapist[]
  pendingStudents?: PendingStudent[]
  waitlistSignups?: WaitlistSignup[]
  stats: Stats
  neverActivated?: ChurnPatient[]
  wentQuiet?: ChurnPatient[]
}) {
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

        <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)', fontFamily: 'Georgia, serif' }}>Admin</h1>
        <p className="text-sm mb-8" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>Tableau de bord Respire</p>

        {/* ── Stats ── */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: 'rgba(44,40,32,0.4)' }}>
            Plateforme
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            <StatCard label="Membres" value={stats.patientCount} sub={`+${stats.recentSignups} cette semaine`} />
            <StatCard label="Thérapeutes" value={stats.therapistVerified} sub={`${stats.therapistTotal} total, ${stats.therapistTotal - stats.therapistVerified} en attente`} />
            <StatCard label="Séances" value={stats.appointmentTotal} sub={`${stats.appointmentsLast30} ce mois`} />
            <StatCard label="Revenus reversés" value={`${stats.revenueReleased}€`} sub="virements libérés" />
          </div>
        </section>

        {/* ── Churn ── */}
        {(neverActivated.length > 0 || wentQuiet.length > 0) && (
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: '#C0392B' }}>
              Churn & inactivité
            </h2>

            {wentQuiet.length > 0 && (
              <div className="mb-6">
                <p className="text-xs mb-3" style={{ fontFamily: 'Georgia, serif', color: '#4A6070' }}>
                  Ont réservé, puis plus rien depuis 45 jours ({wentQuiet.length})
                </p>
                <div className="flex flex-col gap-2">
                  {wentQuiet.map(p => (
                    <ChurnRow key={p.id} patient={p} />
                  ))}
                </div>
              </div>
            )}

            {neverActivated.length > 0 && (
              <div>
                <p className="text-xs mb-3" style={{ fontFamily: 'Georgia, serif', color: '#4A6070' }}>
                  Inscrits depuis +14 jours, n'ont jamais réservé ({neverActivated.length})
                </p>
                <div className="flex flex-col gap-2">
                  {neverActivated.map(p => (
                    <ChurnRow key={p.id} patient={p} sub={p.created_at ? `Inscrit le ${new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : undefined} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Pre-launch waitlist ── */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: '#9C7B5A' }}>
            Liste d'attente pré-lancement ({waitlistSignups.length})
          </h2>
          {waitlistSignups.length === 0 ? (
            <p className="text-sm" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>Aucune inscription pour l'instant.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {waitlistSignups.map(s => (
                <div key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)', minWidth: '140px', fontFamily: 'Georgia, serif' }}>{s.name}</p>
                  <p className="text-xs" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>{s.email}</p>
                  {s.phone && <p className="text-xs" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>{s.phone}</p>}
                  <p className="text-xs ml-auto" style={{ color: 'rgba(44,40,32,0.3)', fontFamily: 'Georgia, serif' }}>
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Student verifications ── */}
        {students.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: '#C0392B' }}>
              Étudiants en attente de vérification ({students.length})
            </h2>
            <div className="flex flex-col gap-4">
              {students.map(s => (
                <div key={s.patient_id} className="bg-[var(--surface)] px-6 py-5" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{s.profiles?.full_name ?? '—'}</p>
                      <p className="text-xs" style={{ color: '#4A6070' }}>{s.profiles?.email ?? '—'}</p>
                    </div>
                    <span className="text-xs px-2 py-1" style={{ backgroundColor: '#FFF3F3', color: '#C0392B' }}>En attente</span>
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

        {/* ── Pending therapists ── */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: '#C0392B' }}>
            Thérapeutes en attente ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>Aucun thérapeute en attente.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pending.map(t => (
                <TherapistCard key={t.id} t={t} onVerify={verify} verifying={verifying} />
              ))}
            </div>
          )}
        </section>

        {/* ── Verified therapists ── */}
        <section>
          <h2 className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: 'var(--blue-primary)' }}>
            Vérifiés ({verified.length})
          </h2>
          {verified.length === 0 ? (
            <p className="text-sm" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>Aucun thérapeute vérifié.</p>
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

function ChurnRow({ patient, sub }: { patient: ChurnPatient; sub?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
      <p className="text-sm" style={{ color: 'var(--text)', minWidth: '140px', fontFamily: 'Georgia, serif' }}>{patient.full_name ?? '—'}</p>
      <p className="text-xs" style={{ color: '#4A6070', fontFamily: 'Georgia, serif' }}>{patient.email ?? '—'}</p>
      {sub && <p className="text-xs ml-auto" style={{ color: 'rgba(44,40,32,0.3)', fontFamily: 'Georgia, serif' }}>{sub}</p>}
    </div>
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
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.profiles?.full_name ?? '—'}</p>
          <p className="text-xs mb-1" style={{ color: '#4A6070' }}>{t.profiles?.email ?? '—'}</p>
          {t.rpps_number && <p className="text-xs" style={{ color: '#4A6070' }}>RPPS : <strong style={{ color: 'var(--text)' }}>{t.rpps_number}</strong></p>}
          {t.adeli_number && <p className="text-xs" style={{ color: '#4A6070' }}>ADELI : <strong style={{ color: 'var(--text)' }}>{t.adeli_number}</strong></p>}
          {!t.rpps_number && !t.adeli_number && <p className="text-xs" style={{ color: '#8A9BAD' }}>Numéro non renseigné</p>}
        </div>
        <span className="text-xs px-2 py-1" style={{
          backgroundColor: t.is_verified ? 'var(--blue-accent)' : '#FFF3F3',
          color: t.is_verified ? 'var(--blue-primary)' : '#C0392B',
        }}>
          {t.is_verified ? '✓ Vérifié' : 'En attente'}
        </span>
      </div>
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
