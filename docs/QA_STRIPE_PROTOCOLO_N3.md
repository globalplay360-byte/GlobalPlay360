# Protocol QA Stripe N3 — GlobalPlay360 (pas a pas)

**Temps:** 30–45 min  
**Mode:** Stripe **TEST** només  
**Branca per a la prova 6:** `fix/past-due-billing-portal` (`npm run dev`)  
**URL local:** http://localhost:5173 (o la del teu Vite)  
**URL deploy (sense fix past_due encara):** https://globalplay360-3f9a1.web.app  

Marca cada cas: ✅ PASS / ❌ FAIL / ⏭️ SKIP

---

## 0. Preparació (5 min)

### 0.1 Entorn
1. Obre terminal al repo.
2. Assegura’t d’estar a la branca del fix:
   ```bash
   git checkout fix/past-due-billing-portal
   npm run dev
   ```
3. Obre el navegador en finestra d’incògnit (evita sessions barrejades).
4. Obre també Stripe Dashboard → **Test mode** ON:
   - Customers: https://dashboard.stripe.com/test/customers
   - Subscriptions: https://dashboard.stripe.com/test/subscriptions

### 0.2 Comptes (important)
Els comptes QA antics (`qa.player…` / `qa.club…`) **poden tenir trial/cancel programada** → el guard antidoble **bloqueja** un nou checkout.

Per a les proves **1–5** necessites un compte **sense** subscripció `trialing` / `active` / `past_due`.

Opcions:
- **A (recomanat):** crear un compte nou de prova (si el registre està tancat, obre’l temporalment o crea’l des d’Admin / script QA).
- **B:** a Stripe → Customer del QA → Subscription → **Cancel immediately** (no “at period end”), espera 10–20 s, refresca JWT (logout/login).

**Contrasenya QA coneguda (si reutilitzes):** veure `scripts/qa-accounts.generated.json` (gitignored).

Dades comunes de targeta a Checkout Stripe:
- **Caducitat:** qualsevol futura → `12 / 34`
- **CVC:** `123`
- **Nom / CP:** qualsevol (ex. `QA Test` / `08001`)

---

## Prova 1 — Targeta rebutjada

| | |
|---|---|
| **Objectiu** | El checkout falla net; no hi ha Premium fantasma |
| **Targeta** | `4000 0000 0000 0002` |
| **Compte** | Sense sub viva |

### Passos
1. Login amb el compte de proves.
2. Ves a `/pricing`.
3. Deixa **Mensual** + segment del teu rol (jugador = individuals).
4. Clica el CTA Premium → et porta a Stripe Checkout.
5. Introdueix la targeta `4000 0000 0000 0002` + data/CVC.
6. Confirma el pagament.

### PASS si
- [ ] Stripe mostra error de targeta / declivi (no success).
- [ ] **No** arribes a la pantalla «Benvingut Premium».
- [ ] En tornar a l’app: `activePlan` segueix free (Dashboard / missatgeria encara amb paywall si aplica).
- [ ] A Stripe → Customers → aquest client: **cap** sub `trialing`/`active` nova (o només `incomplete` abandonada).

### FAIL si
- Et deixa Premium, o es crea una sub cobrable.

**Anota:** ________________________________

---

## Prova 2 — Sense fons

| | |
|---|---|
| **Objectiu** | Mateix que 1, missatge/error de fons insuficients |
| **Targeta** | `4000 0000 0000 9995` |
| **Compte** | El mateix (encara sense sub viva) |

### Passos
1. Des de `/pricing`, torna a obrir checkout (mensual).
2. Targeta `4000 0000 0000 9995` + `12/34` + `123`.
3. Confirma.

### PASS si
- [ ] Error (insufficient funds / declivi).
- [ ] Sense Premium a l’app.
- [ ] Sense sub `active`/`trialing` a Stripe.

**Anota:** ________________________________

---

## Prova 3 — Targeta caducada

| | |
|---|---|
| **Objectiu** | Declivi per caducitat |
| **Targeta** | `4000 0000 0000 0069` |

### Passos
1. Checkout mensual des de `/pricing`.
2. Targeta `4000 0000 0000 0069` + `12/34` + `123`.
3. Confirma.

### PASS si
- [ ] Error d’expired card / declivi.
- [ ] Sense Premium.
- [ ] Sense sub viva a Stripe.

**Anota:** ________________________________

---

## Prova 4 — Reintent OK després d’errors

| | |
|---|---|
| **Objectiu** | Després de 1–3, un pagament bo funciona |
| **Targeta** | `4242 4242 4242 4242` |

