# Release Gate · Hito "obrir cobros" (reajust de pricing)

**Projecte:** GlobalPlay360 · **Data:** 16 juliol 2026 · **Executor:** release-gate
**Abast:** porta de QA prèvia a l'obertura de cobraments amb el nou pricing (9,99/99,99 individual · 24,99/249,99 club). Stripe en mode TEST; el pas a LIVE el farà Anna manualment.

---

## Veredicte release: 🔴 NO-GO

Hi ha **P0 oberts a les tres portes** (RGPD, Stripe/Firebase i producte). Cap matís: no es poden obrir cobraments fins que la llista de P0 d'aquest document estigui tancada i re-verificada.

---

## Capa 0 · Estàtica — EXECUTADA

| Comprovació | Comanda | Resultat |
|---|---|---|
| Lint | `npm run lint` (eslint .) | 🔴 **FAIL — 26 errors, 5 warnings** |
| Typecheck | `npx tsc --noEmit` | ✅ PASS (0 errors) |
| Build producció | `npm run build` (tsc -b && vite build) | ✅ PASS (warning: chunks >500 kB) |
| Tests frontend | — | ⚪ No hi ha script `test` al package.json arrel |
| Tests functions | `npm test` a `functions/` (node --test) | ✅ **PASS 16/16** (billingPolicy + retention) |

### Detall del FAIL de lint (26 errors)

Cap error és de la lògica de billing, però la porta de capa 0 no està neta:

