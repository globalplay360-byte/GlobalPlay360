import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/Logo';
import {
  claimFounderAccess,
  subscribeToFounderCampaign,
  type FounderCampaign,
} from '@/services/stripe.service';
import { PUBLIC_REGISTRATION_ENABLED } from '@/config/site';

export default function Navbar() {
  const { user, logout, hasFounderAccess } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<FounderCampaign | null>(null);
  const [claimingFounderAccess, setClaimingFounderAccess] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToFounderCampaign(
      (nextCampaign) => setCampaign(nextCampaign),
      () => setCampaign(null),
    );
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleFounderCta = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (hasFounderAccess) {
      navigate('/dashboard/billing');
      return;
    }

    setClaimingFounderAccess(true);
    setBannerMessage(null);

    try {
      const result = await claimFounderAccess();
      setBannerMessage(
        result.alreadyClaimed
          ? t('navbar.banner.alreadyClaimed', 'Ja tens l’accés Founder actiu al teu compte.')
          : t('navbar.banner.claimSuccess', 'Accés Founder activat correctament.'),
      );
      navigate('/dashboard/billing');
    } catch (error) {
      const message = error instanceof Error && error.message.includes('FOUNDER_ACCESS_UNAVAILABLE')
        ? t('navbar.banner.claimUnavailable', 'La promoció Founder ja no està disponible.')
        : t('navbar.banner.claimError', 'No s’ha pogut activar l’accés Founder ara mateix.');
      setBannerMessage(message);
    } finally {
      setClaimingFounderAccess(false);
    }
  };

  const remainingFounderSlots = campaign?.remainingClaims ?? 100;
  const founderCampaignOpen = (campaign?.active ?? true) && remainingFounderSlots > 0;
  const founderBannerButtonLabel = t('navbar.banner.cta', 'Reclama el teu Estatus');

  return (
    <>
      {/* Banner Superior Founder */}
      <div className="bg-[#FFC107] text-[#1A1200] py-2 border-b border-[#d19a00]/35 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)] transition-colors">
        <div className="safe-area-x w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2.5 lg:gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5 min-w-0">
            <p className="m-0 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] text-[#2b1800] text-center sm:text-left leading-tight">
              {t('navbar.banner.title', 'Miembros Fundadores – Acceso Gratuito')}
            </p>
            <span className="inline-flex items-center rounded-full border border-[#7a4b00]/20 bg-[#ffe082] px-2 py-0.5 text-[9px] sm:text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#6a4300]">
              {t('navbar.banner.active', 'Campanya activa')}
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <button
              type="button"
              onClick={handleFounderCta}
              disabled={claimingFounderAccess || (!founderCampaignOpen && !hasFounderAccess)}
              className="bg-[#0A192F] text-gray-100 px-4 py-1.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] hover:bg-[#172A45] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_18px_-10px_rgba(10,25,47,0.65)]"
            >
              {claimingFounderAccess
                ? t('navbar.banner.claiming', 'Activant...')
                : founderCampaignOpen || hasFounderAccess
                  ? founderBannerButtonLabel
                  : t('navbar.banner.closedCta', 'Promoció tancada')}
            </button>

            {bannerMessage && (
              <span className="text-[10px] font-semibold text-[#5c3900] text-center sm:text-right max-w-xs leading-tight">
                {bannerMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="bg-[#020C1B] border-b border-gray-100/5 sticky top-0 z-50">
        <div className="safe-area-x w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-24">
            {/* Logo y Links Izquierda */}
            <div className="flex items-center gap-14 lg:gap-24">
              <Link
                to="/"
                className="-ml-2 flex items-center group transition-opacity duration-200 hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020C1B] focus-visible:ring-[#3B82F6] rounded-sm mr-4 md:mr-8"
                aria-label={t('navbar.home', 'Inici')}
              >
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
                  {PUBLIC_REGISTRATION_ENABLED && (
                    <Link
                      to="/register"
                      className="text-sm font-medium px-5 py-2 bg-[#0070F3] text-gray-100 rounded hover:bg-[#0051B3] transition-colors"
                    >
                      {t('navbar.register', 'Registre')}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
