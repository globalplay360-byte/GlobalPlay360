import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BILLING_TRIAL_DAYS,
  FOUNDING_MEMBERS_LIMIT,
  canClaimFounderAccess,
  getCheckoutSessionTrialDays,
  getPriceTrialDays,
  isTrialPrice,
  selectCheckoutPrice,
} from './billingPolicy.js';

test('getCheckoutSessionTrialDays grants the first 30-day trial', () => {
  assert.equal(getCheckoutSessionTrialDays(null), BILLING_TRIAL_DAYS);
});

test('getCheckoutSessionTrialDays removes the trial once it was consumed', () => {
  assert.equal(getCheckoutSessionTrialDays({ trialConsumedAt: '2026-05-01T10:00:00.000Z' }), null);
});

test('getPriceTrialDays reads top-level and recurring trial days', () => {
  assert.equal(getPriceTrialDays({ trial_period_days: 30 }), 30);
  assert.equal(getPriceTrialDays({ recurring: { trial_period_days: 14 } }), 14);
  assert.equal(getPriceTrialDays({}), 0);
});

test('selectCheckoutPrice returns the trial price for first-time users', () => {
  const selectedPrice = selectCheckoutPrice(
    [
      { id: 'price_standard_monthly', recurring: { trial_period_days: null } },
      { id: 'price_trial_monthly', recurring: { trial_period_days: 30 } },
    ],
    null,
    'price_standard_monthly',
  );

  assert.equal(selectedPrice?.id, 'price_trial_monthly');
  assert.equal(isTrialPrice(selectedPrice), true);
});

test('selectCheckoutPrice returns the standard price after trial was consumed', () => {
  const selectedPrice = selectCheckoutPrice(
    [
      { id: 'price_standard_monthly', recurring: { trial_period_days: null } },
      { id: 'price_trial_monthly', recurring: { trial_period_days: 30 } },
    ],
    { trialConsumedAt: '2026-05-12T10:57:22.000Z' },
    'price_standard_monthly',
  );

  assert.equal(selectedPrice?.id, 'price_standard_monthly');
  assert.equal(isTrialPrice(selectedPrice), false);
});

test('selectCheckoutPrice keeps the requested billing interval when granting a trial', () => {
  const selectedPrice = selectCheckoutPrice(
    [
      { id: 'price_standard_monthly', lookup_key: 'premium_monthly', currency: 'eur', unit_amount: 2500, recurring: { interval: 'month', interval_count: 1, trial_period_days: null } },
      { id: 'price_trial_monthly', lookup_key: 'premium_monthly_trial', currency: 'eur', unit_amount: 2500, recurring: { interval: 'month', interval_count: 1, trial_period_days: 30 } },
      { id: 'price_standard_yearly', lookup_key: 'premium_yearly', currency: 'eur', unit_amount: 25000, recurring: { interval: 'year', interval_count: 1, trial_period_days: null } },
      { id: 'price_trial_yearly', lookup_key: 'premium_yearly_trial', currency: 'eur', unit_amount: 25000, recurring: { interval: 'year', interval_count: 1, trial_period_days: 30 } },
    ],
    null,
    'price_standard_yearly',
  );

  assert.equal(selectedPrice?.id, 'price_trial_yearly');
  assert.equal(isTrialPrice(selectedPrice), true);
});

test('selectCheckoutPrice keeps the requested billing interval after trial consumption', () => {
  const selectedPrice = selectCheckoutPrice(
    [
      { id: 'price_standard_monthly', lookup_key: 'premium_monthly', currency: 'eur', unit_amount: 2500, recurring: { interval: 'month', interval_count: 1, trial_period_days: null } },
      { id: 'price_trial_monthly', lookup_key: 'premium_monthly_trial', currency: 'eur', unit_amount: 2500, recurring: { interval: 'month', interval_count: 1, trial_period_days: 30 } },
      { id: 'price_standard_yearly', lookup_key: 'premium_yearly', currency: 'eur', unit_amount: 25000, recurring: { interval: 'year', interval_count: 1, trial_period_days: null } },
      { id: 'price_trial_yearly', lookup_key: 'premium_yearly_trial', currency: 'eur', unit_amount: 25000, recurring: { interval: 'year', interval_count: 1, trial_period_days: 30 } },
    ],
    { trialConsumedAt: '2026-05-12T10:57:22.000Z' },
    'price_standard_yearly',
  );

  assert.equal(selectedPrice?.id, 'price_standard_yearly');
  assert.equal(isTrialPrice(selectedPrice), false);
});

test('selectCheckoutPrice matches yearly trial sibling by lookup_key', () => {
  const selectedPrice = selectCheckoutPrice(
    [
      { id: 'price_trial_monthly', lookup_key: 'premium_monthly_trial', currency: 'eur', unit_amount: 2500, recurring: { interval: 'month', interval_count: 1, trial_period_days: 30 } },
      { id: 'price_standard_yearly', lookup_key: 'premium_yearly', currency: 'eur', unit_amount: 25000, recurring: { interval: 'year', interval_count: 1, trial_period_days: null } },
      { id: 'price_trial_yearly', lookup_key: 'premium_yearly_trial', currency: 'eur', unit_amount: 25000, recurring: { interval: 'year', interval_count: 1, trial_period_days: 30 } },
    ],
    null,
    'price_standard_yearly',
  );

  assert.equal(selectedPrice?.id, 'price_trial_yearly');
});

test('canClaimFounderAccess allows an eligible user before the deadline', () => {
  assert.equal(
    canClaimFounderAccess({
      billingState: null,
      claimedCount: FOUNDING_MEMBERS_LIMIT - 1,
      now: new Date('2026-05-12T12:00:00.000Z'),
    }),
    true,
  );
});

test('canClaimFounderAccess rejects users who already claimed founder access', () => {
  assert.equal(
    canClaimFounderAccess({
      billingState: { founderClaimedAt: '2026-05-10T09:00:00.000Z' },
      claimedCount: 12,
      now: new Date('2026-05-12T12:00:00.000Z'),
    }),
    false,
  );
});

test('canClaimFounderAccess rejects claims after the campaign reaches capacity', () => {
  assert.equal(
    canClaimFounderAccess({
      billingState: null,
      claimedCount: FOUNDING_MEMBERS_LIMIT,
      now: new Date('2026-05-12T12:00:00.000Z'),
    }),
    false,
  );
});

test('canClaimFounderAccess rejects claims after the founder deadline', () => {
  assert.equal(
    canClaimFounderAccess({
      billingState: null,
      claimedCount: 0,
      now: new Date('2026-07-01T00:00:00.000Z'),
    }),
    false,
  );
});