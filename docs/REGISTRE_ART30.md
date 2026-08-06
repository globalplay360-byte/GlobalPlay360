# Registre d'activitats de tractament — GlobalPlay360

**Article 30 del Reglament (UE) 2016/679 (RGPD)**

| | |
|---|---|
| **Versió** | 1.0 |
| **Data** | 30 de juliol de 2026 |
| **Elaborat per** | Anna Borràs Font (desenvolupament) — part tècnica |
| **Aprovat per** | ☐ Aleix Pérez Jané — *pendent de signatura* |

> **Què és aquest document i què no és.**
> És un **document intern del responsable del tractament**. No es publica al web ni
> el veuen els usuaris. La seva funció és poder acreditar davant l'Agència Espanyola
> de Protecció de Dades (AEPD) què es fa amb les dades personals, per què i amb
> quines garanties. **És el primer document que es demana en una inspecció o després
> d'una reclamació**, i la manca de registre és per si sola una infracció
> sancionable (fins a 10.000 €).
>
> S'ha de **mantenir actualitzat**: cada cop que s'afegeixi una funcionalitat que
> tracti dades noves, que entri un proveïdor nou o que canviï un termini de
> conservació, cal revisar-lo.

---

## 1. Responsable del tractament

| Camp | Valor |
|---|---|
| Titular | Aleix Pérez Jané (empresari individual) |
| NIF | 47939862L |
| Domicili | Carrer Joan Maragall, 9 CS · 08754 El Papiol (Barcelona), Espanya |
| Correu de contacte | aleix.perez@hotmail.com |
| Activitat | Plataforma en línia que connecta jugadors, entrenadors i clubs esportius |
| Delegat de protecció de dades | No designat — no concorre cap dels supòsits obligatoris de l'art. 37.1 RGPD |

**Sobre l'exempció de l'article 30.5:** el RGPD eximeix del registre les organitzacions
de menys de 250 treballadors, **excepte** quan el tractament no és ocasional. En aquest
cas el tractament és **continuat i estructural** (registre permanent d'usuaris, perfils
esportius, missatgeria i subscripcions de pagament), de manera que **l'exempció no
aplica** i el registre és obligatori.

---

## 2. Activitats de tractament

### A1 · Registre i gestió de comptes d'usuari

| Camp | Contingut |
|---|---|
| **Finalitat** | Crear i mantenir el compte, autenticar l'usuari, gestionar el rol (jugador, entrenador o club) |
| **Base jurídica** | Execució d'un contracte (art. 6.1.b) |
| **Interessats** | Jugadors, entrenadors i representants de clubs registrats |
| **Categories de dades** | Nom i cognoms, correu electrònic, contrasenya (xifrada, gestionada per Firebase Authentication), rol, data de naixement |
| **Destinataris** | Google Ireland Ltd. (Firebase Authentication, Cloud Firestore) |
| **Conservació** | Mentre el compte estigui actiu. Un cop suprimit, esborrat de la resta de dades en un màxim de 30 dies |
| **Ubicació tècnica** | Firebase Auth · Firestore `users/{uid}` i `users/{uid}/private/{docId}` |

### A2 · Perfil esportiu i mercat d'oportunitats

| Camp | Contingut |
|---|---|
| **Finalitat** | Publicar el perfil esportiu, permetre als clubs publicar ofertes i als usuaris presentar-hi candidatura |
| **Base jurídica** | Execució d'un contracte (art. 6.1.b) |
| **Interessats** | Jugadors, entrenadors, clubs |
| **Categories de dades** | Esport, posició, data de naixement, alçada, pes, vídeos i enllaços publicats voluntàriament, fotografia de perfil. Dades de club: nom, any de fundació, web, instal·lació, aforament |
| **Destinataris** | Google Ireland Ltd. (Firestore, Cloud Storage). **Altres usuaris de la plataforma**, segons la visibilitat que l'usuari tria |
| **Conservació** | Mentre el compte estigui actiu |
| **Ubicació tècnica** | Firestore `opportunities`, `applications` · Cloud Storage (imatges de perfil) |

> ⚠️ **Nota de risc:** les imatges de perfil poden contenir **fotografies facials**. No
> es fa cap tractament biomètric (ni reconeixement facial ni identificació automatitzada),
> per la qual cosa **no constitueixen dades de categoria especial** de l'art. 9. Si algun
> dia s'incorporés qualsevol funció de reconeixement, caldria revisar aquesta qualificació
> i la base jurídica.

