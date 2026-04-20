import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmNewPassword, confirmEmailVerification } from '@/services/auth.service';
import { auth } from '@/services/firebase';
import { Button } from '@/components/ui/Button';

export default function AuthActionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode'); // 'resetPassword' | 'recoverEmail' | 'verifyEmail'
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calcula la força de la contrasenya
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, text: '', color: 'bg-transparent', width: 'w-0' };
    
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, text: 'Molt feble', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { score, text: 'Feble', color: 'bg-orange-500', width: 'w-2/4' };
      case 3:
        return { score, text: 'Bona', color: 'bg-yellow-400', width: 'w-3/4' };
      case 4:
        return { score, text: 'Forta', color: 'bg-green-500', width: 'w-full' };
      default:
        return { score: 0, text: '', color: 'bg-transparent', width: 'w-0' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  // Si no hi ha codi de seguretat en l'URL, no s'hauria d'estar aquí
  useEffect(() => {
    if (!oobCode || !mode) {
      setError('Enllaç invàlid o expirat.');
    }
  }, [oobCode, mode]);

  // UseEffect per al mode "verifyEmail"
  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      const verify = async () => {
        setLoading(true);
        try {
          await confirmEmailVerification(oobCode);
          // Actualitzem l'usuari local perquè el dashboard sàpiga que s'ha verificat immediatament
          if (auth.currentUser) {
            await auth.currentUser.reload();
          }
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err: unknown) {
          console.error(err);
          if (err && typeof err === 'object' && 'code' in err && ((err as any).code === 'auth/expired-action-code' || (err as any).code === 'auth/invalid-action-code')) {
            setError("L'enllaç ha expirat o ja s'ha utilitzat.");
          } else {
            setError("No s'ha pogut verificar el correu.");
          }
        } finally {
          setLoading(false);
        }
      };
      // Només ho fem si encara no hem tingut èxit ni error per evitar loops
      if (!success && !error) {
        verify();
      }
    }
  }, [mode, oobCode, success, error, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword !== confirmPassword) {
      setError('Les contrasenyes no coincideixen.');
      return;
    }
    
    if (newPassword.length < 8 || strength.score < 3) {
      setError('Si us plau, introdueix una contrasenya més forta (mínim 8 caràcters, incloent majúscules i números o símbols).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmNewPassword(oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'code' in err && ((err as any).code === 'auth/expired-action-code' || (err as any).code === 'auth/invalid-action-code')) {
        setError("L'enllaç ha expirat o ja s'ha utilitzat.");
      } else {
        setError('Ha ocorregut un error en canviar la contrasenya.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Depenent del "mode" (tipus d'acció), podem mostrar diferents pantalles
  if (mode !== 'resetPassword' && mode !== 'verifyEmail') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-8 text-center text-[#9CA3AF]">
          Aquesta funcionalitat (<code>{mode || 'desconeguda'}</code>) no està implementada.
        </div>
      </div>
    );
  }

  // ── Mode: verifyEmail ──────────────────────────────────────
  if (mode === 'verifyEmail') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-8 shadow-xl shadow-black/50 text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6">
            Verificació
          </h2>
          
          {loading && (
            <div className="flex flex-col items-center justify-center text-[#9CA3AF] my-6">
              <svg className="animate-spin h-8 w-8 text-[#3B82F6] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Verificant el teu correu electrònic...</p>
            </div>
          )}

          {error && !success && !loading && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-[#EF4444] mb-4">
              <p>{error}</p>
            </div>
          )}

          {success && !loading && (
            <div className="space-y-4 mb-4">
              <div className="p-4 bg-green-500/10 text-[#10B981] border border-green-500/20 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium text-lg">{t('authAction.verifySuccess', 'Correu verificat!')}</p>
              </div>
              <p className="text-sm text-[#9CA3AF]">Redirigint-te al teu tauler...</p>
            </div>
          )}

          {error && !success && !loading && (
             <Button variant="outline" onClick={() => navigate('/login')} fullWidth>
                Tornar a l'inici de sessió
             </Button>
          )}

        </div>
      </div>
    );
  }

  // ── Mode: resetPassword ────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-8 shadow-xl shadow-black/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Nova Contrasenya
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Introdueix la teva nova contrasenya de seguretat.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-500/10 text-[#10B981] border border-green-500/20 rounded-lg">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium text-lg">Contrasenya actualitzada</p>
              <p className="text-sm mt-1">
                La teva contrasenya s'ha canviat correctament.
              </p>
            </div>
            <p className="text-sm text-[#9CA3AF]">Seràs redirigit a l'inici de sessió...</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-[#EF4444] text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#9CA3AF] mb-1">
                Nova contrasenya
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-4 pr-10 py-2 bg-[#0F172A] border border-[#1F2937] rounded-lg text-white placeholder:text-[#4B5563] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínim 8 caràcters, lletres, majúscules i símbols"
                  disabled={loading || !oobCode}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-white"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.456c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#9CA3AF]">Nivell de seguretat</span>
                    <span className={`text-xs font-semibold ${
                      strength.score === 4 ? 'text-green-500' :
                      strength.score === 3 ? 'text-yellow-400' :
                      strength.score === 2 ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ease-in-out ${strength.color} ${strength.width}`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#9CA3AF] mb-1">
                Confirmar contrasenya
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-4 pr-10 py-2 bg-[#0F172A] border border-[#1F2937] rounded-lg text-white placeholder:text-[#4B5563] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Torna a escriure-la"
                  disabled={loading || !oobCode}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-white"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.456c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                  )}
                </button>
              </div>

              {confirmPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#9CA3AF]">Coincidència</span>
                    <span className={`text-xs font-semibold ${
                      newPassword === confirmPassword ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {newPassword === confirmPassword ? 'Coincideixen' : 'No coincideixen'}
                    </span>
                  </div>
                  <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ease-in-out ${
                        newPassword === confirmPassword ? 'bg-green-500 w-full' : 'bg-red-500 w-full'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !oobCode}
            >
              Guardar Contrasenya
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}