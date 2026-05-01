import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BriefcaseIcon,
  DocumentCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { getAdminMetrics, type AdminMetrics } from '@/services/admin.service';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminMetrics()
      .then((m) => {
        if (!cancelled) {
          setMetrics(m);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('[admin] failed to load metrics:', err);
        if (!cancelled) setError(t('admin.dashboard.loadError', 'No s\'han pogut carregar les mètriques.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [t]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('admin.dashboard.title', 'Tauler d\'administració')}
        description={t('admin.dashboard.description', 'Estat global de la plataforma en temps real.')}
      />

      {error && (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label={t('admin.dashboard.kpi.users', 'Usuaris totals')}
          value={metrics?.users.total}
          subtext={metrics ? t('admin.dashboard.kpi.newThisWeek', '+{{n}} aquesta setmana', { n: metrics.users.newThisWeek }) : ''}
          icon={UsersIcon}
          loading={loading}
        />
        <KpiTile
          label={t('admin.dashboard.kpi.premium', 'Subscripcions actives')}
          value={metrics?.users.premium}
          subtext={metrics ? t('admin.dashboard.kpi.premiumOfTotal', '{{pct}}% del total', {
            pct: metrics.users.total > 0 ? Math.round((metrics.users.premium / metrics.users.total) * 100) : 0,
          }) : ''}
          icon={SparklesIcon}
          loading={loading}
          accent
        />
        <KpiTile
          label={t('admin.dashboard.kpi.opportunities', 'Oportunitats')}
          value={metrics?.opportunities.total}
          subtext={metrics ? t('admin.dashboard.kpi.openOps', '{{n}} obertes', { n: metrics.opportunities.open }) : ''}
          icon={BriefcaseIcon}
          loading={loading}
        />
        <KpiTile
          label={t('admin.dashboard.kpi.applications', 'Candidatures')}
          value={metrics?.applications.total}
          subtext={metrics ? t('admin.dashboard.kpi.acceptedApps', '{{n}} acceptades', { n: metrics.applications.accepted }) : ''}
          icon={DocumentCheckIcon}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard
          title={t('admin.dashboard.usersByRole', 'Usuaris per rol')}
          loading={loading}
          rows={
            metrics
              ? [
                  { label: t('admin.role.player', 'Jugadors'), value: metrics.users.byRole.player },
                  { label: t('admin.role.coach', 'Entrenadors'), value: metrics.users.byRole.coach },
                  { label: t('admin.role.club', 'Clubs'), value: metrics.users.byRole.club },
                  { label: t('admin.role.admin', 'Administradors'), value: metrics.users.byRole.admin },
                ]
              : []
          }
          link={{ to: '/admin/users', label: t('admin.dashboard.viewAllUsers', 'Veure tots els usuaris') }}
        />
        <BreakdownCard
          title={t('admin.dashboard.applicationsByStatus', 'Candidatures per estat')}
          loading={loading}
          rows={
            metrics
              ? [
                  { label: t('status.submitted', 'Enviades'), value: metrics.applications.submitted },
                  { label: t('status.accepted', 'Acceptades'), value: metrics.applications.accepted },
                  { label: t('status.rejected', 'Rebutjades'), value: metrics.applications.rejected },
                ]
              : []
          }
          link={{ to: '/admin/opportunities', label: t('admin.dashboard.viewOpportunities', 'Veure oportunitats') }}
        />
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  subtext,
  icon: Icon,
  loading,
  accent = false,
}: {
  label: string;
  value: number | undefined;
  subtext?: string;
  icon: React.ElementType;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative bg-gradient-to-b from-[#1A2235] to-[#141C2E] border rounded-2xl p-5 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)] ${
        accent ? 'border-[#EAB308]/30' : 'border-[#2A3447]/70'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            accent ? 'bg-[#EAB308]/10 text-[#EAB308]' : 'bg-[#3B82F6]/10 text-[#60A5FA]'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-[#2A3447] animate-pulse rounded mb-1" />
      ) : (
        <p className={`text-3xl font-extrabold tracking-tight leading-none mb-1 ${accent ? 'text-[#EAB308]' : 'text-gray-100'}`}>
          {value ?? '—'}
        </p>
      )}
      {subtext && !loading && <p className="text-xs text-[#6B7280] mt-1">{subtext}</p>}
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  link,
  loading,
}: {
  title: string;
  rows: { label: string; value: number }[];
  link: { to: string; label: string };
  loading: boolean;
}) {
  return (
    <div className="relative bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
      <div className="px-5 py-4 border-b border-[#2A3447]/60 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-100/90 tracking-tight">{title}</h2>
        <Link
          to={link.to}
          className="text-[13px] font-semibold text-[#60A5FA] hover:text-[#93C5FD] flex items-center gap-1 transition-colors group"
        >
          {link.label}
          <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="divide-y divide-[#2A3447]/50">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Spinner className="h-6 w-6 text-[#3B82F6]" />
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.label} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-[#9CA3AF]">{r.label}</span>
              <span className="text-sm font-semibold text-gray-100 tabular-nums">{r.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
