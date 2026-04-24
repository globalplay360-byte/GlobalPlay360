import type { LegalLang } from './privacy.content';

export interface CookiesContent {
  subtitle: string;
  sections: { title?: string; html: string }[];
}

export const COOKIES: Record<LegalLang, CookiesContent> = {
  ca: {
    subtitle: 'Com fem servir les cookies i tecnologies similars a GlobalPlay360.',
    sections: [
      {
        html: `<p>Aquesta política explica què són les cookies, quines utilitzem a GlobalPlay360 i com pots gestionar-les. Per al tractament general de dades personals, consulta la nostra <a href="/privacy">Política de privacitat</a>.</p>`
      },
      {
        title: '1. Què són les cookies',
        html: `<p>Les cookies són petits fitxers de text que s'emmagatzemen al teu dispositiu quan visites una pàgina web. Permeten recordar informació sobre la teva visita (idioma, sessió iniciada, preferències) per millorar-ne el funcionament.</p>`
      },
      {
        title: '2. Cookies que utilitzem',
        html: `
          <h3>Cookies tècniques (necessàries)</h3>
          <p>Són imprescindibles perquè la plataforma funcioni. No requereixen consentiment.</p>
          <ul>
            <li><code>firebaseAuth</code> — mantenir la sessió iniciada.</li>
            <li><code>i18nextLng</code> — recordar l'idioma seleccionat.</li>
            <li>Cookies de seguretat i prevenció de CSRF.</li>
          </ul>

          <h3>Cookies de tercers</h3>
          <ul>
            <li><strong>Stripe</strong> — gestió segura de pagaments i prevenció de fraus. Consulta la <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener">política de cookies de Stripe</a>.</li>
            <li><strong>Firebase / Google</strong> — infraestructura, autenticació i rendiment.</li>
          </ul>

          <p>Actualment <strong>no utilitzem cookies analítiques ni publicitàries</strong>. Si en el futur n'afegíssim, se't demanaria el consentiment previ.</p>

          <h3>Durada de les cookies</h3>
          <ul>
            <li><strong>Cookies de sessió</strong>: s'eliminen automàticament quan tanques el navegador (ex: <code>firebaseAuth</code> en sessions temporals).</li>
            <li><strong>Cookies persistents</strong>: es mantenen al dispositiu fins que les elimines manualment o expiren (ex: <code>i18nextLng</code> — 1 any).</li>
            <li><strong>Cookies de tercers</strong>: durada regida per la política pròpia del proveïdor (Stripe, Firebase/Google).</li>
          </ul>
        `
      },
      {
        title: '3. Com gestionar les cookies',
        html: `
          <p>Pots configurar o eliminar cookies des del teu navegador:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/kb/borrar-cookies" target="_blank" rel="noopener">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener">Safari</a></li>
            <li><a href="https://support.microsoft.com/windows/4c2feb58-8d4c-0bb4-1d1e-63cdf2a65c1c" target="_blank" rel="noopener">Microsoft Edge</a></li>
          </ul>
          <p>Tingues en compte que desactivar les cookies tècniques pot afectar el funcionament de la plataforma (no podràs iniciar sessió, per exemple).</p>
        `
      },
      {
        title: '4. Canvis en aquesta política',
        html: `<p>Podem actualitzar aquesta política per reflectir canvis tècnics o legals. Publicarem la nova versió amb la data d'actualització.</p>`
      },
      {
        title: '5. Contacte',
        html: `<p>Per a qualsevol qüestió sobre cookies o privacitat, contacta amb nosaltres a <em style="color:#6B7280">[pendent de configuració]</em>.</p>`
      }
    ]
  },
  es: {
    subtitle: 'Cómo usamos las cookies y tecnologías similares en GlobalPlay360.',
    sections: [
      {
        html: `<p>Esta política explica qué son las cookies, cuáles utilizamos en GlobalPlay360 y cómo puedes gestionarlas. Para el tratamiento general de datos personales, consulta nuestra <a href="/privacy">Política de privacidad</a>.</p>`
      },
      {
        title: '1. Qué son las cookies',
        html: `<p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web. Permiten recordar información sobre tu visita (idioma, sesión iniciada, preferencias) para mejorar su funcionamiento.</p>`
      },
      {
        title: '2. Cookies que utilizamos',
        html: `
          <h3>Cookies técnicas (necesarias)</h3>
          <p>Son imprescindibles para que la plataforma funcione. No requieren consentimiento.</p>
          <ul>
            <li><code>firebaseAuth</code> — mantener la sesión iniciada.</li>
            <li><code>i18nextLng</code> — recordar el idioma seleccionado.</li>
            <li>Cookies de seguridad y prevención de CSRF.</li>
          </ul>

          <h3>Cookies de terceros</h3>
          <ul>
            <li><strong>Stripe</strong> — gestión segura de pagos y prevención de fraudes. Consulta la <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener">política de cookies de Stripe</a>.</li>
            <li><strong>Firebase / Google</strong> — infraestructura, autenticación y rendimiento.</li>
          </ul>

          <p>Actualmente <strong>no utilizamos cookies analíticas ni publicitarias</strong>. Si en el futuro las añadiéramos, se te pediría el consentimiento previo.</p>

          <h3>Duración de las cookies</h3>
          <ul>
            <li><strong>Cookies de sesión</strong>: se eliminan automáticamente al cerrar el navegador (ej: <code>firebaseAuth</code> en sesiones temporales).</li>
            <li><strong>Cookies persistentes</strong>: se mantienen en el dispositivo hasta que las eliminas manualmente o caducan (ej: <code>i18nextLng</code> — 1 año).</li>
            <li><strong>Cookies de terceros</strong>: duración regida por la política propia del proveedor (Stripe, Firebase/Google).</li>
          </ul>
        `
      },
      {
        title: '3. Cómo gestionar las cookies',
        html: `
          <p>Puedes configurar o eliminar cookies desde tu navegador:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/kb/borrar-cookies" target="_blank" rel="noopener">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener">Safari</a></li>
            <li><a href="https://support.microsoft.com/windows/4c2feb58-8d4c-0bb4-1d1e-63cdf2a65c1c" target="_blank" rel="noopener">Microsoft Edge</a></li>
          </ul>
          <p>Ten en cuenta que desactivar las cookies técnicas puede afectar al funcionamiento de la plataforma (no podrás iniciar sesión, por ejemplo).</p>
        `
      },
      {
        title: '4. Cambios en esta política',
        html: `<p>Podemos actualizar esta política para reflejar cambios técnicos o legales. Publicaremos la nueva versión con la fecha de actualización.</p>`
      },
      {
        title: '5. Contacto',
        html: `<p>Para cualquier cuestión sobre cookies o privacidad, contacta con nosotros en <em style="color:#6B7280">[pendent de configuració]</em>.</p>`
      }
    ]
  },
  en: {
    subtitle: 'How we use cookies and similar technologies at GlobalPlay360.',
    sections: [
      {
        html: `<p>This policy explains what cookies are, which ones we use at GlobalPlay360 and how you can manage them. For general personal data processing, see our <a href="/privacy">Privacy Policy</a>.</p>`
      },
      {
        title: '1. What cookies are',
        html: `<p>Cookies are small text files stored on your device when you visit a web page. They allow information about your visit to be remembered (language, logged-in session, preferences) to improve its functioning.</p>`
      },
      {
        title: '2. Cookies we use',
        html: `
          <h3>Technical cookies (necessary)</h3>
          <p>Essential for the platform to function. They do not require consent.</p>
          <ul>
            <li><code>firebaseAuth</code> — keep your session logged in.</li>
            <li><code>i18nextLng</code> — remember the selected language.</li>
            <li>Security and CSRF prevention cookies.</li>
          </ul>

          <h3>Third-party cookies</h3>
          <ul>
            <li><strong>Stripe</strong> — secure payment management and fraud prevention. See <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener">Stripe's cookie policy</a>.</li>
            <li><strong>Firebase / Google</strong> — infrastructure, authentication and performance.</li>
          </ul>

          <p>We currently <strong>do not use analytical or advertising cookies</strong>. If we add them in the future, prior consent will be requested.</p>

          <h3>Cookie duration</h3>
          <ul>
            <li><strong>Session cookies</strong>: automatically deleted when you close the browser (e.g. <code>firebaseAuth</code> in temporary sessions).</li>
            <li><strong>Persistent cookies</strong>: remain on the device until you manually delete them or they expire (e.g. <code>i18nextLng</code> — 1 year).</li>
            <li><strong>Third-party cookies</strong>: duration governed by each provider's own policy (Stripe, Firebase/Google).</li>
          </ul>
        `
      },
      {
        title: '3. How to manage cookies',
        html: `
          <p>You can configure or delete cookies from your browser:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/kb/borrar-cookies" target="_blank" rel="noopener">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener">Safari</a></li>
            <li><a href="https://support.microsoft.com/windows/4c2feb58-8d4c-0bb4-1d1e-63cdf2a65c1c" target="_blank" rel="noopener">Microsoft Edge</a></li>
          </ul>
          <p>Please note that disabling technical cookies may affect platform functioning (you will not be able to log in, for example).</p>
        `
      },
      {
        title: '4. Changes to this policy',
        html: `<p>We may update this policy to reflect technical or legal changes. We will publish the new version with the update date.</p>`
      },
      {
        title: '5. Contact',
        html: `<p>For any question about cookies or privacy, contact us at <em style="color:#6B7280">[pendent de configuració]</em>.</p>`
      }
    ]
  }
};
