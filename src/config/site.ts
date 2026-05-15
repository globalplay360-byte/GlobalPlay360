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
