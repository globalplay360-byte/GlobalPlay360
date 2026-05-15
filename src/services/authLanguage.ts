import i18n from 'i18next';
import { auth } from './firebase';

// Sincronitza l'idioma de Firebase Auth amb el d'i18next perquè els correus
// transaccionals (verificació, reset de contrasenya) arribin en el mateix
// idioma que l'usuari està veient a la web. Sense això, Firebase envia tot
// en anglès per defecte, independentment del que esculli l'usuari al selector.
auth.languageCode = i18n.language;

i18n.on('languageChanged', (lng) => {
  auth.languageCode = lng;
});
