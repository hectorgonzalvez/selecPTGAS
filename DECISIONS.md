# Convocatòries d'Oposicions PAS — Decisions de negoci

> A diferència del `DECISIONS.md` del repositori DS arrel (decisions **visuals**), este fitxer recull **regles de negoci del domini** extretes de `DocOposPAS.pdf`. Són regles funcionals que la migració ha de preservar exactament, llevat que el propietari de producte les revise explícitament — **no reinterpretar-les per intuïció**.

## Regles preses (NO reobrir sense confirmació del propietari)

### Cicle de vida de la convocatòria

- **Bloqueig tras expedient electrònic**: una vegada creat, només es poden modificar 3 camps: infrarrepresentació, places per cupo (a e-adm només s'envia el tipus de cupo, no la xifra), mèrits a valorar (sense efecte funcional actual).
- **Esdeveniment recaptador (taxes)**: es crea quan existixen totes les dates de la convocatòria; només es regenera si canvien les dates o l'id base; **un canvi d'import NO el regenera**.
- **Pujar llistat provisional** requerix fase `ADMISION_PROV`, dispara: període de subsanació, enviament d'estat provisional a e-adm, avanç a `ADMISION_PROV_SUBS`, **esborrat de totes les marques de revisat**.
- **Pujar llistat definitiu** requerix fase `ADMISION_DEF`, dispara: enviament d'estat definitiu, avanç a `EJERCICIOS`, **esborrat de totes les marques de revisat**.
- **Avís automàtic de canvis en e-adm** (nou document/pagament de l'aspirant) NO es dispara si el canvi prové d'una "instància genèrica" — només d'accions que modifiquen l'estat de la sol·licitud.

### Càlcul de calificació final

- Suma la nota de tots els exercicis **per cupo**, ordena per nota, desempata per la prioritat d'exercici indicada (1r criteri, després 2n, etc.).
- **Transferència de places sobrants**: si el cupo de discapacitat no s'omple, les places sobrants passen al cupo general (i també aplica al cupo de promoció interna).
- **Pendent d'implementar** (marcat explícitament en el document original): afegir el **cupo de discapacitat intel·lectual** al càlcul — actualment no hi ha lògica de transferència ni de cupo definida per a este cas. Confirmar amb el propietari abans de dissenyar-lo, no assumir el mateix comportament que el cupo de discapacitat general.

### Rectificació de calificacions

- **"Eliminar els no coincidents"** al pujar un fitxer de notes: només s'ha d'usar quan es tracta d'una **revisió d'examen** (el fitxer nou és la font completa i substitutiva). **Mai** en una ampliació de notes (el fitxer nou només amplia, no substituïx) — usar-ho ahí esborraria calificacions vàlides que no apareixen en el fitxer nou.
- Esborrar la calificació d'un subexercici **esborra en cascada** la de l'exercici i la de la convocatòria — no és un esborrat aïllat.

### Aules

- El mòdul **no reserva aules** — és responsabilitat de l'usuari confirmar disponibilitat amb Gestió d'Espais abans de seleccionar-les. No implementar cap validació de disponibilitat real sense that integració explícita.
- La capacitat "informativa" de l'aula i la capacitat "disponible" per a un exercici concret **són camps diferents** — la disponible és l'editable per exercici.
- La distribució per lletra (sorteig GV) o per idioma té **prioritat** sobre l'assignació per defecte/individual.

### Tribunal

- Els canvis en l'accés a documentació d'e-adm **triguen 1 dia** a tindre efecte — restricció coneguda de la integració, no comunicar-la a l'usuari com un bug reparable a curt termini.

### Traçabilitat

- **Retomar el log d'accessos i canvis és un requisit explícit** del propietari de producte per a la nova aplicació, no una millora opcional a descartar per abast/temps.

## Decisions obertes (pendents de definir en la migració)

- **Model de rols i permisos**: el propietari proposa un rol "gestor jefe" per tipus de convocatòria més un rol superior que l'assigna. Cal dissenyar-ho com a sistema (taula de permisos usuari↔tipus de convocatòria), no com a llista fixa en codi.
- **Canvi de convocatòria activa sense tornar a la pantalla inicial**: definir el patró d'UI (candidat: `ContextSelector` del Design System UACloud) i com es substituïxen les variables de sessió antigues (`idConvocatoria`, `idTipo`, `referencia`...).
- **Persistència de llistats de borsa de treball**: actualment no es guarden (es regeneren a cada informe). Decidir amb el propietari si la migració ha d'afegir seguiment de crides/acceptacions — és una ampliació funcional, no un requisit confirmat.
- **Dades històriques de "Promoció (barrat)"**: tipus obsolet, cal decidir si es migren dades antigues (condicionat a si el propietari les recupera) o només es garantix consulta de lectura.
