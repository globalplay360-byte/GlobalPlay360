// Helper tipat per llegir el `code` d'errors de Firebase sense `as any`.
// Firebase llança objectes amb shape `{ code: string, message: string }` que
// no estan tipats explícitament a la nostra app. Aquesta funció retorna null
// si l'error no segueix el shape esperat.
export function getFirebaseErrorCode(err: unknown): string | null {
  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  ) {
    return (err as { code: string }).code;
  }
  return null;
}
