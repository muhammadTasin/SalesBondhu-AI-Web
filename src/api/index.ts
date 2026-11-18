/**
 * Data layer of the showcase console.
 *
 * The production console talks to a REST API. Here each call resolves from the in-memory
 * mock world after a short delay, so pages use the same async shape (loading → data) they
 * would with a real backend, and mutations update the shared store.
 */
import { presenceOf, summarizePresence, type Presence } from '../domain/presence';
import {
  alerts,
  dailyCollections,
  dealers,
  evidence,
  officers,
  sosEvents,
  targetHistory,
  type Dealer,
  type Officer,
  type ReviewStatus,
  type RiskAlert,
  type SosEvent,
  type VisitEvidence,
} from '../mocks/seed';

const LATENCY_MS = 180;
const later = <T,>(value: T): Promise<T> => new Promise((r) => setTimeout(() => r(structuredClone(value)), LATENCY_MS));

export type OfficerRow = Officer & { presence: Presence };
const withPresence = (o: Officer): OfficerRow => ({ ...o, presence: presenceOf(o) });

export interface DashboardSummary {
  onDuty: number;
  officers: number;
  presence: Record<Presence, number>;
  monthTarget: number;
  monthAchieved: number;
  monthCollected: number;
  collectedToday: number;
  visitsDone: number;
  visitsPlanned: number;
  pendingReviews: number;
  openAlerts: number;
  openSos: number;
}

export function getDashboard(): Promise<DashboardSummary> {
  const sum = (f: (o: Officer) => number) => officers.reduce((s, o) => s + f(o), 0);
  return later({
    onDuty: officers.filter((o) => o.onDuty).length,
    officers: officers.length,
    presence: summarizePresence(officers),
    monthTarget: sum((o) => o.monthTarget),
    monthAchieved: sum((o) => o.monthAchieved),
    monthCollected: sum((o) => o.monthCollected),
    collectedToday: sum((o) => o.collectedToday),
    visitsDone: sum((o) => o.visitsDone),
    visitsPlanned: sum((o) => o.visitsPlanned),
    pendingReviews: evidence.filter((v) => v.status === 'pending').length,
    openAlerts: alerts.length,
    openSos: sosEvents.filter((s) => s.status !== 'closed').length,
  });
}

export const getDailyCollections = () => later(dailyCollections);
export const getOfficers = (): Promise<OfficerRow[]> => later(officers.map(withPresence));
export const getDealers = (): Promise<Dealer[]> => later(dealers);

export function getOfficer(id: string): Promise<{ officer: OfficerRow; visits: VisitEvidence[] } | null> {
  const o = officers.find((x) => x.id === id);
  if (!o) return later(null);
  return later({ officer: withPresence(o), visits: evidence.filter((v) => v.officerId === id) });
}

export function setMonthlyTarget(officerId: string, amount: number): Promise<void> {
  const o = officers.find((x) => x.id === officerId);
  if (!o) return Promise.reject(new Error('unknown officer'));
  if (!(amount > 0)) return Promise.reject(new Error('target must be positive'));
  targetHistory.unshift({ officerId, at: new Date(), from: o.monthTarget, to: amount });
  o.monthTarget = amount;
  return later(undefined);
}

export const getAlerts = (): Promise<RiskAlert[]> => later([...alerts].sort((a, b) => +b.at - +a.at));
export const getSos = (): Promise<SosEvent[]> => later(sosEvents.filter((s) => s.status !== 'closed'));

export function closeSos(id: string): Promise<void> {
  const s = sosEvents.find((x) => x.id === id);
  if (s) {
    s.status = 'closed';
    s.closedAt = new Date();
  }
  return later(undefined);
}

export const getEvidence = (): Promise<VisitEvidence[]> => later([...evidence].sort((a, b) => +b.at - +a.at));

export function decideVisit(id: string, status: Exclude<ReviewStatus, 'pending'>, note: string): Promise<void> {
  const v = evidence.find((x) => x.id === id);
  if (!v) return Promise.reject(new Error('unknown visit'));
  if (v.status !== 'pending') return Promise.reject(new Error('already decided'));
  if (status === 'rejected' && note.trim().length < 5) return Promise.reject(new Error('a reason is required to reject'));
  v.status = status;
  v.note = note.trim() || undefined;
  return later(undefined);
}

/** Lookups for display (synchronous: the mock world is local). */
export const officerById = (id: string) => officers.find((o) => o.id === id);
export const dealerById = (id: string) => dealers.find((d) => d.id === id);
