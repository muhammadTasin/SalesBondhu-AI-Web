import { describe, expect, it } from 'vitest';
import { decideVisit, getEvidence, setMonthlyTarget, getOfficer } from '..';

describe('visit review decisions', () => {
  it('rejecting a visit needs a reason', async () => {
    const pending = (await getEvidence()).find((v) => v.status === 'pending')!;
    await expect(decideVisit(pending.id, 'rejected', '')).rejects.toThrow(/reason/);
  });

  it('accepts once, and a decision is final', async () => {
    const pending = (await getEvidence()).find((v) => v.status === 'pending')!;
    await decideVisit(pending.id, 'accepted', '');
    const after = (await getEvidence()).find((v) => v.id === pending.id)!;
    expect(after.status).toBe('accepted');
    await expect(decideVisit(pending.id, 'rejected', 'changed my mind')).rejects.toThrow(/already decided/);
  });
});

describe('monthly targets', () => {
  it('saves a new target', async () => {
    await setMonthlyTarget('o1', 1500000);
    expect((await getOfficer('o1'))!.officer.monthTarget).toBe(1500000);
  });

  it('rejects a non-positive target', async () => {
    await expect(setMonthlyTarget('o1', 0)).rejects.toThrow();
  });
});
