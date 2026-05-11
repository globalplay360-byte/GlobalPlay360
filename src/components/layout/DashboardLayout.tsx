import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { auth } from '@/services/firebase';
import { verifyEmail } from '@/services/auth.service';
import { useState, useEffect } from 'react';

export default function DashboardLayout() {
  const location = useLocation();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // Per defecte assumim verificat per evitar flaix del banner mentre comprovem.
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkVerification = async () => {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      if (cancelled || !auth.currentUser) return;
      const unverified =
        !auth.currentUser.emailVerified &&
        auth.currentUser.providerData.some((p) => p.providerId === 'password');
      setIsVerified(!unverified);
    };

    checkVerification();

    // En lloc de polling cada 10s: comprovem només quan la pestanya recupera focus
    // (cas típic: l'usuari ha verificat l'email a una altra pestanya/dispositiu).
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkVerification();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
    };
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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B1120] font-sans overflow-hidden">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className="flex flex-col flex-1 bg-[#0F172A] relative min-w-0">
        <Topbar
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          isVerified={isVerified}
          sendingVerificationEmail={sending}
          verificationEmailSent={sent}
          onResendVerificationEmail={handleResend}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}