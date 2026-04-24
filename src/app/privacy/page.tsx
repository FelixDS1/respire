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
              Respire, plateforme de mise en relation thérapeutique accessible sur respire.pro, est responsable du traitement des données collectées via ce site. Pour toute question relative à vos données personnelles, vous pouvez nous contacter à : <strong>contact@respire.pro</strong>
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">2. Données collectées</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Nous collectons les données suivantes dans le cadre de l'utilisation du service :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li><strong>Données d'identification :</strong> nom complet, adresse e-mail</li>
              <li><strong>Données de profil :</strong> photo de profil, biographie (pour les thérapeutes)</li>
              <li><strong>Données de santé (Article 9 RGPD) :</strong> besoins thérapeutiques déclarés par les membres lors de l'inscription ou de la prise de rendez-vous. Ces données sont considérées comme des données sensibles et ne sont traitées que sur la base de votre consentement explicite.</li>
              <li><strong>Données de paiement :</strong> traitées exclusivement par Stripe. Respire ne stocke aucune donnée bancaire.</li>
              <li><strong>Données de navigation :</strong> cookies de session strictement nécessaires au fonctionnement du service</li>
              <li><strong>Pour les thérapeutes :</strong> numéro ADELI ou équivalent, justificatifs de formation</li>
              <li><strong>Données de séance :</strong> notes de séance rédigées par les thérapeutes, messages échangés entre membre et thérapeute via la messagerie intégrée</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">3. Finalités et bases légales du traitement</h2>
            <div className="text-sm leading-relaxed flex flex-col gap-3" style={{ color: '#4A6070' }}>
              <p>Chaque traitement repose sur une base légale distincte :</p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li><strong>Exécution du contrat :</strong> création et gestion de votre compte, gestion des rendez-vous et des paiements, communication relative à votre compte</li>
                <li><strong>Consentement explicite (Article 9 RGPD) :</strong> traitement des données de santé (besoins thérapeutiques). Ce consentement est recueilli lors de l'inscription et peut être retiré à tout moment.</li>
                <li><strong>Intérêt légitime :</strong> prévention de la fraude, sécurité de la plateforme, vérification des qualifications professionnelles des thérapeutes</li>
                <li><strong>Obligation légale :</strong> conservation des données comptables et financières conformément aux obligations légales françaises</li>
              </ul>
              <p>Respire ne procède à aucune prise de décision entièrement automatisée au sens de l'Article 22 du RGPD.</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">4. Durée de conservation</h2>
            <div className="text-sm leading-relaxed flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li><strong>Données de compte :</strong> conservées pendant toute la durée d'activité du compte, puis supprimées dans un délai de 30 jours suivant la demande de suppression</li>
                <li><strong>Données de paiement et comptables :</strong> conservées 10 ans conformément aux obligations légales françaises</li>
                <li><strong>Notes de séance et messages :</strong> supprimés avec le compte, sous réserve des obligations légales applicables</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">5. Partage des données</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec les sous-traitants suivants, contractuellement tenus de les protéger :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li><strong>Supabase Inc.</strong> — hébergement de la base de données et authentification</li>
              <li><strong>Stripe Inc.</strong> — traitement des paiements</li>
              <li><strong>Resend Inc.</strong> — envoi d'e-mails transactionnels</li>
              <li><strong>Vercel Inc.</strong> — hébergement de l'application</li>
              <li><strong>Daily.co (Daily)</strong> — infrastructure des séances vidéo (audio et vidéo traités uniquement pendant la durée de la séance, non enregistrés)</li>
              <li><strong>Google LLC</strong> — traitement des e-mails via Google Workspace</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#4A6070' }}>
              Les transferts de données vers des prestataires établis hors de l'Union européenne sont encadrés par des clauses contractuelles types (CCT) adoptées par la Commission européenne.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">6. Vos droits</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li><strong>Droit d'accès (Art. 15) :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification (Art. 16) :</strong> corriger des informations inexactes</li>
              <li><strong>Droit à l'effacement (Art. 17) :</strong> supprimer votre compte et vos données depuis votre espace personnel ou en nous contactant</li>
              <li><strong>Droit à la limitation (Art. 18) :</strong> demander la suspension temporaire du traitement de vos données</li>
              <li><strong>Droit à la portabilité (Art. 20) :</strong> recevoir vos données dans un format structuré et lisible par machine en nous contactant</li>
              <li><strong>Droit d'opposition (Art. 21) :</strong> vous opposer à certains traitements fondés sur l'intérêt légitime</li>
              <li><strong>Retrait du consentement :</strong> retirer à tout moment votre consentement aux traitements qui en dépendent, sans que cela affecte la licéité des traitements antérieurs</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#4A6070' }}>
              Pour exercer ces droits, contactez-nous à <strong>contact@respire.pro</strong>. Nous répondrons dans un délai d'un mois. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">7. Cookies</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, maintien de session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">8. Sécurité</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des données en transit (TLS) et au repos, contrôle d'accès par rôle, politique de sécurité au niveau de la base de données (Row Level Security). En cas de violation de données susceptible d'affecter vos droits, vous en serez informé dans les délais prévus par le RGPD.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
