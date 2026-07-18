/**
 * QA dades Firestore: productes/preus actius i selecció per segment
 * (mateixa lògica que PricingPage, sense UI).
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

function loadEnv() {
  const raw = readFileSync('.env', 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function getSegment(data) {
  const nested = data.metadata?.segment;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  const flat = data.stripe_metadata_segment;
  return typeof flat === 'string' && flat.trim() ? flat.trim() : null;
}

function pickPrices(prices) {
  const active = prices.filter((p) => p.active !== false);
  return {
    month: active.find((p) => p.interval === 'month') ?? null,
    year: active.find((p) => p.interval === 'year') ?? null,
  };
}

async function main() {
  const env = loadEnv();
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  const db = getFirestore(app);

  const productsSnap = await getDocs(query(collection(db, 'products'), where('active', '==', true)));
  const products = [];

  for (const productDoc of productsSnap.docs) {
    const data = productDoc.data();
    const pricesSnap = await getDocs(
      query(collection(db, 'products', productDoc.id, 'prices'), where('active', '==', true)),
    );
    const prices = pricesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    products.push({
      id: productDoc.id,
      name: data.name,
      role: data.role ?? null,
      segment: getSegment(data),
      prices: pickPrices(prices),
      priceCount: prices.length,
      amounts: prices.map((p) => ({
        id: p.id,
        interval: p.interval,
        unit_amount: p.unit_amount,
        description: p.description ?? null,
      })),
    });
  }

  const premium = products.filter((p) => p.role === 'premium');
  const forSegment = (segment) =>
    premium.find((p) => p.segment === segment)
    ?? premium.find((p) => p.segment == null)
    ?? premium[0]
    ?? null;

  const individual = forSegment('individual');
  const club = forSegment('club');

  const checks = {
    twoPremiumSegments: premium.filter((p) => p.segment === 'individual' || p.segment === 'club').length >= 2,
    individualMonth999: individual?.prices.month?.unit_amount === 999,
    individualYear9999: individual?.prices.year?.unit_amount === 9999,
    clubMonth2499: club?.prices.month?.unit_amount === 2499,
    clubYear24999: club?.prices.year?.unit_amount === 24999,
    noCrossContamination: individual?.id !== club?.id,
  };

  const pass = Object.values(checks).every(Boolean);
  console.log(JSON.stringify({ pass, checks, individual, club, allPremium: premium }, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
