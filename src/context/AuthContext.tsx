import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import * as authService from '@/services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.loginWithEmail(email, password);
      setState({ user, loading: false, error: null });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Login failed' }));
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const user = await authService.registerWithEmail(email, password, displayName);
        setState({ user, loading: false, error: null });
      } catch {
        setState((s) => ({ ...s, loading: false, error: 'Registration failed' }));
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.loginWithGoogle();
      setState({ user, loading: false, error: null });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Google login failed' }));
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
