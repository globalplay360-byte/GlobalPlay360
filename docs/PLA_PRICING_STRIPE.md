# Pla de reajust de pricing + pas a cobros — GlobalPlay360

**Data:** 2026-07-16
**Abast:** auditoria READ-ONLY del flux de billing (rules, Cloud Functions, extensió `firestore-stripe-payments@0.3.4`, PricingPage, AuthContext, tests). Cap canvi aplicat a `src/`, `functions/` ni `firestore.rules`.
**Pricing nou aprovat (font de veritat):**

| Segment | Mensual | Anual | Trial |
|---|---|---|---|
| Jugadors + entrenadors | 9,99 €/mes | 99,99 €/any | 30 dies gratuïts |
| Clubs | 24,99 €/mes | 249,99 €/any | 30 dies gratuïts |

Preus B2C amb IVA inclòs → `tax_behavior: inclusive`. Els Prices nous **encara no existeixen a Stripe**; els crearà Anna (consola o script). El pas Test→Live el fa Anna manualment.

---

## 0. Com funciona el sistema avui (verificat al codi)

- El gating és **binari**: la claim `stripeRole` del JWT val `'premium'` o `'pro'` (`firestore.rules:21-27`, `src/context/AuthContext.tsx:72-74`). L'extensió l'assigna copiant `metadata.firebaseRole` del Product de Stripe quan la subscripció és `active`/`trialing`.
- El frontend **no usa cap `VITE_STRIPE_*` ni priceId hardcoded** (no existeix `.env.example`; verificat amb cerca global). La `PricingPage` llegeix els Products/Prices sincronitzats a Firestore (`src/services/stripe.service.ts:87-125`) i tria el producte amb `products.find((p) => p.role === 'premium')` (`src/pages/public/PricingPage.tsx:39`).
- El checkout passa per la callable pròpia `createBillingCheckoutSession` (`functions/index.js`), que aplica la política **one-trial-only**: si `billing_state/{uid}.trialConsumedAt` no existeix, afegeix `trial_period_days: 30` al doc de `checkout_sessions` i l'extensió el passa a Stripe (`functions/billingPolicy.js` → `getCheckoutSessionTrialDays`, tests a `functions/billingPolicy.test.js`). **El trial s'aplica a nivell de checkout — la via oficial de Stripe.** ⚠️ **ACTUALITZAT 16/07** — abans el trial vivia en Prices `_trial` dedicats; s'ha refactoritzat perquè Stripe **ja no permet posar trials a nivell de preu** (ni dashboard ni API moderna). Conseqüència directa a la taula de mapping: **NO cal crear cap Price `_trial`.**
- La diferenciació per rol d'usuari (`player`/`coach`/`club`) viu a `users/{uid}.role`, mai al pla. Cap regla de Firestore distingeix un premium-club d'un premium-jugador: `hasPremium()` s'usa igual per a tots (`firestore.rules:59, 89, 160, 164, 174`).

---

## 1. Taula de mapping — Products/Prices a crear a Stripe (live)

> Tots els Prices: `currency=eur`, `tax_behavior=inclusive`, recurring. **Cap Price `_trial`** — el trial de 30 dies l'aplica la Cloud Function al checkout (`trial_period_days`), no el preu.

### Product 1 — Jugadors i entrenadors

| Camp | Valor |
|---|---|
| Nom | `GlobalPlay360 Premium — Players & Coaches` |
| Description | Accés Premium per a jugadors i entrenadors: xat directe, candidatures il·limitades, visibilitat completa |
| Metadata | `firebaseRole: premium` · `segment: individual` (nova, per a la selecció al frontend) |
| Statement descriptor | `GLOBALPLAY360` |

| Price (lookup_key) | Import (cèntims) | Interval | tax_behavior |
|---|---|---|---|
| `individual_monthly` | **999** | month | inclusive |
| `individual_yearly` | **9999** | year | inclusive |

### Product 2 — Clubs

