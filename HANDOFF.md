# HANDOFF — GlobalPlay360

> Document de traspàs entre sessions. Última actualització: **30 juliol 2026**.
> Font de veritat legal: `docs/AUDITORIA_RGPD.md` · Pla de pricing: `docs/PLA_PRICING_STRIPE.md` · Porta QA: `docs/RELEASE_GATE_COBROS.md` · Bíblia Stripe: `docs/BIBLIA_QA_STRIPE.md` · Registre Art. 30: `docs/REGISTRE_ART30.md`.
> **Client/titular: Aleix Pérez Jané** (correcció: les mencions antigues a "Aina" eren errònies).

---

## ▶️ REPRESA AQUÍ — 8 ago 2026 · TALL A LIVE FET

**Stripe ja opera en mode actiu.** Fet i verificat contra Firestore i els registres, no
contra pantalles:

| | |
|---|---|
| Clau de l'extensió | `rk_live_…` restringida (Customers/Checkout/Portal escriptura · Subscriptions/Prices lectura · **Webhook Endpoints cap**) → secret versió **2** |
| Webhook LIVE | endpoint existent, 14 esdeveniments, `invoice.*` fora. Secret **rotat** → versió **6** |
| Extensió | `invertase/…@0.3.12` reconfigurada, respon **200** |
| Catàleg a Firestore | només els 2 productes de LIVE + 4 preus (999/9999/2499/24999) |
| Productes de TEST a Firestore | **esborrats** el 8/08 amb autorització d'Anna |
| IVA | tipus manual 21 % inclusiu · LIVE `txr_1U1mtwGXsJqj46j9L2QELLxt` a `functions/index.js` |
| NIF a factures | al peu de pàgina de la plantilla (config compartida entre modes) |

### ⚠️ Incident de seguretat tancat el 8/08

El `whsec_` de producció es va enganxar sense voler al camp «Nombre del destino» del
webhook i va quedar exposat en una captura. **Rotat immediatament**: caducat a Stripe i
la versió del Secret Manager destruïda. Amb aquell secret es podien forjar esdeveniments
contra la Cloud Function pública i, com que l'extensió assigna `stripeRole: premium` a
partir d'ells, regalar-se Premium. Ja no serveix.

### 🔴 El QA en mode de prova ha deixat de funcionar

Conseqüència coneguda i acceptada: l'extensió només guarda **un** secret de webhook i ara
té el de LIVE. Provar en TEST tornarà a sincronitzar amb Firestore només si es munta un
segon projecte de Firebase. **Decisió d'arquitectura pendent, no un pas de runbook.**

### 🎯 PROPERA SESSIÓ — camí fins a N4, en ordre

Fer-los **d'un en un** i marcar-los aquí en acabar. Veredicte actual: **N3**. No es pot dir
«llest per cobros reals» fins que el punt 8 estigui verd.

---

**□ 0 · 🔴 URGENT · contrasenya QA en un repositori públic** · Anna · 15 min

`scripts/create-qa-accounts.mjs:29` porta `const PASSWORD = 'QaTest2026!Gp360'` en clar, i
`github.com/globalplay360-byte/GlobalPlay360` és **PÚBLIC**. Obre comptes reals d'Auth del
projecte de producció (`qa.player…`, `qa.coach…`, `qa.club…` amb rols player/coach/club).

Esborrar la línia **no n'hi ha prou**: l'historial de git és públic i permanent.

