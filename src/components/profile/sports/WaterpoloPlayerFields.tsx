import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { FormSection } from '../fields/FormSection';
import { PositionSelect } from '../fields/PositionSelect';
import { HandSelect } from '../fields/HandSelect';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function WaterpoloPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_waterpolo', 'Detalls de Waterpolo')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <PositionSelect
          sport="waterpolo"
          value={formData.position}
          onChange={(position) => onChange({ position })}
          disabled={disabled}
        />
        <HandSelect
          kind="preferredHand"
          value={formData.preferredHand}
          onChange={(preferredHand) => onChange({ preferredHand })}
          disabled={disabled}
        />
      </div>
    </FormSection>
  );
}
