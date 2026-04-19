import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

// ── Types ───────────────────────────────────────────────

export interface StripePrice {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  interval: 'day' | 'week' | 'month' | 'year' | null;
  interval_count: number | null;
  description: string | null;
  metadata: Record<string, string>;
}

export interface StripeProduct {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  role: string | null;
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
        metadata: data.metadata ?? {},
        prices,
      };
    }),
  );
}

// ── Write: Create Checkout Session ──────────────────────

export interface CheckoutSessionOptions {
  allowPromotionCodes?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Client creates the doc; the Firebase extension writes back `url` (or `error`)
 * using Admin SDK. We listen for that write and resolve with the Stripe URL.
 *
 * El període de prova està configurat al Price de Stripe (`recurring.trial_period_days`).
 * L'extensió envia `trial_from_plan: true` a Stripe, que llegeix el trial del Price.
 */
export async function createCheckoutSession(
  uid: string,
  priceId: string,
  options: CheckoutSessionOptions = {},
): Promise<string> {
  const {
    allowPromotionCodes = true,
    successUrl = `${window.location.origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl = `${window.location.origin}/pricing?checkout=cancel`,
  } = options;

  const sessionsCol = collection(db, 'customers', uid, 'checkout_sessions');
  const sessionRef = await addDoc(sessionsCol, {
    price: priceId,
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: allowPromotionCodes,
  });

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

/**
 * Escolta en temps real la subscripció activa (trialing | active) d'un usuari.
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
    where('status', 'in', ['trialing', 'active']),
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
