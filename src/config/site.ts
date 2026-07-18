// Pre-launch mode controls visibility of main site features during development.
export const PRELAUNCH_MODE = import.meta.env.VITE_PRELAUNCH_MODE === 'true';

// Registre públic: per defecte queda tancat i només poden entrar comptes
// existents. Si en el futur es vol reobrir, cal fer el build amb
// `VITE_PUBLIC_REGISTRATION_ENABLED=true`.
export const PUBLIC_REGISTRATION_ENABLED = import.meta.env.VITE_PUBLIC_REGISTRATION_ENABLED === 'true';

// Private preview: si s'activa, el dashboard intern queda restringit a admins.
export const PRIVATE_PREVIEW_MODE = import.meta.env.VITE_PRIVATE_PREVIEW_MODE === 'true';

// Correu públic de contacte visible a la web. Quan existeixi la bústia real,
// només caldrà actualitzar aquest valor.
export const CONTACT_EMAIL = 'info@globalplay360.com';

// Dades del titular del servei (responsable del tractament, Art. 13 RGPD).
// Font de veritat per a ContactPage; els textos legals de src/content/legal
// les dupliquen en HTML estàtic per idioma.
export const LEGAL_EMAIL = 'aleix.perez@hotmail.com';
export const LEGAL_ADDRESS = 'Carrer Joan Maragall, 9 CS, 08754 El Papiol (Barcelona)';
