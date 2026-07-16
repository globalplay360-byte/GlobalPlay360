# Auditoria RGPD / LOPDGDD — GlobalPlay360

**Data:** 16 juliol 2026
**Abast:** repositori `F:\Freelance\globalplay360\globalplay360` (React 18 + Vite + TS + Firebase + extensió `firestore-stripe-payments`). Auditoria estàtica de codi i configuració; l'estat de les consoles Firebase/Stripe queda marcat com a **PENDENT DE VERIFICAR PER ANNA A LA CONSOLA**.
**Marc:** RGPD (UE 2016/679) + LOPDGDD (LO 3/2018).
**Rol d'Anna:** desenvolupadora/processadora tècnica. Titular del tractament: el client, **Aleix Pérez Jané** (autònom, NIF 47939862L) — les dades de titular dels textos legals les aporta ell.
**Context de negoci:** es vol obrir cobros aviat (Stripe en mode TEST; pas a LIVE manual per Anna). Pricing aprovat: jugadors/entrenadors 9,99 €/mes · 99,99 €/any; clubs 24,99 €/mes · 249,99 €/any; trial 30 dies; B2C amb IVA inclòs. Registre públic actualment **tancat** per flag (`VITE_PUBLIC_REGISTRATION_ENABLED`).

---

## 1. Resum executiu — veredicte

# 🔴 NO-GO per a COBROS

Hi ha **7 bloquejants P0 oberts**. Els tres drets fonamentals operatius (esborrat Art. 17, portabilitat Art. 20, consentiment Art. 7) **no existeixen enlloc del codi**, les regles de Storage **no estan versionades ni es despleguen des del repo**, i els textos legals publicats tenen el responsable del tractament literalment com a `[pendiente de configuración]` — no hi ha ni una adreça de correu real per exercir drets.

Agreujant reputacional: la pàgina About **afirma públicament** «Right to erasure implemented via Cloud Functions» quan aquesta Cloud Function **no existeix**. És una declaració de conformitat falsa visible a producció, en 3 idiomes.

El nivell tècnic de seguretat (rules Firestore, split de PII, claims Stripe) és alt — el problema és exclusivament la **capa de compliance**, que no s'ha construït mai.

---

## 2. Ja OK (verificat al codi)

| # | Àrea | Evidència |
|---|------|-----------|
| 1 | **Firestore rules restrictives** — cap `if true` sobre dades personals. Les úniques lectures públiques són `opportunities`, `products/*` i `campaigns` (dades de negoci, justificat per marketplace/pricing públics) | `firestore.rules` |
| 2 | **Split de PII** — email, phone, instagram, youtubeVideoUrl, dateOfBirth viuen a `users/{uid}/private/profile` amb rule pròpia, no al doc públic. Migració lazy del schema legacy inclosa | `firestore.rules:83-93`, `src/types/index.ts:45-51`, `src/services/profile.service.ts` |
| 3 | **Billing infalsificable** — el client no pot escriure a `customers/*`, `billing_state/*` ni auto-assignar-se plan; font de veritat = claim `stripeRole` del JWT + webhooks de l'extensió | `firestore.rules:193-252` |
| 4 | **Retenció de missatgeria implementada** — CF programada `cleanupInactiveConversations` esborra converses inactives >90 dies, coherent amb el que promet la política de privacitat (§7) | `functions/index.js:342-369`, `functions/retention.js` |
| 5 | **Cloud Functions a regió UE** — `setGlobalOptions({ region: 'europe-west1' })` i client apuntant-hi | `functions/index.js:20`, `src/services/firebase.ts:22` |
| 6 | **Rutes legals públiques existents** — `/privacy`, `/terms`, `/cookies`, `/contact` al router, amb contingut estructurat trilingüe CA/ES/EN que cobreix l'esquema Art. 13-14 (bases legals, encarregats, transferències SCC, drets, AEPD, retenció) | `src/App.tsx:73-76`, `src/content/legal/*.ts` |
| 7 | **Cap analytics ni tracking** — verificat: cap GA/gtag/Plausible/PostHog/Hotjar/Sentry al codi client. Cookies existents = Firebase Auth + i18next (tècniques, exemptes de consentiment) → **el cookie banner NO és obligatori avui** i la política de cookies ho declara correctament | grep negatiu a `src/`; `src/content/legal/cookies.content.ts` |
| 8 | **Art. 22 — no aplica** — cap scoring ni rebuig automàtic de candidatures; el canvi d'estat d'una application el fa manualment el club | `src/services/applications.service.ts`, `firestore.rules:104-134` |
| 9 | **Traçabilitat admin** — `admin_audit_logs` immutable (create only, mai update/delete) | `firestore.rules:183-186` |
| 10 | **Superfície reduïda** — registre públic tancat per flag mentre no hi ha compliance; bloqueig a nivell de servei, no només UI | `src/config/site.ts`, `src/services/auth.service.ts:125-127`, `docs/registre-produccio.md` |
| 11 | **Verificació d'email + reset password** amb pantalles pròpies | `src/services/auth.service.ts:134-136,182-203` |

