import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onMobileMenuClick?: () => void;
  isVerified?: boolean;
  sendingVerificationEmail?: boolean;
  verificationEmailSent?: boolean;
  onResendVerificationEmail?: () => void;
}

export default function Topbar({
  onMobileMenuClick,
  isVerified = true,
  sendingVerificationEmail = false,
  verificationEmailSent = false,
  onResendVerificationEmail,
}: TopbarProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const unreadMessages = useUnreadCount();

  return (
    <header className="h-16 bg-[#0B1120] border-b border-[#1F2937] flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">

      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="lg:hidden text-[#9CA3AF] hover:text-gray-100/90 hover:bg-[#1F2937]/60 p-2 -ml-1 rounded-lg transition-all duration-fast ease-out"
          aria-label={t('topbar.openMenu', 'Obrir menú')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {!isVerified && (
          <div className="ml-2 sm:ml-3 flex items-center gap-2 rounded-lg border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-2.5 py-1.5 sm:px-3 min-w-0">
            <svg className="w-4 h-4 text-[#60A5FA] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="hidden md:block text-xs text-[#CBD5E1] truncate">
              {t('dashboardLayout.banner.unverifiedText')}
            </span>
            <button
              type="button"
              onClick={onResendVerificationEmail}
              disabled={sendingVerificationEmail || verificationEmailSent}
              className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                verificationEmailSent
                  ? 'text-green-400 cursor-default'
                  : 'text-[#60A5FA] hover:text-[#93C5FD]'
              }`}
            >
              {sendingVerificationEmail
                ? t('dashboardLayout.banner.sending')
                : verificationEmailSent
                  ? t('dashboardLayout.banner.sent')
                  : t('dashboardLayout.banner.resend')}
            </button>
          </div>
        )}
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

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 border border-[#FFC107]/50 text-[#FFC107] rounded-lg hover:bg-[#FFC107]/10 transition-colors"
          >
            {t('navbar.admin', 'Admin')}
          </Link>
        )}

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