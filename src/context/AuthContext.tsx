import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import type { User, UserRole } from '@/types';
import * as authService from '@/services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,   // starts true until onAuthStateChanged resolves
    error: null,
  });

  // Listen to Firebase Auth state — fires on page load / refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in → fetch Firestore doc
        const userDoc = await authService.getUserDoc(firebaseUser.uid);
        setState({ user: userDoc, loading: false, error: null });
      } else {
        // No user
        setState({ user: null, loading: false, error: null });
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.loginWithEmail(email, password);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string, role: UserRole = 'player') => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const user = await authService.registerWithEmail(email, password, displayName, role);
        setState({ user, loading: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async (role: UserRole = 'player') => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.loginWithGoogle(role);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, loading: false, error: null });
  }, []);

  const refreshUser = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return;
    const userDoc = await authService.getUserDoc(current.uid);
    setState((s) => ({ ...s, user: userDoc }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
