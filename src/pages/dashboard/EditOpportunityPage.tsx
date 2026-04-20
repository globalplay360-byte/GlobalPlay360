import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { getOpportunityById, updateOpportunity } from '@/services/opportunities.service';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import type { Opportunity } from '@/types';

export default function EditOpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      if (!id) return;
      try {
        setIsLoading(true);
        const opp = await getOpportunityById(id);
        if (!cancelled) setOpportunity(opp);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t('opportunities.errorLoading'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-6 w-48 bg-gray-800 rounded" />
        <div className="h-64 bg-[#111827] rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title={t("opportunities.errorConnection")}
          description={error}
          action={<Button variant="primary" onClick={() => window.location.reload()}>{t("opportunities.retry")}</Button>}
        />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title={t("opportunityForm.notFoundTitle")}
          description={t("opportunityForm.notFoundDesc")}
          action={<Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>{t("opportunityForm.backBtn")}</Button>}
        />
      </div>
    );
  }

  // Only the owner club can edit
  if (user?.uid !== opportunity.clubId) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title={t("opportunityForm.restricted")}
          description={t("opportunityForm.onlyOwner")}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
            </svg>
          }
          action={<Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>{t("opportunityForm.backBtn")}</Button>}
        />
      </div>
    );
  }

  const handleUpdate = async (data: Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>) => {
    await updateOpportunity(opportunity.id, data);
    navigate(`/dashboard/opportunities/${opportunity.id}`, { state: { from: 'mine' } });
  };

  // Build initialData from existing opportunity (strip id, createdAt, clubId)
  const { id: _id, createdAt: _ca, clubId: _cid, ...initialData } = opportunity;

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/dashboard/opportunities/mine`)}
          className="flex items-center text-sm text-[#9CA3AF] hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tornar a Les Meves Ofertes
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">{t("opportunityForm.editTitle")}</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">Modifica els detalls de la teva oferta publicada.</p>
      </div>

      <OpportunityForm
        initialData={initialData}
        onSubmit={handleUpdate}
        submitLabel={t("opportunityForm.saveChangesBtn")}
        submittingLabel={t("opportunityForm.savingBtn")}
        onCancel={() => navigate(`/dashboard/opportunities/mine`)}
      />
    </div>
  );
}

