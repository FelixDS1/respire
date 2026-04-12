export default function Privacy() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">

        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)' }}>
          Politique de confidentialité
        </h1>
        <p className="text-sm mb-12" style={{ color: '#4A6070' }}>Dernière mise à jour : avril 2026</p>

        <div className="flex flex-col gap-10" style={{ color: 'var(--text)' }}>

          <section>
            <h2 className="text-base font-normal mb-3">1. Responsable du traitement</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire est le responsable du traitement des données collectées via ce site.
              Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse : <strong>contact@respire.fr</strong>
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">2. Données collectées</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Nous collectons les données suivantes dans le cadre de l'utilisation du service :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li><strong>Données d'identification :</strong> nom complet, adresse e-mail</li>
              <li><strong>Données de profil :</strong> photo, biographie, besoins thérapeutiques déclarés</li>
              <li><strong>Données de santé :</strong> date de naissance, et — de façon facultative — numéro de sécurité sociale (NIR), uniquement si vous choisissez de le renseigner afin de générer vos feuilles de soins. Ces données sont stockées dans une table isolée, distincte de votre profil public, et ne sont accessibles qu'à vous et aux thérapeutes avec lesquels vous avez un rendez-vous confirmé.</li>
              <li><strong>Données de paiement :</strong> traitées exclusivement par Stripe. Respire ne stocke aucune donnée bancaire.</li>
              <li><strong>Données de navigation :</strong> cookies de session nécessaires au fonctionnement du service</li>
              <li><strong>Pour les thérapeutes :</strong> numéro ADELI, justificatifs de diplômes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">3. Finalités du traitement</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Vos données sont utilisées pour : la création et la gestion de votre compte, la mise en relation avec des thérapeutes, la gestion des rendez-vous et des paiements, la vérification des qualifications professionnelles des thérapeutes, la communication relative à votre compte, et — si vous avez fourni votre NIR — la génération automatique de vos feuilles de soins à des fins de remboursement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">4. Base légale</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Le traitement est fondé sur l'exécution du contrat (utilisation du service) et, pour les données sensibles relatives à la santé, sur votre consentement explicite recueilli lors de l'inscription.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">5. Durée de conservation</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Vos données sont conservées pendant toute la durée d'activité de votre compte. En cas de suppression de votre compte, vos données personnelles sont effacées dans un délai de 30 jours, à l'exception des données nécessaires au respect d'obligations légales (notamment comptables).
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">6. Partage des données</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec : Supabase (hébergement et base de données), Stripe (paiements), Resend (envoi d'e-mails transactionnels), et Vercel (hébergement de l'application). Ces prestataires sont contractuellement tenus de protéger vos données.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">7. Vos droits</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger des informations inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer votre compte et vos données depuis votre espace personnel</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#4A6070' }}>
              Pour exercer ces droits, contactez-nous à <strong>contact@respire.fr</strong>. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">8. Cookies</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, maintien de session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
