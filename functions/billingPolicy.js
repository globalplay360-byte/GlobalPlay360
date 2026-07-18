export const BILLING_TRIAL_DAYS = 30;
export const FOUNDING_MEMBERS_LIMIT = 100;
export const FOUNDING_MEMBERS_CAMPAIGN_ID = 'founding_members_2026';
export const FOUNDING_MEMBERS_ACCESS_END_ISO = '2026-07-01T00:00:00.000Z';

// ── Pricing per segments ─────────────────────────────────
// Cada Product de Stripe porta metadata `segment` que determina quin rol
// d'usuari pot comprar-lo. El rol es llegeix SEMPRE del doc users/{uid}
// server-side, mai del payload del client.
export const INDIVIDUAL_SEGMENT = 'individual';
export const CLUB_SEGMENT = 'club';

// Estats de subscripció que bloquegen la creació d'una segona checkout
// session. Inclou `past_due` a consciència: una subscripció impagada segueix
// viva (smart retries) i crear-ne una segona duplicaria el cobrament quan es
// recuperés. `incomplete` NO s'hi inclou: bloquejaria el reintent d'un usuari
// que ha abandonat el 3DS inicial (caduca sola a les 23 h).
export const BLOCKING_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due'];

export function getExpectedSegmentForRole(role) {
  if (role === 'club') return CLUB_SEGMENT;
  if (role === 'player' || role === 'coach') return INDIVIDUAL_SEGMENT;
  return null;
}

// L'extensió firestore-stripe-payments aplana la metadata de Stripe com a
// camps `stripe_metadata_<clau>`; acceptem també `metadata.segment` per
// robustesa davant de canvis de versió de l'extensió.
export function getProductSegment(product) {
  if (!product || typeof product !== 'object') {
    return null;
  }

  const nested = product.metadata?.segment;
  if (typeof nested === 'string' && nested.trim() !== '') {
    return nested.trim();
  }

  const flattened = product.stripe_metadata_segment;
  return typeof flattened === 'string' && flattened.trim() !== ''
    ? flattened.trim()
    : null;
}

export function isBlockingSubscriptionStatus(status) {
  return BLOCKING_SUBSCRIPTION_STATUSES.includes(status);
}

export function getFoundingMembersAccessEndDate() {
  return new Date(FOUNDING_MEMBERS_ACCESS_END_ISO);
}

// Política 1-trial-per-usuari: el trial es concedeix un sol cop. El consum
// es marca a `billing_state.trialConsumedAt` quan la subscripció entra en
// finestra de trial (syncBillingStateFromSubscription).
export function shouldGrantTrial(billingState) {
  return !billingState?.trialConsumedAt;
}

// Dies de trial a passar a la checkout session (via l'extensió,
// `trial_period_days`). null = sense trial. El trial ja NO viu en preus
// dedicats: s'aplica a nivell de checkout, que és la via oficial de Stripe.
export function getCheckoutSessionTrialDays(billingState) {
  return shouldGrantTrial(billingState) ? BILLING_TRIAL_DAYS : null;
}

export function canClaimFounderAccess({
  billingState,
  claimedCount = 0,
  maxClaims = FOUNDING_MEMBERS_LIMIT,
  now = new Date(),
}) {
  if (billingState?.founderClaimedAt) {
    return false;
  }

  if (claimedCount >= maxClaims) {
    return false;
  }

  return now.getTime() < getFoundingMembersAccessEndDate().getTime();
}