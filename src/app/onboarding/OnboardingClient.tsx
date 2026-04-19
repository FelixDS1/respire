'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DPA_CURRENT_VERSION } from '@/lib/constants'
import { specialtyTranslations, languageTranslations } from '@/lib/language'

const ALL_SPECIALTIES = Object.keys(specialtyTranslations)
const ALL_LANGUAGES = Object.keys(languageTranslations)

interface Props {
  userId: string
  role: string
  fullName: string
  redirectAfter: string | null
}

export default function OnboardingClient({ userId, role, fullName, redirectAfter }: Props) {
  const router = useRouter()

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Patient fields
  const [bio, setBio] = useState('')

  // Therapist step 1 fields
  const [rpps, setRpps] = useState('')
  const [hasRpps, setHasRpps] = useState(true)
  const [adeli, setAdeli] = useState('')
  const [idDoc, setIdDoc] = useState<File | null>(null)
  const [credentials, setCredentials] = useState<File[]>([])
  const [dpaAccepted, setDpaAccepted] = useState(false)

  // Therapist step 2 fields
  const [step, setStep] = useState<1 | 2>(1)
  const [therapistBio, setTherapistBio] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [languageInput, setLanguageInput] = useState('')
  const [fee, setFee] = useState('')
  const [location, setLocation] = useState('')
  const [sector, setSector] = useState<'1' | '2'>('1')
  const [consultationType, setConsultationType] = useState<'presentiel' | 'video' | 'both'>('both')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const photoInputRef = useRef<HTMLInputElement>(null)
  const idDocInputRef = useRef<HTMLInputElement>(null)
  const credInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('La photo ne doit pas dépasser 5 Mo.'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  function handleCredentialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const oversized = files.find(f => f.size > 10 * 1024 * 1024)
    if (oversized) { setError(`${oversized.name} dépasse 10 Mo.`); return }
    setCredentials(prev => [...prev, ...files])
    setError('')
  }

  function removeCredential(index: number) {
    setCredentials(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!photo) { setError('Veuillez ajouter une photo de profil.'); return }
    if (role === 'patient' && !bio.trim()) { setError('Veuillez compléter votre présentation.'); return }
    if (role === 'therapist' && hasRpps && !rpps.trim()) { setError('Veuillez entrer votre numéro RPPS.'); return }
    if (role === 'therapist' && !hasRpps && !adeli.trim()) { setError('Veuillez entrer votre numéro ADELI.'); return }
    if (role === 'therapist' && !idDoc) { setError('Veuillez téléverser une pièce d\'identité.'); return }
    if (role === 'therapist' && credentials.length === 0) { setError('Veuillez téléverser au moins un justificatif (diplôme ou certificat).'); return }
    if (role === 'therapist' && !dpaAccepted) { setError('Veuillez accepter l\'accord de traitement des données.'); return }

    setLoading(true)
    const supabase = createClient()

    try {
      // Upload profile photo
      const photoFd = new FormData()
      photoFd.append('file', photo)
      const photoRes = await fetch('/api/upload-avatar', { method: 'POST', body: photoFd })
      const photoJson = await photoRes.json()
      if (!photoRes.ok) {
        setError('Erreur lors du téléversement de la photo : ' + (photoJson.error ?? photoRes.status))
        setLoading(false)
        return
      }
      const photoUrl = photoJson.url

      if (role === 'patient') {
        const { error: profileErr } = await supabase.from('profiles').update({
          bio: bio.trim(),
          avatar_url: photoUrl,
        }).eq('id', userId)
        if (profileErr) { setError('Erreur : ' + profileErr.message); setLoading(false); return }
        router.push(redirectAfter ?? '/therapists')

      } else {
        // Upload ID document (mandatory)
        const idExt = idDoc!.name.split('.').pop()
        const idPath = `${userId}/id_${Date.now()}.${idExt}`
        const { error: idError } = await supabase.storage
          .from('Credentials')
          .upload(idPath, idDoc!, { upsert: true })
        if (idError) {
          setError('Erreur pièce d\'identité : ' + idError.message)
          setLoading(false)
          return
        }

        // Upload credential documents (diplomas etc.)
        const credPaths: string[] = [idPath]
        for (let i = 0; i < credentials.length; i++) {
          const file = credentials[i]
          const credExt = file.name.split('.').pop()
          const path = `${userId}/${Date.now()}_${i}.${credExt}`
          const { data: credData, error: credError } = await supabase.storage
            .from('Credentials')
            .upload(path, file, { upsert: true })
          if (credError) {
            setError(`Erreur téléversement ${file.name} : ` + credError.message)
            setLoading(false)
            return
          }
          credPaths.push(credData.path)
        }

        const { error: therapistErr } = await supabase.from('therapists').upsert({
          id: userId,
          photo_url: photoUrl,
          rpps_number: hasRpps ? rpps.trim() : null,
          adeli_number: !hasRpps ? adeli.trim() : null,
          credentials_urls: credPaths,
          dpa_accepted_at: new Date().toISOString(),
          dpa_version: DPA_CURRENT_VERSION,
        })

        if (therapistErr) {
          setError('Erreur enregistrement : ' + therapistErr.message)
          setLoading(false)
          return
        }

        setLoading(false)
        setStep(2)
      }
    } catch (err) {
      console.error('onboarding error:', err)
      setError('Une erreur inattendue est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!therapistBio.trim()) { setError('Veuillez rédiger une courte présentation.'); return }
    if (!fee || isNaN(Number(fee)) || Number(fee) <= 0) { setError('Veuillez indiquer votre tarif.'); return }
    if (!location) { setError('Veuillez indiquer votre arrondissement.'); return }

    setLoading(true)
    const supabase = createClient()
    try {
      const { error: err } = await supabase.from('therapists').upsert({
        id: userId,
        bio: therapistBio.trim(),
        specialties,
        languages,
        consultation_fee: Number(fee),
        location,
        sector,
        consultation_type: consultationType,
      })
      if (err) { setError('Erreur : ' + err.message); setLoading(false); return }
      router.push('/dashboard')
    } catch (err) {
      console.error('step2 error:', err)
      setError('Une erreur inattendue est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  function addSpecialty(term: string) {
    if (term && ALL_SPECIALTIES.includes(term) && !specialties.includes(term) && specialties.length < 3) {
      setSpecialties(prev => [...prev, term])
      setSpecialtyInput('')
    }
  }

  function addLanguage(term: string) {
    if (term && ALL_LANGUAGES.includes(term) && !languages.includes(term)) {
      setLanguages(prev => [...prev, term])
      setLanguageInput('')
    }
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    outline: 'none',
  }

  if (role === 'therapist' && step === 2) {
    const specialtySuggestions = specialtyInput.trim()
      ? ALL_SPECIALTIES.filter(s => s.toLowerCase().includes(specialtyInput.toLowerCase()) && !specialties.includes(s)).slice(0, 5)
      : []
    const languageSuggestions = languageInput.trim()
      ? ALL_LANGUAGES.filter(l => l.toLowerCase().includes(languageInput.toLowerCase()) && !languages.includes(l)).slice(0, 5)
      : []

    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-lg mx-auto px-6 py-16">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>Étape 2 / 2</p>
          <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>Votre profil professionnel</h1>
          <p className="text-sm mb-10" style={{ color: '#4A6070' }}>Ces informations seront visibles par les membres.</p>

          <form onSubmit={handleStep2Submit} className="flex flex-col gap-8">

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Présentation <span style={{ color: '#8A9BAD' }}>(FR)</span></label>
              <p className="text-xs mb-2" style={{ color: '#4A6070' }}>Votre approche, votre parcours, ce qui vous anime.</p>
              <textarea
                value={therapistBio}
                onChange={e => setTherapistBio(e.target.value)}
                rows={5}
                maxLength={500}
                className="w-full px-4 py-2 text-sm"
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Ex. Psychologue clinicienne, je travaille avec une approche intégrative..."
              />
              <p className="text-xs mt-1 text-right" style={{ color: '#8A9BAD' }}>{therapistBio.length}/500</p>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Spécialités <span style={{ color: '#8A9BAD' }}>(max 3)</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={e => setSpecialtyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (specialtySuggestions[0]) addSpecialty(specialtySuggestions[0]) } }}
                  disabled={specialties.length >= 3}
                  className="w-full px-4 py-2 text-sm"
                  style={{ ...inputStyle, opacity: specialties.length >= 3 ? 0.5 : 1 }}
                  placeholder="Ex. anxiété, dépression, trauma..."
                />
                {specialtySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-[var(--surface)] border border-t-0 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                    {specialtySuggestions.map(s => (
                      <button key={s} type="button" onClick={() => addSpecialty(s)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--text)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2 py-1 text-xs"
                      style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                      {s}
                      <button type="button" onClick={() => setSpecialties(prev => prev.filter(x => x !== s))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue-primary)', lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Langues parlées</label>
              <div className="relative">
                <input
                  type="text"
                  value={languageInput}
                  onChange={e => setLanguageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (languageSuggestions[0]) addLanguage(languageSuggestions[0]) } }}
                  className="w-full px-4 py-2 text-sm"
                  style={inputStyle}
                  placeholder="Ex. français, anglais, espagnol..."
                />
                {languageSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-[var(--surface)] border border-t-0 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                    {languageSuggestions.map(l => (
                      <button key={l} type="button" onClick={() => addLanguage(l)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--text)' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {languages.map(l => (
                    <span key={l} className="flex items-center gap-1 px-2 py-1 text-xs"
                      style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}>
                      {l}
                      <button type="button" onClick={() => setLanguages(prev => prev.filter(x => x !== l))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue-primary)', lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Tarif (€)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={e => setFee(e.target.value)}
                  min={1}
                  className="w-full px-4 py-2 text-sm"
                  style={inputStyle}
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Secteur</label>
                <select
                  value={sector}
                  onChange={e => setSector(e.target.value as '1' | '2')}
                  className="w-full px-4 py-2 text-sm"
                  style={inputStyle}
                >
                  <option value="1">Secteur 1</option>
                  <option value="2">Secteur 2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>Code postal</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-4 py-2 text-sm"
                style={inputStyle}
                placeholder="75006"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text)' }}>Mode de consultation</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {([
                  { value: 'presentiel', label: 'Présentiel uniquement' },
                  { value: 'video', label: 'Vidéo uniquement' },
                  { value: 'both', label: 'Présentiel & vidéo' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConsultationType(opt.value)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      fontSize: '0.8rem',
                      border: `1px solid ${consultationType === opt.value ? 'var(--blue-primary)' : 'var(--border)'}`,
                      backgroundColor: consultationType === opt.value ? 'var(--blue-accent)' : 'var(--surface)',
                      color: consultationType === opt.value ? 'var(--blue-primary)' : 'var(--text)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: 'var(--blue-primary)' }}
            >
              {loading ? 'Enregistrement...' : 'Terminer'}
            </button>

          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-6 py-16">

        {role === 'therapist' && (
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--blue-primary)' }}>Étape 1 / 2</p>
        )}
        <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--text)' }}>
          Complétez votre profil
        </h1>
        <p className="text-sm mb-10" style={{ color: '#4A6070' }}>{fullName}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Photo upload */}
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>Photo de profil</p>
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
              <div>
                <button type="button" onClick={() => photoInputRef.current?.click()}
                  className="text-sm hover:opacity-70"
                  style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {photoPreview ? 'Changer la photo' : 'Choisir une photo'}
                </button>
                <p className="text-xs mt-1" style={{ color: '#4A6070' }}>JPG ou PNG · max 5 Mo</p>
              </div>
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange} className="hidden" />
          </div>

          {/* Patient fields */}
          {role === 'patient' && (
            <>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                  Quelques mots sur vous
                </label>
                <p className="text-xs mb-2" style={{ color: '#4A6070' }}>
                  Votre situation, ce qui vous a amené à chercher un accompagnement.
                </p>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 text-sm"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Ex. Je traverse une période de stress importante au travail..."
                />
              </div>

            </>
          )}

          {/* Therapist fields */}
          {role === 'therapist' && (
            <>
              {/* RPPS / ADELI */}
              <div>
                {hasRpps ? (
                  <>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                      Numéro RPPS
                    </label>
                    <p className="text-xs mb-2" style={{ color: '#4A6070' }}>
                      Votre numéro au Répertoire Partagé des Professionnels de Santé (11 chiffres).
                    </p>
                    <input
                      type="text"
                      value={rpps}
                      onChange={e => setRpps(e.target.value)}
                      className="w-full px-4 py-2 text-sm"
                      style={inputStyle}
                      placeholder="ex. 10012345678"
                      maxLength={11}
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                      Numéro ADELI
                    </label>
                    <p className="text-xs mb-2" style={{ color: '#4A6070' }}>
                      Votre numéro d'inscription au répertoire national des professionnels de santé (9 chiffres).
                    </p>
                    <input
                      type="text"
                      value={adeli}
                      onChange={e => setAdeli(e.target.value)}
                      className="w-full px-4 py-2 text-sm"
                      style={inputStyle}
                      placeholder="ex. 759012345"
                      maxLength={9}
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => { setHasRpps(v => !v); setRpps(''); setAdeli('') }}
                  className="text-xs mt-2 hover:opacity-70"
                  style={{ color: 'var(--blue-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {hasRpps
                    ? "Je n'ai pas encore de numéro RPPS (psychologue) → utiliser mon numéro ADELI"
                    : "← J'ai un numéro RPPS"}
                </button>
              </div>

              {/* Mandatory ID document */}
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                  Pièce d'identité <span style={{ color: '#C0392B' }}>*</span>
                </label>
                <p className="text-xs mb-3" style={{ color: '#4A6070' }}>
                  Carte nationale d'identité ou passeport. PDF ou image · max 10 Mo.
                </p>
                {idDoc ? (
                  <div className="flex items-center justify-between px-3 py-2 text-sm"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <span className="text-sm truncate mr-4" style={{ color: 'var(--text)' }}>{idDoc.name}</span>
                    <button type="button" onClick={() => setIdDoc(null)}
                      className="text-xs flex-shrink-0 hover:opacity-70"
                      style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => idDocInputRef.current?.click()}
                    className="px-4 py-2 text-sm hover:opacity-70 transition-opacity"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                    + Ajouter ma pièce d'identité
                  </button>
                )}
                <input ref={idDocInputRef} type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 10 * 1024 * 1024) { setError('Le fichier ne doit pas dépasser 10 Mo.'); return }
                    setIdDoc(file)
                    setError('')
                  }}
                  className="hidden" />
              </div>

              {/* Other credentials (diplomas etc.) */}
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text)' }}>
                  Diplômes et certificats professionnels
                </label>
                <p className="text-xs mb-3" style={{ color: '#4A6070' }}>
                  Diplôme de psychologie, certificats de formation, etc. PDF ou image · max 10 Mo par fichier.
                </p>

                {credentials.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {credentials.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-sm bg-[var(--surface)]"
                        style={{ border: '1px solid var(--border)' }}>
                        <span className="text-sm truncate mr-4" style={{ color: 'var(--text)' }}>{file.name}</span>
                        <button type="button" onClick={() => removeCredential(i)}
                          className="text-xs flex-shrink-0 hover:opacity-70"
                          style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={() => credInputRef.current?.click()}
                  className="px-4 py-2 text-sm hover:opacity-70 transition-opacity"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                  + Ajouter un document
                </button>
                <input ref={credInputRef} type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  multiple onChange={handleCredentialChange} className="hidden" />
              </div>
            </>
          )}

          {role === 'therapist' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dpaAccepted}
                onChange={e => setDpaAccepted(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
                J'ai lu et j'accepte l'{' '}
                <a href="/dpa" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--blue-primary)', textDecoration: 'underline' }}>
                  accord de traitement des données
                </a>
                {' '}de Respire.
              </span>
            </label>
          )}

          {error && <p className="text-sm" style={{ color: '#C0392B' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--blue-primary)' }}
          >
            {loading ? 'Enregistrement...' : 'Continuer'}
          </button>

        </form>
      </div>
    </main>
  )
}
