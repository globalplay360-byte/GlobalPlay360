import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { FormSection } from '../fields/FormSection';
import { PositionSelect } from '../fields/PositionSelect';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function RugbyPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_rugby', 'Detalls de Rugbi')}>
      <PositionSelect
        sport="rugby"
        value={formData.position}
        onChange={(position) => onChange({ position })}
        disabled={disabled}
      />
    </FormSection>
  );
}
