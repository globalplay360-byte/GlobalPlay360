import type { User, Sport } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input, Textarea, Select } from './FormControls';
import { FormSection } from './FormSection';
import { buildSportOptions } from '@/constants/sports';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

type GenderPref = NonNullable<User['genderPreference']>;
type CategoryPref = NonNullable<User['categoryPreference']>;

export default function CoachFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const sportOptions = buildSportOptions(t);

  const certificationsText = (formData.certifications ?? []).join('\n');

  const handleCertificationsChange = (value: string) => {
    // Split només per \n preserva línies buides mentre l'usuari escriu (Enter no s'engoleix).
    const list = value.split('\n');
    onChange({ certifications: list.length > 0 ? list : undefined });
  };

  const handleSportChange = (value: string) => {
    const newSport = (value || undefined) as Sport | undefined;
    onChange({ sport: newSport });
  };

  return (
    <FormSection title={t('profileEdit.fields.coachData', 'Dades d\'entrenador')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <Field label={t('profileEdit.fields.mainSport', 'Esport principal')}>
          <Select value={formData.sport || ''} onChange={(e) => handleSportChange(e.target.value)} disabled={disabled}>
            <option value="">{t('profileEdit.fields.selectSport', 'Selecciona un esport')}</option>
            {sportOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Field>

        <Field
          label={t('profileEdit.fields.experienceYears', 'Anys d\'experiència')}
          hint={t('profileEdit.hints.experienceYears', 'Temps total com a entrenador professional o amateur.')}
        >
          <Input
            type="number"
            min={0}
            max={70}
            value={formData.experienceYears ?? ''}
            onChange={(e) => onChange({ experienceYears: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={t('profileEdit.placeholders.experienceYears', 'Ex: 8')}
            disabled={disabled}
          />
        </Field>

        <Field
          label={t('profileEdit.fields.specialization', 'Especialització')}
          hint={t('profileEdit.hints.specialization', 'Sistema de joc o mètodes (ex: joc ràpid, formació).')}
        >
          <Input
            type="text"
            value={formData.specialization || ''}
            onChange={(e) => onChange({ specialization: e.target.value })}
            placeholder={t('profileEdit.placeholders.specialization', 'Ex: Transicions ofensives ràpides')}
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Field label={t('profileEdit.fields.genderPreference', 'Gènere d\'equips preferit')}>
          <Select
            value={formData.genderPreference || ''}
            onChange={(e) => onChange({ genderPreference: (e.target.value || undefined) as GenderPref | undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectPreference', 'Sense preferència específica')}</option>
            <option value="male">{t('gender.male', 'Masculí')}</option>
            <option value="female">{t('gender.female', 'Femení')}</option>
            <option value="both">{t('gender.both', 'Masculí i Femení')}</option>
          </Select>
        </Field>

        <Field label={t('profileEdit.fields.categoryPreference', 'Categoria preferida')}>
          <Select
            value={formData.categoryPreference || ''}
            onChange={(e) => onChange({ categoryPreference: (e.target.value || undefined) as CategoryPref | undefined })}
            disabled={disabled}
          >
            <option value="">{t('profileEdit.fields.selectCategory', 'Qualsevol categoria')}</option>
            <option value="youth">{t('category.youth', 'Formació / Base (Infantil, Cadet, etc)')}</option>
            <option value="senior">{t('category.senior', 'Amateur / Rendiment (Sènior)')}</option>
            <option value="both">{t('category.both', 'Ambdues')}</option>
          </Select>
        </Field>
      </div>

      <Field
        label={t('profileEdit.fields.certifications', 'Certificacions i titulacions')}
        hint={t('profileEdit.hints.certifications', 'Una per línia. Ex: UEFA B, Grau en CAFE, Nivell 2 de la FCF.')}
      >
        <Textarea
          value={certificationsText}
          onChange={(e) => handleCertificationsChange(e.target.value)}
          placeholder={t('profileEdit.placeholders.certifications', 'UEFA B\nGrau en Ciències de l\'Activitat Física i de l\'Esport')}
          disabled={disabled}
        />
      </Field>
    </FormSection>
  );
}
