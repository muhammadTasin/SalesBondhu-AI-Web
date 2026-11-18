/**
 * Officer presence, as the manager sees it.
 *
 * An on-duty officer's phone sends its location regularly. If it goes quiet for a while the
 * officer shows as "stale" (maybe in a building), and after longer as "offline". The
 * thresholds here are demo values.
 */
export type Presence = 'live' | 'stale' | 'offline' | 'off_duty';

export const STALE_AFTER_MIN = 5;
export const OFFLINE_AFTER_MIN = 30;

export interface PresenceInput {
  onDuty: boolean;
  /** Minutes since the last location reached the server; null if never today. */
  lastSeenMin: number | null;
}

export function presenceOf({ onDuty, lastSeenMin }: PresenceInput): Presence {
  if (!onDuty) return 'off_duty';
  if (lastSeenMin === null || lastSeenMin >= OFFLINE_AFTER_MIN) return 'offline';
  if (lastSeenMin >= STALE_AFTER_MIN) return 'stale';
  return 'live';
}

export function summarizePresence(list: PresenceInput[]): Record<Presence, number> {
  const out: Record<Presence, number> = { live: 0, stale: 0, offline: 0, off_duty: 0 };
  for (const o of list) out[presenceOf(o)]++;
  return out;
}
