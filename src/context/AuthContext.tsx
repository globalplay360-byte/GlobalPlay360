import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import type { User, UserRole } from '@/types';
import * as authService from '@/services/auth.service';
import { subscribeToActiveSubscription, type StripeSubscription } from '@/services/stripe.service';

export type ActivePlan = 'free' | 'premium';

interface AuthState {
  user: User | null;
  activePlan: ActivePlan;
  subscription: StripeSubscription | null;
  subscriptionLoading: boolean;
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
    activePlan: 'free',
    subscription: null,
    subscriptionLoading: false,
    loading: true,   // starts true until onAuthStateChanged resolves
    error: null,
  });

  // Listen to Firebase Auth state — fires on page load / refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await authService.getUserDoc(firebaseUser.uid);
        setState((s) => ({ ...s, user: userDoc, loading: false, error: null }));
      } else {
        setState((s) => ({
          ...s,
          user: null,
          activePlan: 'free',
          subscription: null,
          subscriptionLoading: false,
          loading: false,
          error: null,
        }));
      }
    });
    return unsubscribe;
  }, []);

  // Listen to Stripe subscription in real-time — font de veritat del pla actiu
  useEffect(() => {
    const uid = state.user?.uid;
    if (!uid) return;

    setState((s) => ({ ...s, subscriptionLoading: true }));
    const unsub = subscribeToActiveSubscription(
      uid,
      (sub) => {
        setState((s) => ({
          ...s,
          subscription: sub,
          activePlan: sub ? 'premium' : 'free',
          subscriptionLoading: false,
        }));
      },
      () => {
        setState((s) => ({ ...s, subscriptionLoading: false }));
      },
    );
    return unsub;
  }, [state.user?.uid]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.loginWithEmail(email, password);
      setState((s) => ({ ...s, user, loading: false, error: null }));
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
        setState((s) => ({ ...s, user, loading: false, error: null }));
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
      setState((s) => ({ ...s, user, loading: false, error: null }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({
      user: null,
      activePlan: 'free',
      subscription: null,
      subscriptionLoading: false,
      loading: false,
      error: null,
    });
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
