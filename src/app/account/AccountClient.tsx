'use client'

import { useState, useRef } from 'react'
import { useLanguage } from '@/lib/language'
import { createClient } from '@/lib/supabase'

interface Appointment {
  id: string
  status: string
  availability: { date: string; start_time: string; end_time: string }
  therapists: { consultation_fee: number; profiles: { full_name: string } }
}

interface Profile {
  full_name: string
  email: string
  bio: string | null
  seeking: string | null
  photo_url: string | null
}

interface Props {
  userId: string
  profile: Profile
  appointments: Appointment[]
}

type Tab = 'profile' | 'appointments'

export default function AccountClient({ userId, profile, appointments }: Props) {
  const { lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('profile')

  // Profile edit state
  const [bio, setBio] = useState(profile.bio ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url)
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

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
    }).eq('id', userId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>
          {lang === 'en' ? 'My profile' : 'Mon profil'}
        </h1>
        <p className="text-sm mb-8" style={{ color: '#4A6070' }}>{profile.full_name}</p>

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
          <div className="flex flex-col gap-6">

            {/* Photo */}
            <div>
              <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
                {lang === 'en' ? 'Profile photo' : 'Photo de profil'}
              </p>
              <div className="flex items-center gap-6">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
                  style={{
                    border: photoPreview ? 'none' : '2px dashed var(--border)',
                    backgroundColor: 'var(--blue-accent)',
                  }}
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-light" style={{ color: '#4A6070' }}>+</span>
                  }
                </div>
                <button type="button" onClick={() => photoInputRef.current?.click()}
                  className="text-sm hover:opacity-70"
                  style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {photoPreview
                    ? (lang === 'en' ? 'Change photo' : 'Changer la photo')
                    : (lang === 'en' ? 'Add a photo' : 'Ajouter une photo')}
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange} className="hidden" />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                {lang === 'en' ? 'About you' : 'Quelques mots sur vous'}
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 text-sm"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>


            {error && <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>}

            <div className="flex items-center gap-4">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-8 py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: 'var(--blue-primary)', cursor: 'pointer' }}
              >
                {saving
                  ? (lang === 'en' ? 'Saving...' : 'Enregistrement...')
                  : (lang === 'en' ? 'Save' : 'Enregistrer')}
              </button>
              {saved && (
                <span className="text-sm" style={{ color: 'var(--blue-primary)' }}>
                  {lang === 'en' ? 'Profile updated' : 'Profil mis à jour'}
                </span>
              )}
            </div>

          </div>
        )}

        {/* Appointments tab */}
        {tab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <p className="text-sm" style={{ color: '#4A6070' }}>
                {lang === 'en' ? 'No upcoming appointments.' : 'Aucun rendez-vous à venir.'}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.map(appt => (
                  <div key={appt.id} className="bg-white px-6 py-5"
                    style={{ border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-normal mb-1" style={{ color: 'var(--text)' }}>
                          {appt.therapists?.profiles?.full_name}
                        </p>
                        <p className="text-xs capitalize" style={{ color: '#4A6070' }}>
                          {appt.availability
                            ? `${formatDate(appt.availability.date)} ${lang === 'en' ? 'at' : 'à'} ${formatTime(appt.availability.start_time)}`
                            : ''}
                        </p>
                        {appt.therapists?.consultation_fee && (
                          <p className="text-xs mt-1" style={{ color: '#4A6070' }}>
                            {appt.therapists.consultation_fee}€ {lang === 'en' ? '/ session' : '/ séance'}
                          </p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1"
                        style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                        {lang === 'en' ? 'Confirmed' : 'Confirmé'}
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
