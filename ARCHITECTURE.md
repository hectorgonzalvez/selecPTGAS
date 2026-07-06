# Convocatòries d'Oposicions PAS — Arquitectura

> Este directori (`/seleccio`) és, de moment, un subdirectori de treball dins del repositori del Design System UACloud. **Es preveu traslladar-lo a un repositori independent** una vegada avance la migració — quan això passe, actualitzar la ruta d'importació del Design System indicada més avall.

## Stack objectiu

- **Backend**: .NET (versió a confirmar amb l'equip — .NET 8 LTS recomanat si no hi ha restricció prèvia).
- **Frontend**: Vue 3 + Composition API — stack preferit per a desenvolupament intern (vore `ARCHITECTURE.md` del repositori DS arrel).
- **Disseny visual**: Design System UACloud (tokens CSS + components), consumit com a paquet extern (vore secció "Adopció del Design System").

## Per què .NET + Vue i no HTML/CSS pur

A diferència del Design System en si (que és HTML/CSS/JS vanilla per a ser agnòstic de framework), esta aplicació és un **consumidor real** del DS amb lògica de negoci pesada (màquina d'estats, integracions externes, càlculs de calificació) — justifica un frontend amb gestió d'estat estructurada (Vue 3) i un backend tipat amb accés a dades transaccional (.NET).

## Integracions externes (crítiques, definixen el contracte d'API)

| Sistema | Ús | Notes |
|---|---|---|
| **CAS** | Autenticació d'usuaris gestors (email institucional + contrasenya) | Patró estàndard UA — token via cookie/interceptor, redirecció a login CAS en 401 (vore memòria de domini del repositori DS) |
| **e-adm** (administració electrònica UA) | Crear/tancar expedients, adjuntar documents (firma digital), enviar estats admés/exclòs, períodes de reclamació/subsanació | Font de veritat pública de la convocatòria mentre estiga oberta; el contracte d'esta API s'ha de documentar amb OpenAPI en iniciar la migració (vore `api-contract-checker` del repositori DS) |
| **Lectora de fulls test (Servei d'Informàtica)** | Format fix d'Excel per a calificacions de subexercicis tipus test | Format heretat — mantindre compatibilitat o negociar un format nou amb el Servei d'Informàtica abans de canviar-lo |
| **Gestió d'Espais** | Disponibilitat d'aules | **Fora d'abast**: el mòdul d'Aules no reserva, només registra — no cal integració, només un recordatori a l'usuari |

## Model de domini (entitats principals inferides del document)

> Pendent de validar amb el propietari abans de fixar l'esquema de BD — açò és una lectura inicial, no una decisió tancada.

- **Convocatoria**: referència (única), tipus, forma de selecció, C/C/E, unitat/subunitat, itinerari, grup/subgrup, infrarrepresentació, dates (BOE/DOGV/sol·licituds), fase actual, id d'expedient e-adm, esdeveniment recaptador.
- **CupoPlazas**: convocatòria ↔ tipus de cupo ↔ nombre de places (nul·lable = sense places publicades).
- **Aspirante/Solicitud**: dades personals, domicili, naixement, estat (admés/exclòs/provisional/definitiu), motius d'exclusió (multi-valor), marca de revisat.
- **MotivoExclusion**: catàleg editable (CRUD).
- **Tribunal / MiembroTribunal**: persona, calidad, tipus (titular/suplent), actua, motiu de baixa, dates d'accés a e-adm.
- **Ejercicio**: orde, tipus, obligatori, puntuació màxima, prioritat de desempat, data, distribució (lletra/idioma), valors de tall per cupo.
- **Subejercicio**: orde dins de l'exercici, tipus, puntuació màxima, tipus test, nota de tall per cupo.
- **Calificacion**: aspirant ↔ subexercicio ↔ nota (+ historial de rectificacions amb motiu).
- **Aula / DistribucionAula**: aula UA precarregada, capacitat informativa vs. disponible per exercici, assignació general/individual per aspirant.
- **LogAuditoria**: usuari, acció, entitat afectada, timestamp — **requisit explícit del propietari**, no opcional.
- **Usuario / RolConvocatoriaTipo**: usuari CAS ↔ tipus de convocatòria que pot gestionar ↔ rol (gestor / gestor jefe).

## Màquina d'estats de fases

Modelar `Convocatoria.fase` com un **enum amb transicions explícites** (no un simple string lliure), ja que cada transició dispara efectes secundaris obligatoris (enviaments a e-adm, esborrat de marques de revisat, etc. — vore `PRODUCT.md` § Màquina d'estats). Recomanat: patró State/Strategy al backend .NET, amb cada fase encapsulant les seues pròpies regles de transició i validacions previes, en lloc d'un `switch` dispers pel codi.

## Adopció del Design System UACloud

Quan este directori es convertisca en repositori independent:

```markdown
# Mòdul Convocatòries d'Oposicions PAS — UACloud
@ruta/fins/design-system.md
```

On `design-system.md` és el fitxer de regles operatives compactes del repositori DS arrel (tokens, classes canòniques, decisions immutables). **No copiar** els tokens ni els components ací — es consumixen via `ua-ds.css`/`ua-ds.js` com qualsevol altre mòdul del campus (vore `ARCHITECTURE.md` del repositori DS arrel, secció "Distribució del DS en nous projectes").

**No es crea un `DECISIONS.md` de disseny visual propi** — les decisions de color, tipografia, layout, botons, etc. ja estan fixades en el repositori DS i s'apliquen directament. El `DECISIONS.md` d'este mòdul (vore fitxer adjunt) recull únicament **regles de negoci del domini d'oposicions**, no decisions estètiques.

## Fitxers de referència d'este directori

| Fitxer | Contingut |
|---|---|
| `DocOposPAS.pdf` | Especificació funcional original (font primària, no modificar) |
| `PRODUCT.md` | Domini, mòduls, regles de negoci, objectiu de la migració |
| `DECISIONS.md` | Regles de negoci immutables/crítiques descobertes en l'auditoria |
| `CLAUDE.md` | Punt d'entrada — enllaça als anteriors + al Design System |
