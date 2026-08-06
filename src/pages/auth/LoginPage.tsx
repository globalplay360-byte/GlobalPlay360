import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/Spinner';
import { CONTACT_EMAIL, PRIVATE_PREVIEW_MODE, PUBLIC_REGISTRATION_ENABLED } from '@/config/site';

const LOGIN_BACKGROUND_VIDEO = 'https://firebasestorage.googleapis.com/v0/b/globalplay360-3f9a1.firebasestorage.app/o/global_home.mp4?alt=media&token=d56dab23-e1be-4f3a-a9b6-bd7faeba7b4b';

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const showGoogleLogin = !PRIVATE_PREVIEW_MODE && PUBLIC_REGISTRATION_ENABLED;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validació Client-Side basica
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage(t('loginPage.errors.invalidEmail'));
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage(t('loginPage.errors.shortPassword'));
      return;
    }

    setStatus('loading');

    try {
      await login(email, password);
      setStatus('success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(t('loginPage.errors.invalidCredentials'));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0B1120] p-4 font-sans text-gray-100 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={LOGIN_BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0B1120]/72" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_42%),linear-gradient(180deg,rgba(11,17,32,0.28)_0%,rgba(11,17,32,0.78)_100%)]" aria-hidden="true" />

      <div className="w-full max-w-md bg-[#111827]/92 backdrop-blur-sm rounded-xl border border-[#1F2937] shadow-xl p-6 sm:p-8 relative overflow-hidden z-10">
        
        {/* Glow de decoració per donar toc SaaS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50" />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('loginPage.title')}</h1>
          <p className="text-[#9CA3AF] text-sm">{t('loginPage.subtitle')}</p>
        </div>

        {(status === 'error' || authError) && (
          <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-[#EF4444]">{errorMessage || authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="email">{t('loginPage.emailLabel')}</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder={t('loginPage.emailPlaceholder')}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-[#9CA3AF]" htmlFor="password">{t('loginPage.passwordLabel')}</label>
              <Link to="/forgot-password" className="text-xs text-[#3B82F6] hover:text-[#2563EB] transition-colors">{t('loginPage.forgotPassword')}</Link>
            </div>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder=""
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1D4ED8]/50 disabled:cursor-not-allowed text-gray-100 font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Spinner />
                <span>{t('loginPage.loading')}</span>
              </>
            ) : status === 'success' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                <span>{t('loginPage.success')}</span>
              </>
            ) : (
              t('loginPage.submitButton')
            )}
          </button>
        </form>

        {showGoogleLogin && (
          <>
            <div className="mt-8 text-center text-sm text-[#9CA3AF]">
              {t('loginPage.noAccount')}{' '}
              <Link to="/register" className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">
                {t('loginPage.registerLink')}
              </Link>
            </div>
          </>
        )}

        {!showGoogleLogin && !PRIVATE_PREVIEW_MODE && (
          <div className="mt-8 text-center text-sm text-[#9CA3AF]">
            L&apos;accés és només per a comptes existents. Si necessites alta, escriu a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">
              {CONTACT_EMAIL}
            </a>
            .
          </div>
        )}

        {PRIVATE_PREVIEW_MODE && (
          <div className="mt-8 text-center text-xs uppercase tracking-[0.14em] text-[#6B7280]">
            Private preview access
          </div>
        )}
      </div>
    </div>
  );
}
