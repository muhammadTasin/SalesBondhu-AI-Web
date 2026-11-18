import { describe, expect, it } from 'vitest';
import { toCsv } from '../csv';

describe('toCsv', () => {
  it('writes a header row and one row per record', () => {
    const csv = toCsv([{ a: 1, b: 'x' }, { a: 2, b: 'y' }], ['a', 'b']);
    expect(csv).toBe('﻿a,b\r\n1,x\r\n2,y\r\n');
  });
  it('quotes commas, quotes and new lines', () => {
    const csv = toCsv([{ note: 'late, "very" late\nagain' }], ['note']);
    expect(csv).toBe('﻿note\r\n"late, ""very"" late\nagain"\r\n');
  });
  it('keeps Bangla text intact (BOM so Excel opens it as UTF-8)', () => {
    const csv = toCsv([{ name: 'রহমান ট্রেডার্স' }], ['name']);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('রহমান ট্রেডার্স');
  });
});
