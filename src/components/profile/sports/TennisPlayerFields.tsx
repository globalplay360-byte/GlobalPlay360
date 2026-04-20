import type { User, Handedness, BackhandType } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function TennisPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-orange-500" />
        <h2 className="text-base font-bold text-white">{t('sports.details', 'Detalls de Tennis')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Mà dominant">
          <Select
            value={formData.playingHand || ''}
            onChange={(e) => onChange({ playingHand: (e.target.value || undefined) as Handedness | undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
            <option value="right">{t('profileEdit.fields.rightHanded', 'Dretà')}</option>
            <option value="left">{t('profileEdit.fields.leftHanded', 'Esquerrà')}</option>
            <option value="both">{t('profileEdit.fields.both', 'Ambidextre')}</option>
          </Select>
        </Field>

        <Field label="Revés">
          <Select
            value={formData.backhandType || ''}
            onChange={(e) => onChange({ backhandType: (e.target.value || undefined) as BackhandType | undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
            <option value="one-hand">{t('profileEdit.fields.oneHanded', 'A una mà')}</option>
            <option value="two-hand">{t('profileEdit.fields.twoHanded', 'A dues mans')}</option>
          </Select>
        </Field>
      </div>
    </section>
  );
}
