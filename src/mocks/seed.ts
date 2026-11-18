/**
 * Deterministic mock world for the showcase console.
 *
 * Everything here is invented: officers, dealers, amounts and photos. A fixed seed keeps
 * the numbers stable between reloads and screenshots; times are relative to "now" so the
 * console always looks like a live working day.
 */

export type Territory = 'dhaka-north' | 'dhaka-south' | 'gazipur';

export const TERRITORIES: Record<Territory, { en: string; bn: string }> = {
  'dhaka-north': { en: 'Dhaka North', bn: 'ঢাকা উত্তর' },
  'dhaka-south': { en: 'Dhaka South', bn: 'ঢাকা দক্ষিণ' },
  gazipur: { en: 'Gazipur', bn: 'গাজীপুর' },
};

export interface Officer {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  territory: Territory;
  onDuty: boolean;
  lastSeenMin: number | null;
  visitsDone: number;
  visitsPlanned: number;
  collectedToday: number;
  monthTarget: number;
  monthAchieved: number;
  monthCollected: number;
  gpsMatchPct: number;
  /** Position on the stylised map, 0–100. */
  x: number;
  y: number;
}

export interface Dealer {
  id: string;
  name: string;
  nameBn: string;
  territory: Territory;
  due: number;
  x: number;
  y: number;
}

export type ReviewStatus = 'pending' | 'accepted' | 'rejected';
export type EvidenceFlag = 'outside_area' | 'low_accuracy' | null;

export interface VisitEvidence {
  id: string;
  officerId: string;
  dealerId: string;
  at: Date;
  distanceM: number;
  gpsAccuracyM: number;
  photoSha256: string;
  orderAmount: number;
  collection: number;
  competitorNote: string | null;
  flag: EvidenceFlag;
  status: ReviewStatus;
  note?: string;
}

export type AlertType = 'gps_mismatch' | 'dues' | 'tracking' | 'sales_drop';

export interface RiskAlert {
  id: string;
  type: AlertType;
  officerId: string;
  dealerId?: string;
  at: Date;
  en: string;
  bn: string;
}

export interface SosEvent {
  id: string;
  officerId: string;
  startedAt: Date;
  status: 'open' | 'safe_confirmed' | 'closed';
  signal: 'live' | 'delayed';
  closedAt?: Date;
}

export interface TargetChange {
  officerId: string;
  at: Date;
  from: number;
  to: number;
}

// ---------------------------------------------------------------- deterministic random
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261118);
const between = (a: number, b: number) => Math.round(a + rand() * (b - a));
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
const hex64 = () => Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join('');
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000);

// ---------------------------------------------------------------- officers
const OFFICER_NAMES: [string, string, Territory][] = [
  ['Rahim Ahmed', 'রহিম আহমেদ', 'dhaka-south'],
  ['Kamrul Islam', 'কামরুল ইসলাম', 'dhaka-south'],
  ['Arif Rahman', 'আরিফ রহমান', 'dhaka-north'],
  ['Nusrat Jahan', 'নুসরাত জাহান', 'dhaka-north'],
  ['Tanvir Hossain', 'তানভীর হোসেন', 'dhaka-north'],
  ['Farhana Akter', 'ফারহানা আক্তার', 'gazipur'],
  ['Sabbir Khan', 'সাব্বির খান', 'gazipur'],
  ['Mehedi Hasan', 'মেহেদী হাসান', 'dhaka-south'],
  ['Sumaiya Noor', 'সুমাইয়া নূর', 'gazipur'],
  ['Imran Kabir', 'ইমরান কবির', 'dhaka-north'],
];

// map regions (rough boxes on the 0–100 canvas)
const REGION: Record<Territory, { x: [number, number]; y: [number, number] }> = {
  'dhaka-north': { x: [44, 78], y: [16, 42] },
  'dhaka-south': { x: [40, 74], y: [60, 88] },
  gazipur: { x: [9, 31], y: [15, 60] },
};
const inRegion = (t: Territory) => ({ x: between(REGION[t].x[0], REGION[t].x[1]), y: between(REGION[t].y[0], REGION[t].y[1]) });

const lastSeenPattern: (number | null)[] = [1, 2, 0, 3, 14, 1, 48, 2, null, 4];

export const officers: Officer[] = OFFICER_NAMES.map(([name, nameBn, territory], i) => {
  const planned = between(9, 14);
  const done = Math.min(planned, between(2, planned));
  const target = pick([800000, 900000, 1000000, 1200000]);
  const onDuty = i !== 8;
  return {
    id: `o${i + 1}`,
    code: `SO-${String(101 + i).padStart(4, '0')}`,
    name,
    nameBn,
    territory,
    onDuty,
    lastSeenMin: onDuty ? lastSeenPattern[i] : null,
    visitsDone: onDuty ? done : 0,
    visitsPlanned: planned,
    collectedToday: onDuty ? between(0, 9) * 5000 : 0,
    monthTarget: target,
    monthAchieved: Math.round(target * (0.35 + rand() * 0.55)),
    monthCollected: between(18, 60) * 10000,
    gpsMatchPct: between(72, 99),
    ...inRegion(territory),
  };
});

