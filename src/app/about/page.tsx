'use client'

import { useLanguage } from '@/lib/language'

export default function About() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-light leading-snug mb-6" style={{ whiteSpace: 'pre-line' }}>
            {t.about.heroTitle}
          </h1>
          <p className="text-lg font-light" style={{ color: '#4A6070', lineHeight: '1.8' }}>
            {t.about.missionBody}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-sm uppercase tracking-widest mb-12" style={{ color: 'var(--blue-primary)' }}>
          {t.about.howItWorks}
        </h2>
        <div className="grid grid-cols-3 gap-12">
          <div>
            <span className="text-3xl font-light mb-4 block" style={{ color: 'var(--blue-primary)' }}>01</span>
            <h3 className="text-base font-normal mb-2">{t.about.step1Title}</h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>{t.about.step1Body}</p>
          </div>
          <div>
            <span className="text-3xl font-light mb-4 block" style={{ color: 'var(--blue-primary)' }}>02</span>
            <h3 className="text-base font-normal mb-2">{t.about.step2Title}</h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>{t.about.step2Body}</p>
          </div>
          <div>
            <span className="text-3xl font-light mb-4 block" style={{ color: 'var(--blue-primary)' }}>03</span>
            <h3 className="text-base font-normal mb-2">{t.about.step3Title}</h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: '#4A6070' }}>{t.about.step3Body}</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Contact */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-sm uppercase tracking-widest mb-12" style={{ color: 'var(--blue-primary)' }}>
          {t.about.contact}
        </h2>
        <div className="grid grid-cols-2 gap-12 max-w-xl">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#4A6070' }}>{t.about.email}</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>contact@respire.fr</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#4A6070' }}>{t.about.phone}</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>+33 1 00 00 00 00</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center text-sm" style={{ color: '#4A6070' }}>
          <span>© 2026 Respire</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:opacity-70 transition-opacity">{t.footer.privacy}</a>
            <a href="/terms" className="hover:opacity-70 transition-opacity">{t.footer.terms}</a>
          </div>
        </div>
      </footer>

    </main>
  )
}
