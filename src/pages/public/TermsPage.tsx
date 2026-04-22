import { useTranslation } from 'react-i18next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { TERMS } from '@/content/legal/terms.content';
import type { LegalLang } from '@/content/legal/privacy.content';

const LAST_UPDATED = '2026-04-22';

function normalizeLang(lang: string): LegalLang {
  const base = (lang || 'ca').split('-')[0].toLowerCase();
  return (base === 'es' || base === 'en' ? base : 'ca') as LegalLang;
}

export default function TermsPage() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const content = TERMS[lang];

  return (
    <LegalPageLayout
      title={t('legal.terms.title', 'Condicions d\'ús')}
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
