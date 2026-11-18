import { X } from 'lucide-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Presence } from '../../domain/presence';
import { useLang } from '../../i18n/lang';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-2 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'ok' | 'review' | 'bad' }) {
  return (
    <div className="card px-4 py-3.5">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-2xl font-semibold mt-1 text-ink">{value}</div>
      {hint && (
        <div
          className={clsx(
            'text-xs mt-0.5',
            tone === 'ok' && 'text-ok',
            tone === 'review' && 'text-review',
            tone === 'bad' && 'text-bad',
            !tone && 'text-ink-2',
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

const TONES = {
  ok: 'bg-ok-bg text-ok',
  review: 'bg-review-bg text-review',
  stale: 'bg-stale-bg text-stale',
  bad: 'bg-bad-bg text-bad',
  muted: 'bg-page text-ink-2',
  primary: 'bg-primary-50 text-primary',
} as const;

export function Badge({ tone = 'muted', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone])}>{children}</span>;
}

export function PresenceBadge({ presence }: { presence: Presence }) {
  const { t } = useLang();
  const map: Record<Presence, { tone: keyof typeof TONES; label: string }> = {
    live: { tone: 'ok', label: t('Live', 'লাইভ') },
    stale: { tone: 'stale', label: t('Stale', 'পুরনো') },
    offline: { tone: 'bad', label: t('Offline', 'অফলাইন') },
    off_duty: { tone: 'muted', label: t('Off duty', 'ডিউটির বাইরে') },
  };
  const m = map[presence];
  return (
    <Badge tone={m.tone}>
      <span className={clsx('w-1.5 h-1.5 rounded-full bg-current', presence === 'live' && 'animate-pulse')} />
      {m.label}
    </Badge>
  );
}

export function Progress({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'ok' | 'review' }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 rounded-full bg-page overflow-hidden">
      <div
        className={clsx('h-full rounded-full', tone === 'primary' && 'bg-primary', tone === 'ok' && 'bg-ok', tone === 'review' && 'bg-review')}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button aria-label="close" className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-page" aria-label="close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-sm bg-white rounded-card shadow-xl p-5">
        <h2 className="font-semibold mb-3">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-sm text-ink-muted px-4 py-8 text-center">{children}</div>;
}

export function Loading() {
  const { t } = useLang();
  return <div className="text-sm text-ink-muted py-10 text-center animate-pulse">{t('Loading…', 'লোড হচ্ছে…')}</div>;
}
