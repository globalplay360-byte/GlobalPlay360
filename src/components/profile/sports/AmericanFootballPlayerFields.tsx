import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { FormSection } from '../fields/FormSection';
import { PositionSelect } from '../fields/PositionSelect';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function AmericanFootballPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_american_football', 'Detalls de Futbol Americà')}>
      <PositionSelect
        sport="american_football"
        value={formData.position}
        onChange={(position) => onChange({ position })}
        disabled={disabled}
      />
    </FormSection>
  );
}
