import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';

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
            <strong>{t('navbar.banner.title')}</strong>
            <span className="hidden md:inline text-black/50">•</span>
          </span>
          <span className="md:ml-2 font-medium">
            {t('navbar.banner.description')}
          </span>
          <Link to="/register" className="ml-0 md:ml-4 bg-[#0A192F] text-white px-4 py-1.5 rounded-full text-xs hover:bg-[#172A45] transition-colors whitespace-nowrap mt-2 md:mt-0">
            {t('navbar.banner.cta')}
          </Link>
        </div>
      </div>

      <nav className="bg-[#020C1B] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Links Izquierda */}
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
                <span className="text-[#0070F3] text-2xl">🏆</span> {t('navbar.brand')}
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  {t('navbar.home')}
                </Link>
                <Link to="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  {t('navbar.about')}
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center mr-2">
                <LanguageSelector />
              </div>

              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-sm text-white/70 hover:text-[#FFC107] transition-colors"
                    >
                      {t('navbar.admin')}
                    </Link>
                  )}
                  <span className="text-sm font-medium text-white">{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    {t('navbar.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {t('navbar.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium px-5 py-2 bg-[#0070F3] text-white rounded hover:bg-[#0051B3] transition-colors"
                  >
                    {t('navbar.register')}
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
