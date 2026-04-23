# 📋 Tasques Pendents (TODO) i Deute Tècnic

Aquest document recopila tasques, funcionalitats futures o sistemes inacabats que s'han deixat per resoldre "més endavant" per evitar bloquejos i seguir amb el full de ruta.

## Funcionalitats Core - Dashboard

- [ ] **Mètrica "Força del perfil" (Profile Strength)**: Actualment a `OverviewPage.tsx` es troba configurada en estètic al `100%`. Ha d'estar ancorada a un sistema de progrés basat en l'arxiu/context de `ProfilePage.tsx` que mesuri quants camps crucials (nom, foto, data de naixement, etc.) l'usuari ha arribat a omplir.
- [ ] **Sincronització robusta del mirror de subscripció a `users/{uid}`**: L'app ja calcula `activePlan` des de `customers/{uid}/subscriptions` (font de veritat) i el context local queda alineat. Com a millora futura, si es vol persistir també `users.plan`, `users.subscriptionStatus` i `trialEndsAt`, cal fer-ho al backend (Cloud Function/Admin sync) o replantejar les `firestore.rules`; no és blocker per a l'MVP.

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
