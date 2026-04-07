'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Props {
  userId: string
  role: string
  fullName: string
}

export default function OnboardingClient({ userId, role, fullName }: Props) {
  const router = useRouter()

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Patient fields
  const [bio, setBio] = useState('')

  // Therapist fields
  const [adeli, setAdeli] = useState('')
  const [credentials, setCredentials] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const photoInputRef = useRef<HTMLInputElement>(null)
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
    if (role === 'therapist' && !adeli.trim()) { setError('Veuillez entrer votre numéro ADELI.'); return }
    if (role === 'therapist' && credentials.length === 0) { setError('Veuillez téléverser au moins un justificatif.'); return }

    setLoading(true)
    const supabase = createClient()

    // Upload profile photo
    let photoUrl: string | null = null
    const ext = photo.name.split('.').pop()
    const { data: photoData, error: photoError } = await supabase.storage
      .from('avatars')
      .upload(`${userId}/avatar.${ext}`, photo, { upsert: true })

    if (photoError) {
      setError('Erreur lors du téléversement de la photo. Veuillez réessayer.')
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(photoData.path)
    photoUrl = publicUrl

    if (role === 'patient') {
      await supabase.from('profiles').update({
        bio: bio.trim(),
        photo_url: photoUrl,
      }).eq('id', userId)

      router.push('/account')

    } else {
      // Upload credential documents
      const credPaths: string[] = []
      for (let i = 0; i < credentials.length; i++) {
        const file = credentials[i]
        const credExt = file.name.split('.').pop()
        const path = `${userId}/${Date.now()}_${i}.${credExt}`
        const { data: credData, error: credError } = await supabase.storage
          .from('credentials')
          .upload(path, file, { upsert: true })
        if (credError) {
          setError(`Erreur lors du téléversement de ${file.name}.`)
          setLoading(false)
          return
        }
        credPaths.push(credData.path)
      }

      await supabase.from('therapists').update({
        photo_url: photoUrl,
        adeli_number: adeli.trim(),
        credentials_urls: credPaths,
      }).eq('id', userId)

      router.push('/dashboard')
    }
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    color: 'var(--text)',
    outline: 'none',
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-6 py-16">

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
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text)' }}>
                  Numéro ADELI
                </label>
                <p className="text-xs mb-2" style={{ color: '#4A6070' }}>
                  Votre numéro d'inscription au répertoire national des professionnels de santé.
                </p>
                <input
                  type="text"
                  value={adeli}
                  onChange={e => setAdeli(e.target.value)}
                  className="w-full px-4 py-2 text-sm"
                  style={inputStyle}
                  placeholder="ex. 759012345"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text)' }}>
                  Justificatifs
                </label>
                <p className="text-xs mb-3" style={{ color: '#4A6070' }}>
                  Diplômes, certificats professionnels ou pièce d'identité. PDF ou image · max 10 Mo par fichier.
                </p>

                {credentials.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {credentials.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-sm bg-white"
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
                  style={{ border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text)', cursor: 'pointer' }}>
                  + Ajouter un document
                </button>
                <input ref={credInputRef} type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  multiple onChange={handleCredentialChange} className="hidden" />
              </div>
            </>
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
