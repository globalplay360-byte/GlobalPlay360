import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onMobileMenuClick?: () => void;
}

export default function Topbar({ onMobileMenuClick }: TopbarProps) {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const unreadMessages = useUnreadCount();

  return (
    <header className="h-16 bg-[#0B1120] border-b border-[#1F2937] flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">

      {/* Mobile Menu Button */}
      <div className="flex lg:hidden items-center">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="text-[#9CA3AF] hover:text-gray-100/90 hover:bg-[#1F2937]/60 p-2 -ml-1 rounded-lg transition-all duration-fast ease-out"
          aria-label={t('topbar.openMenu', 'Obrir menú')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex flex-1 max-w-md ml-4 lg:ml-0 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input
          type="search"
          aria-label={t('topbar.searchPlaceholder', 'Cerca jugadors, clubs, estadístiques...')}
          placeholder={t('topbar.searchPlaceholder', 'Cerca jugadors, clubs, estadístiques...')}
          className="w-full bg-[#0F172A] text-gray-100 border border-[#1F2937] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 transition-colors duration-fast ease-out"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notificacions / Missatges */}
        <Link to="/dashboard/messages" className="text-[#9CA3AF] hover:text-gray-100/90 hover:bg-[#1F2937]/60 p-2 rounded-lg transition-all duration-fast ease-out relative group" aria-label={t('topbar.notifications', 'Notificacions')}>
          <svg className="w-5 h-5 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF4444] border-2 border-[#0B1120]"></span>
            </span>
          )}
        </Link>

        <div className="hidden sm:block h-6 w-px bg-[#1F2937]"></div>

        <button
          onClick={logout}
          className="text-sm font-medium text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all duration-fast ease-out flex items-center gap-2 p-2 sm:px-3 rounded-lg"
          aria-label={t('topbar.logout', 'Sortir')}
        >
          <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="hidden sm:inline">{t('topbar.logout', 'Sortir')}</span>
        </button>
      </div>
    </header>
  );
}