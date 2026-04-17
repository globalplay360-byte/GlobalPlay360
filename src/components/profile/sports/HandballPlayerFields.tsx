import type { User, Handedness } from '@/types';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const POSITIONS = ['Porter', 'Central', 'Lateral', 'Extrem', 'Pivot'];

export default function HandballPlayerFields({ formData, onChange, disabled }: Props) {
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">Detalls d'Handbol</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Posició">
          <Select
            value={formData.position || ''}
            onChange={(e) => onChange({ position: e.target.value || undefined })}
            disabled={disabled}
          >
            <option value="">Selecciona...</option>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>

        <Field label="Mà preferida">
          <Select
            value={formData.preferredHand || ''}
            onChange={(e) => onChange({ preferredHand: (e.target.value || undefined) as Handedness | undefined })}
            disabled={disabled}
          >
            <option value="">Selecciona...</option>
            <option value="right">Dreta</option>
            <option value="left">Esquerra</option>
            <option value="both">Ambidextra</option>
          </Select>
        </Field>
      </div>
    </section>
  );
}
