import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Serveis RGPD: exportació de dades (Art. 20) i esborrat de compte (Art. 17).
 * Tota la lògica viu a les Cloud Functions `exportUserData` i
 * `deleteUserAccount`; aquí només hi ha la crida i la descàrrega del fitxer.
 */

export async function exportMyData(): Promise<Record<string, unknown>> {
  const fn = httpsCallable<Record<string, never>, Record<string, unknown>>(functions, 'exportUserData');
  const result = await fn({});
  return result.data;
}

export async function deleteMyAccount(): Promise<void> {
  const fn = httpsCallable(functions, 'deleteUserAccount');
  await fn({});
}

export function downloadAsJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