// ---------------------------------------------------------------- dealers
const DEALER_NAMES: [string, string][] = [
  ['Rahman Traders', 'রহমান ট্রেডার্স'],
  ['Karim Paint House', 'করিম পেইন্ট হাউস'],
  ['Modern Hardware', 'মডার্ন হার্ডওয়্যার'],
  ['New Era Paints', 'নিউ এরা পেইন্টস'],
  ['Badda Hardware', 'বাড্ডা হার্ডওয়্যার'],
  ['Mirpur Paint Market', 'মিরপুর পেইন্ট মার্কেট'],
  ['Green Line Hardware', 'গ্রিন লাইন হার্ডওয়্যার'],
  ['Shapla Color Center', 'শাপলা কালার সেন্টার'],
  ['Unique Paint Store', 'ইউনিক পেইন্ট স্টোর'],
  ['Nabil Enterprise', 'নাবিল এন্টারপ্রাইজ'],
  ['City Hardware', 'সিটি হার্ডওয়্যার'],
  ['Ruposhi Paints', 'রূপসী পেইন্টস'],
  ['Al Madina Traders', 'আল মদিনা ট্রেডার্স'],
  ['Tongi Color House', 'টঙ্গী কালার হাউস'],
  ['Sonali Hardware', 'সোনালী হার্ডওয়্যার'],
  ['Dhanmondi Paints', 'ধানমন্ডি পেইন্টস'],
  ['Joy Hardware', 'জয় হার্ডওয়্যার'],
  ['Notun Bazar Paints', 'নতুন বাজার পেইন্টস'],
  ['Ma Enterprise', 'মা এন্টারপ্রাইজ'],
  ['Shah Paint Corner', 'শাহ পেইন্ট কর্নার'],
  ['Bhai Bhai Traders', 'ভাই ভাই ট্রেডার্স'],
  ['Probashi Hardware', 'প্রবাসী হার্ডওয়্যার'],
  ['Lal Sobuj Paints', 'লাল সবুজ পেইন্টস'],
  ['Ekota Color Mart', 'একতা কালার মার্ট'],
];
const TERR_ORDER: Territory[] = ['dhaka-south', 'dhaka-north', 'gazipur'];

export const dealers: Dealer[] = DEALER_NAMES.map(([name, nameBn], i) => {
  const territory = TERR_ORDER[i % 3];
  return { id: `d${i + 1}`, name, nameBn, territory, due: between(0, 40) * 5000, ...inRegion(territory) };
});

// ---------------------------------------------------------------- visit evidence (today)
const COMPETITOR_NOTES = [
  'Competitor running a 5% cash discount this week',
  'Dealer asked for more shade cards',
  null,
  'New competitor stockist opened next door',
  null,
];

export const evidence: VisitEvidence[] = Array.from({ length: 18 }, (_, i) => {
  const officer = officers[i % officers.length];
  const local = dealers.filter((d) => d.territory === officer.territory);
  const dealer = local[i % local.length];
  const flag: EvidenceFlag = i % 6 === 2 ? 'outside_area' : i % 7 === 4 ? 'low_accuracy' : null;
  return {
    id: `v${i + 1}`,
    officerId: officer.id,
    dealerId: dealer.id,
    at: minutesAgo(15 + i * 23),
    distanceM: flag === 'outside_area' ? between(420, 1600) : between(4, 60),
    gpsAccuracyM: flag === 'low_accuracy' ? between(60, 140) : between(4, 18),
    photoSha256: hex64(),
    orderAmount: between(0, 12) * 2500,
    collection: between(0, 8) * 5000,
    competitorNote: COMPETITOR_NOTES[i % COMPETITOR_NOTES.length],
    flag,
    status: i < 11 ? 'pending' : i % 3 === 0 ? 'rejected' : 'accepted',
  };
});

// ---------------------------------------------------------------- risk alerts
export const alerts: RiskAlert[] = [
  ...evidence
    .filter((v) => v.flag === 'outside_area')
    .map((v, i) => ({
      id: `a-gps-${i}`,
      type: 'gps_mismatch' as const,
      officerId: v.officerId,
      dealerId: v.dealerId,
      at: v.at,
      en: `Visit photo taken ${v.distanceM} m from the dealer`,
      bn: `ডিলার থেকে ${v.distanceM} মিটার দূরে ভিজিটের ছবি তোলা হয়েছে`,
    })),
  ...dealers
    .filter((d) => d.due >= 150000)
    .slice(0, 4)
    .map((d, i) => ({
      id: `a-due-${i}`,
      type: 'dues' as const,
      officerId: officers.find((o) => o.territory === d.territory)!.id,
      dealerId: d.id,
      at: minutesAgo(60 * (i + 2)),
      en: 'Dues above the credit comfort level',
      bn: 'বকেয়া নিরাপদ সীমার উপরে',
    })),
  {
    id: 'a-trk-1',
    type: 'tracking',
    officerId: 'o7',
    at: minutesAgo(48),
    en: 'No location for 48 minutes while on duty',
    bn: 'ডিউটিতে থাকা অবস্থায় ৪৮ মিনিট লোকেশন নেই',
  },
  {
    id: 'a-sales-1',
    type: 'sales_drop',
    officerId: 'o3',
    dealerId: 'd2',
    at: minutesAgo(300),
    en: 'Orders down 40% against last month',
    bn: 'গত মাসের তুলনায় অর্ডার ৪০% কম',
  },
];

// ---------------------------------------------------------------- SOS
export const sosEvents: SosEvent[] = [
  { id: 'sos-1', officerId: 'o5', startedAt: minutesAgo(9), status: 'safe_confirmed', signal: 'live' },
];

export const targetHistory: TargetChange[] = [];

/** Daily collections for the last 14 days (oldest first), for the overview chart. */
export const dailyCollections: { day: Date; amount: number }[] = Array.from({ length: 14 }, (_, i) => {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - (13 - i));
  const weekend = day.getDay() === 5; // Friday is the weekly holiday
  return { day, amount: weekend ? between(10, 40) * 1000 : between(120, 320) * 1000 };
});
