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

export default function HockeyPlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t('sports.details_hockey', 'Detalls d\'Hoquei')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <PositionSelect
          sport="hockey"
          value={formData.position}
          onChange={(position) => onChange({ position })}
          disabled={disabled}
          hint={t('profileEdit.hints.hockeyPosition', 'Herba, gel o patins.')}
        />
        <HandSelect
          kind="stickHand"
          value={formData.stickHand}
          onChange={(stickHand) => onChange({ stickHand })}
          disabled={disabled}
          hint={t('profileEdit.hints.stickHand', 'Agafada predominant.')}
        />
      </div>
    </FormSection>
  );
}
