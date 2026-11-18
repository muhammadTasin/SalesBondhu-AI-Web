import { describe, expect, it } from 'vitest';
import { presenceOf, summarizePresence } from '../presence';

describe('presenceOf', () => {
  it('is off duty when the officer has not started duty', () => {
    expect(presenceOf({ onDuty: false, lastSeenMin: 2 })).toBe('off_duty');
  });
  it('is live with a recent location', () => {
    expect(presenceOf({ onDuty: true, lastSeenMin: 1 })).toBe('live');
  });
  it('turns stale after a few silent minutes, then offline', () => {
    expect(presenceOf({ onDuty: true, lastSeenMin: 12 })).toBe('stale');
    expect(presenceOf({ onDuty: true, lastSeenMin: 45 })).toBe('offline');
  });
  it('is offline when on duty but never seen', () => {
    expect(presenceOf({ onDuty: true, lastSeenMin: null })).toBe('offline');
  });
});

describe('summarizePresence', () => {
  it('counts each state', () => {
    const s = summarizePresence([
      { onDuty: true, lastSeenMin: 1 },
      { onDuty: true, lastSeenMin: 2 },
      { onDuty: true, lastSeenMin: 20 },
      { onDuty: true, lastSeenMin: 90 },
      { onDuty: false, lastSeenMin: null },
    ]);
    expect(s).toEqual({ live: 2, stale: 1, offline: 1, off_duty: 1 });
  });
});
