import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordField } from '@/components/auth/PasswordField';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { PasswordMatchBar } from '@/components/auth/PasswordMatchBar';
import { getPasswordStrength } from '@/utils/passwordStrength';
import type { UserRole } from '@/types';

const ROLE_MAP: Record<string, UserRole> = {
  jugador: 'player',
  entrenador: 'coach',
  club: 'club',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const defaultRole = searchParams.get('type') || 'jugador';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [consentAccepted, setConsentAccepted] = useState(false);
  // Declaració d'edat, separada del consentiment legal a propòsit: són dues
  // afirmacions diferents i el log de `consent_history` les ha de poder
  // distingir. Barrejades en una sola casella, la prova no serviria de res.
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setStatus('error');
      setErrorMessage(t('registerPage.errors.missingName'));
      return;
    }
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage(t('registerPage.errors.invalidEmail'));
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage(t('registerPage.errors.passwordMismatch'));
      return;
    }
    if (password.length < 8 || strength.score < 3) {
      setStatus('error');
      setErrorMessage(t('registerPage.errors.weakPassword'));
      return;
    }
    if (!consentAccepted) {
      setStatus('error');
      setErrorMessage(t('registerPage.errors.consentRequired', 'Has d\'acceptar els Termes i condicions i la Política de privacitat per crear el compte.'));
      return;
    }
    if (!ageConfirmed) {
      setStatus('error');
      setErrorMessage(t('registerPage.errors.ageRequired', 'Has de confirmar que tens 16 anys o més per crear el compte.'));
      return;
    }

    setStatus('loading');

    try {
      await register(email, password, displayName, ROLE_MAP[role] ?? 'player', ageConfirmed);
      setStatus('success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(t('registerPage.errors.registerError'));
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4 font-sans text-gray-100 py-12">
      <div className="w-full max-w-lg bg-[#111827] rounded-xl border border-[#1F2937] shadow-xl p-6 sm:p-8 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50" />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('registerPage.title')}</h1>
          <p className="text-[#9CA3AF] text-sm">{t('registerPage.subtitle')}</p>
        </div>

        {status === 'error' && (
          <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-[#EF4444]">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">{t('registerPage.roleLabel')}</label>
            <div className="grid grid-cols-3 gap-3">
              {['jugador', 'entrenador', 'club'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all capitalize ${
                    role === r 
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]' 
                      : 'bg-[#0F172A] border-[#1F2937] text-[#9CA3AF] hover:border-[#3B82F6]/50 hover:text-gray-100'
                  }`}
                >
                  {t(`registerPage.roles.${r}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="displayName">{t('registerPage.nameLabel')}</label>
            <input 
              id="displayName"
              type="text" 
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder={t('registerPage.namePlaceholder')}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="email">{t('registerPage.emailLabel')}</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder={t('registerPage.emailPlaceholder')}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div className="mb-4">
            <PasswordField
              id="password"
              label={t('registerPage.passwordLabel')}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder={t('registerPage.passwordPlaceholder')}
              disabled={status === 'loading' || status === 'success'}
            />
            <PasswordStrengthBar password={password} />
          </div>

          <div className="mb-6">
            <PasswordField
              id="confirmPassword"
              label={t('registerPage.confirmPasswordLabel')}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder={t('registerPage.confirmPasswordPlaceholder')}
              disabled={status === 'loading' || status === 'success'}
            />
            <PasswordMatchBar password={password} confirm={confirmPassword} />
          </div>

          {/* Consentiment Art. 7 RGPD: checkbox explícit amb enllaços legals */}
          <label className="flex items-start gap-3 text-sm text-[#9CA3AF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => { setConsentAccepted(e.target.checked); if (status === 'error') setStatus('idle'); }}
              disabled={status === 'loading' || status === 'success'}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#1F2937] bg-[#0F172A] text-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] accent-[#3B82F6]"
            />
            <span>
              {t('registerPage.consent.pre', 'He llegit i accepto els')}{' '}
              <Link to="/terms" target="_blank" className="text-[#93C5FD] underline underline-offset-2 hover:text-gray-100 transition-colors">
                {t('registerPage.consent.terms', 'Termes i condicions')}
              </Link>{' '}
              {t('registerPage.consent.and', 'i la')}{' '}
              <Link to="/privacy" target="_blank" className="text-[#93C5FD] underline underline-offset-2 hover:text-gray-100 transition-colors">
                {t('registerPage.consent.privacy', 'Política de privacitat')}
              </Link>.
            </span>
          </label>

          {/* Edat mínima: 16 anys. Casella separada del consentiment legal
              perquè `consent_history` pugui provar les dues coses per separat. */}
          <label className="flex items-start gap-3 text-sm text-[#9CA3AF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => { setAgeConfirmed(e.target.checked); if (status === 'error') setStatus('idle'); }}
              disabled={status === 'loading' || status === 'success'}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#1F2937] bg-[#0F172A] text-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] accent-[#3B82F6]"
            />
            <span>{t('registerPage.consent.age', 'Confirmo que tinc 16 anys o més.')}</span>
          </label>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1D4ED8]/50 disabled:cursor-not-allowed text-gray-100 font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Spinner />
                <span>{t('registerPage.loading')}</span>
              </>
            ) : status === 'success' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                <span>{t('registerPage.success')}</span>
              </>
            ) : (
              t('registerPage.submitButton')
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#9CA3AF]">
          {t('registerPage.hasAccount')}{' '}
          <Link to="/login" className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">
            {t('registerPage.loginLink')}
          </Link>
        </div>

      </div>
    </div>
  );
}
