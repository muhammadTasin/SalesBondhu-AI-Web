import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getDealers, getOfficers } from '../api';
import { Loading, PageHeader, PresenceBadge } from '../components/ui';
import type { Presence } from '../domain/presence';
import { useLang } from '../i18n/lang';
import { minutesAgo, num } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import { TERRITORIES, type Territory } from '../mocks/seed';

const PIN: Record<Presence, string> = { live: '#1F8A5B', stale: '#9A5B2E', offline: '#C53030', off_duty: '#8A8C9C' };

// Stylised territory outlines on a 100 × 100 canvas (not a real map; the production console uses Google Maps).
const AREAS: { id: Territory; d: string; lx: number; ly: number }[] = [
  { id: 'gazipur', d: 'M4,6 L36,4 L38,40 L34,64 L6,66 Z', lx: 20, ly: 8.5 },
  { id: 'dhaka-north', d: 'M40,6 L84,8 L82,46 L40,46 Z', lx: 62, ly: 10.5 },
  { id: 'dhaka-south', d: 'M38,50 L80,50 L78,92 L34,94 Z', lx: 57, ly: 54.5 },
];

export function MapPage() {
  const { t, lang } = useLang();
  const { data: officers } = useAsync(getOfficers);
  const { data: dealers } = useAsync(getDealers);
  const [filter, setFilter] = useState<Presence | 'all'>('all');
  const [hover, setHover] = useState<string | null>(null);

  if (!officers || !dealers) return <Loading />;
  const shown = officers.filter((o) => filter === 'all' || o.presence === filter);
  const count = (p: Presence) => officers.filter((o) => o.presence === p).length;

  const filters: { id: Presence | 'all'; en: string; bn: string }[] = [
    { id: 'all', en: 'All', bn: 'সব' },
    { id: 'live', en: 'Live', bn: 'লাইভ' },
    { id: 'stale', en: 'Stale', bn: 'পুরনো' },
    { id: 'offline', en: 'Offline', bn: 'অফলাইন' },
    { id: 'off_duty', en: 'Off duty', bn: 'ডিউটির বাইরে' },
  ];

  return (
    <>
      <PageHeader
        title={t('Live map', 'লাইভ ম্যাপ')}
        subtitle={t('Where every on-duty officer is, and how fresh their location is', 'ডিউটিতে থাকা প্রত্যেক অফিসার কোথায়, আর লোকেশন কতটা নতুন')}
      />
      <div className="flex flex-wrap gap-2 mb-3">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx('btn !py-1 text-xs border', filter === f.id ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink')}
          >
            {t(f.en, f.bn)}
            {f.id !== 'all' && <span className="opacity-70">{num(count(f.id), lang)}</span>}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="card lg:col-span-2 p-3">
          <svg viewBox="0 0 100 100" className="w-full h-auto rounded-lg bg-[#EEF1F6]" role="img" aria-label={t('Territory map', 'এলাকার ম্যাপ')}>
            {/* roads */}
            <g stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round">
              <path d="M2,48 C30,44 60,52 98,46" />
              <path d="M38,2 C40,30 36,60 40,98" />
              <path d="M10,90 C30,70 60,30 96,12" />
            </g>
            {AREAS.map((a) => (
              <g key={a.id}>
                <path d={a.d} fill="#4A4396" fillOpacity="0.06" stroke="#4A4396" strokeOpacity="0.35" strokeWidth="0.4" strokeDasharray="1.2 0.8" />
                <text x={a.lx} y={a.ly} fontSize="2.6" fill="#5A5B6E" textAnchor="middle" fontWeight="600">
                  {t(TERRITORIES[a.id].en, TERRITORIES[a.id].bn)}
                </text>
              </g>
            ))}
            {dealers.map((d) => (
              <rect key={d.id} x={d.x - 0.8} y={d.y - 0.8} width="1.6" height="1.6" rx="0.3" fill="#FFFFFF" stroke="#8A8C9C" strokeWidth="0.3">
                <title>{t(d.name, d.nameBn)}</title>
              </rect>
            ))}
            {shown.map((o) => (
              <g key={o.id} onMouseEnter={() => setHover(o.id)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
                {o.presence === 'live' && <circle cx={o.x} cy={o.y} r="3.4" fill={PIN.live} opacity="0.18" />}
                <circle cx={o.x} cy={o.y} r={hover === o.id ? 2.5 : 2.1} fill={PIN[o.presence]} stroke="#FFFFFF" strokeWidth="0.5" />
                <text x={o.x} y={o.y + 0.75} fontSize="1.9" fill="#FFFFFF" textAnchor="middle" fontWeight="700">
                  {o.name.split(' ').map((w) => w[0]).join('')}
                </text>
                {hover === o.id && (
                  <g>
                    <rect x={o.x + 3} y={o.y - 4.2} width="27" height="7" rx="1" fill="#FFFFFF" stroke="#E3E5EB" strokeWidth="0.2" />
                    <text x={o.x + 4.2} y={o.y - 1.4} fontSize="2.2" fill="#151528" fontWeight="600">{t(o.name, o.nameBn)}</text>
                    <text x={o.x + 4.2} y={o.y + 1.6} fontSize="1.8" fill="#5A5B6E">
                      {o.lastSeenMin === null ? t('no location today', 'আজ লোকেশন নেই') : minutesAgo(o.lastSeenMin, lang)}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
          <div className="flex flex-wrap gap-4 px-1 pt-3 text-xs text-ink-2">
            {(['live', 'stale', 'offline', 'off_duty'] as Presence[]).map((p) => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIN[p] }} />
                {p === 'live' ? t('Live (under 5 min)', 'লাইভ (৫ মিনিটের কম)') : p === 'stale' ? t('Stale (5–30 min)', 'পুরনো (৫–৩০ মিনিট)') : p === 'offline' ? t('Offline (30+ min)', 'অফলাইন (৩০+ মিনিট)') : t('Off duty', 'ডিউটির বাইরে')}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-ink-muted bg-white" /> {t('Dealer', 'ডিলার')}
            </span>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="card-head">
            <h2 className="card-title">{t('Officers', 'অফিসার')}</h2>
            <span className="text-xs text-ink-muted">{num(shown.length, lang)}</span>
          </div>
          <ul className="divide-y divide-line">
            {shown.map((o) => (
              <li key={o.id} onMouseEnter={() => setHover(o.id)} onMouseLeave={() => setHover(null)} className={clsx('px-4 py-2.5', hover === o.id && 'bg-page')}>
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/team/${o.id}`} className="text-sm font-medium hover:text-primary">{t(o.name, o.nameBn)}</Link>
                  <PresenceBadge presence={o.presence} />
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {t(TERRITORIES[o.territory].en, TERRITORIES[o.territory].bn)} ·{' '}
                  {o.lastSeenMin === null ? t('no location today', 'আজ লোকেশন নেই') : minutesAgo(o.lastSeenMin, lang)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
