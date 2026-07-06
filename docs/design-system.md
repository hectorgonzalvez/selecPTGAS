# UACloud Design System — Regles operatives

Sistema de disseny del Campus Virtual UA. Idioma de treball: **Valencià**.

---

## Entrada ràpida

```html
<!-- Un sol link CSS + un sol script JS cobreix TOT -->
<link rel="stylesheet" href="../ua-ds.css">   <!-- tokens + tots els components -->
<script src="../ua-ds.js"></script>             <!-- totes les classes JS -->
```

Fonts externes (sempre al `<head>` ABANS de `ua-ds.css`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">
```

Template complet: `templates/modul-base.html`

---

## Colors — regles immutables

| Token | Valor | Ús |
|---|---|---|
| `--color-primary` | #005682 (oklch 43% 0.10 241) | Botons primaris, links, focus |
| `--topbar-bg` | = `--color-primary` | Topbar. MAI altre color. |
| `--color-brand-accent` | #BA5A00 (oklch 52% 0.16 47) | Badge notificació topbar, accents |
| `--color-pause-*` | viola hue 280 | Estat "En pausa" / "Esperant usuari". bg/border/text/icon/solid |

- **MAI** hardcodejar colors. Sempre `var(--token)`.
- **NO usar** #003B7A (color primari antic) ni #E87722 (taronja incorrecte, contrast 2.9:1).
- **NO usar** `--color-brand-accent` com a botó principal — és accent decoratiu.
- Espai de color: **OKLCH** per a qualsevol valor nou.

---

## Tipografia

- Família: **Atkinson Hyperlegible** (Google Fonts)
- Mida base: `var(--font-size-base)` = 17px
- Pesos: `var(--font-weight-regular)` (400) i `var(--font-weight-bold)` (700) — cap altre
- **Mai text per sota de** `var(--font-size-xs)` = 13px

---

## Layout de pàgina (patró canònic — NO modificar)

```css
.ua-page    { height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
.ua-body    { flex: 1; overflow: hidden; min-height: 0; display: flex; }
.ua-sidebar { overflow-y: auto; min-height: 0; }
.ua-main    { flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column; }
.ua-main > * { flex-shrink: 0; }
```

- **Topbar**: `<header class="ld-topbar">` — altura 52px, sempre `var(--topbar-bg)`.
- **Sidebar**: `<nav class="ld-sidebar ua-sidebar">` — 240px (`--sidebar-width`), blanc. (Nota: `.ld-sidebar` fa 224px només dins la vitrina de documentació d'`index.html` — no usar eixe valor en mòduls reals.)
- **Ítem actiu sidebar**: classe `ld-sidebar__item--active` + `aria-current="page"`.
- **Peu sidebar** (Ajuda del mòdul): `<div class="ld-sidebar__footer">` — sticky al fons via `margin-top: auto`.

### Sidebar rail 769–1024px (D-055 — decidit)

Entre 769px i 1024px (tablet), el sidebar es col·lapsa automàticament a una franja d'icones de 64px (`--sidebar-rail-width`), en lloc de mantindre els 240px estàtics. Per davall de 768px continua el patró mòbil C2 (drawer + bottom nav) sense canvis; per damunt de 1024px, sidebar estàtic 240px com sempre.

- **CSS**: bloc canònic **local a cada demo** (mai al bundle `ua-ds.css`) — el `<style>` inline del demo s'imprimeix després i sobreescriuria en silenci qualsevol regla del bundle amb la mateixa especificitat. Copiar el bloc de `demos/sollicituds.html` o `demos/meues-opcions.html`.
- **JS**: `toggleSidebar()`, `toggleNavAcc()`, `toggleSidebarRail()`, `openRailFlyout()`/`closeRailFlyout()` vénen de `components/layout/layout.js` (bundle) — mai redefinir-los inline al demo.
- **Markup obligatori**: `data-sidebar-rail` al `<nav id="sidebar">` + botó `#sidebar-rail-toggle` (toggle manual rail↔expandit, persisteix a `localStorage`).
- **Submenús (acordió 1 nivell)**: en rail, `toggleNavAcc()` obri un flyout lateral (`#rail-flyout`) en lloc d'expandir inline — no hi ha espai. **Important**: si un submenú està obert per defecte (`.ld-nav-sub.open`), cal forçar `.ua-sidebar:not(.is-expanded-override) .ld-nav-sub { max-height: 0 !important; }` al bloc rail — altrament les subopcions queden visibles dins del sidebar estret encara que el flyout també s'òbriga (bug detectat i corregit).
- **Badges de recompte**: en rail es converteixen en punt (sense xifra visible); la xifra roman accessible via `aria-label` del botó.
- **Text de l'ítem** (`.ni-label`): mai `display:none` — s'oculta visualment amb tècnica `clip`/`sr-only`, sempre accessible a lectors de pantalla.
- **Widgets extra del sidebar** (ContextSelector, resum de perfil): cal amagar-los explícitament en rail (no caben en 64px) — vore `.ua-sidebar__ctx` a `sollicituds.html`/`sales-virtuals.html`.

### Centrat del contingut — mòduls de configuració/compte

Per a pàgines de configuració (compte, perfil, ajustes), on el contingut és estret i llegible, usar el truc `max()` al `padding` per centrar sense canviar HTML. Màx. recomanat: **860px**.

```css
/* Capçalera: fons i border-bottom a tota l'amplada; contingut centrat a 860px */
.ua-page-header {
  padding: var(--space-6) max(var(--space-6), calc((100% - 860px) / 2)) var(--space-5);
}
/* Àrea de contingut: cards centrades al mateix eix que la capçalera */
.ua-content-area {
  padding: var(--space-6) max(var(--space-6), calc((100% - 860px) / 2));
}
/* Mòbil: sobreescriure amb padding fix */
@media (max-width: 768px) {
  .ua-page-header  { padding: var(--space-4) var(--space-4) var(--space-3); }
  .ua-content-area { padding: var(--space-4); }
}
```

**Com funciona**: quan `ua-main` > 908px, `calc((100% - 860px) / 2)` supera `var(--space-6)` i el padding actua com a marge de centrat. Sota 908px, `max()` retorna `var(--space-6)` — padding normal.

**Errors a evitar:**
- `max-width: 760px` sense `margin: 0 auto` → deixa espai buit a la dreta
- `width: 100%` sense `max-width` → files de dades i inputs excessivament amples
- `max-width` + `margin: auto` a `ua-content-area` sense ajustar `ua-page-header` → títol i cards desalineats

**Mòduls que NO han de centrar** (usen la pantalla completa): taules de dades (`sollicituds`, sales virtuals), dashboards, kanban. Per a aquests, `ua-content-area` sense centrat o amb padding mínim.

---

## Cards i taules (shadow-only — regla general)

```css
/* Qualsevol contenidor passiu (card, panell, table-wrap) */
box-shadow: var(--shadow-md);   /* SENSE border exterior */
```

- `.ua-content-card`: shadow-only. El `__header` NO porta `border-bottom`.
- `.table-wrap` dins d'un `.ua-content-card`: `border: none; border-radius: 0; box-shadow: none;`
- **Hover de fila**: `var(--color-primary-subtle)` — mai gris neutre.
- **KPI cards**: `border-left: 4px solid` com a accent + shadow-only. Hover: `translateY(-2px)`. Grid `repeat(N, 1fr)` en desktop; **`1fr` en mòbil** (mai 2 columnes amb 5+ cards).

---

## Botons (4 variants semàntiques — no n'hi ha d'altres)

```html
<button type="button" class="btn btn-primary">Acció principal</button>
<button type="button" class="btn btn-secondary">Acció secundària</button>
<button type="button" class="btn btn-ghost">Acció terciària</button>
<button type="button" class="btn btn-destructive">Elimina</button>
```

- Mides: `btn-sm`, default, `btn-lg`.
- Loading: afegir `btn--loading`.
- **Botons destructius**: SEMPRE precedits de `showConfirmDialog(...)` — mai acció directa.
- **Botons d'icona** (sense text): `aria-label` OBLIGATORI.

---

## Icones — tokens semàntics (Vue) / webfont (HTML)

### Components Vue d'aplicació — SEMPRE via token

```vue
<UaIcon name="afig" />                                      <!-- decorativa -->
<UaIcon name="tanca" :aria-hidden="false" aria-label="..." />  <!-- significativa -->
```

- **MAI** `import { IconPlus } from '@tabler/icons-vue'` en components d'aplicació.
- **MAI** `<IconPlus />` directament — sempre `<UaIcon name="afig" />`.
- Font de veritat: `src/design-system/icon-tokens.js` — tres exports:
  - `ICON_TOKENS` (61 tokens, 5 categories, formes verbals valencianes per a accions)
  - `ICON_GROUPS` (agrupació per a la documentació)
  - `MODULE_ICONS` (12 mòduls UACloud: `{ key, lib, name, label }`)
- Per afegir un token: editar `ICON_TOKENS` + `ICON_GROUPS` + `IconTokenName` (d.ts).
- Per modificar una icona de mòdul: editar `MODULE_ICONS` — els grids de `index.html` es regeneren sols.

### HTML pur / demos — webfont Tabler

```html
<i class="ti ti-plus" aria-hidden="true"></i>   <!-- sempre aria-hidden -->
```

- El webfont és la implementació HTML. `UaIcon` requereix Vue.
- Els grids de tokens i de mòduls a `index.html` llegeixen `icon-tokens.js` via `<script type="module">` → s'actualitzen automàticament quan canvia el fitxer.

### Regles d'accessibilitat

- Icona decorativa (té text adjacent): `aria-hidden="true"` a l'`<i>` o prop `:aria-hidden="true"` a `<UaIcon>`.
- Icona significativa (únic contingut visible): `aria-label` al botó contenidor (HTML) o `:aria-hidden="false" aria-label="..."` a `<UaIcon>`.

---

## Formularis (WCAG 3.3.1 obligatori)

```html
<div class="field">
  <label class="label" for="[id]">Nom <span class="label-required" aria-hidden="true">*</span></label>
  <input type="text" id="[id]" class="input"
    required aria-required="true"
    aria-invalid="false"
    aria-describedby="[id]-error">
  <p class="field-error" id="[id]-error" role="alert" hidden>
    <i class="ti ti-alert-circle" aria-hidden="true"></i>
    [Missatge descriptiu — mai genèric com "camp obligatori"]
  </p>
</div>
```

En error: `aria-invalid="true"` + treure `hidden` del `field-error`. Validació en temps real (event `input`/`blur`), mai esperar al `submit`.

---

## Components JS disponibles

| Classe / Funció | Descripció |
|---|---|
| `showToast(type, title, msg)` | Toast 5s. Types: `success|error|warning|info` |
| `openModal(id, triggerEl)` / `closeModal(id)` | Modal accesible |
| `showConfirmDialog({...})` | Confirmació per a accions destructives |
| `new UATable(el, opts)` | Taula avançada: selecció per checkbox + Shift+rang, export CSV, expandibles, barra d'accions en lot |
| `uaTable.onRerender()` | Cridar després de re-renderitzar el tbody (paginació/filtratge dinàmic) — re-sincronitza checks i barra de selecció |
| `new UAPagination(el, opts)` | Paginació standalone |
| `new UACalendar(el, opts)` | Calendari mensual |
| `new UAKanban(el, opts)` | Tauler Kanban amb DnD |
| `openHelpPanel()` / `closeHelpPanel()` | Panel d'ajuda lateral |
| `UATable.skelRows(n, widths)` | Skeleton in-table durant càrrega |
| `new UAViewToggle({ tableEl, gridEl, btnLlistaEl, btnMosaicEl })` | Alternança llista/mosaic. `.set('llista'|'mosaic')` |
| `new UADetailDrawer({ panelEl, overlayEl, onClose? })` | Drawer lateral dret. `.open()` / `.close()` |
| `new UASavedViews({ key, demos, chipsEl, saveBtnEl, saveFormEl, saveInputEl, getFiltre, suggestNom, onApply })` | Vistes guardades. `.render()`, `.matchActual(f)`, `.apply(id)`, `.initSave()`, `.getDefault()` |
| `uaT(clau, fallback)` | Traducció i18n. Fallback SEMPRE el text valencià literal — mai buit |
| `uaI18nApply(root?)` | Escaneja `[data-i18n]` dins `root` i substitueix `textContent`/atribut (`data-i18n-attr`) |

---

## i18n — `uaT()` (D-060 fase 1 — infraestructura implementada)

`locales/va.json` (claus planes, `component.element.variant`) s'incrusta com a `window.UA_LOCALES['va']` dins `ua-ds.js` en temps de build (`node build/build-ds.js`) — evita `fetch`/CORS amb `file://`.

- **Ús en components** (majoria de text es genera imperativament en JS): `uaT('table.bulk.exportCsv', 'Exporta CSV')` — el segon argument és sempre el fallback en valencià literal.
- **Ús declaratiu en HTML estàtic**: `<span data-i18n="kpi.pendents">Pendents</span>`, aplicat per `uaI18nApply()` en `DOMContentLoaded`. Per a contingut generat DESPRÉS (re-render), cridar `uaI18nApply(nouEl)` manualment.
- **Demos exemptes**: `demos/*.html` mai porten `data-i18n` ni criden `uaT()` — excepció ja documentada.
- Qualsevol canvi a `locales/*.json` exigeix `node build/build-ds.js` per regenerar el bundle.

---

## Taula avançada — checkboxes i selecció de files

Afegir `data-ua-table` a la `<table>` per activar `UATable` automàticament.

```html
<table class="table" data-ua-table>
  <thead>
    <tr>
      <th class="table-th table-th--check" scope="col">
        <input type="checkbox" class="table-check-all" aria-label="Selecciona totes les files visibles">
      </th>
      <!-- resta de capçaleres -->
    </tr>
  </thead>
  <tbody>
    <tr data-row-id="id-únic">
      <td class="table-td table-td--check">
        <input type="checkbox" class="table-check-row" aria-label="Selecciona la fila [descripció]">
      </td>
      <!-- resta de cel·les -->
    </tr>
  </tbody>
</table>
```

- `data-row-id` a cada `<tr>` — identificador únic per a la selecció i el bulk action.
- Shift+clic: selecciona rang de files.
- La barra de bulk actions apareix automàticament quan la selecció > 0.
- Quan el tbody es re-renderitza (paginació, filtratge dinàmic), cridar `tableEl._uaTable.onRerender()` per re-sincronitzar els checks.

---

## Columnes de data — temps relatiu

Les columnes de data d'entrada i d'últim moviment han de mostrar **temps relatiu** (ex. "fa 3 dies") en lloc de la data crua. La data exacta va al `title` (tooltip) i al detall/modal de la fila.

```js
// Helper canònic — copiar a table.js de cada mòdul
function tempsRelatiu(dataStr) {
  if (!dataStr) return '—';
  const diffD = Math.floor((Date.now() - new Date(dataStr + 'T12:00:00')) / 86400000);
  if (diffD === 0)  return 'avui';
  if (diffD === 1)  return 'fa 1 dia';
  if (diffD < 7)    return `fa ${diffD} dies`;
  const setm = Math.floor(diffD / 7);
  if (setm === 1)   return 'fa 1 setmana';
  if (setm < 5)     return `fa ${setm} setmanes`;
  const mes = Math.floor(diffD / 30);
  return mes === 1 ? 'fa 1 mes' : `fa ${mes} mesos`;
}
```

```html
<!-- Ús a la cel·la -->
<span style="font-size:var(--font-size-xs);color:var(--color-text-secondary)"
      title="2026-05-14">${tempsRelatiu('2026-05-14')}</span>
```

---

## Columna "Últim moviment" — model amb acció

La columna mostra 3 línies en **este ordre**: temps relatiu → actor → etiqueta d'acció.

```js
// Model del camp ultimMoviment
{ data: 'YYYY-MM-DD', actor: 'Nom Cognom', accio: 'presenta' }
// accio: 'presenta' | 'missatge' | 'adjunt' | 'reobre'
```

| `accio` | Etiqueta visible | Quan |
|---|---|---|
| `'presenta'` | Nova sol·licitud | Creació inicial — `actor:'Sistema'` es mostra com `'Usuari/ària'` |
| `'missatge'` | Ha contestat | Missatge sense fitxers adjunts |
| `'adjunt'` | Ha pujat documentació | Missatge amb fitxers adjunts |
| `'reobre'` | Reobre sol·licitud | Sol·licitud tancada que es reactiva |

**Regla**: `actor === 'Sistema'` → mostrar `'Usuari/ària'` (el sistema representa la persona sol·licitant).

```html
<!-- Ordre canònic: temps → actor → acció -->
<span style="font-size:var(--font-size-xs);color:var(--color-text-secondary)" title="YYYY-MM-DD">fa X dies</span>
<span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">Nom Cognom</span>
<span style="font-size:var(--font-size-xs);color:var(--color-text-primary)">Ha contestat</span>
```

---

## Recompte d'obertes per responsable

A les columnes de responsable de taules de gestió, mostrar el recompte de sol·licituds actives assignades:

```html
<span style="font-size:var(--font-size-sm)">Maria López</span>
<br><span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">8 obertes</span>
```

"Obertes" inclou els estats: `no-assignada + assignada + esperant-usuari` (tots excepte `resolta` i `tancada`). El recompte ajuda el gestor a repartir la faena de forma equitativa a l'assignar noves sol·licituds.

---

## Strip d'alertes contextuals

Franja de xips sota el `ua-page-header` que mostra alertes calculades dinàmicament. S'oculta quan no hi ha alertes actives.

```html
<!-- Inserir just sota el .ua-page-header, dins de .ua-main -->
<div id="ua-alert-strip" class="ua-alert-strip"
     aria-live="polite" aria-label="Alertes actives" role="region"></div>
```

```css
.ua-alert-strip {
  display: flex; flex-wrap: wrap; gap: var(--space-2);
  padding: 0 var(--space-5) var(--space-4);
}
.ua-alert-strip[hidden] { display: none; }

.ua-alert-chip {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1.5px solid transparent;
  font-size: var(--font-size-xs);
  font-family: var(--font-family-base);
  cursor: pointer;
}
.ua-alert-chip--error   { background: var(--color-error-bg);   border-color: var(--color-error-border);   color: var(--color-error-text); }
.ua-alert-chip--warning { background: var(--color-warning-bg); border-color: var(--color-warning-border); color: var(--color-warning-text); }
.ua-alert-chip--info    { background: var(--color-info-bg);    border-color: var(--color-info-border);    color: var(--color-info-text); }
```

La funció `renderAlertStrip()` de `tableDemo` recalcula i reescriu el contingut del strip. Cridar-la:
- Al `DOMContentLoaded`, just després de `tableDemo.init()`
- Cada cop que canvia l'estat d'una sol·licitud (assignació, resolució, tancament)

**Nota — Sol·licituds:** el strip no s'usa en aquest mòdul (no hi ha `<div id="ua-alert-strip">` al DOM). Totes les alertes s'han integrat com a KPI cards al `ua-page-header`: `ua-kpi--accio-hui` (entrada sense acció 24 h, warning/ambre, `ti-bell-ringing`) i `ua-kpi--han-contestat` (resposta d'usuari des de l'última connexió, success/verd, `ti-message-reply`). Cridar `tableDemo.renderKpiCounts()` al `DOMContentLoaded` per calcular els seus comptes dinàmicament.

---

## Filtre de data

Per a taules amb columna d'entrada temporal, afegir `<select id="filter-data">` + `<input type="date">` a la barra de filtres:

```html
<select class="input ua-filter-select" id="filter-data" aria-label="Filtra per data d'entrada">
  <option value="">Qualsevol data</option>
  <option value="7">Última setmana</option>
  <option value="30">Últim mes</option>
  <option value="90">Últims 3 mesos</option>
  <option value="concreta">Data concreta…</option>
</select>
<input type="date" id="filter-data-concreta" class="input ua-filter-select"
       aria-label="Data concreta d'entrada" hidden>
```

L'`option value` és el nombre de dies màxims d'antiguitat (filtra via `state.filtreData`). L'opció `concreta` mostra el `<input type="date">` i activa `state.filtreDataConcreta` (coincidència exacta YYYY-MM-DD). `filtreDataConcreta` té **prioritat** sobre `filtreData` quan tots dos tenen valor.

## Filtre "Sense responsable"

Afegir com a primera opció de qualsevol select de responsables:

```html
<option value="sense-responsable">Sense responsable</option>
```

En `filteredData()`: si `state.filtreResp === 'sense-responsable'` → `r.responsable.length === 0`.

---

## Accessibilitat (WCAG 2.2 AA — obligació legal RD 1112/2018)

- **Contrast mínims**: 4.5:1 text normal · 3:1 text gran (≥18px o ≥14px bold) · 3:1 UI no-text
- **Focus**: `outline` de 3px en `var(--color-border-focus)` + offset 2px. MAI suprimir sense alternativa.
- **Botons d'icona**: `aria-label` sense excepció.
- **Modals**: `role="dialog"`, `aria-modal="true"`, focus atrapat, retorn de focus en tancar.
- **Target tàctil mòbil**: mínim 48×48px.
- **`prefers-reduced-motion`**: eliminar totes les animacions.
- **Imatges decoratives**: `alt=""` o `aria-hidden="true"`.

---

## Tokens d'espaiat (base 4px — mai valors fora de l'escala)

```
--space-1: 4px   --space-2: 8px   --space-3: 12px  --space-4: 16px
--space-5: 20px  --space-6: 24px  --space-8: 32px  --space-10: 40px
--space-12: 48px --space-16: 64px --space-24: 96px
```

Qualsevol valor de padding/margin/gap ha de ser un d'aquests tokens. Cap valor ad hoc.

---

## Slash commands disponibles

- `/nou-modul [nom]` — genera scaffolding complet d'un nou mòdul
- `/ua-component [nom]` — genera markup canònic d'un component concret

---

## Navegació mòbil (OBLIGATORI en tots els mòduls)

La `<nav class="ua-bottom-nav">` és **obligatòria**. No crear cap mòdul sense ella.

**Regla de coherència (NO negociable):** La bottom nav i el drawer "Més" han de ser en tot moment un **mirall exacte de la sidebar**. Si la sidebar canvia, la bottom nav i el drawer s'han d'actualitzar en el **mateix commit**. Mai poden divergir.

- Bottom bar: 3-4 ítems d'accés freqüent + botó "Més"
- Drawer "Més": rèplica completa de la sidebar, mateixos grups, mateixos `data-filter`, mateixos badges
- Quan el filtre actiu prové del drawer → "Més" queda en estat actiu (senyal visual)
- `filterNav(estat)` sincronitza **tres superfícies alhora**: sidebar + drawer + bottom nav

```html
<nav class="ua-bottom-nav" aria-label="Navegació principal del mòdul">
  <button class="ua-bottom-nav__item ua-bottom-nav__item--active"
          id="bn-totes" onclick="filterNav('')" aria-current="page">
    <i class="ti ti-list" aria-hidden="true"></i>
    Totes
  </button>
  <!-- 2-3 ítems freqüents -->
  <button class="ua-bottom-nav__item" onclick="openModal('modal-nou', this)"
          aria-haspopup="dialog">
    <i class="ti ti-plus" aria-hidden="true"></i>
    Nou
  </button>
  <button class="ua-bottom-nav__item" id="bn-mes"
          onclick="openDrawerMes()" aria-haspopup="dialog"
          aria-controls="drawer-mes" aria-label="Més opcions de navegació">
    <i class="ti ti-dots" aria-hidden="true"></i>
    Més
  </button>
</nav>
```

Ítems del drawer amb `data-filter` idèntic al sidebar:
```html
<button class="ua-drawer-mes__item" data-filter="[valor]"
        onclick="filterNav('[valor]');closeDrawerMes()">
  <i class="ti ti-[icona]" aria-hidden="true"></i>
  <span>[Etiqueta]</span>
  <span class="ld-nav-badge">[N]</span>
</button>
```

CSS mòbil obligatori al `<style>` del mòdul:
```css
@media (max-width: 768px) {
  .ld-sidebar { display: none; }
  .ua-main { padding-bottom: calc(var(--nav-bottom-height) + var(--space-4)); }
  /* KPI: una per línia */
  .ua-kpi-row { grid-template-columns: 1fr; }
  /* Filtres: cerca full-width, selects a la fila de sota */
  .ua-filter-bar { flex-wrap: wrap; }
  .ua-filter-bar > .input-group { width: 100%; }
  .ua-filter-select { flex: 1; min-width: 100px; width: auto; }
}
```

---

## Dark mode — regles de contrast per a tokens `*-bg`

Qualsevol token `--color-*-bg` en dark mode ha de tenir **≥ 4 punts de lluminositat per sobre de `--color-surface-default` (`oklch(22%)`)**. Rang recomanat: `oklch(26-28% 0.06-0.10 [hue])`.

Els tokens `--color-*-border` han d'estar **≥ 10 punts per sobre del bg** corresponent per a ser visibles sobre ell.

Cap element de documentació pot usar `background` en `style=""` inline si necessita adaptació dark mode — usar sempre una classe CSS.

---

## Badges i etiquetes — patrons canònics

### Variants semàntiques (`tag`)
```html
<span class="tag tag-success">Aprovat</span>       <!-- verd -->
<span class="tag tag-warning">Pendent</span>       <!-- ambre — no assignat, sistema ha d'actuar -->
<span class="tag tag-error">Rebutjat</span>        <!-- roig -->
<span class="tag tag-info">En revisió</span>       <!-- blau -->
<span class="tag tag-neutral">Inactiu</span>       <!-- gris -->
<span class="tag tag-primary">Nou</span>           <!-- blau corporatiu -->
<span class="tag tag-accent">Acceptat</span>       <!-- taronja #BA5A00 — accent de marca UA -->
<span class="tag tag-pause">En pausa</span>        <!-- viola hue 280 — l'usuari ha d'actuar -->
```

### Badge de desbordament (+N)
Quan una llista d'elements (responsables, etiquetes, assignats) es trunca per manca d'espai, es mostra el primer element com a text i un badge neutre `+N`:

```html
<!-- 1 element: sense badge -->
<span style="font-size:var(--font-size-sm)">Maria López</span>

<!-- 2+ elements: primer visible + badge +N amb title obligatori -->
<span style="font-size:var(--font-size-sm)">Maria López</span>
<span class="tag tag-neutral"
      style="font-size:var(--font-size-xs);padding:2px 6px"
      title="Héctor García, Joan Martínez">+2</span>

<!-- 0 elements: guió llarg en color muted -->
<span style="color:var(--color-text-muted);font-size:var(--font-size-xs)">—</span>
```

Regles obligatòries:
- `title` amb la llista completa d'elements ocults (accessibilitat).
- Sempre `tag-neutral` — mai `tag-warning` o `tag-info`.
- Mida fixa: `font-size: var(--font-size-xs)` + `padding: 2px 6px`. No alterar.
- Sense badge per a 0 elements: usar `—` en `var(--color-text-muted)`.

---

## Vista dual llista / mosaic (`UAViewToggle`)

Les taules de gestió poden oferir alternança llista ↔ mosaic via la classe `UAViewToggle` (`components/view-toggle/`):

```html
<!-- Botó toggle al header del ua-content-card, a la dreta del filtre bar -->
<div style="display:flex;flex-shrink:0" role="group" aria-label="Canvia la vista">
  <button class="ua-view-btn ua-view-btn--active" id="btn-vista-llista"
          aria-pressed="true" aria-label="Vista de llista" onclick="setVista('llista')">
    <i class="ti ti-list-details" aria-hidden="true"></i>
  </button>
  <button class="ua-view-btn" id="btn-vista-mosaic"
          aria-pressed="false" aria-label="Vista en mosaic" onclick="setVista('mosaic')">
    <i class="ti ti-layout-grid" aria-hidden="true"></i>
  </button>
</div>

<!-- .table-wrap ha de tenir un id (ex. "demo-table-wrap") -->
<div class="table-wrap" id="demo-table-wrap">…</div>

<!-- Contenidor de targetes (just after .table-wrap) -->
<div id="demo-cards-grid" class="ua-cards-grid" hidden aria-live="polite"></div>
```

```js
// Al DOMContentLoaded:
let _viewToggle;
_viewToggle = new UAViewToggle({
  tableEl:     'demo-table-wrap',
  gridEl:      'demo-cards-grid',
  btnLlistaEl: 'btn-vista-llista',
  btnMosaicEl: 'btn-vista-mosaic',
});

// Wrapper thin per als onclick HTML:
function setVista(mode) { _viewToggle?.set(mode); }
```

`UAViewToggle.set(mode)` gestiona `hidden`, `aria-pressed` i la classe `ua-view-btn--active` dels dos botons.

La funció `renderCardsGrid(sliced)` del `tableDemo` rep les mateixes dades paginades que `renderTable()` i les renderitza com a `<div role="button">` (mai `<button>`, per permetre botons fills com Assigna i Kebab). Es crida automàticament des de `renderTable()`. Busca l'element per `id="demo-cards-grid"` (fallback: `sol-cards-grid`).

---

## Barra de filtres actius (xips)

Quan hi ha filtres aplicats, una barra de xips apareix sota el filtre bar:

```html
<!-- Just after .ua-content-card__header -->
<div id="filter-chips-bar" class="ua-filter-chips-bar" hidden
     aria-live="polite" aria-label="Filtres actius"></div>
```

La funció `renderFilterChips()` llegeix l'estat dels controls del DOM i actualitza el contenidor. Cada xip porta un botó `×` que esborra el filtre individual. Cridar `renderFilterChips()` des de tots els listeners de canvi de filtre i al `DOMContentLoaded`.

---

## Vistes personalitzades (`UASavedViews`)

Barra de dreceres que l'usuari pot guardar per recuperar combinacions de filtres amb un sol clic.
Col·locació canònica: **dins `.ua-content-card`, ABANS del `__header`** (la card té `overflow:hidden` → clipa el border-radius superior automàticament).

```html
<div id="ua-vistes-bar" class="ua-vistes-bar" aria-label="Vistes guardades">
  <span class="ua-vistes-bar__label">
    <i class="ti ti-bookmark" aria-hidden="true"></i> Vistes
  </span>
  <div id="ua-vistes-chips" class="ua-vistes-chips" role="list" aria-label="Vistes guardades"></div>
  <div class="ua-vista-save-wrap">
    <button class="btn btn-ghost btn-sm" id="ua-vista-save-btn"
            onclick="uaVistaIniciarGuardat()" aria-label="Guarda la vista actual com a drecera">
      <i class="ti ti-bookmark-plus" aria-hidden="true"></i>
      <span>Guarda vista</span>
    </button>
    <div id="ua-vista-save-form" class="ua-vista-save-form" hidden>
      <input id="ua-vista-nom" class="input" type="text"
             placeholder="Nom de la vista…" maxlength="50" aria-label="Nom de la nova vista">
      <button class="btn btn-primary btn-sm" data-sv-confirm aria-label="Confirma i guarda">
        <i class="ti ti-check" aria-hidden="true"></i>
      </button>
      <button class="btn btn-ghost btn-sm" data-sv-cancel aria-label="Cancel·la">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</div>
```

**Nota:** els botons del formulari usen `data-sv-confirm` / `data-sv-cancel` (sense onclick) — la classe `UASavedViews` els detecta via event delegation al `formEl`.

**JS — inicialització al `DOMContentLoaded`:**

```js
let _savedViews;
_savedViews = new UASavedViews({
  key:         'ua-[modul]-vistes',      // clau localStorage
  demos:       VISTES_DEMO,              // array de vistes predefinides de fallback
  chipsEl:     'ua-vistes-chips',
  saveBtnEl:   'ua-vista-save-btn',
  saveFormEl:  'ua-vista-save-form',
  saveInputEl: 'ua-vista-nom',
  getFiltre:   _currentFiltre,           // callback → {estat, filtreTipus, filtreResp, cerca}
  suggestNom:  _suggestNomVista,         // callback → string per pre-emplenar el camp de nom
  onApply:     _applyVistaFiltre,        // callback → aplica el filtre al mòdul
});
_savedViews.render();

const vistaPred = _savedViews.getDefault();
if (vistaPred) setTimeout(() => _savedViews.apply(vistaPred.id), 0);

// Wrappers thin per als onclick HTML:
function uaVistaIniciarGuardat() { _savedViews?.initSave(); }
function renderVistesMatchingActual() { _savedViews?.matchActual(_currentFiltre()); }
```

**`_currentFiltre()` i `_filterEstat` — OBLIGATORIS al mòdul:**

```js
let _filterEstat = '';  // mirall de l'estat de filterNav; NO llegir el DOM per a açò

function _currentFiltre() {
  return {
    estat:       _filterEstat,
    filtreTipus: document.getElementById('filter-tipus')?.value      || '',
    filtreResp:  document.getElementById('filter-responsable')?.value || '',
    cerca:       document.getElementById('table-search-input')?.value || '',
  };
}
```

**`_applyVistaFiltre` — ordre CRÍTIC (barra primer, `filterNav` després):**

```js
function _applyVistaFiltre(filtre) {
  // 1. Filtres de barra PRIMER — perquè filterNav→renderVistesMatchingActual els puga llegir
  document.getElementById('filter-tipus').value = filtre.filtreTipus || '';
  tableDemo.setFiltre('filtreTipus', filtre.filtreTipus || '');
  // ... resta de selects / cerca ...
  // 2. filterNav ÚLTIM — crida renderVistesMatchingActual() al seu final
  filterNav(filtre.estat || '');
  renderFilterChips();
}
```

**Integració amb `filterNav` i `renderFilterChips`:**

```js
function filterNav(estat) {
  _filterEstat = estat;          // ← primer
  // ... resta de la funció ...
  renderVistesMatchingActual();  // ← al final
}

function renderFilterChips() {
  if (!actius.length) { bar.hidden = true; renderVistesMatchingActual(); return; } // ← early return
  // ... renderitza els xips ...
  renderVistesMatchingActual();  // ← al final
}
```

**localStorage:**
- Clau de nomenclatura: `ua-[modul]-vistes` (ex. `ua-sols-vistes`)
- Format: `Array<{id, nom, filtre:{estat,filtreTipus,filtreResp,cerca}, predeterminada:bool}>`
- Si `localStorage` buit → `demos` de fallback (predefinides per al mòdul)

---

## Recompte als tabs de vista (Totes / Les meues)

Afegir un `<span class="ua-tab-count" id="count-[tab]"></span>` dins de cada botó de tab. El `tableDemo` el pobla via `_updateTabCounts()` (cridat automàticament des de `renderTable()`). El span queda invisible quan el valor és `''`.

---

## Drawer de detall (`UADetailDrawer`)

Per a veure el detall d'un registre sense abandonar el llistat, usar la classe `UADetailDrawer` (`components/detail-drawer/`):

```html
<!-- sense onclick al overlay: UADetailDrawer el registra al constructor -->
<div id="detall-overlay" class="ua-detall-overlay" hidden aria-hidden="true"></div>
<aside id="detall-panel" class="ua-detall-panel" hidden
       role="dialog" aria-modal="true" aria-labelledby="detall-title">
  <!-- header: codi + badge estat + botó × -->
  <!-- body: assumpte, metadata grid, fil d'activitat -->
  <!-- footer: botons d'acció contextuals per estat -->
</aside>
```

```js
// Al DOMContentLoaded:
let _drawer;
_drawer = new UADetailDrawer({
  panelEl:   'detall-panel',
  overlayEl: 'detall-overlay',
  // onClose: () => {},   // opcional
});

// Funcions que poblen el contingut i deleguen a la classe:
function openDetall(codi) {
  const r = tableDemo.getRecord(codi);
  if (!r) return;
  // ... pobla camps del drawer amb dades de r ...
  _drawer?.open();   // ← delega focus trap, Escape i transicions
}
function closeDetall() { _drawer?.close(); }
```

`UADetailDrawer` gestiona: transició CSS (`--visible`), focus al primer element interactiu, trampa de focus Tab/Shift-Tab, Escape, i restauració del focus en tancar.

`openDetall` existeix al `window` → `viewSolicitud()` de `tableDemo` hi delega automàticament (la implementació modal de fallback es conserva per a mòduls sense drawer propi).

---

## Decisions immutables (no reobrir)

- Color primari: **#005682** — no substituir per cap altre blau.
- Topbar: **sempre blau corporatiu** — mai verd, gris ni blanc per a mòduls.
- Tipografia: **Atkinson Hyperlegible** — sense fallback a altra família.
- Radius botons/inputs: **8px** (`--radius-md`).
- Toasts: **5 segons**, barra de progrés, pausa en hover.
- Skeleton: **shimmer** (esquerra→dreta), mai pols.
- Sidebar ítem actiu: **variant C** (línia esquerra 4px + fons subtil blau).
- Sidebar badges: **grisos per defecte** (`--color-surface-muted` / `--color-text-muted`); primari quan fila activa (`--color-primary-muted` / `--color-primary`). Mai blau per defecte.
- Taula: separadors thead/tbody **inset 20px** (via `::after`), mai `border-bottom` extrem a extrem.
- Bottom nav mòbil: **obligatòria** en tots els mòduls — no opcional.
- Bottom nav ↔ sidebar: **mirall exacte** sempre — qualsevol canvi a la sidebar actualitza bottom nav + drawer en el mateix commit.
- Filtres mòbil: `flex-wrap: wrap` + cerca `width: 100%` + selects `flex: 1`. **Mai ocultar filtres en mòbil.**
- Columnes de data en taules: mostrar **temps relatiu** (`tempsRelatiu()`), data exacta al `title` i al detall de fila.
- Columna "Últim moviment": model `{ data, actor, accio }` — 3 línies: temps · acció (`presenta/missatge/adjunt/reobre`) · actor.
- Columna "Responsable" en taules de gestió: mostrar recompte d'obertes sota el nom ("X obertes").
- Botó "Assigna" en taules de gestió: obre **dropdown de gestors** amb recompte d'obertes, no assigna directament a l'usuari actual.
- Strip d'alertes contextuals: `<div id="ua-alert-strip" class="ua-alert-strip" aria-live="polite">` sota el page-header, calculat per `renderAlertStrip()`.
- Checkbox en taula: `data-ua-table` + `.table-th--check` + `.table-check-all` + `.table-td--check` + `.table-check-row` + `data-row-id` a cada `<tr>`.
- Checkboxes i ràdios autònoms: sempre amb wrapper `<label class="ua-checkbox|ua-radio">` + text `.ua-checkbox__label`. Grups dins `<fieldset>` + `<legend>`.
