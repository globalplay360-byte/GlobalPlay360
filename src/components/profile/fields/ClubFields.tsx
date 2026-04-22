import type { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { Field, Input } from './FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function ClubFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-6 rounded bg-[#EC4899] shadow-sm shadow-[#EC4899]/50" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">
          {t('profileEdit.fields.clubData', 'Dades del club')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Field
          label={t('profileEdit.fields.foundedYear', 'Any de fundació')}
          hint={t('profileEdit.hints.foundedYear', 'Any en què es va fundar el club.')}
        >
          <Input
            type="number"
            min={1800}
            max={currentYear}
            value={formData.foundedYear ?? ''}
            onChange={(e) => onChange({ foundedYear: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={t('profileEdit.placeholders.foundedYear', 'Ex: 1899')}
            disabled={disabled}
          />
        </Field>
        <Field
          label={t('profileEdit.fields.website', 'Web oficial')}
          hint={t('profileEdit.hints.website', 'URL pública del club.')}
        >
          <Input
            type="url"
            value={formData.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder={t('profileEdit.placeholders.website', 'https://elteuclub.cat')}
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Field
          label={t('profileEdit.fields.venueName', 'Instal·lació principal')}
          hint={t('profileEdit.hints.venueName', 'Nom de l\'estadi, pavelló o complex esportiu.')}
        >
          <Input
            type="text"
            value={formData.venueName || ''}
            onChange={(e) => onChange({ venueName: e.target.value })}
            placeholder={t('profileEdit.placeholders.venueName', 'Ex: Estadi Municipal')}
            disabled={disabled}
          />
        </Field>
        <Field
          label={t('profileEdit.fields.venueCapacity', 'Aforament')}
          hint={t('profileEdit.hints.venueCapacity', 'Capacitat d\'espectadors de la instal·lació.')}
        >
          <Input
            type="number"
            min={0}
            max={200000}
            value={formData.venueCapacity ?? ''}
            onChange={(e) => onChange({ venueCapacity: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={t('profileEdit.placeholders.venueCapacity', 'Ex: 5000')}
            disabled={disabled}
          />
        </Field>
      </div>
    </section>
  );
}
