import type { LegalLang } from './privacy.content';

export interface TermsContent {
  subtitle: string;
  sections: { title?: string; html: string }[];
}

export const TERMS: Record<LegalLang, TermsContent> = {
  ca: {
    subtitle: 'Condicions generals d\'ús de la plataforma GlobalPlay360.',
    sections: [
      {
        html: `<p>Benvingut/da a GlobalPlay360. Si accedeixes o utilitzes els nostres serveis, acceptes aquestes condicions d'ús. Si no hi estàs d'acord, no utilitzis la plataforma.</p>`
      },
      {
        title: '1. Objecte',
        html: `<p>GlobalPlay360 és una plataforma digital que posa en contacte esportistes (jugadors), entrenadors i clubs esportius amb l'objectiu de facilitar oportunitats professionals, candidatures i comunicació directa.</p>`
      },
      {
        title: '2. Titular del servei',
        html: `
          <ul>
            <li><strong>Titular:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Denominació social:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>NIF:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Domicili:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Correu:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
          </ul>
        `
      },
      {
        title: '3. Registre i comptes',
        html: `
          <p>Per accedir a determinades funcionalitats cal crear un compte. T'obliges a:</p>
          <ul>
            <li>Proporcionar informació veraç, actualitzada i completa.</li>
            <li>Mantenir en secret les credencials i notificar-nos qualsevol ús no autoritzat.</li>
            <li>No compartir el compte amb tercers.</li>
            <li>Ser responsable de totes les activitats realitzades des del teu compte.</li>
          </ul>
          <p>GlobalPlay360 es reserva el dret de suspendre o cancel·lar comptes que incompleixin aquestes condicions.</p>
        `
      },
      {
        title: '4. Plans i subscripcions',
        html: `
          <p>GlobalPlay360 ofereix els següents plans:</p>
          <ul>
            <li><strong>Free:</strong> accés bàsic a la plataforma amb funcionalitats limitades.</li>
            <li><strong>Premium:</strong> accés complet amb un <strong>període de prova de 30 dies</strong>, després 25 € al mes o 250 € a l'any.</li>
          </ul>
          <p>Durant el període de prova pots cancel·lar sense cap càrrec. En no cancel·lar, el primer càrrec es realitzarà automàticament en finalitzar la prova.</p>
        `
      },
      {
        title: '5. Pagaments',
        html: `
          <p>Els pagaments es processen a través de <a href="https://stripe.com" target="_blank" rel="noopener">Stripe</a>, una passarel·la de pagament certificada PCI-DSS. GlobalPlay360 no emmagatzema dades de targeta al seu sistema.</p>
          <p>Les factures estan disponibles al panell de facturació del teu compte. Pots gestionar, cancel·lar o actualitzar el mètode de pagament en qualsevol moment des del <em>Customer Portal</em> de Stripe.</p>
        `
      },
      {
        title: '6. Cancel·lació i reemborsaments',
        html: `
          <p>Pots cancel·lar la teva subscripció Premium en qualsevol moment. La cancel·lació serà efectiva al final del període ja pagat; no oferim reemborsament per períodes parcials, excepte en els supòsits establerts per la normativa de consum.</p>
          <p>D'acord amb l'article 103.m de la Llei General per a la Defensa dels Consumidors, renuncies expressament al dret de desistiment un cop comences a gaudir del servei digital.</p>
        `
      },
      {
        title: '7. Conducta prohibida',
        html: `
          <p>Com a usuari de GlobalPlay360, no pots:</p>
          <ul>
            <li>Suplantar la identitat d'altres persones o clubs.</li>
            <li>Publicar contingut fals, difamatori, ofensiu, obscè o que infringeixi drets de tercers.</li>
            <li>Enviar spam, missatges no sol·licitats o contingut comercial no autoritzat.</li>
            <li>Utilitzar la plataforma per a finalitats il·legals o contràries a la moral i l'ordre públic.</li>
            <li>Intentar vulnerar la seguretat del servei, realitzar enginyeria inversa o accedir a comptes aliens.</li>
            <li>Fer servir bots, scrapers o eines automatitzades sense autorització.</li>
          </ul>
          <p>L'incompliment podrà comportar la suspensió immediata del compte i, si escau, accions legals.</p>
        `
      },
      {
        title: '8. Propietat intel·lectual',
        html: `
          <p>Tots els drets sobre la marca, logotip, codi, disseny i continguts originals de GlobalPlay360 són propietat del seu titular. Els continguts publicats per usuaris (vídeos, fotos, bio) romanen propietat de l'usuari, que concedeix a GlobalPlay360 una llicència no exclusiva, gratuïta i mundial per mostrar-los dins la plataforma.</p>
        `
      },
      {
        title: '9. Exempció de responsabilitat',
        html: `
          <p>GlobalPlay360 és una plataforma de connexió, no un intermediari laboral. No garantim la veracitat de les dades publicades pels usuaris ni som responsables d'acords, contractes o disputes que puguin derivar-se de les interaccions entre usuaris.</p>
          <p>En la màxima mesura permesa per la llei, GlobalPlay360 no es fa responsable de danys indirectes, pèrdua de beneficis, interrupcions del servei o pèrdua de dades.</p>
        `
      },
      {
        title: '10. Modificacions',
        html: `<p>Podem actualitzar aquestes condicions per adaptar-les a canvis legals o del servei. Les modificacions substancials es notificaran per correu electrònic amb un preavís de 30 dies. L'ús continuat implica acceptació.</p>`
      },
      {
        title: '11. Llei aplicable i jurisdicció',
        html: `<p>Aquestes condicions es regeixen per la legislació espanyola. Per a qualsevol controvèrsia, les parts se sotmeten als jutjats i tribunals de la ciutat on tingui el domicili el titular, excepte quan la normativa de consum determini altrament.</p>`
      }
    ]
  },
  es: {
    subtitle: 'Condiciones generales de uso de la plataforma GlobalPlay360.',
    sections: [
      {
        html: `<p>Bienvenido/a a GlobalPlay360. Si accedes o utilizas nuestros servicios, aceptas estas condiciones de uso. Si no estás de acuerdo, no utilices la plataforma.</p>`
      },
      {
        title: '1. Objeto',
        html: `<p>GlobalPlay360 es una plataforma digital que pone en contacto deportistas (jugadores), entrenadores y clubes deportivos con el objetivo de facilitar oportunidades profesionales, candidaturas y comunicación directa.</p>`
      },
      {
        title: '2. Titular del servicio',
        html: `
          <ul>
            <li><strong>Titular:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Denominación social:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>NIF:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Domicilio:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Correo:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
          </ul>
        `
      },
      {
        title: '3. Registro y cuentas',
        html: `
          <p>Para acceder a determinadas funcionalidades es necesario crear una cuenta. Te obligas a:</p>
          <ul>
            <li>Proporcionar información veraz, actualizada y completa.</li>
            <li>Mantener en secreto las credenciales y notificarnos cualquier uso no autorizado.</li>
            <li>No compartir la cuenta con terceros.</li>
            <li>Ser responsable de todas las actividades realizadas desde tu cuenta.</li>
          </ul>
          <p>GlobalPlay360 se reserva el derecho de suspender o cancelar cuentas que incumplan estas condiciones.</p>
        `
      },
      {
        title: '4. Planes y suscripciones',
        html: `
          <p>GlobalPlay360 ofrece los siguientes planes:</p>
          <ul>
            <li><strong>Free:</strong> acceso básico a la plataforma con funcionalidades limitadas.</li>
            <li><strong>Premium:</strong> acceso completo con un <strong>periodo de prueba de 30 días</strong>, posteriormente 25 € al mes o 250 € al año.</li>
          </ul>
          <p>Durante el periodo de prueba puedes cancelar sin cargo. Si no cancelas, el primer cargo se realizará automáticamente al finalizar la prueba.</p>
        `
      },
      {
        title: '5. Pagos',
        html: `
          <p>Los pagos se procesan a través de <a href="https://stripe.com" target="_blank" rel="noopener">Stripe</a>, una pasarela de pago certificada PCI-DSS. GlobalPlay360 no almacena datos de tarjeta en su sistema.</p>
          <p>Las facturas están disponibles en el panel de facturación de tu cuenta. Puedes gestionar, cancelar o actualizar el método de pago en cualquier momento desde el <em>Customer Portal</em> de Stripe.</p>
        `
      },
      {
        title: '6. Cancelación y reembolsos',
        html: `
          <p>Puedes cancelar tu suscripción Premium en cualquier momento. La cancelación será efectiva al final del periodo ya pagado; no ofrecemos reembolso por periodos parciales, excepto en los supuestos establecidos por la normativa de consumo.</p>
          <p>De acuerdo con el artículo 103.m de la Ley General para la Defensa de los Consumidores, renuncias expresamente al derecho de desistimiento una vez comienzas a disfrutar del servicio digital.</p>
        `
      },
      {
        title: '7. Conducta prohibida',
        html: `
          <p>Como usuario de GlobalPlay360, no puedes:</p>
          <ul>
            <li>Suplantar la identidad de otras personas o clubes.</li>
            <li>Publicar contenido falso, difamatorio, ofensivo, obsceno o que infrinja derechos de terceros.</li>
            <li>Enviar spam, mensajes no solicitados o contenido comercial no autorizado.</li>
            <li>Utilizar la plataforma para fines ilegales o contrarios a la moral y el orden público.</li>
            <li>Intentar vulnerar la seguridad del servicio, realizar ingeniería inversa o acceder a cuentas ajenas.</li>
            <li>Usar bots, scrapers o herramientas automatizadas sin autorización.</li>
          </ul>
          <p>El incumplimiento podrá conllevar la suspensión inmediata de la cuenta y, si procede, acciones legales.</p>
        `
      },
      {
        title: '8. Propiedad intelectual',
        html: `
          <p>Todos los derechos sobre la marca, logotipo, código, diseño y contenidos originales de GlobalPlay360 son propiedad de su titular. Los contenidos publicados por usuarios (vídeos, fotos, bio) permanecen en propiedad del usuario, que concede a GlobalPlay360 una licencia no exclusiva, gratuita y mundial para mostrarlos dentro de la plataforma.</p>
        `
      },
      {
        title: '9. Exención de responsabilidad',
        html: `
          <p>GlobalPlay360 es una plataforma de conexión, no un intermediario laboral. No garantizamos la veracidad de los datos publicados por los usuarios ni somos responsables de acuerdos, contratos o disputas que puedan derivarse de las interacciones entre usuarios.</p>
          <p>En la máxima medida permitida por la ley, GlobalPlay360 no se hace responsable de daños indirectos, pérdida de beneficios, interrupciones del servicio o pérdida de datos.</p>
        `
      },
      {
        title: '10. Modificaciones',
        html: `<p>Podemos actualizar estas condiciones para adaptarlas a cambios legales o del servicio. Las modificaciones sustanciales se notificarán por correo electrónico con un preaviso de 30 días. El uso continuado implica aceptación.</p>`
      },
      {
        title: '11. Ley aplicable y jurisdicción',
        html: `<p>Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de la ciudad donde tenga el domicilio el titular, salvo cuando la normativa de consumo determine lo contrario.</p>`
      }
    ]
  },
  en: {
    subtitle: 'General terms of use of the GlobalPlay360 platform.',
    sections: [
      {
        html: `<p>Welcome to GlobalPlay360. By accessing or using our services, you accept these terms of use. If you do not agree, please do not use the platform.</p>`
      },
      {
        title: '1. Purpose',
        html: `<p>GlobalPlay360 is a digital platform that connects athletes (players), coaches and sports clubs with the aim of facilitating professional opportunities, applications and direct communication.</p>`
      },
      {
        title: '2. Service provider',
        html: `
          <ul>
            <li><strong>Owner:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Legal entity:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Tax ID:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Address:</strong> <em style="color:#6B7280">[pendiente de configuración]</em></li>
            <li><strong>Email:</strong> <em style="color:#6B7280">[pending configuration]</em></li>
          </ul>
        `
      },
      {
        title: '3. Registration and accounts',
        html: `
          <p>To access certain features you need to create an account. You agree to:</p>
          <ul>
            <li>Provide truthful, current and complete information.</li>
            <li>Keep your credentials secret and notify us of any unauthorized use.</li>
            <li>Not share your account with third parties.</li>
            <li>Be responsible for all activities carried out from your account.</li>
          </ul>
          <p>GlobalPlay360 reserves the right to suspend or cancel accounts that violate these terms.</p>
        `
      },
      {
        title: '4. Plans and subscriptions',
        html: `
          <p>GlobalPlay360 offers the following plans:</p>
          <ul>
            <li><strong>Free:</strong> basic access to the platform with limited features.</li>
            <li><strong>Premium:</strong> full access with a <strong>30-day trial period</strong>, then €25/month or €250/year.</li>
          </ul>
          <p>During the trial period you can cancel at no charge. If you do not cancel, the first charge will be made automatically at the end of the trial.</p>
        `
      },
      {
        title: '5. Payments',
        html: `
          <p>Payments are processed through <a href="https://stripe.com" target="_blank" rel="noopener">Stripe</a>, a PCI-DSS certified payment gateway. GlobalPlay360 does not store card data on its system.</p>
          <p>Invoices are available in your account's billing panel. You can manage, cancel or update the payment method at any time from Stripe's <em>Customer Portal</em>.</p>
        `
      },
      {
        title: '6. Cancellation and refunds',
        html: `
          <p>You can cancel your Premium subscription at any time. Cancellation will be effective at the end of the period already paid; we do not offer refunds for partial periods, except in the cases established by consumer regulations.</p>
          <p>In accordance with article 103.m of the Spanish General Consumer Defense Act, you expressly waive the right of withdrawal once you begin to enjoy the digital service.</p>
        `
      },
      {
        title: '7. Prohibited conduct',
        html: `
          <p>As a GlobalPlay360 user, you may not:</p>
          <ul>
            <li>Impersonate other people or clubs.</li>
            <li>Publish false, defamatory, offensive, obscene content or content that infringes third-party rights.</li>
            <li>Send spam, unsolicited messages or unauthorized commercial content.</li>
            <li>Use the platform for illegal purposes or contrary to morality and public order.</li>
            <li>Attempt to breach service security, reverse engineer or access other users' accounts.</li>
            <li>Use bots, scrapers or automated tools without authorization.</li>
          </ul>
          <p>Violations may result in immediate account suspension and, where appropriate, legal action.</p>
        `
      },
      {
        title: '8. Intellectual property',
        html: `
          <p>All rights to the GlobalPlay360 brand, logo, code, design and original content belong to its owner. Content published by users (videos, photos, bio) remains the property of the user, who grants GlobalPlay360 a non-exclusive, royalty-free, worldwide license to display it within the platform.</p>
        `
      },
      {
        title: '9. Disclaimer',
        html: `
          <p>GlobalPlay360 is a connection platform, not a labor intermediary. We do not guarantee the veracity of data published by users, nor are we responsible for agreements, contracts or disputes that may arise from interactions between users.</p>
          <p>To the maximum extent permitted by law, GlobalPlay360 is not liable for indirect damages, loss of profits, service interruptions or data loss.</p>
        `
      },
      {
        title: '10. Modifications',
        html: `<p>We may update these terms to adapt to legal or service changes. Substantial modifications will be notified by email with 30 days' notice. Continued use implies acceptance.</p>`
      },
      {
        title: '11. Applicable law and jurisdiction',
        html: `<p>These terms are governed by Spanish law. For any dispute, the parties submit to the courts of the city where the owner has its domicile, except where consumer regulations determine otherwise.</p>`
      }
    ]
  }
};
