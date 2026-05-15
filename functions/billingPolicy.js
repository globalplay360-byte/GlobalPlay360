export const BILLING_TRIAL_DAYS = 30;
export const FOUNDING_MEMBERS_LIMIT = 100;
export const FOUNDING_MEMBERS_CAMPAIGN_ID = 'founding_members_2026';
export const FOUNDING_MEMBERS_ACCESS_END_ISO = '2026-07-01T00:00:00.000Z';

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