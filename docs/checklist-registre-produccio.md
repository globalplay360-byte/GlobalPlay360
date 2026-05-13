# Checklist ràpid de producció

Document curt per recordar com deixar la web amb el registre públic tancat o obert.

## Estat actual desitjat

- Web pública visible
- Launch eliminada
- Només poden entrar usuaris amb compte existent
- `/register` redirigeix a `/login`

## Tancar registre públic

Fes servir una d'aquestes dues opcions abans del build:

```powershell
Remove-Item Env:VITE_PUBLIC_REGISTRATION_ENABLED -ErrorAction SilentlyContinue
```

o bé:

```powershell
$env:VITE_PUBLIC_REGISTRATION_ENABLED="false"
```

Després:

```powershell
npm run build
firebase deploy --only hosting
```

Resultat esperat:

- `/register` envia a `/login`
- la home no convida a registrar-se
- el login és només per comptes existents
- el botó de Google públic queda ocult

## Obrir registre públic

Abans del build:

```powershell
$env:VITE_PUBLIC_REGISTRATION_ENABLED="true"
```

Després:

```powershell
npm run build
firebase deploy --only hosting
```

Resultat esperat:

- `/register` torna a estar actiu
- tornen els CTA de registre
- torna el botó de Google al login
- es poden crear comptes nous

## Verificació ràpida després de cada deploy

Comprovar en incògnit:

1. `https://www.globalplay360.com/`
2. `https://www.globalplay360.com/login`
3. `https://www.globalplay360.com/register`

Si el registre està tancat:

- la home ha de mostrar `Login`
- `/register` ha de mostrar login

Si el registre està obert:

- la home ha de mostrar CTA de registre
- `/register` ha de mostrar la pàgina de registre real

## Font de veritat

La clau de tot és aquesta variable a `src/config/site.ts`:

```ts
export const PUBLIC_REGISTRATION_ENABLED =
  import.meta.env.VITE_PUBLIC_REGISTRATION_ENABLED === "true";
```

Per context complet, veure també:

- `docs/registre-produccio.md`
