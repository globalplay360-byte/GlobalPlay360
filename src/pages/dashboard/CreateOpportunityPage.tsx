import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { createOpportunity } from '@/services/opportunities.service';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import OpportunityForm from '@/components/opportunities/OpportunityForm';

export default function CreateOpportunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (user?.role !== 'club') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title={t("opportunityForm.restricted")}
          description={t("opportunityForm.onlyClubs")}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>
              {t("opportunityForm.backToMarketplace")}
            </Button>
          }
        />
      </div>
    );
  }

  const handleCreate = async (data: Parameters<typeof createOpportunity>[0] extends infer T ? Omit<T, 'clubId'> : never) => {
    const newId = await createOpportunity({ ...data, clubId: user.uid });
    navigate(`/dashboard/opportunities/${newId}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/opportunities')}
          className="flex items-center text-sm text-[#9CA3AF] hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("opportunityForm.backToMarketplace")}
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">{t("opportunityForm.createNewTitle")}</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">{t("opportunityForm.createNewDesc")}</p>
      </div>

      <OpportunityForm
        onSubmit={handleCreate}
        submitLabel={t("opportunityForm.publishBtn")}
        submittingLabel={t("opportunityForm.publishingBtn")}
        onCancel={() => navigate('/dashboard/opportunities')}
      />
    </div>
  );
}

