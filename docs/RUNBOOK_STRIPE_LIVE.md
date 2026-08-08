# Runbook · pas a Stripe LIVE

> **Aquest document és un procediment, no un estat.** L'estat viu a `HANDOFF.md`.
> Preus i lookup_keys: `docs/PLA_PRICING_STRIPE.md` §1 · Porta QA: `docs/BIBLIA_QA_STRIPE.md`.

Ordre pensat perquè, si algun pas falla, encara no s'hagi cobrat res a ningú.
**No saltar-se l'ordre**: el pas 8 (desplegar l'extensió) ha d'anar després del 7
(crear les versions dels secrets), o l'extensió llegirà secrets que encara no existeixen.

---

## Precondicions

| | |
|---|---|
| N3 · Billing QA (TEST) | ✅ 18/07 — `BIBLIA_QA_STRIPE.md` §5 |
| Compte d'Stripe sense tasques + payouts actius | ✅ 6/08 |
| Dades fiscals del titular | ✅ `src/content/legal/privacy.content.ts` §1 |
| Secrets desclavats de `versions/1` | ✅ branca `feat/stripe-live-config` — **sense desplegar** |

---

## Fase A · Consola d'Stripe, en mode LIVE (Anna)

**Comprovar a cada pas que el commutador diu LIVE, no TEST.** És l'error més fàcil
de cometre i el més car: crear el catàleg en TEST i creure que ja està fet.