### Passos
1. `/pricing` → CTA Premium → Checkout **mensual**.
2. Targeta `4242…` + `12/34` + `123`.
3. Confirma.
4. Espera redirect a success / dashboard.
5. Ves a `/dashboard/billing`.

### PASS si
- [ ] Pantalla d’èxit o estat Premium sense refresh manual (o amb refresh ≤1).
- [ ] Billing: estat **En període de prova** / trial.
- [ ] Stripe: sub `trialing`, trial ~30 dies, producte Individual (si ets player/coach).
- [ ] Paywall de missatges desbloquejat (si el producte ho exigeix premium).

**Anota ID sub Stripe:** ________________________________

---

## Prova 5 — Pla anual

| | |
|---|---|
| **Objectiu** | Checkout anual OK (preu i interval) |
| **Targeta** | `4242 4242 4242 4242` |
| **Compte** | **Nou** sense sub, o cancel·la **immediately** la de la prova 4 |

> Si encara tens la sub de la prova 4 en `trialing`, el checkout es bloquejarà (`SUBSCRIPTION_ALREADY_ACTIVE`). Cancel·la immediata a Stripe o usa un altre compte.

### Passos
1. Login amb compte net.
2. `/pricing` → selecciona **Anual**.
3. Comprova el preu mostrat: **99,99 €** (individual) o **249,99 €** (club).
4. CTA → Checkout.
5. Targeta `4242…` → confirma.
6. Revisa Billing + Stripe.

### PASS si
- [ ] Preu UI amb 2 decimals correctes.
- [ ] Stripe: interval **year**, import correcte, `trialing` (si primer trial).
- [ ] App: Premium actiu.

**Anota:** ________________________________

---

## Prova 6 — `past_due` + Portal obrible

| | |
|---|---|
| **Objectiu** | Impagament visible; l’usuari pot obrir Billing i el Customer Portal |
| **Targeta** | `4000 0000 0000 0341` |
| **Compte** | **Dedicat** (nou), branca amb fix `past_due` en local |

### Passos A — Crear sub amb targeta “fail later”
1. Login compte net · `npm run dev` amb `fix/past-due-billing-portal`.
2. `/pricing` → **Mensual** → Checkout.
3. Paga amb `4000 0000 0000 0341` (aquesta targeta sol **acceptar l’attach** i fallar després).
4. Confirma que tens trial / Premium inicial.

### Passos B — Forçar l’impagament
1. Stripe Dashboard → **Subscriptions** → obre aquesta sub.
2. Menú `⋯` o **Actions** → **Update subscription** / **End trial immediately** (o “End trial now”).
3. Si cal, a **Payment methods** assegura’t que el default és la `…0341`.
4. Espera que l’intent de cobrament falli → estat **`past_due`** (o `unpaid`).  
   Si no canvia en 1–2 min: **Invoice** → obrir la factura oberta → **Pay** (fallarà) o **Retry**.

### Passos C — Verificar l’app
1. Logout / login (refresca claims).
2. Ves a `/pricing` → hauries de veure el **banner vermell** + botó «Anar a facturació».
3. Ves a `/dashboard/billing` → **no** et pot expulsar a Pricing.
4. Banner «Pagament pendent» visible.
5. Clica **Obrir portal de Stripe**.
6. Al Portal: actualitza la targeta a `4242 4242 4242 4242` i torna.

### PASS si
- [ ] Stripe mostra `past_due` (o `unpaid`).
- [ ] Billing obrible amb banner d’impagament.
- [ ] Portal s’obre.
- [ ] Després de posar `4242` i pagar/reintentar: sub torna `active` (o es resol la invoice) i UI deixa d’avisar.

### FAIL si
- Billing et porta a `/pricing` i no pots gestionar res → bug antic encara present (redeploy/branca incorrecta).

**Anota:** ________________________________

---

## Tancament

| Prova | Resultat | Notes |
|---|---|---|
| 1 Rebutjada | | |
| 2 Sense fons | | |
| 3 Caducada | | |
| 4 Reintent OK | | |
| 5 Anual | | |
| 6 past_due + Portal | | |

**Veredicte:** N2 / N3 parcial / N3 complet  

Quan acabis, enganxa aquesta taula al xat o actualitza `HANDOFF.md` / `docs/BIBLIA_QA_STRIPE.md` secció fitxa GP360.

---

## Recordatori Claude / Cursor
Skill de projecte: `.claude/skills/stripe-billing-qa/SKILL.md`  
Skill Cursor personal: `~/.cursor/skills/stripe-billing-qa/SKILL.md`  
Per Claude Code global: copia el mateix fitxer a `~/.claude/skills/stripe-billing-qa/SKILL.md`
