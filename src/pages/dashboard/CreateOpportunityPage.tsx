import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { createOpportunity } from '@/services/opportunities.service';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import OpportunityForm from '@/components/opportunities/OpportunityForm';

export default function CreateOpportunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (user?.role !== 'club') {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6 lg:mb-8">
        <button
          onClick={() => navigate('/dashboard/opportunities')}
          className="inline-flex items-center text-sm font-medium text-[#9CA3AF] hover:text-gray-100 transition-all duration-fast ease-out active:scale-[0.98] hover:-translate-x-1 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("opportunityForm.backToMarketplace")}
        </button>
        <PageHeader 
          title={t("opportunityForm.createNewTitle")}
          description={t("opportunityForm.createNewDesc")}
        />
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 md:p-8 shadow-sm">
        <OpportunityForm
          onSubmit={handleCreate}
          submitLabel={t("opportunityForm.publishBtn")}
          submittingLabel={t("opportunityForm.publishingBtn")}
          onCancel={() => navigate('/dashboard/opportunities')}
        />
      </div>
    </div>
  );
}


