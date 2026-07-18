import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';

export const FOUNDING_MEMBERS_CAMPAIGN_ID = 'founding_members_2026';

// ── Types ───────────────────────────────────────────────

export interface StripePrice {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  interval: 'day' | 'week' | 'month' | 'year' | null;
  interval_count: number | null;
  trial_period_days: number | null;
  description: string | null;
  metadata: Record<string, string>;
}

export interface StripeProduct {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  role: string | null;
  segment: string | null;
  metadata: Record<string, string>;
  prices: StripePrice[];
}

export type StripeSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid';

export interface StripeSubscription {
  id: string;
  status: StripeSubscriptionStatus;
  cancel_at_period_end: boolean;
  current_period_end_seconds: number | null;
  trial_end_seconds: number | null;
  price_id: string | null;
  product_id: string | null;
  role: string | null;
  metadata: Record<string, string>;
}

export interface BillingState {
  trialConsumedAt: number | null;
  founderClaimedAt: number | null;
  founderClaimNumber: number | null;
  founderCampaignId: string | null;
  founderAccessUntilSeconds: number | null;
}

export interface FounderCampaign {
  id: string;
  active: boolean;
  claimedCount: number;
  maxClaims: number;
  remainingClaims: number;
  accessEndsAtSeconds: number | null;
}

export interface ClaimFounderAccessResult {
  alreadyClaimed: boolean;
  claimNumber: number | null;
  remainingClaims: number;
  accessEndsAt: string;
}

// ── Read: Products + Prices ─────────────────────────────

export async function listActiveProductsWithPrices(): Promise<StripeProduct[]> {
  const productsQ = query(collection(db, 'products'), where('active', '==', true));
  const productsSnap = await getDocs(productsQ);

  return Promise.all(
    productsSnap.docs.map(async (productDoc) => {
      const data = productDoc.data();
      const pricesQ = query(
        collection(db, 'products', productDoc.id, 'prices'),
        where('active', '==', true),
      );
      const pricesSnap = await getDocs(pricesQ);
      const prices: StripePrice[] = pricesSnap.docs.map((priceDoc) => {
        const p = priceDoc.data();
        return {
          id: priceDoc.id,
          productId: productDoc.id,
          active: p.active ?? false,
          currency: p.currency ?? 'eur',
          unit_amount: p.unit_amount ?? 0,
          interval: p.interval ?? null,
          interval_count: p.interval_count ?? null,
          trial_period_days: getPriceTrialDays(p),
          description: p.description ?? null,
          metadata: p.metadata ?? {},
        };
      });
      return {
        id: productDoc.id,
        active: data.active ?? false,
        name: data.name ?? '',
        description: data.description ?? null,
        role: data.role ?? null,
        segment: getProductSegment(data),
        metadata: data.metadata ?? {},
        prices,
      };
    }),
  );
}

// ── Write: Create Checkout Session ──────────────────────

