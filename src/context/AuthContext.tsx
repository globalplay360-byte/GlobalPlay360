import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
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

function toIsoDate(seconds: number | null | undefined, fallback: string): string {
  if (!seconds) return fallback;
  return new Date(seconds * 1000).toISOString();
}

function mirrorUserFromSubscription(
  user: User | null,
  subscription: StripeSubscription | null,
  hasTrialAccess: boolean,
  hasPaidAccess: boolean,
): User | null {
  if (!user) return null;

  if (subscription) {
    return {
      ...user,
      plan: subscription.status === 'trialing' ? 'trial' : 'premium',
      subscriptionStatus: subscription.status,
      trialEndsAt: toIsoDate(subscription.trial_end_seconds, user.trialEndsAt),
    };
  }

  if (!hasTrialAccess && !hasPaidAccess) {
    return {
      ...user,
      plan: 'free',
      subscriptionStatus: user.subscriptionStatus === 'none' ? 'none' : 'expired',
    };
  }

  return user;
}

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
    let lastSubStatus: string | null | undefined = undefined;
    const unsub = subscribeToActiveSubscription(
      uid,
      (sub) => {
        // Quan la subscripció apareix/desapareix/canvia d'estat, forcem refresh
        // del JWT perquè l'extensió Stripe acaba d'escriure/treure la custom claim
        // `stripeRole`. Sense això, les Firestore rules bloquejarien missatgeria
        // fins que l'usuari tanqués i tornés a obrir sessió.
        const currentStatus = sub?.status ?? null;
        if (lastSubStatus !== undefined && lastSubStatus !== currentStatus) {
          auth.currentUser?.getIdToken(true).catch(() => { /* silent */ });
        }
        lastSubStatus = currentStatus;

        setState((s) => {
          const hasStripeTrialAccess = sub?.status === 'trialing' && !!sub.trial_end_seconds && sub.trial_end_seconds * 1000 > Date.now();

          const hasProfileTrialAccess =
            !sub &&
            !!s.user &&
            (s.user.plan === 'trial' || s.user.subscriptionStatus === 'trialing') &&
            !!s.user.trialEndsAt &&
            new Date(s.user.trialEndsAt).getTime() > Date.now();

          const hasTrialAccess = hasStripeTrialAccess || hasProfileTrialAccess;

          const hasPaidAccess =
            sub?.status === 'active' ||
            s.user?.plan === 'pro';

          const computedPlan: ActivePlan = hasPaidAccess || hasTrialAccess ? 'premium' : 'free';
          const mirroredUser = mirrorUserFromSubscription(s.user, sub, hasTrialAccess, hasPaidAccess);

          return {
            ...s,
            user: mirroredUser,
            subscription: sub,
            activePlan: computedPlan,
            subscriptionLoading: false,
          };
        });
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

  // Memoritzem el value perquè els consumidors només es re-renderin quan
  // canvia algun camp d'`state`, no a cada render del provider. Els callbacks
  // ja són estables via useCallback, així que no entren a les deps.
  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, loginWithGoogle, logout, refreshUser }),
    [state, login, register, loginWithGoogle, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
