import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { mockApplications, mockOpportunities, mockConversations } from '../../services/mockData';
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
import PageHeader from '@/components/ui/PageHeader';

type BaseStats = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
};

export default function OverviewPage() {
  const { user, activePlan } = useAuth();
  const { t } = useTranslation();

  const isClub = user?.role === 'club';
  const isPremium = activePlan === 'premium';

  const userApplications = mockApplications.filter(app => app.userId === user?.uid);
  const userOpportunities = mockOpportunities.filter(op => op.clubId === user?.uid);
  const userConversations = mockConversations.filter(conv => conv.participants.includes(user?.uid || ''));

  const stats: BaseStats[] = useMemo(() => {
    if (isClub) {
      return [
        { label: t('overview.stats.club.activeOffers'), value: userOpportunities.length || 3, icon: BriefcaseIcon, trend: t('overview.stats.trends.thisMonth'), trendUp: true },
        { label: t('overview.stats.club.applicationsReceived'), value: '24', icon: DocumentCheckIcon, trend: t('overview.stats.trends.sinceYesterday'), trendUp: true },
        { label: t('overview.stats.club.conversations'), value: userConversations.length || 5, icon: ChatBubbleLeftEllipsisIcon },
        { label: t('overview.stats.club.profileVisits'), value: '1.204', icon: ChartBarIcon, trend: '+12%', trendUp: true },
      ];
    }
    return [
      { label: t('overview.stats.coachPlayer.savedOffers'), value: '12', icon: StarIcon },
      { label: t('overview.stats.coachPlayer.applications'), value: userApplications.length || 2, icon: DocumentCheckIcon, trend: t('overview.stats.trends.thisWeek'), trendUp: true },
      { label: t('overview.stats.coachPlayer.pendingMessages'), value: '3', icon: ChatBubbleLeftEllipsisIcon, trend: t('overview.stats.trends.activeRecently'), trendUp: true },
      { label: t('overview.stats.coachPlayer.profileStrength'), value: '85%', icon: UserCircleIcon, trend: t('overview.stats.trends.highLevel'), trendUp: true },
    ];
  }, [isClub, userApplications.length, userOpportunities.length, userConversations.length, t]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{t('overview.hello')}, {user?.displayName || t('overview.sportsman')} 👋</span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border ${
              isPremium
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-[#1F2937] text-[#6B7280] border-[#374151]'
            }`}>
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
            <Link to="/opportunities/new" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-fast ease-out active:scale-[0.98] flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <PlusCircleIcon className="w-5 h-5" />
              {t('overview.publishOffer')}
            </Link>
          ) : (
            <Link to="/profile" className="bg-[#111827] hover:bg-[#1F2937] text-white border border-[#374151] hover:border-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-fast ease-out active:scale-[0.98] flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-[#9CA3AF]" />
              {t('overview.completeProfile')}
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-4 sm:p-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col relative overflow-hidden group transition-all duration-base ease-out hover:border-[#374151] hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-base ease-out" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-[#1F2937] p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-base ease-out">
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                  stat.trendUp ? 'text-green-400 bg-green-400/10 border border-green-500/10' : 'text-[#9CA3AF] bg-[#1F2937] border border-[#374151]'
                }`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-1">{stat.value}</h3>
              <p className="text-sm text-[#9CA3AF] font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 sm:p-8">
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-6 sm:p-8">
          <section>
            <h2 className="text-base font-semibold text-white mb-4">{t('overview.quickActions.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction href="/opportunities" icon={BriefcaseIcon} label={t('overview.quickActions.exploreOffers')} />
              <QuickAction href="/applications" icon={DocumentCheckIcon} label={t('overview.quickActions.applications')} />
              <QuickAction href="/messages" icon={ChatBubbleLeftEllipsisIcon} label={t('overview.quickActions.messages')} />
              {isClub ? (
                <QuickAction href="/profile" icon={BuildingOfficeIcon} label={t('overview.quickActions.yourProfile')} />
              ) : (
                <QuickAction href="/profile" icon={UserCircleIcon} label={t('overview.quickActions.yourProfile')} />
              )}
            </div>
          </section>

          <section className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden flex-1 shadow-sm">
            <div className="px-5 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {isClub ? t('overview.recentApplicationsTitle') : t('overview.recommendedOffersTitle')}
              </h2>
              <Link to={isClub ? "/applications" : "/opportunities"} className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors duration-fast ease-out">
                {t('overview.seeMore')}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-[#1F2937] h-full">
              {isClub ? (
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="p-5 hover:bg-[#1F2937]/30 transition-colors duration-fast ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center shrink-0 border border-[#374151]">
                        <UserCircleIcon className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-0.5">{t('overview.mock.proPlayer', 'Jugador Pro')} {i + 1} (Mock)</p>
                        <p className="text-xs text-[#9CA3AF] flex items-center gap-2">
                          <span className="text-[#6B7280]">{t('overview.mock.striker', 'Davanter Centre')}</span>
                          <span className="w-1 h-1 rounded-full bg-[#374151]"></span>
                          Europa
                        </p>
                      </div>
                    </div>
                    <Link to="/applications" className="shrink-0 bg-[#0F172A] hover:bg-[#1F2937] transition-all duration-fast ease-out active:scale-[0.98] text-white text-xs font-semibold px-4 py-2 border border-[#374151] rounded-lg">
                      {t('overview.reviewCV')}
                    </Link>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="p-5 hover:bg-[#1F2937]/30 transition-colors duration-fast ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1F2937] flex items-center justify-center shrink-0 border border-[#374151] shadow-sm">
                        <BuildingOfficeIcon className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-0.5">{t('overview.mock.firstTeam', 'Equip de Primera')} {i + 1} (Mock)</p>
                        <p className="text-xs text-[#9CA3AF]">{t('overview.mock.lookingFor', 'Busca:')} {user?.role === 'coach' ? t('overview.mock.proCoach', 'Entrenador Pro') : t('overview.mock.fastStriker', 'Davanter Ràpid')} • {t('overview.mock.proContract', 'Contracte Pro')}</p>
                      </div>
                    </div>
                    <Link to="/opportunities" className="shrink-0 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 transition-all duration-fast ease-out active:scale-[0.98] text-xs font-semibold px-4 py-2 rounded-lg">
                      {t('overview.enter')}
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
               <div className="bg-gradient-to-br from-[#1E3A8A]/40 via-[#111827] to-[#111827] border border-blue-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-base ease-out">
                   <SparklesIcon className="w-24 h-24 text-blue-500" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                     <SparklesIcon className="w-5 h-5 text-blue-400" />
                     <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">UPGRADE</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{t('overview.upgrade.title')}</h3>
                   <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed">   
                     <Trans i18nKey="overview.upgrade.description">
                       Rep fins a un <strong className="text-gray-200">300% més</strong> d'impressions de clubs i envia missatges directes.
                     </Trans>
                   </p>
                   <Link to="/pricing" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-fast ease-out active:scale-[0.98] w-full relative z-10">
                     {t('overview.upgrade.button')}
                   </Link>
                 </div>
               </div>
            )}
          </section>

          <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 md:p-6 flex-1 shadow-sm">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center justify-between">
              {t('overview.activity.title')}
              <span className="text-[11px] font-medium text-[#6B7280] bg-[#1F2937] px-2 py-0.5 rounded">{t('overview.activity.last7Days')}</span>
            </h2>
            <div className="relative border-l border-[#1F2937] ml-3 space-y-6">
              <div className="relative pl-5">
                <div className="absolute top-0.5 -left-[17px] bg-blue-500 p-1.5 rounded-full border-4 border-[#111827]">
                  <ChatBubbleLeftEllipsisIcon className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">{t('overview.activity.item1.title')}</p>
                <p className="text-xs text-[#9CA3AF] mb-1">{t('overview.activity.item1.desc')}</p>
                <span className="text-[10px] font-medium text-[#6B7280]">{t('overview.activity.item1.time')}</span>
              </div>
              <div className="relative pl-5">
                <div className="absolute top-0.5 -left-[17px] bg-[#1F2937] p-1.5 rounded-full border-4 border-[#111827]">
                  <DocumentCheckIcon className="w-3 h-3 text-[#9CA3AF]" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">{t('overview.activity.item2.title')}</p>
                <p className="text-xs text-[#9CA3AF] mb-1">{t('overview.activity.item2.desc')}</p>
                <span className="text-[10px] font-medium text-[#6B7280]">{t('overview.activity.item2.time')}</span>
              </div>
              <div className="relative pl-5">
                <div className="absolute top-0.5 -left-[17px] bg-[#1F2937] p-1.5 rounded-full border-4 border-[#111827]">
                  <BriefcaseIcon className="w-3 h-3 text-[#9CA3AF]" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">{t('overview.activity.item3.title')}</p>
                <p className="text-xs text-[#9CA3AF] mb-1">{t('overview.activity.item3.desc')}</p>
                <span className="text-[10px] font-medium text-[#6B7280]">{t('overview.activity.item3.time')}</span>
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

