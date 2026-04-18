import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Opportunity } from '@/types';
import { getOpportunityById } from '@/services/opportunities.service';
import { getUserDoc } from '@/services/auth.service';
import { createApplication, hasUserApplied } from '@/services/applications.service';
import { getOrCreateConversation } from '@/services/messages.service';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/ui/EmptyState';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Resol "Tornar" en funció de l'origen de navegació (state.from)
  const from = (location.state as { from?: string } | null)?.from;
  const backTarget = (() => {
    if (from === 'applications') return { url: '/dashboard/applications', label: 'Tornar a Candidatures' };
    if (from === 'mine') return { url: '/dashboard/opportunities/mine', label: 'Tornar a Les Meves Ofertes' };
    if (from === 'marketplace') return { url: '/dashboard/opportunities', label: 'Tornar al Marketplace' };
    // Fallback per accés directe per URL: decidim pel rol
    return user?.role === 'club'
      ? { url: '/dashboard/opportunities/mine', label: 'Tornar a Les Meves Ofertes' }
      : { url: '/dashboard/opportunities', label: 'Tornar al Marketplace' };
  })();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [clubName, setClubName] = useState<string>('');
  const [clubEmail, setClubEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application state
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);

        const opp = await getOpportunityById(id);
        if (cancelled) return;

        if (!opp) {
          setOpportunity(null);
          setIsLoading(false);
          return;
        }

        setOpportunity(opp);

        // Fetch club info + check if already applied in parallel
        const [clubDoc, applied] = await Promise.all([
          getUserDoc(opp.clubId),
          user ? hasUserApplied(user.uid, opp.id) : false,
        ]);
        if (!cancelled) {
          if (clubDoc) {
            setClubName(clubDoc.displayName);
            setClubEmail(clubDoc.email);
          }
          setAlreadyApplied(applied);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error carregant la oportunitat');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !opportunity) return;
    try {
      setApplying(true);
      setApplyError(null);
      await createApplication({
        opportunityId: opportunity.id,
        userId: user.uid,
        clubId: opportunity.clubId,
      });
      setAlreadyApplied(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Error enviant la candidatura');
    } finally {
      setApplying(false);
    }
  };

const handleMessage = async () => {
    if (!user || !opportunity) return;

    try {
      setApplying(true);
      const convId = await getOrCreateConversation(user.uid, opportunity.clubId);
      navigate(`/dashboard/messages/${convId}`);
    } catch (err) {
      alert('Error en intentar obrir el xat directe.');
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ca-ES', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  // ── Loading state ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-gray-800 rounded" />
        <div className="h-64 bg-gray-900 rounded-xl" />
        <div className="h-40 bg-gray-900 rounded-xl" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title="Error de connexió"
          description={error}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => window.location.reload()}>Reintentar</Button>
          }
        />
      </div>
    );
  }

  // ── Not found state ───────────────────────────────────
  if (!opportunity) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title="Oportunitat no trobada"
          description="Aquesta oportunitat podria haver estat eliminada o l'ID no és vàlid."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-6">
      {/* Top Nav */}
      <div>
        <button
          onClick={() => navigate(backTarget.url)}
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {backTarget.label}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{opportunity.title}</h1>
                {clubName && <p className="text-blue-400 font-medium text-lg">{clubName}</p>}
              </div>
              <Badge variant={opportunity.status === 'open' ? 'success' : 'default'} className="w-fit">
                {opportunity.status.toUpperCase()}
              </Badge>
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-800 mb-8">
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <MapPinIcon className="w-3.5 h-3.5 mr-1" /> Ubicació
                </div>
                <div className="font-medium text-white">{opportunity.location}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <BriefcaseIcon className="w-3.5 h-3.5 mr-1" /> Contracte
                </div>
                <div className="font-medium text-white capitalize">{opportunity.contractType.replace('-', ' ')}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <UserGroupIcon className="w-3.5 h-3.5 mr-1" /> Gènere
                </div>
                <div className="font-medium text-white capitalize">{opportunity.gender}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" /> Publicat
                </div>
                <div className="font-medium text-white">{formatDate(opportunity.createdAt)}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-white">Sobre l'Oportunitat</h2>
              <div className="text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {opportunity.description}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Requisits i Perfil Necessari</h2>
              <ul className="space-y-3">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">•</span>
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-blue-900/30 shadow-lg shadow-blue-900/10">
            <CardContent className="p-6">
              {user?.role === 'club' ? (
                <div className="text-center text-gray-400 p-4">
                  Els clubs no poden aplicar a oportunitats.
                </div>
              ) : (
                <div className="space-y-4">
                  {alreadyApplied ? (
                    <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-emerald-400 font-semibold text-sm">Ja has aplicat a aquesta oportunitat</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleApply}
                      disabled={applying}
                    >
                      {applying ? 'Enviant...' : 'Aplicar Ara'}
                    </Button>
                  )}

                  {applyError && (
                    <div className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                      {applyError}
                    </div>
                  )}

                  <Button variant="secondary" size="lg" fullWidth onClick={handleMessage}>
                    Contactar Club
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Club Info Card */}
          <Card>
            <CardContent className="p-6 space-y-4 text-sm">
              <h3 className="font-semibold text-white">Sobre el Club</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden">
                  {clubName?.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="font-bold text-white text-base">{clubName || 'Club'}</div>
                  {clubEmail && <div className="text-blue-400">{clubEmail}</div>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" fullWidth>
                Veure Perfil Complet
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
