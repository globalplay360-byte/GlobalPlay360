import type { User, Sport } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input, Textarea, Select } from './FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function CoachFields({ formData, onChange, disabled }: Props) {
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

  const certificationsText = (formData.certifications ?? []).join('\n');

  const handleCertificationsChange = (value: string) => {
    // Al separar només per \n no pre-filtrem dades mentre l'usuari escriu.
    // Això preveu que el component es "mengi" els salts de línia al teclejar "Enter"
    const list = value.split('\n');
    onChange({ certifications: list.length > 0 ? list : undefined });
  };

  const handleSportChange = (value: string) => {
    const newSport = (value || undefined) as Sport | undefined;
    onChange({ sport: newSport });
  };

  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1 h-5 rounded-md bg-[#FFC107] shadow-sm shadow-[#FFC107]/30" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">
          {t('profileEdit.fields.coachData', 'Dades d\'entrenador')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <Field label={t('profileEdit.fields.mainSport', 'Esport principal')}>
          <Select value={formData.sport || ''} onChange={(e) => handleSportChange(e.target.value)} disabled={disabled}>
            <option value="">{t('profileEdit.fields.selectSport', 'Selecciona un esport')}</option>
            {SPORT_OPTIONS.map((o) => (
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
            onChange={(e) => onChange({ genderPreference: (e.target.value as any) || undefined })} 
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
            onChange={(e) => onChange({ categoryPreference: (e.target.value as any) || undefined })} 
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
    </section>
  );
}
