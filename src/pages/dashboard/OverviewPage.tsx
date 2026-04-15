import { useAuth } from '@/context/AuthContext';

export default function OverviewPage() {
  const { user } = useAuth();
  const userName = user?.displayName || 'Esportista';

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Benvingut/da, {userName} 👋</h1>
          <p className="text-sm text-[#9CA3AF]">Aquest és el resum del teu compte al Global Play 360.</p>
        </div>
        <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Actualitzar Dades
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#3B82F6]/10 rounded-lg text-[#3B82F6]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h3 className="text-sm font-medium text-[#9CA3AF]">Visites al perfil</h3>
          </div>
          <p className="text-2xl font-bold text-white">1,248</p>
          <div className="mt-2 text-xs font-medium text-[#10B981] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span>+12% vs el darrer mes</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#10B981]/10 rounded-lg text-[#10B981]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-sm font-medium text-[#9CA3AF]">Ofertes rebudes</h3>
          </div>
          <p className="text-2xl font-bold text-white">4</p>
          <div className="mt-2 text-xs font-medium text-[#9CA3AF]">
            2 pendents de resposta
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#F59E0B]/10 rounded-lg text-[#F59E0B]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
            <h3 className="text-sm font-medium text-[#9CA3AF]">Rànquing</h3>
          </div>
          <p className="text-2xl font-bold text-white">Top 5%</p>
          <div className="mt-2 text-xs font-medium text-[#10B981] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span>+2 posicions pujades</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#8B5CF6]/10 rounded-lg text-[#8B5CF6]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-sm font-medium text-[#9CA3AF]">Vídeos Pujats</h3>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
          <div className="mt-2 text-xs font-medium text-[#9CA3AF]">
            840 hores de visualització totals
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity (takes 2 columns on desktop) */}
        <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-[#1F2937] shadow-sm flex flex-col">
          <div className="p-5 border-b border-[#1F2937] flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Activitat Recent</h2>
            <button className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]">Veure tota</button>
          </div>
          <div className="p-0">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-5 border-b border-[#1F2937] last:border-0 flex gap-4 hover:bg-[#1F2937]/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center shrink-0 text-lg">⚽</div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-0.5">Nou analista ha guardat el teu perfil</h4>
                  <p className="text-sm text-[#9CA3AF]">FC Barcelona (Scouting Dept) ha afegit el teu perfil a "Jugadors a seguir".</p>
                  <span className="text-xs text-[#6B7280] block mt-1.5">Fa {i + 1} hores</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] shadow-sm p-5">
          <h2 className="text-base font-semibold text-white mb-4">Tasques properes</h2>
          <div className="space-y-4">
            
            <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1F2937]">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] uppercase font-bold px-2 py-0.5 rounded">Urgent</span>
              </div>
              <h3 className="text-sm font-medium text-white">Actualitza el pes i alçada</h3>
              <p className="text-xs text-[#9CA3AF] mt-1 mb-3">Mantenir les teves mides al dia ajuda els clubs a tenir la informació real.</p>
              <button className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]">Completar ara →</button>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1F2937]">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] uppercase font-bold px-2 py-0.5 rounded">Suggeriment</span>
              </div>
              <h3 className="text-sm font-medium text-white">Afegeix vídeo del darrer partit</h3>
              <p className="text-xs text-[#9CA3AF] mt-1 mb-3">Els perfils amb vídeos recents reben un 40% més de contactes.</p>
              <button className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]">Pujar fitxer →</button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}