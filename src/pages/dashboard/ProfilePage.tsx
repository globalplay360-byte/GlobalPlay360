import { useAuth } from '@/context/AuthContext';
import { mockProfiles } from '@/services/mockData';
import EmptyState from '@/components/ui/EmptyState';

// Helper per formatar els noms de les estadístiques
const formatStatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function ProfilePage() {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'user-player-1';
  
  // Cerquem el perfil associat a l'usuari actual
  const profile = mockProfiles.find((p) => p.userId === currentUserId);

  if (!user || !profile) {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full">
        <EmptyState 
          title="Perfil no trobat" 
          description="Sembla que encara no has configurat el teu perfil o hi ha hagut un error en carregar-lo."
          action={
            <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors">
              Crear Perfil
            </button>
          }
        />
      </div>
    );
  }

  const isPremium = user.plan === 'premium' || user.plan === 'pro';

  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
      
      {/* Capçalera del Perfil (Cover + Avatar + Main Info) */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden relative">
        {/* Cover Background */}
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] relative">
          {/* Subtle pattern for texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')]"></div>
        </div>

        {/* Info Contingut */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4">
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 w-full md:w-auto text-center md:text-left">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-[#111827] bg-[#1F2937] flex items-center justify-center text-4xl font-bold text-white shadow-lg relative shrink-0">
              {profile.name.charAt(0)}
              {isPremium && (
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-[#111827] flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Dades Títol */}
            <div className="flex flex-col gap-1 md:pb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-1 text-[#9CA3AF] text-sm">
                <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold text-[#3B82F6]">
                  {profile.type}
                </span>
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[#374151]"></span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {profile.sport}
                </span>
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[#374151]"></span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {profile.country}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0">
            <button className="flex-1 md:flex-none px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-[#3B82F6]/20 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Graella de contingut principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Esquerra: Resum i Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Sobre {profile.type === 'club' ? "l'entitat" : "mi"}
            </h2>
            <p className="text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">
              {profile.description || "Aquest usuari encara no ha afegit cap descripció."}
            </p>
          </div>

          {/* Mèdia (si n'hi ha) */}
          {profile.mediaUrls && profile.mediaUrls.length > 0 && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                Vídeos / Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.mediaUrls.map((_url, idx) => (
                  <div key={idx} className="aspect-video bg-[#0F172A] rounded-lg border border-[#1F2937] flex items-center justify-center cursor-pointer group hover:border-[#3B82F6] transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                    <svg className="w-12 h-12 text-white z-20 group-hover:scale-110 transition-transform drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna Dreta: Stats i Estat del Compte */}
        <div className="flex flex-col gap-6">
          
          {/* Targeta Estat del Pla */}
          <div className={`rounded-xl p-6 border ${isPremium ? 'bg-gradient-to-b from-[#111827] to-[#1E293B] border-yellow-500/20' : 'bg-[#111827] border-[#1F2937]'}`}>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Estat de Membresia</h3>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
                {isPremium ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </div>
              <div>
                <p className="text-white font-bold tracking-tight capitalize">{user.plan} Plan</p>
                <p className="text-xs text-[#9CA3AF]">
                  {isPremium ? 'Access total habilitat.' : 'Actualitza per contactar directament.'}
                </p>
              </div>
            </div>
            {!isPremium && (
              <button className="w-full mt-4 py-2 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 text-sm font-medium rounded-lg transition-colors">
                Veure Plans
              </button>
            )}
          </div>

          {/* Estadístiques */}
          {profile.stats && Object.keys(profile.stats).length > 0 && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Mètriques</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(profile.stats).map(([key, value]) => (
                  <div key={key} className="bg-[#0F172A] p-4 rounded-lg border border-[#1F2937] flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-white mb-1">{value}</span>
                    <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-medium">{formatStatKey(key)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Petita informació de compte (Data d'alta) */}
          <div className="text-center">
            <span className="text-xs text-[#4B5563]">Membre des de {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

        </div>
      </div>
    </div>
  );
}