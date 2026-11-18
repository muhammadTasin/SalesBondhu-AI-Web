import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Target } from 'lucide-react';
import { dealerById, getOfficer } from '../api';
import { Badge, Empty, Loading, PageHeader, PresenceBadge, Progress, Stat } from '../components/ui';
import { SetTargetDialog } from '../features/targets/SetTargetDialog';
import { useLang } from '../i18n/lang';
import { clock, lakh, minutesAgo, num, pct, taka } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import { TERRITORIES } from '../mocks/seed';

export function OfficerPage() {
  const { id = '' } = useParams();
  const { t, lang } = useLang();
  const { data, reload } = useAsync(() => getOfficer(id), [id]);
  const [targetOpen, setTargetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!data) return <Loading />;
  const { officer: o, visits } = data;
  const p = Math.round((o.monthAchieved / o.monthTarget) * 100);

  return (
    <>
      <Link to="/team" className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-primary mb-3">
        <ArrowLeft size={15} /> {t('Team', 'টিম')}
      </Link>
      <PageHeader
        title={t(o.name, o.nameBn)}
        subtitle={`${o.code} · ${t(TERRITORIES[o.territory].en, TERRITORIES[o.territory].bn)}`}
        actions={
          <button className="btn-primary" onClick={() => setTargetOpen(true)}>
            <Target size={15} /> {t('Set monthly target', 'মাসিক টার্গেট দিন')}
          </button>
        }
      />
      {saved && <div className="mb-4 text-sm bg-ok-bg text-ok rounded-lg px-3 py-2">{t('Target saved.', 'টার্গেট সংরক্ষণ হয়েছে।')}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label={t('Monthly target', 'মাসিক টার্গেট')} value={lakh(o.monthTarget, lang)} />
        <Stat label={t('Achieved', 'অর্জন')} value={lakh(o.monthAchieved, lang)} hint={pct(p, lang)} tone={p >= 75 ? 'ok' : 'review'} />
        <Stat label={t('Collected this month', 'এই মাসে কালেকশন')} value={lakh(o.monthCollected, lang)} />
        <Stat label={t('Visits today', 'আজকের ভিজিট')} value={`${num(o.visitsDone, lang)}/${num(o.visitsPlanned, lang)}`} />
        <Stat label={t('GPS match', 'জিপিএস মিল')} value={pct(o.gpsMatchPct, lang)} hint={t('visits at the dealer', 'ডিলারের কাছে ভিজিট')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="card p-4">
          <h2 className="card-title mb-3">{t('Right now', 'এই মুহূর্তে')}</h2>
          <PresenceBadge presence={o.presence} />
          <p className="text-sm text-ink-2 mt-3">
            {o.lastSeenMin === null
              ? t('No location received today.', 'আজ কোনো লোকেশন আসেনি।')
              : `${t('Last location', 'শেষ লোকেশন')}: ${minutesAgo(o.lastSeenMin, lang)}`}
          </p>
          <div className="mt-4">
            <div className="text-xs text-ink-muted mb-1">{t('Month progress', 'মাসের অগ্রগতি')}</div>
            <Progress value={p} tone={p >= 75 ? 'ok' : 'primary'} />
          </div>
        </section>

        <section className="card lg:col-span-2 overflow-hidden">
          <div className="card-head">
            <h2 className="card-title">{t("Today's visits", 'আজকের ভিজিট')}</h2>
          </div>
          {visits.length === 0 ? (
            <Empty>{t('No visits logged yet today.', 'আজ এখনো কোনো ভিজিট নেই।')}</Empty>
          ) : (
            <ol className="px-4 pb-4 space-y-3">
              {visits.map((v) => {
                const d = dealerById(v.dealerId);
                return (
                  <li key={v.id} className="flex gap-3">
                    <div className="text-xs text-ink-muted w-12 pt-0.5">{clock(new Date(v.at), lang)}</div>
                    <div className="flex-1 border-l-2 border-primary-100 pl-3">
                      <div className="text-sm font-medium">{d ? t(d.name, d.nameBn) : v.dealerId}</div>
                      <div className="text-xs text-ink-2 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {num(v.distanceM, lang)} {t('m from dealer', 'মি. দূরে')}</span>
                        <span className="flex items-center gap-1"><Camera size={12} /> ±{num(v.gpsAccuracyM, lang)} {t('m', 'মি.')}</span>
                        <span>{t('Order', 'অর্ডার')} {taka(v.orderAmount, lang)}</span>
                        <span>{t('Collected', 'কালেকশন')} {taka(v.collection, lang)}</span>
                      </div>
                    </div>
                    {v.flag && <Badge tone="bad">{v.flag === 'outside_area' ? t('Outside dealer area', 'ডিলার এলাকার বাইরে') : t('Weak GPS', 'দুর্বল জিপিএস')}</Badge>}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <SetTargetDialog
        key={o.monthTarget}
        officerId={o.id}
        officerName={t(o.name, o.nameBn)}
        current={o.monthTarget}
        open={targetOpen}
        onClose={() => setTargetOpen(false)}
        onSaved={() => {
          setSaved(true);
          reload();
        }}
      />
    </>
  );
}
