# Registre públic tancat en producció

Aquest document explica què s'ha fet per deixar GlobalPlay360 visible en producció, però amb el registre públic deshabilitat perquè només hi puguin accedir usuaris que ja tenen compte.

## Objectiu actual

- La web pública ha d'estar visible.
- La home, l'about, el pricing i les pàgines legals han de ser accessibles.
- Els usuaris existents han de poder iniciar sessió.
- Els usuaris nous no s'han de poder registrar.
- La launch page ja no s'ha de mostrar.

## Com està implementat ara

### 1. La launch page ha quedat eliminada del flux públic

- L'app arrenca sempre des de `src/main.tsx`.
- La home pública ja no depèn del mode prelaunch.
- `index.html` ja no mostra el clip de "Proximamente" com a fallback públic.

Fitxers clau:

- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/layout/PublicLayout.tsx`

### 2. El registre públic queda controlat per una única variable

La font de veritat és:

- `src/config/site.ts`

Variable actual:

```ts
export const PUBLIC_REGISTRATION_ENABLED =
  import.meta.env.VITE_PUBLIC_REGISTRATION_ENABLED === "true";
```

Comportament actual:

- Si `VITE_PUBLIC_REGISTRATION_ENABLED` NO és `true`, el registre públic queda tancat.
- Això és el comportament per defecte actual en producció.

## Què queda bloquejat quan el registre està tancat

### Rutes

A `src/App.tsx`:

- `/register` redirigeix a `/login`.
- La resta de pàgines públiques continuen accessibles.

### UI pública

S'han substituït els CTA de registre per alternatives coherents:

- Navbar: només mostra `Iniciar Sessió`.
- Home: els botons principals apunten a `login`, `pricing` o `about`.
- Pricing: el CTA del pla free apunta a `login`.
- About: el CTA principal apunta a `login`.
- Footer: els enllaços de "Players / Clubs / Coaches / Founder" apunten a `login`.

Fitxers clau:

- `src/components/layout/Navbar.tsx`
- `src/pages/public/HomePage.tsx`
- `src/pages/public/PricingPage.tsx`
- `src/pages/public/AboutPage.tsx`
- `src/components/layout/Footer.tsx`

### Auth

S'ha afegit bloqueig també a nivell de servei, no només de UI.

A `src/services/auth.service.ts`:

- `registerWithEmail()` llança error si el registre públic està tancat.
- `loginWithGoogle()` també queda bloquejat quan el registre públic està tancat.

Important:

- Amb la configuració actual, quan el registre està tancat, també desapareix el botó de Google del login públic.
- Això evita la creació accidental de comptes nous mitjançant Google.
- Conseqüència: si algun client actual només entra amb Google, caldrà reobrir aquest flux o dissenyar una excepció específica.

### Pantalla de login

A `src/pages/auth/LoginPage.tsx`:

- Es manté el login per a comptes existents.
- Es mostra un missatge informatiu dient que l'accés és només per a comptes existents.
- Es mostra el correu de contacte per demanar alta manual.

## Estat funcional actual

Ara mateix la producció queda pensada així:

- Web pública visible.
- Launch eliminada.
- Registre públic tancat.
- Login disponible per usuaris existents.
- `/register` envia a `/login`.

## Com reobrir la web al 100%

Quan la clienta validi i vulguis tornar a permetre nous registres, el procediment és aquest.

### Opció prevista al codi

Fer el build de producció amb:

```powershell
$env:VITE_PUBLIC_REGISTRATION_ENABLED="true"
npm run build
firebase deploy --only hosting
```

Amb això tornarà a passar el següent:

- `/register` tornarà a estar actiu.
- Els CTA públics tornaran a convidar a registrar-se.
- El botó de Google del login tornarà a aparèixer.
- `registerWithEmail()` i `loginWithGoogle()` deixaran de bloquejar l'alta.

### Verificació obligatòria després de reobrir

Comprovar en incògnit i al mòbil:

1. La home carrega correctament.
2. `/register` mostra la pàgina de registre real.
3. Els botons de la home apunten a registre.
4. El login mostra de nou el botó de Google.
5. Es pot crear un compte nou de prova.

## Com tornar a deixar el registre tancat

Si en algun moment cal tornar a tancar-lo:

```powershell
Remove-Item Env:VITE_PUBLIC_REGISTRATION_ENABLED -ErrorAction SilentlyContinue
npm run build
firebase deploy --only hosting
```

Alternativament, també serviria:

```powershell
$env:VITE_PUBLIC_REGISTRATION_ENABLED="false"
npm run build
firebase deploy --only hosting
```

## Recomanació de producte

Per l'estat actual del projecte, aquesta configuració és coherent per ensenyar la plataforma a clienta i clients ja creats sense obrir encara el funnel d'alta pública.

Si més endavant necessites una fase intermèdia, la millor evolució seria separar tres casos:

- login per usuaris existents
- alta manual només des d'admin o invitació
- registre públic complet

Però avui no cal: amb el flag actual tens un tall net i fàcil de revertir.