> ⚠️ **Tres entorns, no dos.** El selector de comptes en té tres i dos es diuen quasi igual:
>
> | Entorn | Compte | Què hi ha |
> |---|---|---|
> | GLOBALPLAY360 · actiu | `acct_1T4khvGXsJqj46j9` | producció |
> | GLOBALPLAY360 · **Modo de prueba** | `acct_1T4khvGXsJqj46j9` | **tot el QA**: comptes QA, subscripcions, `txr_` de TEST, i on apunta la clau de l'extensió |
> | **Entorno de prueba** (sandbox) | `acct_1T4kiAGsDnXOvDn3` | buit, no fer-hi res |
> | JLS BABY S.L. | — | un altre negoci |
>
> El **sandbox és un compte diferent**: el que s'hi creï no el veu mai la integració.
> Té tasques de verificació pròpies (n'hi havia una amb data 19 set 2026) que **no
> afecten cap transferència real** — no confondre-les amb les del compte actiu.
>
> La clau `sk_test_51T4kiAGsDnXOvDn3…` apuntada a `stripe.txt` és **la del sandbox**.
> No fer-la servir.

1. **IVA · tipus manual del 21%, NO Stripe Tax** (decisió d'Anna, 7/08).

   Stripe Tax és un producte de pagament i el cost aniria al compte del titular. Amb
   venda B2C només a Espanya i per sota dels **10.000 €/any** de venda digital a altres
   països de la UE, es pot repercutir l'IVA espanyol a tota la UE: un tipus manual del
   21 % inclusiu és correcte i gratuït.

   - Crear un **Tax Rate** del 21 %, **inclusiu**, país Espanya, nom visible `IVA`.
     Cal fer-ho **dues vegades**: un a TEST i un a LIVE (els IDs són diferents).
   - La Cloud Function ha de passar-lo com a `tax_rates` al doc de `checkout_sessions`.
     L'extensió el reenvia a Stripe com a `subscription_data.default_tax_rates`
     (verificat contra el codi de l'extensió, només quan `automatic_tax` és fals).
   - Els Prices porten `tax_behavior: inclusive`: el preu que veu l'usuari ja inclou
     l'IVA i al checkout no se li suma res a sobre.

   > ⚠️ **Vigilar el llindar dels 10.000 €.** En superar-lo cal donar-se d'alta a l'OSS
   > i repercutir el tipus de cada país — i llavors el tipus manual ja no serveix.
   > La responsabilitat del llindar és del titular; deixar-ho per escrit.

   **Estat 7/08:** tipus de TEST creat — `txr_1U1lfDGXsJqj46j9l7L5ByQk`, ja apuntat a la
   constant `STRIPE_TAX_RATE_ID` de `functions/index.js`.

   > Els IDs d'Stripe barregen `1`/`l`/`I` i `0`/`O`. **Copiar-los sempre amb el botó de
   > copiar del dashboard, mai transcrivint-los d'una captura.** El primer intent del
   > 7/08 va fallar amb «No such tax rate» per dues `1` que eren `l`.

   **✅ Verificat el 7/08 en TEST.** Factura `SCKBF1XZ-0005`: base 8,26 € + IVA 1,73 %
   = 9,99 €, amb la línia «IVA (21 % incluido en 8,26 €)». L'extensió 0.3.4 reenvia
   `tax_rates` correctament.

1-ter. **NIF de l'emissor a la factura** — 🔴 detectat el 7/08, obert.

   La factura de prova porta nom, adreça i correu del titular, però **no el NIF**. Una
   factura espanyola ha de portar el NIF de qui l'emet, i aquestes són les que rebran
   els clients reals.

   Afegir-lo a la plantilla de factures:
   https://dashboard.stripe.com/acct_1T4khvGXsJqj46j9/settings/billing/invoice
   → secció d'identificadors fiscals del compte → afegir `ES47939862L` (o `47939862L`
   segons el format que accepti) i marcar que es mostri a les factures.

   Fer-ho **als dos modes**, TEST i LIVE, i tornar a emetre una factura de prova per
   comprovar que hi surt.

   **1-bis · El canvi que no es pot oblidar al pas a LIVE:**

   1. ✅ **Fet el 7/08.** Tipus de LIVE creat: **`txr_1U1mtwGXsJqj46j9L2QELLxt`**
   2. ⏳ Substituir `STRIPE_TAX_RATE_ID` a `functions/index.js` per aquest ID de LIVE.
      **No fer-ho abans del tall**: mentre l'extensió faci servir la clau de TEST, posar-hi
      l'ID de LIVE trencaria el checkout de proves.
   3. ⏳ `firebase deploy --only functions --project globalplay360-3f9a1`.

   | Mode | Tax rate ID |
   |---|---|
   | TEST (actiu al codi ara) | `txr_1U1lfDGXsJqj46j9l7L5ByQk` |
   | LIVE (pendent de posar) | `txr_1U1mtwGXsJqj46j9L2QELLxt` |

   Si s'oblida, el checkout LIVE peta de seguida amb «No such tax rate». Molesta, però
   avisa: el mode silenciós seria cobrar sense IVA i adonar-se'n a la declaració.

2. **Products i Prices** — crear els 2 Products i els **4 Prices** de
   `PLA_PRICING_STRIPE.md` §1, amb els `lookup_key` exactes:

   | lookup_key | Cèntims | Interval |
   |---|---|---|
   | `individual_monthly` | 999 | month |
   | `individual_yearly` | 9999 | year |
   | `club_monthly` | 2499 | month |
   | `club_yearly` | 24999 | year |

   Tots `currency=eur`, `tax_behavior=inclusive`. Metadata obligatòria al Product:
   `firebaseRole: premium` i `segment: individual` | `club` — sense `segment` el
   frontend no sap quin pla ensenyar a cada rol.
   **Cap Price `_trial`**: el trial de 30 dies l'aplica la Cloud Function al checkout.

3. **Arxivar el Product antic** de 25 €/250 € si existeix en LIVE (`active=false`).
   La PricingPage filtra per `active==true`; si es queda actiu, competeix amb els nous.

4. **Customer Portal** (LIVE) — URLs legals reals (`/privacy`, `/terms`), cancel·lació
   **al final del període**, i limitar els canvis de pla perquè no es pugui creuar de
   segment individual a club.

5. **Emails de Billing** — activar «recordatori de fi de prova» i «pagament fallit».
   Estaven bloquejats per les tasques del compte; ara ja es poden activar. Sense el de
   pagament fallit, un usuari en `past_due` no s'assabenta de res.

6. **Restricted API key** (LIVE) — permís **Webhook Endpoints: Ninguno**. Editar la key,
   no recrear-la.

7. **Webhook endpoint** (LIVE) — ✅ **ja existeix** (verificat 7/08). Es diu «Firebase GP360
   TEST» —nom enganyós— i apunta a
   `https://europe-west1-globalplay360-3f9a1.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`.
   Els 401 que s'hi veuen són normals abans del tall: l'extensió encara té el secret de TEST.
   Cal revelar-ne el `whsec_` per al pas 8.

7-bis. **Treure els `invoice.*` de la subscripció d'esdeveniments** (detectat 7/08).

   `invoice.paid` falla sempre: *«Value for argument "documentPath" is not a valid resource
   path»*. Hipòtesi: el webhook va en versió d'API `2026-01-28.clover` i l'extensió 0.3.4
   és d'abans que Stripe mogués `invoice.subscription` dins de `parent`.

   Res de l'app llegeix factures de Firestore (l'usuari se les baixa del Customer Portal),
   així que es treuen tots els `invoice.*`. Es mantenen `product.*`, `price.*`,
   `checkout.session.completed`, `customer.subscription.*`, `payment_intent.*` i
   `tax_rate.*`. El `past_due` no en depèn: arriba per `customer.subscription.updated`.

   Solució de fons, no ara: migrar a l'extensió mantinguda d'`invertase`.

   > ⚠️ **Un sol secret de webhook.** L'extensió només en guarda un. Ara serveix TEST i
   > rebutja LIVE; **després del tall serà a l'inrevés i el QA en mode de prova deixarà de
   > sincronitzar amb Firestore.** És conseqüència d'un sol projecte de Firebase per als
   > dos modes. Poder seguir provant en TEST després del llançament exigiria un segon
   > projecte: decisió d'arquitectura, no un pas d'aquest runbook.

---

## Fase B · Secrets i desplegament

> **Abans de res: `firebase ext:list` i `firebase ext:export`.** El 8/08 es va descobrir
> que el repositori descrivia una extensió que no era la desplegada. Comprovar-ho abans de
> tocar l'extensió, sempre.
>
> Instància real: **`invertase/firestore-stripe-payments@0.3.12`**, instància
> `firestore-stripe-payments`. Els secrets **no porten el prefix `ext-`**.
> Els dos ja apunten a **`versions/latest`** des del 17/07: el P0 #12 estava tancat.

8. **Crear les versions noves** dels secrets (no substitueixen res: s'afegeixen a sobre, i
   com que la config apunta a `latest`, la nova passa a ser la vigent):

   ```bash
   # Clau LIVE de l'extensió (restringida rk_live_… o secreta sk_live_…)
   gcloud secrets versions add firestore-stripe-payments-STRIPE_API_KEY \
     --project=globalplay360-3f9a1 --data-file=-

   # Webhook secret de l'endpoint de LIVE (whsec_…)
   gcloud secrets versions add firestore-stripe-payments-STRIPE_WEBHOOK_SECRET \
     --project=globalplay360-3f9a1 --data-file=-
   ```

   Enganxar el valor i tancar amb Ctrl+D. **No passar la clau per `--data-file` amb un
   fitxer al repo ni deixar-la a l'historial de la terminal.**

   Estat previ dels secrets (8/08): `STRIPE_API_KEY` té 1 versió (16/07);
   `STRIPE_WEBHOOK_SECRET` té la 3 i la 4 actives i la 1 i la 2 destruïdes.

9. **Forçar que les funcions agafin la versió nova.** Amb `versions/latest`, el valor es
   resol quan arrenca una instància: les instàncies calentes seguirien amb la clau vella.
   Redesplegar l'extensió les renova de cop:

   ```bash
   firebase deploy --only extensions --project globalplay360-3f9a1
   ```

   > ⚠️ **Aquesta comanda només és segura si el repositori està sincronitzat.** Fins al
   > 8/08 hauria degradat l'extensió a `stripe@0.3.4` i l'hauria repuntada a un secret
   > inexistent. Comprovar sempre que `firebase.json` diu `invertase/…@0.3.12` i que
   > `extensions/firestore-stripe-payments.env` és idèntic a la sortida d'`ext:export`.

10. **Verificar que ha agafat la clau LIVE:**
    - Stripe LIVE → l'endpoint del webhook rep esdeveniments amb **2xx** i deixa de donar
      401 (`Webhook signature verification failed`).
    - Registres: `gcloud functions logs read ext-firestore-stripe-payments-handleWebhookEvents --region=europe-west1 --project=globalplay360-3f9a1`
    - Firestore: la col·lecció `products` conté els 2 products de LIVE amb els seus prices.
    - La PricingPage mostra 9,99 / 99,99 / 24,99 / 249,99.

---

## Fase C · Abans d'obrir la porta

11. **Firebase Console → Authentication → Sign-in method → Google → Disable.**
    Pendent des del 5/08. El botó ja no és a la UI, però la clau pública va al bundle:
    mentre el proveïdor estigui actiu, es poden crear comptes des de fora de l'app
    saltant-se la casella d'edat i el consentiment.

12. **Flags de llançament** — obrir cobros no serveix de res si ningú es pot registrar.
    Revisar `VITE_PRELAUNCH_MODE` i `VITE_PUBLIC_REGISTRATION_ENABLED` a `src/config/site.ts`
    i decidir-ho **explícitament**, no per omissió.

---

## Fase D · Smoke LIVE (I5) — amb diners de veritat

13. **Un pagament real controlat** amb targeta pròpia, import mensual. Verificar:
    checkout OK, `trialing` a Stripe, Premium actiu a l'app sense refrescar, i que
    el càrrec surt com a `GLOBAL PLAY 360` a l'extracte.
14. **Cancel·lar des del Customer Portal** i comprovar que l'accés es manté fins al final
    del període.
15. **Google Pay al checkout** — activat el 6/08 i mai provat. Prova ràpida des d'Android
    o Chrome amb targeta desada.
16. **Re-executar el pas F** (`past_due`) després del desplegament, tal com demana
    `BIBLIA_QA_STRIPE.md` línia 224. En TEST, no en LIVE.
17. **Comprovar que el payout arriba** al compte de l'Aleix. Fins que no hi hagi una
    transferència completada, el circuit no està provat de punta a punta.

---

## Criteri de tancament

Es pot dir **«llest per cobros reals» (N4)** quan els punts 1-17 estiguin fets i el
punt 17 tingui una transferència real confirmada. Abans d'això, el màxim que es pot
dir és **N3 · Billing QA OK (TEST)**.

Actualitzar `HANDOFF.md` en tancar, i `BIBLIA_QA_STRIPE.md` §5 amb la fitxa d'execució.
