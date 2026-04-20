import type { User, Handedness } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = ['Porter', 'Defensa', 'Lateral', 'Migcampista', 'Extrem', 'Davanter'];

export default function FootballPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">{t('sports.details', 'Detalls de Futbol 11')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <Field label={t('profileEdit.fields.preferredFoot', 'Cama bona')}>
          <Select
            value={formData.preferredFoot || ''}
            onChange={(e) => onChange({ preferredFoot: (e.target.value || undefined) as Handedness | undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
            <option value="right">{t('profileEdit.fields.right', 'Dreta')}</option>
            <option value="left">{t('profileEdit.fields.left', 'Esquerra')}</option>
            <option value="both">{t('profileEdit.fields.both', 'Ambidextre')}</option>
          </Select>
        </Field>
      </div>
    </section>
  );
}
