# Integració Stripe — Estat i roadmap

**Última actualització:** 2026-04-17
**Branca de treball:** `feat/stripe-payments-setup`
**Extensió oficial:** `stripe/firestore-stripe-payments@0.3.4`

---

## 1. Decisions de producte (validades amb clienta)

| Element                 | Decisió                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| Plans                   | Només **Premium** (no Pro en aquesta fase)                                      |
| Preus                   | **25 €/mes** i **250 €/any** (2 preus sota el mateix Product)                   |
| Trial                   | **30 dies** gratis en activar Premium                                           |
| Cancel·lació            | Accés mantingut **fins al final del període pagat** (no immediata)              |
| Què desbloqueja Premium | Xat directe, aplicacions il·limitades, accés complet                            |
| IVA / facturació        | Stripe Tax **desactivat** de moment; dades fiscals pendents                     |
| Entorn                  | **Test mode** fins a Fase 8 (un sol projecte Firebase + un sol projecte Stripe) |

## 2. Decisions d'arquitectura

- **Font de veritat del plan**: es deriva en temps real de `customers/{uid}/subscriptions` (Opció A). **Sense Custom Claims** de moment.
- **Model d'usuari**: `free` vs `premium` únicament.
- **Creació de Stripe Customer**: **lazy** — es crea al primer checkout (`SYNC_USERS_ON_CREATE = "Do not sync"`), no al registre. Estalvi de crides API per usuaris free.
- **Execució**: branca `feat/stripe-payments` dividida en **3 PRs incrementals**.

## 3. Roadmap — 8 fases

| Fase  | Descripció                                                                                          | Estat          |
| ----- | --------------------------------------------------------------------------------------------------- | -------------- |
| **1** | Stripe Dashboard: Product + 2 Prices + lookup_keys + Customer Portal + Restricted API key           | ✅             |
| **2** | Firebase Extension: install + webhook + Secret Manager + validació sync                             | ✅             |
| **3** | Firestore Security Rules per a `customers`, `products`, `checkout_sessions`, `subscriptions`        | 🚧 **Següent** |
| **4** | `PricingPage.tsx`: UI de plans + `createCheckoutSession` + trial 30 dies                            | ⏳             |
| **5** | Refactor `AuthContext`: derivar `activePlan` de `customers/{uid}/subscriptions` en temps real       | ⏳             |
| **6** | `PremiumGate` component: gating del xat i altres funcionalitats Premium                             | ⏳             |
| **7** | `BillingPage.tsx`: mostrar subscripció activa + link al Customer Portal                             | ⏳             |
| **8** | Go-live: retest complet + activació Stripe Tax + URLs legals + branding Portal + passar a live mode | ⏳             |

### Agrupació en PRs

- **PR 1** — `feat/stripe-payments-setup`: Fases 1-3 (infraestructura + regles). 🚧 En curs, Fase 3 pendent.
- **PR 2** — `feat/stripe-payments-checkout`: Fases 4-5 (UI checkout + AuthContext).
- **PR 3** — `feat/stripe-payments-portal`: Fases 6-7 (gating + BillingPage).
- Fase 8 es tracta com a **tasca pre-release**, no com a PR únic.

## 4. Artefactes actuals (test mode)

### Stripe Dashboard

- **Product**: `GlobalPlay360 Premium` (metadata `firebaseRole: premium`)
- **Preu mensual**: lookup_key `premium_monthly`, 25€/mes, statement descriptor `GLOBALPLAY360 PREM`
- **Preu anual**: lookup_key `premium_yearly`, 250€/any
- **Customer Portal config ID**: `bpc_1TNFgfGsDnXOvDn36sxtrHYG`
- **Restricted API key**: `rk_test_...` (nom: `Firebase Extension - Stripe Payments`)
- **Webhook endpoint**: `https://europe-west1-globalplay360-3f9a1.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents` (22 events subscrits)

### Firebase / Google Cloud

