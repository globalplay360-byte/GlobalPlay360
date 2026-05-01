import { createOpportunity } from '@/services/opportunities.service';
import type { Opportunity } from '@/types';

// Dev-only seed data. Aquest fitxer NO el referencia ningú estàticament,
// així Rollup el deixa fora del bundle de producció.
//
// Per executar-lo des de la consola del navegador en mode dev:
//   const { seedOpportunities } = await import('/src/dev/seedOpportunities.ts');
//   await seedOpportunities('uid-of-your-club-user');

const SEED_DATA: Omit<Opportunity, 'id'>[] = [
  {
    clubId: '',
    title: 'Davanter Centre per al Primer Equip',
    sport: 'Football',
    gender: 'male',
    country: 'ES', state: 'CT', city: 'Barcelona',
    contractType: 'pro',
    description:
      'Busquem un davanter jove i letal de cara al gol per reforçar el primer equip. Instal·lacions d\'elit, allotjament i manutenció inclosos.\n\nEl candidat ideal té experiència professional i passaport europeu. Incorporació immediata.',
    requirements: [
      'Menor de 23 anys',
      'Passaport europeu',
      'Mínim 15 gols la temporada passada',
      'Disponibilitat immediata',
    ],
    status: 'open',
    createdAt: '2026-04-10T09:00:00Z',
  },
  {
    clubId: '',
    title: 'Entrenador de Porters — Sènior',
    sport: 'Football',
    gender: 'mixed',
    country: 'ES', state: 'MD', city: 'Madrid',
    contractType: 'pro',
    description:
      'Necessitem urgentment un entrenador de porters amb experiència per als equips sènior masculí i femení.\n\nAlt nivell d\'intensitat, comprensió tàctica i capacitat per treballar amb professionals d\'elit.',
    requirements: [
      'Llicència UEFA A',
      '5+ anys d\'experiència',
      'Castellà i anglès fluids',
    ],
    status: 'open',
    createdAt: '2026-04-12T14:30:00Z',
  },
  {
    clubId: '',
    title: 'Lateral Dret — Acadèmia Sub-19',
    sport: 'Football',
    gender: 'male',
    country: 'ES', state: 'VC', city: 'Valencia',
    contractType: 'academy',
    description:
      'L\'acadèmia del club cerca un lateral dret amb projecció ofensiva per completar la plantilla Sub-19.\n\nOferim beca esportiva completa, estudis compatibilitzats i seguiment personalitzat.',
    requirements: [
      'Nascut entre 2007 i 2009',
      'Experiència en lliga regional o nacional',
      'Bona capacitat física i tècnica',
    ],
    status: 'open',
    createdAt: '2026-04-14T11:00:00Z',
  },
  {
    clubId: '',
    title: 'Preparador Físic — Futbol Femení',
    sport: 'Football',
    gender: 'female',
    country: 'ES', state: 'AN', city: 'Sevilla',
    contractType: 'semi-pro',
    description:
      'Club de primera divisió femenina necessita un/a preparador/a físic/a per a la temporada 2026-27.\n\nEs valorarà experiència prèvia en futbol femení i coneixement de prevenció de lesions específiques.',
    requirements: [
      'Grau en CAFE o equivalent',
      'Experiència mínima de 2 anys',
      'Disponibilitat per viatjar',
    ],
    status: 'open',
    createdAt: '2026-04-15T08:45:00Z',
  },
  {
    clubId: '',
    title: 'Proves Obertes — Temporada 2026/27',
    sport: 'Football',
    gender: 'mixed',
    country: 'PT', state: '11', city: 'Lisbon',
    contractType: 'trial',
    description:
      'Organitzem unes jornades de proves obertes per a jugadors i jugadores que busquin equip de cara a la propera temporada.\n\nEls seleccionats podran optar a contracte semi-professional o acadèmic.',
    requirements: [
      'Majors de 16 anys',
      'Vídeo de highlights actualitzat',
      'Informe mèdic recent',
    ],
    status: 'open',
    createdAt: '2026-04-16T10:00:00Z',
  },
];

export async function seedOpportunities(clubId: string): Promise<string[]> {
  const ids: string[] = [];
  for (const opp of SEED_DATA) {
    const id = await createOpportunity({ ...opp, clubId });
    ids.push(id);
  }
  console.log(`✓ Seeded ${ids.length} opportunities for club ${clubId}`, ids);
  return ids;
}
