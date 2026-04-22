import type { User, Handedness } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = ['Porter', 'Tanca', 'Ala', 'Pivot', 'Universal'];

export default function FutsalPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-6 rounded bg-orange-500 shadow-sm shadow-orange-500/50" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">{t('sports.details', 'Detalls de Futbol Sala')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
