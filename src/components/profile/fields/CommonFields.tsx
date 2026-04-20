import { useTranslation } from 'react-i18next';
import type { User } from '@/types';
import { Field, Input, Textarea } from './FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function CommonFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();

  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-[#3B82F6]" />
        <h2 className="text-base font-bold text-white">{t('profileEdit.fields.generalInfo', 'Informació general')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label={t('profileEdit.fields.displayName', 'Nom mostrat')}>
          <Input
            type="text"
            value={formData.displayName || ''}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder={t('profileEdit.placeholders.displayName', 'El teu nom públic')}
            disabled={disabled}
          />
        </Field>
        <Field label={t('profileEdit.fields.country', 'País')}>
          <Input
            type="text"
            value={formData.country || ''}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder={t('profileEdit.placeholders.country', 'Ex: Espanya')}
            disabled={disabled}
          />
        </Field>
      </div>

      <Field label={t('profileEdit.fields.bio', 'Biografia')} hint={t('profileEdit.hints.bio', 'Descriu la teva trajectòria, objectius i experiència.')}>
        <Textarea
          value={formData.bio || ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder={t('profileEdit.placeholders.bio', 'Comparteix la teva història amb clubs i scouts...')}
          disabled={disabled}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label={t('profileEdit.fields.phone', 'Telèfon')} hint={t('profileEdit.hints.phone', 'Visible per clubs premium.')}>
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder={t('profileEdit.placeholders.phone', '+34 600 000 000')}
            disabled={disabled}
          />
        </Field>
        <Field label={t('profileEdit.fields.instagram', 'Instagram')} hint={t('profileEdit.hints.instagram', 'Handle o URL del perfil.')}>
          <Input
            type="text"
            value={formData.instagram || ''}
            onChange={(e) => onChange({ instagram: e.target.value })}
            placeholder={t('profileEdit.placeholders.instagram', '@elteucompte')}
            disabled={disabled}
          />
        </Field>
        <Field label={t('profileEdit.fields.youtube', 'Vídeo Highlights')} hint={t('profileEdit.hints.youtube', 'URL de YouTube amb la teva reel.')}>
          <Input
            type="url"
            value={formData.youtubeVideoUrl || ''}
            onChange={(e) => onChange({ youtubeVideoUrl: e.target.value })}
            placeholder={t('profileEdit.placeholders.youtube', 'https://youtube.com/watch?v=...')}
            disabled={disabled}
          />
        </Field>
      </div>
    </section>
  );
}
