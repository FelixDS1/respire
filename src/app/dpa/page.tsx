export default function DPA() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">

        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)' }}>
          Accord de traitement des données
        </h1>
        <p className="text-sm mb-2" style={{ color: '#4A6070' }}>Data Processing Agreement (DPA)</p>
        <p className="text-sm mb-12" style={{ color: '#4A6070' }}>Dernière mise à jour : avril 2026</p>

        <div className="flex flex-col gap-10" style={{ color: 'var(--text)' }}>

          <section>
            <h2 className="text-base font-normal mb-3">1. Parties</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Le présent accord est conclu entre <strong>Respire</strong> (ci-après « le Sous-traitant »), plateforme de mise en relation thérapeutique accessible sur respire.pro, et tout professionnel inscrit sur la plateforme (ci-après « le Responsable du traitement »).
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#4A6070' }}>
              Dans le cadre de leurs relations, le Responsable du traitement confie au Sous-traitant des opérations de traitement de données à caractère personnel relatives à ses patients, au sens du Règlement (UE) 2016/679 (RGPD). Il est précisé que Respire agit également en qualité de responsable du traitement pour les données qu'il collecte à ses propres fins (facturation, sécurité, amélioration du service) ; le présent accord ne porte que sur les traitements effectués pour le compte du thérapeute.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">2. Objet et durée</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire traite des données personnelles pour le compte du thérapeute afin de permettre : la gestion des rendez-vous, la communication sécurisée avec les patients, la gestion des paiements et la conduite des séances vidéo. Cet accord prend effet à l'acceptation par le thérapeute lors de l'inscription et reste en vigueur pendant toute la durée d'utilisation du service. Il prend fin automatiquement à la résiliation du compte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">3. Nature des données traitées</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Les données traitées par Respire pour le compte du thérapeute comprennent :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li>Nom, prénom et adresse e-mail des patients</li>
              <li>Historique des rendez-vous et statuts associés</li>
              <li>Notes de séance rédigées par le thérapeute</li>
              <li>Messages échangés entre le patient et le thérapeute</li>
              <li>Données audio et vidéo pendant la durée de la séance (non enregistrées, non conservées)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">4. Obligations du Sous-traitant (Respire)</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Respire s'engage à :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li>Ne traiter les données que sur instruction documentée du Responsable du traitement, sauf obligation légale contraire</li>
              <li>Garantir la confidentialité des données traitées et s'assurer que les personnes autorisées à traiter ces données sont soumises à une obligation de confidentialité appropriée</li>
              <li>Mettre en œuvre les mesures techniques et organisationnelles appropriées pour assurer la sécurité des données (chiffrement en transit et au repos, contrôle d'accès par rôle, Row Level Security)</li>
              <li>Ne pas recourir à un sous-traitant ultérieur autre que ceux listés à l'article 6 sans en informer préalablement le Responsable du traitement et lui donner la possibilité de s'y opposer</li>
              <li>Assister le Responsable du traitement dans le respect de ses obligations RGPD (droits des personnes, notification de violation, analyse d'impact)</li>
              <li>Supprimer toutes les données personnelles traitées pour le compte du thérapeute dans un délai de 30 jours suivant la fin de la relation contractuelle, sauf obligation légale de conservation</li>
              <li>Mettre à disposition toute information nécessaire pour démontrer le respect du présent accord et permettre la réalisation d'audits par le Responsable du traitement ou un auditeur mandaté, sur demande écrite avec un préavis raisonnable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">5. Obligations du Responsable du traitement (le thérapeute)</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A6070' }}>
              Le thérapeute s'engage à :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2" style={{ color: '#4A6070' }}>
              <li>Informer ses patients que leurs données sont traitées via Respire et ses sous-traitants</li>
              <li>S'assurer de disposer d'une base légale valide pour chaque traitement effectué via la plateforme</li>
              <li>Ne saisir dans la plateforme que les données strictement nécessaires à la prise en charge</li>
              <li>Notifier Respire sans délai en cas de demande d'exercice de droits de la part d'un patient</li>
              <li>Accepter les sous-traitants ultérieurs listés à l'article 6 en acceptant le présent accord</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">6. Sous-traitants ultérieurs</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Respire fait appel aux sous-traitants suivants pour assurer le fonctionnement du service. En acceptant le présent accord, le Responsable du traitement donne son autorisation générale à leur intervention :
            </p>
            <ul className="text-sm leading-relaxed list-disc pl-5 flex flex-col gap-2 mt-3" style={{ color: '#4A6070' }}>
              <li><strong>Supabase Inc.</strong> (États-Unis / AWS EU) — hébergement de la base de données et authentification</li>
              <li><strong>Stripe Inc.</strong> (États-Unis) — traitement des paiements</li>
              <li><strong>Resend Inc.</strong> (États-Unis) — envoi d'e-mails transactionnels</li>
              <li><strong>Vercel Inc.</strong> (États-Unis) — hébergement de l'application</li>
              <li><strong>Daily.co (Daily)</strong> (États-Unis) — infrastructure des séances vidéo (données audio/vidéo non enregistrées)</li>
              <li><strong>Google LLC</strong> (États-Unis) — traitement des e-mails via Google Workspace</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#4A6070' }}>
              Ces prestataires sont soumis à des garanties contractuelles conformes au RGPD (clauses contractuelles types ou décision d'adéquation). Respire informera le Responsable du traitement de tout changement prévu concernant ces sous-traitants.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">7. Violation de données</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              En cas de violation de données à caractère personnel, Respire notifiera le Responsable du traitement dans les meilleurs délais et au plus tard dans les 72 heures suivant la prise de connaissance de l'incident, afin de lui permettre de remplir ses obligations de notification auprès de la CNIL et des personnes concernées le cas échéant.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">8. Transferts hors UE</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Les sous-traitants listés à l'article 6 sont en partie établis hors de l'Union européenne. Ces transferts sont encadrés par des clauses contractuelles types (CCT) adoptées par la Commission européenne, garantissant un niveau de protection adéquat des données transférées.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">9. Droit applicable</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Le présent accord est régi par le droit français et le Règlement (UE) 2016/679 (RGPD). En cas de litige, les tribunaux compétents de Paris seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-base font-normal mb-3">10. Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4A6070' }}>
              Pour toute question relative au présent accord : <strong>contact@respire.pro</strong>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
