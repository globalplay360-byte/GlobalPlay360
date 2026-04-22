import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input, Textarea } from './FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function CoachFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();

  const certificationsText = (formData.certifications ?? []).join('\n');

  const handleCertificationsChange = (value: string) => {
    const list = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onChange({ certifications: list.length > 0 ? list : undefined });
  };

  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-6 rounded bg-[#FFC107] shadow-sm shadow-[#FFC107]/50" />
        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
          {t('profileEdit.fields.coachData', 'Dades d\'entrenador')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
          hint={t('profileEdit.hints.specialization', 'Categoria, franja d\'edat o metodologia principal.')}
        >
          <Input
            type="text"
            value={formData.specialization || ''}
            onChange={(e) => onChange({ specialization: e.target.value })}
            placeholder={t('profileEdit.placeholders.specialization', 'Ex: Futbol base, categoria juvenil')}
            disabled={disabled}
          />
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