| Camp | Valor |
|---|---|
| Nom | `GlobalPlay360 Premium — Clubs` |
| Description | Accés Premium per a clubs: publicació d'ofertes, gestió de candidatures, contacte directe amb talent |
| Metadata | `firebaseRole: premium` · `segment: club` |
| Statement descriptor | `GLOBALPLAY360` |

| Price (lookup_key) | Import (cèntims) | Interval | tax_behavior |
|---|---|---|---|
| `club_monthly` | **2499** | month | inclusive |
| `club_yearly` | **24999** | year | inclusive |

**Total: 2 Products × 2 Prices = 4 Prices.** El Product antic (25 €/250 €) s'ha d'**arxivar** (`active=false`): la PricingPage llegeix `where('active','==',true)` (`src/services/stripe.service.ts:88`) i l'extensió sincronitza l'estat — si queda actiu, sortirà com a candidat al `find()` de `PricingPage.tsx:39`.

### Com selecciona el price el frontend avui i què cal canviar

- **Avui**: `src/pages/public/PricingPage.tsx:39` agafa *el primer* producte amb `role === 'premium'`. Amb 2 products, tots dos tindran `role='premium'` (l'extensió escriu el camp `role` del doc de Firestore des de `metadata.firebaseRole`) → **selecció ambigua/aleatòria**. Cal seleccionar per `product.metadata.segment` creuat amb `user.role`: `'club'` → segment `club`; `'player'`/`'coach'` → segment `individual`. Per a visitants anònims, mostrar els dos segments (tabs o 3 cards).
- **Backend**: `createBillingCheckoutSession` **no valida** que el price demanat correspongui al rol de l'usuari (`functions/index.js:145-166` només comprova que el price existeix i és actiu dins el product demanat). Amb un sol preu era irrellevant; amb dos segments, **un club pot subscriure's al pla de 9,99 € cridant la callable amb el priceId individual** (crític). Cal afegir a la CF la comprovació `users/{uid}.role` vs `product.metadata.segment`.

---

## 2. Impacte al gating — recomanació de roles/claims

**Recomanació: mantenir `firebaseRole: premium` als DOS products.** Justificació:

1. El gating actual és binari (té accés / no en té). Cap regla, cap component i cap servei necessita distingir *quin* pla de pagament té l'usuari: la diferenciació funcional club/jugador ja es fa amb `users/{uid}.role` (p. ex. `firestore.rules:108-117` per a applications, `src/components/layout/Sidebar.tsx:156`).
2. Separar claims (`'premium'` vs `'club'`) obligaria a tocar rules desplegades en producció, l'AuthContext, la suite de tests de rules i 4 serveis més (llista sota) — molt risc per zero benefici funcional avui.
3. Si algun dia cal una feature exclusiva de club-premium, la condició `hasPremium() && get(users/$(uid)).data.role == 'club'` ja és expressable amb el que hi ha.

### Fitxers que caldria tocar SI es separessin els claims (referència, NO recomanat)

| Fitxer:línia | Què |
|---|---|
| `firestore.rules:24` | `stripeRole in ['premium','pro']` → afegir `'club'` |
| `firestore.rules:11` | comentari de valors esperats de la claim |
| `src/context/AuthContext.tsx:72-74` | `hasStripeRoleEntitlement()` — afegir el valor nou |
| `tests/rules-s6-t5.mjs:88,91,102,134,160` | contexts de test amb `stripeRole: 'premium'` — afegir casos `'club'` |
| `src/services/admin.service.ts:39` | check `u.plan === 'premium' \|\| 'pro'` (mirror) |
| `src/services/auth.service.ts:208` | check `user.plan === 'premium' \|\| 'pro'` (mirror) |
| `src/types/index.ts:2` | `PlanType` |
| `src/pages/admin/AdminUsersPage.tsx:232` | badge de pla |
| `functions/index.js:234` | mirror `plan: 'premium'` a `users` |

### Fitxers a tocar amb l'opció recomanada (mantenir `premium`, adaptar selecció per segment)

| Fitxer:línia | Què canviar |
|---|---|
| `src/pages/public/PricingPage.tsx:39` | Selecció de product per `metadata.segment` segons `user.role`; UI de 2 segments per a visitants anònims |
| `src/pages/public/PricingPage.tsx:85-86, 210, 224` | **BUG 1 — format de preu**: `(price.unit_amount / 100).toFixed(0)` mostraria "10€" en lloc de "9,99 €" (999/100 = 9.99 → arrodonit a 10). També afecta el preu ratllat (línia 210) i l'estalvi anual (línia 224: (999×12 − 9999)/100 = 19,89 → "20€"). Cal format amb 2 decimals i separador local |
| `functions/index.js:145-166` | Validar `users/{uid}.role` vs `product.metadata.segment` abans de crear la checkout_session (impedeix que un club pagui el preu individual) |
| `functions/index.js:158-170` | **BUG 3 — doble subscripció**: abans de crear la sessió, consultar `customers/{uid}/subscriptions` amb `status in ['trialing','active','past_due']` i rebutjar amb `HttpsError('already-exists')` si n'hi ha |
| `src/services/stripe.service.ts:347` + `src/pages/dashboard/BillingPage.tsx:23-27` | **BUG 2 — past_due bloquejat fora del Portal**: el listener filtra `status in ['trialing','active']`, així que una subscripció `past_due` és invisible, `activePlan` cau a `free` i BillingPage redirigeix a /pricing — l'usuari amb pagament fallit **no pot obrir el Customer Portal per arreglar la targeta**. El badge "Pagament pendent" de `BillingPage.tsx:131` és codi mort. Fix: incloure `past_due` al filtre i no redirigir en aquest estat |
| `src/i18n/locales/*` (claus `pricingPage.*`) | Textos per als 2 segments; verificar que cap literal esmenta 25 €/250 € |
| `docs/stripe-setup.md:52-54` | Actualitzar la documentació d'artefactes de Stripe |

Cap canvi necessari a `firestore.rules`, `AuthContext` ni tests de rules amb aquesta opció.

---

## 3. Checklist Test→Live (extensió `firestore-stripe-payments@0.3.4`)

1. **Products + 4 Prices** segons la taula (Anna, manual o script). **Cap Price `_trial`**: el trial l'aplica la CF al checkout via `trial_period_days` (requereix que l'extensió el deixi passar — vegeu punt 0 i la migració a `invertase/firestore-stripe-payments` acordada).
2. **Restricted API key live** (`rk_live_...`) amb els mateixos permisos que la de test, i **Webhook Endpoints: Ninguno** (tech debt ja documentat a `docs/stripe-setup.md:101`).
3. **Secrets**: `extensions/firestore-stripe-payments.env:6-8` apunta a `versions/1` dels secrets. Cal afegir una **versió nova** a `ext-firestore-stripe-payments-STRIPE_API_KEY` amb la clau live i **actualitzar la referència de versió** (o reconfigurar l'extensió des de consola) + `firebase deploy --only extensions`. Si només es puja el secret sense tocar la referència pin-ada, l'extensió seguirà amb la clau de test.
4. **Webhook live**: crear endpoint en live mode apuntant a la mateixa URL (`https://europe-west1-globalplay360-3f9a1.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`), amb els mateixos events que en test (sense `invoice.payment_succeeded` — eliminat per duplicats, `docs/stripe-setup.md:137`), i posar el `whsec_...` live com a versió nova del secret `STRIPE_WEBHOOK_SECRET`.
5. **Stripe Tax activat** amb dades fiscals de l'Aleix (Aleix Pérez Jané) + registre OSS UE. Nota: la checkout_session que crea la CF **no passa `automatic_tax: true`** (`functions/index.js:170-183`); amb preus `inclusive` el cobrament és correcte igualment, però sense automatic_tax Stripe no desglossa l'IVA a factures ni alimenta els informes de Tax. PENDENT DE VERIFICAR PER ANNA: si l'extensió 0.3.4 accepta `automatic_tax` al doc de sessió; si no, valorar upgrade a la versió `invertase/`.
6. **Customer Portal live**: branding (logo + Dark SaaS Navy), URLs legals reals (`/terms`, `/privacy` — han d'existir com a rutes públiques; eren bloquejants al Bloc 1 del pla d'entrega), i **limitar els canvis de pla permesos al Portal a prices del mateix Product** (vegeu risc R2).
7. **Retract waiver UE (Directiva 2011/83)**: l'extensió 0.3.4 **no exposa `consent_collection`** al doc de checkout_session (la CF a `functions/index.js:170-183` no el pot passar). Mitigació: (a) el waiver de desistiment ha de constar als Terms acceptats al registre i com a nota visible al CTA de la PricingPage; (b) amb trial de 30 dies el primer cobrament arriba després del període de desistiment de 14 dies, cosa que redueix el risc pràctic, però el text legal cal igualment. PENDENT DE VERIFICAR PER ANNA: si la versió actual/nova de l'extensió suporta `consent_collection`.
8. **Recordatori de fi de trial**: l'extensió només sincronitza l'event `trial_will_end` a Firestore — **no envia cap email**. Activar els emails natius de Stripe (Settings → Subscriptions and emails → recordatori de trial que finalitza; obligatori per a les normes de card networks amb free trials). PENDENT DE VERIFICAR PER ANNA A LA CONSOLA.
9. **Camps de subscripció no manipulables pel client**: ✅ verificat — `customers/{uid}` i totes les subcol·leccions són `write: if false` (`firestore.rules:225-252`), `checkout_sessions` fins i tot `create: if false` (només la CF amb Admin SDK), `billing_state` és `write: if false` (`firestore.rules:193-196`), i `users.plan`/`role`/`email` no es poden canviar en updates (`firestore.rules:71-73`). Cap acció necessària.
10. **Neteja**: cancel·lar les subscripcions de test antigues, arxivar el Product 25 €/250 € i els seus prices (test, i live si s'hi han replicat).
11. **Test E2E amb pagament real en live** abans d'obrir: checkout individual → claim `stripeRole` al JWT (refresh automàtic a `src/context/AuthContext.tsx:207-215`) → rules OK → mateix circuit amb un club → Portal → cancel·lació → expiració.

---

## 4. Riscos de facturació i mitigació

**R1 — Upgrade mensual→anual (mateix Product).** Risc baix. Ja validat en QA via Portal amb proració correcta (`docs/stripe-setup.md:149-154`, "Importe debido hoy: 0,01 €"). Amb trial actiu, el canvi d'interval manté el trial. Cap acció.

**R2 — Upgrade individu→club (canvi de Product).** El Portal només permet canviar entre products/prices llistats explícitament a la seva configuració. Risc: si es llisten els 2 products al Portal, qualsevol club es pot "downgrade-jar" al pla individual de 9,99 € (i viceversa) sense cap validació de rol — el webhook sincronitzaria i la claim seguiria sent `premium`, així que ningú se n'adonaria. **Mitigació**: configurar el Portal perquè només permeti canvis mensual↔anual dins del mateix Product; el canvi de segment (raríssim: implicaria canviar el rol del compte) es gestiona manualment des del dashboard de Stripe.

**R3 — Impagament (`past_due`).** Dos efectes verificats al codi:
- L'extensió retira la claim quan la subscripció deixa de ser `active`/`trialing` → el gating de rules es tanca immediatament al primer intent fallit, encara que Smart Retries segueixi reintentant. Decisió fail-closed acceptable, però cal saber-ho.
- **Bug UX real (BUG 2)**: `subscribeToActiveSubscription` filtra `status in ['trialing','active']` (`src/services/stripe.service.ts:347`) → una subscripció `past_due` és invisible per a la UI, `activePlan` cau a `free`, i `BillingPage.tsx:23-27` redirigeix l'usuari a /pricing en lloc de deixar-lo obrir el Portal per arreglar la targeta. **Mitigació**: incloure `past_due` al filtre del listener i no redirigir en aquest estat; activar Smart Retries + email de "payment failed" a Stripe.

**R4 — Cancel·lació durant el trial.** Via Portal arriba com `cancel_at_period_end=true` amb `status='trialing'`: la claim es manté fins a `trial_end` (accés fins al final del mes gratuït, sense cobrament — correcte). Inconsistència menor detectada: `hasStripeTrialWindow()` exclou `cancel_at_period_end` (`src/context/AuthContext.tsx:85-89`), així que el mirror `user.plan` diu `free` mentre `activePlan` (claim) diu `premium` — la UI pot mostrar missatges contradictoris durant aquesta finestra. Si el Portal es configurés amb cancel·lació **immediata** de trials, l'accés cauria a l'instant (claim retirada pel webhook). Decidir explícitament quina política vol l'Aleix; el codi actual assumeix `cancel_at_period_end`.

**R5 — Doble subscripció accidental (BUG 3).** Res no ho impedeix avui: `createBillingCheckoutSession` no comprova subscripcions existents (`functions/index.js:128-199`), i el listener fa `limit(1)` (`src/services/stripe.service.ts:348`) → un usuari amb 2 subscripcions actives (p. ex. mensual + anual, o individual + club) **pagaria dues vegades i la UI només n'ensenyaria una**. L'única protecció actual és que la PricingPage amaga el CTA si `activePlan==='premium'` (`PricingPage.tsx:250`), trivialment esquivable i vulnerable a race conditions post-checkout. **Mitigació**: a la CF, abans de crear la sessió, consultar `customers/{uid}/subscriptions` amb `status in ['trialing','active','past_due']` i rebutjar amb `HttpsError('already-exists')`.

**R6 — RESOLT (16/07).** El risc del "trial sibling" ha desaparegut: el trial ja no viu en Prices dedicats sinó que s'aplica a nivell de checkout (`trial_period_days`) a la CF. Nou punt de verificació que el substitueix: **confirmar en TEST que l'extensió aplica realment el `trial_period_days`** (la 0.3.4 tenia informes d'inconsistència; per això s'ha acordat migrar a `invertase/firestore-stripe-payments` nova). QA: fer un checkout i comprovar que la subscripció neix amb `status='trialing'` i `trial_end` a +30 dies.

---

## 5. PENDENT DE VERIFICAR PER ANNA A LA CONSOLA

1. ~~Prices `_trial` en test mode~~ **JA NO APLICA** (16/07): el codi ja no exigeix prices `_trial`; el trial s'aplica al checkout. Verificar en canvi que l'extensió (nova versió `invertase/`) aplica `trial_period_days` correctament (vegeu R6).
2. Configuració actual de l'extensió (versió de secrets pin-ada, webhook events actius) abans de replicar-la en live.
3. Si l'extensió 0.3.4 (o la versió nova d'`invertase/`) suporta `automatic_tax` i `consent_collection` al doc de checkout_session (punts 5 i 7 de la checklist).
4. Emails natius de Stripe: recordatori de fi de trial i de pagament fallit (punts 8 de la checklist i risc R3).
5. Stripe Tax: ~~dades fiscals de l'Aleix~~ **JA LES TENIM** (30/07) — NIF i domicili a
   `src/content/legal/privacy.content.ts` §1, i el domicili quadra amb el del compte
   d'Stripe. Queda **configurar** Stripe Tax a la consola (adreça d'origen + registre
   fiscal d'Espanya). **Registre OSS UE: fora del camí crític** mentre no se superin
   els 10.000 €/any de B2C digital a altres països de la UE — vegeu `HANDOFF.md`.
6. Configuració del Customer Portal: quins products/prices permet canviar (risc R2) i política de cancel·lació de trials (risc R4).
7. Estat de les rutes legals públiques `/terms` i `/privacy` en producció (bloquejant per al Portal i per a Stripe live).

---

## Nota fora d'abast estricte

`firebase.json` continua **sense bloc `storage`** (les Storage rules del repo no es despleguen) — ja constava a l'auditoria RGPD (`docs/AUDITORIA_RGPD.md:187`) i convé resoldre-ho al mateix gate de deploy.
