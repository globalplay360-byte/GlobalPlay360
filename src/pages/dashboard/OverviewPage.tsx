import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { mockApplications, mockOpportunities, mockConversations } from '../../services/mockData';
import {
  BriefcaseIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentCheckIcon,
  StarIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

type BaseStats = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
};

export default function OverviewPage() {
  const { user } = useAuth();
  
  const isClub = user?.role === 'club';
  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

  const userApplications = mockApplications.filter(app => app.userId === user?.uid);
  const userOpportunities = mockOpportunities.filter(op => op.clubId === user?.uid);
  const userConversations = mockConversations.filter(conv => conv.participants.includes(user?.uid || ''));

  const stats: BaseStats[] = useMemo(() => {
    if (isClub) {
      return [
        { label: 'Ofertes Actives', value: userOpportunities.length || 3, icon: BriefcaseIcon, trend: '+1 aquest mes', trendUp: true },
        { label: 'Candidatures Rebudes', value: '24', icon: DocumentCheckIcon, trend: '+4 des d\'ahir', trendUp: true },
        { label: 'Converses', value: userConversations.length || 5, icon: ChatBubbleLeftEllipsisIcon },
        { label: 'Visites al Perfil', value: '1.204', icon: ChartBarIcon, trend: '+12%', trendUp: true },
      ];
    }
    return [
      { label: 'Ofertes Guardades', value: '12', icon: StarIcon },
      { label: 'Candidatures', value: userApplications.length || 2, icon: DocumentCheckIcon, trend: '+2 aquesta setmana', trendUp: true },
      { label: 'Missatges Pendents', value: '3', icon: ChatBubbleLeftEllipsisIcon, trend: 'Actiu recentment', trendUp: true },
      { label: 'Força del Perfil', value: '85%', icon: UserCircleIcon, trend: 'Nivell Alt', trendUp: true },
    ];
  }, [isClub, userApplications.length, userOpportunities.length, userConversations.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Hola, {user?.displayName || 'Esportista'} 👋
            </h1>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border ${
              isPremium 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                : 'bg-gray-800 text-gray-300 border-gray-700'
            }`}>
              PLA {user?.plan.toUpperCase() || 'FREE'}
            </span>
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            {isClub 
              ? 'Gestiona el talent del teu club i analitza les dades.' 
              : user?.role === 'coach' 
                ? 'El teu panell principal de gestió tècnica i reptes professionals.'
                : 'Aquest és el teu centre d\'operacions esportiu. Dóna una ullada.'}
          </p>
        </div>
        
        {isClub ? (
          <Link to="/opportunities/new" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <PlusCircleIcon className="w-5 h-5" />
            Publicar Oferta
          </Link>
        ) : (
          <Link to="/profile" className="bg-[#111827] hover:bg-gray-800 text-white border border-gray-700 hover:border-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            Completar Perfil
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-5 flex flex-col relative overflow-hidden group transition-colors hover:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-gray-800 p-2.5 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                  stat.trendUp ? 'text-green-400 bg-green-400/10 border border-green-500/10' : 'text-gray-400 bg-gray-800 border border-gray-700'
                }`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <section>
            <h2 className="text-base font-semibold text-white mb-4">Accessos ràpids</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction href="/opportunities" icon={BriefcaseIcon} label="Explorar ofertes" />
              <QuickAction href="/applications" icon={DocumentCheckIcon} label="Candidatures" />
              <QuickAction href="/messages" icon={ChatBubbleLeftEllipsisIcon} label="Missatges" />
              {isClub ? (
                <QuickAction href="/profile" icon={BuildingOfficeIcon} label="El teus Perfil" />
              ) : (
                <QuickAction href="/profile" icon={UserCircleIcon} label="El teu Perfil" />
              )}
            </div>
          </section>

          <section className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden flex-1 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {isClub ? 'Últimes candidatures rebudes' : 'Oportunitats recomanades (Mock)'}
              </h2>
              <Link to={isClub ? "/applications" : "/opportunities"} className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                Veure més
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-800 h-full">
              {isClub ? (
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="p-5 hover:bg-gray-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                        <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-0.5">Jugador Pro {i + 1} (Mock)</p>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <span className="text-gray-300">Davanter Centre</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                          Europa
                        </p>
                      </div>
                    </div>
                    <Link to="/applications" className="shrink-0 bg-[#0F172A] hover:bg-gray-800 transition-colors text-white text-xs font-semibold px-4 py-2 border border-gray-700 rounded-lg">
                      Revisar CV
                    </Link>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="p-5 hover:bg-gray-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 shadow-sm">
                        <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-0.5">Equip de Primera {i + 1} (Mock)</p>
                        <p className="text-xs text-gray-400">Busca: {user?.role === 'coach' ? 'Entrenador Pro' : 'Davanter Ràpid'} • Contracte Pro</p>
                      </div>
                    </div>
                    <Link to="/opportunities" className="shrink-0 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 transition-colors text-xs font-semibold px-4 py-2 rounded-lg">
                      + Entrar
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8">
          <section>
            {isPremium ? (
              <div className="bg-[#111827] border border-blue-500/30 rounded-xl p-6 relative overflow-hidden shadow-lg shadow-blue-500/5">
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
                  <SparklesIcon className="w-32 h-32 text-blue-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{user?.plan}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Pla Actiu</h3>
                  <p className="text-sm text-gray-400 mb-5 leading-relaxed">Gaudeix de posicionament prioritari i accés total a contactes directes i ofertes exclusives.</p>
                  <button className="w-full bg-[#0F172A] hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-700 transition-colors">
                    Gestionar Subscripció
                  </button>
                </div>
              </div>
            ) : (
               <div className="bg-gradient-to-br from-[#1E3A8A]/40 via-[#111827] to-[#111827] border border-blue-500/30 rounded-xl p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300">
                   <SparklesIcon className="w-24 h-24 text-blue-500" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                     <SparklesIcon className="w-5 h-5 text-blue-400" />
                     <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">UPGRADE</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Passa a Premium</h3>
                   <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                     Rep fins a un <strong className="text-gray-200">300% més</strong> d'impressions de clubs i envia missatges directes.
                   </p>
                   <Link to="/subscription" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors w-full relative z-10">
                     Veure Plans
                   </Link>
                 </div>
               </div>
            )}
          </section>

          <section className="bg-[#111827] border border-gray-800 rounded-xl p-5 md:p-6 flex-1 shadow-sm">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center justify-between">
              Activitat
              <span className="text-[11px] font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Darrers 7 dies</span>
            </h2>
            <div className="relative border-l border-gray-800 ml-3 space-y-6">
              <div className="relative pl-5">
                <div className="absolute top-0.5 -left-[17px] bg-blue-500 p-1.5 rounded-full border-4 border-[#111827]">
                  <ChatBubbleLeftEllipsisIcon className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">Missatge Nou</p>
                <p className="text-xs text-gray-400 mb-1">Has rebut resposta d'una candidatura.</p>
                <span className="text-[10px] font-medium text-gray-500">Fa 2 hores</span>
              </div>
              <div className="relative pl-5">
                <div className="absolute top-0.5 -left-[17px] bg-gray-800 p-1.5 rounded-full border-4 border-[#111827]">
                  <DocumentCheckIcon className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">Estat "En Revisió"</p>
                <p className="text-xs text-gray-400 mb-1">El CV està sent valorat.</p>
                <span className="text-[10px] font-medium text-gray-500">Ahir, 14:30</span>
              </div>
              <div className="relative pl-5">
                <div className="absolute top-0.5 -left-[17px] bg-gray-800 p-1.5 rounded-full border-4 border-[#111827]">
                  <BriefcaseIcon className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">3 Noves Ofertes</p>
                <p className="text-xs text-gray-400 mb-1">Encaixen amb els teus filtres.</p>
                <span className="text-[10px] font-medium text-gray-500">Dimarts, 09:15</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link 
      to={href}
      className="bg-[#111827] hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all duration-300 rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center group shadow-sm">
      <div className="bg-gray-800 group-hover:bg-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] text-blue-500/70 group-hover:text-white p-3 rounded-lg transition-all duration-300 transform group-hover:scale-110">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </Link>
  );
}