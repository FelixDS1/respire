'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'
import { createClient } from '@/lib/supabase'
import { generateIcs, downloadIcs } from '@/lib/ics'

interface Appointment {
  id: string
  status: string
  therapist_id: string
  availability: { date: string; start_time: string; end_time: string }
  therapists: { consultation_fee: number; profiles: { full_name: string } }
}

interface Profile {
  full_name: string
  email: string
  bio: string | null
  seeking: string | null
  avatar_url: string | null
  streak_frequency: string | null
  date_of_birth: string | null
}

interface WaitlistEntry {
  therapist_id: string
  therapists: { profiles: { full_name: string } }
}

interface Props {
  userId: string
  profile: Profile
  appointments: Appointment[]
  waitlistEntries: WaitlistEntry[]
  initialNir: string | null
}

type Tab = 'profile' | 'appointments' | 'calendar'
type FrequencyOption = 'weekly' | 'biweekly' | 'monthly'

function isFuture(appt: Appointment): boolean {
  if (!appt.availability) return false
  return new Date(`${appt.availability.date}T${appt.availability.start_time}`) > new Date()
}

function isPastSession(appt: Appointment): boolean {
  if (!appt.availability) return false
  const end = new Date(`${appt.availability.date}T${appt.availability.end_time}`)
  return end < new Date()
}

