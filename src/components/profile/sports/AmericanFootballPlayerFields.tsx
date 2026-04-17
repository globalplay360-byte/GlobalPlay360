import type { User } from '@/types';
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
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">Detalls de Futbol Americà</h2>
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
