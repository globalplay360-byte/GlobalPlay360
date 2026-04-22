export type LegalLang = 'ca' | 'es' | 'en';

export interface PrivacyContent {
  subtitle: string;
  sections: { title?: string; html: string }[];
}

export const PRIVACY: Record<LegalLang, PrivacyContent> = {
  ca: {
    subtitle: 'Com recollim, utilitzem i protegim les teves dades personals a GlobalPlay360.',
    sections: [
      {
        html: `<p>A GlobalPlay360 ens prenem seriosament la privacitat dels nostres usuaris. Aquesta política explica quines dades personals recollim, per a què les fem servir, amb qui les compartim i quins drets tens com a usuari.</p>`
      },
      {
        title: '1. Responsable del tractament',
        html: `
          <p>El responsable del tractament de les teves dades personals és:</p>
          <ul>
            <li><strong>Titular:</strong> [PENDENT_RESPONSABLE]</li>
            <li><strong>Denominació social:</strong> [PENDENT_NOM_LEGAL]</li>
            <li><strong>NIF:</strong> [PENDENT_NIF]</li>
            <li><strong>Domicili:</strong> [PENDENT_DOMICILI]</li>
            <li><strong>Correu electrònic:</strong> <a href="mailto:[PENDENT_EMAIL_LEGAL]">[PENDENT_EMAIL_LEGAL]</a></li>
            <li><strong>Delegat de Protecció de Dades (DPO):</strong> <a href="mailto:[PENDENT_EMAIL_DPO]">[PENDENT_EMAIL_DPO]</a></li>
          </ul>
        `
      },
      {
        title: '2. Dades que recollim',
        html: `
          <p>Recollim únicament les dades necessàries per prestar-te el servei:</p>
          <ul>
            <li><strong>Dades d'identificació:</strong> nom, cognoms, adreça de correu electrònic, contrasenya (encriptada), rol (jugador, entrenador o club).</li>
            <li><strong>Dades de perfil esportiu:</strong> esport, posició, data de naixement, alçada, pes, vídeos i enllaços que decideixis publicar.</li>
            <li><strong>Dades de club (si s'escau):</strong> nom, any de fundació, web, instal·lació, aforament.</li>
            <li><strong>Dades de facturació:</strong> processades directament per Stripe. No emmagatzemem dades de targeta a la nostra base de dades.</li>
            <li><strong>Dades d'ús:</strong> adreça IP, tipus de dispositiu, navegador, pàgines visitades, en registres tècnics gestionats per Firebase (Google).</li>
            <li><strong>Comunicacions:</strong> missatges enviats a altres usuaris dins la plataforma, per garantir la seguretat i la resolució d'incidències.</li>
          </ul>
        `
      },
      {
        title: '3. Finalitat del tractament',
        html: `
          <p>Utilitzem les teves dades per a les finalitats següents:</p>
          <ul>
            <li>Prestar el servei de GlobalPlay360: connectar jugadors, entrenadors i clubs.</li>
            <li>Gestionar el teu compte i processar pagaments de subscripcions.</li>
            <li>Enviar-te notificacions essencials del servei (verificació d'email, reset de contrasenya, confirmacions de pagament).</li>
            <li>Complir amb obligacions legals, fiscals i comptables.</li>
            <li>Millorar el producte mitjançant anàlisi agregada i anònima.</li>
          </ul>
        `
      },
      {
        title: '4. Base legal',
        html: `
          <p>El tractament de les teves dades es basa en:</p>
          <ul>
            <li><strong>Execució d'un contracte</strong> (art. 6.1.b RGPD): per prestar-te el servei al qual et subscrius.</li>
            <li><strong>Consentiment</strong> (art. 6.1.a RGPD): per a comunicacions de màrqueting opcional, que pots retirar en qualsevol moment.</li>
            <li><strong>Interès legítim</strong> (art. 6.1.f RGPD): per a la seguretat de la plataforma i la prevenció de fraus.</li>
            <li><strong>Obligació legal</strong> (art. 6.1.c RGPD): per complir la normativa fiscal i mercantil.</li>
          </ul>
        `
      },
      {
        title: '5. Amb qui compartim les teves dades',
        html: `
          <p>No venem les teves dades. Compartim la informació estrictament necessària amb els proveïdors següents (encarregats del tractament):</p>
          <ul>
            <li><strong>Google / Firebase</strong> (infraestructura cloud, autenticació, base de dades, emmagatzematge): dades allotjades a servidors de la UE (europe-west1). Podeu consultar el seu <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">compromís de privacitat</a>.</li>
            <li><strong>Stripe</strong> (processament de pagaments): compleix amb PCI-DSS i RGPD. Consulta la seva <a href="https://stripe.com/privacy" target="_blank" rel="noopener">política de privacitat</a>.</li>
          </ul>
          <p>Aquests proveïdors poden transferir dades a tercers països (EUA) sota les Clàusules Contractuals Tipus aprovades per la Comissió Europea.</p>
        `
      },
      {
        title: '6. Els teus drets',
        html: `
          <p>Com a usuari tens dret a:</p>
          <ul>
            <li><strong>Accés:</strong> saber quines dades tenim sobre tu.</li>
            <li><strong>Rectificació:</strong> corregir dades inexactes o incompletes.</li>
            <li><strong>Supressió:</strong> demanar l'eliminació del teu compte i dades.</li>
            <li><strong>Limitació:</strong> restringir el tractament en determinats casos.</li>
            <li><strong>Portabilitat:</strong> rebre les teves dades en format estructurat.</li>
            <li><strong>Oposició:</strong> oposar-te al tractament basat en interès legítim.</li>
            <li><strong>Retirar consentiment:</strong> per a tractaments basats en consentiment.</li>
          </ul>
          <p>Per exercir aquests drets, envia un correu a <a href="mailto:[PENDENT_EMAIL_LEGAL]">[PENDENT_EMAIL_LEGAL]</a> amb una còpia del teu DNI o document equivalent. Respondrem en un màxim de 30 dies.</p>
          <p>Si consideres que no hem respost correctament, pots presentar una reclamació davant l'<strong>Agència Espanyola de Protecció de Dades</strong> (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>
        `
      },
      {
        title: '7. Conservació de les dades',
        html: `
          <p>Conservem les teves dades mentre tinguis un compte actiu. Un cop el suprimeixis, eliminarem les dades en un termini màxim de 30 dies, excepte aquelles que estiguem obligats a conservar per obligacions legals (fiscalitat: 6 anys).</p>
        `
      },
      {
        title: '8. Menors',
        html: `
          <p>GlobalPlay360 no està dirigit a menors de 16 anys. Si ets menor de 16 anys necessites el consentiment dels teus tutors legals per registrar-te. Si detectem comptes de menors sense autorització, els suspendrem.</p>
        `
      },
      {
        title: '9. Seguretat',
        html: `
          <p>Apliquem mesures tècniques i organitzatives adequades per protegir les teves dades: encriptació en trànsit (HTTPS), encriptació en repòs (Firebase), regles d'accés restrictives, i revisions periòdiques de seguretat.</p>
        `
      },
      {
        title: '10. Canvis en aquesta política',
        html: `
          <p>Podem actualitzar aquesta política per reflectir canvis legals o del servei. Publicarem la nova versió amb la data d'actualització. Si els canvis són substancials, t'avisarem per correu electrònic.</p>
        `
      }
    ]
  },
  es: {
    subtitle: 'Cómo recogemos, utilizamos y protegemos tus datos personales en GlobalPlay360.',
    sections: [
      {
        html: `<p>En GlobalPlay360 nos tomamos en serio la privacidad de nuestros usuarios. Esta política explica qué datos personales recogemos, para qué los utilizamos, con quién los compartimos y qué derechos tienes como usuario.</p>`
      },
      {
        title: '1. Responsable del tratamiento',
        html: `
          <p>El responsable del tratamiento de tus datos personales es:</p>
          <ul>
            <li><strong>Titular:</strong> [PENDENT_RESPONSABLE]</li>
            <li><strong>Denominación social:</strong> [PENDENT_NOM_LEGAL]</li>
            <li><strong>NIF:</strong> [PENDENT_NIF]</li>
            <li><strong>Domicilio:</strong> [PENDENT_DOMICILI]</li>
            <li><strong>Correo electrónico:</strong> <a href="mailto:[PENDENT_EMAIL_LEGAL]">[PENDENT_EMAIL_LEGAL]</a></li>
            <li><strong>Delegado de Protección de Datos (DPO):</strong> <a href="mailto:[PENDENT_EMAIL_DPO]">[PENDENT_EMAIL_DPO]</a></li>
          </ul>
        `
      },
      {
        title: '2. Datos que recogemos',
        html: `
          <p>Recogemos únicamente los datos necesarios para prestarte el servicio:</p>
          <ul>
            <li><strong>Datos de identificación:</strong> nombre, apellidos, dirección de correo electrónico, contraseña (encriptada), rol (jugador, entrenador o club).</li>
            <li><strong>Datos de perfil deportivo:</strong> deporte, posición, fecha de nacimiento, altura, peso, vídeos y enlaces que decidas publicar.</li>
            <li><strong>Datos de club (si procede):</strong> nombre, año de fundación, web, instalación, aforo.</li>
            <li><strong>Datos de facturación:</strong> procesados directamente por Stripe. No almacenamos datos de tarjeta en nuestra base de datos.</li>
            <li><strong>Datos de uso:</strong> dirección IP, tipo de dispositivo, navegador, páginas visitadas, en registros técnicos gestionados por Firebase (Google).</li>
            <li><strong>Comunicaciones:</strong> mensajes enviados a otros usuarios dentro de la plataforma, para garantizar la seguridad y la resolución de incidencias.</li>
          </ul>
        `
      },
      {
        title: '3. Finalidad del tratamiento',
        html: `
          <p>Utilizamos tus datos para las siguientes finalidades:</p>
          <ul>
            <li>Prestar el servicio de GlobalPlay360: conectar jugadores, entrenadores y clubes.</li>
            <li>Gestionar tu cuenta y procesar pagos de suscripciones.</li>
            <li>Enviarte notificaciones esenciales del servicio (verificación de email, reset de contraseña, confirmaciones de pago).</li>
            <li>Cumplir con obligaciones legales, fiscales y contables.</li>
            <li>Mejorar el producto mediante análisis agregado y anónimo.</li>
          </ul>
        `
      },
      {
        title: '4. Base legal',
        html: `
          <p>El tratamiento de tus datos se basa en:</p>
          <ul>
            <li><strong>Ejecución de un contrato</strong> (art. 6.1.b RGPD): para prestarte el servicio al que te suscribes.</li>
            <li><strong>Consentimiento</strong> (art. 6.1.a RGPD): para comunicaciones de marketing opcionales, que puedes retirar en cualquier momento.</li>
            <li><strong>Interés legítimo</strong> (art. 6.1.f RGPD): para la seguridad de la plataforma y la prevención de fraudes.</li>
            <li><strong>Obligación legal</strong> (art. 6.1.c RGPD): para cumplir la normativa fiscal y mercantil.</li>
          </ul>
        `
      },
      {
        title: '5. Con quién compartimos tus datos',
        html: `
          <p>No vendemos tus datos. Compartimos la información estrictamente necesaria con los siguientes proveedores (encargados del tratamiento):</p>
          <ul>
            <li><strong>Google / Firebase</strong> (infraestructura cloud, autenticación, base de datos, almacenamiento): datos alojados en servidores de la UE (europe-west1). Puedes consultar su <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">compromiso de privacidad</a>.</li>
            <li><strong>Stripe</strong> (procesamiento de pagos): cumple con PCI-DSS y RGPD. Consulta su <a href="https://stripe.com/privacy" target="_blank" rel="noopener">política de privacidad</a>.</li>
          </ul>
          <p>Estos proveedores pueden transferir datos a terceros países (EE. UU.) bajo las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.</p>
        `
      },
      {
        title: '6. Tus derechos',
        html: `
          <p>Como usuario tienes derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> saber qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> pedir la eliminación de tu cuenta y datos.</li>
            <li><strong>Limitación:</strong> restringir el tratamiento en determinados casos.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
            <li><strong>Retirar consentimiento:</strong> para tratamientos basados en consentimiento.</li>
          </ul>
          <p>Para ejercer estos derechos, envía un correo a <a href="mailto:[PENDENT_EMAIL_LEGAL]">[PENDENT_EMAIL_LEGAL]</a> con copia de tu DNI o documento equivalente. Responderemos en un máximo de 30 días.</p>
          <p>Si consideras que no hemos respondido correctamente, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>
        `
      },
      {
        title: '7. Conservación de los datos',
        html: `
          <p>Conservamos tus datos mientras tengas una cuenta activa. Una vez la suprimas, eliminaremos los datos en un plazo máximo de 30 días, excepto aquellos que estemos obligados a conservar por obligaciones legales (fiscalidad: 6 años).</p>
        `
      },
      {
        title: '8. Menores',
        html: `
          <p>GlobalPlay360 no está dirigido a menores de 16 años. Si eres menor de 16 años necesitas el consentimiento de tus tutores legales para registrarte. Si detectamos cuentas de menores sin autorización, las suspenderemos.</p>
        `
      },
      {
        title: '9. Seguridad',
        html: `
          <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos: encriptación en tránsito (HTTPS), encriptación en reposo (Firebase), reglas de acceso restrictivas y revisiones periódicas de seguridad.</p>
        `
      },
      {
        title: '10. Cambios en esta política',
        html: `
          <p>Podemos actualizar esta política para reflejar cambios legales o del servicio. Publicaremos la nueva versión con la fecha de actualización. Si los cambios son sustanciales, te avisaremos por correo electrónico.</p>
        `
      }
    ]
  },
  en: {
    subtitle: 'How we collect, use and protect your personal data at GlobalPlay360.',
    sections: [
      {
        html: `<p>At GlobalPlay360 we take our users' privacy seriously. This policy explains what personal data we collect, what we use it for, who we share it with, and what rights you have as a user.</p>`
      },
      {
        title: '1. Data controller',
        html: `
          <p>The controller of your personal data is:</p>
          <ul>
            <li><strong>Owner:</strong> [PENDENT_RESPONSABLE]</li>
            <li><strong>Legal entity:</strong> [PENDENT_NOM_LEGAL]</li>
            <li><strong>Tax ID:</strong> [PENDENT_NIF]</li>
            <li><strong>Address:</strong> [PENDENT_DOMICILI]</li>
            <li><strong>Email:</strong> <a href="mailto:[PENDENT_EMAIL_LEGAL]">[PENDENT_EMAIL_LEGAL]</a></li>
            <li><strong>Data Protection Officer (DPO):</strong> <a href="mailto:[PENDENT_EMAIL_DPO]">[PENDENT_EMAIL_DPO]</a></li>
          </ul>
        `
      },
      {
        title: '2. Data we collect',
        html: `
          <p>We only collect data necessary to provide you the service:</p>
          <ul>
            <li><strong>Identification:</strong> name, surname, email address, password (encrypted), role (player, coach or club).</li>
            <li><strong>Sport profile:</strong> sport, position, date of birth, height, weight, videos and links you choose to publish.</li>
            <li><strong>Club data (if applicable):</strong> name, founded year, website, venue, capacity.</li>
            <li><strong>Billing data:</strong> processed directly by Stripe. We do not store card details in our database.</li>
            <li><strong>Usage data:</strong> IP address, device type, browser, visited pages, in technical logs managed by Firebase (Google).</li>
            <li><strong>Communications:</strong> messages sent to other users within the platform, to ensure security and incident resolution.</li>
          </ul>
        `
      },
      {
        title: '3. Purpose of processing',
        html: `
          <p>We use your data for the following purposes:</p>
          <ul>
            <li>Providing the GlobalPlay360 service: connecting players, coaches and clubs.</li>
            <li>Managing your account and processing subscription payments.</li>
            <li>Sending essential service notifications (email verification, password reset, payment confirmations).</li>
            <li>Complying with legal, tax and accounting obligations.</li>
            <li>Improving the product through aggregated and anonymous analysis.</li>
          </ul>
        `
      },
      {
        title: '4. Legal basis',
        html: `
          <p>The processing of your data is based on:</p>
          <ul>
            <li><strong>Contract performance</strong> (art. 6.1.b GDPR): to provide the service you subscribe to.</li>
            <li><strong>Consent</strong> (art. 6.1.a GDPR): for optional marketing communications, which you can withdraw at any time.</li>
            <li><strong>Legitimate interest</strong> (art. 6.1.f GDPR): for platform security and fraud prevention.</li>
            <li><strong>Legal obligation</strong> (art. 6.1.c GDPR): to comply with tax and commercial regulations.</li>
          </ul>
        `
      },
      {
        title: '5. Who we share your data with',
        html: `
          <p>We do not sell your data. We share strictly necessary information with the following providers (data processors):</p>
          <ul>
            <li><strong>Google / Firebase</strong> (cloud infrastructure, authentication, database, storage): data hosted on EU servers (europe-west1). See their <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">privacy commitment</a>.</li>
            <li><strong>Stripe</strong> (payment processing): compliant with PCI-DSS and GDPR. See their <a href="https://stripe.com/privacy" target="_blank" rel="noopener">privacy policy</a>.</li>
          </ul>
          <p>These providers may transfer data to third countries (U.S.) under the Standard Contractual Clauses approved by the European Commission.</p>
        `
      },
      {
        title: '6. Your rights',
        html: `
          <p>As a user you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> know what data we hold about you.</li>
            <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> request deletion of your account and data.</li>
            <li><strong>Restriction:</strong> restrict processing in certain cases.</li>
            <li><strong>Portability:</strong> receive your data in a structured format.</li>
            <li><strong>Objection:</strong> object to processing based on legitimate interest.</li>
            <li><strong>Withdraw consent:</strong> for processing based on consent.</li>
          </ul>
          <p>To exercise these rights, send an email to <a href="mailto:[PENDENT_EMAIL_LEGAL]">[PENDENT_EMAIL_LEGAL]</a> with a copy of your ID or equivalent document. We will respond within a maximum of 30 days.</p>
          <p>If you believe we have not responded correctly, you can file a complaint with the <strong>Spanish Data Protection Agency</strong> (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>
        `
      },
      {
        title: '7. Data retention',
        html: `
          <p>We keep your data while you have an active account. Once you delete it, we will remove the data within a maximum of 30 days, except for that which we are legally required to keep (tax obligations: 6 years).</p>
        `
      },
      {
        title: '8. Minors',
        html: `
          <p>GlobalPlay360 is not directed at minors under 16. If you are under 16 you need the consent of your legal guardians to register. If we detect accounts of minors without authorization, we will suspend them.</p>
        `
      },
      {
        title: '9. Security',
        html: `
          <p>We apply appropriate technical and organizational measures to protect your data: encryption in transit (HTTPS), encryption at rest (Firebase), restrictive access rules, and periodic security reviews.</p>
        `
      },
      {
        title: '10. Changes to this policy',
        html: `
          <p>We may update this policy to reflect legal or service changes. We will publish the new version with the update date. If changes are substantial, we will notify you by email.</p>
        `
      }
    ]
  }
};
