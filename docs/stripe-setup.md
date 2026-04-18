# Integració Stripe — Estat i roadmap

**Última actualització:** 2026-04-17
**Branca de treball:** `feat/stripe-payments-setup`
**Extensió oficial:** `stripe/firestore-stripe-payments@0.3.4`

---

## 1. Decisions de producte (validades amb clienta)

| Element | Decisió |
|---|---|
| Plans | Només **Premium** (no Pro en aquesta fase) |
| Preus | **25 €/mes** i **250 €/any** (2 preus sota el mateix Product) |
| Trial | **30 dies** gratis en activar Premium |
| Cancel·lació | Accés mantingut **fins al final del període pagat** (no immediata) |
| Què desbloqueja Premium | Xat directe, aplicacions il·limitades, accés complet |
| IVA / facturació | Stripe Tax **desactivat** de moment; dades fiscals pendents |
| Entorn | **Test mode** fins a Fase 8 (un sol projecte Firebase + un sol projecte Stripe) |

## 2. Decisions d'arquitectura

- **Font de veritat del plan**: es deriva en temps real de `customers/{uid}/subscriptions` (Opció A). **Sense Custom Claims** de moment.
- **Model d'usuari**: `free` vs `premium` únicament.
- **Creació de Stripe Customer**: **lazy** — es crea al primer checkout (`SYNC_USERS_ON_CREATE = "Do not sync"`), no al registre. Estalvi de crides API per usuaris free.
- **Execució**: branca `feat/stripe-payments` dividida en **3 PRs incrementals**.

## 3. Roadmap — 8 fases

| Fase | Descripció | Estat |
|---|---|---|
| **1** | Stripe Dashboard: Product + 2 Prices + lookup_keys + Customer Portal + Restricted API key | ✅ |
| **2** | Firebase Extension: install + webhook + Secret Manager + validació sync | ✅ |
| **3** | Firestore Security Rules per a `customers`, `products`, `checkout_sessions`, `subscriptions` | 🚧 **Següent** |
| **4** | `PricingPage.tsx`: UI de plans + `createCheckoutSession` + trial 30 dies | ⏳ |
| **5** | Refactor `AuthContext`: derivar `activePlan` de `customers/{uid}/subscriptions` en temps real | ⏳ |
| **6** | `PremiumGate` component: gating del xat i altres funcionalitats Premium | ⏳ |
| **7** | `BillingPage.tsx`: mostrar subscripció activa + link al Customer Portal | ⏳ |
| **8** | Go-live: retest complet + activació Stripe Tax + URLs legals + branding Portal + passar a live mode | ⏳ |

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

| Item | Detall | Prioritat |
|---|---|---|
| Permís **Webhook Endpoints** a la Restricted API key | Actualment `Escritura` per defecte de Stripe; hauria de ser `Ninguno`. No recrear la key, editar al Stripe Dashboard. | Alta |
| URLs legals al Customer Portal | `https://globalplay360.com/terms` i `/privacy` són placeholders — substituir quan el web legal sigui públic. | Alta (blocker de live mode) |
| Activació Stripe Tax | Desactivat. A Fase 8: país de registre + configurar OSS UE + retest checkout per validar preu amb IVA. | Alta |
| Branding Customer Portal | Per defecte. Afegir logo GlobalPlay360 + colors Dark SaaS Navy quan la clienta faciliti el logo. | Mitjana |

## 7. Per reprendre — següents passos immediats

1. **Fase 3**: exportar les regles actuals de Firestore (Firebase Console → Firestore → Rules), portar-les a `firestore.rules` local, afegir regles per a Stripe (`customers`, `products`, `checkout_sessions`, `subscriptions`), registrar el fitxer a `firebase.json`, i desplegar amb `firebase deploy --only firestore:rules`.
2. **Principis de les regles a implementar**:
   - `products/**`: lectura pública, cap escriptura de client.
   - `customers/{uid}/**`: només el propi `uid` llegeix els seus docs; cap escriptura excepte `checkout_sessions` (creació autoritzada al propi uid).
   - Cap regla ha de permetre mai al client escriure camps que determinin el plan (principi: plan deriva de subscriptions via webhook, no l'escriu mai el client).
3. Quan Fase 3 estigui validada, **obrir PR 1** (`feat/stripe-payments-setup` → `main`).

## 8. Comandes útils per reprendre

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
