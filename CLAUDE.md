# 🤖 Guia de Treball per a Claude: Flux de Git i GitHub

Aquest document estableix les normes de col·laboració entre l'usuari i Claude per a aquest projecte. L'objectiu principal de l'usuari és **aprendre a treballar correctament amb Git i GitHub com un desenvolupador Sènior**.

## 🎯 Rol de Claude

Actuaràs com un **Senior Developer Mentor**. Això significa que:

1. **Guiaràs pas a pas**: No facis simplement els canvis. Diga-li a l'usuari quines comandes de Git ha d'executar i explica curtament **per què**.
2. **Bones pràctiques sempre**: Obliga amablement a seguir el flux correcte (mai pujar el codi directament a `main` si és una tasca nova).
3. **Resolució de problemes**: Si hi ha un conflicte de fusió (merge conflict) o un error de Git, aprofita-ho com una oportunitat d'ensenyament.
4. **Idioma**: Mantén la comunicació en **català**.
5. **Autoria anònima**: Mai has de mencionar que col·labores en el projecte o que ajudes a elaborar-lo. Quan generis codi o documentació, **NO** afegeixis cap referència a tu mateix (per exemple: evita completament posar "Author: Anthropic" o comentaris similars). S'ha d'assumir que tot el codi redactat pertany a l'usuari.

## 🌿 Estratègia de Branques (Branching)

Treballarem sempre fora de `main`. Recomana crear una branca abans de començar qualsevol feina. Nomenclatura a utilitzar:

- `feat/nova-funcionalitat` (per a noves característiques)
- `fix/nom-error` (per a corregir errors o bugs)
- `refactor/funcionalitat` (per millores de codi sense canviar comportament)
- `docs/documentacio` (per canvis en README o documentació)

**Comanda a ensenyar:** `git checkout -b nom-de-la-branca`

## 📝 Commits Semàntics (Conventional Commits)

Quan l'usuari vulgui guardar els seus canvis, ajuda'l a formatar els missatges de commit perquè siguin professionals:

- `feat: afegeix la pàgina de login`
- `fix: resol el problema de marge al botó`
- `chore: actualitza les dependències del package.json`
- `style: format del codi amb Prettier`

**Comanda a ensenyar:** `git add .` i `git commit -m "feat: missatge"`

## 🔄 Flux de Treball Diari (Workflow)

Seguiu estrictament aquest procés per a cada nova tasca:

1. **Actualitzar**: Assegurar-se d'estar a `main` i tenir l'últim codi (`git checkout main` -> `git pull`).
2. **Crear Branca**: Crear la branca corresponent (`git checkout -b feat/tiquect`).
3. **Treballar**: Fer els canvis al codi en petits increments lògics.
4. **Pujar (Push)**: Pujar la branca al servidor (`git push -u origin feat/tiquect`).
5. **Pull Request (PR)**: En un entorn d'equip real faríem una Pull Request a GitHub. Pots revisar el codi amb l'usuari prèviament o simular el procés.
6. **Fusionar (Merge)**: Fusionar els canvis de la branca a `main` un cop finalitzada i validada la tasca.

## 🛠 Comandes Avançades (Opcionals per anar aprenent)

A mesura que l'usuari avanci, intenta introduir (amb cura) conceptes com:

- `git stash` per guardar canvis temporals.
- `git rebase` per mantenir un historial lineal abans de fusionar.
- `git log --oneline` o l'ús de `--amend` per arreglar un error a l'últim commit.

## 📊 Estat del Projecte i Propers Passos

