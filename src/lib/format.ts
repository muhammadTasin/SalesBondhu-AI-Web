import type { Lang } from '../i18n/lang';

const BN = '০১২৩৪৫৬৭৮৯';
export const bnDigits = (s: string) => s.replace(/[0-9]/g, (d) => BN[Number(d)]);

export function num(n: number, lang: Lang, digits = 0): string {
  const s = n.toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  return lang === 'bn' ? bnDigits(s) : s;
}

/** Taka with the South Asian grouping used on invoices: ৳১২,৩৪,৫০০ */
export const taka = (n: number, lang: Lang) => `৳${num(Math.round(n), lang)}`;

/** Compact lakh notation for headline numbers: ৳১২.৩ লাখ / ৳12.3 L */
export function lakh(n: number, lang: Lang): string {
  const v = n / 100000;
  return lang === 'bn' ? `৳${num(v, lang, 1)} লাখ` : `৳${num(v, lang, 1)} L`;
}

export const pct = (n: number, lang: Lang) => `${num(n, lang)}%`;

export function minutesAgo(min: number, lang: Lang): string {
  if (min < 1) return lang === 'bn' ? 'এইমাত্র' : 'just now';
  if (min < 60) return lang === 'bn' ? `${num(min, lang)} মিনিট আগে` : `${min} min ago`;
  const h = Math.floor(min / 60);
  return lang === 'bn' ? `${num(h, lang)} ঘণ্টা আগে` : `${h} h ago`;
}

export const clock = (d: Date, lang: Lang) => {
  const s = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return lang === 'bn' ? bnDigits(s) : s;
};

export const shortHash = (hex: string) => `${hex.slice(0, 10)}…${hex.slice(-6)}`;
