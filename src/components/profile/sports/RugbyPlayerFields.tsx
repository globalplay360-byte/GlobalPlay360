import type { User } from '@/types';
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
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">Detalls de Rugbi</h2>
      </div>

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
    </section>
  );
}