- **Projecte**: `globalplay360-3f9a1` (region functions: `europe-west1`)
- **Pla**: Blaze (activat per suportar Cloud Functions)
- **Extension instance**: `firestore-stripe-payments`
- **Cloud Functions desplegades (6)**:
  - `createCheckoutSession`
  - `createCustomer`
  - `createPortalLink`
  - `handleWebhookEvents` ← rep events del webhook de Stripe
  - `onUserDeleted`, `onCustomerDataDeleted` — neteja GDPR
- **Secrets a Cloud Secret Manager**:
  - `ext-firestore-stripe-payments-STRIPE_API_KEY` (v1)
  - `ext-firestore-stripe-payments-STRIPE_WEBHOOK_SECRET` (v1)

### Firestore — col·leccions creades pel webhook

- `products/{productId}` — sync automàtic des de Stripe
- `products/{productId}/prices/{priceId}` — sync automàtic des de Stripe
- `customers/{uid}` — es crea al primer checkout de l'usuari (lazy)
- `customers/{uid}/checkout_sessions/{id}` — el client crea la doc i l'extensió hi escriu la URL de checkout
- `customers/{uid}/subscriptions/{id}` — sync des del webhook
- `customers/{uid}/payments/{id}` — sync des del webhook

### Fitxers al repo (commit `8316734`)

- `firebase.json` — declaració de l'extensió
- `.firebaserc` — alias del projecte
- `extensions/firestore-stripe-payments.env` — configuració (refs a Secret Manager, sense secrets en cru)

## 5. Validació (2026-04-17)

- ✅ Webhook respon **200 OK** als events de Stripe
- ✅ Sync `product.updated` → Firestore `products/{id}` correcte (inclou `metadata.firebaseRole: premium`)
- ✅ Sync `price.updated` → Firestore `products/{id}/prices/{priceId}` correcte (inclou `unit_amount`, `currency`, `interval`)

## 6. Tech debt obert — a resoldre abans de Fase 8 (go-live)

| Item                                                 | Detall                                                                                                                | Prioritat                   |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Permís **Webhook Endpoints** a la Restricted API key | Actualment `Escritura` per defecte de Stripe; hauria de ser `Ninguno`. No recrear la key, editar al Stripe Dashboard. | Alta                        |
| URLs legals al Customer Portal                       | `https://globalplay360.com/terms` i `/privacy` són placeholders — substituir quan el web legal sigui públic.          | Alta (blocker de live mode) |
| Activació Stripe Tax                                 | Desactivat. A Fase 8: país de registre + configurar OSS UE + retest checkout per validar preu amb IVA.                | Alta                        |
| Branding Customer Portal                             | Per defecte. Afegir logo GlobalPlay360 + colors Dark SaaS Navy quan la clienta faciliti el logo.                      | Mitjana                     |

## 7. Per reprendre — següents passos immediats

