# HANDOFF — GlobalPlay360

> Document de traspàs entre sessions. Última actualització: **16 juliol 2026**.
> Font de veritat legal: `docs/AUDITORIA_RGPD.md` · Pla de pricing: `docs/PLA_PRICING_STRIPE.md` · Porta QA: `docs/RELEASE_GATE_COBROS.md`.

---

## 16 jul 2026 — Auditoria triple pre-cobros (rgpd-officer + firebase-stripe-auditor + release-gate)

### Què s'ha fet

Execució read-only de les 3 portes de qualitat abans del hito COBROS, amb el pricing nou autoritzat pel client (Aleix Pérez Jané; pressupost `pressupost_reajust_pricing.html`):

1. **rgpd-officer** — auditoria RGPD/LOPDGDD 360º des de zero → `docs/AUDITORIA_RGPD.md`
2. **firebase-stripe-auditor** — pla de reajust de pricing + checklist Test→Live → `docs/PLA_PRICING_STRIPE.md`
3. **release-gate** — capa 0 executada (lint/tsc/build/tests functions) + plans capa 1 i 2 → `docs/RELEASE_GATE_COBROS.md`

**No s'ha editat codi, no s'ha creat res a Stripe, no s'ha desplegat res.** Només documentació.

### Veredicte consolidat: 🔴 NO-GO per obrir cobros

**14 P0 oberts** (un de sol ja és NO-GO):

**RGPD (7):**
1. Art. 17 esborrat de compte NO existeix — i `AboutPage.tsx:341` + locales (CA/ES/EN) afirmen falsament que sí
2. Art. 20 exportació de dades NO existeix
3. `storage.rules` absents del repo + `firebase.json` sense bloc `storage` (avatars = imatges facials)
4. Textos legals amb placeholders `[pendiente de configuración]` (titular, NIF, email RGPD) — **requereix input de l'Aleix**
5. Art. 7: cap registre de consentiment al registre (sense checkbox, sense log)
6. Paywall (`PricingPage`, `BillingPage`) sense enllaços legals abans del CTA
7. Terms §4 amb pricing desfasat (25 €/250 € vs nou 9,99/99,99 i 24,99/249,99)

**Stripe/Firebase (6):**
8. Validació rol↔segment inexistent a la CF de checkout (`functions/index.js:145-166`) — un club podria pagar el preu individual
9. Guard antidoble subscripció absent (`functions/index.js:128-199`)
10. Els 8 Prices amb lookup_keys exactes encara no existeixen (`billingPolicy.js:54-96` exigeix siblings `<base>_trial`; fallback perillós a `:82`)
11. Format `toFixed(0)` a `PricingPage.tsx:86/210/224` — mostraria «10 €» en lloc de «9,99 €»
12. Secrets de l'extensió pin-ats a `versions/1` (`extensions/firestore-stripe-payments.env:6-8`) — pujar clau live sense actualitzar la referència deixaria l'extensió en test
13. Rutes legals públiques reals necessàries per al Customer Portal

**Producte (1):**
14. `npm run lint` FAIL — 26 errors, 5 warnings (`tsc --noEmit` ✅, `npm run build` ✅, tests functions 16/16 ✅)

**P1 destacats:** `past_due` invisible (`stripe.service.ts:347` filtra `['trialing','active']` → l'usuari impagat no pot arreglar la targeta) · menors sense validació d'edat ≥14 (esdevé P0 si es reobre registre públic) · PII llegible per qualsevol premium (`firestore.rules:87-89`) · Registre Art. 30 inexistent.

### Estat Stripe: TEST

**Stripe segueix en mode TEST i hi ha de seguir fins que Anna obri cobros manualment.** Cap agent farà mai el pas a LIVE.

### Pricing: mapping confirmat (pendent de crear a Stripe)

Font de veritat: `docs/PLA_PRICING_STRIPE.md`. Resum:

| Product (metadata) | lookup_key | Import | Interval | Trial |
|---|---|---|---|---|
| Players & Coaches (`firebaseRole: premium`, `segment: individual`) | `individual_monthly` / `individual_monthly_trial` | 9,99 € (999 ¢) | month | — / 30 dies |
| | `individual_yearly` / `individual_yearly_trial` | 99,99 € (9999 ¢) | year | — / 30 dies |
| Clubs (`firebaseRole: premium`, `segment: club`) | `club_monthly` / `club_monthly_trial` | 24,99 € (2499 ¢) | month | — / 30 dies |
| | `club_yearly` / `club_yearly_trial` | 249,99 € (24999 ¢) | year | — / 30 dies |

Tots EUR, `tax_behavior: inclusive` (B2C IVA inclòs). **Decisió de gating: mantenir `firebaseRole: premium` als 2 Products** (zero canvis a `firestore.rules`); la diferenciació de segment es fa amb metadata `segment` + validació de rol a la CF de checkout. El Product antic 25 €/250 € s'ha d'arxivar.

### Pròxima acció (ordre recomanat)

1. **En paral·lel, demanar a l'Aleix** les dades del titular (nom legal/NIF/domicili/email RGPD) — camí crític extern del P0 #4. Cap feina tècnica per a ell.
2. **Fixos de codi propis**: #8 validació rol↔segment + #9 guard antidoble + #11 format de preu (desbloquegen el QA de checkout).
3. Bloc RGPD: #1 (retirar el claim fals de l'AboutPage és immediat), #3 storage.rules + bloc a firebase.json, #5, #6, #7, #2.
4. Consoles Stripe/Firebase (vegeu «Què ha de fer Anna» a `docs/PLA_PRICING_STRIPE.md` i `docs/AUDITORIA_RGPD.md`): crear els 8 Prices en TEST, Stripe Tax, Customer Portal, verificar regió bucket/DPA.
5. #14 lint com a escombrada final → re-executar la porta release-gate sencera.
6. Només llavors: Anna valora el pas TEST→LIVE (manual, mai un agent).

### QA de compliance

No s'han executat proves QA de compliance (capes 1/2 només planificades) → **no s'ha generat `docs/CONSTANCIA_RGPD_QA.html`**. Es crearà quan s'executin els casos M1-M7 definits a `docs/RELEASE_GATE_COBROS.md`.