1. Firebase Console → Authentication → Users → **esborrar els tres comptes `qa.*`**
   (o canviar-los la contrasenya si se'n vol conservar algun per al smoke).
2. Treure el valor del script i llegir-lo de `process.env.QA_PASSWORD`.
3. Afegir `.vite/` al `.gitignore` — hi ha codi de build versionat.
4. **Informar l'Aleix que el repositori és públic.** El propietari és el seu compte
   (`globalplay360-byte`) i l'Anna hi té permís **WRITE**, no ADMIN: **no pot canviar-ne la
   visibilitat i no li correspon**. La decisió és seva. El que ha de saber per decidir:
   essent públic s'hi veuen les `firestore.rules`, l'estructura de la integració de
   pagaments i els identificadors del catàleg. Res d'això és un secret en si mateix, però
   tot plegat és feina estalviada a qui hi vulgui buscar les pessigolles.

   **Els punts 1-3 no depenen d'això** i s'han de fer igualment: la contrasenya ja és
   pública i ho seguirà sent encara que el repositori es tanqui demà.

**□ 1 · Emails de Billing** · Anna · consola · 5 min
https://dashboard.stripe.com/acct_1T4khvGXsJqj46j9/settings/billing/automatic
Activar «recordatori de fi de prova» i «pagament fallit». Estaven bloquejats per les
tasques del compte; ja no. Sense el de pagament fallit, un usuari en `past_due` no
s'assabenta de res.

**□ 2 · Customer Portal de LIVE** · Anna · consola · 10 min
https://dashboard.stripe.com/acct_1T4khvGXsJqj46j9/settings/billing/portal
URLs legals reals (`/privacy`, `/terms`), cancel·lació **al final del període**, i limitar
els canvis de pla perquè no es pugui creuar del segment individual al de club.

**□ 3 · Desactivar Google a Firebase Auth** · Anna · consola · 2 min
Firebase Console → Authentication → Sign-in method → Google → **Disable**.
Pendent des del 5/08. El botó ja no és a la UI, però la clau pública va al bundle: mentre
el proveïdor estigui actiu es poden crear comptes saltant-se la casella d'edat i el
consentiment (`src/services/auth.service.ts:164-175`).

**□ 4 · Netejar mètodes de pagament** · Anna · consola · 5 min
La configuració `pmc_1T4kiRGXsJqj46j9b9MG3Ih9` té actius Klarna, Kakao Pay i Naver Pay a
factures i subscripcions. Per un servei recurrent a Espanya no serveixen ningú i cada
mètode actiu és una superfície de fallada de renovació més.

**□ 5 · DECISIÓ: obrir el registre públic** · Anna
`VITE_PUBLIC_REGISTRATION_ENABLED` no està definida → `false`. **Es cuina al build**, no és
un interruptor de consola:
```
.env.local → VITE_PUBLIC_REGISTRATION_ENABLED=true
npm run build
firebase deploy --only hosting --project globalplay360-3f9a1
```
⚠️ La casella d'edat i el registre de consentiment **només existeixen en un build amb el
registre obert** (Rollup els elimina com a codi mort quan està tancat). Verificar després
del build que `ageDeclaredOver16` surt al bundle.

**□ 6 · Posar els flags a un fitxer versionat** · Anna+Claude · 15 min
Avui viuen a `.env.local`, que és al `.gitignore`: existeixen només a la màquina d'Anna i
es perdran al traspàs. Els `VITE_*` són públics per definició (van al bundle), així que
poden anar a un `.env.production` versionat.

**□ 7 · SMOKE DE LIVE amb diners reals** · Anna · 30 min
El pas que no es pot saltar. Amb targeta pròpia, pla individual mensual:
- checkout OK i Premium actiu a l'app sense refrescar
- factura amb `8,26 € + 1,73 € IVA = 9,99 €` **i el NIF al peu**
- càrrec a l'extracte com a `GLOBAL PLAY 360`
- cancel·lació pel Customer Portal, amb accés fins al final del període
- **Google Pay al checkout** (activat el 6/08, mai provat)

**□ 8 · Confirmar que el diner arriba al banc de l'Aleix** · Anna
Fins que no hi hagi **una transferència completada** a
https://dashboard.stripe.com/acct_1T4khvGXsJqj46j9/balance
el circuit no està provat de punta a punta. Tot el bloqueig del 28/07 anava d'això.

**□ 9 · Entrega** · Anna+Claude
Demo guiada, credencials, manual de gestió de subscripcions a Stripe. Compte: les
credencials QA viuen a `scripts/qa-accounts.generated.json`, que és al `.gitignore` i es
perdrà si no es tracta a part.

---

### Decisions obertes (no bloquegen, però s'han de prendre)

- **Segon projecte de Firebase per poder tornar a fer QA en TEST.** Avui el QA de billing
  en mode de prova està mort: un sol projecte = un sol secret de webhook. Cost vs. risc de
  provar canvis de billing directament en producció.
- **`invoice.*` i migració futura:** els esdeveniments de factura estan fora de l'endpoint
  perquè `invoice.paid` peta amb la versió d'API `2026-01-28.clover`. Si algun dia cal
  guardar factures a Firestore, s'ha de resoldre abans.
- **Llindar OSS de 10.000 €/any.** Mentre no se superi, l'IVA espanyol al 21 % és correcte
  per a tota la UE. Passat el llindar, cal alta a l'OSS i el tipus manual deixa de servir.
  **La responsabilitat de vigilar-ho és del titular** — deixar-ho per escrit a l'entrega.

---

## REPRESA ANTERIOR — 6 ago 2026

### On som

**El bloqueig extern d'Stripe està resolt. El que queda és tot tècnic i intern.**

| Bloc | Estat |
|---|---|
| Verificacions d'Stripe | ✅ **Les 2 Completada** (verificat 6/08 a Estado de la cuenta · «No hay tareas activas») |
| Payouts | ✅ **Desbloquejats.** Saldos sense avís de pausa. Saldo 0 € i cap transferència perquè encara no s'ha cobrat res — és l'esperat |
| Dades fiscals de l'Aleix | ✅ **Ja les tenim des del 30/07** — NIF + domicili a `src/content/legal/privacy.content.ts` §1. El domicili quadra amb el d'Stripe. **No tornar-les a demanar** |
| Stripe Tax | 🔴 Desactivat. **Ja no depèn del client**: es pot configurar amb el NIF i el domicili que tenim |
| OSS UE | ⚪ **Fora del camí crític.** Només obligatori per sobre de 10.000 €/any de B2C digital a altres països UE. Amb 0 € facturats, IVA espanyol a tota la UE. Revisar en acostar-se al llindar — la responsabilitat del llindar és de l'Aleix |
| Google Pay | ✅ Activat el 6/08 (abans deshabilitat amb Apple Pay actiu — pèrdua de conversió a Android). **Sense smoke al checkout encara** |
| Edat mínima de registre | ✅ **16 anys**, decidit per l'Aleix el 4/08 i **implementat el 5/08** |
| Registre Art. 30 | ✅ **Signat**, PDF a `docs/` |
| #12 secrets pin-ats a `versions/1` | ✅ **TANCAT — ja ho estava.** Vegeu «L'extensió no era la que dèiem» |
| #10 lookup_keys | ⏳ verificació manual a la consola |

### 🔴 Producció va endarrerida respecte de `main` — verificat el 7/08

Últim desplegament de **tot**: **18 juliol**. Regles 08:02 · Functions 08:03 · Hosting 13:26.

El commit `cb4d7ed` és de les **13:47 del 18/07**, 21 minuts després del deploy de hosting,
i conté el fix de `past_due` (F3). **Mai s'ha desplegat.** En producció, avui, un usuari
amb el pagament rebutjat desapareix de Billing i no pot canviar la targeta — el criteri
de NO-GO de `BIBLIA_QA_STRIPE.md`. La fitxa el marca PASS perquè es va provar en local.

Tampoc hi és res del 5/08: ni la porta d'edat a `firestore.rules`, ni la casella al
registre, ni la retirada de l'accés amb Google.

**Desplegar `main` és el pas 0 del go-live, abans de tocar Stripe.**

### 🔴 L'extensió no era la que dèiem — descobert el 8/08

`firebase ext:list` contra el projecte real:

```
invertase/firestore-stripe-payments@0.3.12 · instància firestore-stripe-payments
última actualització: 2026-07-17 19:53
```

El `firebase.json` deia `stripe/firestore-stripe-payments@0.3.4`. **La migració a l'extensió
mantinguda d'invertase —que constava als documents com a tasca opcional pendent— es va fer
el 17 de juliol i no es va escriure enlloc.**

Conseqüències, totes verificades amb `firebase ext:export`:

1. **El P0 #12 estava tancat des del 17/07.** La configuració desplegada de veritat ja diu
   `versions/latest` als dos secrets. El `versions/1` que arrossegàvem als documents era
   d'una instància que ja no existeix.
2. **Els secrets reals es diuen sense el prefix `ext-`**: `firestore-stripe-payments-STRIPE_API_KEY`
   i `firestore-stripe-payments-STRIPE_WEBHOOK_SECRET` (el nom surt de l'ID d'instància).
   Els `ext-…` d'abril són restes de la instal·lació antiga i **no els llegeix ningú**.
3. ⚠️ **`firebase deploy --only extensions` hauria estat destructiu** fins avui: amb el
   `firebase.json` i el `.env` que hi havia al repositori, hauria intentat tornar l'extensió
   a `stripe@0.3.4` i repuntar-la a un secret inexistent, sobre uns cobraments que
   funcionen. El pas 9 del runbook ho demanava. No es va arribar a executar.

**Sincronitzat el 8/08:** `firebase.json` i `extensions/firestore-stripe-payments.env` ara
reflecteixen la instància desplegada. El `.env` es deixa **exactament** com el genera
`ext:export`, sense comentaris, perquè qualsevol desviació futura es vegi com a diferència.

**Regla que en surt:** abans de tocar l'extensió, `firebase ext:list` i `firebase ext:export`.
Mai fiar-se del `firebase.json` del repositori.

### SEO Bloc 3 — fora d'abast (decisió d'Anna, 7/08)

El client no ho ha demanat mai. Passa a **fase d'ampliació**, no és pendent d'entrega.
No reobrir-ho com a bloquejant.

### Veredicte Stripe: N3 (Billing QA OK · TEST) — 🔴 NO-GO LIVE

N3 signat el 18/07 (`docs/BIBLIA_QA_STRIPE.md` §5). Blocadors que queden per N4, **tots tècnics**:

1. ~~**Secrets clavats a `versions/1`**~~ — ✅ **ja estava resolt.** Vegeu la secció de sota.
2. ~~**Els 4 Prices no existeixen en LIVE**~~ — ✅ **FALS, ja hi eren.** Verificat a la
   consola el 7/08: el catàleg de LIVE es va crear el **16-17 de juliol** i està complet.
   `GlobalPlay360 Premium — Players & Coaches` (`prod_UtgFoPBknbMEJ4`) amb 9,99/99,99 i
   `segment: individual`; `GlobalPlay360 Premium — Clubs` (`prod_UtgHnrVqvGvYLE`) amb
   24,99/249,99 i `segment: club`. Els dos amb `firebaseRole: premium`. El producte antic
   de 25 € ja estava arxivat.

   Ho vam donar per pendent perquè `PLA_PRICING_STRIPE.md` deia «els crearà Anna» i
   ningú ho va tancar quan es va fer. Mateix patró que les dades fiscals.

   **#10 lookup_keys: no aplica.** El codi no en fa servir cap
   (`grep lookup_key` → 0 coincidències). `PricingPage.tsx:80` tria el producte per
   metadata `segment` i `:92` el preu per `interval`. El P0 queda tancat sense feina.
3. **Webhook LIVE + URLs legals al Customer Portal.**

Pendents menors abans del smoke: activar els emails d'Stripe (fi de trial + payment
failed) — estaven bloquejats per les tasques del compte i **ara ja es poden activar**;
re-executar el pas F (`past_due`) després del deploy, i un smoke de Google Pay.

