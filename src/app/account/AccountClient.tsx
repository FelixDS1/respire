'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'
import { createClient } from '@/lib/supabase'

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
  photo_url: string | null
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

export default function AccountClient({ userId, profile, appointments, waitlistEntries, initialNir }: Props) {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('profile')

  // Profile edit state
  const [bio, setBio] = useState(profile.bio ?? '')
  const [dob, setDob] = useState(profile.date_of_birth ?? '')
  const [nir, setNir] = useState(initialNir ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url)
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
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
    if (rebookSlots[apptId]) return // already loaded
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError(lang === 'en' ? 'Photo must be under 5 MB.' : 'La photo ne doit pas dépasser 5 Mo.'); return }
    setNewPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  async function saveProfile() {
    setSaving(true)
    setError('')
    const supabase = createClient()

    let photoUrl = profile.photo_url
    if (newPhoto) {
      const ext = newPhoto.name.split('.').pop()
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/avatar.${ext}`, newPhoto, { upsert: true })
      if (uploadError) {
        setError(lang === 'en' ? 'Photo upload failed. Please try again.' : 'Erreur lors du téléversement de la photo.')
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      photoUrl = publicUrl
    }

    await supabase.from('profiles').update({
      bio: bio.trim() || null,
      photo_url: photoUrl,
      date_of_birth: dob || null,
    }).eq('id', userId)

    await supabase.from('patient_sensitive').upsert({
      patient_id: userId,
      nir: nir.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'patient_id' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    color: 'var(--text)',
    outline: 'none',
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: lang === 'en' ? 'My profile' : 'Mon profil' },
    { key: 'appointments', label: lang === 'en' ? 'My appointments' : 'Mes rendez-vous' },
    { key: 'calendar', label: lang === 'en' ? 'Calendar' : 'Calendrier' },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>
              {lang === 'en' ? 'My profile' : 'Mon profil'}
            </h1>
            <p className="text-sm" style={{ color: '#4A6070' }}>{profile.full_name}</p>
          </div>
          <Link
            href="/therapists"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--blue-primary)', border: '1px solid var(--blue-primary)', padding: '6px 16px', whiteSpace: 'nowrap' }}
          >
            {lang === 'fr' ? 'Prendre un rendez-vous' : 'Book a session'}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-6 py-3 text-sm transition-colors"
              style={{
                borderBottom: tab === t.key ? '2px solid var(--blue-primary)' : '2px solid transparent',
                color: tab === t.key ? 'var(--blue-primary)' : '#4A6070',
                background: 'none', cursor: 'pointer', marginBottom: '-1px',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div>
            <div className="flex gap-8">

              {/* Left: portrait photo + name + streak */}
              <div style={{ width: '190px', flexShrink: 0 }}>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    width: '190px', height: '250px',
                    backgroundColor: '#EEF2F5',
                    backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                    cursor: 'pointer', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                  }}
                >
                  {!photoPreview && (
                    <span style={{ color: '#8A9BAD', fontSize: '0.7rem', textAlign: 'center', padding: '0 20px', lineHeight: 1.6 }}>
                      {lang === 'fr' ? 'Cliquer pour\najouter une photo' : 'Click to\nadd a photo'}
                    </span>
                  )}
                  {photoPreview && (
                    <div
                      style={{ position: 'absolute', inset: 0, opacity: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <span style={{ color: 'white', fontSize: '0.65rem', letterSpacing: '0.06em' }}>MODIFIER</span>
                    </div>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange} className="hidden" />
                <div style={{ padding: '12px 0 14px' }}>
                  <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>{profile.full_name}</p>
                  <p style={{ color: '#8A9BAD', fontSize: '0.72rem', marginTop: '2px', letterSpacing: '0.02em' }}>Membre</p>
                </div>

                {/* Streak indicator */}
                {streakFrequency && (
                  <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8A9BAD', marginBottom: '6px' }}>
                      {lang === 'fr' ? 'Suivi' : 'Streak'}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--blue-primary)', lineHeight: 1 }}>
                      {streakCount}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: '#4A6070', marginTop: '4px', lineHeight: 1.4 }}>
                      {streakPeriodLabel}
                    </p>
                    <button
                      onClick={() => setShowStreakModal(true)}
                      style={{ fontSize: '0.65rem', color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '8px' }}
                    >
                      {lang === 'fr' ? 'Modifier' : 'Edit'}
                    </button>
                  </div>
                )}

                {/* Prompt to set up streak if past session but no frequency yet */}
                {!streakFrequency && hasPastSession && (
                  <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setShowStreakModal(true)}
                      style={{ fontSize: '0.72rem', color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1.5, textAlign: 'left' }}
                    >
                      {lang === 'fr' ? 'Configurer un suivi →' : 'Set up a streak →'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right: bio */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                  {lang === 'fr' ? 'À propos de vous' : 'About you'}
                </p>
                <MemberBioEditor
                  value={bio}
                  onChange={setBio}
                  placeholder={lang === 'fr'
                    ? 'Quelques mots sur vous, vos attentes, ce qui vous amène...'
                    : 'A few words about yourself, your expectations, what brings you here...'}
                  inputStyle={{ ...inputStyle, resize: 'vertical' }}
                />

                <div style={{ marginTop: '20px' }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                    {lang === 'fr' ? 'Date de naissance' : 'Date of birth'}
                  </p>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="text-sm px-3 py-2"
                    style={{ border: '1px solid var(--border)', color: 'var(--text)', backgroundColor: 'white', outline: 'none' }}
                  />
                </div>

                <div style={{ marginTop: '20px' }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                    {lang === 'fr' ? 'Numéro de sécurité sociale (NIR)' : 'Social security number (NIR)'}
                  </p>
                  <input
                    type="text"
                    value={nir}
                    onChange={e => setNir(e.target.value)}
                    placeholder="1 85 12 75 108 001 28"
                    className="text-sm px-3 py-2"
                    style={{ border: '1px solid var(--border)', color: 'var(--text)', backgroundColor: 'white', outline: 'none', width: '100%', maxWidth: '260px' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#8A9BAD' }}>
                    {lang === 'fr'
                      ? 'Utilisé uniquement pour générer vos feuilles de soins.'
                      : 'Used only to generate your reimbursement receipts.'}
                  </p>
                </div>
              </div>
            </div>

            {error && <p className="text-sm mt-4" style={{ color: '#C0392B' }}>{error}</p>}

            <div className="flex items-center gap-4" style={{ borderTop: '1px solid var(--border)', marginTop: '28px', paddingTop: '20px' }}>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-8 py-2 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
              >
                {saving ? (lang === 'en' ? 'Saving...' : 'Enregistrement...') : (lang === 'en' ? 'Save' : 'Enregistrer')}
              </button>
              {saved && (
                <span className="text-sm" style={{ color: 'var(--blue-primary)' }}>
                  {lang === 'en' ? 'Profile updated' : 'Profil mis à jour'}
                </span>
              )}
            </div>

            {/* Account deletion */}
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#8A9BAD' }}>
                {lang === 'fr' ? 'Zone de danger' : 'Danger zone'}
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {lang === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}
                </button>
              ) : (
                <div>
                  <p className="text-sm mb-4" style={{ color: '#4A6070', lineHeight: 1.7 }}>
                    {lang === 'fr'
                      ? 'Cette action est irréversible. Toutes vos données seront supprimées. Annulez vos rendez-vous à venir avant de continuer.'
                      : 'This action is irreversible. All your data will be deleted. Please cancel any upcoming appointments before continuing.'}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={deleteAccount}
                      disabled={deleting}
                      className="px-6 py-2 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: '#C0392B', cursor: 'pointer' }}
                    >
                      {deleting
                        ? (lang === 'fr' ? 'Suppression...' : 'Deleting...')
                        : (lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion')}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-sm hover:opacity-70"
                      style={{ color: '#4A6070', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {lang === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments tab */}
        {tab === 'appointments' && (
          <div>
            {cancelMessage && (
              <p className="text-sm mb-4" style={{ color: cancelMessage.includes('erreur') || cancelMessage.includes('error') ? '#C0392B' : 'var(--blue-primary)' }}>
                {cancelMessage}
              </p>
            )}
            {localAppointments.length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>
                {lang === 'en' ? 'No appointments.' : 'Aucun rendez-vous.'}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {localAppointments.map(appt => {
                  const future = isFuture(appt)
                  const confirming = cancelConfirmId === appt.id
                  return (
                    <div key={appt.id} className="bg-white px-6 py-5"
                      style={{ border: '1px solid var(--border)' }}>
                      <div className="flex justify-between items-start">
                        <div>
                          {appt.availability && (
                            <p className="text-sm font-medium capitalize mb-1" style={{ color: 'var(--text)' }}>
                              {formatDate(appt.availability.date)}
                              <span style={{ fontWeight: 400, color: '#4A6070' }}>
                                {' '}{'·'}{' '}{formatTime(appt.availability.start_time)} – {formatTime(appt.availability.end_time)}
                              </span>
                            </p>
                          )}
                          <p className="text-xs" style={{ color: '#4A6070' }}>
                            {appt.therapists?.profiles?.full_name}
                            {appt.therapists?.consultation_fee
                              ? ` · ${appt.therapists.consultation_fee}€`
                              : ''}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1"
                          style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                          {lang === 'en' ? 'Confirmed' : 'Confirmé'}
                        </span>
                      </div>

                      {/* Message therapist */}
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                        <Link
                          href={`/messages?with=${appt.therapist_id}&name=${encodeURIComponent(appt.therapists?.profiles?.full_name ?? 'Thérapeute')}`}
                          className="text-xs hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--blue-primary)' }}
                        >
                          {lang === 'fr' ? 'Message →' : 'Message →'}
                        </Link>
                      </div>

                      {/* Past: rebook CTA */}
                      {!future && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                          {streakFrequency ? (
                            // Smart slot picker for members with a streak
                            !rebookOpen[appt.id] ? (
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => openRebookPicker(appt.id, appt.therapist_id, appt.availability.date)}
                                  className="text-xs hover:opacity-70 transition-opacity"
                                  style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  {lang === 'fr' ? 'Reprendre ma séance →' : 'Rebook a session →'}
                                </button>
                                <Link
                                  href="/therapists"
                                  className="text-xs hover:opacity-70 transition-opacity"
                                  style={{ color: '#8A9BAD' }}
                                >
                                  {lang === 'fr' ? 'Voir d\'autres thérapeutes' : 'See other therapists'}
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

                                  // Group slots by date
                                  const byDate: Record<string, typeof slots> = {}
                                  for (const s of slots) {
                                    if (!byDate[s.date]) byDate[s.date] = []
                                    byDate[s.date].push(s)
                                  }

                                  return (
                                    <div>
                                      <p className="text-xs mb-3" style={{ color: '#4A6070' }}>
                                        {lang === 'fr'
                                          ? `Créneaux disponibles · semaine du ${weekLabel}`
                                          : `Available slots · week of ${weekLabel}`}
                                      </p>
                                      {loading ? (
                                        <p className="text-xs" style={{ color: '#8A9BAD' }}>
                                          {lang === 'fr' ? 'Chargement...' : 'Loading...'}
                                        </p>
                                      ) : slots.length === 0 ? (
                                        <div>
                                          <p className="text-xs mb-2" style={{ color: '#8A9BAD' }}>
                                            {lang === 'fr'
                                              ? 'Aucun créneau disponible cette semaine.'
                                              : 'No slots available this week.'}
                                          </p>
                                          <Link
                                            href={`/therapists/${appt.therapist_id}`}
                                            className="text-xs hover:opacity-70"
                                            style={{ color: 'var(--blue-primary)' }}
                                          >
                                            {lang === 'fr' ? 'Voir tous les créneaux →' : 'View all slots →'}
                                          </Link>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col gap-2">
                                          {Object.entries(byDate).map(([date, daySlots]) => (
                                            <div key={date} className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs capitalize" style={{ color: '#4A6070', minWidth: '80px' }}>
                                                {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                              </span>
                                              {daySlots.map(s => (
                                                <Link
                                                  key={s.id}
                                                  href={`/book/${s.id}`}
                                                  className="text-xs px-2 py-1 hover:opacity-80 transition-opacity"
                                                  style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)', border: '1px solid var(--border)' }}
                                                >
                                                  {s.start_time.slice(0, 5)}
                                                </Link>
                                              ))}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-4 mt-3">
                                        <button
                                          onClick={() => setRebookOpen(prev => ({ ...prev, [appt.id]: false }))}
                                          className="text-xs hover:opacity-70"
                                          style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                          {lang === 'fr' ? 'Fermer' : 'Close'}
                                        </button>
                                        <Link
                                          href="/therapists"
                                          className="text-xs hover:opacity-70"
                                          style={{ color: '#8A9BAD' }}
                                        >
                                          {lang === 'fr' ? 'Voir d\'autres thérapeutes' : 'See other therapists'}
                                        </Link>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            )
                          ) : (
                            // No streak: simple rebook link + gentle streak prompt
                            <div className="flex items-center gap-4">
                              <Link
                                href={`/therapists/${appt.therapist_id}`}
                                className="text-xs hover:opacity-70 transition-opacity"
                                style={{ color: 'var(--blue-primary)' }}
                              >
                                {lang === 'fr' ? 'Reprendre un rendez-vous →' : 'Book another session →'}
                              </Link>
                              <button
                                onClick={() => setShowStreakModal(true)}
                                className="text-xs hover:opacity-70 transition-opacity"
                                style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                {lang === 'fr' ? 'Configurer un suivi ?' : 'Set up a streak?'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pre-session check-in */}
                      {future && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                          {!checkinOpen[appt.id] && !checkinSaved[appt.id] && (
                            <button
                              onClick={() => setCheckinOpen(prev => ({ ...prev, [appt.id]: true }))}
                              className="text-xs hover:opacity-70 transition-opacity"
                              style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              {lang === 'fr' ? 'Préparer ma séance →' : 'Prepare my session →'}
                            </button>
                          )}
                          {checkinSaved[appt.id] && (
                            <p className="text-xs" style={{ color: 'var(--blue-primary)' }}>
                              {lang === 'fr' ? '✓ Check-in enregistré' : '✓ Check-in saved'}
                            </p>
                          )}
                          {checkinOpen[appt.id] && !checkinSaved[appt.id] && (
                            <div>
                              <p className="text-xs mb-3" style={{ color: '#4A6070' }}>
                                {lang === 'fr' ? 'Comment vous sentez-vous aujourd\'hui ?' : 'How are you feeling today?'}
                              </p>
                              <div className="flex gap-2 mb-3">
                                {[1, 2, 3, 4, 5].map(score => (
                                  <button key={score} onClick={() => setCheckinMood(prev => ({ ...prev, [appt.id]: score }))}
                                    className="text-lg transition-opacity"
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
                                className="w-full px-3 py-2 text-xs"
                                style={{ ...inputStyle, resize: 'none', marginBottom: '8px' }}
                              />
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => saveCheckin(appt.id)}
                                  disabled={!checkinMood[appt.id] || checkinSaving[appt.id]}
                                  className="text-xs px-4 py-1.5 text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                                  style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
                                >
                                  {checkinSaving[appt.id]
                                    ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...')
                                    : (lang === 'fr' ? 'Enregistrer' : 'Save')}
                                </button>
                                <button onClick={() => setCheckinOpen(prev => ({ ...prev, [appt.id]: false }))}
                                  className="text-xs hover:opacity-70"
                                  style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cancel */}
                      {future && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                          {!confirming ? (
                            <button
                              onClick={() => setCancelConfirmId(appt.id)}
                              className="text-xs hover:opacity-70 transition-opacity"
                              style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              {lang === 'fr' ? 'Annuler ce rendez-vous' : 'Cancel this appointment'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-4">
                              <p className="text-xs" style={{ color: '#4A6070' }}>
                                {lang === 'fr'
                                  ? 'Remboursement si annulation ≥ 24h avant. Confirmer ?'
                                  : 'Refund if cancelled ≥ 24h before. Confirm?'}
                              </p>
                              <button
                                onClick={() => cancelAppointment(appt.id)}
                                disabled={cancellingId === appt.id}
                                className="text-xs hover:opacity-70 disabled:opacity-40"
                                style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                {cancellingId === appt.id
                                  ? (lang === 'fr' ? 'Annulation...' : 'Cancelling...')
                                  : (lang === 'fr' ? 'Confirmer' : 'Confirm')}
                              </button>
                              <button
                                onClick={() => setCancelConfirmId(null)}
                                className="text-xs hover:opacity-70"
                                style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
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
          </div>
        )}

        {/* Waitlist section within appointments tab */}
        {tab === 'appointments' && localWaitlist.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid var(--border)' }}>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
              {lang === 'fr' ? 'Listes d\'attente' : 'Waitlists'}
            </p>
            <div className="flex flex-col gap-2">
              {localWaitlist.map(entry => (
                <div key={entry.therapist_id} className="flex items-center justify-between bg-white px-5 py-4"
                  style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>
                      {entry.therapists?.profiles?.full_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8A9BAD' }}>
                      {lang === 'fr' ? 'Vous serez notifié dès qu\'un créneau se libère' : 'You\'ll be notified when a slot opens'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromWaitlist(entry.therapist_id)}
                    disabled={removingWaitlist === entry.therapist_id}
                    className="text-xs hover:opacity-70 transition-opacity disabled:opacity-40"
                    style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {removingWaitlist === entry.therapist_id
                      ? '...'
                      : (lang === 'fr' ? 'Retirer' : 'Remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar tab */}
        {tab === 'calendar' && (
          <MembreCalendarTab appointments={appointments} lang={lang} />
        )}

      </div>

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
    </main>
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
    {
      key: 'weekly',
      titleFr: 'Chaque semaine', titleEn: 'Every week',
      descFr: 'Une séance par semaine', descEn: 'One session per week',
    },
    {
      key: 'biweekly',
      titleFr: 'Toutes les deux semaines', titleEn: 'Every two weeks',
      descFr: 'Une séance toutes les deux semaines', descEn: 'One session every two weeks',
    },
    {
      key: 'monthly',
      titleFr: 'Chaque mois', titleEn: 'Every month',
      descFr: 'Une séance par mois', descEn: 'One session per month',
    },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '24px',
    }}>
      <div style={{
        backgroundColor: 'white', width: '100%', maxWidth: '400px',
        padding: '36px 32px', border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue-primary)', marginBottom: '12px' }}>
          {lang === 'fr' ? 'Suivi thérapeutique' : 'Therapy streak'}
        </p>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 300, color: 'var(--text)', marginBottom: '8px' }}>
          {lang === 'fr' ? 'Continuez sur votre lancée.' : 'Keep the momentum going.'}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#4A6070', marginBottom: '28px', lineHeight: 1.7 }}>
          {lang === 'fr'
            ? "Choisissez votre fréquence de rendez-vous désirée. Ceci ne vous engage à rien, c'est simplement un système pour vous motiver à prendre le nombre de rendez-vous qui vous aidera à respirer."
            : "Choose your desired session frequency. This is not a commitment — it's simply a way to motivate yourself to book the sessions that will help you feel zen."}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {options.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt.key)}
              style={{
                textAlign: 'left', padding: '14px 16px', cursor: 'pointer',
                border: `1px solid ${selected === opt.key ? 'var(--blue-primary)' : 'var(--border)'}`,
                backgroundColor: selected === opt.key ? 'var(--blue-accent)' : 'white',
                transition: 'all 0.15s',
              }}
            >
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: selected === opt.key ? 'var(--blue-primary)' : 'var(--text)', marginBottom: '2px' }}>
                {lang === 'fr' ? opt.titleFr : opt.titleEn}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#4A6070' }}>
                {lang === 'fr' ? opt.descFr : opt.descEn}
              </p>
            </button>
          ))}
        </div>

        {errorMsg && (
          <p style={{ fontSize: '0.75rem', color: '#C0392B', marginBottom: '12px' }}>{errorMsg}</p>
        )}

        <button
          onClick={() => selected && onSave(selected)}
          disabled={!selected || saving}
          className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: 'var(--blue-primary)', cursor: selected ? 'pointer' : 'default' }}
        >
          {saving
            ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...')
            : (lang === 'fr' ? 'Commencer mon suivi' : 'Start tracking')}
        </button>

        <button
          onClick={onSkip}
          style={{ display: 'block', margin: '16px auto 0', fontSize: '0.75rem', color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer' }}
        >
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

  // Build lookup: date -> HH:MM -> Appointment
  const apptMap: Record<string, Record<string, Appointment>> = {}
  for (const appt of appointments) {
    if (!appt.availability) continue
    const dateStr = appt.availability.date
    const timeStr = appt.availability.start_time.slice(0, 5)
    if (!apptMap[dateStr]) apptMap[dateStr] = {}
    apptMap[dateStr][timeStr] = appt
  }

  // Only show time rows present in this week
  const weekDates = days.map(d => d.toISOString().split('T')[0])
  const timesThisWeek = new Set<string>()
  for (const date of weekDates) {
    if (apptMap[date]) Object.keys(apptMap[date]).forEach(t => timesThisWeek.add(t))
  }
  const timeRows = Array.from(timesThisWeek).sort()

  const blue = 'var(--blue-primary)'
  const border = 'var(--border)'
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB'

  function DayHeader() {
    return (
      <>
        <div style={{ backgroundColor: 'white' }} />
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString()
          return (
            <div key={i} style={{ backgroundColor: isToday ? '#EEF5FF' : 'white', textAlign: 'center', padding: '10px 4px' }}>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4A6070' }}>
                {d.toLocaleDateString(locale, { weekday: 'short' })}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: isToday ? 600 : 400, color: isToday ? blue : 'var(--text)', marginTop: '2px', lineHeight: 1 }}>
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
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setWeekOffset(o => o - 1)}
          style={{ border: `1px solid ${border}`, background: 'white', cursor: 'pointer', color: 'var(--text)', padding: '4px 12px', fontSize: '0.875rem' }}>
          ←
        </button>
        <span className="text-sm" style={{ color: 'var(--text)' }}>
          {lang === 'fr' ? 'Semaine du' : 'Week of'}{' '}
          {monday.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setWeekOffset(o => o + 1)}
          style={{ border: `1px solid ${border}`, background: 'white', cursor: 'pointer', color: 'var(--text)', padding: '4px 12px', fontSize: '0.875rem' }}>
          →
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', minWidth: '560px', border: `1px solid ${border}`, backgroundColor: border, gap: '1px' }}>
          <DayHeader />

          {timeRows.length === 0 ? (
            <>
              <div style={{ gridColumn: '1 / -1', backgroundColor: 'white', textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#4A6070', fontSize: '0.875rem' }}>
                  {lang === 'fr' ? 'Aucun rendez-vous cette semaine.' : 'No appointments this week.'}
                </p>
              </div>
            </>
          ) : (
            timeRows.map(time => (
              <Fragment key={time}>
                <div style={{ backgroundColor: 'white', textAlign: 'right', paddingRight: '6px', paddingTop: '13px', fontSize: '0.6rem', color: '#4A6070' }}>
                  {time}
                </div>
                {days.map((d, colIdx) => {
                  const dateStr = d.toISOString().split('T')[0]
                  const appt = apptMap[dateStr]?.[time]
                  return (
                    <div key={colIdx} style={{ backgroundColor: 'white', height: '56px', padding: '4px' }}>
                      {appt && (
                        <div style={{
                          height: '100%', backgroundColor: blue, borderRadius: '2px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px 6px',
                        }}>
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
      className="bio-editor w-full px-4 py-3 text-sm"
      style={{
        ...inputStyle,
        minHeight: '220px',
        textAlign: 'justify',
        wordBreak: 'break-word',
        outline: 'none',
        overflowY: 'auto',
      }}
    />
  )
}
