import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BILLING_TRIAL_DAYS,
  CLUB_SEGMENT,
  FOUNDING_MEMBERS_LIMIT,
  INDIVIDUAL_SEGMENT,
  canClaimFounderAccess,
  getCheckoutSessionTrialDays,
  getExpectedSegmentForRole,
  getProductSegment,
  isBlockingSubscriptionStatus,
  shouldGrantTrial,
} from './billingPolicy.js';

test('getCheckoutSessionTrialDays grants the first 30-day trial', () => {
  assert.equal(getCheckoutSessionTrialDays(null), BILLING_TRIAL_DAYS);
});

test('getCheckoutSessionTrialDays removes the trial once it was consumed', () => {
  assert.equal(getCheckoutSessionTrialDays({ trialConsumedAt: '2026-05-01T10:00:00.000Z' }), null);
});

test('shouldGrantTrial reflects whether the trial was already consumed', () => {
  assert.equal(shouldGrantTrial(null), true);
  assert.equal(shouldGrantTrial({}), true);
  assert.equal(shouldGrantTrial({ trialConsumedAt: '2026-05-01T10:00:00.000Z' }), false);
});

test('getExpectedSegmentForRole maps player and coach to the individual segment', () => {
  assert.equal(getExpectedSegmentForRole('player'), INDIVIDUAL_SEGMENT);
  assert.equal(getExpectedSegmentForRole('coach'), INDIVIDUAL_SEGMENT);
});

test('getExpectedSegmentForRole maps club to the club segment', () => {
  assert.equal(getExpectedSegmentForRole('club'), CLUB_SEGMENT);
});

test('getExpectedSegmentForRole rejects admin and unknown roles', () => {
  assert.equal(getExpectedSegmentForRole('admin'), null);
  assert.equal(getExpectedSegmentForRole(undefined), null);
  assert.equal(getExpectedSegmentForRole(''), null);
});

test('getProductSegment reads nested and flattened extension metadata', () => {
  assert.equal(getProductSegment({ metadata: { segment: 'club' } }), 'club');
  assert.equal(getProductSegment({ stripe_metadata_segment: 'individual' }), 'individual');
  assert.equal(getProductSegment({ metadata: { segment: ' club ' } }), 'club');
});

test('getProductSegment returns null when the product has no segment metadata', () => {
  assert.equal(getProductSegment({}), null);
  assert.equal(getProductSegment({ metadata: {} }), null);
  assert.equal(getProductSegment(null), null);
});

test('isBlockingSubscriptionStatus blocks live subscriptions including past_due', () => {
  assert.equal(isBlockingSubscriptionStatus('trialing'), true);
  assert.equal(isBlockingSubscriptionStatus('active'), true);
  assert.equal(isBlockingSubscriptionStatus('past_due'), true);
});

test('isBlockingSubscriptionStatus lets canceled and incomplete subscriptions retry', () => {
  assert.equal(isBlockingSubscriptionStatus('canceled'), false);
  assert.equal(isBlockingSubscriptionStatus('incomplete'), false);
  assert.equal(isBlockingSubscriptionStatus('incomplete_expired'), false);
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