# 📋 Tasques Pendents (TODO) i Deute Tècnic

Aquest document recopila tasques, funcionalitats futures o sistemes inacabats que s'han deixat per resoldre "més endavant" per evitar bloquejos i seguir amb el full de ruta.

## Funcionalitats Core - Dashboard

- [ ] **Mètrica "Força del perfil" (Profile Strength)**: Actualment a `OverviewPage.tsx` es troba configurada en estètic al `100%`. Ha d'estar ancorada a un sistema de progrés basat en l'arxiu/context de `ProfilePage.tsx` que mesuri quants camps crucials (nom, foto, data de naixement, etc.) l'usuari ha arribat a omplir.
- [ ] **Sincronització robusta del mirror de subscripció a `users/{uid}`**: L'app ja calcula `activePlan` des de `customers/{uid}/subscriptions` (font de veritat) i el context local queda alineat. Com a millora futura, si es vol persistir també `users.plan`, `users.subscriptionStatus` i `trialEndsAt`, cal fer-ho al backend (Cloud Function/Admin sync) o replantejar les `firestore.rules`; no és blocker per a l'MVP.
- [x] **Hardening real del paywall Premium (S6-T5) amb defense in depth** — ✅ RESOLT 2026-04-23
  - **Estat actual QA:** ✅ PASS complet (missatgeria + perfils). Validat amb suite automatitzada `tests/rules-s6-t5.mjs` (10/10 assertions contra emulador).
  - **Resolució part perfils premium:**
    - Schema split aplicat: `users/{uid}` manté camps públics (marketplace), `users/{uid}/private/profile` conté PII (`email`, `phone`, `instagram`, `youtubeVideoUrl`, `dateOfBirth`).
    - Rule: `match /users/{uid}/private/{docId} { allow read: if owner || hasPremium(); allow create, update: if owner; allow delete: if false; }`
    - `profile.service.ts` separa automàticament camps privats/públics a `updateUserProfile()`. `auth.service.ts::getUserDoc()` fa merge transparent per al client (inclou els camps privats només si l'usuari actual és owner o Premium; en cas contrari el `getUserPrivateProfile()` retorna `null` silent).
    - `migrateLegacyPrivateFields()` mou els camps sensibles existents al schema nou la primera vegada que el propietari obre el seu perfil. Cap migració manual requerida.
  - **Resolució part missatgeria:**
    - Afegit helper `hasPremium()` a `firestore.rules` que comprova `request.auth.token.stripeRole in ['premium', 'pro']` (custom claim que escriu l'extensió `firestore-stripe-payments` quan la subscripció és `active` o `trialing`).
    - Aplicat a `conversations`: `create` i `update` requereixen participant + `hasPremium()`. El `read` de metadata es manté només amb check de participant per preservar el Teaser Paywall UX (la llista de converses amb badge "Missatge protegit").
    - Aplicat a `conversations/{id}/messages/{id}`: `read` i `write` requereixen participant + `hasPremium()` (defense in depth total del contingut).
    - A `src/context/AuthContext.tsx`: afegit force-refresh del JWT (`auth.currentUser.getIdToken(true)`) quan `sub.status` canvia, perquè la claim `stripeRole` propagui al token actiu sense requerir logout/login després del checkout.
    - Desplegat a `globalplay360-3f9a1` i validat via Firestore Rules Playground.
  - **Part diferida (perfils premium):**
    - Seguim amb `users/{uid}` llegible per qualsevol usuari autenticat i la UI amagant camps a `ProfileView`. La correcció correcta requereix schema split a subcol·lecció `users/{uid}/private/profile` + nova rule protegida per `hasPremium()` + adaptació de `PublicProfilePage`/`ProfileView` per llegir dual.
    - Assumit com a risc conegut per a l'MVP (qualsevol autenticat pot llegir dades sensibles via SDK directe, tot i que la UI les amaga).
  - **Detall tècnic històric (pre-fix):**
  - **Objectiu funcional:** un usuari `free` no ha de poder obrir ni utilitzar missatgeria premium, ni accedir a camps de perfil marcats com a premium, encara que manipuli el client o faci crides directes a Firestore.
  - **Reproducció validada:**
    - `MessagesPage.tsx` i `MessageDetailPage.tsx` mostren `PremiumLockCard` quan `activePlan === 'free'`.
    - `PublicProfilePage.tsx` i `ProfileView.tsx` amaguen estadístiques/contacte quan `activePlan === 'free'`.
    - Tot i això, les regles Firestore no comproven premium en missatgeria i `users/{uid}` continua sent llegible per qualsevol usuari autenticat.
  - **Causa arrel 1 — Missatgeria sense enforcement backend:**
    - A `firestore.rules`, `match /conversations/{conversationId}` permet `read, update` si `request.auth.uid in resource.data.participants`.
    - A la subcol·lecció `messages`, `allow read, write` només comprova que l'usuari sigui participant de la conversa pare.
    - A `src/services/messages.service.ts`, `getOrCreateConversation()` crea converses sense cap comprovació de pla i `sendMessage()` tampoc valida premium.
    - Conseqüència: si un usuari Free arriba a ser participant d'una conversa, el backend li permet llegir i escriure missatges via SDK o eina externa.
  - **Causa arrel 2 — Perfils premium només ocults al client:**
    - A `firestore.rules`, `match /users/{userId}` té `allow read: if request.auth != null;`.
    - A `ProfileView.tsx`, la variable `showPrivateDetails` decideix què es renderitza, però totes les dades venen del mateix document `users/{uid}`.
    - Conseqüència: qualsevol usuari autenticat pot llegir el document complet a Firestore, encara que la UI amagui part del contingut.
  - **Implicació arquitectònica:**
    - Amb el model actual no es poden protegir “alguns camps” d'un document Firestore i deixar-ne altres de públics. Firestore rules accepten o rebutgen el document sencer.
    - Per tant, la protecció de camps premium del perfil requereix canvi de model de dades, no només tocar React.
  - **Proposta de solució mínima viable per a missatgeria:**
    - Fer que les rules de `conversations` i `messages` comprovin també un entitlement premium al backend.
    - Opció recomanada per MVP: basar-se en `request.auth.token.stripeRole` o un custom claim equivalent gestionat per Stripe/Firebase.
    - Regla orientativa:
      - `allow read, update: if request.auth != null && request.auth.uid in resource.data.participants && request.auth.token.stripeRole in ['premium', 'pro'];`
      - `allow read, write` a `messages` amb la mateixa condició.
    - També cal evitar que un Free creï una conversa nova. `getOrCreateConversation()` no pot ser l'únic filtre. La rule de `create` de `conversations` també ha d'exigir premium.
  - **Proposta de solució per a perfils premium:**
    - Separar el document `users/{uid}` en dues capes:
      - `users/{uid}` amb camps públics sempre llegibles per autenticats o segons convingui.
      - `users/{uid}/private/profile` o document equivalent amb camps premium (`email`, `phone`, estadístiques ampliades, enllaços, etc.).
    - Les rules d'aquest document privat han de permetre lectura si es compleix una d'aquestes condicions:
      - l'usuari és el propietari del perfil, o
      - el lector té entitlement premium.
    - Després, `ProfileView` i `PublicProfilePage` han de deixar de dependre del mateix payload únic i llegir públic/privat per separat.
  - **Decisió de producte que s'ha de mantenir clara:**
    - Si el requisit és “els Free no poden obrir xat ni veure dades premium”, llavors el backend ha de reflectir exactament aquesta norma.
    - Si es decideix que algun subconjunt de contactes o estadístiques sí que ha de ser visible per a Free, això s'ha d'especificar i modelar explícitament, no deixar-ho com a side-effect de la UI.
  - **Pla d'execució suggerit per a Claude:**
    - 1. Crear una branca `fix/premium-defense-depth`.
    - 2. Endurir `firestore.rules` per a `conversations` i `messages` usant claims premium o una font backend equivalent.
    - 3. Verificar si els custom claims `stripeRole` ja són fiables per a `premium` i `pro` en tots els fluxos (trial, cancel·lació, downgrade).
    - 4. Repetir el test QA de missatgeria amb Playground i des del client com a Free.
    - 5. Si el temps és curt per refactoritzar perfils, deixar clar que la part “perfils premium” continua sent deute tècnic i no marcar S6-T5 com a PASS complet.
    - 6. Si hi ha marge, separar dades públiques/privades de perfil i tornar a provar la lectura directa des de Firestore.
  - **Criteris d'acceptació per tancar aquest punt:**
    - Un usuari Free no pot crear ni obrir una conversa premium ni llegir/escriure `messages` via Playground o client manipulat.
    - Un usuari Free no pot llegir dades de perfil marcades com a premium directament des de Firestore.
    - La UI continua mostrant paywall coherent amb el que permet el backend.
    - `trial` i `premium` continuen funcionant sense regressions.
  - **Fitxers implicats com a mínim:**
    - `firestore.rules`
    - `src/services/messages.service.ts`
    - `src/pages/dashboard/MessagesPage.tsx`
    - `src/pages/dashboard/MessageDetailPage.tsx`
    - `src/pages/dashboard/PublicProfilePage.tsx`
    - `src/components/profile/ProfileView.tsx`
  - **Nota de risc:** tocar missatgeria i perfils alhora pot obrir regressions de producte. Si cal prioritzar per entrega, primer blindar backend de missatgeria i deixar la separació públic/privat del perfil com a següent fase o com a blocker explícit documentat.

## Features Fase 2 (eliminades de la UI per entrega MVP)

Aquestes rutes tenien placeholders visibles a l'MVP. S'han retirat per no prometre valor no entregat. Es poden recuperar del git (`git log --diff-filter=D`) i reimplementar quan hi hagi tracció i dades reals.

- [ ] **Pàgina `/dashboard/analytics`**: dashboard de mètriques per rol.
  - _Jugador/Coach_: visites al perfil, obertures per clubs, rati de resposta a candidatures, activitat setmanal.
  - _Club_: impressions d'ofertes, CTR, candidatures per oferta, funnel de conversió, top països dels candidats.
  - **Dependència:** col·lector d'esdeveniments (col·lecció Firestore `events` o integració Plausible/PostHog) + agregacions backend.
- [ ] **Card "Profile Visits" al Overview (club)**: comptador de visites al perfil públic.
  - **Dependència:** instrumentar rutes públiques de perfil (`/u/:id` encara no existeixen) amb `increment()` a Firestore.
- [ ] **Consola admin `/admin/users`**: taula CRUD interna d'usuaris (veure, canviar rol, suspendre, impersonar).
  - **Quan?** Quan operativament la clienta ho necessiti. No demanada a l'MVP.

- [x] **Perfils Públics (Public Profile Page)**: Implementar la ruta `/dashboard/profile/:userId` per veure la fitxa completa d'un Club, Jugador o Entrenador sense dret a edició. Actualment, el botó 'Veure Perfil Complet' a l'OpportunityDetailPage està deshabilitat com a 'Properament'.
