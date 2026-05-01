import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { listAllOpportunitiesWithStats, type OpportunityWithStats } from '@/services/admin.service';
import { formatLocation } from '@/utils/location';

type StatusFilter = 'all' | 'open' | 'closed';

export default function AdminOpportunitiesPage() {
  const { t } = useTranslation();
  const [opps, setOpps] = useState<OpportunityWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAllOpportunitiesWithStats()
      .then((data) => {
        if (!cancelled) {
          setOpps(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('[admin] failed to load opportunities:', err);
        if (!cancelled) setError(t('admin.opps.loadError', 'No s\'han pogut carregar les oportunitats.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [t]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opps.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (q && !o.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [opps, statusFilter, search]);

  const totalApplications = useMemo(() => opps.reduce((sum, o) => sum + o.applicationsCount, 0), [opps]);
  const avgPerOpp = opps.length > 0 ? (totalApplications / opps.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.opps.title', 'Oportunitats')}
        description={t('admin.opps.description', 'Monitoritza l\'activitat del marketplace.')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SmallStat label={t('admin.opps.stats.total', 'Total publicades')} value={loading ? null : opps.length} />
        <SmallStat label={t('admin.opps.stats.totalApps', 'Candidatures totals')} value={loading ? null : totalApplications} />
        <SmallStat label={t('admin.opps.stats.avg', 'Mitjana per oferta')} value={loading ? null : avgPerOpp} />
      </div>

      <div className="bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.opps.searchPlaceholder', 'Cercar per títol...')}
          className="bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] placeholder:text-[#4B5563]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        >
          <option value="all">{t('admin.opps.filter.allStatuses', 'Tots els estats')}</option>
          <option value="open">{t('status.open', 'Oberta')}</option>
          <option value="closed">{t('status.closed', 'Tancada')}</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">{error}</div>
      )}

      <div className="bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner className="h-8 w-8 text-[#3B82F6]" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#6B7280]">{t('admin.opps.empty', 'Cap oportunitat coincideix amb els filtres.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F172A]/60 border-b border-[#2A3447]/70">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-left">{t('admin.opps.col.title', 'Títol')}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-left">{t('admin.opps.col.sport', 'Esport')}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-left">{t('admin.opps.col.location', 'Ubicació')}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-left">{t('admin.opps.col.status', 'Estat')}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-right">{t('admin.opps.col.apps', 'Candidatures')}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-left">{t('admin.opps.col.created', 'Creada')}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] text-right">{t('admin.opps.col.actions', 'Accions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3447]/50">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1F2937]/30">
                    <td className="px-5 py-3 font-medium text-gray-100 max-w-xs truncate">{o.title}</td>
                    <td className="px-5 py-3 text-[#9CA3AF] capitalize">{o.sport}</td>
                    <td className="px-5 py-3 text-[#9CA3AF]">{formatLocation(o)}</td>
                    <td className="px-5 py-3">
                      <Badge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right text-gray-100 font-semibold tabular-nums">{o.applicationsCount}</td>
                    <td className="px-5 py-3 text-[#9CA3AF] tabular-nums">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/dashboard/opportunities/${o.id}`}
                        className="text-[12px] font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
                      >
                        {t('admin.opps.view', 'Veure')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-xl p-4">
      <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">{label}</p>
      {value === null ? (
        <div className="h-7 w-14 bg-[#2A3447] animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-extrabold text-gray-100 tabular-nums">{value}</p>
      )}
    </div>
  );
}
