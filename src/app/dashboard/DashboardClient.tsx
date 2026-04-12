'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import { createClient } from '@/lib/supabase'
import { specialtyTranslations, languageTranslations, useLanguage } from '@/lib/language'

const ALL_SPECIALTIES = Object.keys(specialtyTranslations)
const ALL_LANGUAGES = Object.keys(languageTranslations)

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

interface Profile {
  full_name: string
  email: string
  role: string
  avatar_url: string | null
}

interface TherapistData {
  bio: string
  bio_en: string
  specialties: string[]
  consultation_fee: number
  languages: string[]
  location: string
  profession: string
  sector: string | null
  is_verified: boolean
  photo_url: string | null
}

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  appointments: { id: string }[]
}

interface Appointment {
  id: string
  status: string
  no_show: boolean
  session_notes: string | null
  patient_id: string
  availability: {
    date: string
    start_time: string
  }
  profiles: {
    full_name: string
    date_of_birth: string | null
  }
}

interface TimeBlock {
  id: string
  date: string
  end_date: string | null
  start_time: string
  end_time: string
  label: string | null
}

type Tab = 'profile' | 'availability' | 'appointments' | 'calendar' | 'revenue'

interface Schedule {
  days_of_week: number[]
  start_time: string
  end_time: string
  session_duration: number
  buffer_minutes: number
  advance_weeks: number
}

interface Props {
  userId: string
  profile: Profile
  initialTherapist: TherapistData
  initialSlots: Slot[]
  initialAppointments: Appointment[]
  initialSchedule: Schedule | null
  initialTimeBlocks: TimeBlock[]
}

const DAYS = [
  { value: 1, label: 'L', full: 'Lundi' },
  { value: 2, label: 'Ma', full: 'Mardi' },
  { value: 3, label: 'Me', full: 'Mercredi' },
  { value: 4, label: 'J', full: 'Jeudi' },
  { value: 5, label: 'V', full: 'Vendredi' },
  { value: 6, label: 'S', full: 'Samedi' },
  { value: 0, label: 'D', full: 'Dimanche' },
]

