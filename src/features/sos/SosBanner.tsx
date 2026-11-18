import { useState } from 'react';
import { Radio, ShieldCheck } from 'lucide-react';
import { closeSos, getSos, officerById } from '../../api';
import { Dialog } from '../../components/ui';
import { useLang } from '../../i18n/lang';
import { clock, minutesAgo } from '../../lib/format';
import { useAsync } from '../../lib/useAsync';

/**
 * Open SOS alerts sit on top of every page until a manager closes them.
 * "Safe confirmed" by the officer does not close the alert by itself.
 */
export function SosBanner() {
  const { t, lang } = useLang();
  const { data, reload } = useAsync(getSos);
  const [closing, setClosing] = useState<string | null>(null);

  if (!data || data.length === 0) return null;
  return (
    <>
      {data.map((s) => {
        const o = officerById(s.officerId);
        const mins = Math.round((Date.now() - new Date(s.startedAt).getTime()) / 60000);
        return (
          <div key={s.id} className="bg-bad text-white px-4 md:px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <Radio size={16} className="animate-pulse" />
              SOS · {o ? t(o.name, o.nameBn) : s.officerId}
            </span>
            <span className="opacity-90">
              {t('Started', 'শুরু')} {clock(new Date(s.startedAt), lang)} ({minutesAgo(mins, lang)}) ·{' '}
              {t('signal', 'সিগন্যাল')}: {s.signal === 'live' ? t('live', 'লাইভ') : t('delayed', 'দেরিতে')}
            </span>
            {s.status === 'safe_confirmed' && (
              <span className="flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 text-xs">
                <ShieldCheck size={13} /> {t('Officer says they are safe', 'অফিসার নিরাপদ জানিয়েছেন')}
              </span>
            )}
            <button onClick={() => setClosing(s.id)} className="ml-auto btn bg-white text-bad hover:bg-white/90 !py-1">
              {t('Review & close', 'পর্যালোচনা করে বন্ধ করুন')}
            </button>
          </div>
        );
      })}
      <Dialog open={closing !== null} onClose={() => setClosing(null)} title={t('Close this SOS?', 'এই এসওএস বন্ধ করবেন?')}>
        <p className="text-sm text-ink-2 mb-4">
          {t(
            'Only close it after you have spoken to the officer. Location sharing stops when it is closed.',
            'অফিসারের সাথে কথা বলার পরেই বন্ধ করুন। বন্ধ করলে লোকেশন শেয়ার বন্ধ হবে।',
          )}
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setClosing(null)}>
            {t('Cancel', 'বাতিল')}
          </button>
          <button
            className="btn-danger"
            onClick={async () => {
              if (closing) await closeSos(closing);
              setClosing(null);
              reload();
            }}
          >
            {t('Close SOS', 'এসওএস বন্ধ করুন')}
          </button>
        </div>
      </Dialog>
    </>
  );
}
