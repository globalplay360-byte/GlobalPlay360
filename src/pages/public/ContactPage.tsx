import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'hello@globalplay360.com';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0B1120] text-gray-200 min-h-[70vh]">
      <section className="relative border-b border-[#1F2937] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#0B1120] to-[#0B1120] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />
        <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-20 md:py-28 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-gray-200 transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('legal.backHome', 'Tornar a l\'inici')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-100 mb-4">
            {t('contact.title', 'Parlem')}
          </h1>
          <p className="text-base text-[#9CA3AF] max-w-2xl leading-relaxed">
            {t('contact.subtitle', 'Tens una pregunta, un suggeriment o vols col·laborar amb GlobalPlay360? Aquí tens totes les maneres d\'arribar a nosaltres.')}
          </p>
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 md:p-8 flex flex-col">
            <span className="w-12 h-12 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-gray-100 mb-2">{t('contact.email.title', 'Correu directe')}</h2>
            <p className="text-sm text-[#9CA3AF] mb-4 flex-1">
              {t('contact.email.desc', 'La manera més ràpida d\'arribar-nos. Responem en menys de 48 hores laborables.')}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-gray-100 font-semibold px-5 py-3 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg hover:shadow-[#3B82F6]/30"
            >
              {CONTACT_EMAIL}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 md:p-8 flex flex-col">
            <span className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-gray-100 mb-2">{t('contact.legal.title', 'Consultes legals')}</h2>
            <p className="text-sm text-[#9CA3AF] mb-4 flex-1">
              {t('contact.legal.desc', 'Exercici de drets RGPD, protecció de dades o qualsevol requeriment formal.')}
            </p>
            <div className="text-sm text-[#9CA3AF] space-y-1">
              <p>
                <span className="text-[#6B7280] uppercase text-xs font-bold tracking-wider">
                  {t('contact.legal.emailLabel', 'Email legal')}:
                </span>
                <br />
                <span className="italic text-[#6B7280]">
                  {t('contact.legal.pending', 'Pendent de configuració')}
                </span>
              </p>
              <p className="pt-2">
                <span className="text-[#6B7280] uppercase text-xs font-bold tracking-wider">
                  {t('contact.legal.address', 'Adreça')}:
                </span>
                <br />
                <span className="italic text-[#6B7280]">
                  {t('contact.legal.pending', 'Pendent de configuració')}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-[#0F172A] border border-[#1F2937] rounded-xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-100 mb-3">{t('contact.quickLinks.title', 'Enllaços ràpids')}</h3>
          <p className="text-sm text-[#9CA3AF] mb-5">
            {t('contact.quickLinks.desc', 'Potser trobes ja la resposta en una d\'aquestes pàgines:')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/about" className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#D1D5DB] hover:bg-[#1F2937] hover:border-[#374151] transition-colors">
              {t('contact.quickLinks.about', 'Qui som')}
            </Link>
            <Link to="/pricing" className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#D1D5DB] hover:bg-[#1F2937] hover:border-[#374151] transition-colors">
              {t('contact.quickLinks.pricing', 'Plans i preus')}
            </Link>
            <Link to="/privacy" className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#D1D5DB] hover:bg-[#1F2937] hover:border-[#374151] transition-colors">
              {t('contact.quickLinks.privacy', 'Privacitat')}
            </Link>
            <Link to="/terms" className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#D1D5DB] hover:bg-[#1F2937] hover:border-[#374151] transition-colors">
              {t('contact.quickLinks.terms', 'Condicions')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