export default function DashboardClient({ userId, profile, initialTherapist, initialSlots, initialAppointments, initialSchedule, initialTimeBlocks }: Props) {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('profile')
  const [therapist, setTherapist] = useState<TherapistData>(initialTherapist)
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>(
    Object.fromEntries(initialAppointments.map(a => [a.id, a.session_notes ?? '']))
  )
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({})
  const [noShowLoading, setNoShowLoading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const lastSavedBioRef = useRef({ fr: initialTherapist?.bio ?? '', en: initialTherapist?.bio_en ?? '' })

  // Schedule state
  const [scheduleDays, setScheduleDays] = useState<number[]>(initialSchedule?.days_of_week ?? [1, 2, 3, 4, 5])
  const [scheduleStart, setScheduleStart] = useState(initialSchedule?.start_time?.slice(0, 5) ?? '09:00')
  const [scheduleEnd, setScheduleEnd] = useState(initialSchedule?.end_time?.slice(0, 5) ?? '18:00')
  const [sessionDuration, setSessionDuration] = useState(initialSchedule?.session_duration ?? 50)
  const [bufferMinutes, setBufferMinutes] = useState(initialSchedule?.buffer_minutes ?? 10)
  const [advanceWeeks, setAdvanceWeeks] = useState(initialSchedule?.advance_weeks ?? 8)
  const [scheduleGenerating, setScheduleGenerating] = useState(false)
  const [scheduleMessage, setScheduleMessage] = useState('')

  // Recurring breaks
  const [breaks, setBreaks] = useState<{start: string, end: string}[]>(initialSchedule?.breaks ?? [])
  const [newBreakStart, setNewBreakStart] = useState('12:00')
  const [newBreakEnd, setNewBreakEnd] = useState('14:00')

  // One-off time blocks
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks)
  const [newBlockDate, setNewBlockDate] = useState('')
  const [newBlockEndDate, setNewBlockEndDate] = useState('')
  const [newBlockStart, setNewBlockStart] = useState('09:00')
  const [newBlockEnd, setNewBlockEnd] = useState('10:00')
  const [newBlockLabel, setNewBlockLabel] = useState('')

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      setAvatarUrl(url)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
    }
    setAvatarUploading(false)
  }

  async function saveProfile() {
    setSaving(true)
    const sourceText = lang === 'fr' ? therapist.bio : therapist.bio_en

    // Save immediately via API route — never block on translation
    try {
      const res = await fetch('/api/save-therapist-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: therapist.bio,
          bio_en: therapist.bio_en,
          specialties: therapist.specialties,
          consultation_fee: therapist.consultation_fee,
          languages: therapist.languages,
          location: therapist.location,
          profession: therapist.profession || null,
          sector: therapist.sector || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      alert(e?.message ?? 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }

    // Translate in background if bio changed
    const lastSaved = lang === 'fr' ? lastSavedBioRef.current.fr : lastSavedBioRef.current.en
    if (sourceText.trim() && sourceText !== lastSaved) {
      lastSavedBioRef.current = lang === 'fr'
        ? { ...lastSavedBioRef.current, fr: sourceText }
        : { ...lastSavedBioRef.current, en: sourceText }
      try {
        const res = await fetch('/api/translate-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, targetLang: lang === 'fr' ? 'en' : 'fr' }),
        })
        if (res.ok) {
          const { translated } = await res.json()
          const supabase = createClient()
          if (lang === 'fr') {
            await supabase.from('therapists').update({ bio_en: translated }).eq('id', userId)
            setTherapist(prev => ({ ...prev, bio_en: translated }))
          } else {
            await supabase.from('therapists').update({ bio: translated }).eq('id', userId)
            setTherapist(prev => ({ ...prev, bio: translated }))
          }
        }
      } catch { /* silent fail */ }
    }
  }

  async function saveSchedule() {
    if (scheduleDays.length === 0) { setScheduleMessage('Sélectionnez au moins un jour.'); return }
    setScheduleGenerating(true)
    setScheduleMessage('')
    const supabase = createClient()

    // Upsert schedule
    await supabase.from('therapist_schedules').upsert({
      therapist_id: userId,
      days_of_week: scheduleDays,
      start_time: scheduleStart,
      end_time: scheduleEnd,
      session_duration: sessionDuration,
      buffer_minutes: bufferMinutes,
      advance_weeks: advanceWeeks,
      breaks,
    })

    // Call generate API
    const res = await fetch('/api/generate-slots', { method: 'POST' })
    const data = await res.json()

    if (res.ok) {
      setScheduleMessage(`${data.count} créneaux générés.`)
      // Refresh slots
      const { data: fresh } = await supabase
        .from('availability')
        .select('*, appointments(id)')
        .eq('therapist_id', userId)
        .order('date').order('start_time')
      setSlots(fresh ?? [])
    } else {
      setScheduleMessage('Une erreur est survenue.')
    }
    setScheduleGenerating(false)
  }

  async function deleteSlot(slotId: string) {
    const supabase = createClient()
    await supabase.from('availability').delete().eq('id', slotId)
    setSlots(prev => prev.filter(s => s.id !== slotId))
  }

  function addBreak() {
    if (!newBreakStart || !newBreakEnd || newBreakStart >= newBreakEnd) return
    if (breaks.some(b => b.start === newBreakStart && b.end === newBreakEnd)) return
    setBreaks(prev => [...prev, { start: newBreakStart, end: newBreakEnd }])
  }

  function removeBreak(index: number) {
    setBreaks(prev => prev.filter((_, i) => i !== index))
  }

  async function addTimeBlock() {
    if (!newBlockDate || !newBlockStart || !newBlockEnd) return
    const supabase = createClient()
    const { data } = await supabase.from('time_blocks').insert({
      therapist_id: userId,
      date: newBlockDate,
      end_date: newBlockEndDate || null,
      start_time: newBlockStart,
      end_time: newBlockEnd,
      label: newBlockLabel || null,
    }).select().single()
    if (data) {
      setTimeBlocks(prev => [...prev, data])
      setNewBlockDate('')
      setNewBlockEndDate('')
      setNewBlockStart('09:00')
      setNewBlockEnd('10:00')
      setNewBlockLabel('')
    }
  }

  async function deleteTimeBlock(id: string) {
    const supabase = createClient()
    await supabase.from('time_blocks').delete().eq('id', id)
    setTimeBlocks(prev => prev.filter(b => b.id !== id))
  }

  function addSpecialty(value?: string) {
    const term = (value ?? specialtyInput).trim()
    if (term && ALL_SPECIALTIES.includes(term) && !therapist.specialties.includes(term) && therapist.specialties.length < 3) {
      setTherapist(prev => ({ ...prev, specialties: [...prev.specialties, term] }))
      setSpecialtyInput('')
    }
  }

  function removeSpecialty(s: string) {
    setTherapist(prev => ({ ...prev, specialties: prev.specialties.filter(x => x !== s) }))
  }

  function addLanguage(value?: string) {
    const term = (value ?? languageInput).trim()
    if (term && ALL_LANGUAGES.includes(term) && !therapist.languages.includes(term)) {
      setTherapist(prev => ({ ...prev, languages: [...prev.languages, term] }))
      setLanguageInput('')
    }
  }

  function removeLanguage(l: string) {
    setTherapist(prev => ({ ...prev, languages: prev.languages.filter(x => x !== l) }))
  }

  async function markNoShow(id: string) {
    setNoShowLoading(id)
    try {
      await fetch('/api/mark-no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, no_show: true } : a))
    } finally {
      setNoShowLoading(null)
    }
  }

  async function saveNotes(id: string) {
    setSavingNotes(prev => ({ ...prev, [id]: true }))
    try {
      await fetch('/api/save-session-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, notes: notesDraft[id] ?? '' }),
      })
    } finally {
      setSavingNotes(prev => ({ ...prev, [id]: false }))
    }
  }

  function isPastAppointment(appt: Appointment) {
    if (!appt.availability) return false
    return new Date(`${appt.availability.date}T${appt.availability.start_time}`) < new Date()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5)
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    color: 'var(--text)',
    outline: 'none',
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mb-8" style={{ color: '#4A6070' }}>{profile.full_name}</p>

        {/* Go-live checklist */}
        {(() => {
          const hasFutureSlot = slots.some(s => !s.appointments?.length && new Date(s.date + 'T00:00:00') >= new Date())
          const checks = [
            { label: 'Photo de profil', done: !!therapist.photo_url },
            { label: 'Présentation rédigée', done: therapist.bio.length > 0 },
            { label: 'Spécialités ajoutées', done: therapist.specialties.length > 0 },
            { label: 'Tarif renseigné', done: therapist.consultation_fee > 0 },
            { label: 'Code postal renseigné', done: therapist.location.length > 0 },
            { label: 'Créneaux configurés', done: hasFutureSlot },
            { label: 'Profil vérifié par l\'équipe Respire', done: therapist.is_verified },
          ]
          const allDone = checks.every(c => c.done)
          if (allDone) return null
          return (
            <div className="mb-8 p-5" style={{ border: '1px solid var(--border)', backgroundColor: 'white' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Avant d'apparaître dans l'annuaire
              </p>
              <p className="text-xs mb-4" style={{ color: '#8A9BAD' }}>
                Complétez ces étapes pour que votre profil soit visible par les membres.
              </p>
              <div className="flex flex-col gap-2">
                {checks.map(c => (
                  <div key={c.label} className="flex items-center gap-2">
                    <span style={{ color: c.done ? 'var(--blue-primary)' : '#DDE3EA', fontSize: '1rem', lineHeight: 1 }}>
                      {c.done ? '✓' : '○'}
                    </span>
                    <span className="text-sm" style={{ color: c.done ? '#4A6070' : 'var(--text)', textDecoration: c.done ? 'line-through' : 'none' }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Tabs */}
        <div className="flex gap-0 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {(['profile', 'availability', 'appointments', 'calendar', 'revenue'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-6 py-3 text-sm transition-colors"
              style={{
                borderBottom: tab === t ? '2px solid var(--blue-primary)' : '2px solid transparent',
                color: tab === t ? 'var(--blue-primary)' : '#4A6070',
                background: 'none',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {t === 'profile' ? 'Mon profil' : t === 'availability' ? 'Disponibilités' : t === 'appointments' ? 'Rendez-vous' : t === 'calendar' ? 'Calendrier' : lang === 'fr' ? 'Revenus' : 'Revenue'}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div>
            <div className="flex gap-8">

              {/* LEFT: photo · name · languages */}
              <div style={{ width: '190px', flexShrink: 0 }}>

                {/* Photo */}
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    width: '190px', height: '250px',
                    backgroundColor: '#EEF2F5',
                    backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                    cursor: 'pointer', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                  }}
                >
                  {!avatarUrl && !avatarUploading && (
                    <span style={{ color: '#8A9BAD', fontSize: '0.7rem', textAlign: 'center', padding: '0 20px', lineHeight: 1.5 }}>
                      Cliquer pour<br />ajouter une photo
                    </span>
                  )}
                  {avatarUploading && (
                    <span style={{ color: '#8A9BAD', fontSize: '0.7rem' }}>Chargement...</span>
                  )}
                  {avatarUrl && (
                    <div style={{
                      position: 'absolute', inset: 0, opacity: 0,
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      paddingBottom: '10px', transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <span style={{ color: 'white', fontSize: '0.65rem', letterSpacing: '0.06em' }}>MODIFIER</span>
                    </div>
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

                {/* Name + role + profession */}
                <div style={{ padding: '12px 0 10px' }}>
                  <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>{profile.full_name}</p>
                  <p style={{ color: '#8A9BAD', fontSize: '0.72rem', marginTop: '2px', letterSpacing: '0.02em' }}>
                    {therapist.profession
                      ? (lang === 'en'
                          ? (therapist.profession === 'Psychologue' ? 'Psychologist' : 'Psychiatrist')
                          : therapist.profession)
                      : (lang === 'fr' ? 'Thérapeute' : 'Therapist')}
                  </p>
                </div>

                {/* Profession selector */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '0.6rem', color: '#8A9BAD', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                    {lang === 'fr' ? 'Profession' : 'Profession'}
                  </p>
                  <div className="flex gap-1">
                    {(['Psychologue', 'Psychiatre'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTherapist(prev => ({ ...prev, profession: prev.profession === p ? '' : p }))}
                        style={{
                          fontSize: '0.7rem',
                          padding: '3px 10px',
                          border: `1px solid ${therapist.profession === p ? 'var(--blue-primary)' : 'var(--border)'}`,
                          backgroundColor: therapist.profession === p ? 'var(--blue-accent)' : 'white',
                          color: therapist.profession === p ? 'var(--blue-primary)' : '#4A6070',
                          cursor: 'pointer',
                        }}
                      >
                        {lang === 'en' ? (p === 'Psychologue' ? 'Psychologist' : 'Psychiatrist') : p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                    {lang === 'fr' ? 'Langues parlées' : 'Languages spoken'}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {therapist.languages.map(l => (
                      <span key={l} style={{
                        fontSize: '0.7rem', padding: '2px 8px',
                        backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        {lang === 'en' ? (languageTranslations[l] ?? l) : l}
                        <button onClick={() => removeLanguage(l)} style={{ color: 'var(--blue-primary)', cursor: 'pointer', lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <LanguageInput
                    value={languageInput}
                    onChange={setLanguageInput}
                    onAdd={addLanguage}
                    existing={therapist.languages}
                    inputStyle={inputStyle}
                    lang={lang}
                  />
                </div>

              </div>

              {/* RIGHT: bio · specialties · fee/location */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Bio */}
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                  {lang === 'fr' ? 'Présentation · Français' : 'Presentation · English'}
                </p>
                <BioEditor
                  key={lang}
                  value={lang === 'fr' ? therapist.bio : therapist.bio_en}
                  onChange={val => setTherapist(prev =>
                    lang === 'fr' ? { ...prev, bio: val } : { ...prev, bio_en: val }
                  )}
                  placeholder={lang === 'fr' ? 'Décrivez votre approche et votre parcours...' : 'Describe your approach and background...'}
                  inputStyle={inputStyle}
                />
                <div className="flex justify-between items-center" style={{ marginTop: '4px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.65rem', color: '#8A9BAD' }}>
                    {lang === 'fr'
                      ? 'La version anglaise sera générée automatiquement à l\'enregistrement.'
                      : 'The French version will be auto-generated on save. Use the language toggle to edit it directly.'}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#8A9BAD' }}>
                    {(lang === 'fr' ? therapist.bio : therapist.bio_en).length} / 500
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '20px' }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                    {lang === 'fr' ? 'Spécialités' : 'Areas of expertise'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {therapist.specialties.map(s => (
                      <span key={s} className="text-xs px-3 py-1 flex items-center gap-2"
                        style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                        {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                        <button onClick={() => removeSpecialty(s)} style={{ color: 'var(--blue-primary)', cursor: 'pointer' }}>×</button>
                      </span>
                    ))}
                  </div>
                  {therapist.specialties.length < 3 ? (
                    <SpecialtyInput
                      value={specialtyInput}
                      onChange={setSpecialtyInput}
                      onAdd={addSpecialty}
                      existing={therapist.specialties}
                      inputStyle={inputStyle}
                      lang={lang}
                    />
                  ) : (
                    <p style={{ fontSize: '0.7rem', color: '#8A9BAD' }}>
                      {lang === 'fr' ? 'Maximum 3 spécialités atteint.' : 'Maximum of 3 areas of expertise reached.'}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div className="grid grid-cols-3 gap-4" style={{ maxWidth: '520px' }}>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                        {lang === 'fr' ? 'Tarif (€)' : 'Price (€)'}
                      </p>
                      <input
                        type="number"
                        value={therapist.consultation_fee}
                        onChange={e => setTherapist(prev => ({ ...prev, consultation_fee: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 text-sm"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                        {lang === 'fr' ? 'Code postal' : 'Postcode'}
                      </p>
                      <input
                        type="text"
                        value={therapist.location}
                        onChange={e => setTherapist(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 text-sm"
                        style={inputStyle}
                        placeholder="75006"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>
                        {lang === 'fr' ? 'Secteur' : 'Sector'}
                      </p>
                      <select
                        value={therapist.sector ?? ''}
                        onChange={e => setTherapist(prev => ({ ...prev, sector: e.target.value || null }))}
                        className="w-full px-3 py-2 text-sm"
                        style={inputStyle}
                      >
                        <option value="">— {lang === 'fr' ? 'Non renseigné' : 'Not specified'} —</option>
                        <option value="1">Secteur 1</option>
                        <option value="2">Secteur 2</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-4" style={{ borderTop: '1px solid var(--border)', marginTop: '28px', paddingTop: '20px' }}>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-8 py-2 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
              >
                {saving ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'fr' ? 'Enregistrer' : 'Save')}
              </button>
              {saved && <span className="text-sm" style={{ color: 'var(--blue-primary)' }}>{lang === 'fr' ? 'Profil mis à jour' : 'Profile updated'}</span>}
            </div>

          </div>
        )}

        {/* Availability tab */}
        {tab === 'availability' && (
          <div className="flex gap-6 items-start">

            {/* Left: Confirmed appointments */}
            <div style={{ width: '220px', flexShrink: 0 }}>
              <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
                Rendez-vous confirmés
              </h2>
              {appointments.length === 0 ? (
                <p className="text-sm" style={{ color: '#4A6070' }}>Aucun rendez-vous confirmé.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {appointments.map(appt => (
                    <div key={appt.id} className="bg-white p-3" style={{ border: '1px solid var(--border)' }}>
                      <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>
                        {appt.profiles?.full_name ?? 'Membre'}
                      </p>
                      <p className="text-xs capitalize" style={{ color: '#4A6070' }}>
                        {appt.availability ? formatDate(appt.availability.date) : ''}
                      </p>
                      <p className="text-xs" style={{ color: '#4A6070' }}>
                        {appt.availability ? formatTime(appt.availability.start_time) : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Schedule editor + blocks + slots */}
            <div className="flex-1 min-w-0">
            {/* Schedule editor */}
            <div className="bg-white p-6 mb-6" style={{ border: '1px solid var(--border)' }}>
              <h2 className="text-xs uppercase tracking-widest mb-5" style={{ color: 'var(--blue-primary)' }}>
                Mes horaires de travail
              </h2>

              {/* Days */}
              <div className="mb-5">
                <p className="text-xs mb-2" style={{ color: '#4A6070' }}>Jours travaillés</p>
                <div className="flex gap-2">
                  {DAYS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setScheduleDays(prev =>
                        prev.includes(d.value) ? prev.filter(x => x !== d.value) : [...prev, d.value]
                      )}
                      className="w-9 h-9 text-xs transition-all"
                      style={{
                        border: `1px solid ${scheduleDays.includes(d.value) ? 'var(--blue-primary)' : 'var(--border)'}`,
                        backgroundColor: scheduleDays.includes(d.value) ? 'var(--blue-accent)' : 'white',
                        color: scheduleDays.includes(d.value) ? 'var(--blue-primary)' : '#4A6070',
                        cursor: 'pointer',
                      }}
                      title={d.full}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Heure de début</label>
                  <input type="time" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Heure de fin</label>
                  <input type="time" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
              </div>

              {/* Duration + Buffer */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Durée d'une séance</label>
                  <select value={sessionDuration} onChange={e => setSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm" style={inputStyle}>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={50}>50 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Pause entre séances</label>
                  <select value={bufferMinutes} onChange={e => setBufferMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm" style={inputStyle}>
                    <option value={0}>Aucune</option>
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                  </select>
                </div>
              </div>

              {/* Recurring breaks */}
              <div className="mb-5">
                <p className="text-xs mb-2" style={{ color: '#4A6070' }}>Pauses récurrentes (ex. déjeuner)</p>
                <div className="flex flex-col gap-1 mb-2">
                  {breaks.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span style={{ color: 'var(--text)' }}>{b.start} – {b.end}</span>
                      <button onClick={() => removeBreak(i)}
                        style={{ color: '#C0392B', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.75rem' }}>
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input type="time" value={newBreakStart} onChange={e => setNewBreakStart(e.target.value)}
                    className="px-3 py-1 text-sm" style={{ ...inputStyle, width: '110px' }} />
                  <span className="text-xs" style={{ color: '#4A6070' }}>à</span>
                  <input type="time" value={newBreakEnd} onChange={e => setNewBreakEnd(e.target.value)}
                    className="px-3 py-1 text-sm" style={{ ...inputStyle, width: '110px' }} />
                  <button onClick={addBreak} className="px-3 py-1 text-xs text-white hover:opacity-80"
                    style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}>
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Advance weeks */}
              <div className="mb-5">
                <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Générer les créneaux sur</label>
                <select value={advanceWeeks} onChange={e => setAdvanceWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm" style={{ ...inputStyle, maxWidth: '200px' }}>
                  <option value={4}>4 semaines</option>
                  <option value={6}>6 semaines</option>
                  <option value={8}>8 semaines</option>
                  <option value={12}>12 semaines</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={saveSchedule}
                  disabled={scheduleGenerating}
                  className="px-6 py-2 text-white text-sm hover:opacity-80 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
                >
                  {scheduleGenerating ? 'Génération...' : 'Enregistrer et générer les créneaux'}
                </button>
                {scheduleMessage && (
                  <span className="text-sm" style={{ color: 'var(--blue-primary)' }}>{scheduleMessage}</span>
                )}
              </div>
            </div>

            {/* One-off time blocks */}
            <div className="bg-white p-6 mb-6" style={{ border: '1px solid var(--border)' }}>
              <h2 className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--blue-primary)' }}>
                Bloquer une plage horaire
              </h2>
              <p className="text-xs mb-4" style={{ color: '#4A6070' }}>
                Pour un rendez-vous extérieur, congé ou autre indisponibilité ponctuelle. Les créneaux sur cette plage seront exclus lors de la prochaine génération.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Date de début</label>
                  <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Date de fin (optionnel)</label>
                  <input type="date" value={newBlockEndDate} onChange={e => setNewBlockEndDate(e.target.value)}
                    min={newBlockDate}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Motif (optionnel)</label>
                  <input type="text" value={newBlockLabel} onChange={e => setNewBlockLabel(e.target.value)}
                    placeholder="Ex : Réunion externe"
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>De</label>
                  <input type="time" value={newBlockStart} onChange={e => setNewBlockStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>À</label>
                  <input type="time" value={newBlockEnd} onChange={e => setNewBlockEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
              </div>
              <button onClick={addTimeBlock}
                className="px-4 py-2 text-sm text-white hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}>
                Ajouter le blocage
              </button>

              {timeBlocks.length > 0 && (
                <div className="mt-4 flex flex-col gap-0">
                  {timeBlocks.map(tb => (
                    <div key={tb.id} className="flex justify-between items-center text-sm py-2"
                      style={{ borderTop: '1px solid var(--border)' }}>
                      <div>
                        <span className="capitalize" style={{ color: 'var(--text)' }}>
                          {formatDate(tb.date)}{tb.end_date && tb.end_date !== tb.date ? ` → ${formatDate(tb.end_date)}` : ''}
                        </span>
                        <span className="mx-2" style={{ color: '#4A6070' }}>—</span>
                        <span style={{ color: '#4A6070' }}>{formatTime(tb.start_time)} – {formatTime(tb.end_time)}</span>
                        {tb.label && <span className="ml-2 text-xs" style={{ color: '#4A6070' }}>· {tb.label}</span>}
                      </div>
                      <button onClick={() => deleteTimeBlock(tb.id)}
                        style={{ color: '#C0392B', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.75rem' }}>
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            </div>{/* end right column */}
          </div>
        )}

        {/* Appointments tab */}
        {tab === 'appointments' && (
          <div className="flex flex-col gap-3">
            {appointments.length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>Aucun rendez-vous confirmé.</p>
            ) : appointments.map(appt => {
              const past = isPastAppointment(appt)
              return (
                <div key={appt.id} className="bg-white px-5 py-4"
                  style={{ border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start mb-0">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                        {appt.profiles?.full_name ?? 'Membre'}
                      </p>
                      <p className="text-xs capitalize" style={{ color: '#4A6070' }}>
                        {appt.availability ? `${formatDate(appt.availability.date)} · ${formatTime(appt.availability.start_time)}` : ''}
                      </p>
                      <a
                        href={`/messages?with=${appt.patient_id}&name=${encodeURIComponent(appt.profiles?.full_name ?? 'Membre')}`}
                        className="text-xs hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--blue-primary)' }}
                      >
                        {lang === 'fr' ? 'Message →' : 'Message →'}
                      </a>
                    </div>
                    {appt.no_show ? (
                      <span className="text-xs px-2 py-1" style={{ backgroundColor: '#FFF3F3', color: '#C0392B' }}>
                        Absence
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1"
                        style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                        Confirmé
                      </span>
                    )}
                  </div>

                  {/* Session notes — available before, during, and after session */}
                  {!appt.no_show && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#8A9BAD' }}>
                        Notes de séance <span style={{ textTransform: 'none', letterSpacing: 0 }}>(privées)</span>
                      </p>
                      {/* Patient name + age header */}
                      <div className="mb-3">
                        <span className="text-sm font-normal" style={{ color: 'var(--text)' }}>
                          {appt.profiles?.full_name ?? '—'}
                        </span>
                        {appt.profiles?.date_of_birth && (() => {
                          const dob = new Date(appt.profiles.date_of_birth)
                          const today = new Date()
                          let age = today.getFullYear() - dob.getFullYear()
                          const m = today.getMonth() - dob.getMonth()
                          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
                          return (
                            <span className="text-sm ml-2" style={{ color: '#8A9BAD' }}>
                              {age} ans
                            </span>
                          )
                        })()}
                      </div>
                      <textarea
                        value={notesDraft[appt.id] ?? ''}
                        onChange={e => setNotesDraft(prev => ({ ...prev, [appt.id]: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 text-sm"
                        style={{ border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text)', outline: 'none', resize: 'vertical' }}
                        placeholder="Observations, points à suivre..."
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => saveNotes(appt.id)}
                          disabled={savingNotes[appt.id]}
                          className="text-xs hover:opacity-70 disabled:opacity-40"
                          style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {savingNotes[appt.id] ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                          onClick={() => markNoShow(appt.id)}
                          disabled={noShowLoading === appt.id}
                          className="text-xs hover:opacity-70 disabled:opacity-40"
                          style={{ color: '#8A9BAD', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {noShowLoading === appt.id ? '...' : 'Signaler une absence'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Calendar tab */}
        {tab === 'calendar' && (
          <CalendarTab
            slots={slots}
            scheduleStart={scheduleStart}
            scheduleEnd={scheduleEnd}
            sessionDuration={sessionDuration}
            bufferMinutes={bufferMinutes}
          />
        )}

        {/* PREMIUM */}
        {tab === 'revenue' && (() => {
          const fee = therapist.consultation_fee ?? 0

          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

          const completedAll = appointments.filter(a =>
            isPastAppointment(a) && a.status !== 'cancelled' && !a.no_show
          )

          const completedThisMonth = completedAll.filter(a => {
            if (!a.availability) return false
            return new Date(`${a.availability.date}T00:00:00`) >= monthStart
          })

          const upcomingConfirmed = appointments.filter(a =>
            !isPastAppointment(a) && a.status !== 'cancelled' && !a.no_show
          )

          const earnedAllTime = completedAll.length * fee
          const earnedThisMonth = completedThisMonth.length * fee
          const upcomingValue = upcomingConfirmed.length * fee

          // Sort recent completed sessions newest first
          const recentCompleted = [...completedAll]
            .sort((a, b) => {
              const da = a.availability ? new Date(`${a.availability.date}T${a.availability.start_time}`).getTime() : 0
              const db = b.availability ? new Date(`${b.availability.date}T${b.availability.start_time}`).getTime() : 0
              return db - da
            })
            .slice(0, 20)

          const cardStyle: React.CSSProperties = {
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            padding: '20px 24px',
          }

          const labelStyle: React.CSSProperties = {
            fontSize: '11px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--blue-primary)',
            marginBottom: '6px',
            fontFamily: 'Georgia, serif',
          }

          const valueStyle: React.CSSProperties = {
            fontSize: '28px',
            fontWeight: 300,
            color: 'var(--text)',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.1,
          }

          const subStyle: React.CSSProperties = {
            fontSize: '12px',
            color: '#8A9BAD',
            marginTop: '4px',
          }

          return (
            <div>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div style={cardStyle}>
                  <p style={labelStyle}>{lang === 'fr' ? 'Ce mois-ci' : 'This month'}</p>
                  <p style={valueStyle}>{earnedThisMonth.toLocaleString('fr-FR')} €</p>
                  <p style={subStyle}>
                    {completedThisMonth.length} {lang === 'fr'
                      ? `séance${completedThisMonth.length !== 1 ? 's' : ''} complétée${completedThisMonth.length !== 1 ? 's' : ''}`
                      : `completed session${completedThisMonth.length !== 1 ? 's' : ''}`}
                  </p>
                </div>

                <div style={cardStyle}>
                  <p style={labelStyle}>{lang === 'fr' ? 'Total depuis le début' : 'All time'}</p>
                  <p style={valueStyle}>{earnedAllTime.toLocaleString('fr-FR')} €</p>
                  <p style={subStyle}>
                    {completedAll.length} {lang === 'fr'
                      ? `séance${completedAll.length !== 1 ? 's' : ''} complétée${completedAll.length !== 1 ? 's' : ''}`
                      : `completed session${completedAll.length !== 1 ? 's' : ''}`}
                  </p>
                </div>

                <div style={cardStyle}>
                  <p style={labelStyle}>{lang === 'fr' ? 'Séances à venir (confirmées)' : 'Upcoming (confirmed)'}</p>
                  <p style={valueStyle}>{upcomingConfirmed.length}</p>
                  <p style={subStyle}>
                    {lang === 'fr' ? 'Valeur estimée' : 'Estimated value'} · {upcomingValue.toLocaleString('fr-FR')} €
                  </p>
                </div>

                <div style={cardStyle}>
                  <p style={labelStyle}>{lang === 'fr' ? 'Tarif de consultation' : 'Consultation fee'}</p>
                  <p style={valueStyle}>{fee.toLocaleString('fr-FR')} €</p>
                  <p style={subStyle}>{lang === 'fr' ? 'par séance' : 'per session'}</p>
                </div>
              </div>

              {/* Recent completed sessions table */}
              <div style={cardStyle}>
                <p className="text-sm mb-4" style={{ color: 'var(--text)', fontFamily: 'Georgia, serif', fontWeight: 400 }}>
                  {lang === 'fr' ? 'Séances récentes complétées' : 'Recent completed sessions'}
                </p>

                {recentCompleted.length === 0 ? (
                  <p className="text-sm" style={{ color: '#8A9BAD' }}>
                    {lang === 'fr' ? 'Aucune séance complétée pour l\'instant.' : 'No completed sessions yet.'}
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', paddingBottom: '8px', color: '#8A9BAD', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {lang === 'fr' ? 'Date' : 'Date'}
                        </th>
                        <th style={{ textAlign: 'left', paddingBottom: '8px', color: '#8A9BAD', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {lang === 'fr' ? 'Membre' : 'Member'}
                        </th>
                        <th style={{ textAlign: 'right', paddingBottom: '8px', color: '#8A9BAD', fontWeight: 400, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {lang === 'fr' ? 'Montant' : 'Amount'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCompleted.map(appt => (
                        <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 0', color: 'var(--text)' }}>
                            {appt.availability
                              ? `${formatDate(appt.availability.date)} · ${formatTime(appt.availability.start_time)}`
                              : '—'}
                          </td>
                          <td style={{ padding: '10px 0', color: '#4A6070' }}>
                            {appt.profiles?.full_name ?? (lang === 'fr' ? 'Membre' : 'Member')}
                          </td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text)', fontFamily: 'Georgia, serif' }}>
                            {fee.toLocaleString('fr-FR')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )
        })()}

      </div>
    </main>
  )
}

function CalendarTab({ slots, scheduleStart, scheduleEnd, sessionDuration, bufferMinutes }: {
  slots: Slot[]
  scheduleStart: string
  scheduleEnd: string
  sessionDuration: number
  bufferMinutes: number
}) {
  const [weekOffset, setWeekOffset] = useState(0)

  function toMins(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  function minsToStr(m: number) {
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  }

  // Get Monday of current week + offset
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

  // Build time rows from schedule
  const startM = toMins(scheduleStart || '09:00')
  const endM = toMins(scheduleEnd || '18:00')
  const increment = (sessionDuration || 50) + (bufferMinutes || 10)
  const timeRows: string[] = []
  for (let m = startM; m + (sessionDuration || 50) <= endM; m += increment) {
    timeRows.push(minsToStr(m))
  }

  // Build slot lookup: date -> start_time (HH:MM) -> Slot
  const slotMap: Record<string, Record<string, Slot>> = {}
  for (const slot of slots) {
    if (!slotMap[slot.date]) slotMap[slot.date] = {}
    slotMap[slot.date][slot.start_time.slice(0, 5)] = slot
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const borderColor = 'var(--border)'
  const blue = 'var(--blue-primary)'

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          style={{ border: `1px solid ${borderColor}`, background: 'white', cursor: 'pointer', color: 'var(--text)', padding: '4px 12px', fontSize: '0.875rem' }}
        >
          ←
        </button>
        <span className="text-sm" style={{ color: 'var(--text)' }}>
          Semaine du {monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          style={{ border: `1px solid ${borderColor}`, background: 'white', cursor: 'pointer', color: 'var(--text)', padding: '4px 12px', fontSize: '0.875rem' }}
        >
          →
        </button>
      </div>

      {timeRows.length === 0 ? (
        <p className="text-sm" style={{ color: '#4A6070' }}>
          Aucun créneau configuré. Définissez vos horaires dans l'onglet Disponibilités.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px repeat(7, 1fr)',
            minWidth: '560px',
            border: `1px solid ${borderColor}`,
            backgroundColor: borderColor,
            gap: '1px',
          }}>
            {/* Header: empty corner + 7 day labels */}
            <div style={{ backgroundColor: 'white' }} />
            {days.map((d, i) => {
              const isToday = d.toDateString() === now.toDateString()
              return (
                <div key={i} style={{
                  backgroundColor: isToday ? '#EEF5FF' : 'white',
                  textAlign: 'center',
                  padding: '8px 4px',
                }}>
                  <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4A6070' }}>
                    {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: isToday ? 600 : 400,
                    color: isToday ? blue : 'var(--text)',
                    marginTop: '2px',
                    lineHeight: 1,
                  }}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}

            {/* Time rows */}
            {timeRows.map((time) => (
              <Fragment key={time}>
                {/* Time label */}
                <div style={{
                  backgroundColor: 'white',
                  textAlign: 'right',
                  paddingRight: '6px',
                  paddingTop: '11px',
                  fontSize: '0.6rem',
                  color: '#4A6070',
                }} >
                  {time}
                </div>
                {/* Day cells */}
                {days.map((d, colIdx) => {
                  const dateStr = d.toISOString().split('T')[0]
                  const slot = slotMap[dateStr]?.[time]
                  const isBooked = slot && (slot.is_booked || (slot.appointments?.length ?? 0) > 0)
                  return (
                    <div key={colIdx} style={{
                      backgroundColor: 'white',
                      height: '42px',
                      padding: '3px',
                    }}>
                      {isBooked && (
                        <div style={{
                          height: '100%',
                          backgroundColor: blue,
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: '0.6rem', color: 'white', letterSpacing: '0.02em' }}>
                            Réservé
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LanguageInput({ value, onChange, onAdd, existing, inputStyle, lang }: {
  value: string
  onChange: (v: string) => void
  onAdd: (v: string) => void
  existing: string[]
  inputStyle: React.CSSProperties
  lang: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const suggestions = value.trim()
    ? ALL_LANGUAGES.filter(frTerm => {
        if (existing.includes(frTerm)) return false
        const label = lang === 'en' ? (languageTranslations[frTerm] ?? frTerm) : frTerm
        return label.toLowerCase().includes(value.toLowerCase())
      })
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative flex gap-1">
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && suggestions.length > 0) {
              onAdd(suggestions[0]); onChange(''); setOpen(false)
            }
          }}
          placeholder={lang === 'fr' ? 'Ajouter...' : 'Add...'}
          style={{ ...inputStyle, fontSize: '0.75rem', padding: '4px 8px', width: '100%' }}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white mt-1 shadow-sm"
            style={{ border: '1px solid var(--border)', maxHeight: '180px', overflowY: 'auto' }}>
            {suggestions.map(frTerm => (
              <button
                key={frTerm}
                onMouseDown={() => { onAdd(frTerm); onChange(''); setOpen(false) }}
                className="w-full text-left hover:opacity-70"
                style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: '6px 10px' }}
              >
                {lang === 'en' ? (languageTranslations[frTerm] ?? frTerm) : frTerm}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onMouseDown={() => { if (suggestions.length > 0) { onAdd(suggestions[0]); onChange('') } else if (ALL_LANGUAGES.includes(value.trim())) { onAdd(value.trim()); onChange('') } }}
        style={{ backgroundColor: 'var(--blue-primary)', color: 'white', fontSize: '0.75rem', padding: '4px 10px', cursor: 'pointer', border: 'none', flexShrink: 0 }}
      >
        +
      </button>
    </div>
  )
}

function BioEditor({ value, onChange, placeholder, inputStyle }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  inputStyle: React.CSSProperties
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
    const text = el.textContent ?? ''
    if (text.length > 500) {
      // Truncate and restore cursor at end
      el.textContent = text.slice(0, 500)
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(el)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
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
        minHeight: '168px',
        textAlign: 'justify',
        wordBreak: 'break-word',
        outline: 'none',
        overflowY: 'auto',
      }}
    />
  )
}

function SpecialtyInput({ value, onChange, onAdd, existing, inputStyle, lang }: {
  value: string
  onChange: (v: string) => void
  onAdd: (v: string) => void
  existing: string[]
  inputStyle: React.CSSProperties
  lang: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Match against the display label (French or English depending on lang)
  const suggestions = value.trim()
    ? ALL_SPECIALTIES.filter(frTerm => {
        if (existing.includes(frTerm)) return false
        const displayLabel = lang === 'en' ? (specialtyTranslations[frTerm] ?? frTerm) : frTerm
        return normalize(displayLabel).includes(normalize(value))
      })
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const placeholder = lang === 'en' ? 'Search an area of expertise...' : 'Rechercher une spécialité...'

  return (
    <div ref={ref} className="relative flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && suggestions.length > 0) {
              onAdd(suggestions[0])
              onChange('')
              setOpen(false)
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 text-sm"
          style={inputStyle}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white mt-1 shadow-sm"
            style={{ border: '1px solid var(--border)', maxHeight: '200px', overflowY: 'auto' }}>
            {suggestions.map(frTerm => (
              <button
                key={frTerm}
                onMouseDown={() => { onAdd(frTerm); onChange(''); setOpen(false) }}
                className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {lang === 'en' ? (specialtyTranslations[frTerm] ?? frTerm) : frTerm}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