### A3 · Missatgeria entre usuaris

| Camp | Contingut |
|---|---|
| **Finalitat** | Permetre el contacte directe entre jugadors, entrenadors i clubs |
| **Base jurídica** | Execució d'un contracte (art. 6.1.b). Interès legítim (art. 6.1.f) per a la conservació temporal amb finalitats de seguretat i resolució d'incidències |
| **Interessats** | Usuaris registrats que inicien o reben converses |
| **Categories de dades** | Contingut dels missatges, identificador de l'emissor i del receptor, marques de temps |
| **Destinataris** | Google Ireland Ltd. (Firestore) |
| **Conservació** | Les converses inactives es poden eliminar automàticament als **90 dies** sense activitat |
| **Ubicació tècnica** | Firestore `conversations/{id}` i `conversations/{id}/messages/{id}` |

### A4 · Subscripcions i cobraments

| Camp | Contingut |
|---|---|
| **Finalitat** | Gestionar la subscripció Premium, cobrar-la, mantenir l'estat de facturació i complir les obligacions fiscals |
| **Base jurídica** | Execució d'un contracte (art. 6.1.b) · Obligació legal (art. 6.1.c) per a la conservació fiscal |
| **Interessats** | Usuaris subscrits |
| **Categories de dades** | Identificador de client a Stripe, estat de la subscripció, historial de pagaments, dades fiscals de la factura. **Les dades de targeta no passen mai pels sistemes del responsable**: les tracta Stripe directament |
| **Destinataris** | Stripe Payments Europe Ltd. · Google Ireland Ltd. |
| **Conservació** | Mentre la subscripció estigui viva. Documentació comptable i fiscal: **6 anys** (art. 30 del Codi de Comerç) |
| **Ubicació tècnica** | Firestore `customers/{uid}`, `checkout_sessions`, `subscriptions`, `billing_state/{uid}`, `products`/`prices`/`tax_rates` |

### A5 · Atenció dels drets i acreditació del compliment

| Camp | Contingut |
|---|---|
| **Finalitat** | Registrar el consentiment prestat, atendre les sol·licituds d'accés, portabilitat i supressió, i poder-ne acreditar l'atenció |
| **Base jurídica** | Obligació legal (art. 6.1.c, arts. 7.1, 15, 17 i 20) |
| **Interessats** | Tots els usuaris |
| **Categories de dades** | Data i versió dels textos acceptats, registre d'exportacions sol·licitades, registre d'esborrats efectuats |
| **Destinataris** | Google Ireland Ltd. (Firestore) |
| **Conservació** | Mentre pugui ser necessari per a la formulació, l'exercici o la defensa de reclamacions (art. 17.3.e RGPD) |
| **Ubicació tècnica** | Firestore `consent_history/{uid}/entries`, `export_logs/{uid}`, `deletion_logs` |

### A6 · Seguretat de la plataforma i registres tècnics

| Camp | Contingut |
|---|---|
| **Finalitat** | Prevenir accessos no autoritzats i abusos, diagnosticar incidències, auditar les accions d'administració |
| **Base jurídica** | Interès legítim (art. 6.1.f) en la seguretat de la plataforma i dels seus usuaris |
| **Interessats** | Usuaris i visitants |
| **Categories de dades** | Adreça IP, tipus de dispositiu i navegador, pàgines visitades, sessions d'autenticació, registres d'accions administratives |
| **Destinataris** | Google Ireland Ltd. (Firebase, Cloud Logging) |
| **Conservació** | Segons la política de retenció de registres de Firebase |
| **Ubicació tècnica** | Firestore `auth_sessions/{uid}`, `admin_audit_logs` · Cloud Logging |

### A7 · Comunicacions comercials ☐ *pendent de confirmar*

| Camp | Contingut |
|---|---|
| **Finalitat** | Enviar informació sobre novetats i promocions de la plataforma |
| **Base jurídica** | Consentiment (art. 6.1.a), revocable en qualsevol moment |
| **Categories de dades** | Nom i adreça de correu electrònic |
| **Conservació** | Fins a la retirada del consentiment |
| **Ubicació tècnica** | Firestore `campaigns` |

> ⚠️ **A confirmar per l'Aleix:** existeix la col·lecció `campaigns` a la base de dades.
> Cal aclarir si s'hi faran enviaments comercials. Si **no** se'n faran, aquesta
> activitat s'ha d'eliminar del registre; si **sí**, cal verificar que el consentiment
> es recull separadament del d'acceptació dels termes.

---