### Edat mínima · fet el 5 ago 2026

Detall complet i decisions a `docs/REGISTRE_ART30.md` §5 punt 1. Resum: casella
declarativa al registre, constància a `consent_history`, i porta real a
`firestore.rules` sobre `dateOfBirth`. `LEGAL_TEXTS_VERSION` puja a `2026-08-05`
perquè la política de privacitat canvia.

**Provada contra l'emulador**, no només llegida:

```bash
npm run test:rules      # aixeca l'emulador, passa els 9 casos i el tanca
```

`tests/rules-minimum-age.mjs` · 9/9. Cobreix el límit exacte (qui neix l'any-16 passa,
qui neix l'any-15 no), el perfil sense data —clubs i entrenadors no en donen mai— i el
cas que justifica la guarda d'`affectedKeys`: un perfil que ja portava una data de menys
de 16 des d'abans de la política ha de poder editar la resta de camps. Les dates es
deriven de l'any en curs perquè el test no comenci a mentir el 2027.

`@firebase/rules-unit-testing` ja era al `package.json` sense fer-se servir. Cap
dependència nova.

> **Anomalia coneguda, no resolta.** L'emulador registra `evaluation error` a la línia
> de l'`allow update` **acompanyant els DENY** (mai els ALLOW). Els 9 casos es comporten
> com toca, o sigui que el resultat és correcte, però no he pogut atribuir la causa: la
> posició que reporta apunta a l'inici de la condició sencera i no a la subexpressió. Es
> va afegir una guarda `resource != null` —un `setDoc` sobre un document inexistent fa
> avaluar la branca d'update amb `resource` nul— i **no la va fer desaparèixer**, o sigui
> que la guarda és correcta però no n'era la causa. Val la pena mirar-ho amb calma abans
> de tocar aquesta rule per a res més.

### Accés amb Google · retirat el 5/08

**El forat era preexistent**, no el va introduir el canvi de l'edat.

`LoginPage.tsx` tenia botó d'accés amb Google i **cap casella** — ni consentiment ni
edat, perquè s'assumeix que qui hi entra ja té compte. Però `loginWithGoogle` crea el
document d'usuari si `isNewUser`: **per aquí es podia arribar a registrar sense acceptar
res.** Afectava el P0 #5 (consentiment Art. 7), que constava com a resolt — ho era al
formulari de registre, no en aquest camí.

Es va valorar mantenir-lo rebutjant usuaris nous, i es va **descartar**: no hi havia cap
compte registrat amb Google, el client no ho havia demanat mai, i hauria estat afegir
codi —i una passada de QA— per sostenir un camí que no serveix ningú.

Retirat de `LoginPage`, `RegisterPage`, `AuthContext` i `auth.service`, amb les 6 claus
i18n mortes fora dels tres locales. **Amb això, el P0 #5 passa a ser cert per a tots els
camins d'alta**, cosa que abans no ho era.

> 🔴 **Falta el pas de consola, i sense ell això només amaga el botó.** El proveïdor
> segueix actiu a Firebase Auth: la clau pública va al bundle, o sigui que
> `signInWithPopup` continuaria creant comptes des de fora de l'app.
>
> **Firebase Console → Authentication → Sign-in method → Google → Disable.**
>
> Fins que no estigui fet, el forat és obert encara que la UI no el mostri.

---

## REPRESA ANTERIOR — 30 jul 2026

### On som

**Tot el que depenia de desenvolupament està fet. El llançament depèn de l'Aleix.**

| Bloc | Estat |
|---|---|
| P0 de la porta de cobros | **12 de 14 resolts i verificats contra el codi** (30/07) |
| #10 lookup_keys | ⏳ verificació manual a la consola d'Stripe |
| **#12 secrets pin-ats a `versions/1`** | 🔴 **obert** — s'ha de resoldre *durant* el pas a LIVE |
| Registre Art. 30 | ✅ redactat (`docs/REGISTRE_ART30.md` + `.html`), pendent de signatura del titular |
| SEO Bloc 3 | ⏳ ajornat per decisió d'Anna |

### El bloqueig real

El compte d'Stripe de l'Aleix té **dues tasques de verificació vençudes el 28/07** i
Stripe ha **suspès les transferències**. Obrir cobraments ara acumularia pagaments
retinguts sense arribar-li al banc. **Correu enviat el 30/07** demanant-li:

1. Completar les dues verificacions d'Stripe
2. Tornar el registre Art. 30 datat i signat
3. Decidir l'edat mínima de registre (política de menors) i si vol comunicacions comercials

### Fet en aquesta sessió

- **Reparat el repositori:** `main` estava divergit (3 local / 4 remot). En local faltaven
  la Bíblia d'Stripe, el protocol de QA N3 i la guia HTML — el HANDOFF les citava com a
  font de veritat i no existien al disc. Fusionat i sincronitzat.
- Afegits al repositori el `FASE_SEO_LEGAL_CHECKLIST.html` i la regla de Cursor, que el
  `CLAUDE.md` citava com a documents mestres i tampoc estaven versionats.
- Redactat el registre Art. 30 (tanca el P1-3 de l'auditoria RGPD).
- Re-verificats els 14 P0 i actualitzat el veredicte de la porta.
- `CASE-STUDY/` al `.gitignore`: 28 MB de material de portfolio d'Anna dins el repositori
  del client.

### Quan l'Aleix respongui

1. **#12 primer:** apuntar els secrets a la versió nova (o `versions/latest`) i redesplegar
   l'extensió. Sense això, la clau LIVE no s'aplicaria i seguiríem en TEST sense avís.
2. Crear els 4 Prices a LIVE i arxivar el Product antic (25 €/250 €).
3. Webhook LIVE, Tax, DPA a les consoles.
4. Implementar el llindar d'edat que decideixi.
5. Re-executar la porta i demo final.

> ⚠️ El pas TEST→LIVE el fa **Anna manualment**. Mai un agent.

---

## 18 jul 2026 vespre (sessió anterior)

### Fase del projecte

**Pre-entrega → go-live Stripe (N4).** Decisió: **cap retall**.  
Codi a `main` (PR #47 pre-cobros + PR #48 `past_due` + PR #49 informe client).  
Hosting: https://globalplay360-3f9a1.web.app  

**Bloqueig actual:** esperar **feedback / accions d’Aleix** (compte Stripe «2 tareas», dades fiscals, decisions menors / Art. 30). Informe ja enviat.

### Case study portfolio (validat 18/07 vespre)

| Ítem | Estat |
|---|---|
| HTML motion + captures ES | ✅ `CASE-STUDY/index.html` + `CASE-STUDY/captures/` |
| Scripts captures | `CASE-STUDY/scripts/capture-es.mjs` · `capture-roles-frame.mjs` |
| Context / MD | `CASE-STUDY/_CONTEXT_ANNA_360.md` · `case-study-globalplay360.md` |
| Integració aborrasdesign | ⏳ en curs (altra pestanya): `/globalplay360/` + Selected work amb Synapse + GP360 |
| Deploy portfolio | només amb OK Anna |

### Veredicte QA Stripe

| Nivell | Estat |
|---|---|
| N3 Billing QA OK (TEST) | ✅ 18/07 |
| N4 Go-live LIVE | ⏳ espera Aleix |

### Camí entrega — estat

| # | Acció | Estat |
|---|---|---|
| A–F | Pricing, Portal, deploy, N3, merges | ✅ |
| G | Go-live Stripe LIVE | ⏳ **espera Aleix** |
| H | Demo + document entrega final | ⏳ després N4 / feedback |

### Properes passes (quan hi hagi resposta)

1. **Aleix:** compte Stripe + dades fiscals + decisions (menors / Art. 30).  
2. **Anna:** DPA consoles · Tax · LIVE · webhook · Art. 30 tècnic · demo final.  
3. Portfolio: tancar integració aborrasdesign si encara pendent.

### Enllaços

| Què | On |
|---|---|
| Hosting | https://globalplay360-3f9a1.web.app |
| Informe client | `docs/informe-situacio-client-juliol-2026.html` |
| Case study | `CASE-STUDY/index.html` |
| HANDOFF resume | aquesta secció |

### Prompt proper xat (producte)

> Llegeix `HANDOFF.md` **REPRESA AQUÍ** (18 jul vespre). Esperàvem feedback Aleix. Si ha respost: continuar **N4 go-live**. Si no: no empènyer producte; només portfolio/aborrasdesign si cal. Català. Cap retall.

---

## 16 jul 2026 (vespre) — Refactor del trial + decisions Stripe

Mateixa branca `fix/bloc1-pre-cobros`. **Stripe segueix en TEST. Cap deploy.**

### Descobriment durant la config de Stripe

En crear els Products a la consola es va confirmar que **Stripe ja no permet posar el trial a nivell de preu** (ni al dashboard ni a l'API moderna): els trials són cosa de la subscripció/checkout. El codi anterior depenia de Prices `_trial` amb `trial_period_days` incrustat (`selectCheckoutPrice` + trial siblings), un patró **no fabricable** des del dashboard i que Stripe considera legacy. Era la fragilitat R6 de l'auditoria.

### Canvi aplicat (codi)

- **`functions/billingPolicy.js`**: eliminada tota la maquinària de trial-siblings (`selectCheckoutPrice`, `isTrialPrice`, `getPriceTrialDays`, matching per `lookup_key`/`recurring shape`). Es manté la política one-trial-only via `getCheckoutSessionTrialDays(billingState)` (30 dies si `trialConsumedAt` no existeix).
- **`functions/index.js`** (`createBillingCheckoutSession`): ara valida que el `priceId` demanat sigui un preu ACTIU del product, i afegeix `trial_period_days: 30` al doc de `checkout_sessions` **només** si l'usuari no ha consumit el trial. El trial s'aplica a nivell de checkout — via oficial de Stripe.
- **Tests**: `functions/billingPolicy.test.js` actualitzat (fora els 5 tests de `selectCheckoutPrice`/preus trial; afegit test de `shouldGrantTrial`). **18/18 PASS.**
- **Docs actualitzats**: `PLA_PRICING_STRIPE.md` (mapping ara **4 Prices, cap `_trial`**; R6 marcat resolt), `RELEASE_GATE_COBROS.md` (test M4).
- Frontend intacte: `PricingPage` ja filtrava preus `_trial` (ara no-op) i el text del trial ve d'i18n, no del preu.

### Decisions preses amb l'Aleix/Anna

1. **Trial a nivell de checkout** (no preus `_trial`). → només 4 Prices a Stripe.
2. **Migrar l'extensió** `stripe/…@0.3.4` → `invertase/firestore-stripe-payments@0.3.12` — ✅ **fet** el mateix vespre (desinstal·lada l’antiga, reinstal·lada amb ID `firestore-stripe-payments`, `europe-west1`, clau TEST + webhook). Pendent confirmar que el sync a Firestore funciona (vegeu **REPRESA AQUÍ**).

### PricingPage selecció per segment ✅ (fet)

Resolt el mateix vespre: `PricingPage` ara selecciona el Product pel `metadata.segment` creuat amb `user.role` (club → club; player/coach → individual). Els visitants anònims tenen un **selector de segment** (default individual); els usuaris identificats queden fixats al segment del seu rol. S'ha afegit `segment` a `StripeProduct` (`stripe.service.ts`, llegint `stripe_metadata_segment` de l'extensió) i claus i18n `pricingPage.segment.*` (3 idiomes). `tsc`/build/lint verds. Commit `feat: selecciona el Product de pricing pel segment del rol`.

**Nota UX menor (P2, no bloquejant):** els textos de features/descripció de la card Premium són genèrics per als dos segments; el preu sí que canvia correctament (9,99/99,99 vs 24,99/249,99). Si es vol copy específic per a clubs, és una millora futura.

---

## 16 jul 2026 (tarda) — BLOC 2: drets RGPD (Art. 7, 17, 20) + storage.rules

Mateixa branca `fix/bloc1-pre-cobros` (3 commits nous, 10 en total; no fusionada ni pushejada). **Stripe segueix en TEST. Cap deploy.**

### Fet en aquesta sessió

| P0 | Acció | Commit |
|---|---|---|
| #3 ✅ | **`storage.rules`** noves: `users/{uid}/**` escriptura només propietari (imatges reals, <5 MB), lectura només autenticats; tota la resta del bucket denegada per defecte (els assets de màrqueting van amb URL amb token, no passen per rules). Bloc `storage` afegit a `firebase.json` | `feat: storage rules per propietat...` |
| #5 ✅ | **Consentiment Art. 7**: checkbox obligatori al `RegisterPage` (email i Google) amb enllaços a `/terms` i `/privacy`; CF `recordConsent` escriu log immutable a `consent_history/{uid}/entries` amb timestamp servidor, versió de textos legals (`LEGAL_TEXTS_VERSION = 2026-07-16`), IP i user-agent extrets del request (mai del client). Rules: lectura propietari/admin, escriptura només Admin SDK | `feat: consentiment Art. 7 al registre...` |
| #2 ✅ | **Art. 17** — CF `deleteUserAccount`: exigeix reauth recent (<5 min) i cap subscripció viva (`SUBSCRIPTION_ACTIVE` → cancel·lar primer al Portal); esborra applications (com a candidat i com a club), opportunities pròpies, conversations+missatges, `customers/*`, `users/*` (amb `private`), `billing_state`, `auth_sessions`, `consent_history`, Storage `users/{uid}/` i el compte d'Auth; deixa log immutable a `deletion_logs` amb **hash SHA-256 del uid** (mai en clar). **Art. 20** — CF `exportUserData`: JSON amb perfil públic+privat, candidatures, oportunitats, converses amb **només els missatges propis** (els dels altres són dades de tercers), resum de subscripcions i historial de consentiments; rate limit 1/24 h via `export_logs/{uid}`. UI: secció «Privacitat i dades» al perfil (`AccountPrivacySection`, lazy) amb descàrrega de JSON i flux d'eliminació amb confirmació explícita, i18n 3 idiomes | `feat: dret a l'oblit (Art. 17) i exportacio...` |

**Tests**: functions 23/23 PASS · `tsc --noEmit` ✅ · `npm run build` ✅ · lint net als fitxers tocats.

### Decisions de disseny (per si algú les qüestiona)

- **Stripe customer NO s'esborra** amb el compte: les factures s'han de conservar 6 anys per obligació fiscal (declarat a privacy §7). El vincle uid→customer desapareix de Firestore; el customer object queda a Stripe. Si l'Aleix vol purgar-lo manualment més endavant, es fa des del Dashboard de Stripe.
- **`consent_history` es CONSERVA** en esborrar el compte (Art. 17.3.e — defensa de reclamacions). És l'única prova que l'usuari va acceptar termes i privacitat; destruir-la ens deixaria indefensos davant una reclamació. Queda pseudonimitzada (uid + metadades del consentiment, sense la resta de dades). Documentat a privacy §7. *Decisió conscient (feedback revisió), no efecte col·lateral.*
- **Esborrat bloquejat amb subscripció viva**: evita seguir cobrant un compte esborrat. Davant l'error `SUBSCRIPTION_ACTIVE`, la UI mostra un **botó directe al Customer Portal** («Cancel·la la subscripció per continuar», Art. 12.2 — facilitar l'exercici), no un error sec. *Millora futura (P2): que la CF cancel·li automàticament la subscripció abans d'esborrar.*
- **Converses s'esborren senceres** (amb els missatges de l'altre participant): mateix patró que les oportunitats òrfenes; una conversa amb un sol participant no té sentit funcional.
- **Si `recordConsent` falla** després del registre, no es bloqueja l'usuari (ja existeix a Auth); es deixa constància a la consola del client. Risc residual acceptat i documentat.

### Refinaments post-revisió (16/07 tarda)

Feedback de revisió aplicat (cap era bloquejant):
- ✅ **UI Art. 12.2**: botó directe al Customer Portal davant `SUBSCRIPTION_ACTIVE` (reutilitza `createPortalSession`).
- ✅ **`consent_history` conservada** (Art. 17.3.e) en comptes d'esborrada; `deletion_logs` ho marca (`consentHistoryConserved: true`); privacy §7 actualitzada (3 idiomes).
- ✅ **Export Art. 20 complet**: s'hi afegeix `avatarUrl` (download URL amb token, ja present com a `photoURL`).
- ✅ **Textos restaurats**: `AboutPage` + locales tornen a esmentar els drets (exportació + eliminació), ara que existeixen de veritat; privacy §6 informa que es poden exercir des del perfil.

### Estat dels 14 P0 després del BLOC 2

**Tancats (10):** #1 (el claim de l'About ja no és fals: ara l'esborrat existeix) · #2 Art. 17/20 · #3 storage.rules · #4 dades titular · #5 consentiment · #6 enllaços legals · #7 terms pricing · #8 rol↔segment · #9 antidoble · #11 format preu.
**Parcials (1):** #14 lint (25 errors en fitxers no tocats — `OpportunityForm`, etc.).
**Oberts — consola (Anna):** #10 crear 2 Products (metadata `firebaseRole` + `segment`) + 8 Prices en TEST · #12 secrets extensió pin-ats a `versions/1` · #13 URLs legals al Customer Portal.

### Pròxima acció

1. **Anna a Stripe TEST** (avui tarda-vespre): 2 Products + 8 Prices segons `docs/PLA_PRICING_STRIPE.md`. **Recordatori: TEST, no live** — el pas a live és l'últim, després del QA.
2. **Deploy a TEST quan es fusioni la branca**: `firebase deploy --only firestore:rules,storage,functions` (les CFs noves `recordConsent`, `deleteUserAccount`, `exportUserData` no existeixen fins que es despleguin).
3. **QA end-to-end en TEST**: registre amb consentiment → checkout amb targeta test → cancel·lació → export de dades → esborrat de compte.
4. Escombrada #14 lint + re-executar release-gate → si tot verd, transició Test→Live seguint el checklist del pla.

---

## 16 jul 2026 (tarda) — BLOC 1: fixos crítics + textos legals

Branca: `fix/bloc1-pre-cobros` (7 commits, no fusionada a `main` ni pushejada). **Stripe segueix en TEST. Cap deploy.**

### Fet en aquesta sessió

| P0 | Acció | Commit |
|---|---|---|
| #1 (parcial) | Retirat el **claim fals d'Art. 17** a `AboutPage` + locales CA/ES/EN («dret a l'oblit implementat» → «regles de seguretat restrictives»). La CF d'esborrat real queda per al BLOC 2 | `fix: retira l'afirmació falsa...` |
| #4 ✅ | **Dades del titular** injectades a `privacy.content.ts`, `terms.content.ts`, `cookies.content.ts` (3 idiomes) + `ContactPage` (constants `LEGAL_EMAIL`/`LEGAL_ADDRESS` a `src/config/site.ts`). Titular: Aleix Pérez Jané · NIF 47939862L · C. Joan Maragall 9 CS, 08754 El Papiol · aleix.perez@hotmail.com · DPO: no designat (no obligatori, art. 37) | `feat: incorpora les dades reals del titular...` |
| #7 ✅ | **Terms §4** amb el pricing segmentat nou (9,99/99,99 individus · 24,99/249,99 clubs · 1r mes gratuït · IVA inclòs), 3 idiomes | `fix: actualitza els termes...` |
| #8 ✅ | **Validació rol↔segment server-side** a `createBillingCheckoutSession`: rol llegit de `users/{uid}` (mai del payload), Product ha de portar metadata `segment` (`individual`\|`club`); errors `ROLE_NOT_ELIGIBLE_FOR_CHECKOUT`, `PRODUCT_SEGMENT_MISSING`, `PRODUCT_NOT_ALLOWED_FOR_ROLE`. Products sense `segment` (catàleg antic) queden bloquejats per disseny | `feat: valida rol-segment...` |
| #9 ✅ | **Guard antidoble subscripció**: si hi ha subscripció `trialing`/`active`/`past_due` → `SUBSCRIPTION_ALREADY_ACTIVE` (no es crea checkout session). `incomplete` no bloqueja (permet reintent de 3DS abandonat) | `feat: impedeix una segona checkout session...` |
| #11 ✅ | **Format de preu** amb `Intl.NumberFormat` segons idioma actiu (9,99 € — mai `toFixed(0)`), als 3 punts de `PricingPage` | `fix: mostra els preus amb dos decimals...` |
| #6 ✅ | **Enllaços a `/terms` i `/privacy` abans del CTA** a PricingPage i BillingPage (claus i18n `pricingPage.legal.*` en 3 idiomes). Fix col·lateral: lint `set-state-in-effect` a BillingPage | `feat: enllaços legals visibles abans del CTA...` |

**Tests**: functions 23/23 PASS (8 tests nous de `billingPolicy`: segments, metadata aplanada de l'extensió, estats bloquejants) · `tsc --noEmit` ✅ · `npm run build` ✅ · lint net a tots els fitxers tocats.

### Decisió de negoci: canvi de rol amb subscripció activa → BLOQUEJAT

Amb pricing per segments, el rol determina el preu. S'ha decidit **bloquejar el canvi de rol mentre hi ha subscripció o trial actius** (a `firestore.rules`, la branca admin d'update de `users` ara exigeix `plan == 'free'`). Motius: (1) els usuaris no poden canviar-se el rol ells mateixos (ja era així); (2) permetre que l'admin canviï el rol d'un premium crearia un desajust rol↔preu sense passar per Stripe, violant la política del projecte («els canvis de pla es fan a Stripe»). Operativa correcta: cancel·lar/canviar el pla a Stripe primer, després canviar el rol.

### Verificacions demanades (sense codi)

- **Retract waiver UE**: ✅ ja cobert al `PLA_PRICING_STRIPE.md` (checklist Test→Live, punt 7: l'extensió 0.3.4 no exposa `consent_collection`; mitigació via Terms — que **ja contenen** la renúncia expressa al desistiment (art. 103.m LGDCU) en 3 idiomes (`terms.content.ts:67/166/265`) — i ara també enllaçats abans del CTA pel P0 #6).
- **Cookies/analytics a l'auditoria**: ✅ cobert a `docs/AUDITORIA_RGPD.md` («Ja OK» punt 7: cap tracking al client, cookies tècniques exemptes, banner no obligatori avui; P1 exigeix CMP abans d'activar cap analytics futur).

### Estat dels 14 P0 després del BLOC 1

**Tancats (6):** #4 dades titular · #6 enllaços legals · #7 terms pricing · #8 rol↔segment · #9 antidoble · #11 format preu.
**Parcials (2):** #1 (claim fals retirat; la CF d'esborrat Art. 17 → BLOC 2) · #14 lint (de 26 a **25 errors**; la resta són fitxers no tocats — `OpportunityForm`, etc.).
**Oberts — BLOC 2 (codi):** #2 Art. 17/20 (CFs esborrat + exportació) · #3 storage.rules + bloc a firebase.json · #5 consentiment Art. 7 al registre.
**Oberts — consola (Anna):** #10 crear els 8 Prices en TEST amb lookup_keys exactes **+ metadata `segment` a cada Product (ara obligatòria pel #8!)** · #12 secrets extensió pin-ats a `versions/1` · #13 URLs legals al Customer Portal.

### Pròxima acció

1. **BLOC 2**: Art. 17 (CF `deleteUserAccount`, patró El Visionat) + Art. 20 (export) + `storage.rules` + consentiment al registre.
2. **Anna a Stripe TEST**: crear els 2 Products (amb `firebaseRole: premium` **i** `segment: individual`/`club` a la metadata) + 8 Prices segons el mapping. Sense el `segment`, el checkout ara falla amb `PRODUCT_SEGMENT_MISSING` — és intencionat.
3. Re-executar la porta release-gate quan BLOC 2 estigui tancat.

---

## 16 jul 2026 — Auditoria triple pre-cobros (rgpd-officer + firebase-stripe-auditor + release-gate)

### Què s'ha fet

Execució read-only de les 3 portes de qualitat abans del hito COBROS, amb el pricing nou autoritzat pel client (Aleix Pérez Jané; pressupost `pressupost_reajust_pricing.html`):

1. **rgpd-officer** — auditoria RGPD/LOPDGDD 360º des de zero → `docs/AUDITORIA_RGPD.md`
2. **firebase-stripe-auditor** — pla de reajust de pricing + checklist Test→Live → `docs/PLA_PRICING_STRIPE.md`
3. **release-gate** — capa 0 executada (lint/tsc/build/tests functions) + plans capa 1 i 2 → `docs/RELEASE_GATE_COBROS.md`

**No s'ha editat codi, no s'ha creat res a Stripe, no s'ha desplegat res.** Només documentació.

### Veredicte consolidat: 🔴 NO-GO per obrir cobros

**14 P0 oberts** (un de sol ja és NO-GO):

**RGPD (7):**
1. Art. 17 esborrat de compte NO existeix — i `AboutPage.tsx:341` + locales (CA/ES/EN) afirmen falsament que sí
2. Art. 20 exportació de dades NO existeix
3. `storage.rules` absents del repo + `firebase.json` sense bloc `storage` (avatars = imatges facials)
4. Textos legals amb placeholders `[pendiente de configuración]` (titular, NIF, email RGPD) — **requereix input de l'Aleix**
5. Art. 7: cap registre de consentiment al registre (sense checkbox, sense log)
6. Paywall (`PricingPage`, `BillingPage`) sense enllaços legals abans del CTA
7. Terms §4 amb pricing desfasat (25 €/250 € vs nou 9,99/99,99 i 24,99/249,99)

**Stripe/Firebase (6):**
8. Validació rol↔segment inexistent a la CF de checkout (`functions/index.js:145-166`) — un club podria pagar el preu individual
9. Guard antidoble subscripció absent (`functions/index.js:128-199`)
10. Els 8 Prices amb lookup_keys exactes encara no existeixen (`billingPolicy.js:54-96` exigeix siblings `<base>_trial`; fallback perillós a `:82`)
11. Format `toFixed(0)` a `PricingPage.tsx:86/210/224` — mostraria «10 €» en lloc de «9,99 €»
12. Secrets de l'extensió pin-ats a `versions/1` (`extensions/firestore-stripe-payments.env:6-8`) — pujar clau live sense actualitzar la referència deixaria l'extensió en test
13. Rutes legals públiques reals necessàries per al Customer Portal

**Producte (1):**
14. `npm run lint` FAIL — 26 errors, 5 warnings (`tsc --noEmit` ✅, `npm run build` ✅, tests functions 16/16 ✅)

**P1 destacats:** `past_due` invisible (`stripe.service.ts:347` filtra `['trialing','active']` → l'usuari impagat no pot arreglar la targeta) · menors sense validació d'edat ≥14 (esdevé P0 si es reobre registre públic) · PII llegible per qualsevol premium (`firestore.rules:87-89`) · Registre Art. 30 inexistent.

### Estat Stripe: TEST

**Stripe segueix en mode TEST i hi ha de seguir fins que Anna obri cobros manualment.** Cap agent farà mai el pas a LIVE.

### Pricing: mapping confirmat (pendent de crear a Stripe)

Font de veritat: `docs/PLA_PRICING_STRIPE.md`. Resum:

| Product (metadata) | lookup_key | Import | Interval | Trial |
|---|---|---|---|---|
| Players & Coaches (`firebaseRole: premium`, `segment: individual`) | `individual_monthly` / `individual_monthly_trial` | 9,99 € (999 ¢) | month | — / 30 dies |
| | `individual_yearly` / `individual_yearly_trial` | 99,99 € (9999 ¢) | year | — / 30 dies |
| Clubs (`firebaseRole: premium`, `segment: club`) | `club_monthly` / `club_monthly_trial` | 24,99 € (2499 ¢) | month | — / 30 dies |
| | `club_yearly` / `club_yearly_trial` | 249,99 € (24999 ¢) | year | — / 30 dies |

Tots EUR, `tax_behavior: inclusive` (B2C IVA inclòs). **Decisió de gating: mantenir `firebaseRole: premium` als 2 Products** (zero canvis a `firestore.rules`); la diferenciació de segment es fa amb metadata `segment` + validació de rol a la CF de checkout. El Product antic 25 €/250 € s'ha d'arxivar.

### Pròxima acció (ordre recomanat)

1. **En paral·lel, demanar a l'Aleix** les dades del titular (nom legal/NIF/domicili/email RGPD) — camí crític extern del P0 #4. Cap feina tècnica per a ell.
2. **Fixos de codi propis**: #8 validació rol↔segment + #9 guard antidoble + #11 format de preu (desbloquegen el QA de checkout).
3. Bloc RGPD: #1 (retirar el claim fals de l'AboutPage és immediat), #3 storage.rules + bloc a firebase.json, #5, #6, #7, #2.
4. Consoles Stripe/Firebase (vegeu «Què ha de fer Anna» a `docs/PLA_PRICING_STRIPE.md` i `docs/AUDITORIA_RGPD.md`): crear els 8 Prices en TEST, Stripe Tax, Customer Portal, verificar regió bucket/DPA.
5. #14 lint com a escombrada final → re-executar la porta release-gate sencera.
6. Només llavors: Anna valora el pas TEST→LIVE (manual, mai un agent).

### QA de compliance

No s'han executat proves QA de compliance (capes 1/2 només planificades) → **no s'ha generat `docs/CONSTANCIA_RGPD_QA.html`**. Es crearà quan s'executin els casos M1-M7 definits a `docs/RELEASE_GATE_COBROS.md`.