export interface CheckoutSessionOptions {
  allowPromotionCodes?: boolean;
  productId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

function getPriceTrialDays(data: Record<string, unknown>): number | null {
  const topLevelTrialDays = toNumber(data.trial_period_days);
  if (topLevelTrialDays !== null) {
    return topLevelTrialDays;
  }

  const recurring = data.recurring;
  if (typeof recurring === 'object' && recurring !== null && 'trial_period_days' in recurring) {
    return toNumber((recurring as { trial_period_days: unknown }).trial_period_days);
  }

  return null;
}

export function isTrialStripePrice(price: StripePrice): boolean {
  return (price.trial_period_days ?? 0) > 0;
}

// Segment del Product (individual|club). L'extensió aplana la metadata de
// Stripe com `stripe_metadata_<clau>`; acceptem també `metadata.segment` per
// robustesa davant de canvis de versió de l'extensió.
function getProductSegment(data: Record<string, unknown>): string | null {
  const nested = (data.metadata as Record<string, unknown> | undefined)?.segment;
  if (typeof nested === 'string' && nested.trim() !== '') {
    return nested.trim();
  }
  const flattened = data.stripe_metadata_segment;
  return typeof flattened === 'string' && flattened.trim() !== ''
    ? flattened.trim()
    : null;
}

/**
 * The app now asks our callable backend to create the checkout document so the
 * trial decision is server-side and can't be bypassed from the browser.
 */
export async function createCheckoutSession(
  uid: string,
  priceId: string,
  options: CheckoutSessionOptions = {},
): Promise<string> {
  const {
    productId,
    successUrl = `${window.location.origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl = `${window.location.origin}/pricing?checkout=cancel`,
  } = options;

  if (!productId) {
    throw new Error('Missing productId for checkout session creation.');
  }

  const fn = httpsCallable<
    { priceId: string; productId: string; successUrl: string; cancelUrl: string },
    { sessionId: string; trialGranted: boolean }
  >(functions, 'createBillingCheckoutSession');
  const { data } = await fn({
    priceId,
    productId,
    successUrl,
    cancelUrl,
  });
  const sessionRef = doc(db, 'customers', uid, 'checkout_sessions', data.sessionId);

  return new Promise((resolve, reject) => {
    const unsub = onSnapshot(
      sessionRef,
      (snap) => {
        const data = snap.data();
        if (!data) return;
        const { error, url } = data as { error?: { message?: string }; url?: string };
        if (error) {
          unsub();
          reject(new Error(error.message ?? 'Stripe returned an error'));
          return;
        }
        if (url) {
          unsub();
          resolve(url);
        }
      },
      (err) => {
        unsub();
        reject(err);
      },
    );
  });
}

// ── Write: Create Customer Portal Session ───────────────

/**
 * Redirigeix l'usuari al Customer Portal de Stripe on pot gestionar la seva
 * subscripció (cancel·lar, actualitzar mètode de pagament, veure factures).
 *
 * L'extensió firestore-stripe-payments exposa una Cloud Function callable
 * `ext-firestore-stripe-payments-createPortalLink` que retorna directament la URL
 * signada del portal. No usa el patró de `portal_sessions` + onSnapshot.
 */
export async function createPortalSession(
  returnUrl: string = `${window.location.origin}/dashboard/billing`,
): Promise<string> {
  const fn = httpsCallable<
    { returnUrl: string; locale?: string },
    { url: string }
  >(functions, 'ext-firestore-stripe-payments-createPortalLink');
  const { data } = await fn({ returnUrl, locale: 'auto' });
  return data.url;
}

export async function claimFounderAccess(): Promise<ClaimFounderAccessResult> {
  const fn = httpsCallable<Record<string, never>, ClaimFounderAccessResult>(functions, 'claimFounderAccess');
  const { data } = await fn({});
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
  return data;
}

// ── Subscriptions: real-time listener ───────────────────

function toSeconds(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const s = (value as { seconds: unknown }).seconds;
    return typeof s === 'number' ? s : null;
  }
  return null;
}

function toRefId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

export function subscribeToBillingState(
  uid: string,
  callback: (state: BillingState | null) => void,
  onError?: (err: Error) => void,
): () => void {
  const billingStateRef = doc(db, 'billing_state', uid);
  return onSnapshot(
    billingStateRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }

      const data = snap.data();
      callback({
        trialConsumedAt: toSeconds(data.trialConsumedAt),
        founderClaimedAt: toSeconds(data.founderClaimedAt),
        founderClaimNumber: toNumber(data.founderClaimNumber),
        founderCampaignId: typeof data.founderCampaignId === 'string' ? data.founderCampaignId : null,
        founderAccessUntilSeconds: toSeconds(data.founderAccessUntil),
      });
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

export function subscribeToFounderCampaign(
  callback: (campaign: FounderCampaign) => void,
  onError?: (err: Error) => void,
): () => void {
  const campaignRef = doc(db, 'campaigns', FOUNDING_MEMBERS_CAMPAIGN_ID);
  return onSnapshot(
    campaignRef,
    (snap) => {
      if (!snap.exists()) {
        callback({
          id: FOUNDING_MEMBERS_CAMPAIGN_ID,
          active: true,
          claimedCount: 0,
          maxClaims: 100,
          remainingClaims: 100,
          accessEndsAtSeconds: null,
        });
        return;
      }

      const data = snap.data();
      const maxClaims = toNumber(data.maxClaims) ?? 100;
      const claimedCount = toNumber(data.claimedCount) ?? 0;
      const remainingClaims = toNumber(data.remainingClaims) ?? Math.max(maxClaims - claimedCount, 0);

      callback({
        id: snap.id,
        active: data.active !== false,
        claimedCount,
        maxClaims,
        remainingClaims,
        accessEndsAtSeconds: toSeconds(data.accessEndsAt),
      });
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

/** Subscripció que encara cal gestionar a Billing/Portal (impagament). */
export function subscriptionNeedsPaymentAttention(
  sub: Pick<StripeSubscription, 'status'> | null | undefined,
): boolean {
  return sub?.status === 'past_due' || sub?.status === 'unpaid';
}

/**
 * Escolta en temps real la subscripció rellevant d'un usuari
 * (trialing | active | past_due | unpaid).
 * Incloem past_due/unpaid perquè l'usuari pugui obrir el Customer Portal
 * i actualitzar la targeta (si només filtrem trialing/active, Billing el perd).
 * L'extensió escriu aquesta col·lecció via webhook, amb `price` i `product` com a
 * DocumentReference, per això els normalitzem a string id.
 */
export function subscribeToActiveSubscription(
  uid: string,
  callback: (sub: StripeSubscription | null) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(
    collection(db, 'customers', uid, 'subscriptions'),
    where('status', 'in', ['trialing', 'active', 'past_due', 'unpaid']),
    limit(1),
  );
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        callback(null);
        return;
      }
      const docSnap = snap.docs[0];
      const d = docSnap.data();
      callback({
        id: docSnap.id,
        status: d.status as StripeSubscriptionStatus,
        cancel_at_period_end: Boolean(d.cancel_at_period_end),
        current_period_end_seconds: toSeconds(d.current_period_end),
        trial_end_seconds: toSeconds(d.trial_end),
        price_id: toRefId(d.price),
        product_id: toRefId(d.product),
        role: typeof d.role === 'string' ? d.role : null,
        metadata: d.metadata ?? {},
      });
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}
