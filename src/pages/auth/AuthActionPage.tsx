import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmNewPassword, confirmEmailVerification } from '@/services/auth.service';
import { auth } from '@/services/firebase';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordField } from '@/components/auth/PasswordField';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { PasswordMatchBar } from '@/components/auth/PasswordMatchBar';
import { getPasswordStrength } from '@/utils/passwordStrength';
import { getFirebaseErrorCode } from '@/utils/firebaseErrors';

export default function AuthActionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode'); // 'resetPassword' | 'recoverEmail' | 'verifyEmail'
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (!oobCode || !mode) {
      setError(t('authAction.errors.invalidLink', 'Enllaç invàlid o expirat.'));
    }
  }, [oobCode, mode, t]);

  useEffect(() => {
    if (mode !== 'verifyEmail' || !oobCode) return;
    if (success || error) return;

    let cancelled = false;
    const verify = async () => {
      setLoading(true);
      try {
        await confirmEmailVerification(oobCode);
        // Refrequem el currentUser perquè el dashboard sàpiga ja que està verificat.
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        if (cancelled) return;
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        const code = getFirebaseErrorCode(err);
        if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
          setError(t('authAction.errors.expired', 'L\'enllaç ha expirat o ja s\'ha utilitzat.'));
        } else {
          setError(t('authAction.errors.verifyFailed', 'No s\'ha pogut verificar el correu.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    verify();
    return () => { cancelled = true; };
  }, [mode, oobCode, success, error, navigate, t]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword !== confirmPassword) {
      setError(t('authAction.errors.mismatch', 'Les contrasenyes no coincideixen.'));
      return;
    }

    if (newPassword.length < 8 || strength.score < 3) {
      setError(t('authAction.errors.weak', 'Si us plau, introdueix una contrasenya més forta (mínim 8 caràcters, incloent majúscules i números o símbols).'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmNewPassword(oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      const code = getFirebaseErrorCode(err);
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
        setError(t('authAction.errors.expired', 'L\'enllaç ha expirat o ja s\'ha utilitzat.'));
      } else {
        setError(t('authAction.errors.resetFailed', 'Ha ocorregut un error en canviar la contrasenya.'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (mode !== 'resetPassword' && mode !== 'verifyEmail') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-6 sm:p-8 text-center text-[#9CA3AF]">
          {t('authAction.unsupported', 'Aquesta funcionalitat')} (<code>{mode || t('authAction.unknownMode', 'desconeguda')}</code>) {t('authAction.unsupportedSuffix', 'no està implementada.')}
        </div>
      </div>
    );
  }

  if (mode === 'verifyEmail') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-6 sm:p-8 shadow-xl shadow-black/50 text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 mb-6">
            {t('authAction.verifyTitle', 'Verificació')}
          </h2>

          {loading && (
            <div className="flex flex-col items-center justify-center text-[#9CA3AF] my-6">
              <Spinner className="h-8 w-8 text-[#3B82F6] mb-4" />
              <p>{t('authAction.verifying', 'Verificant el teu correu electrònic...')}</p>
            </div>
          )}

          {error && !success && !loading && (
            <>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-[#EF4444] mb-4">
                <p>{error}</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/login')} fullWidth>
                {t('authAction.backToLogin', 'Tornar a l\'inici de sessió')}
              </Button>
            </>
          )}

          {success && !loading && (
            <div className="space-y-4 mb-4">
              <div className="p-4 bg-green-500/10 text-[#10B981] border border-green-500/20 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium text-lg">{t('authAction.verifySuccess', 'Correu verificat!')}</p>
              </div>
              <p className="text-sm text-[#9CA3AF]">{t('authAction.redirectingDashboard', 'Redirigint-te al teu tauler...')}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-6 sm:p-8 shadow-xl shadow-black/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
            {t('authAction.resetTitle', 'Nova Contrasenya')}
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            {t('authAction.resetSubtitle', 'Introdueix la teva nova contrasenya de seguretat.')}
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-500/10 text-[#10B981] border border-green-500/20 rounded-lg">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium text-lg">{t('authAction.resetSuccess', 'Contrasenya actualitzada')}</p>
              <p className="text-sm mt-1">
                {t('authAction.resetSuccessHint', 'La teva contrasenya s\'ha canviat correctament.')}
              </p>
            </div>
            <p className="text-sm text-[#9CA3AF]">{t('authAction.redirectingLogin', 'Seràs redirigit a l\'inici de sessió...')}</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-[#EF4444] text-center">
                {error}
              </div>
            )}

            <div>
              <PasswordField
                id="newPassword"
                label={t('authAction.newPasswordLabel', 'Nova contrasenya')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('authAction.newPasswordPlaceholder', 'Mínim 8 caràcters, lletres, majúscules i símbols')}
                disabled={loading || !oobCode}
                required
              />
              <PasswordStrengthBar password={newPassword} />
            </div>

            <div>
              <PasswordField
                id="confirmPassword"
                label={t('authAction.confirmPasswordLabel', 'Confirmar contrasenya')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('authAction.confirmPasswordPlaceholder', 'Torna a escriure-la')}
                disabled={loading || !oobCode}
                required
              />
              <PasswordMatchBar password={newPassword} confirm={confirmPassword} />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading || !oobCode}>
              {t('authAction.savePassword', 'Guardar Contrasenya')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
