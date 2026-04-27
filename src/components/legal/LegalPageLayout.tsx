import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: React.ReactNode;
  showDisclaimer?: boolean;
}

export default function LegalPageLayout({ title, subtitle, lastUpdated, children, showDisclaimer = true }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0B1120] text-gray-200">
      <section className="relative border-b border-[#1F2937] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#0B1120] to-[#0B1120] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-20 md:py-28 max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-gray-200 transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('legal.backHome', 'Tornar a l\'inici')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-100 mb-4">{title}</h1>
          {subtitle && <p className="text-base text-[#9CA3AF] max-w-2xl leading-relaxed">{subtitle}</p>}
          <p className="text-xs text-[#6B7280] mt-6 uppercase tracking-wider">
            {t('legal.lastUpdated', 'Última actualització')}: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16 max-w-3xl mx-auto">
        {showDisclaimer && (
          <div className="bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-xl p-5 mb-10 flex gap-4">
            <span className="text-2xl shrink-0">⚠️</span>
            <div className="text-sm text-[#FBBF24] leading-relaxed">
              <strong className="text-[#FFC107]">{t('legal.disclaimer.title', 'Document en revisió')}.</strong>{' '}
              {t('legal.disclaimer.body', 'Aquest text és un esborrany basat en plantilles estàndard del RGPD i la LSSI. No substitueix l\'assessorament legal professional. Abans del llançament en producció, aquest contingut ha de ser revisat i adaptat per un advocat especialista.')}
            </div>
          </div>
        )}
        <article className="legal-prose">
          {children}
        </article>
      </section>
    </div>
  );
}
