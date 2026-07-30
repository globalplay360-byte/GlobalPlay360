# Bíblia QA Stripe — Subscripcions (TEST → LIVE)

> **Propòsit:** checklist reutilitzable per qualsevol producte amb Stripe Billing + Customer Portal (+ Firebase Extensions si aplica).  
> **Regla d’or:** el camí feliç (`4242`) **no** és QA de billing. Sense matriu d’errors + `past_due` + emails + Portal, **no es declara “Stripe OK”**.  
> **Mode:** sempre TEST primer. LIVE només amb smoke controlat al final.  
> **Data plantilla:** 18 juliol 2026 · Projecte origen: GlobalPlay360.

---

## 0. Què significa “Stripe QA complet”

| Nivell | Abast | Es pot dir “OK”? |
|---|---|---|
| **N1 — Smoke** | Checkout `4242` + trial visible | Només “checkout bàsic OK” |
| **N2 — Flux comercial** | N1 + cancel Portal + reactivació + segments/rols | “Flux de venda OK” |
| **N3 — Resiliència** | N2 + targetes fallides + `past_due` + emails + one-trial + antidoble | **“Billing QA OK (TEST)”** |
| **N4 — Go-live** | N3 + Tax/IVA + webhook LIVE + 1 pagament real controlat | **“Llest per cobros reals”** |

**Declarar N3 o N4 sense evidència = mentida de release.**

---

## 1. Targetes de prova (Stripe TEST)

