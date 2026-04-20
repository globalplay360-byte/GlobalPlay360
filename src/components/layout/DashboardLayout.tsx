import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/services/firebase';
import { verifyEmail } from '@/services/auth.service';
import { useState, useEffect } from 'react';

export default function DashboardLayout() {
  const { user } = useAuth();
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // per defecte suposem que sí fins a revisar

  // Comprovem regularment o a l'entrar si s'ha verificat l'email per amagar el banner
  useEffect(() => {
    const checkVerification = async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const unverified = 
          !auth.currentUser.emailVerified && 
          auth.currentUser.providerData.some(p => p.providerId === 'password');
        setIsVerified(!unverified);
      }
    };
    checkVerification();
    
    // Per si l'usuari verifica des d'una altra pestanya
    const interval = setInterval(checkVerification, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (sending || sent) return;
    setSending(true);
    try {
      await verifyEmail();
      setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1120] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-[#0B1120] relative min-w-0">
        <Topbar />
        
        {/* Banner Global de Verificació (sota de la Topbar, dins de l'espai visible del tauler) */}
        {!isVerified && (
          <div className="bg-[#3B82F6]/10 border-b border-[#3B82F6]/20 px-4 py-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm z-10 sticky top-0">
            <div className="flex items-center gap-2 text-[#9CA3AF]">
              <svg className="w-5 h-5 text-[#3B82F6] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>El teu compte no està verificat. Si us plau, comprova el teu correu electrònic.</span>
            </div>
            <button 
              onClick={handleResend}
              disabled={sending || sent}
              className={`font-medium whitespace-nowrap transition-colors ${
                sent ? 'text-green-500 cursor-default' : 'text-[#3B82F6] hover:text-[#2563EB] underline underline-offset-2 hover:decoration-2'
              }`}
            >
              {sending ? 'Enviant...' : sent ? 'Correu de verificació enviat!' : 'Reenviar correu'}
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}