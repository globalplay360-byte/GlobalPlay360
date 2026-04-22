import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = [
  'Pilar',
  'Talonador',
  'Segona línia',
  'Flanker',
  'Número 8',
  'Mig de melé',
  'Obertura',
  'Centre',
  'Ala',
  'Zaguer',
];

export default function RugbyPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-6 rounded bg-orange-500 shadow-sm shadow-orange-500/50" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">{t('sports.details', 'Detalls de Rugbi')}</h2>
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
