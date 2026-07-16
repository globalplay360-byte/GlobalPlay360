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

export function shouldGrantTrial(billingState) {
  return !billingState?.trialConsumedAt;
}

export function getCheckoutSessionTrialDays(billingState) {
  return shouldGrantTrial(billingState) ? BILLING_TRIAL_DAYS : null;
}

export function getPriceTrialDays(price) {
  if (!price || typeof price !== 'object') {
    return 0;
  }

  if (typeof price.trial_period_days === 'number') {
    return price.trial_period_days;
  }

  const recurringTrialDays = price.recurring?.trial_period_days;
  return typeof recurringTrialDays === 'number' ? recurringTrialDays : 0;
}

export function isTrialPrice(price) {
  return getPriceTrialDays(price) > 0;
}

function getRecurringInterval(price) {
  return price?.interval ?? price?.recurring?.interval ?? null;
}

function getRecurringIntervalCount(price) {
  return price?.interval_count ?? price?.recurring?.interval_count ?? null;
}

function getPriceLookupKey(price) {
  return typeof price?.lookup_key === 'string' ? price.lookup_key : null;
}

function sameRecurringShape(left, right) {
  return getRecurringInterval(left) === getRecurringInterval(right)
    && getRecurringIntervalCount(left) === getRecurringIntervalCount(right)
    && left?.currency === right?.currency
    && left?.unit_amount === right?.unit_amount;
}

function isTrialSiblingForRequestedPrice(candidate, requestedPrice) {
  if (!candidate || !requestedPrice || !isTrialPrice(candidate)) {
    return false;
  }

  const requestedLookupKey = getPriceLookupKey(requestedPrice);
  const candidateLookupKey = getPriceLookupKey(candidate);

  if (requestedLookupKey && candidateLookupKey === `${requestedLookupKey}_trial`) {
    return true;
  }

  return sameRecurringShape(candidate, requestedPrice);
}

export function selectCheckoutPrice(prices, billingState, fallbackPriceId = null) {
  const fallbackPrice = fallbackPriceId
    ? prices.find((price) => price.id === fallbackPriceId) ?? null
    : null;

  const siblingTrialPrice = fallbackPrice
    ? prices.find((price) => price.id !== fallbackPrice.id && isTrialSiblingForRequestedPrice(price, fallbackPrice)) ?? null
    : null;

  const siblingStandardPrice = fallbackPrice
    ? prices.find((price) => price.id !== fallbackPrice.id && !isTrialPrice(price) && sameRecurringShape(price, fallbackPrice)) ?? null
    : null;

  const trialPrice = siblingTrialPrice ?? prices.find((price) => isTrialPrice(price)) ?? null;
  const standardPrice = fallbackPrice && !isTrialPrice(fallbackPrice)
    ? fallbackPrice
    : siblingStandardPrice ?? prices.find((price) => !isTrialPrice(price)) ?? null;

  if (shouldGrantTrial(billingState) && trialPrice) {
    return trialPrice;
  }

  if (fallbackPrice) {
    return fallbackPrice;
  }

  return standardPrice ?? trialPrice ?? null;
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