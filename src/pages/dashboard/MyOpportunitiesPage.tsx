import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { getOpportunitiesByField, toggleOpportunityStatus, deleteOpportunity } from '@/services/opportunities.service';
import type { Opportunity } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { formatLocation } from '@/utils/location';

export default function MyOpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetch() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOpportunitiesByField('clubId', '==', user!.uid);
        if (!cancelled) setOpportunities(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('myOpportunities.errorLoading'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [user]);

  const handleToggleStatus = async (opp: Opportunity) => {
    try {
      setTogglingId(opp.id);
      await toggleOpportunityStatus(opp.id, opp.status);
      // Update local state
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opp.id ? { ...o, status: opp.status === 'open' ? 'closed' : 'open' } : o
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : t('myOpportunities.errorToggling'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (opp: Opportunity) => {
    const confirmed = window.confirm(
      t("myOpportunities.confirmDelete", { title: opp.title })
    );
    if (!confirmed) return;

    try {
      setDeletingId(opp.id);
      await deleteOpportunity(opp.id);
      setOpportunities((prev) => prev.filter((o) => o.id !== opp.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : t('myOpportunities.errorDeleting'));
    } finally {
      setDeletingId(null);
    }
  };

const formatDate = (dateString: string) => {
    const localeStr = i18n.language === 'ca' ? 'ca-ES' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(localeStr, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  // Guard: only clubs
  if (user?.role !== 'club') {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          title={t('myOpportunities.restrictedTitle', 'Accés restringit')}
          description={t('myOpportunities.restrictedDesc', 'Aquesta vista és exclusiva per a clubs.')}
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>
              {t('myOpportunities.backToMarketplace', 'Tornar al Marketplace')}
            </Button>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          title={t('myOpportunities.connectionError', 'Error de connexió')}
          description={error}
          action={
            <Button variant="primary" onClick={() => window.location.reload()}>
              {t('myOpportunities.retry', 'Reintentar')}
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-56 bg-gray-800 rounded animate-pulse" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-28 bg-[#111827] border border-[#1F2937] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <PageHeader
        title={t('myOpportunities.title', 'Les Meves Ofertes')}
        description={
          <>
            {t('myOpportunities.subtitle1', 'Gestiona les oportunitats que has publicat. Les ofertes')} <span className="text-[#10B981] font-semibold">{t('myOpportunities.openStatus', 'obertes')}</span> {t('myOpportunities.subtitle2', 'són visibles al marketplace i accepten candidatures. Les ofertes')} <span className="text-[#6B7280] font-semibold">{t('myOpportunities.closedStatus', 'tancades')}</span> {t('myOpportunities.subtitle3', 'deixen de ser visibles.')}
          </>
        }
        action={
          <Button variant="primary" onClick={() => navigate('/dashboard/opportunities/new')} className="active:scale-[0.98] shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base">
            {t('myOpportunities.newOpportunity', 'Nova Oportunitat')}
          </Button>
        }
      />

      {opportunities.length === 0 ? (
        <EmptyState
          title={t('myOpportunities.emptyTitle', 'Encara no has publicat cap oportunitat')}
          description={t('myOpportunities.emptyDesc', 'Crea la teva primera oferta per començar a rebre candidatures.')}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities/new')}>
              {t('myOpportunities.createOpportunity', 'Crear Oportunitat')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#3B82F6]/50 hover:-translate-y-0.5 transition-all duration-base ease-out group"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-gray-100 font-bold text-lg truncate group-hover:text-[#3B82F6] transition-colors duration-fast ease-out">{opp.title}</h3>
                  <Badge variant={opp.status === 'open' ? 'success' : 'default'} className="uppercase text-[10px] tracking-wider font-semibold shrink-0">
                    {opp.status === 'open' ? t('myOpportunities.statusOpen', 'Oberta') : t('myOpportunities.statusClosed', 'Tancada')}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2.5 text-sm text-[#9CA3AF] font-medium">
                  <span>{t(`sports.${opp.sport}`, opp.sport)}</span>
                  <span className="text-[#1F2937]">•</span>
                  <span>{formatLocation(opp)}</span>
                  <span className="text-[#1F2937]">•</span>
                  <span className="capitalize">{opp.contractType.replace('-', ' ')}</span>
                  <span className="text-[#1F2937]">•</span>
                  <span>{formatDate(opp.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="active:scale-[0.98] transition-all duration-fast"
                  onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'mine' } })}
                >
                  {t('myOpportunities.btnView', 'Veure')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="active:scale-[0.98] transition-all duration-fast"
                  onClick={() => navigate(`/dashboard/opportunities/${opp.id}/edit`)}
                >
                  {t('myOpportunities.btnEdit', 'Editar')}
                </Button>
                <button
                  onClick={() => handleToggleStatus(opp)}
                  disabled={togglingId === opp.id}
                  title={opp.status === 'open' ? t('myOpportunities.closeTooltip', 'Tancar: deixa de ser visible') : t('myOpportunities.openTooltip', 'Reobrir: torna a ser visible')}
                  className={`px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg border transition-all duration-fast ease-out active:scale-[0.98] ${
                    opp.status === 'open'
                      ? 'border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/50'
                      : 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981]/50'
                  } disabled:opacity-50 disabled:active:scale-100`}
                >
                  {togglingId === opp.id
                    ? '...'
                    : opp.status === 'open' ? t('myOpportunities.btnClose', 'Tancar') : t('myOpportunities.btnReopen', 'Reobrir')}
                </button>
                <button
                  onClick={() => handleDelete(opp)}
                  disabled={deletingId === opp.id}
                  title={t('myOpportunities.deleteTooltip', 'Eliminar permanentment aquesta oferta')}
                  className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg border border-[#EF4444]/20 text-[#EF4444]/70 hover:bg-[#EF4444]/10 hover:text-[#EF4444] hover:border-[#EF4444]/50 transition-all duration-fast ease-out active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {deletingId === opp.id ? '...' : t('myOpportunities.btnDelete', 'Eliminar')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





