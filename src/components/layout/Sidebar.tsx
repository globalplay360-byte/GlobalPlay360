import { useAuth } from '@/context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { useEffect, useRef } from 'react';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, activePlan } = useAuth();
  const location = useLocation();
  const unreadMessages = useUnreadCount();
  const { t } = useTranslation();
  const isPremium = activePlan === 'premium';
  const drawerRef = useRef<HTMLElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Tancar drawer mòbil quan canvia la ruta. `onMobileClose` queda fora de deps
  // a propòsit: és un callback que el pare recrea cada render i forçaria un
  // tear-down innecessari de l'effect; aquí només volem reaccionar al canvi de ruta.
  const onMobileCloseRef = useRef(onMobileClose);
  onMobileCloseRef.current = onMobileClose;
  useEffect(() => {
    if (mobileOpen) onMobileCloseRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    // Desa quin element tenia focus abans d'obrir el drawer per restaurar-lo en tancar.
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Focus trap: captura Tab/Shift+Tab i fa cicle només dins el drawer.
    const getFocusables = (): HTMLElement[] => {
      const root = drawerRef.current;
      if (!root) return [];
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));
    };

    // Focus inicial al primer element interactiu del drawer.
    setTimeout(() => {
      const focusables = getFocusables();
      focusables[0]?.focus();
    }, 0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onMobileClose) {
        onMobileClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      // Restaura focus al trigger que va obrir el drawer (típicament hamburger button).
      previouslyFocused.current?.focus?.();
    };
  }, [mobileOpen, onMobileClose]);

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
    ...(isPremium ? [{
      label: t('sidebar.nav.billing', 'Subscripció'), path: '/dashboard/billing', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      )
    }] : [])
  ];

  const sidebarContent = (
    <>
      <div className="py-8 flex items-center justify-center border-b border-[#1F2937] px-4 overflow-hidden relative">
        <NavLink
          to="/dashboard"
          className="flex items-center justify-center group transition-opacity duration-200 hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120] focus-visible:ring-[#3B82F6] rounded-sm"
          aria-label={t('sidebar.gotoDashboard', "Anar al panell d'Inici")}
        >
          <Logo className="h-20 md:h-24 w-auto text-yellow-500 transform scale-[1.55] md:scale-[1.45] origin-center" />
        </NavLink>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden absolute right-3 top-3 p-2 text-[#9CA3AF] hover:text-gray-100/90 hover:bg-[#1F2937]/60 rounded-lg transition-all duration-fast"
            aria-label={t('sidebar.closeMenu', 'Tancar menú')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-6 py-4 mt-2 flex-1 overflow-y-auto custom-scrollbar">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-4 px-2">
          {t('sidebar.mainMenu', 'Menú Principal')}
        </p>
        <nav className="flex flex-col space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-fast ease-out ${
                  isActive
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] shadow-sm transform scale-[1.02]'
                    : 'text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937] hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={isActive ? 'text-[#3B82F6]' : 'text-[#6B7280]'}>{item.icon}</div>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.path === '/dashboard/messages' && unreadMessages > 0 && (
                    <span className="bg-[#EF4444] ml-auto text-gray-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_2px_4px_rgba(239,68,68,0.4)]">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-[#1F2937]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1F2937]">
          <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-sm shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-100 truncate">{user?.displayName || t('sidebar.testUser', 'Usuari')}</p>
            <p className="text-xs text-[#6B7280] truncate capitalize">
              {user?.role ? t(`sidebar.${user.role}Role`, user.role === 'club' ? 'Club' : user.role === 'coach' ? 'Entrenador' : 'Jugador') : t('sidebar.playerRole', 'Jugador')}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-[#0B1120] border-r border-[#1F2937] flex-shrink-0 flex-col hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay + drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-base ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0B1120] border-r border-[#1F2937] flex flex-col shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] transition-transform duration-base ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        /**
         * `inert` quan està tancat: remou focus + interacció de tots els descendents
         * (més correcte que aria-hidden, que Chrome bloqueja quan un descendent
         * conserva focus — patró típic en tancar el drawer clicant un link).
         * React 19+ vol boolean pur, no string buit.
         */
        inert={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegació"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
