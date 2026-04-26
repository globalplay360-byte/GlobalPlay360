import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input } from '../fields/FormControls';
import { FormSection } from '../fields/FormSection';
import { PositionSelect } from '../fields/PositionSelect';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function BasketballPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_basketball', 'Detalls de Bàsquet')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <PositionSelect
          sport="basketball"
          value={formData.position}
          onChange={(position) => onChange({ position })}
          disabled={disabled}
        />
        <Field
          label={t('profileEdit.fields.wingspan', 'Envergadura')}
          hint={t('profileEdit.hints.wingspan', 'En centímetres, punta a punta de braços.')}
        >
          <Input
            type="number"
            min={100}
            max={260}
            value={formData.wingspan ?? ''}
            onChange={(e) => onChange({ wingspan: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={t('profileEdit.placeholders.wingspan', 'Ex: 210')}
            disabled={disabled}
          />
        </Field>
      </div>
    </FormSection>
  );
}
