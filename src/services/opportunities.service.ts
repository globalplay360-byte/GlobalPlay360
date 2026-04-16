import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Opportunity } from '@/types';

const COLLECTION = 'opportunities';

// ── Read ────────────────────────────────────────────────

/** Fetch all opportunities, ordered by creation date (newest first) */
export async function getOpportunities(): Promise<Opportunity[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Opportunity);
}

/** Fetch opportunities filtered by a single field */
export async function getOpportunitiesByField(
  field: string,
  op: WhereFilterOp,
  value: unknown,
): Promise<Opportunity[]> {
  const q = query(
    collection(db, COLLECTION),
    where(field, op, value),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Opportunity);
}

/** Fetch a single opportunity by its document ID */
export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Opportunity;
}

// ── Write ───────────────────────────────────────────────

/** Create a new opportunity (only clubs should call this) */
export async function createOpportunity(
  data: Omit<Opportunity, 'id' | 'createdAt'>,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    _createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Update an existing opportunity (partial update) */
export async function updateOpportunity(
  id: string,
  data: Partial<Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    _updatedAt: serverTimestamp(),
  });
}

/** Toggle opportunity status between open and closed */
export async function toggleOpportunityStatus(id: string, currentStatus: Opportunity['status']): Promise<void> {
  const newStatus = currentStatus === 'open' ? 'closed' : 'open';
  await updateDoc(doc(db, COLLECTION, id), {
    status: newStatus,
    _updatedAt: serverTimestamp(),
  });
}

/** Delete an opportunity permanently */
export async function deleteOpportunity(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ── Seed (dev only) ─────────────────────────────────────

const SEED_DATA: Omit<Opportunity, 'id'>[] = [
  {
    clubId: '',   // will be filled at seed time
    title: 'Davanter Centre per al Primer Equip',
    sport: 'Football',
    gender: 'male',
    location: 'Barcelona, Spain',
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
    location: 'Madrid, Spain',
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
    location: 'Valencia, Spain',
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
    location: 'Sevilla, Spain',
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
    location: 'Lisbon, Portugal',
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

/**
 * Seed Firestore with sample opportunities.
 * Pass the clubId of the club user who "owns" these opportunities.
 * Intended for development only — call from browser console:
 *   import { seedOpportunities } from '@/services/opportunities.service';
 *   seedOpportunities('uid-of-your-club-user');
 */
export async function seedOpportunities(clubId: string): Promise<string[]> {
  const ids: string[] = [];
  for (const opp of SEED_DATA) {
    const id = await createOpportunity({ ...opp, clubId });
    ids.push(id);
  }
  console.log(`✓ Seeded ${ids.length} opportunities for club ${clubId}`, ids);
  return ids;
}
