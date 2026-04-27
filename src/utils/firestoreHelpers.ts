import type { QuerySnapshot, DocumentData } from 'firebase/firestore';

/**
 * Mapeja una QuerySnapshot a una array de documents amb el seu `id`.
 * Equival al patró repetit `snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)`.
 */
export function mapDocs<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}
