import type { User, Sport } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input, Select } from './FormControls';
import { FormSection } from './FormSection';
import SportSpecificFields from '../sports';
import { buildSportOptions } from '@/constants/sports';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

// Camps que depenen de l'esport seleccionat — quan canvia, els reiniciem.
const SPORT_DEPENDENT_FIELDS = [
  'position',
  'preferredFoot',
  'preferredHand',
  'playingHand',
  'stickHand',
  'backhandType',
  'wingspan',
  'spikeReach',
] as const;

export default function PlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const sportOptions = buildSportOptions(t);

  const handleSportChange = (value: string) => {
    const newSport = (value || undefined) as Sport | undefined;
    const reset: Partial<User> = { sport: newSport };
    SPORT_DEPENDENT_FIELDS.forEach((k) => {
      (reset as Record<string, undefined>)[k] = undefined;
    });
    onChange(reset);
  };

  return (
    <>
      <FormSection title={t('profileEdit.fields.athleticData', 'Dades esportives')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Field label={t('profileEdit.fields.mainSport', 'Esport principal')}>
            <Select value={formData.sport || ''} onChange={(e) => handleSportChange(e.target.value)} disabled={disabled}>
              <option value="">{t('profileEdit.fields.selectSport', 'Selecciona un esport')}</option>
              {sportOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('profileEdit.fields.dateOfBirth', 'Data de naixement')}>
            <Input
              type="date"
              value={formData.dateOfBirth?.slice(0, 10) || ''}
              onChange={(e) =>
                onChange({
                  dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
              disabled={disabled}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Field label={t('profileEdit.fields.height', 'Alçada')} hint={t('profileEdit.hints.height', 'En centímetres.')}>
            <Input
              type="number"
              min={100}
              max={250}
              value={formData.height ?? ''}
              onChange={(e) => onChange({ height: e.target.value ? Number(e.target.value) : undefined })}
              placeholder={t('profileEdit.placeholders.height', 'Ex: 180')}
              disabled={disabled}
            />
          </Field>
          <Field label={t('profileEdit.fields.weight', 'Pes')} hint={t('profileEdit.hints.weight', 'En quilograms.')}>
            <Input
              type="number"
              min={30}
              max={200}
              value={formData.weight ?? ''}
              onChange={(e) => onChange({ weight: e.target.value ? Number(e.target.value) : undefined })}
              placeholder={t('profileEdit.placeholders.weight', 'Ex: 75')}
              disabled={disabled}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Field label={t('profileEdit.fields.currentClub', 'Equip Actual / Club')} hint={t('profileEdit.hints.currentClub', 'A quin equip jugues actualment? (Opcional)')}>
            <Input
              type="text"
              value={formData.currentClub || ''}
              onChange={(e) => onChange({ currentClub: e.target.value })}
              placeholder={t('profileEdit.placeholders.currentClub', 'Ex: FC Barcelona')}
              disabled={disabled}
            />
          </Field>
        </div>
      </FormSection>

      {formData.sport && formData.sport !== 'other' && (
        <SportSpecificFields formData={formData} onChange={onChange} disabled={disabled} />
      )}
    </>
  );
}
