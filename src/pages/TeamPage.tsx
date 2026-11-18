import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getOfficers } from '../api';
import { Loading, PageHeader, PresenceBadge, Progress } from '../components/ui';
import { useLang } from '../i18n/lang';
import { lakh, num, pct, taka } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import { TERRITORIES, type Territory } from '../mocks/seed';

export function TeamPage() {
  const { t, lang } = useLang();
  const { data } = useAsync(getOfficers);
  const [q, setQ] = useState('');
  const [terr, setTerr] = useState<Territory | 'all'>('all');
  if (!data) return <Loading />;

  const rows = data.filter(
    (o) =>
      (terr === 'all' || o.territory === terr) &&
      (q === '' || `${o.name} ${o.nameBn} ${o.code}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader title={t('Team', 'টিম')} subtitle={t('Every field officer, their day and their month', 'প্রত্যেক ফিল্ড অফিসার, তাদের দিন আর মাস')} />
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder={t('Search name or code', 'নাম বা কোড খুঁজুন')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={terr} onChange={(e) => setTerr(e.target.value as Territory | 'all')}>
          <option value="all">{t('All territories', 'সব এলাকা')}</option>
          {(Object.keys(TERRITORIES) as Territory[]).map((k) => (
            <option key={k} value={k}>
              {t(TERRITORIES[k].en, TERRITORIES[k].bn)}
            </option>
          ))}
        </select>
      </div>
      <section className="card overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-line bg-page/60">
            <tr>
              <th className="th">{t('Officer', 'অফিসার')}</th>
              <th className="th">{t('Territory', 'এলাকা')}</th>
              <th className="th">{t('Status', 'অবস্থা')}</th>
              <th className="th">{t('Visits today', 'আজকের ভিজিট')}</th>
              <th className="th">{t('Collected today', 'আজ কালেকশন')}</th>
              <th className="th">{t('GPS match', 'জিপিএস মিল')}</th>
              <th className="th w-48">{t('Month: achieved / target', 'মাস: অর্জন / টার্গেট')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const p = Math.round((o.monthAchieved / o.monthTarget) * 100);
              return (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-page/50">
                  <td className="td">
                    <Link to={`/team/${o.id}`} className="font-medium hover:text-primary">{t(o.name, o.nameBn)}</Link>
                    <div className="text-xs text-ink-muted">{o.code}</div>
                  </td>
                  <td className="td">{t(TERRITORIES[o.territory].en, TERRITORIES[o.territory].bn)}</td>
                  <td className="td"><PresenceBadge presence={o.presence} /></td>
                  <td className="td">{num(o.visitsDone, lang)}/{num(o.visitsPlanned, lang)}</td>
                  <td className="td">{taka(o.collectedToday, lang)}</td>
                  <td className="td">{pct(o.gpsMatchPct, lang)}</td>
                  <td className="td">
                    <div className="text-xs text-ink-2 mb-1">{lakh(o.monthAchieved, lang)} / {lakh(o.monthTarget, lang)}</div>
                    <Progress value={p} tone={p >= 75 ? 'ok' : p >= 50 ? 'primary' : 'review'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
