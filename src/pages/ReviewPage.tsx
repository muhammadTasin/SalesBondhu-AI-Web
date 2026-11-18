import { useState } from 'react';
import clsx from 'clsx';
import { Camera, Check, Download, Fingerprint, MapPin, X } from 'lucide-react';
import { dealerById, decideVisit, getEvidence, officerById } from '../api';
import { Badge, Drawer, Empty, Loading, PageHeader } from '../components/ui';
import { useLang } from '../i18n/lang';
import { toCsv, downloadCsv } from '../lib/csv';
import { clock, num, shortHash, taka } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import type { ReviewStatus, VisitEvidence } from '../mocks/seed';

export function ReviewPage() {
  const { t, lang } = useLang();
  const { data, reload } = useAsync(getEvidence);
  const [tab, setTab] = useState<ReviewStatus>('pending');
  const [open, setOpen] = useState<VisitEvidence | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!data) return <Loading />;
  const rows = data.filter((v) => v.status === tab);

  const decide = async (status: 'accepted' | 'rejected') => {
    if (!open) return;
    try {
      await decideVisit(open.id, status, note);
      setOpen(null);
      setNote('');
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const exportTeam = () => {
    const perOfficer = new Map<string, { officer: string; code: string; visits: number; accepted: number; rejected: number; pending: number; collected: number }>();
    for (const v of data) {
      const o = officerById(v.officerId)!;
      const row = perOfficer.get(o.id) ?? { officer: o.name, code: o.code, visits: 0, accepted: 0, rejected: 0, pending: 0, collected: 0 };
      row.visits++;
      row[v.status]++;
      row.collected += v.collection;
      perOfficer.set(o.id, row);
    }
    const day = new Date().toISOString().slice(0, 10);
    downloadCsv(`team-report-${day}.csv`, toCsv([...perOfficer.values()], ['officer', 'code', 'visits', 'accepted', 'rejected', 'pending', 'collected']));
  };

  const tabs: { id: ReviewStatus; en: string; bn: string }[] = [
    { id: 'pending', en: 'Pending', bn: 'অপেক্ষমাণ' },
    { id: 'accepted', en: 'Accepted', bn: 'গ্রহণ করা' },
    { id: 'rejected', en: 'Rejected', bn: 'বাতিল' },
  ];

  return (
    <>
      <PageHeader
        title={t('Visit review', 'ভিজিট রিভিউ')}
        subtitle={t("Check each visit's evidence before the day is closed", 'দিন শেষ করার আগে প্রতিটি ভিজিটের প্রমাণ দেখুন')}
        actions={
          <button className="btn-ghost" onClick={exportTeam}>
            <Download size={15} /> {t('Export team report', 'টিম রিপোর্ট ডাউনলোড')}
          </button>
        }
      />
      <div className="flex gap-2 mb-3">
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={clsx('btn !py-1 text-xs border', tab === x.id ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink')}
          >
            {t(x.en, x.bn)} <span className="opacity-70">{num(data.filter((v) => v.status === x.id).length, lang)}</span>
          </button>
        ))}
      </div>

      <section className="card overflow-x-auto">
        {rows.length === 0 ? (
          <Empty>{t('Nothing to review.', 'রিভিউ করার কিছু নেই।')}</Empty>
        ) : (
          <table className="w-full">
            <thead className="border-b border-line bg-page/60">
              <tr>
                <th className="th">{t('Time', 'সময়')}</th>
                <th className="th">{t('Officer', 'অফিসার')}</th>
                <th className="th">{t('Dealer', 'ডিলার')}</th>
                <th className="th">{t('Distance', 'দূরত্ব')}</th>
                <th className="th">{t('Collected', 'কালেকশন')}</th>
                <th className="th">{t('Check', 'যাচাই')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const o = officerById(v.officerId)!;
                const d = dealerById(v.dealerId)!;
                return (
                  <tr key={v.id} onClick={() => { setOpen(v); setError(null); }} className="border-b border-line last:border-0 hover:bg-page/50 cursor-pointer">
                    <td className="td text-ink-2">{clock(new Date(v.at), lang)}</td>
                    <td className="td font-medium">{t(o.name, o.nameBn)}</td>
                    <td className="td">{t(d.name, d.nameBn)}</td>
                    <td className="td">{num(v.distanceM, lang)} {t('m', 'মি.')}</td>
                    <td className="td">{taka(v.collection, lang)}</td>
                    <td className="td">
                      {v.flag === 'outside_area' ? (
                        <Badge tone="bad">{t('Outside dealer area', 'ডিলার এলাকার বাইরে')}</Badge>
                      ) : v.flag === 'low_accuracy' ? (
                        <Badge tone="review">{t('Weak GPS', 'দুর্বল জিপিএস')}</Badge>
                      ) : (
                        <Badge tone="ok">{t('Looks fine', 'ঠিক আছে')}</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <Drawer open={open !== null} onClose={() => setOpen(null)} title={t('Visit evidence', 'ভিজিটের প্রমাণ')}>
        {open && <Evidence v={open} />}
        {open?.status === 'pending' && (
          <div className="mt-5 space-y-2">
            <label className="text-xs text-ink-muted" htmlFor="review-note">
              {t('Note (required to reject)', 'নোট (বাতিল করতে লাগবে)')}
            </label>
            <textarea id="review-note" className="input min-h-[72px]" value={note} onChange={(e) => { setNote(e.target.value); setError(null); }} />
            {error && <p className="text-xs text-bad">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button className="btn-primary flex-1 justify-center" onClick={() => decide('accepted')}>
                <Check size={15} /> {t('Accept', 'গ্রহণ')}
              </button>
              <button className="btn-danger flex-1 justify-center" onClick={() => decide('rejected')}>
                <X size={15} /> {t('Reject', 'বাতিল')}
              </button>
            </div>
            <p className="text-xs text-ink-muted">{t('Decisions are final and kept in the audit trail.', 'সিদ্ধান্ত চূড়ান্ত এবং অডিট ট্রেইলে থাকে।')}</p>
          </div>
        )}
        {open && open.status !== 'pending' && (
          <div className="mt-5">
            <Badge tone={open.status === 'accepted' ? 'ok' : 'bad'}>{open.status === 'accepted' ? t('Accepted', 'গ্রহণ করা') : t('Rejected', 'বাতিল')}</Badge>
            {open.note && <p className="text-sm text-ink-2 mt-2">{open.note}</p>}
          </div>
        )}
      </Drawer>
    </>
  );
}

function Evidence({ v }: { v: VisitEvidence }) {
  const { t, lang } = useLang();
  const o = officerById(v.officerId)!;
  const d = dealerById(v.dealerId)!;
  const rows: [string, string][] = [
    [t('Officer', 'অফিসার'), t(o.name, o.nameBn)],
    [t('Dealer', 'ডিলার'), t(d.name, d.nameBn)],
    [t('Photo taken', 'ছবি তোলা'), clock(new Date(v.at), lang)],
    [t('Distance from dealer', 'ডিলার থেকে দূরত্ব'), `${num(v.distanceM, lang)} ${t('m', 'মি.')}`],
    [t('GPS accuracy', 'জিপিএস নির্ভুলতা'), `±${num(v.gpsAccuracyM, lang)} ${t('m', 'মি.')}`],
    [t('Order', 'অর্ডার'), taka(v.orderAmount, lang)],
    [t('Collected', 'কালেকশন'), taka(v.collection, lang)],
  ];
  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] rounded-lg bg-[repeating-linear-gradient(135deg,#EEF1F6_0,#EEF1F6_10px,#E6E9F0_10px,#E6E9F0_20px)] border border-line flex flex-col items-center justify-center text-ink-muted">
        <Camera size={28} />
        <span className="text-xs mt-1">{t('Live photo (demo placeholder)', 'লাইভ ছবি (ডেমো)')}</span>
      </div>
      <div className="flex items-start gap-2 bg-page rounded-lg px-3 py-2">
        <Fingerprint size={16} className="text-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <div className="text-xs text-ink-muted">{t('Photo fingerprint (SHA-256)', 'ছবির ফিঙ্গারপ্রিন্ট (SHA-256)')}</div>
          <div className="font-mono text-xs break-all" title={v.photoSha256}>{shortHash(v.photoSha256)}</div>
        </div>
      </div>
      {v.flag && (
        <div className={clsx('flex items-center gap-2 rounded-lg px-3 py-2 text-sm', v.flag === 'outside_area' ? 'bg-bad-bg text-bad' : 'bg-review-bg text-review')}>
          <MapPin size={15} />
          {v.flag === 'outside_area'
            ? t('Photo was taken outside the dealer area', 'ছবিটি ডিলার এলাকার বাইরে তোলা')
            : t('Location accuracy was weak', 'লোকেশনের নির্ভুলতা কম ছিল')}
        </div>
      )}
      <dl className="divide-y divide-line text-sm">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between py-2">
            <dt className="text-ink-2">{k}</dt>
            <dd className="font-medium">{val}</dd>
          </div>
        ))}
      </dl>
      {v.competitorNote && (
        <div className="text-sm">
          <div className="text-xs text-ink-muted mb-1">{t('Market note', 'বাজারের তথ্য')}</div>
          {v.competitorNote}
        </div>
      )}
    </div>
  );
}
