# Convocatòries d'Oposicions PAS — Producte

> Idioma de treball: **Valencià**.
> Font: `DocOposPAS.pdf` (especificació funcional de l'aplicació ASP actual, dictada pel propietari de producte).

## Context

Aplicació de gestió de convocatòries de selecció de Personal d'Administració i Serveis (PAS) de la Universitat d'Alacant. Actualment en ASP; es migra a **.NET (backend) + Vue 3 (frontend)**, aprofitant per a adoptar el Design System UACloud (vore `ARCHITECTURE.md`).

Flux essencial: es crea una convocatòria → es genera un **expedient electrònic** contra l'API d'e-adm (administració electrònica de la UA) → finalitzat el termini de sol·licituds, es carreguen i revisen les sol·licituds (admissió/exclusió) → gestió d'exercicis, aules, calificacions → resultat final (aptes/bossa de treball).

## Usuaris i autenticació

- Autenticació contra **CAS** amb usuari = email institucional + contrasenya (consistent amb la resta de serveis UA — vore memòria de domini d'este repositori DS).
- **Actualment no hi ha gestió d'usuaris pròpia**: l'alta es fa directament en base de dades. **Objectiu de la migració**: implementar un menú de gestió d'usuaris i dels tipus de convocatòria que cada usuari pot gestionar.
- **Model de rols proposat pel propietari** (a validar/dissenyar en la migració):
  - Rol superior ("gestor jefe"): dona d'alta usuaris del seu tipus de convocatòria.
  - El propietari actual assignaria eixe rol superior a qui li ho indiquen.
  - No tots els usuaris tenen accés a tots els tipus de convocatòria.

## Tipus de convocatòria

| Tipus | Estat |
|---|---|
| Oposicions | Actiu |
| Promoció (barrat) | **Obsoleta** — mantindre consulta de dades històriques si es recuperen |
| Personal Tècnic per a projectes d'investigació | Actiu |
| Personal Investigador per a projectes d'investigació | Actiu |
| Borses | Actiu |
| Promoció interna | Actiu |
| Concurs de mèrits | Actiu |

Un usuari només veu els tipus de convocatòria per als quals té permís (filtre per checkbox en el desplegable de selecció).

## Problema UX heretat (a resoldre en la migració)

En l'aplicació antiga, l'usuari havia de **tornar sempre a la pàgina inicial** per a canviar de convocatòria activa. L'estat es mantenia amb variables de sessió (`idConvocatoria`, `idTipo`, `referencia`, entre altres no documentades). **La migració hauria de permetre canviar de convocatòria sense eixe salt de pantalla** (p. ex. un selector persistent, seguint el patró `ContextSelector` del Design System UACloud).

## Mòduls principals (menús)

Cadascun varia lleugerament segons el tipus de convocatòria:

1. **Convocatòries** — alta/modificació, integració e-adm, informes
2. **Aspirants** — càrrega, revisió, admissió/exclusió
3. **Tribunal** — membres, firmants, accés a e-adm
4. **Exercicis** — definició d'exercicis i subexercicis
5. **Aules** — gestió (no reserva) i distribució d'aspirants
6. **Calificacions** — notes, aptes, resultat final
7. **Borsa** — llistats de borsa de treball (no persistents)
8. **Informes** — extraccions transversals

## Traçabilitat (log d'accessos i canvis)

Existeix una taula de logs (qui accedeix, qui fa cada canvi) **infrautilitzada actualment**. El propietari vol **retomar-la** en la migració per a tindre traçabilitat completa — considerar-ho requisit no funcional de la nova aplicació, no un afegit opcional.

## Convocatòria — dades i cicle de vida

### Formulari (alta/modificació)

Camps obligatoris per a guardar: **referència** (única), **forma de selecció** (normalment "Concurs oposició"), **C/C/E** (Cos-Categoria-Escala), **unitat**.

Altres camps: subunitat (amb check de visibilitat), itinerari, grup/subgrup, infrarrepresentació per sexe, dates (publicació DOGV/BOE, inici/fi de sol·licituds), places per cupo d'accés (buit = sense places publicades per a eixe cupo), mèrits a valorar (actualment **no s'usen enlloc** — camp llegit del formulari però sense efecte funcional posterior).

### Cupos disponibles (a completar/confirmar en disseny de dades)

Acces lliure — cupo general, Acces lliure — cupo discapacitat, Acces lliure — cupo discapacitat intel·lectual, Promoció interna — cupo general, Promoció interna — cupo discapacitat.

**Nota d'auditoria**: el document marca com a pendent afegir el **cupo de discapacitat intel·lectual** al procés de càlcul de calificació final (vore `DECISIONS.md`).

### Gestió de taxes — "esdeveniment recaptador"

- Es crea quan existixen totes les dates necessàries de la convocatòria.
- Una vegada creat, **només es modifica** si canvien les dates o l'id de l'esdeveniment recaptador base.
- **Un canvi d'import de taxa NO regenera** un esdeveniment recaptador nou si la convocatòria i l'esdeveniment ja existien.

### Bloqueig tras expedient electrònic

Una vegada creat l'expedient electrònic en e-adm, **la convocatòria és públicament visible** i les seues dades **no es poden modificar**, EXCEPTE:
- Infrarrepresentació
- Places per cupo (a e-adm només s'envia el **tipus** de cupo, no el nombre de places)
- Mèrits a valorar (sense efecte funcional actual)

## Integració amb e-adm (administració electrònica)

Bloc d'accions que criden l'API d'e-adm des de la fitxa de convocatòria:

- **Crear expedient electrònic**: valida dades mínimes i crida l'API. Bloqueja modificacions posteriors (vore dalt).
- **Adjuntar document a l'expedient**: pujada de documents amb firma digital opcional (firmants: Rector, Gerent, membres del tribunal que actuen) i visibilitat opcional per als aspirants.
- **Establir període de reclamacions**: determina quins aspirants veuen el botó de reclamació en e-adm (per defecte, tots els admesos; es pot restringir per exercici superat).
- **Establir període de subsanació**
- **Canviar de fase** (vore màquina d'estats a continuació)
- **Establir dates de concurs**
- **Tancar expedient**

### Màquina d'estats — fases de la convocatòria

| Fase | Inici | Descripció |
|---|---|---|
| `SOLICITUDES` | Automàtic (data d'inici de sol·licituds) | Formulari d'inscripció obert |
| `ADMISION_PROV` | Automàtic (tras data fi de sol·licituds) | Es gestionen admesos/exclosos; es publica llistat provisional; s'estableix període de subsanació |
| `ADMISION_PROV_SUBS` | Manual (tras publicar llistat provisional) | Període en què els aspirants presenten subsanacions |
| `ADMISION_DEF` | Automàtic (tras fi del període de subsanació) | Es gestionen admesos/exclosos revisats; es publica llistat definitiu |
| `EJERCICIOS` | Manual (tras publicar llistat definitiu) | Realització d'exercicis |
| `CONCURSO` | Manual (botó "Canviar de fase") | Període de presentació de mèrits; baremació |
| `TODAS_COMPLETADAS` | Manual (botó "Canviar de fase") | Fi del procés |

**Regles vinculades a la pujada de documents de llistats** (crítiques, no negociables sense revisar impacte en e-adm):
- Pujar **"Llistat d'admesos i exclosos provisional"** → requerix fase `ADMISION_PROV` → estableix període de subsanació → envia estat ADMÉS/EXCLÒS provisional a e-adm → avança a `ADMISION_PROV_SUBS` → **esborra totes les marques de revisat**.
- Pujar **"Llistat d'admesos i exclosos definitiu"** → requerix fase `ADMISION_DEF` → envia estat definitiu a e-adm → avança a `EJERCICIOS` → **esborra totes les marques de revisat**.

## Gestió d'aspirants

- **Carregar sol·licituds**: llig dades des d'e-adm. En fase `SOLICITUDES`/`ADMISION_PROV` carrega noves sol·licituds (no sobreescriu una sol·licitud ja revisada). En `ADMISION_PROV_SUBS` només comprova si l'aspirant ha pujat documents nous o fet accions que requerixen revisió.
- **Modificar**: revisar/editar dades de l'aspirant + marcar ADMÉS/EXCLÒS. Navegació seqüencial + busca per DNI; prioritza mostrar primer les sol·licituds no revisades. Selecció múltiple de motius d'exclusió (CONTROL+clic); camp "Altres motius" només rellevant si el motiu "Altres" està marcat. **Avís automàtic si e-adm detecta canvis** (nou document, pagament) — EXCEPTE si l'aspirant fa una "instància genèrica" (no canvia l'estat de la sol·licitud, per tant no dispara l'avís).
- **Gestionar exclosos**: mateixa pantalla que "Modificar" filtrada a exclosos — flux recomanat tras publicar llistes provisionals.
- **Nova sol·licitud**: alta manual per a casos puntuals; **no queda registrada en e-adm** (cal escanejar i pujar com a document no visible per a completar l'expedient).

## Tribunal

- Alta de membres amb buscador (nom complet en format "COGNOMS, NOM", NIF o email).
- Camps: calidad (president, secretari, assessor... ampliable), tipus (titular/suplent), actua sí/no + motiu de baixa si no actua.
- Els membres que **actuen** són els que apareixen com a firmants possibles de documents.
- **Accés a documentació d'e-adm**: data de constitució + data de disolució opcional (buida = accés fins al tancament de la convocatòria). **Els canvis triguen 1 dia a tindre efecte** — restricció coneguda de la integració, no un bug de l'app.
- Enviament d'email als membres amb accés, amb enllaç a l'expedient.

## Exercicis

- Cada convocatòria té **exercicis** (identificats per orde + tipus) compostos de **subexercicis** propis.
- Regla estructural: **qualsevol fase es considera un exercici**, incloent la fase de baremació de mèrits.
- Camps de l'exercici: descripció, obligatori sí/no, puntuació màxima, prioritat de desempat (1 = primer criteri; si persistix l'empat, es passa al següent), data de realització, distribució per lletra de sorteig (GV) o per idioma (té prioritat sobre la lletra), valors de tall per cupo.
- Camps del subexercici: descripció, puntuació màxima (pot diferir de l'exercici pare), **si és tipus test** (afecta la lectura de notes des de disc), nota de tall per cupo.
- **Nota històrica**: fa un temps les oposicions tenien proves d'idioma/valencià independents; ara **només 3 exercicis** i eixes proves són mèrits valorables en fase de concurs.
- **Lletres de distribució**: historial de lletres oficials de la Generalitat Valenciana (lletra + any + data de resolució) per a sortejar l'orde d'actuació.
- **Identificació d'exercici/subexercici**: es fa per orde + tipus (ambdós obligatoris); si un exercici només té un subexercici i no cal matisar-ne el tipus, s'usa l'opció "--- Únic ---". Botó "Eliminar exercici" esborra en cascada tots els seus subexercicis.
- **Informe d'exercicis**: mostra les dades de cada exercici i els seus subexercicis (camps descrits dalt).

## Aules

**Este mòdul NO reserva aules** — cal confirmar disponibilitat amb Gestió d'Espais abans de seleccionar-les ací.

- **Distribució general**: semiautomàtica, per aula seleccionada; recalcula el rang d'aspirants que hi caben; la capacitat "Disponible" (no la capacitat informativa de l'aula) és la que s'edita per exercici.
- **Distribució individual**: canvis puntuals aspirant↔aula; el desplegable d'aules només mostra les ja seleccionades en la distribució general.
- En ambdós casos només apareixen aspirants que han superat la prova anterior (o admesos definitius per al primer exercici).
- Distribució per lletra GV o per idioma té prioritat sobre l'assignació per defecte.
- Informes: complet (marca `D` = cupo discapacitat, `*` = assignació individual), reduït (només distribució per defecte, no reflectix canvis individuals), web complet/reduït (imprimibles), llistes examinadors (amb casella d'assistència), llistes de porta (RTF, per a penjar a l'entrada de l'aula).

## Calificacions

Tres seccions encadenades:

1. **Calificació de subexercicis**: des de fitxer Excel (format fix de la lectora de fulls test del Servei d'Informàtica), manual, o individual per DNI.
   - **Obtindre notes de disc**: la primera lectura d'un exercici no requerix cap dada addicional. En llegir el fitxer es mostra un xicotet informe amb la informació extreta; si hi ha algun problema llegint algun DNI, es mostra mitjançant un missatge (**sense detall estructurat per fila** — a millorar en el nou disseny, vore `UX-AUDIT.md`).
   - **Rectificacions**: si es torna a pujar un fitxer, cal indicar si és una rectificació + motiu. Regla crítica: **l'opció "eliminar els no coincidents" només s'ha d'usar en una revisió d'examen** (esborra calificacions existents sense suport en les noves notes) — **mai en una ampliació de notes**, perquè eliminaria erròniament aspirants ja calificats que no apareixen en el fitxer nou.
   - Esborrar la calificació d'un subexercici **esborra en cascada** la de l'exercici i la de la convocatòria.
2. **Calificació d'exercicis**: "Establir aptes" (requerix calificacions de tots els subexercicis previs). Els aptes d'un exercici són els que apareixen en els llistats del següent.
3. **Calificació final de la convocatòria**: llig els aptes de l'últim exercici → suma notes per cupo → ordena per nota → desempat per prioritat d'exercici → aplica nombre de places per cupo.
   - **Regla de transferència**: si el cupo de discapacitat no s'omple, les places sobrants **es transferixen al cupo general** (també aplica al cupo de promoció interna).
   - **Pendent conegut**: falta incorporar el cupo de discapacitat intel·lectual a este càlcul (vore `DECISIONS.md`).

## Borsa

Genera llistats d'aspirants en borsa de treball tras l'oposició, segons: exercici que cal haver aprovat (obligatori per als informes "Borsa"/"Borsa reduïda"), infrarrepresentació de sexe per a desempat, lletra de desempat final (per defecte "A").

**Limitació coneguda i rellevant per a la migració**: els llistats es generen a l'instant i **no es guarden** — no es pot gestionar posteriorment qui ha sigut cridat ni si ha acceptat/rebutjat el lloc. Considerar-ho com a possible millora funcional real (no merament visual) en la nova aplicació.

## Informes

Transversals a diversos mòduls: informe bàsic de convocatòria, informe e-adm (rèplica de dades d'e-adm), informes de convocatòries (Excel/web), a banda dels informes específics d'aules/calificacions/borsa ja descrits en les seues seccions.

## Objectiu de la migració (resum)

1. Preservar totes les regles de negoci i la màquina d'estats descrites ací (són la font de veritat — no reinterpretar sense confirmar amb el propietari).
2. Substituir la gestió manual d'usuaris en BD per un mòdul propi amb rols per tipus de convocatòria.
3. Resoldre el problema UX del canvi de convocatòria sense tornar a la pàgina inicial.
4. Retomar la traçabilitat de logs.
5. Adoptar el Design System UACloud (components, tokens, patrons d'interacció) — vore `ARCHITECTURE.md`.
6. Evaluar (amb el propietari, no per defecte) si cal persistir els llistats de borsa per a gestionar-ne el seguiment.