## 3. Encarregats del tractament

| Encarregat | Servei | Ubicació de les dades | Contracte (DPA) |
|---|---|---|---|
| **Google Ireland Ltd.** | Firebase: autenticació, base de dades, emmagatzematge, funcions i allotjament | `europe-west1` (Bèlgica, UE) | Data Processing Addendum de Google Cloud |
| **Stripe Payments Europe Ltd.** | Processament de pagaments i subscripcions | Irlanda (UE), amb tractament als EUA | Data Processing Agreement de Stripe |

**Transferències internacionals.** Tots dos proveïdors poden tractar dades fora de
l'Espai Econòmic Europeu, principalment als Estats Units. La transferència s'empara en
les **clàusules contractuals tipus** aprovades per la Comissió Europea, complementades
pel marc de privacitat de dades UE-EUA en què ambdós proveïdors estan certificats.

> ☐ **Pendent:** deixar constància de l'acceptació dels DPA a les consoles de Google
> Cloud i Stripe, i arxivar-ne la data.

---

## 4. Mesures tècniques i organitzatives de seguretat

| Mesura | Implementació |
|---|---|
| Xifratge en trànsit | HTTPS obligatori a tot el domini |
| Xifratge en repòs | Xifratge gestionat per Firebase |
| Control d'accés | Regles de seguretat de Firestore i de Cloud Storage per document i per rol |
| Autenticació | Firebase Authentication; les contrasenyes no són accessibles al responsable |
| Segregació de secrets | Claus d'API i de webhook a Google Secret Manager, mai al repositori |
| Minimització | El frontend no accedeix a claus de pagament; els cobraments passen per funcions al servidor |
| Auditoria | Registre d'accions administratives (`admin_audit_logs`) |
| Drets automatitzats | Exportació i supressió de dades executables per l'usuari des del seu perfil |
| Revisió | Auditoria de seguretat i de compliment documentada a `docs/AUDITORIA_RGPD.md` |

---

## 5. Punts oberts abans de tancar aquest registre

| # | Punt | Qui ho decideix |
|---|---|---|
| 1 | ~~**Política de menors**: edat mínima de registre~~ | ✅ **Resolt · 4 ago 2026** |
| 2 | Confirmar si s'enviaran comunicacions comercials (activitat A7) | **Aleix** |
| 3 | Acceptar i arxivar els DPA a les consoles de Google Cloud i Stripe | Anna, amb el vistiplau de l'Aleix |
| 4 | ~~Signar i datar aquest registre~~ | ✅ **Signat · 5 ago 2026** |

### Punt 1 · resolt

**L'Aleix fixa l'edat mínima de registre en 16 anys** (correu del 4 d'agost de 2026).
És per sobre dels 14 que fixa l'art. 7 de la LOPDGDD a Espanya i coincideix amb el
llindar màxim que el RGPD deixa als estats membres.

**No hi ha via de consentiment de tutors**: implementar-la voldria dir verificar la
identitat d'un tercer, i no es fa. Per sota de 16 no hi ha registre possible.

Aplicat el 5 d'agost de 2026:

| On | Què |
|---|---|
| `RegisterPage.tsx` | Casella obligatòria de declaració d'edat, separada de la del consentiment legal perquè el log les pugui distingir |
| `functions/index.js` | `recordConsent` desa `ageDeclaredOver16` i `minimumAge` a cada entrada de `consent_history` |
| `firestore.rules` | `meetsMinimumAge()` rebutja una `dateOfBirth` que impliqui menys de 16 anys |
| `privacy.content.ts` §8 | Reescrita als tres idiomes. **Deia que un menor de 16 es podia registrar amb el consentiment dels tutors, i això no era cert**: aquella via no existeix |
| `LEGAL_TEXTS_VERSION` | `2026-07-16` → `2026-08-05` |

> **Límit conegut, dit pel seu nom.** Al registre l'edat és una *declaració*, no una
> verificació: el compte de Firebase Auth es crea des del client i no hi ha cap punt on
> el servidor la pugui bloquejar. L'única porta real seria una *blocking function*
> `beforeUserCreated`, que exigeix pujar a Identity Platform. El que sí que hi ha és
> constància immutable de la declaració, i una porta de servidor de veritat al perfil,
> que és on la declaració es contrasta amb una dada.

---

## Control de versions

| Versió | Data | Canvis |
|---|---|---|
| 1.0 | 30/07/2026 | Redacció inicial de la part tècnica, a partir del codi i de la política de privacitat vigent |
