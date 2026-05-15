# Protocol de Neteja Segura — Firebase + Stripe (Entorn de Test)

Aquest document defineix el procediment recomanat per deixar net l'entorn de proves abans d'entregar el projecte.

Objectiu:

- eliminar usuaris de prova i les seves dades associades
- deixar Stripe Test mode sense subscripcions actives innecessàries
- conservar només els comptes i dades que calguin per a demo o manteniment

Important:

- aquest protocol està pensat només per al projecte de test `globalplay360-3f9a1`
- no executar-lo en live mode
- abans d'esborrar res, decidir quins usuaris es conserven per demo interna o validació final

## 1. Abans de començar

1. Confirma que estàs al projecte correcte de Firebase.
   - `firebase use`
   - ha d'apuntar al projecte de test

2. Confirma que Stripe està en Test mode.
   - revisar el toggle `Test mode` al Stripe Dashboard

3. Fes una llista curta dels comptes a conservar.
   Exemples habituals:
   - 1 compte `player`
   - 1 compte `coach`
   - 1 compte `club`
   - 1 compte admin si cal

4. Si hi ha dubtes, exporta abans una captura o inventari mínim dels usuaris actuals.

## 2. Ordre recomanat de neteja

L'ordre correcte és aquest:

1. Cancel·lar subscripcions de test actives a Stripe
2. Identificar els UID dels usuaris de prova a Firebase Auth
3. Esborrar dades relacionades a Firestore
4. Esborrar l'usuari a Firebase Authentication
5. Revisar que no quedin rastres a `billing_state`, `customers` ni dades funcionals residuals

## 3. Neteja a Stripe (Test mode)

Per a cada usuari de prova que NO vulguis conservar:

1. Ves a Stripe Dashboard en Test mode
2. Obre `Subscriptions`
3. Busca el client per email
4. Si la subscripció està `trialing` o `active`, cancel·la-la
5. Si hi ha diverses subscripcions històriques de test, deixa només el mínim necessari o cancel·la-les totes

Notes:

- no cal obsessionar-se amb esborrar factures o intents de pagament de test si només vols un entorn net funcionalment
- el més important és que no quedin subscripcions actives de prova que distorsionin el sistema

## 4. Neteja a Firestore

Per cada usuari de prova a eliminar, revisa i esborra aquests nodes:

### 4.1 Dades bàsiques d'usuari

- `users/{uid}`
- `users/{uid}/private/profile`
- `billing_state/{uid}`
- `customers/{uid}` amb totes les subcol·leccions:
  - `checkout_sessions`
  - `subscriptions`
  - `payments`

### 4.2 Dades funcionals segons rol

Si és `player` o `coach`:

- `applications` on `userId == uid`
- `conversations` o `chats` on participi
- `messages` associats a aquestes converses si no hi ha neteja automàtica completa

Si és `club`:

- `opportunities` on `clubId == uid` o `ownerId == uid`
- `applications` associades a aquestes oportunitats
- `conversations` generades a partir d'aquestes candidatures o oportunitats

Recomanació:

- si l'usuari de test és un club que ha creat moltes ofertes, revisa abans si vols esborrar també el contingut derivat per no deixar candidatures òrfenes innecessàries

## 5. Neteja a Firebase Authentication

Quan Firestore ja estigui net per aquell usuari:

1. Ves a Firebase Console → Authentication → Users
2. Busca l'email de prova
3. Elimina l'usuari

Alternativa:

- si prefereixes fer-ho per script o Admin SDK, prepara abans una llista de UID exactes i elimina'ls un a un, mai en bloc sense revisió

## 6. Validació després de cada eliminació

Per cada usuari esborrat, comprova:

- no existeix a Firebase Auth
- no existeix `users/{uid}`
- no existeix `billing_state/{uid}`
- no existeix `customers/{uid}`
- no queden subscripcions actives associades al client de test a Stripe

## 7. Estat final recomanat abans de l'entrega

L'entorn de test ideal hauria de quedar amb:

- només els comptes mínims per a demo o manteniment
- sense subscripcions de test actives sobrants
- sense trials residuals que puguin confondre el comportament real
- sense oportunitats, candidatures o xats de prova que embrutin la demo

## 8. Què conservaria jo

Per una entrega neta però pràctica, conservaria només:

- 1 usuari `player`
- 1 usuari `coach`
- 1 usuari `club`
- 1 compte admin si s'utilitza realment

La resta, fora.

## 9. Checklist ràpid

- [ ] Stripe en Test mode confirmat
- [ ] Llista d'usuaris a conservar definida
- [ ] Subscripcions de test actives cancel·lades
- [ ] `users/{uid}` esborrat per a cada usuari de prova
- [ ] `billing_state/{uid}` esborrat
- [ ] `customers/{uid}` esborrat
- [ ] dades funcionals derivades esborrades (`applications`, `opportunities`, `conversations`, `messages`)
- [ ] usuari eliminat de Firebase Auth
- [ ] revisió final manual a Stripe + Firebase completada

## 10. Nota operativa

Si més endavant es vol automatitzar aquesta neteja, el camí correcte és crear una Cloud Function o script d'Admin SDK exclusiu per a entorn de test, amb llista blanca de col·leccions a purgar i confirmació explícita abans d'executar.
