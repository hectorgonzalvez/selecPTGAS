# Convocatòries d'Oposicions PAS — Auditoria UX del producte actual

> Idioma de treball: **Valencià**.
> Base: `seleccio-oposPTGAS.pdf` (especificació funcional del sistema ASP actual) + `PRODUCT.md` + `DECISIONS.md`.
> Objectiu d'este document: reunir en un sol lloc els problemes d'usabilitat detectats en l'aplicació heretada, perquè servisquen d'entrada per a la planificació del disseny del nou frontend Vue + DS UACloud. **No és una llista de bugs** — són patrons d'interacció a decidir conscientment si es reprodueixen, es milloren o es descarten en la migració.

---

## 1. Navegació i context

### 1.1 Canvi de convocatòria activa (ja documentat com a prioritari)
L'usuari ha de tornar sempre a la pantalla inicial per a canviar de convocatòria/tipus actius; l'estat viu en variables de sessió (`idConvocatoria`, `idTipo`, `referencia`...). **Impacte**: trenca el flux de treball quan un gestor porta diverses convocatòries alhora. Candidat de disseny: `ContextSelector` persistent del DS (vore `DECISIONS.md` § decisions obertes).

### 1.2 Filtre de tipus de convocatòria com a "petit filtre" sobre un desplegable
El filtre de tipus és una checkbox discreta damunt del desplegable de convocatòries, no un component de filtratge visible/explícit. En una taula amb molts tipus (7 tipus documentats en `PRODUCT.md`), este patró es queda curt — considerar un selector de tipus explícit (tabs o segmented control) abans del selector de convocatòria concreta.

### 1.3 Navegació d'exercicis/subexercicis per desplegables amb identificador tècnic
Exercicis i subexercicis s'identifiquen internament per "orde + tipus", i l'usuari els selecciona en desplegables per a modificar-los (sense vista de llista/taula prèvia). **Impacte**: per a convocatòries amb diversos exercicis i subexercicis (fases + baremació de mèrits inclosos com a "exercicis"), açò obliga a recordar posicions en compte de veure una jerarquia. Migració recomanada: vista d'arbre o taula expandible exercici→subexercicis, amb els desplegables reservats només per a l'alta ràpida.

---

## 2. Formularis i entrada de dades

### 2.1 Selecció múltiple de motius d'exclusió via CTRL+clic
Patró d'interacció d'escriptori clàssic (llista `<select multiple>`), no accessible ni descobrible (no hi ha cap indicació visual que calga CTRL) i inusable en tàctil. **Migració**: substituir per grup de checkboxes (`ua-checkbox` dins `<fieldset>`+`<legend>`, ja normativitzat en `docs/design-system.md`).

### 2.2 Camp "Altres motius" amb rellevància condicional no reflectida en l'estat del camp
El camp de text lliure només té sentit quan el motiu "Altres" està marcat, però es descriu com sempre visible. **Migració**: ocultar/deshabilitar dinàmicament + `aria-describedby` explicant la dependència (patró de formulari condicional, vore secció Formularis del DS).

### 2.3 Camps opcionals vs. obligatoris no diferenciats visualment en la creació de convocatòria
El formulari permet guardar amb dades parcials, però només 4 camps són obligatoris (referència, forma de selecció, C/C/E, unitat) enmig d'una desena de camps opcionals (subunitat, itinerari, grup/subgrup, infrarrepresentació, dates, places per cupo, mèrits). **Impacte**: sense agrupació visual clara, l'usuari no distingeix què cal omplir ara i què es pot completar després. Migració: agrupar per seccions col·lapsables ("Dades bàsiques" obligatòries sempre visibles / "Dades ampliades" opcionals) + asterisc obligatori consistent amb el patró `label-required` del DS.

### 2.4 Notes de tall / puntuacions repetides per cupo sense vista consolidada
Cada exercici i subexercici demana "valors de tall" o "nota de corte" **per cada cupo** de la convocatòria (fins a 5 cupos documentats). El formulari original ho tracta com a camps individuals per cupo. Migració: taula compacta cupo×valor en compte de camps solts repetits, per a evitar errors d'introducció i facilitar la comparació.

---

## 3. Accions irreversibles i efectes col·laterals ocults

### 3.1 Pujar un llistat d'admesos/exclosos dispara efectes en cascada invisibles al moment de l'acció
Pujar el "Llistat d'admesos i exclosos provisional" o el "definitiu" (acció que sembla, per nom, un simple upload de document) en realitat: envia estats a e-adm, avança la fase de la convocatòria, i **esborra totes les marques de revisat** dels aspirants (vore `DECISIONS.md`). Cap d'estos efectes és evident des del botó d'upload. **Crític per al disseny**: esta acció necessita un `showConfirmDialog` detallat (no el genèric d'esborrar) que llisteEXPLICITAMENT els efectes ("s'enviarà l'estat a e-adm", "s'esborraran N marques de revisat", "la convocatòria avançarà a fase X") abans de confirmar — no un simple "Estàs segur?".

### 3.2 "Eliminar els no coincidents" en la pujada de notes és una trampa d'un sol clic
La mateixa pantalla de pujada de notes servix tant per a "ampliació" com per a "revisió d'examen", i l'opció destructiva (esborrar calificacions sense suport en el fitxer nou) és una casella més del formulari, sense separació visual del flux normal. **Migració**: separar els dos fluxos explícitament (potser com dos botons/accions clarament diferenciades, amb el destructiu darrere d'un `btn-destructive` + confirmació), en lloc d'una casella opcional dins del mateix formulari.

