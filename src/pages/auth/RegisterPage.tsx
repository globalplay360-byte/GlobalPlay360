import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('type') || 'jugador';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setStatus('error');
      setErrorMessage('Por favor, indica tu nombre completo.');
      return;
    }
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Por favor, introduce un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setStatus('loading');
    
    try {
      await register(email, password, displayName);
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Ocurrió un error al crear la cuenta. Inténtalo más tarde.');
    }
  };

  const handleGoogleLogin = async () => {
    setStatus('loading');
    try {
      console.log('Simulating Google Register...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error al registrarse con Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4 font-sans text-[#FFFFFF] py-12">
      <div className="w-full max-w-lg bg-[#111827] rounded-xl border border-[#1F2937] shadow-xl p-8 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50" />

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#0F172A] border border-[#1F2937] mb-4 hover:border-[#3B82F6] transition-colors">
            <span className="text-2xl text-[#3B82F6]"></span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Desarrolla tu carrera deportiva</h1>
          <p className="text-[#9CA3AF] text-sm">Crea tu cuenta en Global Play 360</p>
        </div>

        {status === 'error' && (
          <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-[#EF4444]">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Me uno como...</label>
            <div className="grid grid-cols-3 gap-3">
              {['jugador', 'entrenador', 'club'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all capitalize ${
                    role === r 
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]' 
                      : 'bg-[#0F172A] border-[#1F2937] text-[#9CA3AF] hover:border-[#3B82F6]/50 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="displayName">Nombre y Apellidos</label>
            <input 
              id="displayName"
              type="text" 
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder="E.g. Carlos Martínez"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="email">Correo ElectrónICO</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder="tu@email.com"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5" htmlFor="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(status==='error') setStatus('idle'); }}
              className="w-full bg-[#0F172A] border border-[#1F2937] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#4B5563]"
              placeholder=""
              disabled={status === 'loading' || status === 'success'}
            />
            <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Debe tener al menos 6 caracteres
            </p>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1D4ED8]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
               <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Registrándote...</span>
              </>
            ) : status === 'success' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                <span>¡Cuenta creada!</span>
              </>
            ) : (
              'Crear mi cuenta gratis'
            )}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1F2937]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#111827] px-4 text-[#9CA3AF]">O regístrate con</span>
          </div>
        </div>

        <div className="mt-6">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] border border-[#1F2937] text-white font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-[#9CA3AF]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">
            Iniciar sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
