import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createOpportunity } from '@/services/opportunities.service';
import { Button } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import OpportunityForm from '@/components/opportunities/OpportunityForm';

export default function CreateOpportunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'club') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title="Accés restringit"
          description="Només els clubs poden publicar oportunitats."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>
              Tornar al Marketplace
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
          Tornar al Marketplace
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Publicar Nova Oportunitat</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">Omple el formulari per publicar una oferta al marketplace.</p>
      </div>

      <OpportunityForm
        onSubmit={handleCreate}
        submitLabel="Publicar Oportunitat"
        submittingLabel="Publicant..."
        onCancel={() => navigate('/dashboard/opportunities')}
      />
    </div>
  );
}
