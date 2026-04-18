import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

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
  trialPeriodDays?: number;
  allowPromotionCodes?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Client creates the doc; the Firebase extension writes back `url` (or `error`)
 * using Admin SDK. We listen for that write and resolve with the Stripe URL.
 */
export async function createCheckoutSession(
  uid: string,
  priceId: string,
  options: CheckoutSessionOptions = {},
): Promise<string> {
  const {
    trialPeriodDays = 30,
    allowPromotionCodes = true,
    successUrl = `${window.location.origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl = `${window.location.origin}/pricing?checkout=cancel`,
  } = options;

  const sessionsCol = collection(db, 'customers', uid, 'checkout_sessions');
  const sessionRef = await addDoc(sessionsCol, {
    price: priceId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    trial_period_days: trialPeriodDays,
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
