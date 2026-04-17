import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Opportunity } from '@/types';
import { getOpportunitiesByField } from '@/services/opportunities.service';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/ui/EmptyState';

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOpportunitiesByField('status', '==', 'open');
        if (!cancelled) setOpportunities(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error carregant oportunitats');
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

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Error de connexió"
          description={error}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Marketplace</h1>
          <p className="mt-2 text-gray-400">Descobreix les últimes oportunitats arreu del món.</p>
        </div>
        {user?.role === 'club' && (
          <div className="mt-4 md:mt-0">
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities/new')}>Crear Oportunitat</Button>
          </div>
        )}
      </div>

      {/* Filters (placeholder) */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex gap-4 overflow-x-auto">
        <Badge variant="primary" className="cursor-pointer px-4 py-2 text-sm">Totes</Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-gray-800 px-4 py-2 text-sm">Football</Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-gray-800 px-4 py-2 text-sm">Basketball</Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-gray-800 px-4 py-2 text-sm">Contractes Pro</Badge>
      </div>

      {/* ── Loading state ──────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>

      /* ── Empty state ───────────────────────────────── */
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="Encara no hi ha oportunitats"
          description="No s'han trobat oportunitats publicades. Torna-ho a provar més tard o crea la primera si ets un club."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

      /* ── Data state ────────────────────────────────── */
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="flex flex-col hover:border-gray-700 transition-colors">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                </div>
                <Badge variant={opp.status === 'open' ? 'success' : 'default'} className="uppercase text-[10px]">
                  {opp.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex gap-2 mb-4 text-xs font-medium text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                    {opp.sport}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">{opp.location}</div>
                  <span>•</span>
                  <div className="capitalize">{opp.contractType.replace('-', ' ')}</div>
                </div>

                <p className="text-gray-300 text-sm line-clamp-3 mb-6">{opp.description}</p>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requisits Clau</h4>
                  <ul className="flex flex-wrap gap-2">
                    {opp.requirements.slice(0, 3).map((req, idx) => (
                      <Badge key={idx} variant="default" className="text-[11px] bg-gray-800/50 border-gray-700/50">{req}</Badge>
                    ))}
                    {opp.requirements.length > 3 && (
                      <span className="text-xs text-gray-500 items-center flex">+{opp.requirements.length - 3} més</span>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-xs text-gray-500 font-medium">
                  Publicat: {formatDate(opp.createdAt)}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'marketplace' } })}>
                    Veure Detall
                  </Button>
                  {user?.role !== 'club' && (
                    <Button variant="primary" size="sm" onClick={() => navigate(`/dashboard/opportunities/${opp.id}`, { state: { from: 'marketplace' } })}>
                      Aplicar
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
