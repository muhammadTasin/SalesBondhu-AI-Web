import { useState } from 'react';
import { setMonthlyTarget } from '../../api';
import { Dialog } from '../../components/ui';
import { useLang } from '../../i18n/lang';
import { taka } from '../../lib/format';

interface Props {
  officerId: string;
  officerName: string;
  current: number;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SetTargetDialog({ officerId, officerName, current, open, onClose, onSaved }: Props) {
  const { t, lang } = useLang();
  const [value, setValue] = useState(String(current));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const month = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const save = async () => {
    const amount = Number(value.replace(/[^0-9]/g, ''));
    if (!amount) {
      setError(t('Enter an amount in taka', 'টাকার পরিমাণ লিখুন'));
      return;
    }
    setSaving(true);
    try {
      await setMonthlyTarget(officerId, amount);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t('Set monthly sales target', 'মাসিক সেলস টার্গেট ঠিক করুন')}>
      <p className="text-sm text-ink-2 mb-3">
        {officerName} · {month}
      </p>
      <label className="text-xs text-ink-muted" htmlFor="target-amount">
        {t('Target (taka)', 'টার্গেট (টাকা)')}
      </label>
      <input
        id="target-amount"
        className="input mt-1"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
      />
      <p className="text-xs text-ink-muted mt-1">
        {t('Current', 'বর্তমান')}: {taka(current, lang)}
      </p>
      {error && <p className="text-xs text-bad mt-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-4">
        <button className="btn-ghost" onClick={onClose}>
          {t('Cancel', 'বাতিল')}
        </button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {t('Save target', 'টার্গেট সংরক্ষণ')}
        </button>
      </div>
    </Dialog>
  );
}
