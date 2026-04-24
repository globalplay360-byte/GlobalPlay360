# ✅ QA Checklist — Entrega GlobalPlay360

**Data inici QA:** 2026-04-23 · **Entrega clienta:** 2026-05-05
**Entorn de proves:** `npm run dev` (Firebase Dev/Test project)

---

## 📋 Com utilitzar aquest document

1. Marca cada item amb `[x]` quan el validis.
2. Si trobes un bug, afegeix-lo a la secció **🐛 Bugs trobats** al final amb: severitat, passos per reproduir, rol, plan.
3. **Severitats:**
   - 🔴 **Blocker** — impedeix l'entrega (crash, data loss, pagament trencat, seguretat).
   - 🟠 **Major** — funcionalitat trencada però amb workaround.
   - 🟡 **Minor** — cosmètic, edge case, text incorrecte.
4. Prioritza resoldre tots els 🔴 **abans** dels 🟠 / 🟡.

---

## 🧩 Setup previ

- [x] `npm install` net i sense warnings crítics.
- [x] `npm run dev` arrenca sense errors a consola.
- [x] Verificar que Firestore apunta a projecte de **test** (no live) amb dades de prova.
- [x] Tenir 3 comptes de prova (Gmail + alias): 1 player, 1 coach, 1 club.
- [x] Tenir targeta test Stripe `4242 4242 4242 4242` preparada.

---

## 👤 Bloc 1 — Fluxos per rol

### 1.1 Player (Free)

- [x] Registre nou amb email + password → rebuda email de verificació.
- [x] Verificar email amb `/auth/action` → entra al dashboard.
- [x] Onboarding: completar perfil (displayName, bio, country, esport, posició).
- [x] Pujar avatar a Storage — es veu immediatament al Navbar/Topbar.
- [x] Editar perfil amb camps d'esport específics (e.g. futbol: posició, peu preferit).
- [ ] `/dashboard/opportunities` — veure marketplace d'ofertes obertes.
- [ ] Filtrar per esport, ubicació, tipus de contracte.
- [ ] Veure detall d'una oferta (`/dashboard/opportunities/:id`).
- [ ] **Aplicar a una oferta** (CTA "Postular-se") — crea `application` amb status `pending`.
- [ ] A `/dashboard/applications` → veig les meves candidatures.
- [ ] Intentar aplicar a una segona oferta sent Free → **paywall** apareix (límit Free).

### 1.2 Coach (Free)

- [ ] Registre amb rol "Coach" seleccionat.
- [ ] Onboarding: camps coach (`experienceYears`, `specialization`, `certifications`) — **verificar que ja NO apareix "Secció Coach en desenvolupament"**.
- [ ] Desar → perfil actualitza a Firestore correctament.
- [ ] Veure marketplace i aplicar a oferta per a entrenador.
- [ ] Verificar que xat amb club només s'obre si Premium (paywall).

### 1.3 Club (Free inicial)

