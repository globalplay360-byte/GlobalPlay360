import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import type { Opportunity } from '@/types';
import { getOpportunitiesByField } from '@/services/opportunities.service';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
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
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#2563EB'
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#F3F4F6',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#9CA3AF',
  }),
  input: (base: any) => ({
    ...base,
    color: '#F3F4F6',
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    sport: '',
    country: '',
    state: '',
    city: ''
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

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (filters.sport && opp.sport !== filters.sport) return false;
      if (filters.country && opp.country !== filters.country) return false;
      if (filters.state && opp.state !== filters.state) return false;
      if (filters.city && opp.city !== filters.city) return false;
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
      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm items-end z-10 relative">
        <div className="flex-1 w-full relative z-40">
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
            onClick={() => setFilters({ sport: '', country: '', state: '', city: '' })}
            className="w-full h-[42px] border-[#374151] hover:bg-[#1F2937]"
            disabled={!filters.sport && !filters.country && !filters.state && !filters.city}
          >
            {t('opportunities.clearFilters')}
          </Button>
        </div>
      </div>

      {/* ── Loading state ──────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-[#111827] border border-[#1F2937] animate-pulse" />
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredOpportunities.map((opp) => (
            <motion.div key={opp.id} variants={itemVariants}>
              <Card className="flex flex-col hover:border-[#3B82F6]/50 group h-full">
                <CardHeader className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-[#3B82F6] transition-colors duration-base ease-out">{opp.title}</h3>
                  </div>
                  <Badge variant={opp.status === 'open' ? 'success' : 'default'} className="uppercase text-[10px] tracking-wider font-semibold">
                    {t(`opportunities.status.${opp.status}`)}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex gap-2 mb-4 text-xs font-medium text-[#9CA3AF]">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                      {opp.sport}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">{formatLocation(opp)}</div>
                    <span>•</span>
                    <div className="capitalize">{opp.contractType.replace('-', ' ')}</div>
                  </div>

                  <p className="text-[#6B7280] text-sm line-clamp-3 mb-6">{opp.description}</p>

                  <div className="space-y-3 mt-auto">
                    <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t('opportunities.keyRequirements')}</h4>
                    <ul className="flex flex-wrap gap-2">
                      {opp.requirements.slice(0, 3).map((req, idx) => (
                        <Badge key={idx} variant="default" className="text-[11px] bg-[#1F2937]/50 border-[#374151]/50">{req}</Badge>
                      ))}
                      {opp.requirements.length > 3 && (
                        <span className="text-xs text-[#6B7280] items-center flex">+{opp.requirements.length - 3} {t('opportunities.more')}</span>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="justify-between mt-auto">
                  <div className="text-xs text-[#6B7280] font-medium">
                    {t('opportunities.published')} {formatDate(opp.createdAt)}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="transition-all duration-fast active:scale-[0.98]" onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'marketplace' } })}>
                      {t('opportunities.viewDetail')}
                    </Button>
                    {user?.role !== 'club' && (
                      <Button variant="primary" size="sm" className="shadow-sm hover:shadow-[#3B82F6]/20 transition-all duration-fast active:scale-[0.98]" onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'marketplace' } })}>
                        {t('opportunities.apply')}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

