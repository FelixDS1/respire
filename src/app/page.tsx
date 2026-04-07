import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-light leading-snug mb-6">
            Trouvez le thérapeute<br />qui vous correspond.
          </h1>
          <p className="text-lg font-light mb-10" style={{ color: '#4A6070', lineHeight: '1.8' }}>
            Parcourez les profils, consultez les disponibilités,<br />
            et prenez rendez-vous à votre rythme.
          </p>
          <Link
            href="/therapists"
            className="inline-block px-8 py-3 text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--blue-primary)' }}
          >
            Voir les thérapeutes
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-sm uppercase tracking-widest mb-12" style={{ color: 'var(--blue-primary)' }}>
          Comment ça marche
        </h2>
        <div className="grid grid-cols-3 gap-12">
          <div>
            <span className="text-3xl font-light mb-4 block" style={{ color: 'var(--blue-primary)' }}>01</span>
            <h3 className="text-base font-normal mb-2">Parcourez les profils</h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>
              Chaque thérapeute présente son parcours, ses spécialités et son approche thérapeutique.
            </p>
          </div>
          <div>
            <span className="text-3xl font-light mb-4 block" style={{ color: 'var(--blue-primary)' }}>02</span>
            <h3 className="text-base font-normal mb-2">Choisissez un créneau</h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>
              Consultez les disponibilités en temps réel et sélectionnez l'horaire qui vous convient.
            </p>
          </div>
          <div>
            <span className="text-3xl font-light mb-4 block" style={{ color: 'var(--blue-primary)' }}>03</span>
            <h3 className="text-base font-normal mb-2">Confirmez la réservation</h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>
              Le paiement est sécurisé. Vous recevez une confirmation par e-mail immédiatement.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
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
