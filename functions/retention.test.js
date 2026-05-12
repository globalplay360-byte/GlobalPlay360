import test from 'node:test';
import assert from 'node:assert/strict';
import { MESSAGE_RETENTION_DAYS, getRetentionCutoffDate, isConversationBeyondRetention } from './retention.js';

test('getRetentionCutoffDate returns a point exactly 90 days in the past', () => {
  const now = new Date('2026-05-12T12:00:00.000Z');
  const cutoff = getRetentionCutoffDate(now);

  assert.equal(now.getTime() - cutoff.getTime(), MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
});

test('isConversationBeyondRetention keeps conversations exactly on the 90-day boundary', () => {
  const now = new Date('2026-05-12T12:00:00.000Z');
  const cutoff = getRetentionCutoffDate(now);

  assert.equal(isConversationBeyondRetention(cutoff, now), false);
});

test('isConversationBeyondRetention deletes conversations older than the 90-day cutoff', () => {
  const now = new Date('2026-05-12T12:00:00.000Z');
  const cutoff = getRetentionCutoffDate(now);
  const staleConversation = new Date(cutoff.getTime() - 1);

  assert.equal(isConversationBeyondRetention(staleConversation, now), true);
});

test('isConversationBeyondRetention keeps recent conversations', () => {
  const now = new Date('2026-05-12T12:00:00.000Z');
  const recentConversation = new Date('2026-04-30T12:00:00.000Z');

  assert.equal(isConversationBeyondRetention(recentConversation, now), false);
});