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

1. **Stripe Tax** — *Configuración → Impuesto*. Adreça d'origen (ja hi consta) i afegir
   el registre fiscal d'**Espanya**. Els Prices porten `tax_behavior: inclusive`: el preu
   que veu l'usuari ja inclou l'IVA i no se li suma res al checkout.
   **OSS UE: no cal ara.** Només és obligatori per sobre de 10.000 €/any de venda B2C
   digital a altres països de la UE. Revisar-ho en acostar-se al llindar.

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

7. **Webhook endpoint** (LIVE) apuntant a l'extensió. Guardar el `whsec_...`.
   Esdeveniments: els mateixos que en TEST.

---

## Fase B · Secrets i desplegament

8. **Crear les versions noves** dels secrets (no substitueixen res: s'afegeixen):

   ```bash
   # Clau secreta LIVE (sk_live_...)
   gcloud secrets versions add ext-firestore-stripe-payments-STRIPE_API_KEY \
     --project=globalplay360-3f9a1 --data-file=-

   # Webhook secret LIVE (whsec_... del pas 7)
   gcloud secrets versions add ext-firestore-stripe-payments-STRIPE_WEBHOOK_SECRET \
     --project=globalplay360-3f9a1 --data-file=-
   ```

   Enganxar el valor i tancar amb Ctrl+D. **No passar la clau per `--data-file` amb un
   fitxer al repo ni deixar-la a l'historial de la terminal.**

9. **Desplegar l'extensió** perquè llegeixi `versions/latest`:

   ```bash
   firebase deploy --only extensions --project globalplay360-3f9a1
   ```

10. **Verificar que ha agafat la clau LIVE.** Aquest és el pas que la configuració vella
    feia impossible: amb `versions/1` el desplegament passava igual i seguia en TEST.
    - Stripe LIVE → *Desarrolladores → Webhooks*: l'endpoint rep esdeveniments amb **2xx**.
    - Firestore: la col·lecció `products` conté els 2 products LIVE amb els seus prices.
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
