import { useState, useCallback } from 'react';
import { updateUserProfile, type ProfileUpdate } from '@/services/profile.service';
import type { User } from '@/types';

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

/**
 * Centralised form state for the Profile editor.
 * Children receive `formData` + `handleChange` and never manage state themselves.
 */
export function useProfileForm(initialUser: User) {
  const [formData, setFormData] = useState<User>(initialUser);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((patch: Partial<User>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
    setStatus((s) => (s === 'success' || s === 'error' ? 'idle' : s));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialUser);
    setIsDirty(false);
    setStatus('idle');
    setError(null);
  }, [initialUser]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!isDirty) return true;

    // Build a patch containing only fields that actually changed.
    const patch: ProfileUpdate = {};
    (Object.keys(formData) as (keyof User)[]).forEach((key) => {
      if (formData[key] !== initialUser[key]) {
        (patch as Record<string, unknown>)[key] = formData[key];
      }
    });

    setStatus('saving');
    setError(null);
    try {
      await updateUserProfile(formData.uid, patch);
      setStatus('success');
      setIsDirty(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desant el perfil');
      setStatus('error');
      return false;
    }
  }, [formData, initialUser, isDirty]);

  return { formData, handleChange, handleSubmit, reset, status, error, isDirty };
}
