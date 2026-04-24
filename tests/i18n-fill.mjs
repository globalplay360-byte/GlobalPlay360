// One-shot: omple les claus que falten als 3 locales amb traduccions neutres.
// No sobreescriu valors existents.
import { readFileSync, writeFileSync } from 'fs';

const LOCALES = ['ca', 'es', 'en'];

// Key → {ca, es, en}
const translations = {
  'adminSidebar.dashboard':     { ca: 'Tauler', es: 'Panel', en: 'Dashboard' },
  'adminSidebar.products':      { ca: 'Productes', es: 'Productos', en: 'Products' },
  'adminSidebar.orders':        { ca: 'Comandes', es: 'Pedidos', en: 'Orders' },
  'adminSidebar.users':         { ca: 'Usuaris', es: 'Usuarios', en: 'Users' },
  'adminSidebar.panel':         { ca: "Panell d'Administració", es: 'Panel de Administración', en: 'Admin Panel' },

  'applications.removeOrphoned': { ca: 'Eliminar registre', es: 'Eliminar registro', en: 'Remove record' },
  'applications.removeOrphaned': { ca: 'Eliminar registre', es: 'Eliminar registro', en: 'Remove record' },

  'authAction.verifySuccess':    { ca: 'Correu verificat correctament.', es: 'Correo verificado correctamente.', en: 'Email verified successfully.' },

  'billing.card.globalPlaySub':  { ca: 'Subscripció GlobalPlay360', es: 'Suscripción GlobalPlay360', en: 'GlobalPlay360 Subscription' },
  'billing.portal.opening':      { ca: 'Obrint portal…', es: 'Abriendo portal…', en: 'Opening portal…' },

  'common.searchOpportunities':  { ca: 'Buscar Oportunitats', es: 'Buscar Oportunidades', en: 'Search Opportunities' },

  'forgotPassword.loginLink':    { ca: 'Tornar al login', es: 'Volver al login', en: 'Back to login' },

  'myOpportunities.confirmDelete': { ca: 'Segur que vols eliminar aquesta oportunitat?', es: '¿Seguro que quieres eliminar esta oportunidad?', en: 'Are you sure you want to delete this opportunity?' },
  'myOpportunities.errorDeleting': { ca: 'Error eliminant l\'oportunitat.', es: 'Error al eliminar la oportunidad.', en: 'Error deleting the opportunity.' },
  'myOpportunities.errorLoading':  { ca: 'Error carregant les oportunitats.', es: 'Error al cargar las oportunidades.', en: 'Error loading opportunities.' },
  'myOpportunities.errorToggling': { ca: 'Error canviant l\'estat.', es: 'Error al cambiar el estado.', en: 'Error toggling status.' },

  'navbar.dashboard':            { ca: 'Panell', es: 'Panel', en: 'Dashboard' },

  'opportunities.viewFullProfile': { ca: 'Veure perfil complet', es: 'Ver perfil completo', en: 'View full profile' },

  'opportunityDetail.roleMismatch': { ca: "Aquesta oportunitat no és per al teu rol.", es: 'Esta oportunidad no es para tu rol.', en: "This opportunity isn't for your role." },

  'overview.noApplicationsYet':     { ca: 'Encara no tens candidatures.', es: 'Aún no tienes candidaturas.', en: 'No applications yet.' },
  'overview.noRecentOpportunities': { ca: 'Cap oportunitat recent.', es: 'Ninguna oportunidad reciente.', en: 'No recent opportunities.' },

  'profileEdit.fields.athleticData':      { ca: 'Dades esportives', es: 'Datos deportivos', en: 'Athletic data' },
  'profileEdit.fields.mainSport':         { ca: 'Esport principal', es: 'Deporte principal', en: 'Main sport' },
  'profileEdit.fields.selectSport':       { ca: 'Selecciona un esport…', es: 'Selecciona un deporte…', en: 'Select a sport…' },
  'profileEdit.fields.dateOfBirth':       { ca: 'Data de naixement', es: 'Fecha de nacimiento', en: 'Date of birth' },
  'profileEdit.fields.height':            { ca: 'Alçada', es: 'Altura', en: 'Height' },
  'profileEdit.fields.weight':            { ca: 'Pes', es: 'Peso', en: 'Weight' },
  'profileEdit.fields.position':          { ca: 'Posició', es: 'Posición', en: 'Position' },
  'profileEdit.fields.selectPlaceholder': { ca: 'Selecciona…', es: 'Selecciona…', en: 'Select…' },
  'profileEdit.fields.preferredFoot':     { ca: 'Peu dominant', es: 'Pie dominante', en: 'Preferred foot' },
  'profileEdit.fields.left':              { ca: 'Esquerre', es: 'Izquierdo', en: 'Left' },
  'profileEdit.fields.right':             { ca: 'Dret', es: 'Derecho', en: 'Right' },
  'profileEdit.fields.both':              { ca: 'Ambdós', es: 'Ambos', en: 'Both' },
  'profileEdit.fields.leftHanded':        { ca: 'Esquerrà', es: 'Zurdo', en: 'Left-handed' },
  'profileEdit.fields.rightHanded':       { ca: 'Dretà', es: 'Diestro', en: 'Right-handed' },
  'profileEdit.fields.oneHanded':         { ca: 'A una mà', es: 'A una mano', en: 'One-handed' },
  'profileEdit.fields.twoHanded':         { ca: 'A dues mans', es: 'A dos manos', en: 'Two-handed' },
  'profileEdit.fields.genderPreference':  { ca: 'Preferència de gènere', es: 'Preferencia de género', en: 'Gender preference' },
  'profileEdit.fields.categoryPreference':{ ca: 'Preferència de categoria', es: 'Preferencia de categoría', en: 'Category preference' },
  'profileEdit.fields.selectPreference':  { ca: 'Selecciona una preferència…', es: 'Selecciona una preferencia…', en: 'Select a preference…' },
  'profileEdit.fields.selectCategory':    { ca: 'Selecciona una categoria…', es: 'Selecciona una categoría…', en: 'Select a category…' },

  'profileEdit.hints.height':             { ca: 'En centímetres (cm)', es: 'En centímetros (cm)', en: 'In centimeters (cm)' },
  'profileEdit.hints.weight':             { ca: 'En kilograms (kg)', es: 'En kilogramos (kg)', en: 'In kilograms (kg)' },
  'profileEdit.placeholders.height':      { ca: 'Ex: 180', es: 'Ej: 180', en: 'E.g. 180' },
  'profileEdit.placeholders.weight':      { ca: 'Ex: 75', es: 'Ej: 75', en: 'E.g. 75' },

  'publicProfile.error':                  { ca: 'Error carregant el perfil.', es: 'Error al cargar el perfil.', en: 'Error loading profile.' },
  'publicProfile.notFound':               { ca: 'Perfil no trobat.', es: 'Perfil no encontrado.', en: 'Profile not found.' },
  'publicProfile.hideDetails':            { ca: 'Dades de contacte ocultes per al Pla Free', es: 'Datos de contacto ocultos para el Plan Free', en: 'Contact info hidden for Free plan' },
  'publicProfile.lockedTitle':            { ca: 'Estadístiques i Contacte Protegits', es: 'Estadísticas y Contacto Protegidos', en: 'Stats and Contact Locked' },
  'publicProfile.lockedDesc':             { ca: "Els usuaris del Pla Free no tenen accés complet als perfils d'altres usuaris. Passa't a Premium per desbloquejar-ho.", es: 'Los usuarios del Plan Free no tienen acceso completo a los perfiles de otros usuarios. Pásate a Premium para desbloquearlo.', en: "Free users don't have full access to other profiles. Upgrade to Premium to unlock." },
  'publicProfile.sendMessage':            { ca: 'Enviar missatge', es: 'Enviar mensaje', en: 'Send message' },

  'sports.american_football':             { ca: 'Futbol Americà', es: 'Fútbol Americano', en: 'American Football' },
  'sports.football':                      { ca: 'Futbol 11', es: 'Fútbol 11', en: 'Football' },
  'sports.basketball':                    { ca: 'Bàsquet', es: 'Baloncesto', en: 'Basketball' },
  'sports.futsal':                        { ca: 'Futbol Sala', es: 'Fútbol Sala', en: 'Futsal' },
  'sports.volleyball':                    { ca: 'Voleibol', es: 'Voleibol', en: 'Volleyball' },
  'sports.handball':                      { ca: 'Handbol', es: 'Balonmano', en: 'Handball' },
  'sports.waterpolo':                     { ca: 'Waterpolo', es: 'Waterpolo', en: 'Water polo' },
  'sports.tennis':                        { ca: 'Tennis', es: 'Tenis', en: 'Tennis' },
  'sports.rugby':                         { ca: 'Rugbi', es: 'Rugby', en: 'Rugby' },
  'sports.hockey':                        { ca: 'Hoquei', es: 'Hockey', en: 'Hockey' },
  'sports.other':                         { ca: 'Altres', es: 'Otros', en: 'Other' },
  'sports.details':                       { ca: 'Detalls esportius', es: 'Detalles deportivos', en: 'Sport details' },

  'topbar.openMenu':                      { ca: 'Obrir menú', es: 'Abrir menú', en: 'Open menu' },
  'topbar.notifications':                 { ca: 'Notificacions', es: 'Notificaciones', en: 'Notifications' },

  // S7-T5 — Empty states role-aware a ApplicationsPage
  'applications.emptyTitlePlayer': { ca: 'Encara no has aplicat a cap oportunitat', es: 'Aún no has aplicado a ninguna oportunidad', en: "You haven't applied to any opportunity yet" },
  'applications.emptyDescPlayer':  { ca: 'Explora el marketplace i envia la teva primera candidatura a clubs o ofertes que encaixin amb el teu perfil.', es: 'Explora el marketplace y envía tu primera candidatura a clubes u ofertas que encajen con tu perfil.', en: 'Browse the marketplace and send your first application to clubs or offers that match your profile.' },
  'applications.emptyTitleClub':   { ca: 'Encara no has rebut candidatures', es: 'Aún no has recibido candidaturas', en: "You haven't received any applications yet" },
  'applications.emptyDescClub':    { ca: 'Quan algú apliqui a les teves ofertes, apareixeran aquí per gestionar-les.', es: 'Cuando alguien aplique a tus ofertas, aparecerán aquí para gestionarlas.', en: 'When someone applies to your offers, they will appear here to be managed.' },
  'applications.emptyCtaClub':     { ca: 'Gestionar les meves ofertes', es: 'Gestionar mis ofertas', en: 'Manage my offers' },

  // S7-T4 — aria-label del input file ocult a ProfilePage
  'profile.uploadAvatar':          { ca: 'Pujar imatge de perfil', es: 'Subir imagen de perfil', en: 'Upload profile picture' },
};

// deep set k.path.x = val (no sobreescriu si ja existeix)
function deepSet(obj, dottedKey, val) {
  const parts = dottedKey.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (cur[last] === undefined) cur[last] = val;
}

let added = { ca: 0, es: 0, en: 0 };

for (const loc of LOCALES) {
  const path = `src/locales/${loc}/common.json`;
  const json = JSON.parse(readFileSync(path, 'utf8'));
  for (const [key, val] of Object.entries(translations)) {
    const before = JSON.stringify(json);
    deepSet(json, key, val[loc]);
    if (JSON.stringify(json) !== before) added[loc]++;
  }
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

console.log('Filled missing keys:');
for (const loc of LOCALES) console.log(`  ${loc}: +${added[loc]}`);
