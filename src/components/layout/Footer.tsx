import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#020C1B] text-[#8892B0] border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-[#0070F3]"></span> Global Play 360
            </h3>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              {t('footer.description', 'Global Play 360 és la plataforma principal que connecta atletes, entrenadors i organitzacions esportives de tot el món.')}
            </p>
            <div className="text-sm">
              <h4 className="text-white font-semibold mb-2">{t('footer.contact', 'Contacte')}</h4>
              <p>info@globalplay360-com-774207.hostingersite.com</p>
              <p className="mt-1">Madrid, Spain</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">{t('footer.about', 'Sobre Nosaltres')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-[#0070F3] transition-colors">{t('footer.about', 'Sobre Nosaltres')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#0070F3] transition-colors">{t('footer.contact', 'Contacte')}</Link></li>
              <li><Link to="/pricing" className="hover:text-[#0070F3] transition-colors">{t('footer.pricing', 'Preus')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">{t('footer.legal', 'Legal')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="hover:text-[#0070F3] transition-colors">{t('footer.privacy', 'Política de Privacitat')}</Link></li>
              <li><Link to="/terms" className="hover:text-[#0070F3] transition-colors">{t('footer.terms', 'Termes de Servei')}</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Separator and Bottom section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; {t('footer.rights', '2026 Global Play 360. Tots els drets reservats.')}</p>
          <div className="mt-4 md:mt-0">
            <span className="mr-4 text-white font-medium">{t('footer.followUs', 'Segueix-nos')}</span>
            {/* Oportunitat per col·locar xarxes socials i icones aquí */}
          </div>
        </div>
      </div>
    </footer>
  );
}
