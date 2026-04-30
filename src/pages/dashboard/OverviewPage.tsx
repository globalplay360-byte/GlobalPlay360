import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
  BriefcaseIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentCheckIcon,
  StarIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import { formatLocation } from '@/utils/location';
import { getProfileStrength } from '@/utils/profileStrength';

import { getUserApplications, getClubApplications } from '../../services/applications.service';
import { getOpportunities, getOpportunitiesByField } from '../../services/opportunities.service';
import { subscribeToUserConversations } from '../../services/messages.service';
import { getUserDoc } from '../../services/auth.service';
import type { Application, Opportunity, Conversation } from '@/types';

type BaseStats = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
};

const RecentApplicationItem = ({ app, t }: { app: Application, t: any }) => {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getUserDoc(app.userId).then(u => {
      if (mounted) setUserName(u?.displayName || t('overview.sportsman', 'Esportista'));
    }).catch(() => {
      if (mounted) setUserName(t('overview.sportsman', 'Esportista'));
    });
    return () => { mounted = false; };
  }, [app.userId, t]);

  const statusTone = app.status === 'accepted'
    ? 'text-emerald-400'
    : app.status === 'rejected'
      ? 'text-red-400'
      : 'text-[#60A5FA]';

  return (
    <div className="p-5 hover:bg-[#1F2937]/25 transition-colors duration-fast ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2A3447] to-[#1F2937] border border-[#2A3447]/70 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.05)]">
          <UserCircleIcon className="w-5 h-5 text-[#9CA3AF]" />
        </div>
        <div>
          {userName === null ? (
             <div className="h-4 w-32 bg-[#2A3447] animate-pulse rounded mb-1"></div>
          ) : (
             <p className="text-sm font-semibold text-gray-100/90 mb-0.5 tracking-tight truncate max-w-[150px] sm:max-w-xs">{userName}</p>
          )}
          <p className="text-xs text-[#9CA3AF] flex items-center gap-2">
            <span className={`capitalize font-semibold tracking-wide ${statusTone}`}>
              {app.status}
            </span>
            {app.createdAt && (
               <>
                 <span className="w-1 h-1 rounded-full bg-[#2A3447]"></span>
                 <span>{new Date(app.createdAt).toLocaleDateString()}</span>
               </>
            )}
          </p>
        </div>
      </div>
      <Link to={`/dashboard/applications`} className="shrink-0 bg-[#0F172A]/60 hover:bg-[#1F2937]/70 border border-[#2A3447]/70 hover:border-[#3B82F6]/40 text-gray-100/80 hover:text-gray-100/95 transition-all duration-fast ease-out active:scale-[0.98] text-[12px] font-semibold tracking-wide px-3.5 py-2 rounded-lg">
        {t('overview.reviewCV', 'Revisar')}
      </Link>
    </div>
  );
};

