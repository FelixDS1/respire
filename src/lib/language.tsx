'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'fr' | 'en'

const translations = {
  fr: {
    nav: {
      findTherapist: 'Trouver un thérapeute',
      about: 'À propos',
      dashboard: 'Tableau de bord',
      login: 'Connexion',
      signup: "S'inscrire",
      logout: 'Déconnexion',
    },
    home: {
      heroTitle: 'Trouvez le thérapeute\nqui vous correspond.',
      heroSubtitle: 'Parcourez les profils, consultez les disponibilités,\net prenez rendez-vous à votre rythme.',
      cta: 'Voir les thérapeutes',
      howItWorks: 'Comment ça marche',
      step1Title: 'Parcourez les profils',
      step1Body: 'Chaque thérapeute présente son parcours, ses spécialités et son approche thérapeutique.',
      step2Title: 'Choisissez un créneau',
      step2Body: "Consultez les disponibilités en temps réel et sélectionnez l'horaire qui vous convient.",
      step3Title: 'Confirmez la réservation',
      step3Body: 'Le paiement est sécurisé. Vous recevez une confirmation par e-mail immédiatement.',
    },
    about: {
      heroTitle: 'Rendre la thérapie\naccessible à tous.',
      missionBody: "Respire est une plateforme qui met en relation ses membres et thérapeutes qualifiés. Notre objectif est de lever les obstacles qui empêchent trop de personnes d'accéder à un suivi psychologique — manque de transparence sur les tarifs, difficulté à trouver le bon praticien, démarches administratives fastidieuses.\n\nVous avez le droit de respirer.",
      howItWorks: 'Comment ça marche',
      step1Title: 'Parcourez les profils',
      step1Body: 'Chaque thérapeute présente son parcours, ses spécialités et son approche thérapeutique.',
      step2Title: 'Choisissez un créneau',
      step2Body: "Consultez les disponibilités en temps réel et sélectionnez l'horaire qui vous convient.",
      step3Title: 'Confirmez la réservation',
      step3Body: 'Le paiement est sécurisé. Vous recevez une confirmation par e-mail immédiatement.',
      contact: 'Contact',
      email: 'E-mail',
      phone: 'Téléphone',
    },
    therapists: {
      title: 'Nos thérapeutes',
      available_one: 'thérapeute disponible',
      available_many: 'thérapeutes disponibles',
      none: 'Aucun thérapeute disponible pour le moment.',
      viewProfile: 'Voir le profil →',
      perSession: '/ séance',
    },
    profile: {
      specialties: 'Spécialités',
      about: 'Présentation',
      languages: 'Langues',
      availability: 'Disponibilités',
      perSession: '/ séance',
      noSlots: 'Aucun créneau disponible pour le moment.',
    },
    footer: {
      privacy: 'Confidentialité',
      terms: "Conditions d'utilisation",
    },
  },
  en: {
    nav: {
      findTherapist: 'Find a therapist',
      about: 'About',
      dashboard: 'Dashboard',
      login: 'Log in',
      signup: 'Sign up',
      logout: 'Log out',
    },
    home: {
      heroTitle: "Find the therapist\nthat's right for you.",
      heroSubtitle: 'Browse profiles, check availability,\nand book an appointment at your own pace.',
      cta: 'View therapists',
      howItWorks: 'How it works',
      step1Title: 'Browse profiles',
      step1Body: 'Each therapist shares their background, specialties, and therapeutic approach.',
      step2Title: 'Choose a time slot',
      step2Body: 'View real-time availability and select the time that works for you.',
      step3Title: 'Confirm your booking',
      step3Body: 'Payment is secure. You receive a confirmation email immediately.',
    },
    about: {
      heroTitle: 'Making therapy\naccessible to everyone.',
      missionBody: 'Respire is a platform connecting members with qualified therapists. Our goal is straightforward: remove the barriers that prevent too many people from accessing mental health support — opaque pricing, difficulty finding the right practitioner, and cumbersome admin.',
      howItWorks: 'How it works',
      step1Title: 'Browse profiles',
      step1Body: 'Each therapist shares their background, specialties, and therapeutic approach.',
      step2Title: 'Choose a time slot',
      step2Body: 'View real-time availability and select the time that works for you.',
      step3Title: 'Confirm your booking',
      step3Body: 'Payment is secure. You receive a confirmation email immediately.',
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
    },
    therapists: {
      title: 'Our therapists',
      available_one: 'therapist available',
      available_many: 'therapists available',
      none: 'No therapists available at the moment.',
      viewProfile: 'View profile →',
      perSession: '/ session',
    },
    profile: {
      specialties: 'Areas of expertise',
      about: 'About',
      languages: 'Languages',
      availability: 'Availability',
      perSession: '/ session',
      noSlots: 'No availability at the moment.',
    },
    footer: {
      privacy: 'Privacy',
      terms: 'Terms of use',
    },
  },
}

