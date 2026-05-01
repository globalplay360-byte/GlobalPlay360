import { PRELAUNCH_MODE } from './config/site'

// Preview mode: porta del darrere per accedir a la plataforma sencera quan
// PRELAUNCH_MODE=true està actiu en producció. La idea és que la URL pública
// segueixi mostrant la landing "Pròximament", però des de
// `?preview=demo` (o qualsevol valor que coincideixi amb el token) podem
// arrencar React i navegar pel producte real (per exemple, per a una demo
// guiada amb la clienta).
//
// Un cop activat, persisteix a sessionStorage durant la sessió del navegador.
const PREVIEW_TOKEN = 'demo';
function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === PREVIEW_TOKEN) {
      sessionStorage.setItem('gp360-preview', 'true');
      return true;
    }
    return sessionStorage.getItem('gp360-preview') === 'true';
  } catch {
    return false;
  }
}

// En mode prelaunch SENSE preview, el landing estàtic de l'index.html ho gestiona tot.
// No carreguem React, fonts, i18n, ni Firebase: així evitem re-fetch del vídeo
// i estalviem ~2 MB de bundle als visitants de la coming-soon page.
if (!PRELAUNCH_MODE || isPreviewMode()) {
  import('./bootstrap')
}
