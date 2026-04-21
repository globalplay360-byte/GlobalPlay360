import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020C1B] text-[#8892B0] mt-auto relative">
      {/* Gradient divider top */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#0070F3]/40 to-transparent" />

      {/* ───────── Grid principal ───────── */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
          {/* Col 1 · Brand + Contacte */}
          <div className="lg:col-span-5 flex flex-col">
            <h3 className="text-white text-xl font-bold mb-4 tracking-tight">
              Global Play 360
            </h3>
            <p className="text-sm leading-relaxed mb-8 max-w-md">
              {t('footer.description')}
            </p>

            <div className="text-sm space-y-3">
              <a
                href="mailto:hello@globalplay360.com"
                className="flex items-center gap-3 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0070F3]/10 border border-[#0070F3]/20 text-[#0070F3] group-hover:bg-[#0070F3]/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                hello@globalplay360.com
              </a>
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0070F3]/10 border border-[#0070F3]/20 text-[#0070F3]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                All around the world
              </p>
            </div>
          </div>

          {/* Col 2 · Platform */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h4 className="text-white font-semibold mb-5 uppercase tracking-wider text-xs">
              {t('footer.col.platform', 'Plataforma')}
            </h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/">{t('navbar.home', 'Inici')}</FooterLink>
              <FooterLink to="/about">{t('footer.about')}</FooterLink>
              <FooterLink to="/opportunities">{t('footer.col.opportunities', 'Oportunitats')}</FooterLink>
              <FooterLink to="/pricing">{t('footer.pricing')}</FooterLink>
            </ul>
          </div>

          {/* Col 3 · Per a tu */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 uppercase tracking-wider text-xs">
              {t('footer.col.forYou', 'Per a tu')}
            </h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/register?role=player">{t('footer.col.players', 'Jugadors')}</FooterLink>
              <FooterLink to="/register?role=club">{t('footer.col.clubs', 'Clubs')}</FooterLink>
              <FooterLink to="/register?role=coach">{t('footer.col.coaches', 'Entrenadors')}</FooterLink>
              <li>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-[#FFC107] hover:text-[#FFD54F] transition-colors group"
                >
                  <span>👑</span>
                  <span className="group-hover:translate-x-0.5 transition-transform duration-fast ease-out">
                    {t('footer.col.founder', 'Membre Fundador')}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 · Legal & Support */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 uppercase tracking-wider text-xs">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/privacy">{t('footer.privacy')}</FooterLink>
              <FooterLink to="/terms">{t('footer.terms')}</FooterLink>
              <FooterLink to="/cookies">{t('footer.col.cookies', 'Cookies')}</FooterLink>
              <FooterLink to="/contact">{t('footer.contact')}</FooterLink>
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Bottom bar ───────── */}
      <section className="border-t border-white/5 bg-[#010814]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-[#8892B0]/80 text-center md:text-left">
            &copy; {currentYear} Global Play 360. {t('footer.rightsShort', 'Tots els drets reservats.')}
          </p>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-4 text-xs text-[#8892B0]/70">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {t('footer.trust.stripe', 'Pagaments per Stripe')}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {t('footer.trust.gdpr', 'GDPR')}
              </span>
            </div>

            <div className="h-4 w-px bg-white/10 hidden md:block" />

            <LanguageSelector />
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="inline-block text-[#8892B0] hover:text-white hover:translate-x-0.5 transition-all duration-fast ease-out"
      >
        {children}
      </Link>
    </li>
  );
}
