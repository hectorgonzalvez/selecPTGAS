# Convocatòries d'Oposicions PAS — CLAUDE.md

> Idioma de treball: **Valencià**.
> Este directori conté la documentació de migració d'una aplicació ASP heretada (gestió de convocatòries d'oposicions PAS de la UA) cap a **.NET + Vue 3**, adoptant el Design System UACloud. **Repositori independent** — sense accés compartit al repositori DS arrel (l'equip que hi continua la faena no treballa amb GitHub).

## Producte

@PRODUCT.md

## Arquitectura

@ARCHITECTURE.md

## Decisions de negoci

@DECISIONS.md

## Sistema de disseny (extern)

@docs/design-system.md

Este mòdul **no defineix** decisions visuals pròpies — les hereta del Design System UACloud arrel, distribuïdes com a fitxers vendored (copiats manualment, sense git compartit):

| Fitxer d'este repositori | Origen | Regenerar amb |
|---|---|---|
| `vendor/ds-uacloud/ua-ds.bundled.css` | `ua-ds.css` + `tokens/` + `components/*.css` del DS arrel | `node build/build-ds-css.js` (al repositori DS) |
| `vendor/ds-uacloud/ua-ds.js` | Bundle JS del DS arrel | `node build/build-ds.js` (al repositori DS) |
| `docs/design-system.md` | Còpia directa del DS arrel | Còpia manual — no hi ha script |

**Entry point** (afegir al `<head>`/layout arrel del frontend Vue):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">
<link rel="stylesheet" href="./vendor/ds-uacloud/ua-ds.bundled.css">
<!-- ...contingut... -->
<script src="./vendor/ds-uacloud/ua-ds.js"></script>
```

**Sincronia manual**: quan el DS arrel canvie, cal que et reenvien els 3 fitxers regenerats — no hi ha cap automatització possible sense repositori compartit (vore `ARCHITECTURE.md` § Adopció del Design System UACloud).

## Restriccions crítiques (heretades del DS, no negociables)

- **CSS**: custom properties per a tots els valors — cap valor hardcoded, sempre via token del DS.
- **Textos mai hardcoded**: tot text visible per l'usuari via i18n.
- **BEM obligatori**: `.component__element--modifier`.
- **HTML semàntic** sempre.
- **WCAG 2.2 AA** com a mínim.

## Restriccions crítiques pròpies d'este domini

- **La màquina d'estats de fases de la convocatòria és font de veritat** (vore `PRODUCT.md` § Màquina d'estats i `DECISIONS.md`) — no simplificar-la ni alterar l'orde de les transicions sense confirmació explícita del propietari de producte.
- **El contracte amb l'API d'e-adm i amb la lectora de notes del Servei d'Informàtica són externs** — documentar-los amb OpenAPI/spec abans d'implementar cap crida (vore `api-contract-checker` del repositori DS arrel).
- **El log d'auditoria és requisit, no opcional.**
- **Commits**: missatge en valencià.

---

*Generat a partir de `seleccio-oposPTGAS.pdf` (especificació funcional de l'aplicació ASP original, 40 pàgines, majoritàriament captures de pantalla).*
*Auditoria UX del producte actual: @UX-AUDIT.md*
