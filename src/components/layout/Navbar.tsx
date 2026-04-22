import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Banner Superior Daurat */}
      <div className="bg-[#FFC107] text-[#020C1B] py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center text-xs sm:text-sm font-medium gap-2 text-center">
          <span className="flex items-center gap-2">
            <span>👑</span> 
            <strong>{t('navbar.banner.title', 'Membres Fundadors – Accés Gratuït')}</strong>
            <span className="hidden md:inline text-black/50">•</span>
          </span>
          <span className="md:ml-2 font-medium">
            {t('navbar.banner.description', 'Sigues un dels primers 100 membres en unir-te i obtén accés Premium gratuït fins al 1 de juliol de 2026!')}
          </span>
          <Link to="/register" className="ml-0 md:ml-4 bg-[#0A192F] text-gray-100 px-4 py-1.5 rounded-full text-xs hover:bg-[#172A45] transition-colors whitespace-nowrap mt-2 md:mt-0">
            {t('navbar.banner.cta', 'Reclama el teu Estatus')}
          </Link>
        </div>
      </div>

      <nav className="bg-[#020C1B] border-b border-gray-100/5 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-24">
            {/* Logo y Links Izquierda */}
            <div className="flex items-center gap-14 lg:gap-24">
              <Link 
                to="/" 
                className="-ml-2 flex items-center group transition-opacity duration-200 hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020C1B] focus-visible:ring-[#3B82F6] rounded-sm mr-4 md:mr-8"
                aria-label="Tornar a l'inici"
              >
                {/* Punt exacte final d'equilibri per lletres visibles al SaaS */}
                <Logo className="h-16 md:h-24 w-auto text-gray-100 transform scale-[1.45] origin-left" />
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-gray-100/70 hover:text-gray-100 transition-colors">
                  {t('navbar.home', 'Inici')}
                </Link>
                <Link to="/about" className="text-sm font-medium text-gray-100/70 hover:text-gray-100 transition-colors">
                  {t('navbar.about', 'Sobre Nosaltres')}
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center mr-2">
                <LanguageSelector />
              </div>

              {user ? (
                <div className="flex items-center gap-4 border-l border-gray-100/10 pl-6 ml-2">
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-100/70">
                    Hola, {user.displayName}
                  </span>
                  
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium px-5 py-2 bg-gray-100/10 text-gray-100 rounded hover:bg-gray-100/20 transition-colors"
                  >
                    {t('navbar.dashboard', 'El Meu Panell')}
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-sm px-3 py-1.5 border border-[#FFC107]/50 text-[#FFC107] rounded hover:bg-[#FFC107]/10 transition-colors"
                    >
                      {t('navbar.admin', 'Admin')}
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium px-2 py-2 text-gray-100/50 hover:text-red-400 transition-colors cursor-pointer"
                    title={t('navbar.logout', 'Tancar Sessió')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-100/80 hover:text-gray-100 transition-colors"
                  >
                    {t('navbar.login', 'Iniciar Sessió')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium px-5 py-2 bg-[#0070F3] text-gray-100 rounded hover:bg-[#0051B3] transition-colors"
                  >
                    {t('navbar.register', 'Registre')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
