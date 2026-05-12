export const MESSAGE_RETENTION_DAYS = 90;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toTimestamp(value) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  throw new TypeError('Expected a Date or timestamp number.');
}

export function getRetentionCutoffDate(now = Date.now(), retentionDays = MESSAGE_RETENTION_DAYS) {
  return new Date(toTimestamp(now) - retentionDays * MS_PER_DAY);
}

export function isConversationBeyondRetention(updatedAt, now = Date.now(), retentionDays = MESSAGE_RETENTION_DAYS) {
  return toTimestamp(updatedAt) < getRetentionCutoffDate(now, retentionDays).getTime();
}