import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = ['Base (PG)', 'Escorta (SG)', 'Aler (SF)', 'Ala-Pivot (PF)', 'Pivot (C)'];

export default function BasketballPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">{t('sports.details', 'Detalls de Bàsquet')}</h2>
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

        <Field label="Envergadura (wingspan)" hint="En centímetres, punta a punta de braços.">
          <Input
            type="number"
            min={100}
            max={260}
            value={formData.wingspan ?? ''}
            onChange={(e) => onChange({ wingspan: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Ex: 210"
            disabled={disabled}
          />
        </Field>
      </div>
    </section>
  );
}
