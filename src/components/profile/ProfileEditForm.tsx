import type { FormEvent } from 'react';
import type { User } from '@/types';
import { useProfileForm } from '@/hooks/useProfileForm';
import { Button } from '@/components/ui/Button';
import CommonFields from './fields/CommonFields';
import PlayerFields from './fields/PlayerFields';

interface Props {
  user: User;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}

export default function ProfileEditForm({ user, onCancel, onSaved }: Props) {
  const { formData, handleChange, handleSubmit, reset, status, error, isDirty } = useProfileForm(user);
  const saving = status === 'saving';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await handleSubmit();
    if (ok) await onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Secció comuna a tots els rols */}
      <CommonFields formData={formData} onChange={handleChange} disabled={saving} />

      {/* Seccions específiques per rol */}
      {user.role === 'player' && (
        <PlayerFields formData={formData} onChange={handleChange} disabled={saving} />
      )}

      {user.role === 'coach' && (
        <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 text-sm text-[#9CA3AF]">
          Secció <span className="text-white font-semibold">Coach</span> en desenvolupament.
        </section>
      )}

      {user.role === 'club' && (
        <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 text-sm text-[#9CA3AF]">
          Secció <span className="text-white font-semibold">Club</span> en desenvolupament.
        </section>
      )}

      {/* Missatge d'estat */}
      {status === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-lg px-4 py-3">
          Perfil actualitzat correctament.
        </div>
      )}
      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Accions */}
      <div className="sticky bottom-0 bg-[#0B1120]/95 backdrop-blur-sm border-t border-[#1F2937] -mx-6 px-6 py-4 flex items-center justify-between gap-3">
        <div className="text-xs text-[#6B7280]">
          {isDirty ? 'Hi ha canvis sense desar.' : 'Sense canvis pendents.'}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onCancel();
            }}
            disabled={saving}
          >
            Cancel·lar
          </Button>
          <Button type="submit" variant="primary" disabled={saving || !isDirty}>
            {saving ? 'Desant…' : 'Desar canvis'}
          </Button>
        </div>
      </div>
    </form>
  );
}
