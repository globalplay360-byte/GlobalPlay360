import type { User } from '@/types';
import { Field, Input, Textarea } from './FormControls';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function CommonFields({ formData, onChange, disabled }: Props) {
  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded bg-[#3B82F6]" />
        <h2 className="text-base font-bold text-white">Informació general</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nom mostrat">
          <Input
            type="text"
            value={formData.displayName || ''}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="El teu nom públic"
            disabled={disabled}
          />
        </Field>
        <Field label="País">
          <Input
            type="text"
            value={formData.country || ''}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder="Ex: Espanya"
            disabled={disabled}
          />
        </Field>
      </div>

      <Field label="Biografia" hint="Descriu la teva trajectòria, objectius i experiència.">
        <Textarea
          value={formData.bio || ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Comparteix la teva història amb clubs i scouts..."
          disabled={disabled}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Telèfon" hint="Visible per clubs premium.">
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+34 600 000 000"
            disabled={disabled}
          />
        </Field>
        <Field label="Instagram" hint="Handle o URL del perfil.">
          <Input
            type="text"
            value={formData.instagram || ''}
            onChange={(e) => onChange({ instagram: e.target.value })}
            placeholder="@elteucompte"
            disabled={disabled}
          />
        </Field>
        <Field label="Vídeo Highlights" hint="URL de YouTube amb la teva reel.">
          <Input
            type="url"
            value={formData.youtubeVideoUrl || ''}
            onChange={(e) => onChange({ youtubeVideoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            disabled={disabled}
          />
        </Field>
      </div>
    </section>
  );
}
