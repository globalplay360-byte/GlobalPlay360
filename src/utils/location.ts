import type { Opportunity } from '@/types';

/**
 * Text d’ubicació per a llistats i targetes sense importar `country-state-city`.
 * Resoldre ISO → nom complet es fa als formularis (react-select + dades); aquí
 * només es concatena el que ja ve de Firestore per evitar carregar ~600kB+ de
 * dades globals al chunk de pàgines com Oportunitats (crític a Safari iOS).
 */
export function formatLocation(opp: Partial<Opportunity> & { location?: string }): string {
  if (opp.location && !opp.country) {
    return opp.location;
  }

  const parts: string[] = [];
  if (opp.city) parts.push(opp.city);
  if (opp.state) parts.push(opp.state);
  if (opp.country) parts.push(opp.country);

  return parts.filter(Boolean).join(', ') || 'Ubicació no especificada';
}
