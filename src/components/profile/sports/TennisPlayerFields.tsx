import type { User, Handedness, BackhandType } from '@/types';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function TennisPlayerFields({ formData, onChange, disabled }: Props) {
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">Detalls de Tennis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Mà dominant">
          <Select
            value={formData.playingHand || ''}
            onChange={(e) => onChange({ playingHand: (e.target.value || undefined) as Handedness | undefined })}
            disabled={disabled}
          >
            <option value="">Selecciona...</option>
            <option value="right">Dretà</option>
            <option value="left">Esquerrà</option>
            <option value="both">Ambidextre</option>
          </Select>
        </Field>

        <Field label="Revés">
          <Select
            value={formData.backhandType || ''}
            onChange={(e) => onChange({ backhandType: (e.target.value || undefined) as BackhandType | undefined })}
            disabled={disabled}
          >
            <option value="">Selecciona...</option>
            <option value="one-hand">A una mà</option>
            <option value="two-hand">A dues mans</option>
          </Select>
        </Field>
      </div>
    </section>
  );
}