1. **Fase 3**: exportar les regles actuals de Firestore (Firebase Console → Firestore → Rules), portar-les a `firestore.rules` local, afegir regles per a Stripe (`customers`, `products`, `checkout_sessions`, `subscriptions`), registrar el fitxer a `firebase.json`, i desplegar amb `firebase deploy --only firestore:rules`.
2. **Principis de les regles a implementar**:
   - `products/**`: lectura pública, cap escriptura de client.
   - `customers/{uid}/**`: només el propi `uid` llegeix els seus docs; cap escriptura excepte `checkout_sessions` (creació autoritzada al propi uid).
   - Cap regla ha de permetre mai al client escriure camps que determinin el plan (principi: plan deriva de subscriptions via webhook, no l'escriu mai el client).
3. Quan Fase 3 estigui validada, **obrir PR 1** (`feat/stripe-payments-setup` → `main`).

## 8. Validació webhook — 2026-04-23 (QA Bloc 2)

**Status:** ✅ PASSAT — Webhooks sincronitzen correctament sense errors.

### Resultat

| Event                               | Estat                   | Log                                              |
| ----------------------------------- | ----------------------- | ------------------------------------------------ |
| `customer.subscription.created`     | ✅ Successfully handled | `2026-04-23T12:48:29.870742Z`                    |
| `customer.subscription.updated`     | ✅ Successfully handled | Multiple entries                                 |
| `customer.subscription.deleted`     | ✅ Successfully handled | `2026-04-23T16:11:39.447157Z`                    |
| `checkout.session.completed`        | ✅ Successfully handled | Sync d'entitats                                  |
| `invoice.payment_succeeded`         | ❌ REMOVED              | Eliminat per evitar duplicats amb `invoice.paid` |
| Custom claims `stripeRole: premium` | ✅ Sincronitzats        | Verified per multiple subscriptions              |

### Accions realitzades

1. **Webhook Stripe Dashboard**: Eliminat event `invoice.payment_succeeded` del webhook endpoint. Deixat únicament `invoice.paid` com a event d'èxit d'invoice (evita processament duplicat).
2. **Extensió Firebase**: Verificat que versió 0.3.4 és la latest disponible. No necessita update.
3. **Logs Firebase**: Verificats logs de 2026-04-23 mostren processament correcte dels eventos principals.
4. **Firestore sync**: Verificat que `customers/{uid}/subscriptions/{id}` es crea i actualitza correctament, inclús trial (`status: trialing`, `trial_end` correcte).
5. **Auth custom claims**: Verificat que `stripeRole: premium` es síncrona correctament quan subscripció activa, i es restableix a `null` en cancel·lació.

### Notes

- El processament d'events `invoice.paid` / `invoice.payment_succeeded` amb error `documentPath is not a valid resource path` era per timing race conditions i configuració webhook redundant. Resolts eliminant `invoice.payment_succeeded`.
- Els invoices no es sincronitzen a Firestore subcol·lecció `customers/{uid}/subscriptions/{id}/invoices/{invoiceId}` — és opcional per MVP i no bloquejant. Funcionalitat base de subscripció funciona perfectament.
- QA Test **S5-T4 Webhook sincronització correcta** marcat com a ✅ PASSAT / OK.

### S5-T7 — Canvi de pla (upgrade/downgrade) (estat a 2026-04-23)

- **Estat actual:** ✅ PASS.
- **Validat:** canvi de pla via Customer Portal (monthly ↔ yearly), prorrateig amb ajust immediat observat (`Importe debido hoy: 0,01 €`), actualització de tarifa i manteniment d'accés Premium.
- **Validació Firestore:** a `customers/{uid}/subscriptions/{subId}` consta `status: active`, `price.id` anual (`price_1TNtV2GsDnXOvDn3B0vNZbKX`) i `current_period_end` anual.
- **Nota important QA:** la font de veritat del pla és `customers/{uid}/subscriptions`; els camps de resum a `users` poden quedar temporalment desalineats.

### Ajust d'AuthContext — coherència local del mirror d'usuari (2026-04-23)

- S'ha ajustat `src/context/AuthContext.tsx` amb un canvi petit i local per reflectir el `user` del context a partir de la subscripció real de Stripe.
- S'ha eliminat l'intent de `updateDoc` client-side sobre `users`, perquè les `firestore.rules` actuals no permeten modificar `plan` i aquest mirall no era fiable.
- El càlcul de `activePlan` prioritza ara l'estat de `customers/{uid}/subscriptions` i evita quedar enganxat a camps stale de `users` després de canvis monthly/yearly, trial/active o expiració.
- El trial es reflecteix des de la subscripció quan existeix; només es fa fallback al perfil si encara no hi ha document de subscripció.
- **Abast del canvi:** no toca checkout, billing page ni Customer Portal; només millora la coherència interna del context.

---

## 9. Comandes útils per reprendre

```bash
# Verificar compte Firebase CLI actiu (ha de ser aborrasdesign@gmail.com)
firebase login:list

# Verificar compte gcloud actiu (ha de ser aborrasdesign@gmail.com)
gcloud auth list
gcloud config get-value project  # ha de ser globalplay360-3f9a1

# Veure logs del webhook en viu
firebase functions:log --only ext-firestore-stripe-payments-handleWebhookEvents --limit 50

# Re-validar sincronització: edita qualsevol preu/producte a Stripe Dashboard → ha d'aparèixer a Firestore

# Redesplegar extensió si es toca .env
firebase deploy --only extensions

# Desplegar regles (quan existeixi firestore.rules)
firebase deploy --only firestore:rules
```
