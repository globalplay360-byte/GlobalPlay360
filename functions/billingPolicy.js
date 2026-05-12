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

export function selectCheckoutPrice(prices, billingState, fallbackPriceId = null) {
  const trialPrice = prices.find((price) => isTrialPrice(price)) ?? null;
  const standardPrice = prices.find((price) => !isTrialPrice(price)) ?? null;

  if (shouldGrantTrial(billingState) && trialPrice) {
    return trialPrice;
  }

  if (fallbackPriceId) {
    const fallbackPrice = prices.find((price) => price.id === fallbackPriceId) ?? null;
    if (fallbackPrice) {
      return fallbackPrice;
    }
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