import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Country from 'country-state-city/lib/country';
import State from 'country-state-city/lib/state';
import { Button } from '@/components/ui/Button';

export type MarketplaceFiltersState = {
  sport: string;
  country: string;
  state: string;
  targetRole?: string;
};

type Props = {
  filters: MarketplaceFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<MarketplaceFiltersState>>;
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
  'other',
];

const selectClassName =
  'w-full min-h-[42px] rounded-lg border border-[#374151] bg-[#111827] text-gray-100 px-3 py-2 text-sm ' +
  'focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export default function OpportunitiesMarketplaceFilters({ filters, setFilters }: Props) {
  const { t } = useTranslation();

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    [],
  );
  const stateOptions = useMemo(
    () =>
      filters.country
        ? State.getStatesOfCountry(filters.country).map((s) => ({ value: s.isoCode, label: s.name }))
        : [],
    [filters.country],
  );

  const sportOptions = useMemo(
    () => [
      { value: '', label: t('opportunities.filters.all') },
      ...SPORT_OPTIONS.map((s) => ({ value: s, label: t(`profile.sports.${s}`) || s })),
    ],
    [t],
  );

  const targetRoleOptions = useMemo(
    () => [
      { value: '', label: t('opportunities.filters.allTargetRoles', 'Tots els rols') },
      { value: 'player', label: t('opportunityForm.targetRole.player', 'Jugador/a') },
      { value: 'coach', label: t('opportunityForm.targetRole.coach', 'Entrenador/a') },
    ],
    [t],
  );

  return (
    <div className="relative z-10 flex w-full flex-col flex-wrap gap-4 rounded-xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-4 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] md:flex-row md:items-end">
      <div className="relative min-w-[140px] flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-gray-400" htmlFor="marketplace-filter-role">
          {t('opportunityForm.fields.targetRoleLabel', 'Rol')}
        </label>
        <select
          id="marketplace-filter-role"
          className={selectClassName}
          value={filters.targetRole ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, targetRole: e.target.value }))}
        >
          {targetRoleOptions.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="relative min-w-[140px] flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-gray-400" htmlFor="marketplace-filter-sport">
          {t('profile.sport')}
        </label>
        <select
          id="marketplace-filter-sport"
          className={selectClassName}
          value={filters.sport}
          onChange={(e) => setFilters((f) => ({ ...f, sport: e.target.value }))}
        >
          {sportOptions.map((o) => (
            <option key={o.value || 'all-sport'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="relative w-full min-w-0 flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-gray-400" htmlFor="marketplace-filter-country">
          {t('profile.country')}
        </label>
        <select
          id="marketplace-filter-country"
          className={selectClassName}
          value={filters.country}
          onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value, state: '' }))}
        >
          <option value="">{t('profile.selectCountry')}</option>
          {countryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="relative w-full min-w-0 flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-gray-400" htmlFor="marketplace-filter-state">
          {t('profile.state')}
        </label>
        <select
          id="marketplace-filter-state"
          className={selectClassName}
          value={filters.state}
          disabled={!filters.country}
          onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
        >
          <option value="">{t('profile.selectState')}</option>
          {stateOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full shrink-0 md:w-auto">
        <Button
          variant="outline"
          onClick={() => setFilters({ sport: '', country: '', state: '', targetRole: '' })}
          className="h-[42px] w-full border border-[#374151] text-gray-300 transition-colors hover:bg-[#1F2937] hover:text-gray-100"
          disabled={!filters.sport && !filters.country && !filters.state && !filters.targetRole}
        >
          {t('opportunities.clearFilters')}
        </Button>
      </div>
    </div>
  );
}
