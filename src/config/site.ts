// Per defecte la web mostra la landing "Pròximament" (mode prelaunch).
// Per veure la plataforma sencera en local, posa `VITE_PRELAUNCH_MODE=false`
// al .env.local (que NO es puja al repo). En producció, en absència de la
// variable, es manté `true` fins que tinguem dades legals i Stripe live.
export const PRELAUNCH_MODE = import.meta.env.VITE_PRELAUNCH_MODE !== 'false';
