import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { resetPassword } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'auth/user-not-found' || (err as any).code === 'auth/invalid-email') {
        setError('No s\'ha trobat cap compte amb aquest correu.');
      } else {
        setError('Hi ha hagut un error en processar la petició. Intenta-ho més tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] rounded-xl border border-[#1F2937] p-6 sm:p-8 shadow-xl shadow-black/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Recuperar Contrasenya
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Introdueix el teu correu i t'enviarem un enllaç per restablir-la.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-500/10 text-[#10B981] border border-green-500/20 rounded-lg">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-lg">Correu enviat</p>
              <p className="text-sm mt-1">
                Revisa la teva safata d'entrada (també la carpeta d'Spam) per continuar.
              </p>
            </div>
            <Link to="/login" className="block text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium transition-colors">
              Tornar a l'inici de sessió
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-[#EF4444] text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9CA3AF] mb-1">
                Correu electrònic
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-2 bg-[#0F172A] border border-[#1F2937] rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex. joan@exemple.cat"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              Crea una nova contrasenya
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
                Recordes la contrasenya? <span className="text-[#3B82F6]">{t('forgotPassword.loginLink', 'Inicia sessió')}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}