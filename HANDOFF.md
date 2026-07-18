# HANDOFF — GlobalPlay360

> Document de traspàs entre sessions. Última actualització: **18 juliol 2026 (matí — camí entrega completa)**.
> Font de veritat legal: `docs/AUDITORIA_RGPD.md` · Pla de pricing: `docs/PLA_PRICING_STRIPE.md` · Porta QA: `docs/RELEASE_GATE_COBROS.md`.
> **Client/titular: Aleix Pérez Jané** (correcció: les mencions antigues a "Aina" eren errònies).

---

## ▶️ REPRESA AQUÍ — 18 jul 2026 matí

### Fase del projecte

**Pre-entrega / TEST → després LIVE.** Codi a `fix/bloc1-pre-cobros` (no fusionada, no pushejada). Decisió: **cap retall** — tot ha de quedar fet abans d’entregar a l’Aleix (encara que calgui més temps).

Sync Pricing TEST ✅. **Ara:** Portal + emails → deploy → checkout E2E → go-live Stripe → document entrega.

### Fet a la consola (17 jul)

| Ítem | Estat |
|---|---|
| Diagnosi sync | ✅ Productes eren a **LIVE** per error; TEST estava buit. Recreats en TEST. |
| Webhook `401 Invalid Secret` | ✅ Arreglat: `whsec` nou a l’extensió → entregues **200 OK** |
| 2 Products + 4 Prices TEST a Firestore | ✅ amb `segment` / `stripe_metadata_segment` + `prices` |
| Extensió `invertase/…@0.3.12` | ✅ `europe-west1`, ID `firestore-stripe-payments` |
| Catàleg LIVE (Clubs + Players) | ⚠️ Existeix (creat sense voler). **No usar per QA.** Deixar per al go-live. |
| **IVA / `tax_behavior` / Stripe Tax** | ⏳ **AJORNAT al go-live.** Els Prices TEST tenen `tax_behavior: unspecified`. No s’ha trobat via clara a la UI per gestionar IVA ara; els imports (9,99/99,99/24,99/249,99) ja estan pensats **IVA inclòs**. Abans de LIVE: activar Stripe Tax + dades fiscals Aleix + OSS UE + `tax_behavior: inclusive` (o equivalent). Documentat a consciència 17/07. |
| Sync Products → Firestore (TEST) | ✅ 17/07 nit — webhook 200; 2 products + 4 prices; Clubs `prices` OK després de reintent/propagació |
| Customer Portal + emails trial | ⏳ Següent consola |
| Prova Pricing local | ✅ 17/07 — anònim + player/coach/club (preus/segment OK). Checkout 4242 encara no. |
| Alert Stripe «2 tareas / transferencias» | ℹ️ Sense impacte en TEST; completar abans de LIVE |

### Codi ja fet (no cal refer)

- Trial a nivell de checkout (`trial_period_days` a la CF) — commits `a9f3def`+
- PricingPage selecció per `segment` + i18n — commits `5f112d2`+
- BLOC 1+2 RGPD (Art. 7/17/20, storage.rules, texts legals, rol↔segment, antidoble…)

### Primeres accions en reprendre (ordre)

1. Neteja Firestore: eliminar o `active: false` l’antic `prod_ULxLPJvpWpH7vc` si encara hi és.
2. **Customer Portal** (TEST): https://dashboard.stripe.com/test/settings/billing/portal — URLs `/terms` + `/privacy`; només canvi mensual↔anual del mateix Product (no Individual↔Clubs).
3. **Emails Stripe**: recordatori fi de trial + pagament fallit.
4. Prova Pricing/checkout en local (targeta test `4242`) amb usuari player i club.
5. Merge branca + `firebase deploy --only firestore:rules,storage,functions` + QA E2E TEST. **Encara no LIVE.**
6. Al go-live: Stripe Tax + IVA (`tax_behavior` / inclusive) — vegeu fila IVA amunt.

### Enllaços ràpids (consola)

| Què | URL |
|---|---|
| Firebase Extensions | https://console.firebase.google.com/project/globalplay360-3f9a1/extensions |
| Firestore `products` | https://console.firebase.google.com/project/globalplay360-3f9a1/firestore/databases/-default-/data/~2Fproducts |
| Cloud Functions (logs webhook) | https://console.firebase.google.com/project/globalplay360-3f9a1/functions |
| Stripe Products (TEST) | https://dashboard.stripe.com/test/products |
| Stripe Webhooks (TEST) | https://dashboard.stripe.com/test/webhooks |
| Stripe API keys (TEST) | https://dashboard.stripe.com/test/apikeys |
| Stripe Customer Portal | https://dashboard.stripe.com/test/settings/billing/portal |
| Stripe emails / Billing | https://dashboard.stripe.com/test/settings/billing |
| Extensió Invertase (docs) | https://extensions.dev/extensions/invertase/firestore-stripe-payments |
| URL webhook (funció) | `https://europe-west1-globalplay360-3f9a1.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents` |

### Prompt per al proper xat

> Llegeix `HANDOFF.md` secció **REPRESA AQUÍ**. Projecte GlobalPlay360. Continuem al punt: webhook Stripe TEST creat + extensió invertase 0.3.12 instal·lada, però **Products nous no sincronitzen a Firestore**. Diagnosi entregues webhook + forçar sync + verificar `products` amb `segment`. Després Customer Portal + emails. Stripe TEST only, no Live, no deploy fins sync OK. Català.

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
