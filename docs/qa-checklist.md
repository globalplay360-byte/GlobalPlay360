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
- [ ] Usuari NO autenticat NO pot llegir `users/{uid}` (excepte camps públics si aplica).
- [ ] Usuari Free NO pot crear més de N aplicacions (si la regla ho comprova).
- [ ] Player NO pot canviar el seu propi `role` o `plan` (només admin/cloud function).
- [ ] Club NO pot crear oportunitats si el seu `role` no és `club`.
- [ ] Missatges (`messages`) només llegibles pels participants del xat.

---

## 🌐 Bloc 6 — i18n (CA / ES / EN)

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
