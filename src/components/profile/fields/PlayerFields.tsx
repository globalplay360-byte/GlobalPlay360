import type { User, Sport } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input, Select } from './FormControls';
import SportSpecificFields from '../sports';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}



export default function PlayerFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();

  const SPORT_OPTIONS: { value: Sport; label: string }[] = [
    { value: 'football', label: t('sports.football', 'Futbol 11') },
    { value: 'basketball', label: t('sports.basketball', 'Bàsquet') },
    { value: 'futsal', label: t('sports.futsal', 'Futbol Sala') },
    { value: 'volleyball', label: t('sports.volleyball', 'Voleibol') },
    { value: 'handball', label: t('sports.handball', 'Handbol') },
    { value: 'waterpolo', label: t('sports.waterpolo', 'Waterpolo') },
    { value: 'tennis', label: t('sports.tennis', 'Tennis') },
    { value: 'rugby', label: t('sports.rugby', 'Rugbi') },
    { value: 'american_football', label: t('sports.american_football', 'Futbol Americà') },
    { value: 'hockey', label: t('sports.hockey', 'Hoquei') },
    { value: 'other', label: t('sports.other', 'Altres') },
  ];

  const handleSportChange = (value: string) => {
    const newSport = (value || undefined) as Sport | undefined;
    // Reset sport-specific fields when the sport changes to avoid stale data.
    onChange({
      sport: newSport,
      position: undefined,
      preferredFoot: undefined,
      preferredHand: undefined,
      playingHand: undefined,
      stickHand: undefined,
      backhandType: undefined,
      wingspan: undefined,
      spikeReach: undefined,
    });
  };

  return (
    <>
      <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded bg-emerald-500" />
          <h2 className="text-base font-bold text-white">{t('profileEdit.fields.athleticData', 'Dades esportives')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label={t('profileEdit.fields.mainSport', 'Esport principal')}>
            <Select value={formData.sport || ''} onChange={(e) => handleSportChange(e.target.value)} disabled={disabled}>
              <option value="">{t('profileEdit.fields.selectSport', 'Selecciona un esport')}</option>
              {SPORT_OPTIONS.map((o) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
      </section>

      {formData.sport && formData.sport !== 'other' && (
        <SportSpecificFields formData={formData} onChange={onChange} disabled={disabled} />
      )}
    </>
  );
}
