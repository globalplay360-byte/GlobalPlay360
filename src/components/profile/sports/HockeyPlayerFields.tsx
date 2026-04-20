import type { User, StickHand } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = ['Porter', 'Defensa', 'Migcampista', 'Davanter'];

export default function HockeyPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">Detalls d'Hoquei</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label={t('profileEdit.fields.position', 'Posició')} hint="Herba, gel o patins.">
          <Select
            value={formData.position || ''}
            onChange={(e) => onChange({ position: e.target.value || undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
            {POSITIONS.map((p) => <option key={p} value={p}>{t(`sports.positions.${p.toLowerCase().replace(/ /g, '')}`, p)}</option>)}
          </Select>
        </Field>

        <Field label="Mà del stick" hint="Agafada predominant.">
          <Select
            value={formData.stickHand || ''}
            onChange={(e) => onChange({ stickHand: (e.target.value || undefined) as StickHand | undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
            <option value="right">{t('profileEdit.fields.right', 'Dreta')}</option>
            <option value="left">{t('profileEdit.fields.left', 'Esquerra')}</option>
          </Select>
        </Field>
      </div>
    </section>
  );
}