Fonts oficials: [Testing cards](https://docs.stripe.com/testing#cards) · [Declined payments](https://docs.stripe.com/testing#declined-payments).

Totes: qualsevol CVC, data futura (ex. `12/34`), qualsevol CP — **excepte** quan la targeta digui el contrari.

### 1.1 Èxit

| Cas | PAN | Esperat |
|---|---|---|
| Pagament OK | `4242 4242 4242 4242` | Checkout success · sub `trialing` o `active` |
| 3DS (autenticació OK) | `4000 0025 0000 3155` | Modal 3DS → success |
| 3DS fallida | `4000 0027 6000 3184` | Pagament no completa |

### 1.2 Rebuigs al checkout (primera compra)

| Cas | PAN | Esperat a Checkout |
|---|---|---|
| Targeta rebutjada (genèric) | `4000 0000 0000 0002` | Error declivi · **cap** sub `active`/`trialing` |
| Fons insuficients | `4000 0000 0000 9995` | Error “insufficient funds” |
| Targeta caducada | `4000 0000 0000 0069` | Error “expired card” |
| CVC incorrecte | `4000 0000 0000 0127` | Error CVC |
| Processament error | `4000 0000 0000 0119` | Error processament |

### 1.3 Impagament **després** (renewal / fi de trial) → `past_due`

Aquestes targetes **passen el primer cobrament** i fallen en el següent (o es forcen amb Dashboard):

| Cas | PAN | Ús |
|---|---|---|
| Attach OK, fail on renew | `4000 0000 0000 0341` | Ideal per simular `past_due` després del trial |
| Always fail after attach | Veure docs Stripe “charge customer later” | Alternativa |

**Com forçar `past_due` en TEST (pràctic):**
1. Crear sub amb trial curt (o acabar el trial des del Dashboard: *Update subscription → end trial now*).
2. Posar mètode de pagament `…0341` (o un que falli al renew).
3. Esperar reintent / finalitzar trial → estat `past_due` o `unpaid`.
4. Verificar **app + Portal + emails**.

---

## 2. Matriu obligatòria (N3) — marcar PASS / FAIL / N/A

Copia aquesta taula a cada projecte (`docs/QA_STRIPE_<projecte>.md` o al HANDOFF).

### A. Catàleg i sync

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| A1 | Productes/Prices correctes (imports, moneda, interval) | | |
| A2 | Metadata de rol/segment (si aplica) sincronitzada | | |
| A3 | Webhook 2xx (no 401 whsec) | | |
| A4 | `tax_behavior` acordat (inclusive/exclusive) abans de LIVE | | |

### B. Checkout — camí feliç

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| B1 | `4242` mensual — rol A | | |
| B2 | `4242` mensual — rol B (si hi ha segments) | | |
| B3 | `4242` anual (almenys 1 rol) | | |
| B4 | Trial N dies (`trialing` + `trial_end`) | | |
| B5 | Success URL + pla reflectit a UI **sense** refresh manual | | |
| B6 | 3DS OK (`…3155`) si 3DS està en joc | | |

### C. Checkout — errors (obligatori abans de “billing OK”)

| # | Cas | Targeta | PASS? | Evidència |
|---|---|---|---|---|
| C1 | Rebutjada | `…0002` | | |
| C2 | Sense fons | `…9995` | | |
| C3 | Caducada | `…0069` | | |
| C4 | Usuari pot reintentar amb `4242` després d’un error | | |

**Criteri PASS C\*:** missatge comprensible · **cap** claim premium fantasma · **cap** doble sub orphan.

### D. Subscripció viva i guards

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| D1 | Segona checkout amb sub viva → bloquejada | | |
| D2 | One-trial-only (2n checkout del mateix user sense trial) | | |
| D3 | Rol A no pot comprar price del segment B (si aplica) | | |

### E. Customer Portal

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| E1 | Obrir Portal des de Billing | | |
| E2 | Cancel al **final del període** (trial o active) | | |
| E3 | Accés premium mantingut fins a `cancel_at` / `trial_end` | | |
| E4 | Reactivació (si política ho permet) | | |
| E5 | Canvi de pla: només el que la política permet (ex. NO creuar segments) | | |
| E6 | Canvi mètode de pagament | | |

### F. Impagament (`past_due`) — el més oblidat

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| F1 | Sub passa a `past_due` / `unpaid` | | |
| F2 | UI **no** diu “tot OK” | | |
| F3 | Usuari **pot obrir el Portal** per actualitzar targeta | | |
| F4 | Després de pagar, torna `active` i UI premium OK | | |
| F5 | Email “payment failed” de Stripe activat (TEST/LIVE) | | |

**Anti-patró conegut:** filtrar només `status in ['trialing','active']` al listener → `past_due` invisible → redirect a /pricing → **no pot arreglar la targeta**. Això és FAIL de F3 encara que Stripe estigui bé.

### G. Emails natius Stripe

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| G1 | Recordatori fi de trial | | |
| G2 | Pagament fallit | | |
| G3 | Pagament correcte / factura (opcional però recomanat) | | |
| G4 | Reemborsament (si s’ofereixen) | | |

### H. Drets / compte

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| H1 | Esborrat de compte bloquejat si sub viva (o cancel auto) | | |
| H2 | Després de cancel + esborrat: no es cobra | | |

### I. Go-live (N4)

| # | Cas | PASS? | Evidència |
|---|---|---|---|
| I1 | Compte Stripe complet (0 tasques bloquejants) | | |
| I2 | Stripe Tax / IVA configurat | | |
| I3 | Webhook + secrets LIVE | | |
| I4 | Catàleg LIVE = preus publicats | | |
| I5 | 1 pagament real controlat + 1 cancel Portal | | |
| I6 | URLs legals al Portal (privacy/terms) | | |

---

## 3. Protocol d’execució (ordre que estalvia temps)

1. **Catàleg + webhook** (A) — si falla, atura’t.  
2. **Happy path** un rol (B1/B4/B5).  
3. **Errors checkout** (C1–C3) amb el mateix compte o comptes QA.  
4. **Portal cancel** (E2–E3).  
5. **Forçar `past_due`** (F) — arreglar UI si cal **abans** de LIVE.  
6. **Guards** (D).  
7. **Emails** (G) — sovint bloquejats si el compte té “tareas” pendents.  
8. **LIVE smoke** (I) només amb N3 en verd.

### Comptes QA

- Un compte **per rol/segment** (player / club…).  
- Un compte “brut” per errors de targeta (C).  
- Un compte dedicat a `past_due` (F) — no el barregis amb la demo del client.

---

## 4. Criteris de veredicte

| Veredicte | Condició |
|---|---|
| 🟢 **GO TEST** | A + B (mínim 2 rols si n’hi ha) + C1–C3 + E2 + D1 en PASS |
| 🟢 **GO BILLING RESILIENT** | GO TEST + F2–F4 + G1–G2 |
| 🟢 **GO LIVE** | GO BILLING RESILIENT + I1–I5 |
| 🔴 **NO-GO** | Qualsevol FAIL a C (claim fantasma), F3 (no pot arreglar targeta), D1 (doble cobrament), A3 (webhook) |

---

## 5. Fitxa GlobalPlay360 — estat 18/07/2026

### Fet (N2 parcial)

| # | Cas | Estat |
|---|---|---|
| B1 | Player `4242` mensual + trial | ✅ |
| B2 | Club `4242` mensual + trial | ✅ |
| E2 | Cancel Portal Clubs (fi període 17 ago) | ✅ |
| A2/A3 | Sync + webhook TEST | ✅ |
| Pricing per rol | Scripts QA | ✅ |

### Execució N3 — 18/07/2026 ✅

| Pas | Acció | Resultat |
|---|---|---|
| 1 | Rebutjada `…0002` | ✅ PASS |
| 2 | Sense fons `…9995` | ✅ PASS |
| 3 | Caducada `…0069` | ✅ PASS |
| 4 | Reintent OK `4242` | ✅ (E2E previ player/club) |
| 5 | Anual Individual 99,99 € | ✅ PASS (`trialing`, year) |
| 6 | `past_due` via simulació + UI | ✅ PASS (banner Pricing + Billing + Portal CTA; estat Stripe «Vencida») |
| Fix F3 | listener + Billing/Pricing | ✅ branca `fix/past-due-billing-portal` |
| Emails | toggles Stripe | ⚠️ pendent (compte «2 tareas») — no bloqueja N3 de flux, sí abans de N4 |

**Veredicte 18/07:** **N3 — Billing QA OK (TEST)**. Proper: N4 go-live.

### Fix `past_due` (BUG 2) — branca `fix/past-due-billing-portal`

```text
subscribeToActiveSubscription → status in ['trialing','active','past_due','unpaid']
BillingPage: no redirect si cal Portal
PricingPage: banner + CTA → /dashboard/billing
```

Després del merge/deploy: re-executar pas F (forçar `past_due` amb `…0341`).

---

## 6. Plantilla per agents (copiar al skill / rule)

```text
Abans de declarar “Stripe / billing OK” en un projecte:
1. Llegeix docs/BIBLIA_QA_STRIPE.md (o equivalent al repo).
2. No acceptis només 4242 com a evidència.
3. Exigeix evidència de: C (errors targeta), E (Portal cancel), F (past_due + Portal obrible), G (emails) per N3.
4. Si el listener de subscripció ignora past_due/unpaid → marca FAIL F3 i proposa fix abans de LIVE.
5. Actualitza la fitxa del projecte (taula PASS/FAIL) al HANDOFF o docs/QA_STRIPE_*.md.
6. Distingeix sempre N1/N2/N3/N4 al comunicar l’estat al client.
```

---

## 7. Enllaços ràpids

| Què | URL |
|---|---|
| Testing cards | https://docs.stripe.com/testing |
| Customers TEST | https://dashboard.stripe.com/test/customers |
| Subscriptions TEST | https://dashboard.stripe.com/test/subscriptions |
| Account status | https://dashboard.stripe.com/test/account/status |
| Billing emails | https://dashboard.stripe.com/test/settings/billing |
| Customer Portal | https://dashboard.stripe.com/test/settings/billing/portal |

---

*Aquesta bíblia és operativa (enginyeria + QA). No substitueix assessoria legal/fiscal.*
