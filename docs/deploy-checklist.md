# Llista de Tasques per al Desplegament a Producció (Deployment Checklist)

Quan estiguem preparats per passar de l'entorn local (`http://localhost:5173`) a l'entorn de producció (ex. `https://globalplay360.com` o el domini defintiu), caldrà revisar i actualitzar els següents punts:

## 1. Firebase Authentication: Plantilles de Correu

- **Problema:** Els enllaços per recuperar la contrasenya o verificar el correu, ara mateix, apunten a localhost.
- **Acció:**
  1.  Ves a la [Firebase Console](https://console.firebase.google.com/).
  2.  Obre **Authentication > Templates (Plantilles)**.
  3.  A la secció **Restabliment de la contrasenya** (Password reset), fes clic a l'engranatge/llapis per editar.
  4.  Clica a **Customize action URL (Personalitza URL d'acció)**.
  5.  Canvia `http://localhost:5173/auth/action` per la teva URL final: `https://el-teu-domini.com/auth/action`.
  6.  Guarda els canvis. (Fes el mateix si has habilitat la verificació d'email).

## 2. Variables d'Entorn (.env)

- **Problema:** Les claus de l'API de Firebase, Stripe i qualsevol altre servei, poden canviar si separem els entorns (Development vs Production).
- **Acció:** Assegurar que el servei on fem l'allotjament (Vercel, Netlify, Firebase Hosting) tingui les variables d'entorn corresponents configurades correctament per l'entorn de Producció.

## 3. Firebase Security Rules (Firestore & Storage)

- **Problema:** Podrien haver-hi regles temporals laxes.
- **Acció:** Validar i desplegar les regles finals al fitxer `firestore.rules`.
