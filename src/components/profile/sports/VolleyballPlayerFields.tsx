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

export default function VolleyballPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_volleyball', 'Detalls de Voleibol')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <PositionSelect
          sport="volleyball"
          value={formData.position}
          onChange={(position) => onChange({ position })}
          disabled={disabled}
        />
        <Field
          label={t('profileEdit.fields.spikeReach', 'Abast de remat')}
          hint={t('profileEdit.hints.spikeReach', 'Alçada màxima de contacte amb la pilota, en cm.')}
        >
          <Input
            type="number"
            min={200}
            max={400}
            value={formData.spikeReach ?? ''}
            onChange={(e) => onChange({ spikeReach: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={t('profileEdit.placeholders.spikeReach', 'Ex: 320')}
            disabled={disabled}
          />
        </Field>
      </div>
    </FormSection>
  );
}
