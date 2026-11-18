import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ChevronRight, ClipboardCheck, MapPinOff, Radio } from 'lucide-react';
import { getDailyCollections, getDashboard, getOfficers } from '../api';
import { Loading, PageHeader, PresenceBadge, Progress, Stat } from '../components/ui';
import { useLang } from '../i18n/lang';
import { bnDigits, lakh, num, pct, taka } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import { TERRITORIES } from '../mocks/seed';

export function OverviewPage() {
  const { t, lang } = useLang();
  const { data: s } = useAsync(getDashboard);
  const { data: daily } = useAsync(getDailyCollections);
  const { data: team } = useAsync(getOfficers);

  if (!s || !daily || !team) return <Loading />;
  const salesPct = Math.round((s.monthAchieved / s.monthTarget) * 100);

  const actions = [
    { icon: ClipboardCheck, to: '/review', n: s.pendingReviews, en: 'visits waiting for your review', bn: 'টি ভিজিট আপনার রিভিউয়ের অপেক্ষায়' },
    { icon: AlertTriangle, to: '/alerts', n: s.openAlerts, en: 'risk alerts (GPS, dues, tracking)', bn: 'টি ঝুঁকি অ্যালার্ট (জিপিএস, বকেয়া, ট্র্যাকিং)' },
    { icon: MapPinOff, to: '/map', n: s.presence.offline + s.presence.stale, en: 'officers with weak or no signal', bn: 'জন অফিসারের সিগন্যাল দুর্বল বা নেই' },
    { icon: Radio, to: '/alerts', n: s.openSos, en: 'open SOS', bn: 'টি খোলা এসওএস' },
  ];

  const chartData = daily.map((d) => {
    const day = new Date(d.day);
    const label = day.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short' });
    return { label, amount: d.amount };
  });

  return (
    <>
      <PageHeader
        title={t('Overview', 'সারসংক্ষেপ')}
        subtitle={t('Your team today, at a glance', 'এক নজরে আজ আপনার টিম')}
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        <Stat label={t('On duty now', 'এখন ডিউটিতে')} value={`${num(s.onDuty, lang)}/${num(s.officers, lang)}`} hint={`${num(s.presence.live, lang)} ${t('live', 'লাইভ')}`} tone="ok" />
        <Stat label={t('Sales vs target', 'টার্গেটের তুলনায় সেলস')} value={pct(salesPct, lang)} hint={`${lakh(s.monthAchieved, lang)} / ${lakh(s.monthTarget, lang)}`} />
        <Stat label={t('Collected this month', 'এই মাসে কালেকশন')} value={lakh(s.monthCollected, lang)} />
        <Stat label={t('Collected today', 'আজ কালেকশন')} value={taka(s.collectedToday, lang)} />
        <Stat label={t('Visits today', 'আজকের ভিজিট')} value={`${num(s.visitsDone, lang)}/${num(s.visitsPlanned, lang)}`} />
        <Stat label={t('Waiting for review', 'রিভিউয়ের অপেক্ষায়')} value={num(s.pendingReviews, lang)} hint={t('needs you', 'আপনার পদক্ষেপ দরকার')} tone="review" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <section className="card lg:col-span-1">
          <div className="card-head">
            <h2 className="card-title">{t('Needs your action today', 'আজ আপনার পদক্ষেপ দরকার')}</h2>
          </div>
          <ul className="px-2 pb-2">
            {actions.map((a) => (
              <li key={a.en}>
                <Link to={a.to} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-page">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
                    <a.icon size={16} />
                  </span>
                  <span className="text-sm flex-1">
                    <b className="font-semibold">{num(a.n, lang)}</b> {t(a.en, a.bn)}
                  </span>
                  <ChevronRight size={16} className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card lg:col-span-2">
          <div className="card-head">
            <h2 className="card-title">{t('Collections, last 14 days', 'কালেকশন, গত ১৪ দিন')}</h2>
            <span className="text-xs text-ink-muted">{t('Friday is the weekly holiday', 'শুক্রবার সাপ্তাহিক ছুটি')}</span>
          </div>
          <div className="h-56 px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#EDEEF2" />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#C9CBD4' }} tick={{ fontSize: 11, fill: '#8A8C9C' }} interval={1} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fontSize: 11, fill: '#8A8C9C' }}
                  tickFormatter={(v: number) => (lang === 'bn' ? bnDigits(`${v / 1000}k`) : `${v / 1000}k`)}
                />
                <Tooltip
                  cursor={{ fill: '#F4F5F8' }}
                  formatter={(v) => [taka(Number(v), lang), t('Collected', 'কালেকশন')]}
                  contentStyle={{ borderRadius: 8, borderColor: '#E3E5EB', fontSize: 12 }}
                />
                <Bar dataKey="amount" fill="#4A4396" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card overflow-hidden">
        <div className="card-head">
          <h2 className="card-title">{t('Team today', 'আজকের টিম')}</h2>
          <Link to="/team" className="text-sm text-primary">
            {t('All officers', 'সব অফিসার')} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-y border-line bg-page/60">
              <tr>
                <th className="th">{t('Officer', 'অফিসার')}</th>
                <th className="th">{t('Territory', 'এলাকা')}</th>
                <th className="th">{t('Status', 'অবস্থা')}</th>
                <th className="th">{t('Visits', 'ভিজিট')}</th>
                <th className="th">{t('Collected today', 'আজ কালেকশন')}</th>
                <th className="th w-40">{t('Month target', 'মাসের টার্গেট')}</th>
              </tr>
            </thead>
            <tbody>
              {team.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-page/50">
                  <td className="td">
                    <Link to={`/team/${o.id}`} className="font-medium hover:text-primary">
                      {t(o.name, o.nameBn)}
                    </Link>
                    <div className="text-xs text-ink-muted">{o.code}</div>
                  </td>
                  <td className="td">{t(TERRITORIES[o.territory].en, TERRITORIES[o.territory].bn)}</td>
                  <td className="td"><PresenceBadge presence={o.presence} /></td>
                  <td className="td">{num(o.visitsDone, lang)}/{num(o.visitsPlanned, lang)}</td>
                  <td className="td">{taka(o.collectedToday, lang)}</td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="flex-1"><Progress value={(o.monthAchieved / o.monthTarget) * 100} /></div>
                      <span className="text-xs text-ink-2 w-9 text-right">{pct(Math.round((o.monthAchieved / o.monthTarget) * 100), lang)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
