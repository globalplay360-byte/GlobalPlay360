// Per defecte la web mostra la landing "Pròximament" (mode prelaunch).
// Per veure la plataforma sencera en local, posa `VITE_PRELAUNCH_MODE=false`
// al .env.local (que NO es puja al repo). En producció, en absència de la
// variable, es manté `true` fins que tinguem dades legals i Stripe live.
export const PRELAUNCH_MODE = import.meta.env.VITE_PRELAUNCH_MODE !== 'false';

// Private preview: permet accés només a comptes administradors dins la
// plataforma interna, mantenint la landing pública tancada mentre no hi hagi
// llançament oficial, dades fiscals o Stripe live complet.
export const PRIVATE_PREVIEW_MODE = import.meta.env.VITE_PRIVATE_PREVIEW_MODE === 'true';

// Correu públic de contacte visible a la web. Quan existeixi la bústia real,
// només caldrà actualitzar aquest valor.
export const CONTACT_EMAIL = 'info@globalplay360.com';
