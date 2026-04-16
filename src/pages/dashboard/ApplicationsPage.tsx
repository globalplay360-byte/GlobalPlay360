import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { mockApplications, mockOpportunities, mockUsers } from '@/services/mockData';
import type { Application, Opportunity, User } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

// Extended type per a poder renderitzar les targetes amb dades completes
interface ApplicationExtended extends Application {
  opportunity?: Opportunity;
  club?: User;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'user-player-1'; 
  const currentUserRole = user?.role || 'player';

  // Si és un club, per ara mostrem un placeholder (ja que gestiona candidats, no aplica)
  if (currentUserRole === 'club') {
    return (
      <div className="p-6 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Gestió de Candidats</h1>
        <EmptyState
          title="Panell en construcció"
          description="Aquesta vista estarà destinada a gestionar els jugadors i entrenadors que apliquin a les teves oportunitats."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>
    );
  }

  // Filtrar aplicacions per l'usuari actual i estendre-les amb l'oportunitat i club
  const applications: ApplicationExtended[] = mockApplications
    .filter((app) => app.userId === currentUserId)
    .map((app) => {
      const opportunity = mockOpportunities.find((opp) => opp.id === app.opportunityId);
      const club = mockUsers.find((u) => u.uid === opportunity?.clubId);
      return { ...app, opportunity, club };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Candidatures</h1>
            <p className="text-[#9CA3AF] mt-1 text-sm">
              Seguiment de totes les teves peticions i processos de selecció actius.
            </p>
          </div>
        </div>

        {/* Content */}
        {applications.length > 0 ? (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="bg-[#111827] border border-[#1F2937] rounded-xl hover:border-[#3B82F6]/50 transition-colors group flex flex-col md:flex-row p-5 gap-6 mb-4 relative overflow-hidden"
              >
                {/* Línia superior de status segons el badge */}
                <div className={`absolute top-0 left-0 h-1 w-full 
                  ${app.status === 'accepted' ? 'bg-emerald-500' : ''}
                  ${app.status === 'rejected' ? 'bg-red-500' : ''}
                  ${app.status === 'in_review' ? 'bg-purple-500' : ''}
                  ${app.status === 'submitted' ? 'bg-blue-500' : ''}
                `} />

                {/* Info Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#9CA3AF] text-sm font-medium">
                      Aplicat el {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <div className="block md:hidden">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-bold text-white mb-1 truncate">
                    {app.opportunity?.title || 'Oportunitat Tancada'}
                  </h2>
                  <p className="text-[#3B82F6] font-medium text-sm mb-4">
                    {app.club?.displayName || 'Club Desconegut'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#9CA3AF]">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span>{app.opportunity?.sport}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>{app.opportunity?.location}</span>
                    </div>
                  </div>
                  
                  {/* Missatge d'apliació truncat per a que no ocupi tot */}
                  {app.message && (
                    <div className="mt-4 p-3 bg-[#0F172A] border border-[#1F2937] rounded-lg">
                      <p className="text-sm text-[#9CA3AF] italic line-clamp-2">"{app.message}"</p>
                    </div>
                  )}
                </div>

                {/* Accions i Estat */}
                <div className="flex flex-col justify-between items-start md:items-end gap-4 min-w-[160px] border-t border-[#1F2937] md:border-t-0 pt-4 md:pt-0">
                  <div className="hidden md:block">
                    <StatusBadge status={app.status} className="text-sm px-3 py-1" />
                  </div>
                  <Link 
                    to={`/dashboard/opportunities/${app.opportunityId}`}
                    className="w-full md:w-auto px-4 py-2 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Veure Detall
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Encara no has aplicat a cap oportunitat"
            description="Explora el marketplace i envia la teva primera candidatura a clubs o ofertes que encaixin amb el teu perfil."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            action={
              <Link 
                to="/dashboard/opportunities" 
                className="inline-flex items-center justify-center px-4 py-2 bg-[#3B82F6] text-white hover:bg-[#2563EB] text-sm font-medium rounded-lg transition-colors"
              >
                Buscar Oportunitats
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}