- [ ] Registre amb rol "Club".
- [ ] Onboarding: camps club (`foundedYear`, `website`, `venueName`, `venueCapacity`) — **verificar que ja NO apareix "Secció Club en desenvolupament"**.
- [ ] Crear nova oportunitat (`/dashboard/opportunities/new`) — omplir tots els camps.
- [ ] Oferta apareix a `/dashboard/opportunities/mine`.
- [ ] Oferta visible al marketplace públic (rol player veu l'oferta).
- [ ] Rebre candidatura → apareix a `/dashboard/applications` vista club.
- [ ] Canviar status de candidatura (reviewing → accepted / rejected).
- [ ] **Xat amb candidat**: intentar obrir → paywall si Free.

### 1.4 UX Club — verificació visual (ex-fixes UX)

- [ ] A "Les Meves Ofertes", clicar "Veure" en una oferta → el botó "Tornar" a detail porta a `/dashboard/opportunities/mine` (NO al marketplace general).
- [ ] Hover al botó "Tancar" mostra tooltip "Tancar: deixa de ser visible".
- [ ] Hover al botó "Reobrir" mostra tooltip "Reobrir: torna a ser visible".
- [ ] Botó "Eliminar" demana confirmació abans d'eliminar (`window.confirm`).
- [ ] Després d'eliminar, l'oferta desapareix de la llista i del marketplace.
- [ ] Subtitle del `PageHeader` explica què vol dir oberta/tancada amb colors verds/grisos.

---

## 🔐 Bloc 2 — Autenticació (casos límit)

- [ ] Login amb credencials correctes → redirigeix a `/dashboard`.
- [ ] Login amb password incorrecte → missatge d'error clar, NO crash.
- [ ] Login amb email inexistent → missatge d'error adequat.
- [ ] "Forgot password" → email rebut → link `/auth/action` → canvi password → login OK.
- [ ] Intentar accedir a `/dashboard` sense login → redirigeix a `/login`.
- [ ] Intentar accedir a `/admin` com a player → redirigeix (no és admin).
- [ ] Logout → sessió tancada, no pot tornar endarrere sense re-login.
- [ ] Verificar email abans que caduqui el link.
- [ ] Verificar email amb link ja usat → missatge adequat.

---

## 💰 Bloc 3 — Paywalls Free vs Premium vs Trial

### 3.1 Usuari Free

- [ ] Aplicar a +1 oferta (segons límit Free) → paywall amb CTA "Upgrade a Premium".
- [ ] Intentar obrir xat amb club → `PremiumLockCard` visible.
- [x] Visibility limitada del perfil (si aplica) — verificar què veu un club d'un player Free vs Premium.
- [x] **Perfils Públics**: Les rutes `/dashboard/profile/:id` mostren la fitxa sense editar.
- [x] **S6-T5 Free intenta funcionalitats Premium**: ✅ **PASS complet** (backend + UI). Validat amb suite automatitzada `tests/rules-s6-t5.mjs` (10/10 assertions contra emulador Firestore). Implementació:
  - **`hasPremium()` helper a `firestore.rules`** que llegeix la custom claim `stripeRole` (escrita per l'extensió `firestore-stripe-payments` quan `status='active'` o `trialing'`).
  - **Conversations**: `read` metadata només participant (preserva Teaser Paywall UX); `create` / `update` requereixen participant + `hasPremium()`.
  - **Messages subcollection**: `read` i `write` requereixen participant + `hasPremium()` (protecció total del contingut del xat).
  - **Schema split del perfil**: camps PII (`email`, `phone`, `instagram`, `youtubeVideoUrl`, `dateOfBirth`) mòguts a subcol·lecció `users/{uid}/private/profile` amb rule pròpia: `allow read: if owner || hasPremium()`. Free stranger rep DENY, Owner i Premium reben ALLOW.
  - **MigraciÓ lazy**: `migrateLegacyPrivateFields()` detecta camps sensibles a documents `users/{uid}` antics i els mou automàticament a la subcol·lecció en carregar el perfil del propietari (silent, no bloqueja flux).
  - **`AuthContext`**: force-refresh del JWT (`getIdToken(true)`) quan `sub.status` canvia → la claim propaga immediatament després d'un checkout sense requerir logout/login.
  - **Test suite reproducible**: `firebase emulators:exec --only firestore "node tests/rules-s6-t5.mjs"` retorna 10/10 PASS.

### 3.2 Trial 30 dies

- [ ] Iniciar trial des de `/pricing` amb card test.
- [ ] A `/dashboard/billing` veig "Trial actiu — queden 30 dies".
- [ ] Durant trial puc fer totes les accions Premium (xat, aplicacions il·limitades).
- [ ] Banner visible al dashboard indicant trial.

### 3.3 Premium actiu

- [ ] Post-trial o pagament directe → plan `premium` a Firestore.
- [ ] Xat funciona sense paywall, temps real.
- [ ] Aplicacions il·limitades.
- [ ] Accés a `/dashboard/billing` amb Customer Portal funcional.

### 3.4 Cancel·lació

- [ ] Cancel·lar subscripció des de Customer Portal.
- [ ] Banner "La teva subscripció es cancel·larà el DD/MM" apareix.
- [ ] Accés Premium manté fins al final del període de facturació.
- [ ] Després de la data, plan passa a `free` automàticament via webhook.

---

## 💳 Bloc 4 — Stripe lifecycle complet

- [ ] Products i Prices visibles a Stripe Dashboard (mode test).
- [ ] Checkout Session es crea correctament des de `/pricing`.
- [ ] Redirecció a `/dashboard/checkout/success` post-pagament.
- [ ] Webhook rep `checkout.session.completed` → actualitza `users.{uid}.plan`.
- [ ] Customer Portal obre amb el customerId correcte.
- [ ] Canviar mètode de pagament des del Portal.
- [x] **S5-T7 Canvi de pla (monthly ↔ yearly)**: validat canvi via Customer Portal, prorrateig aplicat (ajust immediat) i manteniment d'accés Premium. Price anual reflectit a la subscripció Firestore.
- [ ] Cancel·lació des del Portal → webhook `customer.subscription.updated` actualitza `users.{uid}.cancelAtPeriodEnd`.
- [ ] Reactivar subscripció cancel·lada (abans de la data final) → banner desapareix.
- [ ] Factures descarregables des del Portal.

### Nota QA — S5-T7 (2026-04-23)

- Configuració del Customer Portal actualitzada per permetre `switch plans` entre `25€/mes` i `250€/any`.
- El flux de canvi de pla funciona des del portal de Stripe.
- Test final executat en subscripció mensual activa amb canvi a anual: Stripe mostra ajust immediat (`Importe debido hoy: 0,01 €`) i proper període anual.
- Verificat a Firestore (`customers/{uid}/subscriptions/{subId}`): `status: active`, `price.id` anual i `current_period_end` anual.
- Criteri de font de veritat QA: validar sempre la subcol·lecció `customers/{uid}/subscriptions` (els camps resum de `users` poden anar desalineats temporalment).

---

## 🔒 Bloc 5 — Firestore Rules (Rules Playground)

Provar a **Firebase Console → Firestore → Rules → Playground**:

- [x] **S6-T1 Club NO pot editar `opportunity` d'un altre Club**: UI bloqueja (EmptyState cadenat) + Firestore rules llancen `permission-denied`. Verificat al Playground (`update /opportunities/{id}` amb UID Club A → DENY). ✅ Doble capa confirmada (2026-04-23)
- [x] **S6-T2 Club NO pot eliminar `opportunity` aliena**: Playground `delete /opportunities/{id}` amb UID Club A → DENY. ✅ (2026-04-23)
- [x] **S6-T3 Usuari aliè NO pot llegir `application`**: Regla endurita de `allow read: if true` → `if userId || clubId`. Playground `get /applications/{id}` amb UID aliè → DENY. ✅ Fix desplegat (2026-04-23)
- [x] **S6-T4 Usuari no participant NO pot llegir `messages` d'una conversa aliena**: Playground `get /conversations/cuU7TzI9mi44YMmNy05n/messages/F7vRRoJtlN8AK2xJnRzC` amb UID aliè → DENY. ✅ La regla comprova `participants` del document pare `conversations/{conversationId}` (2026-04-23)
- [x] **S6-T6 Club NO pot crear `applications`**: ✅ PASS backend. Regla endurida: `applications.create` requereix `auth.uid == userId` + `auth.uid != clubId` + `users/{auth.uid}.role != 'club'` + `users/{auth.uid}` ha d'existir. Validat amb 6 tests automatitzats a `tests/rules-s6-t5.mjs`:
  - Club amb `userId=self` → DENY
  - Club aplicant a oferta d'altre club → DENY
  - Club suplantant player (`userId` mismatch auth) → DENY
  - Player `role=player` legítim → ALLOW
  - Coach `role=coach` legítim → ALLOW
  - Auth sense doc `users/{uid}` → DENY (defensa contra auth sense perfil)
- [x] **S6-T7 Modificació de role/plan/email al propi doc**: ✅ PASS backend. Rule a `users/{userId}.update` comprova que els tres camps sensibles no canvien respecte `resource.data`. Validat amb 8 tests automatitzats a `tests/rules-s6-t5.mjs`:
  - role `player` → `club` → DENY (immutable)
  - role → `admin` → DENY (escalada impossible)
  - plan `free` → `premium` → DENY (bypass de billing)
  - email → `attacker@evil.com` → DENY (account takeover)
  - Modificar role d'UN ALTRE usuari → DENY (no propietari)
  - Bio + displayName amb role inalterat → ALLOW
  - Payload amb `role: 'player'` explícit (mateix valor) → ALLOW
  - Payload tracrós: bio legítim + `role: 'club'` amagat → DENY (la rule detecta la diff)
- [ ] Usuari NO autenticat NO pot llegir `users/{uid}` (excepte camps públics si aplica).
- [ ] Usuari Free NO pot crear més de N aplicacions (si la regla ho comprova).
- [ ] Club NO pot crear oportunitats si el seu `role` no és `club`.

---

## 🌐 Bloc 7 — i18n (CA / ES / EN)

- [x] **S7-T1 Idioma — canvi CA / ES / EN**: ✅ PASS. Auditoria automàtica amb `tests/i18n-audit.mjs` confirma 0 claus sense resoldre als 3 locales (613 claus `t()` usades al codi, totes presents a `ca/es/en/common.json`). S'han afegit 64 claus que faltaven (admin sidebar, billing, footer newsletter, myOpportunities, profileEdit fields/hints/placeholders, publicProfile, sports, topbar, etc.) amb traduccions pròpies als 3 idiomes — script d'omplir idempotent a `tests/i18n-fill.mjs`. Reproduïble: `node tests/i18n-audit.mjs`.

## 🌐 Bloc 8 — Pàgines públiques & Legal

- [x] **S8-T5 Footer — trust badges + LanguageSelector + consistència**: ✅ PASS. Auditoria `tests/footer-audit.mjs` (24/24 checks).
  - **Estructura 4 columnes** (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-12`):
    - Col 1 Brand + Contacte (span 5) · email + localització
    - Col 2 Platform → `/`, `/about`, `/dashboard/opportunities`, `/pricing`
    - Col 3 Per a tu → deep-links `/register?role=player|club|coach` + Membre Fundador
    - Col 4 Legal → `/privacy`, `/terms`, `/cookies`, `/contact`
  - **Trust badges visibles** (`hidden md:flex`): Stripe (escut verd) + GDPR (candau verd) a la bottom bar.
  - **LanguageSelector** importat i renderitzat a la bottom bar (amb `aria-haspopup` + `aria-expanded` + focus-visible ring gràcies a fix S7-T4).
  - **Consistència**: `<Footer />` renderitzat a `PublicLayout.tsx` → present a totes les pàgines públiques (Home, About, Pricing, Privacy, Terms, Cookies, Contact, Login, Register, ForgotPassword, AuthAction).
  - **Bug real corregit**: el footer apuntava a `/opportunities` (ruta inexistent pública) en lloc de `/dashboard/opportunities`. Si algú el clicava → catch-all `<Route path="*">` redirigia a `/` (home), trencant la UX. Fixat a `Footer.tsx:53`.
  - **Audit millorat** (`tests/links-audit.mjs`): abans extreia rutes nested com a absolutes (fals negatiu), ara només comptabilitza rutes `path="/..."` i deixa les relatives a la llista `knownAbsolute`. 34 links interns OK, 0 trencats.
  - **Copyright dinàmic**: `new Date().getFullYear()` → no queda enganxat a un any concret.
  - **A11y**: `<footer>` amb semàntica nativa HTML5; icones dins links amb text adjacent (no icon-only).
  - Reproduïble: `node tests/footer-audit.mjs`.

- [x] **S8-T4 Pàgines legals — existeixen + contingut Stripe/GDPR**: ✅ PASS. Doble auditoria:
  - **Rutes verificades** (`tests/links-audit.mjs`): `/privacy`, `/terms`, `/cookies`, `/contact` totes existents a `App.tsx` dins `PublicLayout`. 0 links trencats des del Footer.
  - **Contingut mínim verificat** (`tests/legal-content-audit.mjs`, 19/19 checks PASS):
    - **RGPD a privacy.content.ts**: ✅ base legal, ✅ drets (accés/rectificació/supressió/oposició), ✅ DPO, ✅ retenció, ✅ transferència internacional, ✅ AEPD.
    - **Stripe a terms.content.ts**: ✅ condicions subscripció, ✅ cancel·lació/devolucions, ✅ IVA, ✅ Customer Portal esmentat.
    - **Cookies a cookies.content.ts**: ✅ categories, ✅ gestió/revocació, ✅ **durada** (afegida secció nova ca/es/en — session vs persistent vs third-party).
    - ✅ Sense "Lorem ipsum", ✅ Sense `[PENDENT_*]` clicables.
  - **Fix crític aplicat**: `tests/legal-cleanup.mjs` script one-shot va substituir **54 placeholders `[PENDENT_*]`** dels 3 content files per `<em>[pendent de configuració]</em>` multiidioma. Això incloïa 15 `<a href="mailto:[PENDENT_EMAIL_LEGAL/DPO]">` que eren links mailto actius amb destinatari invàlid (hauria obert el client d'email amb destí trencat si algú els clicava). També els camps `[PENDENT_RESPONSABLE]`, `[PENDENT_NOM_LEGAL]`, `[PENDENT_NIF]`, `[PENDENT_DOMICILI]` com a text pla als apartats d'identificació de l'empresa.
  - **Afegit contingut legal nou**: secció "Durada de les cookies" als 3 idiomes (requerit per RGPD Art. 13 + Guia AEPD cookies).
  - **Pendent de la clienta Aina**: substituir els marcadors `[pendent de configuració]` per dades reals (email legal, email DPO, NIF, nom legal, responsable, domicili) abans del go-live a producció.
  - Reproduïble: `node tests/legal-content-audit.mjs`.

- [x] **S8-T3 Pricing — plans i CTAs**: ✅ PASS. Revisió completa de `PricingPage.tsx` + `stripe.service.ts`:
  - **Plans mostrats**: Free (0€, hardcoded) + Premium (25€/mes o 250€/any, dinàmic des de Firestore). **Pro NO es mostra** — per decisió de producte documentada a CLAUDE.md (d'ús intern, no comercialitzat).
  - **Preus dinàmics verificats**: `listActiveProductsWithPrices()` llegeix `products/{id}/prices/{priceId}` de Firestore (sincronitzat per l'extensió Stripe via webhook). Matcheja `role === 'premium'` i agrupa per `interval === 'month' | 'year'`.
  - **CTA Free** → `<Link to="/register">` ✅
  - **CTA Premium** → `handleSubscribe()`:
    - Si no hi ha sessió → `navigate('/login?redirect=/pricing')` ✅
    - Si hi ha sessió → crida `createCheckoutSession(user.uid, price.id, { successUrl })` amb el **Price ID real de Stripe** (no hardcoded, evita desincronitzacions). Redirigeix a Stripe Checkout.
  - **Price IDs actius verificats** (veure `docs/stripe-setup.md` + S5-T7): `price_1TNtCLGs...` (Premium monthly 25€) i `price_1TNtV2Gs...` (Premium yearly 250€). Ambdós amb `trial_period_days: 30`.
  - **Estats UI**: loading spinner, error banner, cancel banner (`?checkout=cancel`), `isAlreadyPremium` → `<Link to="/dashboard">`, unauthenticated → redirect login.
  - **Bug real corregit**: el `<video>` de fons reutilitzava `globalHome.mp4` (31 MB) sense optimització (mateix problema que S8-T1 abans). Aplicat `preload="metadata"` + `poster` SVG data URI + `aria-hidden="true"`. Ara la Pricing carrega sense descarregar els 31 MB abans del FCP.
  - **Toggle mensual/anual**: preu actualitzat reactiu + badge "Estalvia X€/any" si `monthlyTotalIfAnnual > 0`.

- [x] **S8-T2 About — seccions completes**: ✅ PASS. Verificat:
  - **6 seccions renderitzades**: Hero amb vídeo, Milestones, Architecture, Roadmap, Founding Members, Closing Contact (ordre canònic a `AboutPage.tsx`, funcions `MilestonesSection`/`ArchitectureSection`/`RoadmapSection`/`FoundingMembersSection`/`ClosingContactSection`).
  - **Vídeos amb poster fallback**: ambdós `<video>` (`nosotros.mp4` hero, `Newspaper.mp4` closing contact) tenien `preload="none"` però **cap `poster`** → flash negre mentre carrega. Afegits **posters inline SVG data URI** (`POSTER_DARK` radial Dark SaaS Navy per hero, `POSTER_AMBER` tintat per Newspaper) + `aria-hidden="true"` (vídeos decoratius). Zero fitxers extra, zero fetch addicional.
  - **Assets verificats**: `curl -I` retorna HTTP 200 per ambdós MP4s (1.2 MB + 1.4 MB — mides correctes, cap de 31 MB com el hero de Home).
  - **CTAs verificats**: auditoria `tests/links-audit.mjs` (inclosa AboutPage) retorna 34 links interns OK, 0 trencats.
  - **Animacions**: totes les seccions usen `motion.div` de framer-motion amb variants `staggerContainer` + `fadeInUp`, viewport triggers (`whileInView`).
  - Reproduïble: `node tests/links-audit.mjs`.

- [x] **S8-T1 Homepage — càrrega i CTAs**: ✅ PASS. Auditoria `tests/links-audit.mjs` + verificació manual assets:
  - **25 links interns OK, 0 trencats** a `HomePage.tsx`, `Navbar.tsx`, `Footer.tsx`, `PublicLayout.tsx` (validat contra les 32 rutes de `App.tsx`).
  - **Tots els CTAs a `/register`** correctament enllaçats (HomePage hero, Navbar, Footer, Pricing).
  - **6 links externs** (YouTube, Instagram, Facebook, X/Twitter, LinkedIn, mailto hello@globalplay360.com) — verificació manual requerida (depenen de tercers).
  - **Vídeo hero**: asset Firebase Storage 200 OK, però pesava **31 MB** sense optimització. Afegit `preload="metadata"` + `aria-hidden="true"` al `<video>` de HomePage per complir el criteri <3s (ara el navegador només baixa el header del MP4 inicialment, no els 31 MB complets). Recomanació post-MVP: comprimir el vídeo a ~5-8 MB amb H.264 baixa tasa + afegir `<img>` poster fallback.
  - Reproduïble: `node tests/links-audit.mjs`.

- [x] **S7-T5 Empty states**: ✅ PASS. Auditoria `tests/empty-state-audit.mjs` + revisió manual de cada pàgina amb llistat dinàmic. Verificat:
  - `ApplicationsPage`: empty state **role-aware**. Un **Club** sense candidatures rebudes veu "Encara no has rebut candidatures" + CTA "Gestionar les meves ofertes". Un **Player/Coach** veu "Encara no has aplicat a cap oportunitat" + CTA "Buscar Oportunitats". (Abans el CTA sempre era "Buscar Oportunitats" tant si ets Club com Player — confús per al Club.)
  - `MyOpportunitiesPage`: Club sense ofertes → "Encara no has publicat cap oportunitat" + CTA "Crear Oportunitat" ✅. També té guard `user.role !== 'club'` → "Accés restringit" amb CTA cap al marketplace.
  - `OpportunitiesPage`: marketplace sense filtres o filtratge buit → EmptyState amb missatge adequat ✅.
  - `MessagesPage`: sense converses → EmptyState "No tens missatges encara" + icona + desc ✅.
  - `OverviewPage`: secció "recent items" amb guard `recentItems.length === 0`.
  - **Sense renderitzats `undefined`**: les úniques interpolacions `${...}` trobades són de classes CSS o URLs amb IDs sempre presents (`${conv.id}`, `${opp.id}`), mai text user-facing sense guard.
  - Afegides 5 noves claus i18n (`applications.emptyTitleClub/emptyDescClub/emptyCtaClub/emptyTitlePlayer/emptyDescPlayer`) als 3 locales ca/es/en.

- [x] **S7-T4 Accessibilitat bàsica (a11y)**: ✅ PASS. Auditoria automàtica amb `tests/a11y-audit.mjs` (WCAG 4.1.2 / 2.4.7 / 3.3.2). Problemes detectats i resolts:
  - **Icon-only buttons sense aria-label**:
    - `MessageDetailPage.tsx:100` botó submit del xat (paper plane) → afegit `aria-label="Enviar missatge"` + focus ring.
  - **Inputs sense label**:
    - `Topbar.tsx:37` input de cerca només amb `placeholder` → afegit `aria-label`, `type=search` i focus ring visible.
    - `AboutPage.tsx:544` newsletter email → afegit `aria-label`.
    - `ProfilePage.tsx:99` input file ocult → afegit `aria-label` per si screen reader l'anuncia.
  - **Focus rings absents** (`outline-none` sense `focus-visible:` equivalent):
    - `LanguageSelector.tsx:32` → afegit `focus-visible:ring-2 focus-visible:ring-[#3B82F6]` + `aria-haspopup` + `aria-expanded`.
  - **Falsos positius verificats**: mailto link a ContactPage (té `{CONTACT_EMAIL}` visible), YouTube link a ProfileView (té URL visible), inputs auth amb `<label htmlFor>` a 2-4 línies abans (LoginPage, ForgotPasswordPage, AuthActionPage), `FormControls` wrapper que hereta props.
  - **Cobertures verificades**: tots els auth inputs tenen `<label htmlFor>`, drawer té focus trap + inert (S7-T3), botons icon-only al Topbar/Sidebar tenen `aria-label` prèviament.
  - Reproduïble: `node tests/a11y-audit.mjs`.

- [x] **S7-T3 Mobile drawer (Sidebar) — accessibilitat**: ✅ PASS. Bug d'a11y detectat a la consola (`Blocked aria-hidden on an element because its descendant retained focus`) resolt:
  - Substituït `aria-hidden={!mobileOpen}` per `inert={!mobileOpen ? '' : undefined}` a `<aside>` drawer. `inert` és l'atribut HTML modern que remou focus + interacció de tots els descendents i no té el conflicte que bloqueja Chrome quan un element amb focus queda dins d'un ancestor amb `aria-hidden`.
  - **Focus trap** implementat: Tab/Shift+Tab queden atrapats dins el drawer cicle first↔last element.
  - **Focus inicial** al primer element interactiu del drawer quan s'obre.
  - **Focus restoration**: al tancar el drawer, el focus torna al botó que el va obrir (hamburger Topbar).
  - Manté: tancament per Escape, `body.style.overflow = 'hidden'` mentre obert, overlay clicable que tanca, auto-tancament en canvi de ruta.

- [x] **S7-T2 Responsive mòbil (< 640px)**: ✅ PASS estàtic (auditoria codi). Script `tests/responsive-audit.mjs` detecta patrons comuns d'overflow horitzontal. Resultats:
  - **0 findings HIGH** — cap `min-w-[>300px]` ni `grid-cols-≥4` sense fallback mobile-first.
  - **12 MEDIUM** (tots falsos positius): `w-[500px]`/`w-[400px]` a LegalPageLayout, AboutPage, ContactPage són **decoratius absolute-positioned dins parents amb `overflow-hidden`** (no causen overflow del viewport). Els `text-4xl`/`text-5xl` marcats a HomePage/ProfileView són (a) decoratius de fons amb opacitat 5% i `absolute`, (b) inicials de noms dins avatars de mida fixa `w-28`, o (c) preus de 4 caràcters ("25€") que no desborden.
  - **10 LOW**: padding `p-10`/`py-24`/`p-12` a landing pages (comfort visual, no overflow); `whitespace-nowrap` a badges curtes ("+12%") dins grids responsive.
  - **Cobertures verificades**: totes les grids del dashboard usen prefix mobile-first (`grid-cols-1 md:grid-cols-2`, `grid-cols-2 sm:grid-cols-4`, etc.). Els titulars dashboard escalen amb `text-2xl sm:text-3xl md:text-4xl`. `ProfileView` té `text-2xl sm:text-3xl` al displayName. `OverviewPage` té text mobile explícit `text-[9px] sm:text-[10px] md:text-xs`.
  - **Nota**: validació visual final manual recomanada (DevTools iPhone 12/Pixel 5) a Overview, Profile, Opportunities, Detail i Chat per confirmar el layout final. Reproduïble: `node tests/responsive-audit.mjs`.

## 🌐 Bloc 6 (legacy) — i18n (CA / ES / EN)

- [ ] Canviar idioma al `LanguageSelector` (Footer + Topbar) funciona en temps real.
- [ ] Home, About, Pricing, Login, Register, tot Dashboard tenen traducció completa (sense claus crues com `home.hero.title`).
- [ ] **Legal pages** (`/privacy`, `/terms`, `/cookies`, `/contact`) canvien contingut amb idioma.
- [ ] Date formats locals (dd/mm/yyyy a ES/CA, mm/dd/yyyy a EN) consistents.
- [ ] Idioma persisteix entre recàrregues (localStorage).

---

## 📱 Bloc 7 — Responsive & navegació pública

- [ ] Home renderitza bé a 375px (iPhone SE) i 1440px (desktop).
- [ ] Hamburger menu al Navbar mòbil funciona (obre, tanca, enllaços).
- [ ] Sidebar del Dashboard col·lapsa correctament a mòbil.
- [ ] Footer 4 columnes → 1 columna apilada a mòbil, tots els enllaços accessibles.
- [ ] Pàgines legals amb text llarg: lectura còmoda a mòbil, prose ben formatat.
- [ ] Links del Footer a `/privacy`, `/terms`, `/cookies`, `/contact` funcionen.

---

## 🚨 Bloc 8 — Estats d'error i edge cases

- [ ] Desconnectar internet → missatges d'error adequats (NO app crashes).
- [ ] Crear oportunitat sense camps obligatoris → validacions clares.
- [ ] Pujar avatar > 5MB → error adequat, no upload a Storage.
- [ ] Pujar avatar format no suportat (.pdf) → rebutjat amb missatge.
- [ ] URL inexistent (e.g. `/dashboard/opportunities/xyz-fake`) → redirigeix o mostra `EmptyState`, NO crash.
- [ ] Consola browser **sense errors vermells** durant ús normal.

---

## 🐛 Bugs trobats

> Afegeix aquí els bugs a mesura que els trobis. Formata com:
>
> ### Bug #N — [🔴/🟠/🟡] Títol curt
>
> - **Rol:** player / coach / club / admin / públic
> - **Plan:** free / trial / premium / n/a
> - **URL:** `/ruta/afectada`
> - **Passos per reproduir:**
>   1. Pas 1
>   2. Pas 2
> - **Resultat esperat:** ...
> - **Resultat actual:** ...
> - **Notes:** (screenshot, consola, etc.)

---

## 📊 Resum final

Quan hagis completat el QA, omple aquest resum:

- **Total items validats:** **_ / _**
- **Blockers trobats:** \_\_\_
- **Majors:** \_\_\_
- **Minors:** \_\_\_
- **Aptes per desplegar a producció:** ☐ Sí / ☐ Amb reserves / ☐ No

**Signat:** Anna Borràs · **Data:** **\_\_**
