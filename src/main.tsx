import { PRELAUNCH_MODE } from './config/site'

// En mode prelaunch, el landing estàtic de l'index.html ho gestiona tot.
// No carreguem React, fonts, i18n, ni Firebase: així evitem re-fetch del vídeo
// i estalviem ~2 MB de bundle als visitants de la coming-soon page.
if (!PRELAUNCH_MODE) {
  import('./bootstrap')
}
