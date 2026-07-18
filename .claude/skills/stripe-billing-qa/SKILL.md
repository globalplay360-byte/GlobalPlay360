---
name: stripe-billing-qa
description: >-
  PORTA DURA de QA Stripe Billing (TEST→LIVE). OBLIGATORI abans de declarar
  cobros OK, go-live, Customer Portal, trials, past_due, pricing de pagament,
  o quan només s'hagi provat 4242. També quan l'usuària digui "Stripe està fet",
  "billing OK", "podem cobrar", "entrega", "LIVE". Mai acceptar N3/N4 sense
  matriu d'errors + past_due + Portal. Incompliment = risc legal (consum/RGPD).
---

# Stripe Billing QA — porta dura (carrera / legal)

## Per què això no es pot saltar
Cobros mal provats = risc de **consum (LGDCU)**, **transparència**, **impagaments sense via de reparació**, i reputació professional.  
Si només s’ha fet `4242`, el veredicte màxim és **N1/N2**. Dir “Stripe OK” o “llest per cobrar” sense N3 és un **error greu de l’agent**.

## Regla d’or (no negociable)
1. El camí feliç (`4242`) **NO** és QA de billing.
2. Sense evidència PASS de **C1–C3 + E (Portal cancel) + F (`past_due` + Portal obrible)**, **prohibit** dir «Billing QA OK» / N3.
3. Sense N3 + Tax/compte LIVE + 1 pagament real, **prohibit** dir «llest per cobros reals» / N4.
4. Sempre comunicar el **nivell exacte** (N1–N4) i la llista del que **falta**.
5. Si el registre públic està tancat: **crear comptes QA per script/Admin**, no bloquejar el QA ni reobrir registre en producció sense decisió explícita.

## Nivells (ús obligatori al parlar amb la usuària / client)
| Nivell | Abast mínim | Frase permesa |
|---|---|---|
| N1 | Checkout `4242` + trial visible | «checkout bàsic OK» |
| N2 | N1 + cancel Portal + segments/rols | «flux de venda OK» |
| N3 | N2 + errors targeta + `past_due` UI/Portal + guards | **«Billing QA OK (TEST)»** |
| N4 | N3 + Tax/IVA + webhook/secrets LIVE + 1 pagament real | **«Llest per cobros reals»** |

## Hard stop — abans de qualsevol “OK / go-live / entrega cobros”
L’agent **ha d’aturar-se** i exigir (o executar) aquesta checklist. Si un ítem no està PASS, **no avançar** el discurs de tancament:

```text
[ ] C1 Rebutjada     4000 0000 0000 0002  → error, sense Premium, sense sub viva
[ ] C2 Sense fons    4000 0000 0000 9995  → idem
[ ] C3 Caducada      4000 0000 0000 0069  → idem
[ ] B  Reintent OK   4242…                → trial/active OK
[ ] B+ Anual (si hi ha yearly)            → interval year + import correcte
[ ] E  Portal cancel al final del període
[ ] F1 Sub en past_due / unpaid (Stripe)
[ ] F2 UI avisa (banner), NO diu “tot OK”
[ ] F3 Billing/Portal OBERT (usuari pot canviar targeta)
[ ] G  Emails Stripe: fi trial + payment failed (o documentar bloqueig compte)
[ ] D  Antidoble sub + one-trial (si apliquen)
```

**Sortida mínima de l’agent:** taula PASS/FAIL + nivell + “NO PROVAT: …”.

## Anti-patró crític F3 (`past_due` invisible)
Si el codi filtra només `status in ['trialing','active']`:
- la UI perd la sub `past_due`
- Billing redirigeix a `/pricing`
- l’usuari **no pot reparar el pagament** → **FAIL F3** → **NO-GO LIVE**

**Fix mínim (verificar al repo):**
- Listener: `trialing | active | past_due | unpaid`
- Billing: no redirect si `subscriptionNeedsPaymentAttention`
- Pricing: banner + CTA a Billing

## Com forçar `past_due` a Stripe TEST (si “End trial” no es veu)
1. Checkout amb `4000 0000 0000 0341` (accepta attach, falla al renew).
2. A la fitxa de la sub → **«Ejecutar simulación»** / Run simulation.
3. Avançar **+1 mes** (o data **després** del `trial_end`) → **Adelantar fecha y hora**.
4. Estat esperat: **Vencida** / `past_due`.
5. Logout/login app → comprovar F2/F3.

Alternativa API: `subscriptions update sub_xxx --trial-end=now`.

## Registre tancat / comptes QA
- No dependre del formulari públic si `PUBLIC_REGISTRATION_ENABLED=false`.
- Crear comptes amb script Admin/client Auth (ex. `scripts/create-qa-accounts.mjs`).
- Un compte **net** per errors; un altre per `past_due`; no barrejar amb demo del client.

## Protocol d’ordre
Catàleg/webhook → happy path → **errors targeta** → Portal cancel → **forçar past_due** → guards → emails → LIVE smoke.

## Fitxers del projecte (si existeixen, LLEGIR i ACTUALITZAR)
- `docs/BIBLIA_QA_STRIPE.md` — bíblia completa + fitxa PASS/FAIL
- `docs/QA_STRIPE_PROTOCOLO_N3.md` — passos manuals
- `docs/guia_qa_stripe_n3.html` — guia 2 capes
- `.claude/skills/stripe-billing-qa/SKILL.md` — còpia de projecte

Si el repo **no** té bíblia: **crear-la** abans del go-live (copiar aquesta estructura).

## Frases prohibides sense evidència N3/N4
- «Stripe ja està» / «billing OK» / «podem cobrar» / «ready for production payments»
- «QA de pagaments fet» (si només hi ha 4242)
- Amagar el bug `past_due` com a “detall menor”

## Sortida esperada (plantilla)
```markdown
### Veredicte Stripe: N? (NO-GO | GO TEST | GO BILLING | GO LIVE)
| Cas | PASS/FAIL | Evidència |
| ... | ... | ... |
**No provat:** …
**Bloqueig legal/producte:** … (ex. F3, emails, Tax)
**Proper pas:** …
```
