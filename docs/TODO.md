# 📋 Tasques Pendents (TODO) i Deute Tècnic

Aquest document recopila tasques, funcionalitats futures o sistemes inacabats que s'han deixat per resoldre "més endavant" per evitar bloquejos i seguir amb el full de ruta.

## Funcionalitats Core - Dashboard

- [ ] **Mètrica "Força del perfil" (Profile Strength)**: Actualment a `OverviewPage.tsx` es troba configurada en estètic al `100%`. Ha d'estar ancorada a un sistema de progrés basat en l'arxiu/context de `ProfilePage.tsx` que mesuri quants camps crucials (nom, foto, data de naixement, etc.) l'usuari ha arribat a omplir.
- [ ] **Visites al Perfil (Metrics - Club)**: A `OverviewPage.tsx` actualment apareix com a `---`. Aquest apartat de recull d'analítiques requerirà un traqueig a Base de Dades (compte de clics public/profile) abans de mostrar dades consistents.
