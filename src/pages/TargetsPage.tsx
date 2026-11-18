import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { getOfficers, type OfficerRow } from '../api';
import { Loading, PageHeader, Progress } from '../components/ui';
import { SetTargetDialog } from '../features/targets/SetTargetDialog';
import { useLang } from '../i18n/lang';
import { lakh, pct } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import { TERRITORIES, type Territory } from '../mocks/seed';

export function TargetsPage() {
  const { t, lang } = useLang();
  const { data, reload } = useAsync(getOfficers);
  const [editing, setEditing] = useState<OfficerRow | null>(null);
  if (!data) return <Loading />;

  const byTerritory = (Object.keys(TERRITORIES) as Territory[]).map((k) => {
    const team = data.filter((o) => o.territory === k);
    const target = team.reduce((s, o) => s + o.monthTarget, 0);
    const achieved = team.reduce((s, o) => s + o.monthAchieved, 0);
    return { k, team, target, achieved };
  });

  return (
    <>
      <PageHeader title={t('Monthly targets', 'মাসিক টার্গেট')} subtitle={t('Sales targets by territory and officer', 'এলাকা ও অফিসার অনুযায়ী সেলস টার্গেট')} />
      <div className="space-y-4">
        {byTerritory.map(({ k, team, target, achieved }) => (
          <section key={k} className="card overflow-hidden">
            <div className="card-head">
              <h2 className="card-title">{t(TERRITORIES[k].en, TERRITORIES[k].bn)}</h2>
              <span className="text-sm text-ink-2">
                {lakh(achieved, lang)} / {lakh(target, lang)} · {pct(Math.round((achieved / target) * 100), lang)}
              </span>
            </div>
            <table className="w-full">
              <tbody>
                {team.map((o) => {
                  const p = Math.round((o.monthAchieved / o.monthTarget) * 100);
                  return (
                    <tr key={o.id} className="border-t border-line">
                      <td className="td w-1/3 font-medium">{t(o.name, o.nameBn)}</td>
                      <td className="td w-1/3">
                        <Progress value={p} tone={p >= 75 ? 'ok' : p >= 50 ? 'primary' : 'review'} />
                      </td>
                      <td className="td text-ink-2">{lakh(o.monthAchieved, lang)} / {lakh(o.monthTarget, lang)}</td>
                      <td className="td text-right">
                        <button className="btn-ghost !py-1 text-xs" onClick={() => setEditing(o)}>
                          <Pencil size={13} /> {t('Edit', 'বদলান')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>
      {editing && (
        <SetTargetDialog
          officerId={editing.id}
          officerName={t(editing.name, editing.nameBn)}
          current={editing.monthTarget}
          open
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}
