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
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';

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

  return (
    <div className="p-5 hover:bg-[#1F2937]/30 transition-colors duration-fast ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center shrink-0 border border-[#374151]">
          <UserCircleIcon className="w-6 h-6 text-[#9CA3AF]" />
        </div>
        <div>
          {userName === null ? (
             <div className="h-4 w-32 bg-[#374151] animate-pulse rounded mb-1"></div>
          ) : (
             <p className="text-sm font-semibold text-gray-200 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-xs">{userName}</p>
          )}
          <p className="text-xs text-[#9CA3AF] flex items-center gap-2">
            <span className={"capitalize font-medium " + (app.status === 'accepted' ? 'text-green-400' : app.status === 'rejected' ? 'text-red-400' : 'text-blue-400')}>
              {app.status}
            </span>
            {app.createdAt && (
               <>
                 <span className="w-1 h-1 rounded-full bg-[#374151]"></span>
                 <span>{new Date(app.createdAt).toLocaleDateString()}</span>
               </>
            )}
          </p>
        </div>
      </div>
      <Link to={`/dashboard/applications`} className="shrink-0 bg-[#0F172A] hover:bg-[#1F2937] transition-all duration-fast ease-out active:scale-[0.98] text-gray-300 hover:text-white text-xs font-semibold px-4 py-2 border border-[#374151] rounded-lg">
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

    // Calculs basats en dades reals
    const newAppsDay = applications.filter(a => a.createdAt && (now - new Date(a.createdAt).getTime() <= msInDay)).length;
    const newAppsWeek = applications.filter(a => a.createdAt && (now - new Date(a.createdAt).getTime() <= msInWeek)).length;
    const newOppsMonth = opportunities.filter(o => o.createdAt && (now - new Date(o.createdAt).getTime() <= msInMonth)).length;
    
      // Obviar els canals creats buits on encara no hi ha missatges reals enviats
      const activeConversations = conversations.filter(c => c.lastMessage && c.lastMessage.trim() !== '');

      // Per a l'esportista/coach (activeRecently) 
      const hasRecentConvs = activeConversations.some(c => c.updatedAt && (now - new Date(c.updatedAt).getTime() <= msInWeek));
  
      if (isClub) {
        return [
          { 
            label: t('overview.stats.club.activeOffers'), 
            value: opportunities.length, 
            icon: BriefcaseIcon, 
            trend: newOppsMonth > 0 ? `+${newOppsMonth} ${t('overview.stats.trends.thisMonth', 'aquest mes')}` : undefined, 
            trendUp: true 
          },
          { 
            label: t('overview.stats.club.applicationsReceived'), 
            value: applications.length, 
            icon: DocumentCheckIcon, 
            trend: newAppsDay > 0 ? `+${newAppsDay} ${t('overview.stats.trends.sinceYesterday', "des d'ahir")}` : undefined, 
            trendUp: true 
          },
          { 
            label: t('overview.stats.club.conversations'), 
            value: activeConversations.length, 
            icon: ChatBubbleLeftEllipsisIcon 
          },
          { 
            label: t('overview.stats.club.profileVisits'), 
            value: '---', // TODO: Implementar visibilitat de perfil o treure card en un futur.
            icon: ChartBarIcon 
          },
        ];
      }
      return [
        { 
          label: t('overview.stats.coachPlayer.availableOffers'), 
          value: opportunities.length, 
          icon: StarIcon, 
          trend: newOppsMonth > 0 ? `+${newOppsMonth} ${t('overview.stats.trends.thisMonth', 'aquest mes')}` : undefined,
          trendUp: true
        },
        { 
          label: t('overview.stats.coachPlayer.applications'), 
          value: applications.length, 
          icon: DocumentCheckIcon, 
          trend: newAppsWeek > 0 ? `+${newAppsWeek} ${t('overview.stats.trends.thisWeek', 'aquesta setmana')}` : undefined, 
          trendUp: true 
        },
        { 
          label: t('overview.stats.coachPlayer.pendingMessages'), 
          value: activeConversations.length, 
          icon: ChatBubbleLeftEllipsisIcon, 
          trend: hasRecentConvs ? t('overview.stats.trends.activeRecently', 'Actiu recentment') : undefined, 
          trendUp: true 
        },
        { 
          label: t('overview.stats.coachPlayer.profileStrength'), 
          value: '100%',
          icon: UserCircleIcon, 
          trend: t('overview.stats.trends.highLevel', 'Nivell Alt'), 
          trendUp: true 
        },
      ];
  }, [isClub, applications, opportunities, conversations, t]);

  const recentItems = isClub ? applications.slice(0, 3) : opportunities.slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-yellow-400/80">{t('overview.hello')}, {user?.displayName || t('overview.sportsman')}</span>
            <span className={"px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border " + (
              isPremium
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-[#1F2937] text-[#6B7280] border-[#374151]'
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
            <Link to="/dashboard/opportunities/new" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-fast ease-out active:scale-[0.98] flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <PlusCircleIcon className="w-5 h-5" />
              {t('overview.publishOffer')}
            </Link>
          ) : (
            <Link to="/dashboard/profile" className="bg-[#111827] hover:bg-[#1F2937] text-white border border-[#374151] hover:border-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-fast ease-out active:scale-[0.98] flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-[#9CA3AF]" />
              {t('overview.completeProfile')}
            </Link>
          )
        }
      />

      <div className="relative mb-4">
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

        <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 md:gap-6 lg:gap-8 justify-items-center py-4 sm:py-6 relative z-10 pointer-events-none">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0B1120] rounded-full w-full max-w-[220px] aspect-square flex items-center justify-center relative pointer-events-auto">
              <motion.div 
                animate={{ borderColor: ['rgba(234,179,8,0.8)', 'rgba(234,179,8,0.2)', 'rgba(234,179,8,0.8)'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                whileHover={{ borderColor: 'rgba(250,204,21,1)', transition: { duration: 0.2 } }}
                className="bg-[#374151]/50 border rounded-full w-full h-full flex flex-col items-center justify-center relative group transition-all duration-500 ease-out fill-available hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:-translate-y-1 p-3 sm:p-4"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                
                <div className="relative z-10 mb-2">
                   <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center mb-2">
                  {loading ? (
                     <div className="h-8 w-14 bg-[#4B5563] animate-pulse rounded-md mb-1"></div>
                  ) : (
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-yellow-500 tracking-tight leading-none mb-1.5">{stat.value}</h3>
                  )}
                  <p className="text-[10px] sm:text-xs text-[#9CA3AF] font-bold uppercase tracking-wider leading-tight px-1 text-center">{stat.label}</p>
                </div>

                {stat.trend && (
                  <div className="relative z-10 mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap text-[#D1D5DB] bg-[#1F2937]/50 border border-[#4B5563]/50">
                      {stat.trend}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 sm:p-8">
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-6 sm:p-8">
          <section>
            <h2 className="text-base font-semibold text-gray-200 mb-4">{t('overview.quickActions.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction href="/dashboard/opportunities" icon={BriefcaseIcon} label={t('overview.quickActions.exploreOffers')} />
              <QuickAction href="/dashboard/applications" icon={DocumentCheckIcon} label={t('overview.quickActions.applications')} />
              <QuickAction href="/dashboard/messages" icon={ChatBubbleLeftEllipsisIcon} label={t('overview.quickActions.messages')} />
              <QuickAction href="/dashboard/profile" icon={isClub ? BuildingOfficeIcon : UserCircleIcon} label={t('overview.quickActions.yourProfile')} />
            </div>
          </section>

          <section className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden flex-1 shadow-sm h-full flex flex-col">
            <div className="px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-200">
                {isClub ? t('overview.recentApplicationsTitle') : t('overview.recommendedOffersTitle')}
              </h2>
              <Link to={isClub ? "/dashboard/applications" : "/dashboard/opportunities"} className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors duration-fast ease-out">
                {t('overview.seeMore')}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-[#1F2937] flex-1">
              {loading ? (
                <div className="p-8 flex justify-center items-center h-48">
                  <div className="animate-spin w-8 h-8 rounded-full border-b-2 border-blue-500"></div>
                </div>
              ) : recentItems.length === 0 ? (
                 <div className="p-8 text-center text-[#6B7280] text-sm h-48 flex items-center justify-center">
                    {isClub ? 'No hi ha candidatures encara.' : 'No hi ha oportunitats recents.'}
                 </div>
              ) : isClub ? (
                (recentItems as Application[]).map((app) => (
                  <RecentApplicationItem key={app.id} app={app} t={t} />
                ))
              ) : (
                (recentItems as Opportunity[]).map((opp) => (
                  <div key={opp.id} className="p-5 hover:bg-[#1F2937]/30 transition-colors duration-fast ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1F2937] flex items-center justify-center shrink-0 border border-[#374151] shadow-sm">
                        <BuildingOfficeIcon className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200 mb-0.5">{opp.title}</p>
                        <p className="text-xs text-[#9CA3AF] capitalize">{opp.sport} • {opp.contractType} • {opp.location}</p>
                      </div>
                    </div>
                    <Link to={`/dashboard/opportunities/${opp.id}`} className="shrink-0 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 transition-all duration-fast ease-out active:scale-[0.98] text-xs font-semibold px-4 py-2 rounded-lg">
                      {t('overview.enter', 'Veure més')}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6 lg:gap-6 sm:p-8">
          <section>
            {isPremium ? (
              <div className="bg-[#111827] border border-blue-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden shadow-lg shadow-blue-500/5">
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
                  <SparklesIcon className="w-32 h-32 text-blue-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{activePlan}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('overview.activePlan.title')}</h3>
                  <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed">{t('overview.activePlan.description')}</p>
                  <Link to="/dashboard/billing" className="block w-full text-center bg-[#0F172A] hover:bg-[#1F2937] text-white text-sm font-semibold px-4 py-2.5 rounded-lg border border-[#374151] transition-all duration-fast ease-out active:scale-[0.98]">
                    {t('overview.activePlan.manageButton')}
                  </Link>
                </div>
              </div>
            ) : (
               <div className="bg-gradient-to-br from-yellow-600/20 via-[#111827] to-[#111827] border border-yellow-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-base ease-out">
                   <SparklesIcon className="w-24 h-24 text-yellow-500" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                     <SparklesIcon className="w-5 h-5 text-yellow-400" />
                     <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">UPGRADE</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{t('overview.upgrade.title')}</h3>
                   <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed">   
                     <Trans i18nKey="overview.upgrade.description">
                       Rep fins a un <strong className="text-gray-200">300% més</strong> d'impressions de clubs i envia missatges directes.
                     </Trans>
                   </p>
                   <Link to="/pricing" className="bg-yellow-500 hover:bg-yellow-400 text-[#0B1120] text-sm font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-fast ease-out active:scale-[0.98] w-full relative z-10">
                     {t('overview.upgrade.button')}
                   </Link>
                 </div>
               </div>
            )}
          </section>

          <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 flex-1 shadow-sm">
            <h2 className="text-base font-semibold text-gray-200 mb-5 flex items-center justify-between">
              {t('overview.activity.title')}
              <span className="text-[11px] font-medium text-[#6B7280] bg-[#1F2937] px-2 py-0.5 rounded">{t('overview.activity.last7Days', 'Darrers 7 dies')}</span>
            </h2>
            <div className="relative border-l border-[#1F2937] ml-3 mt-4">
               {/* Just symbolic activity, as we removed mock array */}
               <div className="relative pl-5 pb-6">
                <div className="absolute top-0.5 -left-[17px] bg-[#1F2937] p-1.5 rounded-full border-4 border-[#111827]">
                  <CheckCircleIcon className="w-3 h-3 text-green-400" />
                </div>
                <p className="text-sm font-semibold text-gray-200 mb-0.5">{t('overview.activity.item1.title', 'Benvingut a GlobalPlay360!')}</p>
                <p className="text-xs text-[#9CA3AF] mb-1">{t('overview.activity.item1.desc', 'Has iniciat sessió correctament al nou Dashboard.')}</p>
                <span className="text-[10px] font-medium text-[#6B7280]">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link 
      to={href}
      className="bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] hover:border-[#374151] transition-all duration-base ease-out hover:-translate-y-0.5 rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center group shadow-sm">
      <div className="bg-[#1F2937] group-hover:bg-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] text-blue-500/70 group-hover:text-white p-3 rounded-lg transition-all duration-base ease-out transform group-hover:scale-110">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-[#6B7280] group-hover:text-white transition-colors duration-fast ease-out">{label}</span>
    </Link>
  );
}