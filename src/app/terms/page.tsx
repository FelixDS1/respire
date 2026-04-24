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
              Respire est une plateforme de mise en relation entre des membres recherchant un accompagnement thérapeutique et des thérapeutes indépendants. Respire n'est pas un établissement de santé et n'exerce pas d'activité médicale ou paramédicale. La relation thérapeutique est établie directement et exclusivement entre le membre et le thérapeute.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">2. Accès au service</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              L'utilisation du service est réservée aux personnes majeures (18 ans et plus) résidant en France. En créant un compte, vous certifiez avoir l'âge requis et accepter les présentes conditions dans leur intégralité.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">3. Statut des thérapeutes</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les thérapeutes référencés sur Respire exercent à titre indépendant. Respire vérifie leurs justificatifs de formation et d'identité professionnelle lors de l'inscription, sans pouvoir garantir l'exactitude de l'ensemble des informations déclarées. Respire ne peut garantir les résultats d'un suivi thérapeutique. Toute décision relative à la prise en charge relève de la responsabilité exclusive du thérapeute et du membre.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">4. Réservation et paiement</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les réservations sont confirmées à réception du paiement. Les paiements sont traités par Stripe. Le tarif affiché inclut les honoraires du thérapeute ainsi que des frais de service Respire de 4 € par séance, à la charge du membre. Ces frais de service ne sont pas remboursables par l'Assurance Maladie ou les organismes complémentaires. Ils couvrent la mise en relation, la gestion des paiements et l'accès à la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">5. Annulation et remboursement</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Toute annulation effectuée au moins 24 heures avant le début de la séance donne droit à un remboursement intégral du montant payé, frais de service inclus. Aucun remboursement n'est accordé pour une annulation effectuée moins de 24 heures avant la séance ou en cas d'absence non signalée (no-show). En cas de manquement de la part du thérapeute, Respire examinera la situation au cas par cas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">6. Urgences</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire n'est pas un service d'urgence. En cas de crise ou de danger immédiat, contactez le 15 (SAMU), le 3114 (numéro national de prévention du suicide), ou le 18 (pompiers). La plateforme ne doit en aucun cas se substituer à une prise en charge d'urgence.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">7. Comportement des utilisateurs</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les utilisateurs s'engagent à utiliser la plateforme de bonne foi et à ne pas l'utiliser à des fins illicites, abusives ou frauduleuses. Tout comportement inapproprié — harcèlement, usurpation d'identité, fausses déclarations — peut entraîner la suspension ou la résiliation immédiate du compte, sans remboursement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">8. Suspension et résiliation de compte</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire se réserve le droit de suspendre ou de résilier tout compte en cas de violation des présentes conditions, de comportement frauduleux, ou de mise en danger d'un utilisateur. Les utilisateurs peuvent supprimer leur compte à tout moment depuis leur espace personnel. La résiliation met fin à l'accès au service mais n'affecte pas les obligations financières déjà contractées.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">9. Limitation de responsabilité</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire agit en qualité d'intermédiaire technique. Sa responsabilité ne saurait être engagée au titre du contenu des séances thérapeutiques, des décisions prises par les thérapeutes, ni des conséquences d'un suivi thérapeutique. En tout état de cause, la responsabilité de Respire est limitée au montant des frais de service perçus au cours des 12 derniers mois précédant le sinistre. Respire ne saurait être tenu responsable en cas de force majeure, de défaillance des prestataires techniques tiers ou d'interruption temporaire du service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">10. Propriété intellectuelle</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              L'ensemble des contenus du site (textes, design, code, marque) est la propriété de Respire. Toute reproduction, représentation ou utilisation sans autorisation préalable et écrite est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">11. Modification des conditions</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés par e-mail de toute modification substantielle au moins 15 jours avant son entrée en vigueur. La poursuite de l'utilisation du service après cette période vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">12. Droit applicable et juridiction</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les présentes conditions sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Paris seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">13. Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Pour toute question : <strong>contact@respire.pro</strong>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
