import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import i18n from '@/i18n';
import type { User, UserRole } from '@/types';
import * as authService from '@/services/auth.service';
import {
  getLocalDeviceId,
  getCurrentAuthTimeSeconds,
  isSessionRevokedError,
  subscribeToAuthSession,
} from '@/services/session.service';
import { subscribeToActiveSubscription, type StripeSubscription } from '@/services/stripe.service';

export type ActivePlan = 'free' | 'premium';

interface AuthState {
  user: User | null;
  activePlan: ActivePlan;
  hasFounderAccess: boolean;
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
const SESSION_REVOKED_MESSAGE = i18n.t('authSession.revoked');

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

  if (subscription && (hasTrialAccess || hasPaidAccess)) {
    return {
      ...user,
      plan: hasTrialAccess ? 'trial' : 'premium',
      subscriptionStatus: hasTrialAccess ? 'trialing' : subscription.status,
      trialEndsAt: hasTrialAccess ? toIsoDate(subscription.trial_end_seconds, user.trialEndsAt) : '',
    };
  }

  if (!hasTrialAccess && !hasPaidAccess) {
    return {
      ...user,
      plan: 'free',
      subscriptionStatus: user.subscriptionStatus === 'none' ? 'none' : 'expired',
      trialEndsAt: '',
    };
  }

  return user;
}

function hasStripeRoleEntitlement(role: unknown): role is 'premium' | 'pro' {
  return role === 'premium' || role === 'pro';
}

function hasFounderAccessClaim(claims: Record<string, unknown> | undefined): boolean {
  if (!claims || claims.founderAccess !== true) {
    return false;
  }

  const founderAccessUntil = claims.founderAccessUntil;
  return typeof founderAccessUntil === 'number' && founderAccessUntil * 1000 > Date.now();
}

function hasStripeTrialWindow(subscription: StripeSubscription | null): boolean {
  return !!subscription?.trial_end_seconds
    && subscription.trial_end_seconds * 1000 > Date.now()
    && !subscription.cancel_at_period_end;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    activePlan: 'free',
    hasFounderAccess: false,
    subscription: null,
    subscriptionLoading: false,
    loading: true,   // starts true until onAuthStateChanged resolves
    error: null,
  });

  // Listen to Firebase Auth state — fires on page load / refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await authService.ensureSingleSession();
          const userDoc = await authService.getUserDoc(firebaseUser.uid);
          setState((s) => ({ ...s, user: userDoc, loading: false, error: null }));
        } catch (err) {
          const message = isSessionRevokedError(err)
            ? SESSION_REVOKED_MESSAGE
            : err instanceof Error
              ? err.message
              : 'No s\'ha pogut iniciar la sessió.';

          await authService.logout().catch(() => undefined);
          setState((s) => ({
            ...s,
            user: null,
            activePlan: 'free',
            hasFounderAccess: false,
            subscription: null,
            subscriptionLoading: false,
            loading: false,
            error: message,
          }));
        }
      } else {
        setState((s) => ({
          ...s,
          user: null,
          activePlan: 'free',
          hasFounderAccess: false,
          subscription: null,
          subscriptionLoading: false,
          loading: false,
          error: null,
        }));
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const uid = state.user?.uid;
    if (!uid) return;

    const unsubscribe = subscribeToAuthSession(
      uid,
      (session) => {
        if (!session?.validAfterSeconds) return;

        if (session.lastLoginDeviceId && session.lastLoginDeviceId !== getLocalDeviceId()) {
          void (async () => {
            await authService.logout().catch(() => undefined);
            setState({
              user: null,
              activePlan: 'free',
              hasFounderAccess: false,
              subscription: null,
              subscriptionLoading: false,
              loading: false,
              error: SESSION_REVOKED_MESSAGE,
            });
          })();
          return;
        }

        void (async () => {
          const authTimeSeconds = await getCurrentAuthTimeSeconds();
          if (authTimeSeconds > 0 && authTimeSeconds < session.validAfterSeconds) {
            await authService.logout().catch(() => undefined);
            setState({
              user: null,
              activePlan: 'free',
              hasFounderAccess: false,
              subscription: null,
              subscriptionLoading: false,
              loading: false,
              error: SESSION_REVOKED_MESSAGE,
            });
          }
        })();
      },
      () => undefined,
    );

    return unsubscribe;
  }, [state.user?.uid]);

  // Listen to Stripe subscription in real-time — font de veritat del pla actiu
  useEffect(() => {
    const uid = state.user?.uid;
    if (!uid) return;

    // Reinici de l'estat de càrrega en canviar d'usuari, abans de resubscriure.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ ...s, subscriptionLoading: true }));
    let lastSubStatus: string | null | undefined = undefined;
    const unsub = subscribeToActiveSubscription(
      uid,
      (sub) => {
        void (async () => {
          // Quan la subscripció apareix per primer cop o canvia d'estat, forcem
          // refresh del JWT perquè `stripeRole` quedi alineada abans d'obrir
          // superfícies protegides per Firestore rules.
          const currentStatus = sub?.status ?? null;
          const shouldRefreshToken =
            currentStatus !== null &&
            (lastSubStatus === undefined || lastSubStatus !== currentStatus);

          let stripeRole: string | null = null;
          let tokenClaims: Record<string, unknown> | undefined;
          try {
            const tokenResult = auth.currentUser
              ? await auth.currentUser.getIdTokenResult(shouldRefreshToken)
              : null;
            stripeRole = typeof tokenResult?.claims?.stripeRole === 'string'
              ? tokenResult.claims.stripeRole
              : null;
            tokenClaims = tokenResult?.claims as Record<string, unknown> | undefined;
          } catch {
            stripeRole = null;
            tokenClaims = undefined;
          }

          lastSubStatus = currentStatus;

          setState((s) => {
            const hasStripeTrialAccess = hasStripeTrialWindow(sub);

            const hasStripePaidAccess =
              sub?.status === 'active' &&
              !sub.cancel_at_period_end &&
              !hasStripeTrialAccess &&
              !!sub.current_period_end_seconds &&
              sub.current_period_end_seconds * 1000 > Date.now();

            const hasFounderAccess = hasFounderAccessClaim(tokenClaims);
            const hasClaimAccess = hasStripeRoleEntitlement(stripeRole) || hasFounderAccess;
            const computedPlan: ActivePlan = hasClaimAccess ? 'premium' : 'free';
            const mirroredUser = mirrorUserFromSubscription(s.user, sub, hasStripeTrialAccess, hasStripePaidAccess);

            return {
              ...s,
              user: mirroredUser,
              subscription: sub,
              activePlan: computedPlan,
              hasFounderAccess,
              subscriptionLoading: false,
            };
          });
        })();
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
      hasFounderAccess: false,
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

// El hook conviu amb el provider (patró de context habitual). Només afecta el
// fast-refresh en dev, no la correctesa; moure'l trencaria desenes d'imports.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
