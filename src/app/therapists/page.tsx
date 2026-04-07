import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Therapist {
  id: string
  bio: string | null
  specialties: string[] | null
  photo_url: string | null
  consultation_fee: number | null
  languages: string[] | null
  location: string | null
  profiles: {
    full_name: string | null
  }
}

async function getTherapists(): Promise<Therapist[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('therapists')
    .select('*, profiles(full_name)')
  return (data as Therapist[]) ?? []
}

export default async function TherapistsPage() {
  const therapists = await getTherapists()

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)' }}>
          Nos thérapeutes
        </h1>
        <p className="text-sm" style={{ color: '#4A6070' }}>
          {therapists.length} thérapeute{therapists.length !== 1 ? 's' : ''} disponible{therapists.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Therapist list */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {therapists.length === 0 ? (
          <p className="text-sm" style={{ color: '#4A6070' }}>
            Aucun thérapeute disponible pour le moment.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {therapists.map((therapist) => (
              <Link
                key={therapist.id}
                href={`/therapists/${therapist.id}`}
                className="block bg-white p-6 transition-shadow hover:shadow-sm"
                style={{ border: '1px solid var(--border)', textDecoration: 'none' }}
              >
                <div className="flex gap-6 items-start">

                  {/* Photo */}
                  <div
                    className="flex-shrink-0 w-20 h-20"
                    style={{ backgroundColor: 'var(--blue-accent)', border: '1px solid var(--border)' }}
                  >
                    {therapist.photo_url && (
                      <img
                        src={therapist.photo_url}
                        alt={therapist.profiles?.full_name ?? ''}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-base font-normal mb-1" style={{ color: 'var(--text)' }}>
                      {therapist.profiles?.full_name ?? 'Thérapeute'}
                    </h2>

                    {therapist.specialties && therapist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {therapist.specialties.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-1"
                            style={{ backgroundColor: 'var(--blue-accent)', color: 'var(--blue-primary)' }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {therapist.bio && (
                      <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>
                        {therapist.bio.length > 160
                          ? therapist.bio.slice(0, 160) + '...'
                          : therapist.bio}
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex-shrink-0 text-right">
                    {therapist.consultation_fee && (
                      <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>
                        {therapist.consultation_fee}€ <span className="font-light" style={{ color: '#4A6070' }}>/ séance</span>
                      </p>
                    )}
                    {therapist.location && (
                      <p className="text-xs" style={{ color: '#4A6070' }}>{therapist.location}</p>
                    )}
                    <p className="text-xs mt-3" style={{ color: 'var(--blue-primary)' }}>
                      Voir le profil →
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white', marginTop: '4rem' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center text-sm" style={{ color: '#4A6070' }}>
          <span>© 2026 Respire</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">Confidentialité</Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">Conditions d'utilisation</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