### 3.3 Canvi d'import de taxa que no regenera l'esdeveniment recaptador
Regla de negoci correcta (vore `DECISIONS.md`) però **invisible per a l'usuari**: si canvia l'import de taxa sense canviar dates, no passa res visualment perquè no es regenera cap esdeveniment. Sense feedback, l'usuari pot pensar que el canvi no s'ha guardat. Migració: confirmar explícitament en UI que el canvi d'import s'ha aplicat, encara que no regenere l'esdeveniment (missatge tipus toast informatiu diferenciat del "guardat amb èxit" habitual).

### 3.4 Bloqueig de convocatòria tras expedient electrònic sense indicació prèvia clara
Una vegada creat l'expedient, la majoria de camps queden bloquejats permanentment (excepte 3). Si la UI actual no distingix visualment quins camps són editables després del bloqueig, l'usuari pot intentar editar-los i trobar un error tardà. Migració: bloquejar visualment (readonly + icona de cadenat + tooltip "Bloquejat des de la creació de l'expedient") els camps no editables, en lloc de deixar-ho descobrir per prova/error.

---

## 4. Feedback i estats del sistema

### 4.1 Avís de canvis d'e-adm només visible en accedir a "Modificar aspirants"
No hi ha notificació proactiva (ni badge, ni alerta persistent) quan e-adm detecta un canvi (nou document, pagament) en una sol·licitud — l'usuari només ho descobrix si entra en la pantalla concreta. Migració: strip d'alertes contextuals (patró ja normativitzat en `docs/design-system.md` § "Strip d'alertes contextuals") amb recompte d'aspirants amb canvis pendents de revisar, visible des del dashboard de la convocatòria.

### 4.2 Errors de lectura de fitxer Excel reportats com a "missatge" genèric
Quan la lectura de notes des de disc detecta un problema en un DNI, es mostra "mitjançant un missatge" sense estructura (vore `PRODUCT.md` § Calificacions). No hi ha llista d'errors per fila, ni exportació de l'informe d'errors. Migració: taula d'errors amb fila afectada + motiu + acció (ometre/corregir), seguint el patró `UATable` amb estat d'error per fila.

### 4.3 Canvis d'accés del tribunal a e-adm amb retard d'1 dia, sense advertiment en UI
Es documenta com a restricció coneguda de la integració, però no hi ha evidència que l'usuari reba cap avís en pantalla en guardar el canvi. Migració: mostrar explícitament "Este canvi tindrà efecte en un termini de 24h" en guardar (evita tiquets de suport per confusió).

### 4.4 Capacitat "informativa" vs. "disponible" de l'aula: dos camps semblants sense distinció visual clara
Documentat com a distinció funcional important (`DECISIONS.md`), però el risc UX és alt: dos números semblants en la mateixa pantalla, un editable per exercici i l'altre no. Migració: distingir amb pes tipogràfic/icona/tooltip explícit ("Capacitat de l'aula" de referència, en gris, vs. "Capacitat disponible per a este exercici", editable, en text principal).

---

## 5. Buits funcionals (no purament visuals, rellevants per al disseny)

- **Gestió d'usuaris i permisos inexistent en UI** (alta directa en BD) — cal dissenyar el mòdul complet de gestió d'usuaris/rols per tipus de convocatòria (vore `PRODUCT.md` § Usuaris, `DECISIONS.md` § decisions obertes).
- **Llistats de borsa no persistents** — es regeneren a cada informe; no hi ha manera de fer seguiment de qui ha sigut cridat/acceptat/rebutjat. Decisió pendent amb el propietari sobre si afegir persistència (vore `DECISIONS.md`).
- **Log d'auditoria infrautilitzat** — existix la taula però no s'exposa en cap pantalla; cal dissenyar una vista de traçabilitat (qui/què/quan) com a mòdul de primer nivell, no un afegit.
- **Mòdul d'aules sense integració amb Gestió d'Espais** — depén d'una comprovació manual externa a l'app; el disseny hauria de deixar clar en la UI que la disponibilitat NO està verificada pel sistema (avís permanent, no només informatiu al peu).

---

## 6. Patrons a favor (a preservar, no són problemes)

- **Navegació seqüencial + busca per DNI** en "Modificar aspirants", amb priorització de sol·licituds no revisades — bon patró de cua de treball, mantindre en el nou disseny (candidat: integrar amb `UADetailDrawer` per revisar sense perdre la llista).
- **Pre-càrrega de dades en editar** (aules, exercicis) — evita reintroduir dades ja conegudes; mantindre.
- **Distinció clara de fases automàtiques vs. manuals** en la màquina d'estats — bona base per a un componente de progrés visual (stepper/timeline) de la convocatòria en el nou frontend.

---

## 7. Implicacions directes per al disseny del frontend

1. **Accions amb efectes en cascada** (§3) necessiten un component de confirmació enriquit (llista d'efectes, no un simple "segur?") — candidat a proposar com a extensió de `showConfirmDialog` si el DS no el cobrix ja.
2. **Selector de convocatòria persistent** (§1.1) és bloquejant per a qualsevol pantalla — decidir-ho pronte en el disseny de layout, no com a millora posterior.
3. **Estat de la convocatòria (fase actual)** hauria de ser visible sempre (topbar/sidebar context), no només en la pantalla de canvi de fase — reforça la necessitat del `ContextSelector`.
4. **Taula d'errors estructurada** (§4.2) i **strip d'alertes** (§4.1) són reutilitzables entre mòduls (aspirants, calificacions) — dissenyar-los com a components compartits des del principi.
5. **Distinció visual de camps bloquejats/condicionals** (§2.2, §3.4) s'ha de resoldre a nivell de patró de formulari, no cas a cas per pantalla.
