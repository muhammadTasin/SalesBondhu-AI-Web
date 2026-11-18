import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Activity, Banknote, MapPinOff, TrendingDown } from 'lucide-react';
import type { ComponentType } from 'react';
import { dealerById, getAlerts, officerById } from '../api';
import { Badge, Empty, Loading, PageHeader } from '../components/ui';
import { useLang } from '../i18n/lang';
import { clock, num, taka } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import type { AlertType } from '../mocks/seed';

const TYPES: Record<AlertType, { en: string; bn: string; icon: ComponentType<{ size?: number }> }> = {
  gps_mismatch: { en: 'GPS mismatch', bn: 'জিপিএস অমিল', icon: MapPinOff },
  dues: { en: 'Dues & credit', bn: 'বকেয়া ও ক্রেডিট', icon: Banknote },
  tracking: { en: 'Tracking', bn: 'ট্র্যাকিং', icon: Activity },
  sales_drop: { en: 'Sales drop', bn: 'সেলস কমেছে', icon: TrendingDown },
};

export function AlertsPage() {
  const { t, lang } = useLang();
  const { data } = useAsync(getAlerts);
  const [tab, setTab] = useState<AlertType | 'all'>('all');
  if (!data) return <Loading />;
  const rows = data.filter((a) => tab === 'all' || a.type === tab);

  return (
    <>
      <PageHeader
        title={t('Risk alerts', 'ঝুঁকি অ্যালার্ট')}
        subtitle={t('Things that need a manager to look, ranked newest first', 'যেগুলো ম্যানেজারের দেখা দরকার, নতুনগুলো আগে')}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', ...Object.keys(TYPES)] as (AlertType | 'all')[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={clsx('btn !py-1 text-xs border', tab === k ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink')}
          >
            {k === 'all' ? t('All', 'সব') : t(TYPES[k].en, TYPES[k].bn)}
            <span className="opacity-70">{num(k === 'all' ? data.length : data.filter((a) => a.type === k).length, lang)}</span>
          </button>
        ))}
      </div>
      <section className="card divide-y divide-line">
        {rows.length === 0 && <Empty>{t('Nothing here.', 'কিছু নেই।')}</Empty>}
        {rows.map((a) => {
          const o = officerById(a.officerId);
          const d = a.dealerId ? dealerById(a.dealerId) : undefined;
          const T = TYPES[a.type];
          return (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3">
              <span className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', a.type === 'gps_mismatch' ? 'bg-bad-bg text-bad' : 'bg-review-bg text-review')}>
                <T.icon size={17} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{t(a.en, a.bn)}</span>
                  <Badge tone={a.type === 'gps_mismatch' ? 'bad' : 'review'}>{t(T.en, T.bn)}</Badge>
                </div>
                <div className="text-xs text-ink-2 mt-0.5">
                  {o && (
                    <Link to={`/team/${o.id}`} className="hover:text-primary">
                      {t(o.name, o.nameBn)}
                    </Link>
                  )}
                  {d && <> · {t(d.name, d.nameBn)}{a.type === 'dues' && <> · {t('due', 'বকেয়া')} {taka(d.due, lang)}</>}</>}
                </div>
              </div>
              <div className="text-xs text-ink-muted whitespace-nowrap">{clock(new Date(a.at), lang)}</div>
              {a.type === 'gps_mismatch' && (
                <Link to="/review" className="btn-ghost !py-1 text-xs">
                  {t('Review visit', 'ভিজিট দেখুন')}
                </Link>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
