export default function Terms() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">

        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)' }}>
          Conditions d'utilisation
        </h1>
        <p className="text-sm mb-12" style={{ color: '#4A6070' }}>Dernière mise à jour : avril 2026</p>

        <div className="flex flex-col gap-10" style={{ color: 'var(--text)' }}>

          <section>
            <h2 className="text-base font-normal mb-3">1. Présentation du service</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire est une plateforme de mise en relation entre des membres recherchant un accompagnement thérapeutique et des thérapeutes indépendants exerçant à Paris. Respire n'est pas un établissement de santé et n'exerce pas d'activité médicale.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">2. Accès au service</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              L'utilisation du service est réservée aux personnes majeures (18 ans et plus). En créant un compte, vous certifiez avoir l'âge requis et accepter les présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">3. Responsabilité des thérapeutes</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les thérapeutes référencés sur Respire exercent à titre indépendant. Respire vérifie leur numéro ADELI et leurs justificatifs de formation, mais ne peut garantir les résultats d'un suivi thérapeutique. La relation thérapeutique est établie directement entre le membre et le thérapeute.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">4. Réservation et paiement</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les réservations sont confirmées à réception du paiement. Les paiements sont traités par Stripe. Le tarif affiché inclut les honoraires du thérapeute ainsi que des frais de service Respire de 4€ par séance, non remboursables par l'Assurance Maladie ou les mutuelles. Ces frais couvrent la mise en relation, la gestion des paiements et l'accès à la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">5. Annulation et remboursement</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Toute annulation effectuée au moins 24 heures avant le début de la séance donne droit à un remboursement intégral. Aucun remboursement n'est accordé pour une annulation effectuée moins de 24 heures avant la séance. En cas d'absence non signalée (no-show), aucun remboursement n'est possible.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">6. Urgences</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire n'est pas un service d'urgence. En cas de crise ou de danger immédiat, contactez le 15 (SAMU), le 3114 (numéro national de prévention du suicide), ou le 18 (pompiers).
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">7. Propriété intellectuelle</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              L'ensemble des contenus du site (textes, design, code) est la propriété de Respire. Toute reproduction ou utilisation sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">8. Modification des conditions</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés par e-mail de toute modification substantielle.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">9. Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Pour toute question : <strong>contact@respire.fr</strong>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
