import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Opportunity } from '@/types';
import { getOpportunityById } from '@/services/opportunities.service';
import { getUserDoc } from '@/services/auth.service';
import { createApplication, hasUserApplied } from '@/services/applications.service';
import { getOrCreateConversation } from '@/services/messages.service';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/ui/EmptyState';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  // Resol "Tornar" en funció de l'origen de navegació (state.from)
  const from = (location.state as { from?: string } | null)?.from;
  const backTarget = (() => {
    if (from === 'applications') return { url: '/dashboard/applications', label: t('opportunityDetail.backApplications') };
    if (from === 'mine') return { url: '/dashboard/opportunities/mine', label: t('opportunityDetail.backMine') };
    if (from === 'marketplace') return { url: '/dashboard/opportunities', label: t('opportunityDetail.backMarketplace') };
    // Fallback per accés directe per URL: decidim pel rol
    return user?.role === t('opportunityDetail.club')
      ? { url: '/dashboard/opportunities/mine', label: t('opportunityDetail.backMine') }
      : { url: '/dashboard/opportunities', label: t('opportunityDetail.backMarketplace') };
  })();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [clubName, setClubName] = useState<string>('');
  const [clubEmail, setClubEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application state
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);

        const opp = await getOpportunityById(id);
        if (cancelled) return;

        if (!opp) {
          setOpportunity(null);
          setIsLoading(false);
          return;
        }

        setOpportunity(opp);

        // Fetch club info + check if already applied in parallel
        const [clubDoc, applied] = await Promise.all([
          getUserDoc(opp.clubId),
          user ? hasUserApplied(user.uid, opp.id) : false,
        ]);
        if (!cancelled) {
          if (clubDoc) {
            setClubName(clubDoc.displayName);
            setClubEmail(clubDoc.email);
          }
          setAlreadyApplied(applied);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('opportunityDetail.errorLoading'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !opportunity) return;
    try {
      setApplying(true);
      setApplyError(null);
      await createApplication({
        opportunityId: opportunity.id,
        userId: user.uid,
        clubId: opportunity.clubId,
      });
      setAlreadyApplied(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : t('opportunityDetail.errorApply'));
    } finally {
      setApplying(false);
    }
  };

const handleMessage = async () => {
    if (!user || !opportunity) return;

    try {
      setApplying(true);
      const convId = await getOrCreateConversation(user.uid, opportunity.clubId);
      navigate(`/dashboard/messages/${convId}`);
    } catch (err) {
      alert(t('opportunityDetail.errorChat'));
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(i18n.language === 'ca' ? 'ca-ES' : i18n.language === 'es' ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  // ── Loading state ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-[#1F2937] rounded" />
        <div className="h-64 bg-[#111827] rounded-xl" />
        <div className="h-40 bg-[#111827] rounded-xl" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title={t("opportunityDetail.connErrorTitle")}
          description={error}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => window.location.reload()}>{t("opportunityDetail.retry")}</Button>
          }
        />
      </div>
    );
  }

  // ── Not found state ───────────────────────────────────
  if (!opportunity) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title={t("opportunityDetail.notFoundTitle")}
          description="Aquesta oportunitat podria haver estat eliminada o l'ID no és vàlid."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>
              Tornar al Marketplace
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-100 space-y-6">
      {/* Top Nav */}
      <div className="mb-6">
        <button
          onClick={() => navigate(backTarget.url)}
          className="inline-flex items-center text-sm font-medium text-[#9CA3AF] hover:text-gray-100 transition-all duration-fast ease-out active:scale-[0.98] hover:-translate-x-1"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {backTarget.label}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-medium text-gray-100/90 mb-2 tracking-normal leading-tight">{opportunity.title}</h1>
                {clubName && <p className="text-[#3B82F6] font-medium text-base">{clubName}</p>}
              </div>
              <Badge variant={opportunity.status === 'open' ? 'success' : 'default'} className="w-fit uppercase tracking-wider font-semibold">
                {opportunity.status}
              </Badge>
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-[#1F2937] mb-10">
              <div>
                <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-1 flex items-center">
                  <MapPinIcon className="w-3.5 h-3.5 mr-1" /> {t("opportunityDetail.location")}
                </div>
                <div className="font-medium text-gray-100">{opportunity.location}</div>
              </div>
              <div>
                <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-1 flex items-center">
                  <BriefcaseIcon className="w-3.5 h-3.5 mr-1" /> {t("opportunityDetail.contract")}
                </div>
                <div className="font-medium text-gray-100 capitalize">{opportunity.contractType.replace('-', ' ')}</div>
              </div>
              <div>
                <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-1 flex items-center">
                  <UserGroupIcon className="w-3.5 h-3.5 mr-1" /> {t("opportunityDetail.gender")}
                </div>
                <div className="font-medium text-gray-100 capitalize">{opportunity.gender}</div>
              </div>
              <div>
                <div className="text-[#6B7280] text-xs uppercase tracking-wider mb-1 flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" /> {t("opportunityDetail.published")}
                </div>
                <div className="font-medium text-gray-100">{formatDate(opportunity.createdAt)}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl font-medium text-gray-100/90 tracking-normal mb-4">Sobre l'Oportunitat</h2>
              <div className="text-sm text-[#9CA3AF] leading-relaxed space-y-4 whitespace-pre-wrap">
                {opportunity.description}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-medium text-gray-100/90 tracking-normal mb-4">{t("opportunityDetail.requirements")}</h2>
              <ul className="space-y-3">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">•</span>
                    <span className="text-[#6B7280]">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-[#3B82F6]/30 shadow-lg shadow-[#3B82F6]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#3B82F6]/5 to-transparent pointer-events-none" />
            <CardContent className="p-6 sm:p-8 relative z-10">
              {user?.role === t('opportunityDetail.club') ? (
                <div className="text-center text-[#9CA3AF] p-4 text-sm font-medium">
                  Els clubs no poden aplicar a oportunitats.
                </div>
              ) : (
                <div className="space-y-4">
                  {alreadyApplied ? (
                    <div className="text-center p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg">
                      <span className="text-[#10B981] font-semibold text-sm tracking-wide">{t('opportunityDetail.alreadyApplied')}</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="text-base font-bold tracking-wide shadow-md hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-base ease-out active:scale-[0.98]"
                      onClick={handleApply}
                      disabled={applying}
                    >
                      {applying ? t('opportunityDetail.sending') : t('opportunityDetail.applyNow')}
                    </Button>
                  )}

                  {applyError && (
                    <div className="text-center text-xs font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 rounded-lg">
                      {applyError}
                    </div>
                  )}

                  <Button variant="secondary" size="lg" fullWidth onClick={handleMessage} className="font-semibold transition-all duration-fast ease-out active:scale-[0.98]">
                    Contactar Club
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Club Info Card */}
          <Card>
            <CardContent className="p-6 space-y-5 text-sm">
              <h3 className="font-bold text-gray-100 tracking-wide">{t('opportunityDetail.aboutClub')}</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1F2937] rounded-full flex items-center justify-center text-xl font-bold text-gray-100 overflow-hidden shadow-inner uppercase">
                  {clubName?.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="font-bold text-gray-100 text-base leading-tight">{clubName || t('opportunityDetail.club')}</div>
                  {clubEmail && <div className="text-[#3B82F6] font-medium mt-0.5">{clubEmail}</div>}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-6 px-6">
              <Button variant="outline" size="sm" fullWidth className="transition-all duration-fast ease-out active:scale-[0.98]">
                Veure Perfil Complet
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}