- **12 errors** a `src/components/opportunities/OpportunityForm.tsx` — 11× `no-explicit-any` + 1× `react-refresh/only-export-components`.
- **6 errors** `react-hooks/set-state-in-effect` (setState síncron dins d'effect) a: `AuthContext.tsx:197`, `useUnreadCount.ts:14`, `AdminDashboard.tsx:23`, `BillingPage.tsx:31`, `MessagesPage.tsx:101`.
- **4 errors** `no-unused-vars` a `ApplicationsPage.tsx:56` i `EditOpportunityPage.tsx:107` (`_id`, `_ca`, `_cid`).
- **4 errors** a `OverviewPage.tsx` — 2× `no-explicit-any`, 1× unused var, 1× empty block.
- 5 warnings `exhaustive-deps` (dependències `t`, `user`, `currentUserRole` que falten).

**Nota:** el build passa perquè `tsc` no veu aquests errors (són regles d'ESLint). Classificat com a **bloquejant de porta** (la capa 0 ha d'estar neta abans de deploy), però no és P0 funcional del hito cobros.

### Nota de build (no bloquejant)

`index-*.js` pesa 958 kB (265 kB gzip) i `state-*.js` 591 kB. Vite recomana code-splitting addicional. P2 de rendiment, apuntar per a després del hito.

---

## Verificació independent dels P0 aliens (fets, no fe)

He re-verificat al codi cada P0 reportat pels altres dos agents. **Tots confirmats:**

| P0 reportat | Evidència verificada |
|---|---|
| Art. 17 inexistent + afirmació falsa | Cap `deleteAccount`/`deleteUser` a `src/`. `src/pages/public/AboutPage.tsx:341` diu "Right to erasure implemented via Cloud Functions" — **fals** |
| Art. 20 inexistent | Cap `exportData`/`dataExport` a `src/` |
| storage.rules absents | No existeix `storage.rules` al repo; `firebase.json` sense bloc `storage` |
| Placeholders legals | "pendiente de configuración" present a `src/content/legal/privacy.content.ts` i `terms.content.ts` |
| Art. 7 sense consentiment | `src/pages/auth/RegisterPage.tsx` — cap checkbox ni referència a terms/privacy/consent |
| Terms amb pricing desfasat | `terms.content.ts:50` (CA) i `:148` (ES): "25 € al mes o 250 € a l'any" |
| CF checkout sense validació rol↔segment | `functions/index.js:128-199` — accepta qualsevol `priceId`/`productId` de qualsevol usuari autenticat, cap lectura de `users.role` |
| Guard antidoble subscripció absent | Mateixa CF: no consulta `customers/{uid}/subscriptions` actives abans de crear la sessió |
| `toFixed(0)` a preus | `src/pages/public/PricingPage.tsx:86, 210, 224` — 9,99 € es mostraria com "10€" |
| Secrets pin-ats a versions/1 | `extensions/firestore-stripe-payments.env:6-8` — rotar la clau en el pas a LIVE no tindria efecte sense editar el fitxer |
| past_due invisible | `src/services/stripe.service.ts:347` — `where('status','in',['trialing','active'])` |

---

## Capa 1 · Motor (Admin SDK) — PLA (no executada: sense credencials en aquesta sessió)

Patró per a cada cas: **crear → disparar → assert → borrar** (mai contra dades reals; projecte TEST o emuladors). Parametritzar projecte via env var.

| # | Cas | Muntatge | Assert | Neteja |
|---|---|---|---|---|
| M1 | Client NO pot auto-marcar-se premium | Client SDK autenticat com a user de prova | Escriptures rebutjades (`permission-denied`) a: `customers/{uid}/subscriptions/*`, `customers/{uid}/billing_state`, `users/{uid}.plan`, i qualsevol camp `stripeRole` | Esborrar user de prova |
| M2 | Single-session (`auth_sessions`) | Login dispositiu A → login dispositiu B amb el mateix compte | El token/claim del dispositiu A queda invalidat (`validAfterSeconds` actualitzat); una crida autenticada des d'A falla o força re-login | Esborrar doc `auth_sessions` + user |
| M3 | Checkout rol club rebutja price individual | User rol `club` + crida a `createBillingCheckoutSession` amb `priceId` del segment individual | **Quan existeixi la validació**: `HttpsError failed-precondition`. Avui: PASSARIA (aquest és el P0) — el test ha de quedar escrit i en vermell fins al fix | Esborrar `checkout_sessions` creats |
| M4 | One-trial-only (`billingPolicy`) | `billing_state` amb `trialConsumedAt` posat → crida checkout | `getCheckoutSessionTrialDays` retorna `null` → la `checkout_session` NO porta `trial_period_days`; sense `trialConsumedAt` sí que el porta (30). Verificar també els **4 lookup_keys** a Stripe TEST (individual/club × mensual/anual, sense prices `_trial`) | Reset `billing_state` |
| M5 | Guard antidoble subscripció | User amb subscripció `active` a `customers/{uid}/subscriptions` → 2a crida checkout | **Quan existeixi el guard**: error. Avui: crearia 2a sessió (P0) | Cancel·lar subs de test |
| M6 | Art. 17 esborrat de compte | **Quan existeixi la CF**: crear user complet (auth + `users` + avatar Storage + `applications` + `chats`) → invocar esborrat | Auth user eliminat, docs Firestore eliminats/anonimitzats, avatar Storage eliminat, subscripció Stripe cancel·lada | La pròpia CF és la neteja; verificar residus |
| M7 | storage.rules | **Quan existeixin**: user A intenta llegir/escriure avatar de user B | `permission-denied`; només el propietari escriu el seu path | Esborrar fitxers de prova |

Els tests M3, M5, M6 i M7 s'han d'escriure **abans** dels fixos (TDD): serveixen de criteri d'acceptació dels P0.

---

## Capa 2 · UI — PLA (smoke documentat, Stripe TEST amb targeta 4242)

Base: `BASE_URL` parametritzada (local / preview / prod). Mai contra Stripe LIVE.

1. **Checkout complet × 6 combinacions** — player, coach, club × mensual i anual:
   - preu mostrat amb 2 decimals ("9,99 €", no "10€") — avui FALLA per `toFixed(0)`;
   - trial 30 dies aplicat només al primer checkout (repetir amb el mateix user → sense trial);
   - user rol club NO veu / NO pot comprar el price individual i viceversa;
   - redirect a checkout success i estat premium reflectit al Dashboard sense refresh manual.
2. **Estats premium per rol** — amb subscripció activa: messages desbloquejats, paywalls fora, badge de pla correcte a Billing per a cada rol.
3. **Paywall amb enllaços legals** (quan s'afegeixin) — PricingPage i BillingPage mostren enllaços a Terms/Privacy **abans** del CTA de pagar; les 4 rutes legals (`/privacy`, `/terms`, `/cookies`, `/contact`) responen 200 i sense placeholders.
4. **Cancel·lació via Customer Portal** — obrir portal des de Billing, cancel·lar, tornar: banner de cancel·lació visible, accés premium mantingut fins a fi de període, reactivació funciona.
5. **`past_due`** (quan es corregeixi el filtre) — simular impagament amb targeta test `4000000000000341`: la UI ha d'avisar, no mostrar "tot correcte".
6. **Single-session UI** — login en 2a pestanya/dispositiu: la 1a sessió mostra el missatge de sessió tancada, no un error críptic.

---

## P0 consolidats (llista única per al HANDOFF)

**RGPD (rgpd-officer):**
1. Art. 17 — esborrat de compte inexistent + afirmació falsa a `AboutPage.tsx:341` i locales (3 idiomes).
2. Art. 20 — exportació de dades inexistent.
3. `storage.rules` absents + `firebase.json` sense bloc storage (avatars = imatges facials).
4. Textos legals amb placeholders (titular, NIF, email RGPD) — **requereix input de l'Aleix (Aleix Pérez Jané, titular)**.
5. Art. 7 — cap registre de consentiment al registre (ni checkbox ni log).
6. Paywall (Pricing/Billing) sense enllaços legals abans del CTA.
7. Terms §4 amb pricing desfasat (25 €/250 € vs 9,99/99,99 i 24,99/249,99).

**Stripe/Firebase (firebase-stripe-auditor):**
8. CF checkout sense validació rol↔segment (`functions/index.js:128-199`) — un club podria pagar preu individual.
9. Guard antidoble subscripció absent a la mateixa CF.
10. 8 lookup_keys exactes pendents de crear/verificar a Stripe (fallback perillós a `billingPolicy.js:82`).
11. `toFixed(0)` a `PricingPage.tsx:86/210/224` — mostraria "10€" en lloc de "9,99 €".
12. Secrets de l'extensió pin-ats a `versions/1` (`extensions/firestore-stripe-payments.env:6-8`).
13. Rutes legals públiques operatives i enllaçades al Customer Portal (solapa amb #4/#6).

**Producte (release-gate):**
14. `npm run lint` FAIL (26 errors) — la capa 0 ha d'estar neta abans de qualsevol deploy.

**P1 (no bloquegen el hito, sí abans de LIVE):**
- `past_due` invisible (`stripe.service.ts:347`).
- Bundle principal 958 kB — code-splitting addicional.

---

## Checklist manual residual (post-fixos, pre-LIVE)

- [ ] Re-executar aquesta porta sencera (capa 0 + M1-M7 + smoke UI).
- [ ] Verificar els 8 lookup_keys a Stripe TEST i el mapping al codi.
- [ ] Confirmar amb l'Aleix els textos legals definitius (titular, NIF, email).
- [ ] El pas TEST→LIVE el fa **Anna manualment** (claus, webhook, productes live). Mai un agent.

## Relació RGPD

**P0 oberts** — el veredicte NO-GO d'aquest gate incorpora íntegrament el NO-GO del rgpd-officer (7 P0).

## Següent acció recomanada

Ordenar els fixos per dependències: primer **#8 + #9 + #11** (codi propi, ràpid, desbloqueja QA de checkout), en paral·lel demanar a l'Aleix l'input de **#4** (camí crític extern), després **#1/#2/#3/#5/#6/#7** (RGPD), **#10/#12** a Stripe/Firebase Console, i **#14** com a escombrada final abans de re-executar la porta.

---
*Registre: 16/07/2026 · capa 0 executada en local (Windows) · capes 1-2 planificades, pendents de credencials i de fixos previs.*
