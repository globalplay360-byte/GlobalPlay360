import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = [
  'Quarterback (QB)',
  'Running Back (RB)',
  'Wide Receiver (WR)',
  'Tight End (TE)',
  'Offensive Line (OL)',
  'Defensive Line (DL)',
  'Linebacker (LB)',
  'Cornerback (CB)',
  'Safety (S)',
  'Kicker / Punter',
];

export default function AmericanFootballPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">{t('sports.details', 'Detalls de Futbol Americà')}</h2>
      </div>

      <Field label={t('profileEdit.fields.position', 'Posició')}>
        <Select
          value={formData.position || ''}
          onChange={(e) => onChange({ position: e.target.value || undefined })}
          disabled={disabled}
        >
          <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{t(`sports.positions.${p.toLowerCase().replace(/ /g, '')}`, p)}</option>)}
        </Select>
      </Field>
    </section>
  );
}
