import { useTranslation } from 'react-i18next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { COOKIES } from '@/content/legal/cookies.content';
import type { LegalLang } from '@/content/legal/privacy.content';

const LAST_UPDATED = '2026-04-22';

function normalizeLang(lang: string): LegalLang {
  const base = (lang || 'ca').split('-')[0].toLowerCase();
  return (base === 'es' || base === 'en' ? base : 'ca') as LegalLang;
}

export default function CookiesPage() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const content = COOKIES[lang];

  return (
    <LegalPageLayout
      title={t('legal.cookies.title', 'Política de cookies')}
      subtitle={content.subtitle}
      lastUpdated={LAST_UPDATED}
    >
      {content.sections.map((section, i) => (
        <section key={i}>
          {section.title && <h2>{section.title}</h2>}
          <div dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}
    </LegalPageLayout>
  );
}