export const specialtyTranslations: Record<string, string> = {
  'Anxiété': 'Anxiety',
  'Dépression': 'Depression',
  'Stress': 'Stress',
  'Burnout': 'Burnout',
  'Trauma': 'Trauma',
  'Traumatisme': 'Trauma',
  'Phobies': 'Phobias',
  'Troubles alimentaires': 'Eating disorders',
  'Troubles du sommeil': 'Sleep disorders',
  'Deuil': 'Grief',
  'Couple': 'Couples therapy',
  'Relations': 'Relationships',
  'Confiance et estime de soi': 'Self-confidence & self-esteem',
  'Adolescents': 'Adolescents',
  'Enfants': 'Children',
  'Famille': 'Family',
  'Addiction': 'Addiction',
  'Troubles obsessionnels': 'OCD',
  'TOC': 'OCD',
  'Bipolarité': 'Bipolar disorder',
  'Schizophrénie': 'Schizophrenia',
  'TDAH': 'ADHD',
  'Autisme': 'Autism',
  'Identité': 'Identity',
  'Sexualité': 'Sexuality',
  'Violence': 'Violence',
  'Harcèlement': 'Harassment',
  'Travail': 'Work issues',
  'Reconversion': 'Career change',
  'Agressivité et colère': 'Aggressiveness and anger',
  'Transitions de vie': 'Adapting to significant change in life',
  'Développement personnel': 'Personal development',
  'Thérapie cognitivo-comportementale': 'CBT',
  'TCC': 'CBT',
  'EMDR': 'EMDR',
  'Hypnose': 'Hypnotherapy',
  'Psychanalyse': 'Psychoanalysis',
  'Gestalt': 'Gestalt therapy',
  'Pleine conscience': 'Mindfulness',
  'Méditation': 'Meditation',
}

export const languageTranslations: Record<string, string> = {
  'Français': 'French',
  'Anglais': 'English',
  'Espagnol': 'Spanish',
  'Arabe': 'Arabic',
  'Mandarin': 'Mandarin',
  'Russe': 'Russian',
  'Allemand': 'German',
  'Italien': 'Italian',
  'Portugais': 'Portuguese',
  'Japonais': 'Japanese',
  'Néerlandais': 'Dutch',
  'Polonais': 'Polish',
  'Turc': 'Turkish',
  'Hébreu': 'Hebrew',
  'Hindi': 'Hindi',
  'Coréen': 'Korean',
  'Grec': 'Greek',
  'Roumain': 'Romanian',
  'Vietnamien': 'Vietnamese',
  'Persan': 'Persian',
  'Bengali': 'Bengali',
  'Ukrainien': 'Ukrainian',
  'Tagalog': 'Tagalog',
  'Swahili': 'Swahili',
  'Amharique': 'Amharic',
}

type Translations = typeof translations.fr

const LanguageContext = createContext<{
  lang: Lang
  t: Translations
  toggle: () => void
}>({
  lang: 'fr',
  t: translations.fr,
  toggle: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')
  const toggle = () => setLang(l => l === 'fr' ? 'en' : 'fr')
  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