---

## 3. P0 — Bloquejants per a COBROS

### P0-1 · Esborrat total de compte (Art. 17) — NO EXISTEIX
- Cap Cloud Function d'esborrat a `functions/index.js` (només single-session, billing i cleanup de converses). Cap UI «Eliminar el meu compte» a `src/` (grep negatiu).
- Les rules ho impossibiliten des del client: `users/{uid}` i `users/{uid}/private/*` tenen `allow delete: if false` (`firestore.rules:81,92`). Sense CF amb Admin SDK, l'esborrat és **impossible** fins i tot manualment ben fet.
- **Agreujant**: `src/pages/public/AboutPage.tsx:341` + `src/locales/{ca,es,en}/common.json:196` publiquen «Dret a l'oblit implementat via Cloud Functions» — **fals**. Cal o implementar-ho o retirar el text immediatament (el text fals és un P0 per si sol: declaració de conformitat enganyosa).
- **Acció**: CF `deleteUserAccount` (patró `delete_user_account.ts` d'El Visionat, adaptat a React via callable): Auth + `users/{uid}` + `private/*` + `applications` (per `userId` i per `clubId`) + `conversations`+`messages` on participa + `auth_sessions/{uid}` + `billing_state/{uid}` + `customers/{uid}` i subcol·leccions + cancel·lació/delete del customer a Stripe + Storage `users/{uid}/*` + log immutable amb hash del uid (mai el uid en clar).

### P0-2 · Exportació de dades (Art. 20) — NO EXISTEIX
- Cap CF ni procediment. La política de privacitat promet portabilitat (§6) que avui és impossible d'atendre: **ni tan sols hi ha email de contacte real** on demanar-la (vegeu P0-4).
- **Acció**: CF `exportUserData` amb ZIP (JSON estructurat + avatar), ratelimit 1/24h, URL amb token i caducitat, neteja a 24h (patró `export_user_data.ts` d'El Visionat). Mínim operatiu acceptable pre-CF: procediment documentat email ≤30 dies + export manual des d'Admin — però amb cobros oberts és preferible automatitzar.

### P0-3 · Storage rules no versionades i no desplegables
- **No existeix `storage.rules` al repo** (glob negatiu) i **`firebase.json` no té bloc `storage`** — qualsevol regla que hi hagi a la consola no està sota control de versions, i un `firebase deploy` mai la tocarà. Estat real: **PENDENT DE VERIFICAR PER ANNA A LA CONSOLA** (pot ser des del default restrictiu fins a un `if true` heretat).
- Storage conté **imatges facials**: `users/{uid}/avatar.jpg` (`src/services/profile.service.ts:167-171`).
- **Acció**: crear `storage.rules` (lectura autenticada o pública segons producte per a avatars; escriptura només propietari + `contentType` imatge + límit de mida) + afegir `"storage": { "rules": "storage.rules" }` a `firebase.json` + desplegar i verificar.

### P0-4 · Textos legals amb placeholders — responsable del tractament inexistent
- `src/content/legal/privacy.content.ts`, `terms.content.ts` (15 ocurrències) i `cookies.content.ts` tenen titular, denominació social, NIF, domicili, email RGPD i DPO com a `[pendiente de configuración]` en els 3 idiomes.
- `src/pages/public/ContactPage.tsx:69-80`: l'email legal i l'adreça mostren «Pendent de configuració». **No hi ha cap via real per exercir drets** — incompliment directe d'Art. 13.
- **Acció**: demanar a l'Aleix (validació de producte/legal, no feina tècnica): titular, NIF/CIF, domicili, email RGPD (i si escau DPO). Anna injecta les dades als 3 fitxers + ContactPage. **[16 jul 2026: dades rebudes i aplicades — vegeu HANDOFF.md]**

### P0-5 · Consentiment (Art. 7) — cap registre
- `src/pages/auth/RegisterPage.tsx`: cap checkbox d'acceptació de privacitat/termes, cap enllaç als documents legals al formulari. `src/services/auth.service.ts` no persisteix cap camp de consentiment. No existeix `consent_history` ni res equivalent a rules ni a functions. El mateix aplica al registre amb Google.
- Sense això és impossible **demostrar** el consentiment/acceptació contractual (Art. 7.1: la càrrega de la prova és del responsable).
- **Acció**: checkbox obligatori amb enllaços a `/privacy` i `/terms` + CF `recordConsent` (patró `record_consent.ts` d'El Visionat): timestamp server-side, versió del document, IP extreta al servidor, user agent, locale, log immutable a `consent_history/` amb escriptura només Admin SDK (rules `allow write: if false`).

### P0-6 · Paywall/checkout sense enllaços legals
- `src/pages/public/PricingPage.tsx` i `src/pages/dashboard/BillingPage.tsx`: **cap** referència a privacy/terms (grep negatiu) abans dels CTA de subscripció/checkout.
- **Acció**: línia estàndard sota els CTA («En subscriure't acceptes les [Condicions] i la [Política de privacitat]») a PricingPage i BillingPage. També configurar les URLs legals al Customer Portal de Stripe (**PENDENT DE VERIFICAR PER ANNA A LA CONSOLA Stripe**).

### P0-7 · Terms amb pricing desfasat — informació precontractual incorrecta
- `src/content/legal/terms.content.ts` §4 (els 3 idiomes): «Premium … 25 € al mes o 250 € a l'any». El pricing aprovat és 9,99/99,99 € (jugadors/entrenadors) i 24,99/249,99 € (clubs), trial 30 dies, IVA inclòs.
- Obrir cobros amb unes condicions publicades que no coincideixen amb el que Stripe cobrarà és un risc de normativa de consum (informació precontractual, LGDCU) a més de transparència RGPD.
- **Acció**: actualitzar §4 dels Terms als 3 idiomes amb els preus per rol, trial 30 dies i menció explícita «IVA inclòs». Aprofitar per revisar §6 (desistiment Art. 103.m — el redactat existent és correcte però cal que el checkout reculli la renúncia expressa).

---

## 4. P1 — Abans d'ampliar audiència (i condicionats)

### P1-1 · Menors (LOPDGDD Art. 7) — ⚠️ ATENCIÓ ESPECIAL: públic esportiu
- **Cap validació d'edat enlloc.** `dateOfBirth` és un camp opcional del perfil (`src/components/profile/fields/PlayerFields.tsx:51-57`), no es demana al registre i res no comprova ≥14 anys ni al client ni al servidor.
- Incoherència legal: la política de privacitat §8 diu «no dirigit a menors de **16** anys» — el llindar LOPDGDD espanyol és **14**. Cal triar el llindar de producte (14 és el mínim legal; 16 és decisió vàlida però llavors s'ha d'aplicar de debò) i alinear text + validació.
- El públic objectiu (esportistes buscant club) **inclou menors amb altíssima probabilitat**. Mentre el registre públic estigui tancat el risc està contingut, però:
- **⛔ Aquest punt esdevé P0 si es reobre el registre públic** (`VITE_PUBLIC_REGISTRATION_ENABLED=true`). No reobrir sense: data de naixement obligatòria al registre + validació server-side (CF, patró `request_registration.ts` d'El Visionat) + flux de consentiment parental o bloqueig segons decisió de producte.

### P1-2 · Exposició de PII a qualsevol Premium — minimització (Art. 5.1.c)
- `firestore.rules:87-89`: la subcol·lecció privada (email, **phone**, **dateOfBirth**, instagram) és llegible per **qualsevol usuari amb claim premium/pro**, no només pel propietari. És el model de negoci (contacte entre clubs i jugadors), però `dateOfBirth` complet de potencials menors visible a tot subscriptor mereix revisió: valorar exposar només edat/any de naixement al perfil públic i restringir el contacte directe.
- Com a mínim: reflectir-ho explícitament a la política de privacitat («els usuaris Premium poden veure les teves dades de contacte») — ara no ho diu.

### P1-3 · Registre d'activitats de tractament (Art. 30) — no existeix
- Cap document. Sanció específica per manca de registre: fins a 10.000 €.
- **Acció**: crear `docs/REGISTRE_ART30.md` (patró d'El Visionat): finalitats, bases legals, categories, destinataris (Google, Stripe), transferències (SCC EUA), terminis de retenció, mesures tècniques.

### P1-4 · DPA amb processors — taula de referència
| Processor | Servei | DPA (URL viva) | Estat |
|---|---|---|---|
| Google Cloud / Firebase | Auth, Firestore, Storage, Functions, Hosting | https://cloud.google.com/terms/data-processing-addendum · https://firebase.google.com/terms/data-processing-terms | **PENDENT DE VERIFICAR PER ANNA A LA CONSOLA** (acceptació al compte + regió de Firestore/Storage) |
| Stripe | Pagaments (via extensió) | https://stripe.com/legal/dpa | **PENDENT DE VERIFICAR PER ANNA** (compte Stripe de la clienta) |
- El codi només demostra regió UE per a **Functions**; la localització de Firestore i del bucket de Storage s'ha de confirmar a la consola.

### P1-5 · UI «Eliminar el meu compte» + retenció de comptes inactius
- Un cop existeixi la CF d'Art. 17 (P0-1), afegir la UI al dashboard (Profile o Billing) amb confirmació forta.
- Política de retenció: supressió automàtica de comptes inactius 24 mesos (avui només hi ha retenció de converses).

### P1-6 · Rectificació (Art. 16) — parcial
- El player pot editar el seu perfil; segons `CLAUDE.md`, les seccions d'edició per a rols **coach i club** estaven «en desenvolupament». Verificar que avui tots els rols poden rectificar les seves dades; si no, completar-ho.

---

## 5. P2 — Higiene contínua

1. **Procediment de bretxes** documentat (notificació AEPD 72h, Art. 33-34) — no existeix.
2. **CMP / cookie banner abans d'activar cap analytics** futur (GA4, Plausible amb cookies, etc.). Avui no cal; el dia que s'activi tracking, sí, i **abans**.
3. `auth_sessions/{uid}.lastLoginDeviceId` (identificador de dispositiu) i timestamps de login: cobert genèricament per «dades d'ús» a la política; en la propera revisió del text, esmentar el control de sessió única explícitament.
4. Revisió anual del registre Art. 30; auditoria externa a partir de 500 usuaris pagants.
5. Retirar o matisar el trust badge «GDPR» del Footer (`src/components/layout/Footer.tsx:106`) mentre els P0 estiguin oberts — mateix criteri que el text de l'AboutPage.

---

## 6. Inventari de dades personals (mapa: firestore.rules + codi)

| Col·lecció / ubicació | Dades personals | Finalitat | Qui hi accedeix (rules) |
|---|---|---|---|
| `users/{uid}` | displayName, photoURL, role, bio, esport, país, posició, alçada, pes, club actual | Perfil públic de marketplace | Autenticats amb sessió vàlida (perfils de club: només owner/admin/premium) |
| `users/{uid}/private/profile` | **email, phone, instagram, youtubeVideoUrl, dateOfBirth** | Contacte i verificació | Propietari + **qualsevol Premium/Pro** + admin implícit ⚠️ (P1-2) |
| `opportunities/{id}` | clubId, dades de l'oferta (poden contenir contacte del club al text) | Marketplace | **Lectura pública sense auth** (`if true`) |
| `applications/{id}` | userId, clubId, missatge de candidatura | Candidatures | Candidat, club receptor, admin |
| `conversations/{id}` + `messages` | participants, contingut de missatges (comunicacions privades) | Missatgeria | Participants (contingut només Premium) + admin. Retenció 90 dies ✓ |
| `auth_sessions/{uid}` | validAfterSeconds, lastLoginAt, **lastLoginDeviceId** | Sessió única / antifrau | Propietari (read); escriptura només CF |
| `billing_state/{uid}` | trialConsumedAt, founder claims | Control de trial/campanya | Propietari (read); escriptura només CF |
| `customers/{uid}` + `checkout_sessions`, `subscriptions`, `payments` | stripeId, links de checkout, estat de subscripció, historial de pagaments | Facturació (extensió Stripe) | Propietari (read); escriptura només extensió |
| `admin_audit_logs/{id}` | uid afectat, acció de moderació | Traçabilitat admin | Només admin; immutable |
| `consent_history/` | — | **NO EXISTEIX** (P0-5) | — |
| Storage `users/{uid}/avatar.jpg` | **Imatge facial** | Avatar | **Rules desconegudes** (P0-3) |
| Firebase Auth | email, password hash, displayName, photoURL (Google), custom claims | Autenticació | Firebase |
| Stripe (extern) | nom, email, targeta, adreça de facturació, IP | Pagaments | Stripe (DPA — P1-4) |
| `products`, `prices`, `tax_rates`, `campaigns` | Cap dada personal | Pricing públic | Públic (correcte) |

---

## 7. Checklist Go/No-Go per hito

### Hito COBROS (Stripe live) — 🔴 NO-GO
- [ ] P0-1 CF esborrat Art. 17 + retirar/fer certa la claim de l'AboutPage
- [ ] P0-2 Exportació Art. 20 (CF, o mínim procediment email operatiu amb bústia real)
- [ ] P0-3 `storage.rules` al repo + bloc `storage` a `firebase.json` + deploy verificat
- [ ] P0-4 Textos legals complets (dades de l'Aleix) + email RGPD real a ContactPage
- [ ] P0-5 Checkbox consentiment al registre + `consent_history` immutable
- [ ] P0-6 Enllaços legals a PricingPage + BillingPage + Customer Portal Stripe
- [ ] P0-7 Terms §4 amb el pricing nou (9,99/99,99 · 24,99/249,99 · trial 30 dies · IVA inclòs)
- [ ] Verificacions de consola (secció 9) tancades per Anna

### Hito REOBERTURA REGISTRE PÚBLIC — 🔴 NO-GO addicional
- [ ] Tot l'anterior
- [ ] P1-1 Validació d'edat server-side (≥14 o llindar triat) + coherència amb política §8
- [ ] P1-2 Decisió sobre exposició de PII a Premium reflectida a la política

### Hito ANALYTICS (si mai s'activa)
- [ ] Cookie banner / CMP amb consentiment previ
- [ ] Actualitzar política de cookies (avui declara que no n'hi ha — correcte)

---

## 8. Canvis concrets (fitxer per fitxer)

| Prioritat | Fitxer / ruta | Canvi |
|---|---|---|
| P0-1 | `functions/index.js` (o nou `functions/deleteUserAccount.js`) | CF callable d'esborrat total (patró El Visionat `delete_user_account.ts`) |
| P0-1 | `src/pages/public/AboutPage.tsx:341` + `src/locales/{ca,es,en}/common.json:196` | Retirar «dret a l'oblit implementat» fins que sigui cert |
| P0-2 | `functions/` | CF `exportUserData` (patró El Visionat `export_user_data.ts`) |
| P0-3 | `storage.rules` (nou) + `firebase.json` | Rules per propietat + contentType + mida; bloc `"storage"` |
| P0-4 | `src/content/legal/privacy.content.ts`, `terms.content.ts`, `cookies.content.ts`, `src/pages/public/ContactPage.tsx` | Substituir tots els `[pendiente de configuración]` amb dades reals de l'Aleix |
| P0-5 | `src/pages/auth/RegisterPage.tsx`, `src/services/auth.service.ts`, `functions/` (CF `recordConsent`), `firestore.rules` | Checkbox + log de consentiment enriquit + rules `consent_history` write-only-admin |
| P0-6 | `src/pages/public/PricingPage.tsx`, `src/pages/dashboard/BillingPage.tsx` | Línia legal amb enllaços abans dels CTA |
| P0-7 | `src/content/legal/terms.content.ts` §4 (×3 idiomes) | Pricing nou + IVA inclòs |
| P1-1 | `src/pages/auth/RegisterPage.tsx` + CF de registre + `privacy.content.ts` §8 | Data de naixement obligatòria + validació edat server-side + llindar coherent |
| P1-3 | `docs/REGISTRE_ART30.md` (nou) | Registre d'activitats de tractament |
| P1-5 | `src/pages/dashboard/ProfilePage.tsx` o `BillingPage.tsx` | UI «Eliminar el meu compte» → CF P0-1 |
| P2-5 | `src/components/layout/Footer.tsx:106` | Revisar trust badge «GDPR» mentre hi hagi P0 oberts |

---

## 9. PENDENT DE VERIFICAR PER ANNA A LA CONSOLA

1. **Regió de Firestore i del bucket de Storage** (Firebase Console → Project settings). El codi només demostra `europe-west1` per a Functions.
2. **Estat real de les Storage rules** a la consola (el repo no en té cap còpia — poden ser el default o qualsevol cosa).
3. **DPA Google Cloud/Firebase** acceptat al compte del projecte (URLs a P1-4).
4. **DPA Stripe** al compte de la clienta + configuració de l'extensió `firestore-stripe-payments` (claus test, webhook, `firebaseRole` metadata).
5. **Stripe Tax / IVA**: preus B2C amb IVA inclòs → activar Stripe Tax amb dades fiscals de la clienta abans de live (nota: ja constava als followups del projecte).
6. **URLs legals al Customer Portal** de Stripe (depèn de P0-4/P0-6).
7. **Cap Google Analytics vinculat** al projecte Firebase (el codi no l'inicialitza, però confirmar que la consola no té GA activat a nivell de projecte).
8. **Neteja de subscripcions de test** antigues abans del pas a live.

---

## 10. Estat QA de compliance

**No executat** (auditoria només de lectura). Quan es tanquin els P0:
- **Capa 1 (motor, Admin SDK):** test Art. 17 (uid inexistent a Auth + totes les col·leccions de l'inventari §6 + Storage + Stripe després de `deleteUserAccount`); test que un client no pot auto-marcar-se premium (ja hi ha base a `tests/rules-s6-t5.mjs`); test que `consent_history` és inescrivible des del client.
- **Capa 2 (interfície, Playwright):** `/privacy` i `/terms` sense placeholders; enllaços legals visibles a Pricing/Billing abans del CTA; checkbox al registre; flux «Eliminar compte».
- Deixar constància a `docs/CONSTANCIA_RGPD_QA.md` (o HTML) amb data, PASS/FAIL per capa i decisió Go/No-Go.

---

## 11. Pla d'acció proposat (ordre d'execució)

1. **Immediat (sense dependències):** retirar claim fals de l'AboutPage (P0-1b) · crear `storage.rules` + bloc a `firebase.json` (P0-3) · enllaços legals a Pricing/Billing (P0-6) · Terms §4 pricing nou (P0-7).
2. **Demanar a l'Aleix (bloqueja P0-4):** titular, NIF, domicili, email RGPD. Una sola petició, validació de producte — cap feina tècnica per a ell.
3. **Implementació backend (2-3 dies):** CF `deleteUserAccount` (P0-1) → CF `recordConsent` + checkbox registre (P0-5) → CF `exportUserData` (P0-2). Reutilitzar patrons d'El Visionat.
4. **Verificacions de consola** (secció 9) en paral·lel.
5. **QA de compliance 2 capes** (secció 10) + constància → **re-avaluar GO cobros**.
6. Post-cobros: P1-1 menors (obligatori abans de reobrir registre), Art. 30, retenció inactius, UI eliminar compte.

---

*Auditoria elaborada el 16/07/2026. Propera revisió: en tancar els P0 o abans de qualsevol deploy que toqui registre, billing o rules.*
