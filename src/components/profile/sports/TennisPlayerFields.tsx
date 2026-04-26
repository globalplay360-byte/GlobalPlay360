import type { User, BackhandType } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Select } from '../fields/FormControls';
import { FormSection } from '../fields/FormSection';
import { HandSelect } from '../fields/HandSelect';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function TennisPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_tennis', 'Detalls de Tennis')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <HandSelect
          kind="playingHand"
          value={formData.playingHand}
          onChange={(playingHand) => onChange({ playingHand })}
          disabled={disabled}
        />
        <Field label={t('profileEdit.fields.backhandType', 'Revés')}>
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
    </FormSection>
  );
}
