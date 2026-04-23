import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import type { Opportunity } from '@/types';
import { getOpportunitiesByField } from '@/services/opportunities.service';
import { getUserApplications } from '@/services/applications.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { formatLocation } from '@/utils/location';

const darkSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#111827',
    borderColor: state.isFocused ? '#3B82F6' : '#374151',
    color: '#F3F4F6',
    boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
    '&:hover': {
      borderColor: '#4B5563'
    },
    minHeight: '42px',
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    zIndex: 50,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#374151' : 'transparent',
    color: state.isSelected ? '#FFFFFF' : '#F3F4F6',
    fontSize: '13px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#2563EB'
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#F3F4F6',
    fontSize: '13px',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#9CA3AF',
    fontSize: '13px',
  }),
  input: (base: any) => ({
    ...base,
    color: '#F3F4F6',
    fontSize: '13px',
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    backgroundColor: '#374151',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: '#9CA3AF',
    '&:hover': {
      color: '#D1D5DB'
    }
  }),
};

const SPORT_OPTIONS = [
  'football',
  'basketball',
  'futsal',
  'volleyball',
  'handball',
  'waterpolo',
  'tennis',
  'rugby',
  'american_football',
  'hockey',
  'other'
];

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [appliedOppIds, setAppliedOppIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    sport: string;
    country: string;
    state: string;
    city: string;
    targetRole?: string;
  }>({
    sport: '',
    country: '',
    state: '',
    city: '',
    targetRole: ''
  });

  const countryOptions = useMemo(() => Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })), []);
  const stateOptions = useMemo(() => filters.country ? State.getStatesOfCountry(filters.country).map(s => ({ value: s.isoCode, label: s.name })) : [], [filters.country]);
  const cityOptions = useMemo(() => filters.country && filters.state ? City.getCitiesOfState(filters.country, filters.state).map(c => ({ value: c.name, label: c.name })) : [], [filters.country, filters.state]);

  const sportOptions = useMemo(() => {
    return [
      { value: '', label: t('opportunities.filters.all') },
      ...SPORT_OPTIONS.map(s => ({ value: s, label: t(`profile.sports.${s}`) || s }))
    ];
  }, [t]);

  const targetRoleOptions = useMemo(() => {
    return [
      { value: '', label: t('opportunities.filters.allTargetRoles', "Tots els rols") },
      { value: 'player', label: t('opportunityForm.targetRole.player', "Jugador/a") },
      { value: 'coach', label: t('opportunityForm.targetRole.coach', "Entrenador/a") }
    ];
  }, [t]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (filters.sport && opp.sport?.toLowerCase() !== filters.sport.toLowerCase()) return false;
      if (filters.country && opp.country !== filters.country) return false;
      if (filters.state && opp.state !== filters.state) return false;
      if (filters.city && opp.city !== filters.city) return false;
      if (filters.targetRole && opp.targetRole && opp.targetRole !== 'both' && opp.targetRole !== filters.targetRole) return false;
      return true;
    });
  }, [opportunities, filters]);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getOpportunitiesByField('status', '==', 'open');
        
        // Fetch user applications if logged in
        if (user && user.role !== 'club') {
          const apps = await getUserApplications(user.uid);
          if (!cancelled) setAppliedOppIds(new Set(apps.map(a => a.opportunityId)));
        }

        if (!cancelled) setOpportunities(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('opportunities.errorLoading'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ca-ES', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title={t('opportunities.errorConnection')}
          description={error}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => window.location.reload()}>
              {t('opportunities.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-100 space-y-8">
      {/* Header */}
      <PageHeader
        title={t('opportunities.marketplace')}
        description={t('opportunities.discoverOpps')}
        action={
          user?.role === 'club' && (
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities/new')} className="shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]">
              {t('opportunities.createOpportunity')}
            </Button>
          )
        }
      />

      {/* Filters */}
        <div className="relative border border-[#2A3447]/70 p-4 rounded-xl flex flex-col md:flex-row flex-wrap gap-4 bg-gradient-to-b from-[#1A2235] to-[#141C2E] shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] z-10 w-full md:items-end">
          <div className="flex-1 min-w-[140px] relative z-50">
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">{t('opportunityForm.fields.targetRoleLabel', 'Rol')}</label>
            <Select
              {...{ id: 'role-select', instanceId: 'role-select' }}
              styles={darkSelectStyles}
              options={targetRoleOptions}
              value={targetRoleOptions.find(o => o.value === filters.targetRole) || targetRoleOptions[0]}
              onChange={(selected: any) => setFilters(f => ({ ...f, targetRole: selected?.value || '' }))}
              isClearable={false}
            />
          </div>
          <div className="flex-1 min-w-[140px] relative z-40">
          <label className="text-xs font-semibold text-gray-400 mb-1.5 block">{t('profile.sport')}</label>
          <Select
            {...{ id: 'sport-select', instanceId: 'sport-select' }}
            styles={darkSelectStyles}
            options={sportOptions}
            value={sportOptions.find(o => o.value === filters.sport) || sportOptions[0]}
            onChange={(selected: any) => setFilters(f => ({ ...f, sport: selected?.value || '' }))}
            isClearable={false}
          />
        </div>
        <div className="flex-1 w-full relative z-30">
          <label className="text-xs font-semibold text-gray-400 mb-1.5 block">{t('profile.country')}</label>
          <Select
            {...{ id: 'country-select', instanceId: 'country-select' }}
            styles={darkSelectStyles}
            options={countryOptions}
            value={countryOptions.find(o => o.value === filters.country) || null}
            onChange={(selected: any) => setFilters(f => ({ ...f, country: selected?.value || '', state: '', city: '' }))}
            isClearable
            placeholder={t('profile.selectCountry')}
          />
        </div>
        <div className="flex-1 w-full relative z-20">
          <label className="text-xs font-semibold text-gray-400 mb-1.5 block">{t('profile.state')}</label>
          <Select
            {...{ id: 'state-select', instanceId: 'state-select' }}
            styles={darkSelectStyles}
            options={stateOptions}
            value={stateOptions.find(o => o.value === filters.state) || null}
            onChange={(selected: any) => setFilters(f => ({ ...f, state: selected?.value || '', city: '' }))}
            isClearable
            isDisabled={!filters.country}
            placeholder={t('profile.selectState')}
          />
        </div>
        <div className="flex-1 w-full relative z-10">
          <label className="text-xs font-semibold text-gray-400 mb-1.5 block">{t('profile.city')}</label>
          <Select
            {...{ id: 'city-select', instanceId: 'city-select' }}
            styles={darkSelectStyles}
            options={cityOptions}
            value={cityOptions.find(o => o.value === filters.city) || null}
            onChange={(selected: any) => setFilters(f => ({ ...f, city: selected?.value || '' }))}
            isClearable
            isDisabled={!filters.state}
            placeholder={t('profile.selectCity')}
          />
        </div>
        <div className="w-full md:w-auto shrink-0 z-0">
          <Button 
            variant="outline" 
            onClick={() => setFilters({ sport: '', country: '', state: '', city: '', targetRole: '' })}
            className="w-full h-[42px] border border-[#374151] hover:bg-[#1F2937] text-gray-300 hover:text-gray-100 transition-colors"
            disabled={!filters.sport && !filters.country && !filters.state && !filters.city && !filters.targetRole}
          >
            {t('opportunities.clearFilters')}
          </Button>
        </div>
      </div>

      {/* ── Loading state ──────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/60 animate-pulse" />
          ))}
        </div>

      /* ── Empty state ───────────────────────────────── */
      ) : filteredOpportunities.length === 0 ? (
        <EmptyState
          title={t('opportunities.emptyTitle')}
          description={t('opportunities.emptyDesc')}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

      /* ── Data state ────────────────────────────────── */
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredOpportunities.map((opp) => (
            <motion.article
              key={opp.id}
              variants={itemVariants}
              className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-5 sm:p-6 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] hover:border-[#3B82F6]/40 hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(243,244,246,0.06)_inset,0_20px_50px_-20px_rgba(59,130,246,0.35)] transition-all duration-base ease-out group flex flex-col"
            >
              {/* Inner top highlight */}
              <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />

              {/* Header: title + status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-[1.2rem] sm:text-[1.3rem] font-normal text-gray-100 tracking-tight leading-snug line-clamp-2 flex-1 group-hover:text-white transition-colors duration-fast">
                  {opp.title}
                </h3>
                <Badge
                  variant={opp.status === 'open' ? 'success' : 'default'}
                  className="uppercase text-[10px] tracking-wider font-semibold shrink-0"
                >
                  {t(`opportunities.status.${opp.status}`)}
                </Badge>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-[#9CA3AF] mb-4">
                {opp.targetRole && opp.targetRole !== 'both' ? (
                  <>
                    <span className="capitalize text-blue-400 font-medium">
                      {t(`opportunityForm.targetRole.${opp.targetRole}`)}
                    </span>
                    <span className="text-[#2A3447]">·</span>
                  </>
                ) : null}
                <span className="capitalize">{t(`profile.sports.${opp.sport.toLowerCase()}`) || opp.sport}</span>
                <span className="text-[#2A3447]">·</span>
                <span>{formatLocation(opp)}</span>
                <span className="text-[#2A3447]">·</span>
                <span className="capitalize">{opp.contractType.replace('-', ' ')}</span>
                {user?.uid === opp.clubId && (
                  <>
                    <span className="text-[#2A3447]">·</span>
                    <span className="text-[#3B82F6] font-semibold">{t('opportunities.ownOpportunity', 'La teva oportunitat')}</span>
                  </>
                )}
                {appliedOppIds.has(opp.id) && (
                  <>
                    <span className="text-[#2A3447]">·</span>
                    <span className="text-[#10B981] font-semibold">{t('opportunities.alreadyApplied', 'Candidatura enviada')}</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-3 mb-5">
                {opp.description}
              </p>

              {/* Requirements */}
              {opp.requirements.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6B7280] mb-2">
                    {t('opportunities.keyRequirements')}
                  </h4>
                  <ul className="flex flex-wrap gap-1.5">
                    {opp.requirements.slice(0, 3).map((req, idx) => (
                      <Badge
                        key={idx}
                        variant="default"
                        className="text-[11px] bg-[#1F2937]/60 border-[#2A3447]/70 text-[#9CA3AF]"
                      >
                        {req}
                      </Badge>
                    ))}
                    {opp.requirements.length > 3 && (
                      <span className="text-[11px] text-[#6B7280] items-center flex">
                        +{opp.requirements.length - 3} {t('opportunities.more')}
                      </span>
                    )}
                  </ul>
                </div>
              )}

              {/* Spacer pushes footer to bottom */}
              <div className="flex-1" />

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#2A3447]/70 to-transparent mb-4" />

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                  {t('opportunities.published')} · {formatDate(opp.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'marketplace' } })}
                      className="inline-flex items-center px-3.5 py-2 text-[13px] font-medium tracking-wide text-[#EAB308] bg-[#1F2937]/40 border border-[#1F2937] hover:bg-[#EAB308]/10 hover:border-[#EAB308]/30 hover:text-[#F5C518] rounded-lg transition-all duration-fast active:scale-[0.98]"
                  >
                    {t('opportunities.viewDetail')}
                  </button>
                  {user?.role !== 'club' && (
                    <button
                      onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'marketplace' } })}
                      className="inline-flex items-center px-3.5 py-2 text-[13px] font-semibold tracking-wide text-[#0B1220] bg-[#EAB308] hover:bg-[#F5C518] rounded-lg shadow-sm hover:shadow-[0_8px_20px_-10px_rgba(234,179,8,0.55)] transition-all duration-base active:scale-[0.98]"
                    >
                      {t('opportunities.apply')}
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </div>
  );
}

