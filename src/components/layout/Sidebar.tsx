import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const { user, activePlan } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const isPremium = activePlan === 'premium';

  // Opcions de navegació en base al rol de l'usuari
  const navItems = [
    { label: t('sidebar.nav.overview', 'Inici'), path: '/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { label: t('sidebar.nav.profile', 'El meu Perfil'), path: '/dashboard/profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>        
    )},
    { label: t('sidebar.nav.opportunities', 'Oportunitats'), path: '/dashboard/opportunities', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )},
    // Visible només per a clubs
    ...(user?.role === 'club' ? [{
      label: t('sidebar.nav.myOffers', 'Les meves ofertes'), path: '/dashboard/opportunities/mine', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>   
      )
    }] : []),
    { label: t('sidebar.nav.applications', 'Candidatures'), path: '/dashboard/applications', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
    { label: t('sidebar.nav.messages', 'Missatges'), path: '/dashboard/messages', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
    { label: t('sidebar.nav.analytics'), path: '/dashboard/analytics', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    )},
    // Visible només per a usuaris Premium
    ...(isPremium ? [{
      label: t('sidebar.nav.billing', 'Subscripció'), path: '/dashboard/billing', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      )
    }] : [])
  ];

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-[#1F2937] flex-shrink-0 flex flex-col hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b border-[#1F2937]">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl text-[#3B82F6]">🏆</span>
          <span className="text-lg font-bold text-white tracking-tight">GP<span className="text-[#3B82F6]">360</span></span>
        </Link>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2 px-3">
          {t('sidebar.mainMenu', 'Menú Principal')}
        </p>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-fast ease-out ${
                  isActive
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'
                }`}
              >
                <div className={`${isActive ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-[#1F2937]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1F2937]">
          <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-sm shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.displayName || t('sidebar.testUser', 'Usuari')}</p>
            <p className="text-xs text-[#6B7280] truncate capitalize">
              {user?.role ? t(`sidebar.${user.role}Role`, user.role === 'club' ? 'Club' : user.role === 'coach' ? 'Entrenador' : 'Jugador') : t('sidebar.playerRole', 'Jugador')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}