function computeStreak(appointments: Appointment[], frequency: string): number {
  const windowDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30
  const pastDates = appointments
    .filter(isPastSession)
    .map(a => new Date(a.availability.date + 'T00:00:00').getTime())

  if (pastDates.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let windowEndMs = today.getTime()
  let streak = 0

  while (streak < 1000) {
    const windowStartMs = windowEndMs - windowDays * 86400000
    const hasSession = pastDates.some(d => d >= windowStartMs && d <= windowEndMs)
    if (!hasSession) break
    streak++
    windowEndMs = windowStartMs - 1
  }

  return streak
}

function getTargetWeek(sessionDate: string, frequency: string | null): { monday: Date; sunday: Date } {
  const session = new Date(sessionDate + 'T00:00:00')
  const daysAhead = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 21
  const target = new Date(session)
  target.setDate(target.getDate() + daysAhead)
  const dow = target.getDay()
  const mondayDelta = dow === 0 ? -6 : 1 - dow
  const monday = new Date(target)
  monday.setDate(monday.getDate() + mondayDelta)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  return { monday, sunday }
}

const GARAMOND = "'Cormorant Garamond', Georgia, serif"
const MUTED = 'rgba(44,40,32,0.4)'
const ACCENT = '#9C7B5A'
const INPUT_BG = '#E8E4DC'
const INPUT_BORDER = '0.5px solid rgba(44,40,32,0.2)'

export default function AccountClient({ userId, profile, appointments, waitlistEntries, initialNir }: Props) {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('profile')

  // Profile edit state
  const [bio, setBio] = useState(profile.bio ?? '')
  const [dob, setDob] = useState(profile.date_of_birth ?? '')
  const [nir, setNir] = useState(initialNir ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.avatar_url)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const [photoHovered, setPhotoHovered] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Appointments (local so we can remove cancelled ones)
  const [localAppointments, setLocalAppointments] = useState(appointments)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)
  const [cancelMessage, setCancelMessage] = useState('')

  // Waitlist state
  const [localWaitlist, setLocalWaitlist] = useState(waitlistEntries)
  const [removingWaitlist, setRemovingWaitlist] = useState<string | null>(null)

  // Check-in state (keyed by appointment id)
  const [checkinOpen, setCheckinOpen] = useState<Record<string, boolean>>({})
  const [checkinMood, setCheckinMood] = useState<Record<string, number>>({})
  const [checkinNote, setCheckinNote] = useState<Record<string, string>>({})
  const [checkinSaved, setCheckinSaved] = useState<Record<string, boolean>>({})
  const [checkinSaving, setCheckinSaving] = useState<Record<string, boolean>>({})

  // Rebook slot picker (keyed by appointment id)
  const [rebookOpen, setRebookOpen] = useState<Record<string, boolean>>({})
  const [rebookSlots, setRebookSlots] = useState<Record<string, { id: string; date: string; start_time: string; end_time: string }[]>>({})
  const [rebookLoading, setRebookLoading] = useState<Record<string, boolean>>({})

  async function openRebookPicker(apptId: string, therapistId: string, sessionDate: string) {
    setRebookOpen(prev => ({ ...prev, [apptId]: true }))
    if (rebookSlots[apptId]) return
    setRebookLoading(prev => ({ ...prev, [apptId]: true }))

    const { monday, sunday } = getTargetWeek(sessionDate, streakFrequency)
    const from = monday.toISOString().split('T')[0]
    const to = sunday.toISOString().split('T')[0]

    const supabase = createClient()
    const { data } = await supabase
      .from('availability')
      .select('id, date, start_time, end_time')
      .eq('therapist_id', therapistId)
      .eq('is_booked', false)
      .gte('date', from)
      .lte('date', to)
      .order('date')
      .order('start_time')

    setRebookSlots(prev => ({ ...prev, [apptId]: data ?? [] }))
    setRebookLoading(prev => ({ ...prev, [apptId]: false }))
  }

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Streak state
  const hasPastSession = appointments.some(isPastSession)
  const [streakFrequency, setStreakFrequency] = useState<string | null>(profile.streak_frequency)
  const [showStreakModal, setShowStreakModal] = useState(!profile.streak_frequency && hasPastSession)
  const [streakSaving, setStreakSaving] = useState(false)
  const [streakError, setStreakError] = useState('')

  const streakCount = streakFrequency ? computeStreak(appointments, streakFrequency) : 0

  const streakPeriodLabel = (() => {
    if (!streakFrequency) return ''
    const n = streakCount
    if (lang === 'fr') {
      if (streakFrequency === 'weekly') return `semaine${n !== 1 ? 's' : ''} consécutive${n !== 1 ? 's' : ''}`
      if (streakFrequency === 'biweekly') return `période${n !== 1 ? 's' : ''} bi-hebdo`
      return `mois consécutif${n !== 1 ? 's' : ''}`
    } else {
      if (streakFrequency === 'weekly') return `consecutive week${n !== 1 ? 's' : ''}`
      if (streakFrequency === 'biweekly') return `consecutive bi-weekly period${n !== 1 ? 's' : ''}`
      return `consecutive month${n !== 1 ? 's' : ''}`
    }
  })()

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { setError(lang === 'en' ? 'Photo must be under 4 MB.' : 'La photo ne doit pas dépasser 4 Mo.'); return }
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoRemoved(false)
    setError('')
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-avatar', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(`Photo upload failed: ${json.error ?? res.status}`)
        setPhotoPreview(profile.avatar_url)
        return
      }
      setPhotoPreview(json.url)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleRemovePhoto() {
    setPhotoPreview(null)
    setPhotoRemoved(true)
    if (photoInputRef.current) photoInputRef.current.value = ''
    setError('')
    const res = await fetch('/api/save-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, dob, nir, removeAvatar: true }),
    })
    if (!res.ok) {
      setError(lang === 'en' ? 'Failed to remove photo.' : 'Erreur lors de la suppression de la photo.')
      setPhotoPreview(profile.avatar_url)
      setPhotoRemoved(false)
    }
  }

  async function saveProfile() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, dob, nir }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? (lang === 'en' ? 'Save failed' : 'Erreur lors de la sauvegarde'))
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setError(e?.message ?? (lang === 'en' ? 'Save failed' : 'Erreur lors de la sauvegarde'))
    } finally {
      setSaving(false)
    }
  }

  async function saveStreakFrequency(freq: FrequencyOption) {
    setStreakSaving(true)
    setStreakError('')
    try {
      const res = await fetch('/api/save-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: freq }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStreakError(json.error ?? 'Save failed')
        return
      }
      setStreakFrequency(freq)
      setShowStreakModal(false)
    } catch (e: any) {
      setStreakError(e?.message ?? 'Unknown error')
    } finally {
      setStreakSaving(false)
    }
  }

  async function cancelAppointment(id: string) {
    setCancellingId(id)
    setCancelMessage('')
    try {
      const res = await fetch('/api/cancel-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setCancelMessage(json.error ?? (lang === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'))
      } else {
        setLocalAppointments(prev => prev.filter(a => a.id !== id))
        setCancelMessage(json.refunded
          ? (lang === 'fr' ? 'Rendez-vous annulé. Remboursement en cours.' : 'Appointment cancelled. Refund is on its way.')
          : (lang === 'fr' ? 'Rendez-vous annulé. Aucun remboursement (moins de 24h).' : 'Appointment cancelled. No refund within 24h of session.'))
        setCancelConfirmId(null)
      }
    } catch {
      setCancelMessage(lang === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')
    } finally {
      setCancellingId(null)
    }
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/'
      } else {
        const json = await res.json()
        alert(json.error ?? 'Error deleting account.')
        setDeleting(false)
      }
    } catch {
      alert('An error occurred.')
      setDeleting(false)
    }
  }

  async function removeFromWaitlist(therapistId: string) {
    setRemovingWaitlist(therapistId)
    try {
      await fetch('/api/waitlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId }),
      })
      setLocalWaitlist(prev => prev.filter(e => e.therapist_id !== therapistId))
    } finally {
      setRemovingWaitlist(null)
    }
  }

  async function saveCheckin(appointmentId: string) {
    const mood = checkinMood[appointmentId]
    if (!mood) return
    setCheckinSaving(prev => ({ ...prev, [appointmentId]: true }))
    try {
      await fetch('/api/save-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, moodScore: mood, note: checkinNote[appointmentId] ?? '' }),
      })
      setCheckinSaved(prev => ({ ...prev, [appointmentId]: true }))
    } finally {
      setCheckinSaving(prev => ({ ...prev, [appointmentId]: false }))
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function formatTime(timeStr: string) { return timeStr.slice(0, 5) }

  function handleAddToCalendar(appt: Appointment) {
    if (!appt.availability) return
    const name = appt.therapists?.profiles?.full_name ?? 'Thérapeute'
    const title = lang === 'fr'
      ? `Séance avec ${name} — Respire`
      : `Session with ${name} — Respire`
    const description = lang === 'fr'
      ? `Séance de thérapie avec ${name}, réservée via Respire.`
      : `Therapy session with ${name}, booked via Respire.`
    const ics = generateIcs({
      title,
      date: appt.availability.date,
      startTime: appt.availability.start_time,
      endTime: appt.availability.end_time,
      description,
    })
    downloadIcs(`respire-${appt.availability.date}.ics`, ics)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: lang === 'en' ? 'My profile' : 'Mon profil' },
    { key: 'appointments', label: lang === 'en' ? 'My appointments' : 'Mes rendez-vous' },
    { key: 'calendar', label: lang === 'en' ? 'Calendar' : 'Calendrier' },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap');`}</style>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F2EFE8', width: '100%' }}>

        {/* Page header */}
        <div style={{ padding: '2rem 2.5rem 0' }}>
          <h1 style={{ fontFamily: GARAMOND, fontSize: '2rem', fontWeight: 400, color: 'rgba(44,40,32,0.9)', margin: 0, lineHeight: 1.1 }}>
            {lang === 'en' ? 'My profile' : 'Mon profil'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(44,40,32,0.45)', marginTop: '0.25rem', marginBottom: 0 }}>
            {profile.full_name}
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ borderBottom: '0.5px solid rgba(44,40,32,0.15)', display: 'flex', marginTop: '1.5rem' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '0.85rem 1.5rem',
                fontSize: '0.8rem',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === t.key ? ACCENT : 'transparent'}`,
                color: tab === t.key ? ACCENT : MUTED,
                cursor: 'pointer',
                marginBottom: '-0.5px',
                letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1 }}>

            {/* Left sidebar */}
            <div style={{ borderRight: '0.5px solid rgba(0,0,0,0.12)', padding: '2rem' }}>

              {/* Photo — click anywhere to change */}
              <div
                onClick={() => photoInputRef.current?.click()}
                onMouseEnter={() => setPhotoHovered(true)}
                onMouseLeave={() => setPhotoHovered(false)}
                style={{
                  width: '180px',
                  height: '200px',
                  border: '0.5px solid rgba(0,0,0,0.12)',
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  backgroundColor: '#E8E4DC',
                  flexShrink: 0,
                }}
              >
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
                {!photoPreview && !photoUploading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: MUTED, fontSize: '0.72rem', textAlign: 'center', lineHeight: 1.6 }}>
                      {lang === 'fr' ? 'Cliquer pour\najouter une photo' : 'Click to\nadd a photo'}
                    </span>
                  </div>
                )}
                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.38)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: photoHovered && !!photoPreview && !photoUploading ? 1 : 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                }}>
                  <span style={{ color: 'white', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    {lang === 'fr' ? 'Changer la photo' : 'Change photo'}
                  </span>
                </div>
                {photoUploading && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                      {lang === 'fr' ? 'Chargement...' : 'Uploading...'}
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{ fontSize: '0.72rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0 0', display: 'block' }}
                >
                  {lang === 'fr' ? 'Supprimer' : 'Remove'}
                </button>
              )}

              {/* Name */}
              <p style={{ fontFamily: GARAMOND, fontSize: '1.3rem', fontWeight: 400, color: 'rgba(44,40,32,0.9)', marginTop: '1rem', marginBottom: '0.2rem' }}>
                {profile.full_name}
              </p>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 0 }}>
                {lang === 'fr' ? 'Membre' : 'Member'}
              </p>

              <hr style={{ border: 'none', borderTop: '0.5px solid rgba(0,0,0,0.12)', margin: '1.5rem 0' }} />

              {/* Suivi */}
              {streakFrequency ? (
                <div>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, marginBottom: '0.75rem' }}>
                    {lang === 'fr' ? 'Suivi' : 'Streak'}
                  </p>
                  <div style={{ height: '3px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(streakCount / 16, 1) * 100}%`, backgroundColor: ACCENT, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                  </div>
                  <p style={{ fontFamily: GARAMOND, fontSize: '2.5rem', fontWeight: 400, color: 'rgba(44,40,32,0.9)', lineHeight: 1, marginBottom: '0.25rem' }}>
                    {streakCount}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(44,40,32,0.45)', marginBottom: '0.6rem' }}>
                    {streakPeriodLabel}
                  </p>
                  <button
                    onClick={() => setShowStreakModal(true)}
                    style={{ fontSize: '0.72rem', color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {lang === 'fr' ? 'Modifier →' : 'Edit →'}
                  </button>
                </div>
              ) : hasPastSession ? (
                <button
                  onClick={() => setShowStreakModal(true)}
                  style={{ fontSize: '0.72rem', color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', lineHeight: 1.5 }}
                >
                  {lang === 'fr' ? 'Configurer un suivi →' : 'Set up a streak →'}
                </button>
              ) : null}
            </div>

            {/* Right main area */}
            <div style={{ padding: '2rem 2.5rem' }}>

              {/* À propos de vous */}
              <div style={{ backgroundColor: '#EDE9E0', padding: '1.25rem', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: '1rem' }}>
                  {lang === 'fr' ? 'À propos de vous' : 'About you'}
                </p>
                <MemberBioEditor
                  value={bio}
                  onChange={setBio}
                  placeholder={lang === 'fr'
                    ? 'Quelques mots sur vous, vos attentes, ce qui vous amène...'
                    : 'A few words about yourself, your expectations, what brings you here...'}
                  inputStyle={{
                    width: '100%',
                    minHeight: '130px',
                    backgroundColor: '#E4DFD5',
                    border: '0.5px solid rgba(44,40,32,0.2)',
                    padding: '0.85rem 1rem',
                    fontSize: '0.88rem',
                    lineHeight: '1.75',
                    resize: 'vertical',
                    borderRadius: '4px',
                    color: 'rgba(44,40,32,0.85)',
                    outline: 'none',
                  }}
                />
              </div>

              <hr style={{ border: 'none', borderTop: '0.5px solid rgba(0,0,0,0.1)', margin: '1.5rem 0' }} />

              {/* Informations personnelles */}
              <div>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: '1rem' }}>
                  {lang === 'fr' ? 'Informations personnelles' : 'Personal information'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'rgba(44,40,32,0.5)', display: 'block', marginBottom: '0.4rem' }}>
                      {lang === 'fr' ? 'Date de naissance' : 'Date of birth'}
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      style={{ background: INPUT_BG, border: INPUT_BORDER, padding: '0.65rem 1rem', borderRadius: '4px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box', color: 'rgba(44,40,32,0.85)', outline: 'none' }}
                    />
                  </div>
                  <div />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '0.5px solid rgba(0,0,0,0.1)', margin: '1.5rem 0' }} />

              {/* Sécurité sociale */}
              <div>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: '1rem' }}>
                  {lang === 'fr' ? 'Sécurité sociale' : 'Social security'}
                </p>
                <label style={{ fontSize: '0.72rem', color: 'rgba(44,40,32,0.5)', display: 'block', marginBottom: '0.4rem' }}>
                  {lang === 'fr' ? 'Numéro de sécurité sociale (NIR)' : 'Social security number (NIR)'}
                </label>
                <input
                  type="text"
                  value={nir}
                  onChange={e => setNir(e.target.value)}
                  placeholder="1 85 12 75 108 001 28"
                  style={{ background: INPUT_BG, border: INPUT_BORDER, padding: '0.65rem 1rem', borderRadius: '4px', fontSize: '0.88rem', width: '100%', maxWidth: '320px', boxSizing: 'border-box', color: 'rgba(44,40,32,0.85)', outline: 'none' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgba(44,40,32,0.38)', marginTop: '0.4rem' }}>
                  {lang === 'fr'
                    ? 'Utilisé uniquement pour générer vos feuilles de soins.'
                    : 'Used only to generate your reimbursement receipts.'}
                </p>
              </div>

              {error && (
                <p style={{ fontSize: '0.875rem', color: '#C0392B', marginTop: '1rem' }}>{error}</p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  style={{
                    background: ACCENT, color: '#fff', border: 'none',
                    padding: '0.75rem 2rem', fontSize: '0.78rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderRadius: '4px', cursor: saving ? 'default' : 'pointer',
                    opacity: saving ? 0.6 : 1, transition: 'opacity 0.15s',
                  }}
                >
                  {saving
                    ? (lang === 'en' ? 'Saving...' : 'Enregistrement...')
                    : (lang === 'en' ? 'Save' : 'Enregistrer')}
                </button>
                <button
                  onClick={() => { setBio(profile.bio ?? ''); setDob(profile.date_of_birth ?? ''); setNir(initialNir ?? '') }}
                  disabled={saving}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: MUTED, padding: 0, letterSpacing: '0.03em' }}
                >
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                {saved && (
                  <span style={{ fontSize: '0.8rem', color: ACCENT }}>
                    {lang === 'en' ? 'Profile updated' : 'Profil mis à jour'}
                  </span>
                )}
              </div>

              {/* Account deletion */}
              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{ fontSize: '0.75rem', color: 'rgba(44,40,32,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {lang === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}
                  </button>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(44,40,32,0.6)', lineHeight: 1.7, marginBottom: '1rem' }}>
                      {lang === 'fr'
                        ? 'Cette action est irréversible. Toutes vos données seront supprimées. Annulez vos rendez-vous à venir avant de continuer.'
                        : 'This action is irreversible. All your data will be deleted. Please cancel any upcoming appointments before continuing.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={deleteAccount}
                        disabled={deleting}
                        style={{ background: '#8A9BAD', color: 'white', border: 'none', padding: '0.6rem 1.5rem', fontSize: '0.78rem', letterSpacing: '0.06em', borderRadius: '4px', cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.5 : 1 }}
                      >
                        {deleting
                          ? (lang === 'fr' ? 'Suppression...' : 'Deleting...')
                          : (lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion')}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: MUTED, padding: 0 }}
                      >
                        {lang === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Appointments tab ── */}
        {tab === 'appointments' && (
          <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
            {cancelMessage && (
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: cancelMessage.includes('erreur') || cancelMessage.includes('error') ? '#C0392B' : 'var(--blue-primary)' }}>
                {cancelMessage}
              </p>
            )}
            {localAppointments.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: MUTED }}>
                {lang === 'en' ? 'No appointments.' : 'Aucun rendez-vous.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {localAppointments.map(appt => {
                  const future = isFuture(appt)
                  const confirming = cancelConfirmId === appt.id
                  return (
                    <div key={appt.id} style={{ backgroundColor: 'var(--surface)', padding: '20px 24px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          {appt.availability && (
                            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(44,40,32,0.85)', marginBottom: '4px', textTransform: 'capitalize' }}>
                              {formatDate(appt.availability.date)}
                              <span style={{ fontWeight: 400, color: MUTED }}>
                                {' · '}{formatTime(appt.availability.start_time)} – {formatTime(appt.availability.end_time)}
                              </span>
                            </p>
                          )}
                          <p style={{ fontSize: '0.78rem', color: MUTED }}>
                            {appt.therapists?.profiles?.full_name}
                            {appt.therapists?.consultation_fee ? ` · ${appt.therapists.consultation_fee + 4}€` : ''}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.68rem', padding: '4px 12px', backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', borderRadius: '20px', letterSpacing: '0.06em' }}>
                          {lang === 'en' ? 'Confirmed' : 'Confirmé'}
                        </span>
                      </div>

                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href={`/messages?with=${appt.therapist_id}&name=${encodeURIComponent(appt.therapists?.profiles?.full_name ?? 'Thérapeute')}`}
                          style={{ fontSize: '0.75rem', color: 'var(--blue-primary)' }}>
                          {lang === 'fr' ? 'Message →' : 'Message →'}
                        </Link>
                        <button
                          onClick={() => handleAddToCalendar(appt)}
                          style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {lang === 'fr' ? '+ Ajouter au calendrier' : '+ Add to calendar'}
                        </button>
                      </div>

                      {!future && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                          {streakFrequency ? (
                            !rebookOpen[appt.id] ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button onClick={() => openRebookPicker(appt.id, appt.therapist_id, appt.availability.date)}
                                  style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                  {lang === 'fr' ? 'Reprendre ma séance →' : 'Rebook a session →'}
                                </button>
                                <Link href="/therapists" style={{ fontSize: '0.75rem', color: MUTED }}>
                                  {lang === 'fr' ? "Voir d'autres thérapeutes" : 'See other therapists'}
                                </Link>
                              </div>
                            ) : (
                              <div>
                                {(() => {
                                  const { monday, sunday } = getTargetWeek(appt.availability.date, streakFrequency)
                                  const weekLabel = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                                    + ' – ' + sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                                  const slots = rebookSlots[appt.id] ?? []
                                  const loading = rebookLoading[appt.id]
                                  const byDate: Record<string, typeof slots> = {}
                                  for (const s of slots) {
                                    if (!byDate[s.date]) byDate[s.date] = []
                                    byDate[s.date].push(s)
                                  }
                                  return (
                                    <div>
                                      <p style={{ fontSize: '0.75rem', marginBottom: '12px', color: MUTED }}>
                                        {lang === 'fr' ? `Créneaux disponibles · semaine du ${weekLabel}` : `Available slots · week of ${weekLabel}`}
                                      </p>
                                      {loading ? (
                                        <p style={{ fontSize: '0.75rem', color: MUTED }}>{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                                      ) : slots.length === 0 ? (
                                        <div>
                                          <p style={{ fontSize: '0.75rem', color: MUTED, marginBottom: '8px' }}>
                                            {lang === 'fr' ? 'Aucun créneau disponible cette semaine.' : 'No slots available this week.'}
                                          </p>
                                          <Link href={`/therapists/${appt.therapist_id}`} style={{ fontSize: '0.75rem', color: 'var(--blue-primary)' }}>
                                            {lang === 'fr' ? 'Voir tous les créneaux →' : 'View all slots →'}
                                          </Link>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {Object.entries(byDate).map(([date, daySlots]) => (
                                            <div key={date} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                              <span style={{ fontSize: '0.75rem', color: MUTED, minWidth: '80px', textTransform: 'capitalize' }}>
                                                {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                              </span>
                                              {daySlots.map(s => (
                                                <Link key={s.id} href={`/book/${s.id}`}
                                                  style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                                                  {s.start_time.slice(0, 5)}
                                                </Link>
                                              ))}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                                        <button onClick={() => setRebookOpen(prev => ({ ...prev, [appt.id]: false }))}
                                          style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                          {lang === 'fr' ? 'Fermer' : 'Close'}
                                        </button>
                                        <Link href="/therapists" style={{ fontSize: '0.75rem', color: MUTED }}>
                                          {lang === 'fr' ? "Voir d'autres thérapeutes" : 'See other therapists'}
                                        </Link>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            )
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <Link href={`/therapists/${appt.therapist_id}`} style={{ fontSize: '0.75rem', color: 'var(--blue-primary)' }}>
                                {lang === 'fr' ? 'Reprendre un rendez-vous →' : 'Book another session →'}
                              </Link>
                              <button onClick={() => setShowStreakModal(true)}
                                style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                {lang === 'fr' ? 'Configurer un suivi ?' : 'Set up a streak?'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {future && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                          {!checkinOpen[appt.id] && !checkinSaved[appt.id] && (
                            <button onClick={() => setCheckinOpen(prev => ({ ...prev, [appt.id]: true }))}
                              style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              {lang === 'fr' ? 'Préparer ma séance →' : 'Prepare my session →'}
                            </button>
                          )}
                          {checkinSaved[appt.id] && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--blue-primary)' }}>
                              {lang === 'fr' ? '✓ Check-in enregistré' : '✓ Check-in saved'}
                            </p>
                          )}
                          {checkinOpen[appt.id] && !checkinSaved[appt.id] && (
                            <div>
                              <p style={{ fontSize: '0.75rem', marginBottom: '12px', color: MUTED }}>
                                {lang === 'fr' ? "Comment vous sentez-vous aujourd'hui ?" : 'How are you feeling today?'}
                              </p>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                {[1, 2, 3, 4, 5].map(score => (
                                  <button key={score} onClick={() => setCheckinMood(prev => ({ ...prev, [appt.id]: score }))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: checkinMood[appt.id] === score ? 1 : 0.35, fontSize: '1.4rem', padding: '2px 4px' }}>
                                    {['😔', '😕', '😐', '🙂', '😊'][score - 1]}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={checkinNote[appt.id] ?? ''}
                                onChange={e => setCheckinNote(prev => ({ ...prev, [appt.id]: e.target.value }))}
                                rows={2}
                                placeholder={lang === 'fr' ? 'Une note pour votre thérapeute (facultatif)...' : 'A note for your therapist (optional)...'}
                                style={{ resize: 'none', marginBottom: '8px', width: '100%', padding: '8px 12px', fontSize: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button onClick={() => saveCheckin(appt.id)} disabled={!checkinMood[appt.id] || checkinSaving[appt.id]}
                                  style={{ fontSize: '0.75rem', padding: '6px 16px', color: 'white', backgroundColor: 'var(--blue-primary)', cursor: 'pointer', borderRadius: '8px', border: 'none', opacity: (!checkinMood[appt.id] || checkinSaving[appt.id]) ? 0.4 : 1 }}>
                                  {checkinSaving[appt.id] ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'fr' ? 'Enregistrer' : 'Save')}
                                </button>
                                <button onClick={() => setCheckinOpen(prev => ({ ...prev, [appt.id]: false }))}
                                  style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {future && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                          {!confirming ? (
                            <button onClick={() => setCancelConfirmId(appt.id)}
                              style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              {lang === 'fr' ? 'Annuler ce rendez-vous' : 'Cancel this appointment'}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <p style={{ fontSize: '0.75rem', color: MUTED }}>
                                {lang === 'fr' ? 'Remboursement si annulation ≥ 24h avant. Confirmer ?' : 'Refund if cancelled ≥ 24h before. Confirm?'}
                              </p>
                              <button onClick={() => cancelAppointment(appt.id)} disabled={cancellingId === appt.id}
                                style={{ fontSize: '0.75rem', color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: cancellingId === appt.id ? 0.4 : 1 }}>
                                {cancellingId === appt.id ? (lang === 'fr' ? 'Annulation...' : 'Cancelling...') : (lang === 'fr' ? 'Confirmer' : 'Confirm')}
                              </button>
                              <button onClick={() => setCancelConfirmId(null)}
                                style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                {lang === 'fr' ? 'Retour' : 'Back'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Waitlist */}
            {localWaitlist.length > 0 && (
              <div style={{ marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: MUTED, marginBottom: '1rem' }}>
                  {lang === 'fr' ? "Listes d'attente" : 'Waitlists'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {localWaitlist.map(entry => (
                    <div key={entry.therapist_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface)', padding: '14px 20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(44,40,32,0.85)' }}>{entry.therapists?.profiles?.full_name}</p>
                        <p style={{ fontSize: '0.72rem', marginTop: '2px', color: MUTED }}>
                          {lang === 'fr' ? "Vous serez notifié dès qu'un créneau se libère" : "You'll be notified when a slot opens"}
                        </p>
                      </div>
                      <button onClick={() => removeFromWaitlist(entry.therapist_id)} disabled={removingWaitlist === entry.therapist_id}
                        style={{ fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: removingWaitlist === entry.therapist_id ? 0.4 : 1 }}>
                        {removingWaitlist === entry.therapist_id ? '...' : (lang === 'fr' ? 'Retirer' : 'Remove')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Calendar tab ── */}
        {tab === 'calendar' && (
          <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
            <MembreCalendarTab appointments={appointments} lang={lang} />
          </div>
        )}

      </main>

      {/* Streak setup modal */}
      {showStreakModal && (
        <StreakSetupModal
          current={streakFrequency as FrequencyOption | null}
          onSave={saveStreakFrequency}
          onSkip={() => setShowStreakModal(false)}
          saving={streakSaving}
          errorMsg={streakError}
          lang={lang}
        />
      )}
    </>
  )
}

// ─── Streak setup modal ───────────────────────────────────────────────────────

function StreakSetupModal({ current, onSave, onSkip, saving, errorMsg, lang }: {
  current: FrequencyOption | null
  onSave: (freq: FrequencyOption) => void
  onSkip: () => void
  saving: boolean
  errorMsg: string
  lang: string
}) {
  const [selected, setSelected] = useState<FrequencyOption | null>(current)

  const options: {
    key: FrequencyOption
    titleFr: string; titleEn: string
    descFr: string; descEn: string
  }[] = [
    { key: 'weekly', titleFr: 'Chaque semaine', titleEn: 'Every week', descFr: 'Une séance par semaine', descEn: 'One session per week' },
    { key: 'biweekly', titleFr: 'Toutes les deux semaines', titleEn: 'Every two weeks', descFr: 'Une séance toutes les deux semaines', descEn: 'One session every two weeks' },
    { key: 'monthly', titleFr: 'Chaque mois', titleEn: 'Every month', descFr: 'Une séance par mois', descEn: 'One session per month' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
      <div style={{ backgroundColor: '#F2EFE8', width: '100%', maxWidth: '400px', padding: '36px 32px', border: '0.5px solid rgba(44,40,32,0.15)', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, marginBottom: '12px' }}>
          {lang === 'fr' ? 'Suivi thérapeutique' : 'Therapy streak'}
        </p>
        <h2 style={{ fontFamily: GARAMOND, fontSize: '1.4rem', fontWeight: 400, color: 'rgba(44,40,32,0.9)', marginBottom: '8px' }}>
          {lang === 'fr' ? 'Continuez sur votre lancée.' : 'Keep the momentum going.'}
        </h2>
        <p style={{ fontSize: '0.8rem', color: MUTED, marginBottom: '28px', lineHeight: 1.7 }}>
          {lang === 'fr'
            ? "Choisissez votre fréquence de rendez-vous désirée. Ceci ne vous engage à rien, c'est simplement un système pour vous motiver à prendre le nombre de rendez-vous qui vous aidera à respirer."
            : "Choose your desired session frequency. This is not a commitment — it's simply a way to motivate yourself to book the sessions that will help you feel zen."}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {options.map(opt => (
            <button key={opt.key} type="button" onClick={() => setSelected(opt.key)}
              style={{ textAlign: 'left', padding: '14px 16px', cursor: 'pointer', border: `0.5px solid ${selected === opt.key ? ACCENT : 'rgba(44,40,32,0.15)'}`, borderRadius: '4px', backgroundColor: selected === opt.key ? 'rgba(156,123,90,0.08)' : '#EDE9E0', transition: 'all 0.15s' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: selected === opt.key ? ACCENT : 'rgba(44,40,32,0.85)', marginBottom: '2px' }}>
                {lang === 'fr' ? opt.titleFr : opt.titleEn}
              </p>
              <p style={{ fontSize: '0.72rem', color: MUTED }}>
                {lang === 'fr' ? opt.descFr : opt.descEn}
              </p>
            </button>
          ))}
        </div>

        {errorMsg && <p style={{ fontSize: '0.75rem', color: '#C0392B', marginBottom: '12px' }}>{errorMsg}</p>}

        <button onClick={() => selected && onSave(selected)} disabled={!selected || saving}
          style={{ width: '100%', padding: '0.75rem', color: '#fff', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: ACCENT, cursor: selected ? 'pointer' : 'default', borderRadius: '4px', border: 'none', opacity: (!selected || saving) ? 0.4 : 1, transition: 'opacity 0.15s' }}>
          {saving ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'fr' ? 'Commencer mon suivi' : 'Start tracking')}
        </button>

        <button onClick={onSkip}
          style={{ display: 'block', margin: '16px auto 0', fontSize: '0.75rem', color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>
          {lang === 'fr' ? 'Plus tard' : 'Maybe later'}
        </button>
      </div>
    </div>
  )
}

// ─── Member calendar tab ──────────────────────────────────────────────────────

function MembreCalendarTab({ appointments, lang }: { appointments: Appointment[]; lang: string }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dow = today.getDay()
  const mondayDelta = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(monday.getDate() + mondayDelta + weekOffset * 7)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })

  const apptMap: Record<string, Record<string, Appointment>> = {}
  for (const appt of appointments) {
    if (!appt.availability) continue
    const dateStr = appt.availability.date
    const timeStr = appt.availability.start_time.slice(0, 5)
    if (!apptMap[dateStr]) apptMap[dateStr] = {}
    apptMap[dateStr][timeStr] = appt
  }

  const weekDates = days.map(d => d.toISOString().split('T')[0])
  const timesThisWeek = new Set<string>()
  for (const date of weekDates) {
    if (apptMap[date]) Object.keys(apptMap[date]).forEach(t => timesThisWeek.add(t))
  }
  const timeRows = Array.from(timesThisWeek).sort()

  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB'

  function DayHeader() {
    return (
      <>
        <div style={{ backgroundColor: 'var(--surface)' }} />
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString()
          return (
            <div key={i} style={{ backgroundColor: isToday ? 'var(--blue-accent)' : 'var(--surface)', textAlign: 'center', padding: '10px 4px' }}>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4A6070' }}>
                {d.toLocaleDateString(locale, { weekday: 'short' })}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: isToday ? 600 : 400, color: isToday ? 'var(--blue-primary)' : 'var(--text)', marginTop: '2px', lineHeight: 1 }}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <button onClick={() => setWeekOffset(o => o - 1)}
          style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text)', padding: '6px 14px', fontSize: '0.875rem' }}>
          ←
        </button>
        <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
          {lang === 'fr' ? 'Semaine du' : 'Week of'}{' '}
          {monday.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setWeekOffset(o => o + 1)}
          style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text)', padding: '6px 14px', fontSize: '0.875rem' }}>
          →
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', minWidth: '560px', backgroundColor: 'var(--border)', gap: '1px' }}>
          <DayHeader />
          {timeRows.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--surface)', textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#4A6070', fontSize: '0.875rem' }}>
                {lang === 'fr' ? 'Aucun rendez-vous cette semaine.' : 'No appointments this week.'}
              </p>
            </div>
          ) : (
            timeRows.map(time => (
              <Fragment key={time}>
                <div style={{ backgroundColor: 'var(--surface)', textAlign: 'right', paddingRight: '6px', paddingTop: '13px', fontSize: '0.6rem', color: '#4A6070' }}>
                  {time}
                </div>
                {days.map((d, colIdx) => {
                  const dateStr = d.toISOString().split('T')[0]
                  const appt = apptMap[dateStr]?.[time]
                  return (
                    <div key={colIdx} style={{ backgroundColor: 'var(--surface)', height: '56px', padding: '4px' }}>
                      {appt && (
                        <div style={{ height: '100%', backgroundColor: 'var(--blue-primary)', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px 6px' }}>
                          <span style={{ fontSize: '0.62rem', color: 'white', textAlign: 'center', overflow: 'hidden', maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {appt.therapists?.profiles?.full_name ?? ''}
                          </span>
                          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                            {time} – {appt.availability.end_time.slice(0, 5)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MemberBioEditor({ value, onChange, placeholder, inputStyle }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  inputStyle: Record<string, string | number | undefined>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInput() {
    const el = ref.current
    if (!el) return
    onChange(el.textContent ?? '')
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      data-placeholder={placeholder}
      className="bio-editor w-full"
      style={{
        ...inputStyle,
        wordBreak: 'break-word',
        overflowY: 'auto',
      }}
    />
  )
}