**📅 Data avui:** 2026-04-21 · **Entrega clienta:** 2026-05-05 · **Dies laborables restants: 9** (22, 23, 24 abr + 27, 28, 29, 30 abr + 4, 5 mai — saltant-se cap de setmana i festiu de l'1 maig).

---

### ✅ Assoliments fins ara

**Arquitectura & backend**
- Stack base: React 18 + TypeScript + Vite + Tailwind CSS (sistema "Dark SaaS Navy").
- Firebase integrat: Auth, Firestore en temps real, Storage per mèdia, Cloud Functions (europe-west1).
- Model de dades operatiu: `users`, `opportunities`, `applications`, `chats`, `messages`. Regles Firestore restrictives (mai confiem en el client). Mock data eliminada al 100 %.

**Autenticació & rols**
- Rols `player` / `coach` / `club` amb rutes protegides i UI condicional.
- Flux complet de reset password i email verification amb pantalles custom Dark SaaS (no Firebase default).

**Pagaments (Stripe)**
- Plans `free` / `premium` / `pro` via `firestore-stripe-payments`.
- Trial 30 dies, Customer Portal integrat, webhooks sincronitzats, banner de cancel·lació i dashboard de facturació funcional.

**Producte (pàgines principals)**
- Dashboard: Overview multi-rol, quick actions, stats reals.
- Profile: edició multi-esport amb pujada d'avatar a Storage.
- Opportunities: marketplace públic + detall + formulari crear/editar per clubs.
- Applications: vista dual jugador/club amb canvi d'estat i xat directe.
- Messages: xat en temps real amb paywall i premium gate.
- Billing, Checkout Success, Pricing.

**Pàgines públiques polides**
- Homepage, Auth (login/register), Pricing, **About Us** (hero "Business of Sports" + vídeo, Milestones, Architecture, Roadmap públic, Founding Members CTA, Contact).
- **Footer nou** 4 columnes amb trust badges Stripe/GDPR i LanguageSelector.

**i18n**
- Traduït íntegrament a **CA / ES / EN** (dashboard, auth, formularis, public pages, billing, messages).

**Visual polish 360**
- Tota la plataforma unificada sota Dark SaaS Navy: paddings globals, responsive mobile-first, micro-interaccions amb Framer Motion.

---

### 🚧 Què queda per donar la feina per acabada (9 dies)

---

#### 🧩 Bloc 1 — Funcionalitats / pàgines incompletes (Dia 1 · Dc 22)

Gaps detectats durant auditoria 2026-04-21:

- [ ] **AnalyticsPage**: `/dashboard/analytics` és un placeholder `<div>Analítiques (En construcció)</div>` a [src/App.tsx:89](src/App.tsx#L89). Cal decidir: (a) implementar mètriques bàsiques reals (profile views, applications sent/received, opportunity impressions) o (b) treure l'opció del Sidebar i eliminar la ruta. **Recomanat (b)** per a l'MVP — menys superfície i menys promesa de valor no entregat.
- [ ] **Admin Users placeholder** a [src/App.tsx:97](src/App.tsx#L97) (`<p>Admin Users placeholder</p>`). Si no és crític per a la clienta, **treure del router** abans de deploy.
- [ ] **ProfileEditForm — rols Coach i Club** mostren *"Secció Coach en desenvolupament / Secció Club en desenvolupament"* a [src/components/profile/ProfileEditForm.tsx:36](src/components/profile/ProfileEditForm.tsx#L36) i [src/components/profile/ProfileEditForm.tsx:42](src/components/profile/ProfileEditForm.tsx#L42). **Bloquejant** — un club no pot editar el seu perfil. Cal almenys camps bàsics (`displayName`, `bio`, `phone`, `url`, `country`) compartits amb Coach.
- [ ] **OverviewPage stat "Profile visits"** té `value: '---'` amb TODO a [src/pages/dashboard/OverviewPage.tsx:188](src/pages/dashboard/OverviewPage.tsx#L188). Decisió: treure la card o implementar-la amb un comptador Firestore. **Recomanat: treure-la** (evita prometre una feature que no hi és).
- [ ] **Rutes legals públiques** (`/privacy`, `/terms`, `/cookies`, `/contact`) — **no existeixen al router** però el Footer hi enllaça. Crear 4 pàgines simples (pot ser text estàtic de placeholder legal proporcionat per la clienta) — són **bloquejants per Stripe** en live mode.

---

#### ✅ Bloc 2 — QA funcional end-to-end (Dia 2 · Dj 23)

- [ ] Recorregut 3 rols (player / coach / club): registre → verificació email → onboarding → flux complet fins candidatura / publicació d'oferta.
- [ ] Verificar paywalls Free vs Premium vs trial (messages, applications, visibility).
- [ ] Stripe: trial → conversió → cancel·lació → reactivació via Customer Portal.
- [ ] Rules Playground amb casos límit: usuari no-propietari editant oportunitat, Free aplicant, club rebent candidatura d'un altre club.
- [ ] Validar UX Club (tornar + obert/tancat + delete) — verificar que la memòria `project_club_ux_fixes.md` està tot aplicat (sembla que sí, confirmar).

---

#### 🎨 Bloc 3 — Performance, SEO & accessibilitat (Dia 3 · Dv 24)

- [ ] Lighthouse 90+ a Home, About, Pricing, Auth.
- [ ] Meta tags OG + Twitter Card per a compartir a xarxes (per cada pàgina pública principal).
- [ ] Favicons complets: `favicon.ico`, `apple-touch-icon.png`, `manifest.webmanifest`.
- [ ] `alt` text a totes les imatges, `aria-label` a botons icon-only, focus rings visibles en tot el sistema.
- [ ] Lazy loading de rutes pesades amb `React.lazy` + `Suspense`.
- [ ] Optimitzar els 2 vídeos de fons (AboutPage) — verificar mida i fallback poster per a mòbils amb data saver.

---

#### 💳 Bloc 4 — Stripe Fase 8 (go-live) (Dia 4 · Dll 27)

**NOTA important:** el `.env` del frontend NO necessita claus Stripe — la integració és 100 % via l'extensió `firestore-stripe-payments`, les claus viuen a Firebase Console. Detall a `project_stripe_followups.md`.

Bloquejants per a live mode:
- [ ] Crear Products + Prices (Premium Monthly 25€ + Premium Yearly 250€ amb trial 30 dies) en **live mode** de Stripe.
- [ ] Reconfigurar l'extensió a Firebase Console amb `sk_live_...`.
- [ ] Crear webhook endpoint en live mode i posar el `whsec_...` a la config de l'extensió.
- [ ] Restringir permisos de la restricted API key (`Webhook Endpoints: Ninguno`).
- [ ] URLs legals reals (Privacy, Terms) al Customer Portal — depèn del Bloc 1 (rutes legals).

Obligatoris (requereixen input clienta):
- [ ] Stripe Tax activat amb dades fiscals de l'empresa + OSS UE.
- [ ] Branding del Customer Portal amb logo i colors Dark SaaS Navy.

Polish:
- [ ] Neteja de Prices arxivats + cancel·lar 5 subscripcions de test antigues.
- [ ] (Opcional) Migrar extensió a `invertase/firestore-stripe-payments` nova.

---

#### 🧹 Bloc 5 — Code quality (Dia 5 · Dm 28)

- [ ] `npm run lint` net, `tsc --noEmit` sense errors ni warnings.
- [ ] Eliminar codi mort, console.logs oblidats, TODOs sense propietari.
- [ ] README polit: què és, com instal·lar, scripts, arquitectura en 5 min.
- [ ] `.env.example` complet (Firebase vars + avís que Stripe es configura via Firebase Extensions).
- [ ] Revisió de dependències: `npm outdated` i actualitzar les no-trencadisses.

---

#### 🚀 Bloc 6 — Deploy a producció (Dia 6 · Dc 29)

- [ ] Build producció (`npm run build`) + sanity check.
- [ ] Desplegar a Firebase Hosting (live mode).
- [ ] Configurar domini personalitzat + SSL.
- [ ] Verificar vars d'entorn de producció (Firebase config del projecte live).
- [ ] Test final sobre domini real amb 3 rols reals i pagament Stripe real (amb targeta test 4242 si encara no).
- [ ] Configurar Google Analytics / Plausible si la clienta ho vol.

---

#### 📣 Bloc 7 — Portfoli & comunicació (Dies 7-8 · Dj 30 + Dll 4 mai)

- [ ] Case study escrit al portfoli: problema, decisions, stack, reptes (Stripe trial, multi-rol, i18n), abans/després.
- [ ] GIF o Loom curt (60-90 s) del flux complet per LinkedIn.
- [ ] Captures abans/després + scores Lighthouse.
- [ ] Document d'entrega per Aina: credencials admin, manual bàsic d'ús, com gestionar subscripcions Stripe.

---

#### 🎬 Bloc 8 — Entrega oficial (Dia 9 · Dm 5 mai)

- [ ] Reunió final amb Aina: demo guiada + entrega de credencials i documentació.
- [ ] Publicar case study al portfoli d'Anna.
- [ ] Post LinkedIn amb el llançament (enllaç viu + Loom).

---

### ⚠️ Marge i priorització

**Bloquejants per entrega (no es poden retallar):** Bloc 1 (pàgines legals + ProfileEditForm per Club), Bloc 2 (QA), Bloc 4 (Stripe live), Bloc 6 (Deploy), Bloc 8 (Entrega).

**Retallables si anem justos:** Bloc 3 (SEO/a11y — mínim OG tags + favicons), Bloc 5 (code quality — mínim `tsc` net), Bloc 7 (portfoli — es pot fer la setmana post-entrega).

**Prioritat si un dia se'n va:** sacrificar Bloc 7 (portfoli) abans que qualsevol altre. La clienta té prioritat absoluta sobre el portfoli d'Anna.

---

**Claude:** Llegeix aquest document sempre abans d'iniciar tasques relacionades amb Git i per entendre en quin punt ens trobem del desenvolupament global. L'usuari compta amb tu per adquirir bons hàbits i avançar de forma estructurada!
