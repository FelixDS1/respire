'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { specialtyTranslations, useLanguage } from '@/lib/language'

const ALL_SPECIALTIES = Object.keys(specialtyTranslations)

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

interface Profile {
  full_name: string
  email: string
  role: string
}

interface TherapistData {
  bio: string
  bio_en: string
  specialties: string[]
  consultation_fee: number
  languages: string[]
  location: string
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
  availability: {
    date: string
    start_time: string
  }
  profiles: {
    full_name: string
  }
}

type Tab = 'profile' | 'availability' | 'appointments'

interface Props {
  userId: string
  profile: Profile
  initialTherapist: TherapistData
  initialSlots: Slot[]
  initialAppointments: Appointment[]
}

export default function DashboardClient({ userId, profile, initialTherapist, initialSlots, initialAppointments }: Props) {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('profile')
  const [therapist, setTherapist] = useState<TherapistData>(initialTherapist)
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [appointments] = useState<Appointment[]>(initialAppointments)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')

  async function saveProfile() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('therapists').update({
      bio: therapist.bio,
      bio_en: therapist.bio_en,
      specialties: therapist.specialties,
      consultation_fee: therapist.consultation_fee,
      languages: therapist.languages,
      location: therapist.location,
    }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addSlot() {
    if (!newDate || !newStart || !newEnd) return
    const supabase = createClient()
    const { data } = await supabase.from('availability').insert({
      therapist_id: userId,
      date: newDate,
      start_time: newStart,
      end_time: newEnd,
    }).select().single()
    if (data) {
      setSlots(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setNewDate('')
      setNewStart('')
      setNewEnd('')
    }
  }

  async function deleteSlot(slotId: string) {
    const supabase = createClient()
    await supabase.from('availability').delete().eq('id', slotId)
    setSlots(prev => prev.filter(s => s.id !== slotId))
  }

  function addSpecialty(value?: string) {
    const term = (value ?? specialtyInput).trim()
    if (term && ALL_SPECIALTIES.includes(term) && !therapist.specialties.includes(term)) {
      setTherapist(prev => ({ ...prev, specialties: [...prev.specialties, term] }))
      setSpecialtyInput('')
    }
  }

  function removeSpecialty(s: string) {
    setTherapist(prev => ({ ...prev, specialties: prev.specialties.filter(x => x !== s) }))
  }

  function addLanguage() {
    if (languageInput.trim() && !therapist.languages.includes(languageInput.trim())) {
      setTherapist(prev => ({ ...prev, languages: [...prev.languages, languageInput.trim()] }))
      setLanguageInput('')
    }
  }

  function removeLanguage(l: string) {
    setTherapist(prev => ({ ...prev, languages: prev.languages.filter(x => x !== l) }))
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
      <div className="max-w-3xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mb-8" style={{ color: '#4A6070' }}>{profile.full_name}</p>

        {/* Tabs */}
        <div className="flex gap-0 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {(['profile', 'availability', 'appointments'] as Tab[]).map(t => (
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
              {t === 'profile' ? 'Mon profil' : t === 'availability' ? 'Disponibilités' : 'Rendez-vous'}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="flex flex-col gap-6">

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Présentation (français)</label>
              <textarea
                value={therapist.bio}
                onChange={e => setTherapist(prev => ({ ...prev, bio: e.target.value }))}
                rows={5}
                className="w-full px-4 py-2 text-sm"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Présentation (english)</label>
              <textarea
                value={therapist.bio_en}
                onChange={e => setTherapist(prev => ({ ...prev, bio_en: e.target.value }))}
                rows={5}
                className="w-full px-4 py-2 text-sm"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text)' }}>Spécialités</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {therapist.specialties.map(s => (
                  <span key={s} className="text-xs px-3 py-1 flex items-center gap-2"
                    style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    {lang === 'en' ? (specialtyTranslations[s] ?? s) : s}
                    <button onClick={() => removeSpecialty(s)} style={{ color: 'var(--blue-primary)', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
              <SpecialtyInput
                value={specialtyInput}
                onChange={setSpecialtyInput}
                onAdd={addSpecialty}
                existing={therapist.specialties}
                inputStyle={inputStyle}
                lang={lang}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Tarif (€)</label>
                <input
                  type="number"
                  value={therapist.consultation_fee}
                  onChange={e => setTherapist(prev => ({ ...prev, consultation_fee: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Localisation</label>
                <input
                  type="text"
                  value={therapist.location}
                  onChange={e => setTherapist(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 text-sm"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text)' }}>Langues</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {therapist.languages.map(l => (
                  <span key={l} className="text-xs px-3 py-1 flex items-center gap-2"
                    style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                    {l}
                    <button onClick={() => removeLanguage(l)} style={{ color: 'var(--blue-primary)', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={e => setLanguageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLanguage()}
                  placeholder="Ajouter une langue"
                  className="flex-1 px-4 py-2 text-sm"
                  style={inputStyle}
                />
                <button onClick={addLanguage} className="px-4 py-2 text-sm text-white"
                  style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}>
                  Ajouter
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-8 py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {saved && <span className="text-sm" style={{ color: 'var(--blue-primary)' }}>Profil mis à jour</span>}
            </div>

          </div>
        )}

        {/* Availability tab */}
        {tab === 'availability' && (
          <div>
            <div className="bg-white p-6 mb-6" style={{ border: '1px solid var(--border)' }}>
              <h2 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--blue-primary)' }}>
                Ajouter un créneau
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Début</label>
                  <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#4A6070' }}>Fin</label>
                  <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm" style={inputStyle} />
                </div>
              </div>
              <button onClick={addSlot} className="px-6 py-2 text-white text-sm hover:opacity-80"
                style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}>
                Ajouter
              </button>
            </div>

            {slots.length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>Aucun créneau à venir.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {slots.map(slot => (
                  <div key={slot.id} className="bg-white px-4 py-3 flex justify-between items-center"
                    style={{ border: '1px solid var(--border)' }}>
                    <div className="text-sm">
                      <span className="capitalize" style={{ color: 'var(--text)' }}>{formatDate(slot.date)}</span>
                      <span className="mx-2" style={{ color: '#4A6070' }}>—</span>
                      <span style={{ color: '#4A6070' }}>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(slot.is_booked || slot.appointments?.length > 0) && (
                        <span className="text-xs px-2 py-1" style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                          Réservé
                        </span>
                      )}
                      {!slot.is_booked && slot.appointments?.length === 0 && (
                        <button onClick={() => deleteSlot(slot.id)} className="text-xs hover:opacity-70"
                          style={{ color: '#C0392B', cursor: 'pointer', background: 'none', border: 'none' }}>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments tab */}
        {tab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>Aucun rendez-vous confirmé.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {appointments.map(appt => (
                  <div key={appt.id} className="bg-white px-4 py-4"
                    style={{ border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>
                          {appt.profiles?.full_name ?? 'Patient'}
                        </p>
                        <p className="text-xs capitalize" style={{ color: '#4A6070' }}>
                          {appt.availability ? `${formatDate(appt.availability.date)} à ${formatTime(appt.availability.start_time)}` : ''}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1"
                        style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                        Confirmé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
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