export default function OverviewPage() {
  const { user, activePlan } = useAuth();
  const { t } = useTranslation();

  const isClub = user?.role === 'club';
  const isPremium = activePlan === 'premium';

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    let unsubscribeConvs: (() => void) | undefined;

    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        if (isClub) {
          const myOpps = await getOpportunitiesByField('clubId', '==', user.uid);
          const myApps = await getClubApplications(user.uid);
          if (isMounted) {
            setOpportunities(myOpps);
            setApplications(myApps);
          }
        } else {
          const myApps = await getUserApplications(user.uid);
          const allOpps = await getOpportunities(); 
          if (isMounted) {
            setApplications(myApps);
            let openOpps = allOpps.filter(o => o.status === 'open');
            // Sort: match sport first, then newest
            if (user.sport) {
              openOpps = openOpps.sort((a, b) => {
                if (a.sport === user.sport && b.sport !== user.sport) return -1;
                if (a.sport !== user.sport && b.sport === user.sport) return 1;
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
              });
            } else {
              openOpps = openOpps.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            }
            setOpportunities(openOpps);
          }
        }
      } catch (err) {
        console.error('Error fetching overview data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    try {
      unsubscribeConvs = subscribeToUserConversations(user.uid, (convs) => {
        if (isMounted) setConversations(convs);
      });
    } catch(err) {}

    return () => {
      isMounted = false;
      if (unsubscribeConvs) unsubscribeConvs();
    };
  }, [user, isClub]);

  const stats: BaseStats[] = useMemo(() => {
    const now = new Date().getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    const msInWeek = 7 * msInDay;
    const msInMonth = 30 * msInDay;

    const newAppsDay = applications.filter(a => a.createdAt && (now - new Date(a.createdAt).getTime() <= msInDay)).length;
    const newAppsWeek = applications.filter(a => a.createdAt && (now - new Date(a.createdAt).getTime() <= msInWeek)).length;
    const newOppsMonth = opportunities.filter(o => o.createdAt && (now - new Date(o.createdAt).getTime() <= msInMonth)).length;

    // Obviar els canals creats buits on encara no hi ha missatges reals enviats
    const activeConversations = conversations.filter(c => c.lastMessage && c.lastMessage.trim() !== '');
    const hasRecentConvs = activeConversations.some(c => c.updatedAt && (now - new Date(c.updatedAt).getTime() <= msInWeek));

    const profileStrength = getProfileStrength(user);
    const profileTrend =
      profileStrength >= 80 ? t('overview.stats.trends.highLevel', 'Nivell Alt')
      : profileStrength >= 50 ? t('overview.stats.trends.mediumLevel', 'Pots completar més')
      : t('overview.stats.trends.lowLevel', 'Completa el teu perfil');

    if (isClub) {
      return [
        {
          label: t('overview.stats.club.activeOffers'),
          value: opportunities.length,
          icon: BriefcaseIcon,
          trend: newOppsMonth > 0 ? `+${newOppsMonth} ${t('overview.stats.trends.thisMonth', 'aquest mes')}` : undefined,
          trendUp: true,
        },
        {
          label: t('overview.stats.club.applicationsReceived'),
          value: applications.length,
          icon: DocumentCheckIcon,
          trend: newAppsDay > 0 ? `+${newAppsDay} ${t('overview.stats.trends.sinceYesterday', "des d'ahir")}` : undefined,
          trendUp: true,
        },
        {
          label: t('overview.stats.club.conversations'),
          value: activeConversations.length,
          icon: ChatBubbleLeftEllipsisIcon,
        },
        {
          label: t('overview.stats.coachPlayer.profileStrength', 'Força del perfil'),
          value: `${profileStrength}%`,
          icon: UserCircleIcon,
          trend: profileTrend,
          trendUp: profileStrength >= 50,
        },
      ];
    }
    return [
      {
        label: t('overview.stats.coachPlayer.availableOffers'),
        value: opportunities.length,
        icon: StarIcon,
        trend: newOppsMonth > 0 ? `+${newOppsMonth} ${t('overview.stats.trends.thisMonth', 'aquest mes')}` : undefined,
        trendUp: true,
      },
      {
        label: t('overview.stats.coachPlayer.applications'),
        value: applications.length,
        icon: DocumentCheckIcon,
        trend: newAppsWeek > 0 ? `+${newAppsWeek} ${t('overview.stats.trends.thisWeek', 'aquesta setmana')}` : undefined,
        trendUp: true,
      },
      {
        label: t('overview.stats.coachPlayer.pendingMessages'),
        value: activeConversations.length,
        icon: ChatBubbleLeftEllipsisIcon,
        trend: hasRecentConvs ? t('overview.stats.trends.activeRecently', 'Actiu recentment') : undefined,
        trendUp: true,
      },
      {
        label: t('overview.stats.coachPlayer.profileStrength'),
        value: `${profileStrength}%`,
        icon: UserCircleIcon,
        trend: profileTrend,
        trendUp: profileStrength >= 50,
      },
    ];
  }, [isClub, applications, opportunities, conversations, user, t]);

  const recentItems = isClub ? applications.slice(0, 3) : opportunities.slice(0, 3);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-yellow-400/80">{t('overview.hello')}, {user?.displayName || t('overview.sportsman')}</span>
            <span className={"px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase border " + (
              isPremium
                ? 'bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/30'
                : 'bg-[#1A2235] text-[#9CA3AF] border-[#2A3447]/70'
            )}>
              {t('overview.planTag')} {activePlan.toUpperCase()}
            </span>
          </div>
        }
        description={
          isClub
            ? t('overview.clubDescription')
            : user?.role === 'coach'
              ? t('overview.coachDescription')
              : t('overview.playerDescription')
        }
        action={
          isClub ? (
            <Link to="/dashboard/opportunities/new" className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-gray-100/95 text-[13px] font-semibold tracking-wide px-4 py-2.5 rounded-lg transition-all duration-base active:scale-[0.98] flex items-center gap-2 shadow-[0_6px_14px_-6px_rgba(59,130,246,0.5)]">
              <PlusCircleIcon className="w-4 h-4" />
              {t('overview.publishOffer')}
            </Link>
          ) : (
            <Link to="/dashboard/profile" className="bg-gradient-to-b from-[#1A2235] to-[#141C2E] hover:border-[#3B82F6]/40 text-gray-100/90 border border-[#2A3447]/70 text-[13px] font-semibold tracking-wide px-4 py-2.5 rounded-lg transition-all duration-fast ease-out active:scale-[0.98] flex items-center gap-2 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset]">
              <UserCircleIcon className="w-4 h-4 text-[#9CA3AF]" />
              {t('overview.completeProfile')}
            </Link>
          )
        }
      />

      <div className="relative mb-2 md:mb-4">
        {/* Animated Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-[12.5%] right-[12.5%] h-[2px] bg-transparent -translate-y-1/2 z-0 overflow-hidden rounded-full">
          <motion.div
            className="w-[150px] h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
            initial={{ left: '-15%' }}
            animate={{ left: ['-15%', '105%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', top: 0 }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-3 sm:gap-4 md:gap-6 lg:gap-8 justify-items-center py-2 sm:py-4 md:py-6 relative z-10 pointer-events-none">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0B1120] rounded-full w-full max-w-[160px] sm:max-w-[200px] md:max-w-[220px] aspect-square flex items-center justify-center relative pointer-events-auto">
              <motion.div
                animate={{ borderColor: ['rgba(234,179,8,0.8)', 'rgba(234,179,8,0.2)', 'rgba(234,179,8,0.8)'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                whileHover={{ borderColor: 'rgba(250,204,21,1)', transition: { duration: 0.2 } }}
                className="bg-[#374151]/50 border rounded-full w-full h-full flex flex-col items-center justify-center relative group transition-all duration-500 ease-out fill-available hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:-translate-y-1 p-2.5 sm:p-3 md:p-4"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />

                <div className="relative z-10 mb-1.5 sm:mb-2">
                   <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center mb-1.5 sm:mb-2">
                  {loading ? (
                     <div className="h-7 sm:h-8 w-12 sm:w-14 bg-[#4B5563] animate-pulse rounded-md mb-1"></div>
                  ) : (
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-500 tracking-tight leading-none mb-1 sm:mb-1.5">{stat.value}</h3>
                  )}
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-[#9CA3AF] font-bold uppercase tracking-wider leading-tight px-1 text-center">{stat.label}</p>
                </div>

                {stat.trend && (
                  <div className="relative z-10 mt-0.5 sm:mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap text-[#D1D5DB] bg-[#1F2937]/50 border border-[#4B5563]/50">
                      {stat.trend}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section>
            <h2 className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mb-4">{t('overview.quickActions.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction href="/dashboard/opportunities" icon={BriefcaseIcon} label={t('overview.quickActions.exploreOffers')} />
              <QuickAction href="/dashboard/applications" icon={DocumentCheckIcon} label={t('overview.quickActions.applications')} />
              <QuickAction href="/dashboard/messages" icon={ChatBubbleLeftEllipsisIcon} label={t('overview.quickActions.messages')} />
              <QuickAction href="/dashboard/profile" icon={isClub ? BuildingOfficeIcon : UserCircleIcon} label={t('overview.quickActions.yourProfile')} />
            </div>
          </section>

          <section className="relative bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl overflow-hidden flex-1 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] h-full flex flex-col">
            <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
            <div className="px-5 py-4 border-b border-[#2A3447]/60 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-gray-100/90 tracking-tight">
                {isClub ? t('overview.recentApplicationsTitle') : t('overview.recommendedOffersTitle')}
              </h2>
              <Link to={isClub ? "/dashboard/applications" : "/dashboard/opportunities"} className="text-[13px] font-semibold text-[#60A5FA] hover:text-[#93C5FD] flex items-center gap-1 transition-colors duration-fast ease-out group">
                {t('overview.seeMore')}
                <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="divide-y divide-[#2A3447]/50 flex-1">
              {loading ? (
                <div className="p-8 flex justify-center items-center h-48">
                  <div className="animate-spin w-8 h-8 rounded-full border-b-2 border-[#3B82F6]"></div>
                </div>
              ) : recentItems.length === 0 ? (
                 <div className="p-8 text-center text-[#6B7280] text-sm h-48 flex items-center justify-center italic">
                    {isClub ? t('overview.noApplicationsYet', 'No hi ha candidatures encara.') : t('overview.noRecentOpportunities', 'No hi ha oportunitats recents.')}
                 </div>
              ) : isClub ? (
                (recentItems as Application[]).map((app) => (
                  <RecentApplicationItem key={app.id} app={app} t={t} />
                ))
              ) : (
                (recentItems as Opportunity[]).map((opp) => (
                  <div key={opp.id} className="p-5 hover:bg-[#1F2937]/25 transition-colors duration-fast ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2A3447] to-[#1F2937] flex items-center justify-center shrink-0 border border-[#2A3447]/70 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.05)]">
                        <BuildingOfficeIcon className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-100/90 mb-0.5 tracking-tight truncate">{opp.title}</p>
                        <p className="text-xs text-[#9CA3AF] capitalize truncate">{opp.sport} • {opp.contractType} • {formatLocation(opp)}</p>
                      </div>
                    </div>
                    <Link to={`/dashboard/opportunities/${opp.id}`} className="shrink-0 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/25 hover:border-[#3B82F6]/40 transition-all duration-fast ease-out active:scale-[0.98] text-[12px] font-semibold tracking-wide px-3.5 py-2 rounded-lg">
                      {t('overview.enter', 'Veure més')}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section>
            {isPremium ? (
              <div className="relative bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#3B82F6]/30 rounded-2xl p-5 sm:p-6 overflow-hidden shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(59,130,246,0.3)]">
                <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent" />
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.05]">
                  <SparklesIcon className="w-32 h-32 text-[#3B82F6]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-[10.5px] font-semibold text-[#60A5FA] uppercase tracking-[0.14em]">{activePlan}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100/90 mb-2 tracking-tight">{t('overview.activePlan.title')}</h3>
                  <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed">{t('overview.activePlan.description')}</p>
                  <Link to="/dashboard/billing" className="block w-full text-center bg-[#0F172A]/60 hover:bg-[#1F2937]/70 text-gray-100/90 text-[13px] font-semibold tracking-wide px-4 py-2.5 rounded-lg border border-[#2A3447]/70 hover:border-[#3B82F6]/40 transition-all duration-fast ease-out active:scale-[0.98]">
                    {t('overview.activePlan.manageButton')}
                  </Link>
                </div>
              </div>
            ) : (
               <div className="relative bg-gradient-to-br from-[#EAB308]/15 via-[#1A2235] to-[#141C2E] border border-[#EAB308]/30 rounded-2xl p-5 sm:p-6 overflow-hidden group shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(234,179,8,0.25)]">
                 <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#EAB308]/25 to-transparent" />
                 <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-base ease-out">
                   <SparklesIcon className="w-24 h-24 text-[#EAB308]" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                     <SparklesIcon className="w-4 h-4 text-[#EAB308]" />
                     <span className="text-[10.5px] font-semibold text-[#EAB308] uppercase tracking-[0.14em]">UPGRADE</span>
                   </div>
                   <h3 className="text-lg font-semibold text-gray-100/90 mb-2 tracking-tight">{t('overview.upgrade.title')}</h3>
                   <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed">
                     <Trans i18nKey="overview.upgrade.description">
                       Rep fins a un <strong className="text-gray-100/90 font-semibold">300% més</strong> d'impressions de clubs i envia missatges directes.
                     </Trans>
                   </p>
                   <Link to="/pricing" className="bg-[#EAB308] hover:bg-[#F5C518] text-[#0B1220] text-[13px] font-semibold tracking-wide px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-[0_6px_14px_-6px_rgba(234,179,8,0.55)] transition-all duration-base active:scale-[0.98] w-full relative z-10">
                     {t('overview.upgrade.button')}
                   </Link>
                 </div>
               </div>
            )}
          </section>

          <section className="relative bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl p-5 md:p-6 flex-1 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
            <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
            <h2 className="text-[15px] font-semibold text-gray-100/90 tracking-tight mb-5">
              {t('overview.activity.title')}
            </h2>
            <ActivityTimeline
              user={user}
              applications={applications}
              conversations={conversations}
              isClub={isClub}
              t={t}
            />
          </section>

        </div>
      </div>
    </div>
  );
}

type ActivityEntry = {
  key: string;
  icon: React.ElementType;
  iconTone: string;
  title: string;
  desc: string;
  date: string;
};

function ActivityTimeline({
  user,
  applications,
  conversations,
  isClub,
  t,
}: {
  user: ReturnType<typeof useAuth>['user'];
  applications: Application[];
  conversations: Conversation[];
  isClub: boolean;
  t: any;
}) {
  const entries: ActivityEntry[] = [];

  if (user?.createdAt) {
    entries.push({
      key: 'created',
      icon: CheckCircleIcon,
      iconTone: 'text-emerald-400',
      title: t('overview.activity.created.title', 'Compte creat'),
      desc: t('overview.activity.created.desc', 'Ja formes part de GlobalPlay360.'),
      date: new Date(user.createdAt).toLocaleDateString(),
    });
  }

  const lastApp = applications[0];
  if (lastApp?.createdAt) {
    entries.push({
      key: `app-${lastApp.id}`,
      icon: DocumentCheckIcon,
      iconTone: 'text-[#60A5FA]',
      title: isClub
        ? t('overview.activity.lastAppClub.title', 'Última candidatura rebuda')
        : t('overview.activity.lastAppUser.title', 'Última candidatura enviada'),
      desc: isClub
        ? t('overview.activity.lastAppClub.desc', 'Hi ha una nova candidatura per revisar.')
        : t('overview.activity.lastAppUser.desc', 'Estem esperant resposta del club.'),
      date: new Date(lastApp.createdAt).toLocaleDateString(),
    });
  }

  const activeConv = conversations.find((c) => c.lastMessage && c.lastMessage.trim() !== '');
  if (activeConv?.updatedAt) {
    entries.push({
      key: `conv-${activeConv.id}`,
      icon: ChatBubbleLeftEllipsisIcon,
      iconTone: 'text-[#EAB308]',
      title: t('overview.activity.lastConv.title', 'Conversa activa'),
      desc: t('overview.activity.lastConv.desc', 'Tens una conversa amb missatges recents.'),
      date: new Date(activeConv.updatedAt).toLocaleDateString(),
    });
  }

  return (
    <div className="relative border-l border-[#2A3447]/60 ml-3 mt-4">
      {entries.map((e) => {
        const Icon = e.icon;
        return (
          <div key={e.key} className="relative pl-5 pb-6 last:pb-0">
            <div className="absolute top-0.5 -left-[17px] bg-gradient-to-br from-[#2A3447] to-[#1F2937] p-1.5 rounded-full border-4 border-[#141C2E] shadow-[inset_0_1px_0_0_rgba(243,244,246,0.05)]">
              <Icon className={`w-3 h-3 ${e.iconTone}`} />
            </div>
            <p className="text-sm font-semibold text-gray-100/90 mb-0.5 tracking-tight">{e.title}</p>
            <p className="text-xs text-[#9CA3AF] mb-1 leading-relaxed">{e.desc}</p>
            <span className="text-[10px] font-medium text-[#6B7280] tracking-wide">{e.date}</span>
          </div>
        );
      })}
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      to={href}
      className="relative bg-gradient-to-b from-[#1A2235] to-[#141C2E] hover:border-[#3B82F6]/40 border border-[#2A3447]/70 transition-all duration-base ease-out hover:-translate-y-0.5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center group shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] hover:shadow-[0_1px_0_0_rgba(243,244,246,0.06)_inset,0_20px_50px_-20px_rgba(59,130,246,0.35)]">
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
      <div className="bg-gradient-to-br from-[#2A3447] to-[#1F2937] group-hover:from-[#3B82F6] group-hover:to-[#2563EB] group-hover:shadow-[0_6px_14px_-6px_rgba(59,130,246,0.5)] text-[#60A5FA] group-hover:text-gray-100/95 p-2.5 rounded-lg transition-all duration-base ease-out transform group-hover:scale-105 border border-[#2A3447]/70 group-hover:border-[#3B82F6]/40">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[12px] font-semibold tracking-wide text-[#9CA3AF] group-hover:text-gray-100/90 transition-colors duration-fast ease-out">{label}</span>
    </Link>
  );
}
