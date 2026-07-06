/* ════════════════════════════════════════════════════════
   UACloud Design System — ua-ds.js  v0.1
   Fitxer generat automàticament — NO editar manualment.
   Per regenerar: node build/build-ds.js
   ════════════════════════════════════════════════════════ */

/* ── locales (incrustats en build-time) ──────────── */

window.UA_LOCALES = window.UA_LOCALES || {};
window.UA_LOCALES['es'] = {
  "table.bulk.aria": "Acciones para las filas seleccionadas",
  "table.bulk.exportCsv": "Exporta CSV",
  "table.bulk.clear": "Borra la selección",
  "table.bulk.countOne": "1 fila seleccionada",
  "table.bulk.countMany": "{n} filas seleccionadas",
  "table.expand.aria": "Expande fila",
  "table.th.estat": "Estado",
  "kpi.pendents": "Pendientes"
}
;
window.UA_LOCALES['va'] = {
  "table.bulk.aria": "Accions per a les files seleccionades",
  "table.bulk.exportCsv": "Exporta CSV",
  "table.bulk.clear": "Esborra la selecció",
  "table.bulk.countOne": "1 fila seleccionada",
  "table.bulk.countMany": "{n} files seleccionades",
  "table.expand.aria": "Expandeix fila",
  "table.th.estat": "Estat",
  "kpi.pendents": "Pendents"
}
;


/* ── components/i18n/i18n.js ───────────────────────────── */

/* ══════════════════════════════════════════════════════════
   UA Design System · i18n — loader data-i18n + uaT()
   window.UA_LOCALES s'incrusta a build-ds.js des de locales/*.json
   ══════════════════════════════════════════════════════════ */

window.UA_LOCALES = window.UA_LOCALES || {};
let _uaLocale = 'va';

function uaSetLocale(code) {
  if (window.UA_LOCALES[code]) _uaLocale = code;
  uaI18nApply(document);
}

// Traducció puntual — sempre amb fallback en valencià literal
function uaT(key, fallback = '') {
  const dict = window.UA_LOCALES[_uaLocale];
  const val = dict && dict[key];
  return (val === undefined || val === '') ? fallback : val;
}

// Escaneja [data-i18n] dins `root` i substitueix text/atribut.
// data-i18n="clau"             → textContent
// data-i18n-attr="aria-label"  → substitueix eixe atribut en lloc del textContent
function uaI18nApply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr;
    const current = attr ? (el.getAttribute(attr) || '') : el.textContent;
    const text = uaT(key, current);
    if (attr) el.setAttribute(attr, text);
    else el.textContent = text;
  });
}

document.addEventListener('DOMContentLoaded', () => uaI18nApply(document));

window.uaT = uaT;
window.uaI18nApply = uaI18nApply;
window.uaSetLocale = uaSetLocale;


/* ── components/layout/layout.js ───────────────────────── */

/* ══════════════════════════════════════════════════════════
   UA Design System · Layout — sidebar mòbil + rail de tablet (D-055)
   Promogut des del codi inline duplicat a sollicituds.html/meues-opcions.html.
   El CSS del sidebar (.ua-sidebar, .ua-menu-btn, etc.) roman LOCAL a cada
   demo — NO moure'l ací (vore nota de cascada a demos/CLAUDE.md).
   ══════════════════════════════════════════════════════════ */

const UA_RAIL_KEY = 'ua-sidebar-rail-pref'; // 'rail' | 'expanded'

// ── Sidebar mòbil (drawer ≤768px) ───────────────────────────
function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btn = document.querySelector('.ua-menu-btn');
  if (!sidebar) return;
  const open = force ?? !sidebar.classList.contains('is-open');
  sidebar.classList.toggle('is-open', open);
  overlay?.classList.toggle('is-open', open);
  overlay?.setAttribute('aria-hidden', String(!open));
  btn?.setAttribute('aria-expanded', String(open));
  if (open) {
    requestAnimationFrame(() =>
      sidebar.querySelector('button, a, [tabindex="0"]')?.focus()
    );
  }
}

// ── Acordió de submenú (expandit) / flyout (rail tablet) ────
function toggleNavAcc(subId, btn) {
  const sub = document.getElementById(subId);
  if (!sub) return;
  const sidebar = document.getElementById('sidebar');
  const isTablet = window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches;
  const isRail = isTablet && !sidebar?.classList.contains('is-expanded-override');

  if (isRail) {
    openRailFlyout(btn, sub);
    return;
  }

  const isOpen = sub.classList.contains('open');
  sub.classList.toggle('open', !isOpen);
  btn.querySelector('.ld-nav-chev')?.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

// ── Rail de tablet 769–1024px (D-055) ───────────────────────
function toggleSidebarRail(force) {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-rail-toggle');
  if (!sidebar) return;
  const expanded = force ?? !sidebar.classList.contains('is-expanded-override');
  sidebar.classList.toggle('is-expanded-override', expanded);
  toggle?.setAttribute('aria-expanded', String(expanded));
  toggle?.setAttribute('aria-label', expanded
    ? 'Contrau el menú lateral a mode icona'
    : 'Expandeix el menú lateral');
  localStorage.setItem(UA_RAIL_KEY, expanded ? 'expanded' : 'rail');
}

let _railFlyoutTrigger = null;

function openRailFlyout(triggerBtn, subEl) {
  const flyout = _ensureRailFlyoutEl();
  const items = [...subEl.querySelectorAll('.ld-nav-sub-item')];
  flyout.innerHTML = items
    .map(it => `<button class="ua-rail-flyout__item" role="menuitem">${it.textContent.trim()}</button>`)
    .join('');
  [...flyout.children].forEach((btn, i) => {
    btn.addEventListener('click', () => {
      items[i]?.click();
      closeRailFlyout();
    });
  });

  const rect = triggerBtn.getBoundingClientRect();
  flyout.style.top = rect.top + 'px';
  flyout.style.left = rect.right + 4 + 'px';
  flyout.hidden = false;
  flyout.setAttribute('aria-hidden', 'false');
  _railFlyoutTrigger = triggerBtn;
  triggerBtn.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => flyout.querySelector('button')?.focus());
  document.addEventListener('keydown', _railFlyoutKeydown);
  document.addEventListener('click', _railFlyoutOutsideClick, true);
}

function closeRailFlyout() {
  const flyout = document.getElementById('rail-flyout');
  if (!flyout || flyout.hidden) return;
  flyout.hidden = true;
  flyout.setAttribute('aria-hidden', 'true');
  _railFlyoutTrigger?.setAttribute('aria-expanded', 'false');
  _railFlyoutTrigger?.focus();
  _railFlyoutTrigger = null;
  document.removeEventListener('keydown', _railFlyoutKeydown);
  document.removeEventListener('click', _railFlyoutOutsideClick, true);
}

function _railFlyoutKeydown(e) {
  if (e.key === 'Escape') closeRailFlyout();
}

function _railFlyoutOutsideClick(e) {
  const flyout = document.getElementById('rail-flyout');
  if (flyout && !flyout.contains(e.target) && e.target !== _railFlyoutTrigger) closeRailFlyout();
}

function _ensureRailFlyoutEl() {
  let el = document.getElementById('rail-flyout');
  if (!el) {
    el = document.createElement('div');
    el.id = 'rail-flyout';
    el.className = 'ua-rail-flyout';
    el.setAttribute('role', 'menu');
    el.hidden = true;
    document.body.appendChild(el);
  }
  return el;
}

// ── Auto-init: Escape per al sidebar mòbil, tooltips i preferència rail ──
function initUaSidebarRail() {
  const sidebar = document.querySelector('#sidebar[data-sidebar-rail]');
  if (!sidebar) return;

  sidebar.querySelectorAll('.ld-nav-item:not([data-tooltip])').forEach(it => {
    const label = it.querySelector('.ni-label')?.textContent?.trim();
    if (label) it.dataset.tooltip = label;
  });

  const pref = localStorage.getItem(UA_RAIL_KEY);
  if (pref === 'expanded') toggleSidebarRail(true);
}

document.addEventListener('DOMContentLoaded', () => {
  initUaSidebarRail();

  // Escape tanca el sidebar mòbil (drawer ≤768px)
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.querySelector('.ua-menu-btn');
  if (sidebar && menuBtn) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        toggleSidebar(false);
        menuBtn.focus();
      }
    });
  }
});


/* ── js/toast.js ───────────────────────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Toast System
// Durada: 5s · Barra de progrés · Pausa en hover
// ══════════════════════════════════════════════════════════

const TOAST_DURATION = 5000;

const TOAST_ICONS = {
  success: '✓',
  error:   '✗',
  warning: '⚠',
  info:    'ℹ',
  neutral: '●'
};

let toastIdCounter = 0;

function showToast(type, title, message) {
  const region = document.getElementById('toastRegion');
  const id = 'toast-' + (++toastIdCounter);

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-atomic', 'true');
  toast.id = id;

  toast.innerHTML = `
    <div class="toast__body">
      <div class="toast__icon toast__icon--${type}" aria-hidden="true">
        ${TOAST_ICONS[type] || '●'}
      </div>
      <div class="toast__text">
        <div class="toast__title">${title}</div>
        ${message ? `<div class="toast__message">${message}</div>` : ''}
      </div>
      <button
        class="toast__close"
        aria-label="Tanca aquesta notificació"
        onclick="dismissToast('${id}')"
      >×</button>
    </div>
    <div class="toast__progress-track" aria-hidden="true">
      <div class="toast__progress-bar" id="${id}-bar"></div>
    </div>
  `;

  region.appendChild(toast);

  const bar = document.getElementById(id + '-bar');
  let elapsed = 0;
  let animFrame;
  let paused = false;

  function step(timestamp) {
    if (!paused) elapsed += timestamp - (step.lastTimestamp || timestamp);
    step.lastTimestamp = timestamp;

    const progress = Math.min(elapsed / TOAST_DURATION, 1);
    bar.style.width = (100 - progress * 100) + '%';

    if (progress >= 1) {
      dismissToast(id);
      return;
    }
    animFrame = requestAnimationFrame(step);
  }

  animFrame = requestAnimationFrame(step);

  toast.addEventListener('mouseenter', () => {
    paused = true;
    toast.classList.add('toast--paused');
  });

  toast.addEventListener('mouseleave', () => {
    paused = false;
    toast.classList.remove('toast--paused');
  });

  toast._cancelTimer = () => cancelAnimationFrame(animFrame);
}

function dismissToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  if (toast._cancelTimer) toast._cancelTimer();
  toast.classList.add('toast--exiting');
  // Fallback: elimina el toast si animationend no dispara (p.ex. prefers-reduced-motion)
  const fallback = setTimeout(() => toast.remove(), 400);
  toast.addEventListener('animationend', () => {
    clearTimeout(fallback);
    toast.remove();
  }, { once: true });
}


/* ── components/modal/modal.js ─────────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Modal / Diàleg
// WCAG: role="dialog", aria-modal, focus trap, retorn de focus
// ══════════════════════════════════════════════════════════

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

class UAModal {
  constructor({ id, onClose } = {}) {
    this.id = id;
    this.onClose = onClose;
    this._triggerEl = null;
    this._overlay = null;
    this._bound = {
      keydown: this._onKeydown.bind(this),
      overlayClick: this._onOverlayClick.bind(this),
    };
  }

  open(triggerEl) {
    this._triggerEl = triggerEl || document.activeElement;
    this._overlay = this.id
      ? document.getElementById(this.id)
      : this._overlay;

    if (!this._overlay) return;

    // Bloqueja el scroll del body
    document.body.style.overflow = 'hidden';

    this._overlay.removeAttribute('hidden');
    this._overlay.classList.remove('modal-closing');

    // Mou el focus al primer element focusable del modal
    const modal = this._overlay.querySelector('.modal');
    if (modal) {
      requestAnimationFrame(() => {
        const first = modal.querySelector(FOCUSABLE);
        if (first) first.focus();
      });
    }

    document.addEventListener('keydown', this._bound.keydown);
    this._overlay.addEventListener('click', this._bound.overlayClick);
  }

  close() {
    if (!this._overlay) return;

    this._overlay.classList.add('modal-closing');

    const duration = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--transition-base') || '200'
    );

    setTimeout(() => {
      if (!this._overlay) return;
      this._overlay.setAttribute('hidden', '');
      this._overlay.classList.remove('modal-closing');
      document.body.style.overflow = '';
    }, duration);

    document.removeEventListener('keydown', this._bound.keydown);
    this._overlay.removeEventListener('click', this._bound.overlayClick);

    // Retorna el focus a l'element que va obrir el modal
    if (this._triggerEl) {
      try { this._triggerEl.focus(); } catch (_) {}
    }

    if (this.onClose) this.onClose();
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'Tab') {
      this._trapFocus(e);
    }
  }

  _onOverlayClick(e) {
    if (e.target === this._overlay) this.close();
  }

  _trapFocus(e) {
    const modal = this._overlay?.querySelector('.modal');
    if (!modal) return;

    const focusables = Array.from(modal.querySelectorAll(FOCUSABLE));
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ── API global per a declarar modals per ID ───────────── //

const _modalInstances = {};

function openModal(id, triggerEl) {
  if (!_modalInstances[id]) {
    _modalInstances[id] = new UAModal({ id });
  }
  _modalInstances[id].open(triggerEl || document.activeElement);
}

function closeModal(id) {
  if (_modalInstances[id]) {
    _modalInstances[id].close();
  } else {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  }
}

// ── ConfirmDialog ─────────────────────────────────────── //

function showConfirmDialog({
  title,
  description,
  confirmText = 'Confirma',
  cancelText = 'Cancel·la',
  variant = 'destructive',
  onConfirm,
  onCancel,
} = {}) {
  const triggerEl = document.activeElement;
  const id = 'ua-confirm-' + Date.now();

  const iconMap = {
    destructive: { symbol: '✕', cls: 'destructive' },
    warning:     { symbol: '⚠', cls: 'warning' },
    info:        { symbol: 'ℹ', cls: 'info' },
  };
  const icon = iconMap[variant] || iconMap.destructive;

  const btnCls = variant === 'destructive'
    ? 'btn btn-destructive'
    : variant === 'warning'
      ? 'btn btn-destructive'
      : 'btn btn-primary';

  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', `${id}-title`);
  overlay.setAttribute('aria-describedby', `${id}-desc`);

  overlay.innerHTML = `
    <div class="modal confirm-dialog" role="document">
      <div class="confirm-dialog-body">
        <div class="confirm-dialog-icon ${icon.cls}" aria-hidden="true">${icon.symbol}</div>
        <div class="confirm-dialog-content">
          <div class="confirm-dialog-title" id="${id}-title">${title}</div>
          ${description ? `<p class="confirm-dialog-desc" id="${id}-desc">${description}</p>` : ''}
        </div>
      </div>
      <div class="confirm-dialog-footer">
        <button class="btn btn-secondary" id="${id}-cancel">${cancelText}</button>
        <button class="${btnCls}" id="${id}-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const modal = new UAModal({
    onClose: () => {
      setTimeout(() => overlay.remove(), 320);
    }
  });
  modal._overlay = overlay;
  modal._triggerEl = triggerEl;

  overlay.querySelector(`#${id}-cancel`).addEventListener('click', () => {
    modal.close();
    if (onCancel) onCancel();
  });

  overlay.querySelector(`#${id}-confirm`).addEventListener('click', () => {
    modal.close();
    if (onConfirm) onConfirm();
  });

  modal.open(triggerEl);
}


/* ── components/accordion/accordion.js ─────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Accordion
// ARIA: aria-expanded al trigger + inert al panel quan tancat
// Teclat: ↑ ↓ navega capçaleres, Home/End
// data-allow-multiple: permet múltiples panells oberts
// ══════════════════════════════════════════════════════════

class UAAccordion {
  constructor(container) {
    this.container      = container;
    this.items          = Array.from(container.querySelectorAll('.accordion__item'));
    this.allowMultiple  = container.hasAttribute('data-allow-multiple');

    this._init();
    this._bindEvents();
  }

  // ── Sincronitza l'estat inicial des del HTML ──────────
  _init() {
    this.items.forEach(item => {
      const trigger = item.querySelector('.accordion__trigger');
      const panel   = item.querySelector('.accordion__panel');
      const isOpen  = trigger.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        item.classList.add('accordion__item--open');
      } else {
        panel.setAttribute('inert', '');
      }
    });
  }

  // ── Commuta un ítem ───────────────────────────────────
  toggle(item) {
    const isOpen = item.classList.contains('accordion__item--open');

    if (isOpen) {
      this._close(item);
    } else {
      if (!this.allowMultiple) {
        this.items.forEach(i => { if (i !== item) this._close(i); });
      }
      this._open(item);
    }
  }

  // ── Obre ──────────────────────────────────────────────
  _open(item) {
    const trigger = item.querySelector('.accordion__trigger');
    const panel   = item.querySelector('.accordion__panel');
    trigger.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('inert');
    item.classList.add('accordion__item--open');
  }

  // ── Tanca ─────────────────────────────────────────────
  _close(item) {
    const trigger = item.querySelector('.accordion__trigger');
    const panel   = item.querySelector('.accordion__panel');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('inert', '');
    item.classList.remove('accordion__item--open');
  }

  // ── Binding d'events ──────────────────────────────────
  _bindEvents() {
    const triggers = this.items.map(i => i.querySelector('.accordion__trigger'));

    this.items.forEach((item, idx) => {
      const trigger = triggers[idx];

      trigger.addEventListener('click', () => this.toggle(item));

      trigger.addEventListener('keydown', (e) => {
        let next = -1;
        switch (e.key) {
          case 'ArrowDown': e.preventDefault(); next = (idx + 1) % triggers.length; break;
          case 'ArrowUp':   e.preventDefault(); next = (idx - 1 + triggers.length) % triggers.length; break;
          case 'Home':      e.preventDefault(); next = 0; break;
          case 'End':       e.preventDefault(); next = triggers.length - 1; break;
        }
        if (next >= 0) triggers[next].focus();
      });
    });
  }
}

// ── Auto-inicialitza tots els [data-accordion] ────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-accordion]').forEach(el => {
    if (!el.dataset.accordionInit) {
      el.dataset.accordionInit = 'true';
      el._uaAccordion = new UAAccordion(el);
    }
  });
});


/* ── components/calendar/calendar.js ───────────────────── */

// ── UACalendar ─────────────────────────────────────────────
// Visualització mensual d'esdeveniments amb navegació de teclat.
//
// Ús:
//   <div class="calendar" id="cal1">
//     <div class="calendar__header">
//       <button class="calendar__nav" data-prev aria-label="Mes anterior">
//         <i class="ti ti-chevron-left" aria-hidden="true"></i>
//       </button>
//       <p class="calendar__title" aria-live="polite"></p>
//       <button class="calendar__nav" data-next aria-label="Mes següent">
//         <i class="ti ti-chevron-right" aria-hidden="true"></i>
//       </button>
//     </div>
//     <div class="calendar__weekdays" role="row" aria-hidden="true">
//       <span class="calendar__weekday">Dl</span>
//       <span class="calendar__weekday">Dt</span>
//       <span class="calendar__weekday">Dc</span>
//       <span class="calendar__weekday">Dj</span>
//       <span class="calendar__weekday">Dv</span>
//       <span class="calendar__weekday calendar__weekday--weekend">Ds</span>
//       <span class="calendar__weekday calendar__weekday--weekend">Dg</span>
//     </div>
//     <div class="calendar__grid" role="grid"></div>
//     <ul class="calendar__events" aria-label="Esdeveniments" aria-live="polite"></ul>
//   </div>
//
// API pública:
//   cal.setEvents([ { date:'YYYY-MM-DD', title:'…', type:'exam|deadline|class|task|event', meta:'…' } ])
//   cal.goToMonth(year, month)   ← month: 0-based
//   cal.selectDate(date)         ← date: objecte Date
//
// Events del DOM:
//   'ua:cal:select' → detail: { date: Date, events: Array }
// ──────────────────────────────────────────────────────────

(function () {
  'use strict';

  const MONTHS_CA = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
  ];

  function toKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function sameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  class UACalendar {
    constructor(el) {
      this.el = el;
      this.today    = new Date();
      this.viewed   = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
      this.selected = null;
      this.events   = {}; // { 'YYYY-MM-DD': [ {title, type, meta}, … ] }

      this.gridEl   = el.querySelector('.calendar__grid');
      this.titleEl  = el.querySelector('.calendar__title');
      this.eventsEl = el.querySelector('.calendar__events');
      this.btnPrev  = el.querySelector('[data-prev]');
      this.btnNext  = el.querySelector('[data-next]');

      this._init();
    }

    // ── API pública ───────────────────────────────────────

    setEvents(arr) {
      this.events = {};
      arr.forEach(ev => {
        if (!this.events[ev.date]) this.events[ev.date] = [];
        this.events[ev.date].push(ev);
      });
      this._render();
    }

    goToMonth(year, month) {
      this.viewed = new Date(year, month, 1);
      this._render();
    }

    prevMonth() {
      this.viewed = new Date(this.viewed.getFullYear(), this.viewed.getMonth() - 1, 1);
      this._render();
    }

    nextMonth() {
      this.viewed = new Date(this.viewed.getFullYear(), this.viewed.getMonth() + 1, 1);
      this._render();
    }

    selectDate(date) {
      this.selected = date;
      // Actualitza estil visual de les cel·les sense re-renderitzar tot
      this.gridEl.querySelectorAll('.calendar__cell').forEach(btn => {
        const d = new Date(btn.dataset.cal + 'T00:00:00');
        const sel = sameDay(d, date);
        btn.classList.toggle('calendar__cell--selected', sel);
        btn.setAttribute('aria-pressed', String(sel));
        btn.setAttribute('tabindex', sel ? '0' : '-1');
      });
      this._renderEventsList();
      this.el.dispatchEvent(new CustomEvent('ua:cal:select', {
        bubbles: true,
        detail: { date, events: this.events[toKey(date)] || [] },
      }));
    }

    // ── Inicialització ────────────────────────────────────

    _init() {
      if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prevMonth());
      if (this.btnNext) this.btnNext.addEventListener('click', () => this.nextMonth());
      if (this.gridEl)  this._bindKeyboard();
      this._render();
    }

    // ── Render complet ────────────────────────────────────

    _render() {
      const year  = this.viewed.getFullYear();
      const month = this.viewed.getMonth();
      if (this.titleEl) {
        this.titleEl.textContent = `${MONTHS_CA[month]} ${year}`;
      }
      if (this.gridEl) this._renderGrid(year, month);
      this._renderEventsList();
    }

    _renderGrid(year, month) {
      // Dia de la setmana del primer dia (0=dg → convertim a Dl=0)
      const firstDow    = new Date(year, month, 1).getDay();
      const startOffset = firstDow === 0 ? 6 : firstDow - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrev  = new Date(year, month, 0).getDate();

      // Construïm la llista de cel·les (35 o 42 depenent de si cal 6 setmanes)
      const cells = [];
      for (let i = startOffset - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, m: month - 1, y: year, other: true });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, m: month, y: year, other: false });
      }
      const needed = cells.length > 35 ? 42 : 35;
      for (let d = 1; cells.length < needed; d++) {
        cells.push({ day: d, m: month + 1, y: year, other: true });
      }

      // Cel·la que rebrà tabindex=0 per a navegació amb teclat
      const focusKey = this._defaultFocusKey(year, month);

      this.gridEl.setAttribute('aria-label', `${MONTHS_CA[month]} ${year}`);
      this.gridEl.innerHTML = '';

      for (let row = 0; row < cells.length / 7; row++) {
        const rowEl = document.createElement('div');
        rowEl.setAttribute('role', 'row');
        rowEl.style.display = 'contents';

        for (let col = 0; col < 7; col++) {
          const { day, m, y, other } = cells[row * 7 + col];
          const date = new Date(y, m, day);
          const key  = toKey(date);
          const isToday    = sameDay(date, this.today);
          const isSelected = sameDay(date, this.selected);
          const isWeekend  = col >= 5;
          const dayEvents  = (!other && this.events[key]) ? this.events[key] : [];

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'calendar__cell';
          btn.dataset.cal = key;
          btn.setAttribute('role', 'gridcell');
          btn.setAttribute('tabindex', key === focusKey ? '0' : '-1');
          btn.setAttribute('aria-pressed', String(isSelected));

          const evSuffix = dayEvents.length
            ? ` · ${dayEvents.length} esdeveniment${dayEvents.length > 1 ? 's' : ''}`
            : '';
          btn.setAttribute('aria-label',
            `${day} de ${MONTHS_CA[m]}${isToday ? ' (avui)' : ''}${evSuffix}`);

          if (other)      btn.classList.add('calendar__cell--other-month');
          if (isToday)    btn.classList.add('calendar__cell--today');
          if (isSelected) btn.classList.add('calendar__cell--selected');
          if (isWeekend)  btn.classList.add('calendar__cell--weekend');

          const numEl = document.createElement('span');
          numEl.className = 'calendar__day-num';
          numEl.setAttribute('aria-hidden', 'true');
          numEl.textContent = String(day);
          btn.appendChild(numEl);

          if (dayEvents.length) {
            const dotsEl = document.createElement('span');
            dotsEl.className = 'calendar__dots';
            dotsEl.setAttribute('aria-hidden', 'true');
            dayEvents.slice(0, 3).forEach(ev => {
              const dot = document.createElement('span');
              dot.className = `calendar__dot calendar__dot--${ev.type || 'event'}`;
              dotsEl.appendChild(dot);
            });
            btn.appendChild(dotsEl);
          }

          btn.addEventListener('click', () => {
            // Dies d'altres mesos: navega a eixe mes i selecciona
            if (other) {
              this.viewed = new Date(y, m, 1);
              this._render();
              requestAnimationFrame(() => {
                const target = this.gridEl.querySelector(`[data-cal="${key}"]`);
                if (target) { target.click(); target.focus(); }
              });
              return;
            }
            this.selectDate(date);
          });

          rowEl.appendChild(btn);
        }
        this.gridEl.appendChild(rowEl);
      }
    }

    // Determina quina cel·la ha de tindre tabindex=0 en renderitzar
    _defaultFocusKey(year, month) {
      if (this.selected &&
          this.selected.getFullYear() === year &&
          this.selected.getMonth()    === month) {
        return toKey(this.selected);
      }
      if (this.today.getFullYear() === year && this.today.getMonth() === month) {
        return toKey(this.today);
      }
      return `${year}-${String(month + 1).padStart(2, '0')}-01`;
    }

    _renderEventsList() {
      if (!this.eventsEl) return;
      this.eventsEl.innerHTML = '';

      if (!this.selected) {
        const hint = document.createElement('p');
        hint.className = 'calendar__events-hint';
        hint.textContent = 'Selecciona un dia per veure els esdeveniments.';
        this.eventsEl.appendChild(hint);
        return;
      }

      const key = toKey(this.selected);
      const dayEvents = this.events[key] || [];
      const dayFmt = this.selected.toLocaleDateString('ca-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
      });

      if (!dayEvents.length) {
        const empty = document.createElement('p');
        empty.className = 'calendar__events-hint';
        empty.textContent = `Cap esdeveniment per al ${dayFmt}.`;
        this.eventsEl.appendChild(empty);
        return;
      }

      dayEvents.forEach(ev => {
        const li = document.createElement('li');
        li.className = 'calendar__event-item';

        const dot = document.createElement('span');
        dot.className = `calendar__event-dot calendar__dot--${ev.type || 'event'}`;
        dot.setAttribute('aria-hidden', 'true');

        const info = document.createElement('div');
        info.className = 'calendar__event-info';

        const title = document.createElement('span');
        title.className = 'calendar__event-title';
        title.textContent = ev.title;
        info.appendChild(title);

        if (ev.meta) {
          const meta = document.createElement('span');
          meta.className = 'calendar__event-meta';
          meta.textContent = ev.meta;
          info.appendChild(meta);
        }

        li.appendChild(dot);
        li.appendChild(info);
        this.eventsEl.appendChild(li);
      });
    }

    // ── Navegació per teclat (roving tabindex) ─────────────

    _bindKeyboard() {
      this.gridEl.addEventListener('keydown', e => {
        const btn = e.target.closest('.calendar__cell');
        if (!btn) return;

        const cells = Array.from(this.gridEl.querySelectorAll('.calendar__cell'));
        const idx   = cells.indexOf(btn);
        let next    = null;

        switch (e.key) {
          case 'ArrowRight': next = cells[idx + 1]; break;
          case 'ArrowLeft':  next = cells[idx - 1]; break;
          case 'ArrowDown':  next = cells[idx + 7]; break;
          case 'ArrowUp':    next = cells[idx - 7]; break;
          case 'PageUp':
            e.preventDefault();
            this.prevMonth();
            return;
          case 'PageDown':
            e.preventDefault();
            this.nextMonth();
            return;
          case 'Enter':
          case ' ':
            e.preventDefault();
            btn.click();
            return;
          default: return;
        }

        if (next) {
          e.preventDefault();
          cells.forEach(c => c.setAttribute('tabindex', '-1'));
          next.setAttribute('tabindex', '0');
          next.focus();
        } else {
          // Límit del mes: navega al mes anterior/següent
          e.preventDefault();
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.nextMonth();
          else this.prevMonth();
        }
      });
    }
  }

  // ── Auto-inicialització ──────────────────────────────────
  function initAll(root) {
    (root || document).querySelectorAll('.calendar').forEach(el => {
      if (!el._uaCalendar) el._uaCalendar = new UACalendar(el);
    });
  }

  document.addEventListener('DOMContentLoaded', () => initAll());

  window.UACalendar  = UACalendar;
  window.uaInitCalendar = initAll;
})();


/* ── components/context-selector/context-selector.js ───── */

// ══════════════════════════════════════════════════════════
// UA Design System · ContextSelector — selector de context
// persistent (assignatura, equip...) amb opcions enriquides
// ARIA: role="listbox" + role="option" + aria-selected
// ══════════════════════════════════════════════════════════

class UAContextSelector {
  constructor(el) {
    this._el        = el;
    this._trigger   = el.querySelector('.ctx-selector__trigger');
    this._valueEl   = el.querySelector('.ctx-selector__trigger-value');
    this._metaEl    = el.querySelector('.ctx-selector__trigger-meta');
    this._dropdown  = el.querySelector('.ctx-selector__dropdown');
    this._list      = el.querySelector('.ctx-selector__list');
    this._search    = el.querySelector('.ctx-selector__search');
    this._isOpen    = false;
    this._activeIdx = -1;
    this._outsideHandler = null;
    this._scrollHandler  = null;
    this._resizeHandler  = null;

    this._bind();
  }

  // ── Consultes de DOM ───────────────────────────────── //

  _allOptions() {
    return Array.from(this._list.querySelectorAll('.ctx-selector__option'));
  }

  _visibleOptions() {
    return this._allOptions().filter(o => !o.hidden);
  }

  // ── Obertura / tancament ───────────────────────────── //

  open() {
    if (this._isOpen || this._el.classList.contains('ctx-selector--disabled')) return;
    this._isOpen = true;
    this._el.classList.add('ctx-selector--open');
    this._dropdown.removeAttribute('hidden');
    this._trigger.setAttribute('aria-expanded', 'true');

    // Posiciona el dropdown com a fixed per escapar de l'overflow del contenidor
    this._positionDropdown();

    // Tanca si l'usuari fa scroll o redimensiona (el dropdown quedaria desplaçat)
    this._scrollHandler = () => this.close();
    this._resizeHandler = () => this.close();
    window.addEventListener('scroll', this._scrollHandler, { capture: true, passive: true });
    window.addEventListener('resize', this._resizeHandler, { passive: true });

    // Destaca l'opció seleccionada o la primera visible
    requestAnimationFrame(() => {
      if (this._search) {
        this._search.focus();
      } else {
        const selected = this._allOptions().find(o => o.getAttribute('aria-selected') === 'true');
        const visible  = this._visibleOptions();
        const idx = selected ? visible.indexOf(selected) : 0;
        this._setActive(idx >= 0 ? idx : 0);
        this._visibleOptions()[this._activeIdx]?.scrollIntoView({ block: 'nearest' });
      }
    });

    this._outsideHandler = e => {
      if (!this._el.contains(e.target)) this.close();
    };
    document.addEventListener('pointerdown', this._outsideHandler, true);
  }

  _positionDropdown() {
    const tr = this._trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - tr.bottom;
    const openUp = spaceBelow < 340 && tr.top > spaceBelow;
    const width = Math.max(tr.width, 280);

    // Evita que surti per la dreta del viewport
    let left = tr.left;
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);

    this._el.classList.toggle('ctx-selector--up', openUp);

    Object.assign(this._dropdown.style, {
      position: 'fixed',
      left:     left + 'px',
      width:    width + 'px',
      right:    'auto',
      top:      openUp ? 'auto' : (tr.bottom + 4) + 'px',
      bottom:   openUp ? (window.innerHeight - tr.top + 4) + 'px' : 'auto',
    });
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._el.classList.remove('ctx-selector--open', 'ctx-selector--up');
    this._dropdown.setAttribute('hidden', '');
    this._trigger.setAttribute('aria-expanded', 'false');
    this._clearActive();

    // Neteja els estils inline del posicionament fixed
    ['position', 'left', 'top', 'bottom', 'width', 'right']
      .forEach(p => (this._dropdown.style[p] = ''));

    if (this._search) {
      this._search.value = '';
      this._filterOptions('');
    }

    if (this._outsideHandler) {
      document.removeEventListener('pointerdown', this._outsideHandler, true);
      this._outsideHandler = null;
    }
    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler, { capture: true });
      this._scrollHandler = null;
    }
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }

    this._trigger.focus();
  }

  // ── Selecció ───────────────────────────────────────── //

  select(idx) {
    const opts = this._visibleOptions();
    const opt  = opts[idx];
    if (!opt) return;

    // Actualitza aria-selected en totes les opcions
    this._allOptions().forEach(o => o.setAttribute('aria-selected', 'false'));
    this._allOptions().forEach(o => o.classList.remove('ctx-selector__option--selected'));
    opt.setAttribute('aria-selected', 'true');
    opt.classList.add('ctx-selector__option--selected');

    // Actualitza el trigger
    const name = opt.querySelector('.ctx-selector__option-name')?.textContent.trim() ?? '';
    const meta = opt.querySelector('.ctx-selector__option-meta')?.textContent.trim() ?? '';

    this._valueEl.textContent = name;
    this._valueEl.classList.remove('ctx-selector__trigger-value--placeholder');
    if (this._metaEl) this._metaEl.textContent = meta;

    // Sincronitza la icona del trigger amb la de l'opció
    const optIcon     = opt.querySelector('.ctx-selector__option-icon');
    const triggerIcon = this._trigger.querySelector('.ctx-selector__trigger-icon');
    if (triggerIcon && optIcon) {
      const tiClass = Array.from(optIcon.classList).find(c => c.startsWith('ti-'));
      if (tiClass) triggerIcon.className = `ti ${tiClass} ctx-selector__trigger-icon`;
    }

    const value = opt.dataset.value ?? name;

    this._el.dispatchEvent(new CustomEvent('ua:ctx:change', {
      bubbles: true,
      detail: { value, name, meta },
    }));

    this.close();
  }

  // ── Navegació per teclat ───────────────────────────── //

  _setActive(idx) {
    const opts = this._visibleOptions();
    this._clearActive();
    if (idx < 0 || idx >= opts.length) return;
    const opt = opts[idx];
    opt.classList.add('ctx-selector__option--focused');
    opt.scrollIntoView({ block: 'nearest' });
    this._activeIdx = idx;
  }

  _clearActive() {
    this._allOptions().forEach(o => o.classList.remove('ctx-selector__option--focused'));
    this._activeIdx = -1;
  }

  _handleKey(e) {
    const opts = this._visibleOptions();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._setActive(Math.min(this._activeIdx + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._setActive(Math.max(this._activeIdx - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        this._setActive(0);
        break;
      case 'End':
        e.preventDefault();
        this._setActive(opts.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this._activeIdx >= 0) this.select(this._activeIdx);
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // ── Filtre de cerca ────────────────────────────────── //

  _filterOptions(q) {
    q = q.toLowerCase().trim();

    this._allOptions().forEach(opt => {
      opt.hidden = q !== '' && !opt.textContent.toLowerCase().includes(q);
    });

    // Amaga grups sense opcions visibles
    this._el.querySelectorAll('.ctx-selector__group').forEach(group => {
      const hasVisible = Array.from(group.querySelectorAll('.ctx-selector__option'))
        .some(o => !o.hidden);
      group.hidden = !hasVisible;
    });

    // Gestiona els divisors: amaga el del primer grup visible
    const visibleGroups = Array.from(
      this._el.querySelectorAll('.ctx-selector__group:not([hidden])')
    );
    visibleGroups.forEach((group, i) => {
      const divider = group.querySelector('.ctx-selector__group-divider');
      if (divider) divider.hidden = (i === 0);
    });

    // Missatge "cap resultat"
    let emptyEl = this._list.querySelector('.ctx-selector__empty');
    const hasAny = this._allOptions().some(o => !o.hidden);
    if (!hasAny) {
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'ctx-selector__empty';
        emptyEl.setAttribute('role', 'status');
        emptyEl.setAttribute('aria-live', 'polite');
        emptyEl.textContent = 'Cap resultat';
        this._list.appendChild(emptyEl);
      }
      emptyEl.hidden = false;
    } else if (emptyEl) {
      emptyEl.hidden = true;
    }

    this._setActive(0);
  }

  // ── Binding d'events ───────────────────────────────── //

  _bind() {
    // Trigger: clic i teclat
    this._trigger.addEventListener('click', e => {
      e.stopPropagation();
      this._isOpen ? this.close() : this.open();
    });

    this._trigger.addEventListener('keydown', e => {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        this.open();
      }
    });

    // Clic en una opció
    this._list.addEventListener('click', e => {
      const opt = e.target.closest('.ctx-selector__option');
      if (!opt) return;
      const idx = this._visibleOptions().indexOf(opt);
      if (idx >= 0) this.select(idx);
    });

    // Hover: ressalta l'opció
    this._list.addEventListener('mouseover', e => {
      const opt = e.target.closest('.ctx-selector__option');
      if (!opt) return;
      const idx = this._visibleOptions().indexOf(opt);
      if (idx >= 0) this._setActive(idx);
    });

    // Teclat sobre la llista
    this._list.addEventListener('keydown', e => this._handleKey(e));

    // Camp de cerca
    if (this._search) {
      this._search.addEventListener('input', () => this._filterOptions(this._search.value));
      this._search.addEventListener('keydown', e => this._handleKey(e));
    }
  }

  // ── API pública ────────────────────────────────────── //

  selectByValue(value) {
    const opt = this._allOptions().find(o => o.dataset.value === value);
    if (!opt) return;
    const idx = this._visibleOptions().indexOf(opt);
    if (idx >= 0) this.select(idx);
    else {
      // Si no és visible (cerca activa), selecciona directament
      this._allOptions().forEach(o => {
        o.setAttribute('aria-selected', 'false');
        o.classList.remove('ctx-selector__option--selected');
      });
      opt.setAttribute('aria-selected', 'true');
      opt.classList.add('ctx-selector__option--selected');
    }
  }

  getValue() {
    const sel = this._allOptions().find(o => o.getAttribute('aria-selected') === 'true');
    return sel ? {
      value: sel.dataset.value,
      name: sel.querySelector('.ctx-selector__option-name')?.textContent.trim(),
      meta: sel.querySelector('.ctx-selector__option-meta')?.textContent.trim(),
    } : null;
  }
}

// ── Auto-init per a [data-ctx-selector] ──────────────── //

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-ctx-selector]').forEach(el => {
    el._uaCtxSelector = new UAContextSelector(el);
  });
});


/* ── components/copy-button/copy-button.js ─────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · CopyButton — còpia al portapapers
// ══════════════════════════════════════════════════════════

function uaCopy(btn) {
  // Text a copiar: atribut data-copy o text del .copy-wrap__text germà
  const text = btn.dataset.copy
    ?? btn.closest('.copy-wrap')?.querySelector('.copy-wrap__text')?.textContent?.trim();

  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const icon  = btn.querySelector('.copy-btn__icon');
    const label = btn.querySelector('.copy-btn__label');
    const prevIcon  = icon?.className;
    const prevLabel = label?.textContent;
    const prevAria  = btn.getAttribute('aria-label');

    // Canvi morfològic: icona còpia → check, text "Copiat!"
    btn.classList.add('copy-btn--copied', 'copy-wrap__btn--copied');
    if (icon)  icon.className = 'copy-btn__icon ti ti-check';
    if (label) label.textContent = 'Copiat!';
    btn.setAttribute('aria-label', 'Copiat al portapapers');

    // Reverteix als 2 segons
    setTimeout(() => {
      btn.classList.remove('copy-btn--copied', 'copy-wrap__btn--copied');
      if (icon  && prevIcon)  icon.className   = prevIcon;
      if (label && prevLabel) label.textContent = prevLabel;
      btn.setAttribute('aria-label', prevAria || 'Copia al portapapers');
    }, 2000);
  });
}

// Auto-init per a elements amb data-copy-btn
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-copy-btn]').forEach(btn => {
    btn.addEventListener('click', () => uaCopy(btn));
  });
});


/* ── components/date-picker/date-picker.js ─────────────── */

// ── UADatePicker ───────────────────────────────────────────────
// Selector de data i rang de dates, accessible per teclat.
// Patró ARIA: grid de calendari, roving tabindex, role="gridcell".
//
// Ús bàsic:
//   <div class="date-picker" id="dp1">…</div>
//   // S'inicialitza automàticament via DOMContentLoaded
//
// Ús programàtic:
//   const dp = document.getElementById('dp1')._uaDP;
//   dp.getValue()     → Date | null
//   dp.setValue(date)
//   dp.clear()
//
// Events:
//   'ua:dp:change'  → detail: { value: Date }           (mode simple)
//   'ua:dp:change'  → detail: { start: Date, end: Date } (mode rang)
// ──────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const DIES_CURT = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
  const MESOS = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDate(d) {
    if (!d) return '';
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  function isSameDay(a, b) {
    return a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function isBetween(d, a, b) {
    if (!d || !a || !b) return false;
    const t = d.getTime();
    const lo = Math.min(a.getTime(), b.getTime());
    const hi = Math.max(a.getTime(), b.getTime());
    return t > lo && t < hi;
  }

  function dateFromStr(str) {
    // Format intern: YYYY-MM-DD
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function dateKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  class UADatePicker {
    constructor(el) {
      this.el = el;
      this.isRange = el.hasAttribute('data-range');

      this.inputEl = el.querySelector('.date-picker__input');
      this.inputEndEl = el.querySelector('.date-picker__input-end');
      this.popup = el.querySelector('.date-picker__popup');
      this.monthLabel = el.querySelector('.date-picker__month-label');
      this.grid = el.querySelector('.date-picker__grid');
      this.rangeHint = el.querySelector('.date-picker__range-hint');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.today = today;
      this.viewYear = today.getFullYear();
      this.viewMonth = today.getMonth();

      // Estat de selecció
      this.selected = null;    // mode simple
      this.rangeStart = null;  // mode rang
      this.rangeEnd = null;    // mode rang
      this.hoverDay = null;    // previsualització rang

      this._isOpen = false;
      this._activeInput = 'start';

      this._bind();
    }

    // ── API pública ──────────────────────────────────────────

    getValue() {
      if (this.isRange) return { start: this.rangeStart, end: this.rangeEnd };
      return this.selected;
    }

    setValue(date) {
      if (!this.isRange) {
        this.selected = date;
        this.inputEl.value = formatDate(date);
      }
    }

    clear() {
      this.selected = null;
      this.rangeStart = null;
      this.rangeEnd = null;
      if (this.inputEl) this.inputEl.value = '';
      if (this.inputEndEl) this.inputEndEl.value = '';
    }

    open(inputTarget) {
      this._activeInput = inputTarget || 'start';
      this._isOpen = true;

      // Si s'obre via "Fins a" amb rang complet → conserva l'inici, permet canviar la fi
      if (this.isRange && this._activeInput === 'end' && this.rangeStart && this.rangeEnd) {
        this.rangeEnd = null;
        if (this.inputEndEl) this.inputEndEl.value = '';
        this.hoverDay = null;
      }

      // Centra la vista en la data rellevant
      const ref = this.isRange
        ? (this._activeInput === 'end' ? this.rangeEnd || this.rangeStart : this.rangeStart)
        : this.selected;
      if (ref) { this.viewYear = ref.getFullYear(); this.viewMonth = ref.getMonth(); }

      this.popup.removeAttribute('hidden');
      this._positionPopup();
      this._render();

      // Marca l'input actiu com a expanded
      this.inputEl.setAttribute('aria-expanded',
        (this.isRange && this._activeInput === 'end') ? 'false' : 'true');
      if (this.inputEndEl) {
        this.inputEndEl.setAttribute('aria-expanded',
          (this.isRange && this._activeInput === 'end') ? 'true' : 'false');
      }

      requestAnimationFrame(() => {
        const focus =
          this.grid.querySelector('[aria-selected="true"]') ||
          this.grid.querySelector('[aria-current="date"]') ||
          this.grid.querySelector('.date-picker__day:not([disabled])');
        if (focus) focus.focus();
      });
    }

    close() {
      this._isOpen = false;
      this.hoverDay = null;
      this.popup.setAttribute('hidden', '');
      this.popup.classList.remove('date-picker__popup--up');
      this.inputEl.setAttribute('aria-expanded', 'false');
      if (this.inputEndEl) this.inputEndEl.setAttribute('aria-expanded', 'false');
    }

    prevMonth() {
      if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; }
      else this.viewMonth--;
      this._render();
    }

    nextMonth() {
      if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; }
      else this.viewMonth++;
      this._render();
    }

    // ── Renderització ────────────────────────────────────────

    _render() {
      this.monthLabel.textContent = `${MESOS[this.viewMonth]} ${this.viewYear}`;
      this._renderGrid();
      this._updateRangeHint();
    }

    _renderGrid() {
      const y = this.viewYear;
      const m = this.viewMonth;

      // Primer dia del mes (0=dg, 1=dl, ...) → convertim a base dilluns
      let dow = new Date(y, m, 1).getDay();
      dow = (dow + 6) % 7; // 0=Dl, 6=Dg

      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const daysInPrev = new Date(y, m, 0).getDate();

      let html = '';
      let cur = 1;
      let next = 1;

      for (let row = 0; row < 6; row++) {
        html += `<div class="date-picker__week" role="row">`;
        for (let col = 0; col < 7; col++) {
          const idx = row * 7 + col;
          let day, dm, dy, own = true;

          if (idx < dow) {
            day = daysInPrev - dow + idx + 1;
            dm = m - 1; dy = y;
            if (dm < 0) { dm = 11; dy--; }
            own = false;
          } else if (cur <= daysInMonth) {
            day = cur++; dm = m; dy = y;
          } else {
            day = next++; dm = m + 1; dy = y;
            if (dm > 11) { dm = 0; dy++; }
            own = false;
          }

          const d = new Date(dy, dm, day);
          const key = dateKey(d);
          const isToday = isSameDay(d, this.today);

          // Classes de selecció
          let isSel = false, isStart = false, isEnd = false, isIn = false;
          if (this.isRange) {
            isStart = isSameDay(d, this.rangeStart);
            isEnd = isSameDay(d, this.rangeEnd);
            const preview = this.rangeStart && !this.rangeEnd ? this.hoverDay : null;
            isIn = isBetween(d, this.rangeStart, this.rangeEnd || preview);
          } else {
            isSel = isSameDay(d, this.selected);
          }

          const cls = [
            'date-picker__day',
            !own && 'date-picker__day--other',
            isToday && 'date-picker__day--today',
            isSel && 'date-picker__day--selected',
            isStart && 'date-picker__day--range-start',
            isEnd && 'date-picker__day--range-end',
            isIn && 'date-picker__day--in-range',
          ].filter(Boolean).join(' ');

          const tabIdx = (isSel || isStart || isEnd || isToday) ? 0 : -1;
          const ariaLabel = `${day} de ${MESOS[dm]} de ${dy}`;
          const ariaSel = (isSel || isStart || isEnd) ? 'true' : 'false';
          const ariaCur = isToday ? ' aria-current="date"' : '';

          html += `<button class="${cls}" role="gridcell" tabindex="${tabIdx}"
            aria-label="${ariaLabel}" aria-selected="${ariaSel}"${ariaCur}
            data-dp="${key}">${day}</button>`;
        }
        html += `</div>`;
      }

      this.grid.innerHTML = html;

      // Assegura que almenys un dia té tabindex=0
      if (!this.grid.querySelector('[tabindex="0"]')) {
        const first = this.grid.querySelector('.date-picker__day:not(.date-picker__day--other)');
        if (first) first.setAttribute('tabindex', '0');
      }

      // Events dels dies
      this.grid.querySelectorAll('.date-picker__day').forEach(btn => {
        btn.addEventListener('click', () => this._selectDay(btn.dataset.dp));
        if (this.isRange) {
          btn.addEventListener('mouseenter', () => {
            if (this.rangeStart && !this.rangeEnd) {
              const newHover = dateFromStr(btn.dataset.dp);
              // Comprova que el dia ha canviat abans de re-renderitzar
              // Sense esta guàrdia, _renderGrid() reconstrueix el DOM i
              // el nou element dispara mouseenter immediatament → bucle infinit.
              if (!isSameDay(newHover, this.hoverDay)) {
                this.hoverDay = newHover;
                this._renderGrid();
              }
            }
          });
        }
      });

      // Actualitza aria-label del grid
      this.grid.setAttribute('aria-label', `${MESOS[m]} ${y}`);
    }

    _updateRangeHint() {
      if (!this.rangeHint) return;
      if (!this.isRange) return;

      if (!this.rangeStart) {
        this.rangeHint.textContent = 'Seleccioneu la data d\'inici';
      } else if (!this.rangeEnd) {
        this.rangeHint.textContent = `Inici: ${formatDate(this.rangeStart)} — Seleccioneu la data de fi`;
      } else {
        this.rangeHint.textContent = `${formatDate(this.rangeStart)} → ${formatDate(this.rangeEnd)}`;
      }
    }

    _selectDay(key) {
      const d = dateFromStr(key);

      if (!this.isRange) {
        this.selected = d;
        this.inputEl.value = formatDate(d);
        this.close();
        this.inputEl.focus();
        this.el.dispatchEvent(new CustomEvent('ua:dp:change', {
          bubbles: true, detail: { value: d },
        }));
        return;
      }

      // Mode rang
      // "Des de" o primer clic sense inici estableix l'inici
      // "Fins a" (després d'haver netejat rangeEnd a open()) completa el rang
      if (this._activeInput === 'start' || !this.rangeStart) {
        this.rangeStart = d;
        this.rangeEnd = null;
        this.hoverDay = null;
        this.inputEl.value = formatDate(d);
        if (this.inputEndEl) this.inputEndEl.value = '';
        this._activeInput = 'end';
        this._render();
      } else {
        // Completa el rang
        let start = this.rangeStart;
        let end = d;
        if (end < start) { [start, end] = [end, start]; }
        this.rangeStart = start;
        this.rangeEnd = end;
        this.inputEl.value = formatDate(start);
        if (this.inputEndEl) this.inputEndEl.value = formatDate(end);
        this._render();
        // Breu pausa per veure el rang complet, llavors tanca
        setTimeout(() => {
          this.close();
          this.inputEl.focus();
          this.el.dispatchEvent(new CustomEvent('ua:dp:change', {
            bubbles: true, detail: { start, end },
          }));
        }, 120);
      }
    }

    // ── Posicionament ────────────────────────────────────────

    _positionPopup() {
      const rect = this.el.getBoundingClientRect();
      const approxHeight = 340;
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < approxHeight && rect.top > approxHeight) {
        this.popup.classList.add('date-picker__popup--up');
      } else {
        this.popup.classList.remove('date-picker__popup--up');
      }
    }

    // ── Gestió d'events ──────────────────────────────────────

    _bind() {
      // Obrir popup
      const openStart = () => this.open('start');
      const openEnd = () => this.open('end');

      this.inputEl.addEventListener('click', openStart);
      this.inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStart(); }
      });

      const startBtn = this.el.querySelector('.date-picker__btn:not(.date-picker__btn-end)');
      if (startBtn) startBtn.addEventListener('click', openStart);

      if (this.inputEndEl) {
        this.inputEndEl.addEventListener('click', openEnd);
        this.inputEndEl.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnd(); }
        });
      }
      const endBtn = this.el.querySelector('.date-picker__btn-end');
      if (endBtn) endBtn.addEventListener('click', openEnd);

      // Botons prev/next mes
      const prev = this.el.querySelector('.date-picker__prev');
      const next = this.el.querySelector('.date-picker__next');
      if (prev) prev.addEventListener('click', () => this.prevMonth());
      if (next) next.addEventListener('click', () => this.nextMonth());

      // Tanca en clicar fora
      document.addEventListener('mousedown', e => {
        if (this._isOpen && !this.el.contains(e.target)) this.close();
      });

      // Teclat dins del popup
      this.popup.addEventListener('keydown', e => this._keydown(e));
    }

    _keydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
        this.inputEl.focus();
        return;
      }

      const focused = this.popup.querySelector(':focus');
      if (!focused?.classList.contains('date-picker__day')) return;

      const d = dateFromStr(focused.dataset.dp);
      let next = new Date(d);

      switch (e.key) {
        case 'ArrowRight': next.setDate(next.getDate() + 1); break;
        case 'ArrowLeft':  next.setDate(next.getDate() - 1); break;
        case 'ArrowDown':  next.setDate(next.getDate() + 7); break;
        case 'ArrowUp':    next.setDate(next.getDate() - 7); break;
        case 'PageDown':
          e.shiftKey
            ? next.setFullYear(next.getFullYear() + 1)
            : next.setMonth(next.getMonth() + 1);
          break;
        case 'PageUp':
          e.shiftKey
            ? next.setFullYear(next.getFullYear() - 1)
            : next.setMonth(next.getMonth() - 1);
          break;
        case 'Home': next.setDate(1); break;
        case 'End': next = new Date(d.getFullYear(), d.getMonth() + 1, 0); break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this._selectDay(focused.dataset.dp);
          return;
        default: return;
      }

      e.preventDefault();

      // Navega al mes si cal
      if (next.getFullYear() !== this.viewYear || next.getMonth() !== this.viewMonth) {
        this.viewYear = next.getFullYear();
        this.viewMonth = next.getMonth();
        if (this.isRange && this.rangeStart && !this.rangeEnd) {
          this.hoverDay = next;
        }
        this._render();
      }

      // Mou el focus i actualitza hover si rang
      const key = dateKey(next);
      const target = this.grid.querySelector(`[data-dp="${key}"]`);
      if (target) {
        this.grid.querySelectorAll('.date-picker__day').forEach(b => b.setAttribute('tabindex', '-1'));
        target.setAttribute('tabindex', '0');
        target.focus();
        if (this.isRange && this.rangeStart && !this.rangeEnd) {
          this.hoverDay = next;
          this._renderGrid();
          const t2 = this.grid.querySelector(`[data-dp="${key}"]`);
          if (t2) { t2.setAttribute('tabindex', '0'); t2.focus(); }
        }
      }
    }
  }

  // ── Auto-inicialització ──────────────────────────────────────
  function initAll(root) {
    (root || document).querySelectorAll('.date-picker').forEach(el => {
      if (!el._uaDP) {
        el._uaDP = new UADatePicker(el);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => initAll());

  window.UADatePicker = UADatePicker;
  window.uaInitDatePickers = initAll;
})();


/* ── components/file-upload/file-upload.js ─────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · FileUpload — pujada de fitxer accessible
// ══════════════════════════════════════════════════════════

class UAFileUpload {
  constructor(el) {
    this._el       = el;
    this._zone     = el.querySelector('.file-upload__zone');
    this._input    = el.querySelector('input[type="file"]');
    this._list     = el.querySelector('.file-upload__list');
    this._files    = new Map();
    this._counter  = 0;
    this._dragCount = 0;

    this._bind();
  }

  _bind() {
    // La zona és un <button> que delega el clic a l'input ocult
    this._zone.addEventListener('click', () => this._input.click());
    this._zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._input.click();
      }
    });

    // Selecció via diàleg de fitxers
    this._input.addEventListener('change', () => {
      this._addFiles(Array.from(this._input.files));
      this._input.value = ''; // permet tornar a seleccionar el mateix fitxer
    });

    // Drag & drop — contador per evitar flickering en fills de la zona
    this._zone.addEventListener('dragenter', e => {
      e.preventDefault();
      this._dragCount++;
      this._el.classList.add('file-upload--dragover');
    });
    this._zone.addEventListener('dragover', e => e.preventDefault());
    this._zone.addEventListener('dragleave', () => {
      this._dragCount--;
      if (this._dragCount === 0) this._el.classList.remove('file-upload--dragover');
    });
    this._zone.addEventListener('drop', e => {
      e.preventDefault();
      this._dragCount = 0;
      this._el.classList.remove('file-upload--dragover');
      this._addFiles(Array.from(e.dataTransfer.files));
    });
  }

  _addFiles(files) {
    files.forEach(file => {
      const id    = `fu-${++this._counter}`;
      const error = this._validate(file);
      this._files.set(id, { file, error });
      this._renderItem(id, file, error);
    });
  }

  _validate(file) {
    const maxMb    = parseFloat(this._el.dataset.maxMb) || 10;
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Fitxer massa gran (${this._fmtSize(file.size)}). Màx. ${maxMb} MB.`;
    }
    const accept = this._input.getAttribute('accept');
    if (accept) {
      const ext  = '.' + file.name.split('.').pop().toLowerCase();
      const mime = file.type.toLowerCase();
      const ok = accept.split(',').map(s => s.trim()).some(a => {
        if (a === ext || a === mime) return true;
        if (a.endsWith('/*') && mime.startsWith(a.slice(0, -1))) return true;
        return false;
      });
      if (!ok) return `Tipus no permès (${ext}).`;
    }
    return null;
  }

  _renderItem(id, file, error) {
    const ext = file.name.split('.').pop().toLowerCase();
    const icons = {
      pdf: 'ti-file-type-pdf', doc: 'ti-file-type-doc', docx: 'ti-file-type-doc',
      xls: 'ti-file-spreadsheet', xlsx: 'ti-file-spreadsheet',
      jpg: 'ti-photo', jpeg: 'ti-photo', png: 'ti-photo', gif: 'ti-photo', svg: 'ti-photo',
      zip: 'ti-file-zip', mp4: 'ti-video', mp3: 'ti-music',
    };
    const icon = icons[ext] || 'ti-file';

    const li = document.createElement('li');
    li.className = `file-upload__item${error ? ' file-upload__item--error' : ''}`;
    li.dataset.fileId = id;
    li.innerHTML = `
      <i class="ti ${icon} file-upload__item-icon" aria-hidden="true"></i>
      <div class="file-upload__item-info">
        <div class="file-upload__item-name">${this._esc(file.name)}</div>
        ${error
          ? `<div class="file-upload__item-error-msg">${this._esc(error)}</div>`
          : `<div class="file-upload__item-size">${this._fmtSize(file.size)}</div>`}
      </div>
      <button class="file-upload__item-remove" type="button"
              aria-label="Elimina ${this._esc(file.name)}">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>
    `;
    li.querySelector('.file-upload__item-remove').addEventListener('click', () => {
      this._files.delete(id);
      li.remove();
    });
    this._list.appendChild(li);
  }

  _fmtSize(bytes) {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  _esc(s) {
    return s.replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // Retorna els fitxers vàlids (sense error) per a l'enviament del formulari
  getFiles() {
    return [...this._files.values()].filter(f => !f.error).map(f => f.file);
  }
}

// Auto-init per a elements amb data-file-upload
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-file-upload]').forEach(el => {
    el._uaFileUpload = new UAFileUpload(el);
  });
});


/* ── components/help-panel/help-panel.js ───────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · HelpPanel — drawer d'ajuda lateral
// WCAG: role="dialog", aria-modal, focus trap, retorn de focus
// ══════════════════════════════════════════════════════════

const HP_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

class UAHelpPanel {
  constructor({ id, onClose } = {}) {
    this.id      = id;
    this.onClose = onClose;
    this._triggerEl = null;
    this._overlay   = null;
    this._bound = {
      keydown:      this._onKeydown.bind(this),
      overlayClick: this._onOverlayClick.bind(this),
    };
  }

  open(triggerEl) {
    this._triggerEl = triggerEl ?? document.activeElement;
    this._overlay   = this.id
      ? document.getElementById(this.id)
      : this._overlay;
    if (!this._overlay) return;

    document.body.style.overflow = 'hidden';
    this._overlay.removeAttribute('hidden');
    this._overlay.classList.remove('help-panel-closing');

    // Focus al primer element focusable del panell
    const panel = this._overlay.querySelector('.help-panel');
    if (panel) {
      requestAnimationFrame(() => {
        (panel.querySelector(HP_FOCUSABLE) || panel).focus();
      });
    }

    document.addEventListener('keydown',  this._bound.keydown);
    this._overlay.addEventListener('click', this._bound.overlayClick);
  }

  close() {
    if (!this._overlay) return;

    this._overlay.classList.add('help-panel-closing');

    // Espera el final de l'animació (--transition-slow = 320ms)
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--transition-slow');
    const duration = parseInt(raw) || 320;

    setTimeout(() => {
      if (!this._overlay) return;
      this._overlay.setAttribute('hidden', '');
      this._overlay.classList.remove('help-panel-closing');
      document.body.style.overflow = '';
    }, duration);

    document.removeEventListener('keydown',  this._bound.keydown);
    this._overlay.removeEventListener('click', this._bound.overlayClick);

    // Retorna el focus a l'element que va obrir el panell
    if (this._triggerEl) {
      try { this._triggerEl.focus(); } catch (_) {}
    }

    if (this.onClose) this.onClose();
  }

  _onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
    if (e.key === 'Tab') this._trapFocus(e);
  }

  _onOverlayClick(e) {
    if (e.target === this._overlay) this.close();
  }

  _trapFocus(e) {
    const panel = this._overlay?.querySelector('.help-panel');
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll(HP_FOCUSABLE));
    if (!items.length) return;
    const first = items[0];
    const last  = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
}

// ── API global per a declarar panells per ID ──────────── //

const _helpPanelInstances = {};

function openHelpPanel(id, triggerEl) {
  if (!_helpPanelInstances[id]) {
    _helpPanelInstances[id] = new UAHelpPanel({ id });
  }
  _helpPanelInstances[id].open(triggerEl ?? document.activeElement);
}

function closeHelpPanel(id) {
  if (_helpPanelInstances[id]) {
    _helpPanelInstances[id].close();
  } else {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  }
}


/* ── components/input/input.js ─────────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Input — shake d'error
// Principi d'interacció: microinteracció de feedback immediat
// ══════════════════════════════════════════════════════════

// Dispara l'animació de shake en un input. Pot cridar-se manualment
// o s'activa automàticament quan s'afig .input-error via JS.
function shakeInput(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  el.classList.remove('input-shake');
  void el.offsetWidth; // força reflow per permetre re-trigger
  el.classList.add('input-shake');

  el.addEventListener('animationend', () => {
    el.classList.remove('input-shake');
  }, { once: true });
}

// Observa canvis de classe en un .input i dispara shake
// quan .input-error s'afig dinàmicament (no en càrrega inicial).
function observeInput(el) {
  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.attributeName !== 'class') continue;
      const hadError = (m.oldValue || '').split(/\s+/).includes('input-error');
      const hasError = el.classList.contains('input-error');
      if (!hadError && hasError) shakeInput(el);
    }
  });
  mo.observe(el, { attributes: true, attributeOldValue: true });
  return mo;
}

// Auto-init: observa tots els .input existents al DOM
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.input').forEach(observeInput);
});

// API pública
const UAInput = { shake: shakeInput, observe: observeInput };


/* ── components/select/select.js ───────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Select custom (combobox accessible)
// ARIA: role=combobox + role=listbox + role=option
// Teclat: fletxes, Enter, Escape, Home, End, Tab
// ══════════════════════════════════════════════════════════

class UASelect {
  constructor(container) {
    this.container  = container;
    this.trigger    = container.querySelector('.select__trigger');
    this.valueEl    = container.querySelector('.select__value');
    this.listbox    = container.querySelector('.select__listbox');
    this.searchInput = container.querySelector('.select__search');
    this.isOpen     = false;
    this.activeIdx  = -1;
    this._outsideHandler = null;

    // Índex de l'opció seleccionada dins this._allOptions()
    this.selectedValue = null;

    this._bindEvents();
  }

  // ── Llista d'opcions (totes, per a tracking de selecció) ──
  _allOptions() {
    return Array.from(this.listbox.querySelectorAll('.select__option'));
  }

  // ── Opcions visibles (filtrades en cerca) ─────────────────
  _visibleOptions() {
    return this._allOptions().filter(o => !o.hidden);
  }

  // ── Obrir ─────────────────────────────────────────────────
  open() {
    if (this.container.classList.contains('select--disabled')) return;
    if (this.isOpen) return;

    this.isOpen = true;
    this.container.classList.add('select--open');
    this.listbox.removeAttribute('hidden');
    this.trigger.setAttribute('aria-expanded', 'true');

    this._adjustPosition();

    if (this.searchInput) {
      requestAnimationFrame(() => this.searchInput.focus());
    } else {
      // Posiciona el focus a l'opció seleccionada o la primera
      const selected = this._allOptions().find(o => o.getAttribute('aria-selected') === 'true');
      const opts = this._visibleOptions();
      const startIdx = selected ? opts.indexOf(selected) : 0;
      this.activeIdx = startIdx >= 0 ? startIdx : 0;
      this._setActive(this.activeIdx);
    }

    // Tanca en clic fora
    this._outsideHandler = (e) => {
      if (!this.container.contains(e.target)) this.close();
    };
    document.addEventListener('pointerdown', this._outsideHandler, true);
  }

  // ── Tancar ────────────────────────────────────────────────
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.container.classList.remove('select--open', 'select--up');
    this.listbox.setAttribute('hidden', '');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.removeAttribute('aria-activedescendant');
    this._clearActive();

    if (this._outsideHandler) {
      document.removeEventListener('pointerdown', this._outsideHandler, true);
      this._outsideHandler = null;
    }

    // Reinicia la cerca
    if (this.searchInput) {
      this.searchInput.value = '';
      this._filterOptions('');
    }

    this.trigger.focus();
  }

  // ── Seleccionar opció per índex dins visibles ─────────────
  select(idx) {
    const opts = this._visibleOptions();
    const opt = opts[idx];
    if (!opt || opt.getAttribute('aria-disabled') === 'true') return;

    // Neteja la selecció anterior
    this._allOptions().forEach(o => o.setAttribute('aria-selected', 'false'));
    opt.setAttribute('aria-selected', 'true');

    const label = opt.querySelector('.select__option-label')?.textContent.trim()
      ?? opt.textContent.trim();

    this.valueEl.textContent = label;
    this.valueEl.classList.remove('select__value--placeholder');
    this.selectedValue = opt.dataset.value ?? label;

    // Esdeveniment personalitzat per a integració externa
    this.container.dispatchEvent(new CustomEvent('ua:select:change', {
      detail: { value: this.selectedValue, label },
      bubbles: true,
    }));

    this.close();
  }

  // ── Navegació per teclat (trigger) ────────────────────────
  _handleTriggerKey(e) {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        this.open();
        break;
    }
  }

  // ── Navegació per teclat (llista) ─────────────────────────
  _handleListKey(e) {
    const opts = this._visibleOptions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.activeIdx = Math.min(this.activeIdx + 1, opts.length - 1);
        this._setActive(this.activeIdx);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.activeIdx = Math.max(this.activeIdx - 1, 0);
        this._setActive(this.activeIdx);
        break;
      case 'Home':
        e.preventDefault();
        this.activeIdx = 0;
        this._setActive(0);
        break;
      case 'End':
        e.preventDefault();
        this.activeIdx = opts.length - 1;
        this._setActive(opts.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.activeIdx >= 0) this.select(this.activeIdx);
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // ── Marca l'opció activa (focus visual + aria-activedescendant) ──
  _setActive(idx) {
    const opts = this._visibleOptions();
    this._clearActive();
    if (idx < 0 || idx >= opts.length) return;

    const opt = opts[idx];
    opt.classList.add('select__option--focused');
    this.trigger.setAttribute('aria-activedescendant', opt.id);
    opt.scrollIntoView({ block: 'nearest' });
    this.activeIdx = idx;
  }

  _clearActive() {
    this._allOptions().forEach(o => o.classList.remove('select__option--focused'));
  }

  // ── Filtra opcions (variant cercable) ─────────────────────
  _filterOptions(query) {
    const q = query.toLowerCase().trim();
    const opts = this._allOptions();

    opts.forEach(opt => {
      const text = opt.textContent.toLowerCase();
      opt.hidden = q !== '' && !text.includes(q);
    });

    // Missatge d'estat buit
    let emptyEl = this.listbox.querySelector('.select__empty');
    const hasVisible = opts.some(o => !o.hidden);

    if (!hasVisible) {
      if (!emptyEl) {
        emptyEl = document.createElement('li');
        emptyEl.className = 'select__empty';
        emptyEl.setAttribute('role', 'status');
        emptyEl.textContent = 'Cap resultat trobat';
        this.listbox.appendChild(emptyEl);
      }
      emptyEl.hidden = false;
    } else if (emptyEl) {
      emptyEl.hidden = true;
    }

    this.activeIdx = 0;
    this._setActive(0);
  }

  // ── Decideix si obre cap amunt (poc espai sota) ───────────
  _adjustPosition() {
    const rect = this.container.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 290 && rect.top > spaceBelow) {
      this.container.classList.add('select--up');
    }
  }

  // ── Binding d'events ──────────────────────────────────────
  _bindEvents() {
    // Clic al trigger (toggle)
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isOpen ? this.close() : this.open();
    });

    // Teclat al trigger
    this.trigger.addEventListener('keydown', (e) => this._handleTriggerKey(e));

    // Teclat a la llista i al camp de cerca
    this.listbox.addEventListener('keydown', (e) => this._handleListKey(e));
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this._filterOptions(this.searchInput.value));
      this.searchInput.addEventListener('keydown', (e) => this._handleListKey(e));
    }

    // Clic a una opció
    this.listbox.addEventListener('click', (e) => {
      const opt = e.target.closest('.select__option');
      if (!opt) return;
      const idx = this._visibleOptions().indexOf(opt);
      if (idx >= 0) this.select(idx);
    });

    // Hover → activa opció
    this.listbox.addEventListener('mouseover', (e) => {
      const opt = e.target.closest('.select__option');
      if (!opt) return;
      const idx = this._visibleOptions().indexOf(opt);
      if (idx >= 0) this._setActive(idx);
    });
  }
}

// ── Auto-inicialitza tots els .select del document ────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.select').forEach(el => {
    if (!el.dataset.selectInit) {
      el.dataset.selectInit = 'true';
      el._uaSelect = new UASelect(el);
    }
  });
});


/* ── components/tabs/tabs.js ───────────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Tabs
// ARIA: role=tablist + role=tab + role=tabpanel
// Teclat: ← → navega, Home/End, Tab mou al panell
// Activació automàtica en moure el focus amb fletxes
// ══════════════════════════════════════════════════════════

class UATabs {
  constructor(container) {
    this.container = container;
    this.tablist   = container.querySelector('[role="tablist"]');
    this.tabs      = Array.from(container.querySelectorAll('[role="tab"]'));
    this.panels    = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    this._bindEvents();
  }

  // ── Activa un tab i mostra el panell corresponent ─────
  activateTab(tab, moveFocus = true) {
    this.tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    this.panels.forEach(p => p.setAttribute('hidden', ''));

    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    if (moveFocus) tab.focus();

    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.removeAttribute('hidden');
  }

  // ── Binding d'events ──────────────────────────────────
  _bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.activateTab(tab));
    });

    this.tablist.addEventListener('keydown', (e) => {
      const idx = this.tabs.indexOf(document.activeElement);
      if (idx < 0) return;

      let next = -1;
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next = (idx + 1) % this.tabs.length;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          next = (idx - 1 + this.tabs.length) % this.tabs.length;
          break;
        case 'Home':
          e.preventDefault();
          next = 0;
          break;
        case 'End':
          e.preventDefault();
          next = this.tabs.length - 1;
          break;
        default:
          return;
      }

      this.activateTab(this.tabs[next]);
    });
  }
}

// ── Auto-inicialitza tots els [data-tabs] del document ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tabs]').forEach(el => {
    if (!el.dataset.tabsInit) {
      el.dataset.tabsInit = 'true';
      el._uaTabs = new UATabs(el);
    }
  });
});


/* ── components/stepper/stepper.js ─────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Stepper — flux de passos numerats
// ══════════════════════════════════════════════════════════

class UAStepper {
  constructor(el) {
    this._el = el;
    this._steps = Array.from(el.querySelectorAll('.stepper__step'));
    this._total = this._steps.length;
    this._current = Math.max(
      0,
      this._steps.findIndex(s => s.classList.contains('stepper__step--active'))
    );

    this._render();
    this._bindClicks();
  }

  get currentIndex() { return this._current; }
  get total()        { return this._total; }
  get isFirst()      { return this._current === 0; }
  get isLast()       { return this._current === this._total - 1; }

  next() { if (!this.isLast)  this.goTo(this._current + 1); }
  prev() { if (!this.isFirst) this.goTo(this._current - 1); }

  goTo(index) {
    if (index < 0 || index >= this._total) return;
    const prev = this._current;
    this._current = index;
    this._render();
    this._el.dispatchEvent(new CustomEvent('ua:stepper:change', {
      bubbles: true,
      detail: { step: index, prev, total: this._total },
    }));
  }

  _bindClicks() {
    this._steps.forEach((step, i) => {
      const ind = step.querySelector('.stepper__indicator');
      if (!ind) return;
      ind.addEventListener('click', () => { if (i < this._current) this.goTo(i); });
      ind.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && i < this._current) {
          e.preventDefault();
          this.goTo(i);
        }
      });
    });
  }

  _render() {
    this._steps.forEach((step, i) => {
      const ind   = step.querySelector('.stepper__indicator');
      const label = step.querySelector('.stepper__label')?.textContent?.trim()
                    || `Pas ${i + 1}`;

      step.classList.remove(
        'stepper__step--active',
        'stepper__step--completed',
        'stepper__step--pending'
      );

      if (i < this._current) {
        step.classList.add('stepper__step--completed');
        step.removeAttribute('aria-current');
        step.setAttribute('aria-label',
          `Pas ${i + 1} de ${this._total}: ${label} (completat)`);
        if (ind) {
          ind.innerHTML = '<span aria-hidden="true">✓</span>';
          ind.setAttribute('role', 'button');
          ind.setAttribute('tabindex', '0');
          ind.setAttribute('aria-label', `Tornar al pas ${i + 1}: ${label}`);
        }
      } else if (i === this._current) {
        step.classList.add('stepper__step--active');
        step.setAttribute('aria-current', 'step');
        step.setAttribute('aria-label',
          `Pas ${i + 1} de ${this._total}: ${label} (pas actual)`);
        if (ind) {
          ind.innerHTML = `<span aria-hidden="true">${i + 1}</span>`;
          ind.removeAttribute('role');
          ind.removeAttribute('tabindex');
          ind.removeAttribute('aria-label');
        }
      } else {
        step.classList.add('stepper__step--pending');
        step.removeAttribute('aria-current');
        step.setAttribute('aria-label',
          `Pas ${i + 1} de ${this._total}: ${label} (pendent)`);
        if (ind) {
          ind.innerHTML = `<span aria-hidden="true">${i + 1}</span>`;
          ind.removeAttribute('role');
          ind.removeAttribute('tabindex');
          ind.removeAttribute('aria-label');
        }
      }
    });
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-stepper]').forEach(el => {
    el._uaStepper = new UAStepper(el);
  });
});


/* ── components/multilingual-field/multilingual-field.js ─ */

// ══════════════════════════════════════════════════════════
// UA Design System · MultilingualField — camp VA/ES/EN
// ══════════════════════════════════════════════════════════

let _mfIdCounter = 0;

class UAMultilingualField {
  constructor(el) {
    this._el     = el;
    this._tabs   = Array.from(el.querySelectorAll('.multilingual-field__tab'));
    this._panels = Array.from(el.querySelectorAll('.multilingual-field__panel'));
    this._uid    = ++_mfIdCounter;

    // Detecta la pestanya activa inicial (primera per defecte)
    this._current = Math.max(
      0,
      this._tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')
    );

    this._ensureIds();
    this._applyState(this._current);
    this._bindTabKeyboard();
    this._bindInputEvents();
    this._updateIndicators();
  }

  // ── API pública ────────────────────────────────────── //

  switchTo(index) {
    if (index < 0 || index >= this._tabs.length || index === this._current) return;
    this._current = index;
    this._applyState(index);
    this._el.dispatchEvent(new CustomEvent('ua:multilingual:change', {
      bubbles: true,
      detail: { lang: this._tabs[index].dataset.lang, index },
    }));
  }

  getValue() {
    const result = {};
    this._tabs.forEach((tab, i) => {
      const lang  = tab.dataset.lang;
      const input = this._panels[i].querySelector('input, textarea');
      if (lang && input) result[lang] = input.value;
    });
    return result;
  }

  setValue(values) {
    this._tabs.forEach((tab, i) => {
      const lang  = tab.dataset.lang;
      const input = this._panels[i].querySelector('input, textarea');
      if (lang && input && values[lang] !== undefined) input.value = values[lang];
    });
    this._updateIndicators();
  }

  setError(lang, hasError) {
    const i = this._tabs.findIndex(t => t.dataset.lang === lang);
    if (i < 0) return;
    this._tabs[i].classList.toggle('multilingual-field__tab--error', hasError);
    const input = this._panels[i].querySelector('input, textarea');
    if (input) input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
  }

  // ── Estat intern ───────────────────────────────────── //

  _applyState(current) {
    this._tabs.forEach((tab, i) => {
      const active = i === current;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    this._panels.forEach((panel, i) => {
      if (i === current) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  _bindTabKeyboard() {
    this._tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => this.switchTo(i));
      tab.addEventListener('keydown', e => {
        const len = this._tabs.length;
        let target = -1;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); target = (i - 1 + len) % len; }
        if (e.key === 'ArrowRight') { e.preventDefault(); target = (i + 1) % len; }
        if (e.key === 'Home')       { e.preventDefault(); target = 0; }
        if (e.key === 'End')        { e.preventDefault(); target = len - 1; }
        if (target >= 0) {
          this.switchTo(target);
          this._tabs[target].focus();
        }
      });
    });
  }

  _bindInputEvents() {
    this._panels.forEach((panel, i) => {
      const input = panel.querySelector('input, textarea');
      input?.addEventListener('input', () => this._updateIndicator(i));
    });
  }

  _updateIndicators() {
    this._panels.forEach((_, i) => this._updateIndicator(i));
  }

  _updateIndicator(index) {
    const input  = this._panels[index].querySelector('input, textarea');
    const filled = !!(input && input.value.trim() !== '');
    this._tabs[index].classList.toggle('multilingual-field__tab--filled', filled);
    // Elimina l'error visual si el camp s'emplena
    if (filled) this._tabs[index].classList.remove('multilingual-field__tab--error');
  }

  // Genera IDs únics per a les associacions ARIA si no existeixen
  _ensureIds() {
    this._tabs.forEach((tab, i) => {
      const lang    = tab.dataset.lang || i;
      const tabId   = tab.id            || `mf-${this._uid}-tab-${lang}`;
      const panelId = this._panels[i].id || `mf-${this._uid}-panel-${lang}`;
      tab.id              = tabId;
      this._panels[i].id  = panelId;
      tab.setAttribute('aria-controls', panelId);
      this._panels[i].setAttribute('aria-labelledby', tabId);
    });
  }
}

// Auto-init per a elements amb data-multilingual-field
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-multilingual-field]').forEach(el => {
    el._uaMlField = new UAMultilingualField(el);
  });
});


/* ── components/multistep/multistep.js ─────────────────── */

// ── UAMultistep ────────────────────────────────────────────────
// Formulari multi-pas: gestiona la navegació entre passos,
// sincronitza el Stepper i valida els camps del pas actiu.
//
// Ús:
//   <div class="multistep" id="ms1">
//     <nav class="stepper …">…</nav>
//     <div class="multistep__body">
//       <div class="multistep__step" data-active>…</div>
//       <div class="multistep__step">…</div>
//       …
//     </div>
//     <div class="multistep__footer">
//       <span class="multistep__counter"></span>
//       <div class="multistep__footer-actions">
//         <button class="btn btn-secondary" data-prev>Anterior</button>
//         <button class="btn btn-primary"   data-next>Continua</button>
//         <button class="btn btn-primary"   data-submit hidden>Envia</button>
//       </div>
//     </div>
//   </div>
//
// Events:
//   'ua:step:change'    → detail: { step: Number (1-based), total: Number }
//   'ua:multistep:done' → detail: {}  (quan s'ha premut el botó d'enviament)
// ──────────────────────────────────────────────────────────────

(function () {
  'use strict';

  class UAMultistep {
    constructor(el) {
      this.el = el;
      this.steps = Array.from(el.querySelectorAll('.multistep__step'));
      this.stepperItems = Array.from(el.querySelectorAll('.stepper__step'));
      this.counter = el.querySelector('.multistep__counter');
      this.btnPrev = el.querySelector('[data-prev]');
      this.btnNext = el.querySelector('[data-next]');
      this.btnSubmit = el.querySelector('[data-submit]');
      this.btnClose = el.querySelector('[data-close]');

      this.current = 0; // índex 0-based
      this.total = this.steps.length;

      this._init();
    }

    // ── Inicialització ───────────────────────────────────────

    _init() {
      // Activa el primer pas
      this.steps.forEach((s, i) => {
        if (i === 0) s.setAttribute('data-active', '');
        else s.removeAttribute('data-active');
      });

      this._updateUI();

      if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prev());
      if (this.btnNext) this.btnNext.addEventListener('click', () => this.next());
      if (this.btnSubmit) this.btnSubmit.addEventListener('click', () => this._submit());
      if (this.btnClose) this.btnClose.addEventListener('click', () => {
        this.el.dispatchEvent(new CustomEvent('ua:multistep:close', { bubbles: true }));
      });
    }

    // ── Navegació pública ────────────────────────────────────

    goTo(idx) {
      if (idx < 0 || idx >= this.total) return;

      const direction = idx > this.current ? 'forward' : 'back';

      this.steps[this.current].removeAttribute('data-active');
      this.current = idx;
      this.steps[this.current].setAttribute('data-active', '');

      if (direction === 'back') {
        // Animació inversa lleugera per al retorn
        this.steps[this.current].style.animation = 'none';
        requestAnimationFrame(() => {
          this.steps[this.current].style.animation = '';
        });
      }

      this._updateStepper();
      this._updateUI();

      this.el.dispatchEvent(new CustomEvent('ua:step:change', {
        bubbles: true,
        detail: { step: this.current + 1, total: this.total },
      }));

      // Focus al primer camp interactiu del nou pas
      requestAnimationFrame(() => {
        const firstFocusable = this.steps[this.current].querySelector(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        );
        if (firstFocusable) firstFocusable.focus();
      });
    }

    next() {
      if (!this._validateStep(this.current)) return;
      // Marca el pas actual com a completat en el Stepper
      if (this.stepperItems[this.current]) {
        this.stepperItems[this.current].classList.remove('stepper__step--active');
        this.stepperItems[this.current].classList.remove('stepper__step--pending');
        this.stepperItems[this.current].classList.add('stepper__step--completed');
        this.stepperItems[this.current].removeAttribute('aria-current');
        const ind = this.stepperItems[this.current].querySelector('.stepper__indicator');
        if (ind) { ind.innerHTML = '<span aria-hidden="true">✓</span>'; ind.setAttribute('role', 'button'); ind.setAttribute('tabindex', '0'); }
      }
      if (this.current < this.total - 1) this.goTo(this.current + 1);
    }

    prev() {
      if (this.current > 0) {
        // Descompletació visual del pas actual al Stepper
        if (this.stepperItems[this.current]) {
          this.stepperItems[this.current].classList.remove('stepper__step--completed');
          this.stepperItems[this.current].classList.remove('stepper__step--active');
          this.stepperItems[this.current].classList.add('stepper__step--pending');
          const stepNum = this.current + 1;
          const ind = this.stepperItems[this.current].querySelector('.stepper__indicator');
          if (ind) { ind.innerHTML = `<span aria-hidden="true">${stepNum}</span>`; ind.removeAttribute('role'); ind.removeAttribute('tabindex'); }
        }
        this.goTo(this.current - 1);
      }
    }

    // ── Validació ────────────────────────────────────────────

    _validateStep(idx) {
      const step = this.steps[idx];
      const fields = Array.from(step.querySelectorAll('input, select, textarea'))
        .filter(f => !f.disabled && f.type !== 'hidden');

      let valid = true;
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity(); // Mostra el missatge natiu del navegador
          valid = false;
          break;
        }
      }
      return valid;
    }

    // ── Actualització de la UI ───────────────────────────────

    _updateStepper() {
      this.stepperItems.forEach((item, i) => {
        item.removeAttribute('aria-current');
        if (i === this.current) {
          if (!item.classList.contains('stepper__step--completed')) {
            item.classList.remove('stepper__step--pending');
            item.classList.add('stepper__step--active');
          }
          item.setAttribute('aria-current', 'step');
        } else if (i > this.current && !item.classList.contains('stepper__step--completed')) {
          item.classList.remove('stepper__step--active');
          item.classList.add('stepper__step--pending');
        }
      });
    }

    _updateUI() {
      const isFirst = this.current === 0;
      // L'últim pas és la pantalla de confirmació (success), no un pas numerado
      const isLast = this.current === this.total - 1;
      // El penúltim pas (Revisió) és on s'envia; mostra el botó d'enviament
      const isSubmit = this.current === this.total - 2;

      if (this.btnPrev) {
        // Amaga "Anterior" al primer pas i a la pantalla de confirmació
        this.btnPrev.hidden = isFirst || isLast;
        this.btnPrev.disabled = isFirst || isLast;
      }
      if (this.btnNext) {
        // "Continua" visible als passos intermedis; ocult al penúltim i últim
        this.btnNext.hidden = isSubmit || isLast;
      }
      if (this.btnSubmit) {
        // "Envia" visible únicament al pas de revisió (penúltim)
        this.btnSubmit.hidden = !isSubmit;
      }
      if (this.btnClose) {
        // "Tanca" visible únicament a la pantalla de confirmació (últim)
        this.btnClose.hidden = !isLast;
      }
      if (this.counter) {
        // No mostres comptador a la pantalla de confirmació
        this.counter.textContent = isLast
          ? ''
          : `Pas ${this.current + 1} de ${this.total - 1}`;
      }
    }

    _submit() {
      if (!this._validateStep(this.current)) return;
      this.el.dispatchEvent(new CustomEvent('ua:multistep:done', {
        bubbles: true, detail: {},
      }));
    }
  }

  // ── Auto-inicialització ──────────────────────────────────────
  function initAll(root) {
    (root || document).querySelectorAll('.multistep').forEach(el => {
      if (!el._uaMultistep) el._uaMultistep = new UAMultistep(el);
    });
  }

  document.addEventListener('DOMContentLoaded', () => initAll());

  window.UAMultistep = UAMultistep;
  window.uaInitMultistep = initAll;
})();


/* ── components/pagination/pagination.js ───────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Paginació — component standalone
// ══════════════════════════════════════════════════════════

class UAPagination {
  constructor(el, opts = {}) {
    this._el      = el;
    this._total   = opts.total   ?? 0;
    this._perPage = opts.perPage ?? 10;
    this._current = opts.current ?? 1;
    this._render();
  }

  get _totalPages() {
    return Math.max(1, Math.ceil(this._total / this._perPage));
  }

  goTo(page) {
    page = Math.max(1, Math.min(page, this._totalPages));
    if (page === this._current) return;
    this._current = page;
    this._render();
    this._el.dispatchEvent(new CustomEvent('ua:pagination:change', {
      bubbles: true,
      detail: { page, total: this._total, perPage: this._perPage },
    }));
  }

  // Genera la seqüència de pàgines: números i el·lipsis "…"
  _pageRange(cur, tp) {
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    if (cur <= 4) return [1, 2, 3, 4, 5, '…', tp];
    if (cur >= tp - 3) return [1, '…', tp - 4, tp - 3, tp - 2, tp - 1, tp];
    return [1, '…', cur - 1, cur, cur + 1, '…', tp];
  }

  _render() {
    const { _totalPages: tp, _current: cur, _total: total, _perPage: pp } = this;
    const from = total === 0 ? 0 : (cur - 1) * pp + 1;
    const to   = Math.min(cur * pp, total);

    this._el.innerHTML = `
      <div class="pagination-info" aria-live="polite" aria-atomic="true">
        ${total === 0 ? 'Cap resultat' : `Mostrant ${from}–${to} de ${total}`}
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" data-pg-prev aria-label="Pàgina anterior"
                ${cur === 1 ? 'disabled' : ''}>← Anterior</button>
        ${this._pageRange(cur, tp).map(p =>
          p === '…'
            ? `<span class="pagination-ellipsis" aria-hidden="true">…</span>`
            : `<button class="pagination-page${p === cur ? ' pagination-page--active' : ''}${(p === 1 || p === tp) ? ' pagination-page--edge' : ''}"
                       ${p === cur ? 'aria-current="page"' : ''}
                       aria-label="Pàgina ${p}">${p}</button>`
        ).join('')}
        <button class="pagination-btn" data-pg-next aria-label="Pàgina següent"
                ${cur === tp ? 'disabled' : ''}>Següent →</button>
      </div>
    `;

    this._el.querySelector('[data-pg-prev]').addEventListener('click', () => this.goTo(this._current - 1));
    this._el.querySelector('[data-pg-next]').addEventListener('click', () => this.goTo(this._current + 1));
    this._el.querySelectorAll('.pagination-page:not(.pagination-page--active)').forEach(btn => {
      btn.addEventListener('click', () => this.goTo(parseInt(btn.textContent.trim(), 10)));
    });
  }
}

// Auto-init per a elements amb data-pagination
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-pagination]').forEach(el => {
    el._uaPagination = new UAPagination(el, {
      total:   parseInt(el.dataset.paginationTotal,   10) || 0,
      perPage: parseInt(el.dataset.paginationPerPage, 10) || 10,
      current: parseInt(el.dataset.paginationCurrent, 10) || 1,
    });
  });
});


/* ── components/table/table.js ─────────────────────────── */

// ══════════════════════════════════════════════════════════
// UA Design System · Demo interactiva — Taula de dades
//
// NOTA: En producció, totes les cadenes de text (etiquetes,
// estats, missatges) han de vindre d'un sistema d'i18n.
// Les dades de demostració s'inicialitzen a tableInit().
// ══════════════════════════════════════════════════════════

const tableDemo = (() => {
  // ── Dades de demo ─────────────────────────────────── //
  const CURRENT_USER    = 'Héctor García';
  const ULTIMA_CONNEXIO = new Date('2026-06-29T23:59:59');

  // Gestors disponibles per a l'assignació
  const GESTORS = [
    { nom: 'Héctor García',  inici: 'HG' },
    { nom: 'Maria López',    inici: 'ML' },
    { nom: 'Joan Martínez',  inici: 'JM' },
    { nom: 'Anna Pérez',     inici: 'AP' },
  ];

  const DATA = [
    { codi:'2026-0001', assoupte:'Alta nou investigador PDI',          tipus:'Recursos Humans',          data:'2026-06-20', estat:'no-assignada',    responsable:[],                                             prioritat:'alta',   termini:'superat', ultimMoviment:{data:'2026-06-20',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0002', assoupte:'Sol·licitud beca Erasmus+',          tipus:'Relacions Internacionals',  data:'2026-06-19', estat:'resolta',          responsable:['Héctor García'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-30',actor:'Héctor García',  accio:'missatge'}, missatges:2 },
    { codi:'2026-0003', assoupte:'Renovació contracte associat',       tipus:'Recursos Humans',          data:'2026-06-18', estat:'pendent',           responsable:['Maria López', 'Héctor García'],               prioritat:'alta',   termini:'avui',    ultimMoviment:{data:'2026-06-30',actor:'Usuari/ària', accio:'adjunt'}, missatges:4 },
    { codi:'2026-0004', assoupte:'Canvi de grup de pràctiques',        tipus:'Secretaria Acadèmica',     data:'2026-06-17', estat:'resolta',           responsable:['Joan Martínez'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-18',actor:'Joan Martínez',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0005', assoupte:'Instància genèrica baixa mèdica',    tipus:'eAdministració',           data:'2026-06-17', estat:'no-assignada',      responsable:[],                                             prioritat:'mitjana',termini:'superat', ultimMoviment:{data:'2026-06-17',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0006', assoupte:'Sol·licitud accés VPN remot',        tipus:'Informàtica',              data:'2026-06-16', estat:'resolta',           responsable:['Héctor García'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-07-01',actor:'Héctor García',  accio:'missatge'}, missatges:3 },
    { codi:'2026-0007', assoupte:'Reserva d\'espai aula magna',        tipus:'Gestió d\'Espais',         data:'2026-06-15', estat:'esperant-usuari',   responsable:['Héctor García'],                              prioritat:'alta',   termini:'proper',  ultimMoviment:{data:'2026-06-28',actor:'Usuari/ària', accio:'missatge'}, missatges:6 },
    { codi:'2026-0008', assoupte:'Convalidació assignatura optativa',  tipus:'Secretaria Acadèmica',     data:'2026-06-14', estat:'pendent',           responsable:['Anna Pérez'],                                 prioritat:'mitjana',termini:'ok',      ultimMoviment:{data:'2026-06-30',actor:'Usuari/ària', accio:'adjunt'}, missatges:2 },
    { codi:'2026-0009', assoupte:'Sol·licitud certificat matrícula',   tipus:'Secretaria Acadèmica',     data:'2026-06-13', estat:'resolta',           responsable:['Joan Martínez'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-07-02',actor:'Joan Martínez',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0010', assoupte:'Revisió examen final',               tipus:'Secretaria Acadèmica',     data:'2026-06-12', estat:'tancada',           responsable:['Maria López'],                                prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-14',actor:'Maria López',    accio:'missatge'}, missatges:3 },
    { codi:'2026-0011', assoupte:'Baixa temporal estudis',             tipus:'Secretaria Acadèmica',     data:'2026-06-11', estat:'no-assignada',      responsable:[],                                             prioritat:'alta',   termini:'superat', ultimMoviment:{data:'2026-06-11',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0012', assoupte:'Alta compte correu institucional',   tipus:'Informàtica',              data:'2026-06-10', estat:'resolta',           responsable:['Héctor García'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-18',actor:'Héctor García',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0013', assoupte:'Reserva sala de reunions A-201',     tipus:'Gestió d\'Espais',         data:'2026-06-09', estat:'resolta',           responsable:['Anna Pérez', 'Joan Martínez'],                prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-12',actor:'Anna Pérez',     accio:'adjunt'},   missatges:2 },
    { codi:'2026-0014', assoupte:'Sol·licitud ajuda transport',        tipus:'Benestar Universitari',    data:'2026-06-08', estat:'esperant-usuari',   responsable:['Héctor García'],                              prioritat:'mitjana',termini:'avui',    ultimMoviment:{data:'2026-06-29',actor:'Usuari/ària', accio:'missatge'}, missatges:5 },
    { codi:'2026-0015', assoupte:'Modificació dades bancàries',        tipus:'Recursos Humans',          data:'2026-06-07', estat:'resolta',           responsable:['Maria López'],                                prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-10',actor:'Maria López',    accio:'missatge'}, missatges:1 },
    { codi:'2026-0016', assoupte:'Reconeixement crèdits activitats',   tipus:'Secretaria Acadèmica',     data:'2026-06-06', estat:'no-assignada',      responsable:[],                                             prioritat:'mitjana',termini:'superat', ultimMoviment:{data:'2026-06-06',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0017', assoupte:'Accés laboratori de recerca',        tipus:'Informàtica',              data:'2026-06-05', estat:'resolta',           responsable:['Anna Pérez'],                                 prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-09',actor:'Anna Pérez',     accio:'missatge'}, missatges:2 },
    { codi:'2026-0018', assoupte:'Sol·licitud premi extraordinari',    tipus:'Secretaria Acadèmica',     data:'2026-06-04', estat:'pendent',           responsable:['Héctor García', 'Joan Martínez'],             prioritat:'alta',   termini:'proper',  ultimMoviment:{data:'2026-06-30',actor:'Usuari/ària', accio:'missatge'}, missatges:3 },
    { codi:'2026-0019', assoupte:'Canvi domicili notificacions',       tipus:'Secretaria Acadèmica',     data:'2026-06-03', estat:'resolta',           responsable:['Joan Martínez'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-05',actor:'Joan Martínez',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0020', assoupte:'Alta permís aparcament',             tipus:'Serveis Generals',         data:'2026-06-02', estat:'esperant-usuari',   responsable:['Maria López'],                                prioritat:'mitjana',termini:'superat', ultimMoviment:{data:'2026-06-30',actor:'Usuari/ària', accio:'adjunt'}, missatges:4 },
    { codi:'2026-0021', assoupte:'Duplicat targeta d\'identitat UA',   tipus:'Secretaria Acadèmica',     data:'2026-06-01', estat:'resolta',           responsable:['Héctor García'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-03',actor:'Héctor García',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0022', assoupte:'Habilitació accés repositori Git',   tipus:'Informàtica',              data:'2026-05-31', estat:'resolta',           responsable:['Anna Pérez'],                                 prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-02',actor:'Anna Pérez',     accio:'missatge'}, missatges:2 },
    { codi:'2026-0023', assoupte:'Sol·licitud llicència software',     tipus:'Informàtica',              data:'2026-05-30', estat:'pendent',           responsable:['Héctor García'],                              prioritat:'alta',   termini:'proper',  ultimMoviment:{data:'2026-06-30',actor:'Usuari/ària', accio:'adjunt'}, missatges:1 },
    { codi:'2026-0024', assoupte:'Nomenament tribunal TFG',            tipus:'Secretaria Acadèmica',     data:'2026-05-29', estat:'resolta',           responsable:['Joan Martínez'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-01',actor:'Joan Martínez',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0025', assoupte:'Gestió fons bibliogràfic',           tipus:'Biblioteca',               data:'2026-05-28', estat:'tancada',           responsable:['Maria López', 'Anna Pérez'],                  prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-05-30',actor:'Maria López',    accio:'missatge'}, missatges:2 },
    { codi:'2026-0026', assoupte:'Sol·licitud aplaçament pagament',    tipus:'Secretaria Acadèmica',     data:'2026-05-27', estat:'resolta',           responsable:['Joan Martínez'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-05-29',actor:'Joan Martínez',  accio:'missatge'}, missatges:1 },
    { codi:'2026-0027', assoupte:'Renovació beca col·laboració',       tipus:'Benestar Universitari',    data:'2026-05-26', estat:'no-assignada',      responsable:[],                                             prioritat:'alta',   termini:'superat', ultimMoviment:{data:'2026-05-26',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0028', assoupte:'Alta nou equipament de laboratori',  tipus:'Serveis Generals',         data:'2026-05-25', estat:'pendent',           responsable:['Héctor García', 'Maria López', 'Anna Pérez'], prioritat:'mitjana',termini:'ok',      ultimMoviment:{data:'2026-06-30',actor:'Usuari/ària', accio:'missatge'}, missatges:2 },
    { codi:'2026-0029', assoupte:'Canvi de tutor de TFM',              tipus:'Secretaria Acadèmica',     data:'2026-05-24', estat:'resolta',           responsable:['Anna Pérez'],                                 prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-05-26',actor:'Anna Pérez',     accio:'missatge'}, missatges:1 },
    { codi:'2026-0030', assoupte:'Reclamació qualificació parcial',    tipus:'Secretaria Acadèmica',     data:'2026-05-23', estat:'tancada',           responsable:['Héctor García'],                              prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-06-29',actor:'Héctor García',  accio:'reobre'},   missatges:2 },
    { codi:'2026-0031', assoupte:'Sol·licitud certificat de nòmina',        tipus:'Recursos Humans',      data:'2026-06-30', estat:'no-assignada', responsable:[],                prioritat:'baixa',  termini:'avui',    ultimMoviment:{data:'2026-06-30',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0032', assoupte:'Canvi adreça de notificació electrònica', tipus:'eAdministració',       data:'2026-06-30', estat:'sense-contestar',responsable:['Joan Martínez'], prioritat:'baixa',  termini:'avui',    ultimMoviment:{data:'2026-06-30',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0033', assoupte:'Revisió conveni pràctiques externes',   tipus:'Secretaria Acadèmica', data:'2026-07-01', estat:'sense-contestar',responsable:['Héctor García'], prioritat:'mitjana',termini:'ok',      ultimMoviment:{data:'2026-07-01',actor:'Sistema',        accio:'presenta'}, missatges:0 },
    { codi:'2026-0034', assoupte:'Alta permís accés edifici tècnic',      tipus:'Serveis Generals',     data:'2026-07-02', estat:'sense-contestar',responsable:['Héctor García'], prioritat:'baixa',  termini:'ok',      ultimMoviment:{data:'2026-07-02',actor:'Sistema',        accio:'presenta'}, missatges:0 },
  ].map(r => ({
    codi:          r.codi,
    assumpte:      r.assumpte || r.assoupte,
    tipus:         r.tipus,
    data:          r.data,
    estat:         r.estat,
    responsable:   r.responsable,
    prioritat:     r.prioritat,
    termini:       r.termini,
    ultimMoviment: r.ultimMoviment,
    missatges:     r.missatges,
  }));

  const ESTAT_CFG = {
    'no-assignada':    { cls: 'tag-warning', label: '<i class="ti ti-clock" aria-hidden="true"></i> No assignada' },
    'sense-contestar': { cls: 'tag-info',    label: '<i class="ti ti-mail" aria-hidden="true"></i> Sense contestar' },
    'pendent':         { cls: 'tag-primary', label: '<i class="ti ti-settings" aria-hidden="true"></i> Pendent' },
    'esperant-usuari': { cls: 'tag-pause',   label: '<i class="ti ti-message-question" aria-hidden="true"></i> Esperant usuari' },
    'resolta':         { cls: 'tag-success', label: '<i class="ti ti-circle-check" aria-hidden="true"></i> Resolta' },
    'tancada':         { cls: 'tag-neutral', label: '<i class="ti ti-lock" aria-hidden="true"></i> Arxivada' },
  };

  const PRIORITAT_CFG = {
    'alta':   { cls: 'tag-error',   label: 'Alta' },
    'mitjana':{ cls: 'tag-warning', label: 'Mitjana' },
    'baixa':  { cls: 'tag-success', label: 'Baixa' },
  };

  const TERMINI_CFG = {
    'ok':      { icon: 'ti-circle-check', color: 'var(--color-success-icon)', label: 'En termini' },
    'proper':  { icon: 'ti-clock',        color: 'var(--color-warning-icon)', label: 'Termini proper' },
    'avui':    { icon: 'ti-alarm',        color: 'var(--color-error-icon)',   label: 'Vence avui' },
    'superat': { icon: 'ti-alert-circle', color: 'var(--color-error-icon)',   label: 'Termini superat' },
  };

  const PRIORITAT_ORDER = { 'alta': 0, 'mitjana': 1, 'baixa': 2 };
  const TERMINI_ORDER   = { 'superat': 0, 'avui': 1, 'proper': 2, 'ok': 3 };

  // Recompte de sol·licituds obertes per gestor (pendent + assignada + esperant-usuari)
  const ESTATS_OBERTS = new Set(['no-assignada', 'sense-contestar', 'pendent', 'esperant-usuari']);

  function _compteObertes(nomGestor) {
    return DATA.filter(r =>
      ESTATS_OBERTS.has(r.estat) && r.responsable.includes(nomGestor)
    ).length;
  }

  const PAGE_SIZE = 10;
  let _visibleCount = PAGE_SIZE;   // load-more: nombre d'ítems visibles

  // ── Estat intern ───────────────────────────────────── //
  let state = {
    cerca: '',
    estat: '',
    sortCol: 'codi',
    sortDir: 'asc',
    page: 1,
    filtreTipus: '',
    filtrePrior: '',
    filtreResp:  '',
    filtreData:         '',
    filtreDataConcreta: '',
  };

  // ── Helpers ─────────────────────────────────────────── //

  function _localDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function _labelAccio(accio) {
    switch (accio) {
      case 'presenta': return 'Nova sol·licitud';
      case 'adjunt':   return 'Ha pujat documentació';
      case 'reobre':   return 'Reobre sol·licitud';
      default:         return 'Ha contestat';
    }
  }

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
    return mes === 1  ? 'fa 1 mes' : `fa ${mes} mesos`;
  }

  function filteredData() {
    return DATA.filter(r => {
      const txt = state.cerca.toLowerCase();
      const matchCerca = !txt
        || r.assumpte.toLowerCase().includes(txt)
        || r.codi.toLowerCase().includes(txt)
        || r.tipus.toLowerCase().includes(txt);

      let matchEstat = true;
      switch (state.estat) {
        case 'les-meues':       matchEstat = r.responsable.includes(CURRENT_USER); break;
        case 'prioritat-alta':  matchEstat = r.prioritat === 'alta'; break;
        case 'termini-superat': matchEstat = r.termini === 'superat'; break;
        case 'accio-hui': {
          const avui = new Date(); avui.setHours(0, 0, 0, 0);
          const ahir = new Date(avui); ahir.setDate(ahir.getDate() - 1);
          const ahirStr = _localDateStr(ahir);
          matchEstat = r.data === ahirStr &&
                       (r.estat === 'no-assignada' || r.ultimMoviment?.actor === 'Sistema');
          break;
        }
        case 'han-contestat':
          matchEstat = r.ultimMoviment?.actor !== CURRENT_USER &&
                       r.ultimMoviment?.actor !== 'Sistema' &&
                       ['missatge', 'adjunt'].includes(r.ultimMoviment?.accio) &&
                       new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          break;
        case 'resolta':
          matchEstat = r.estat === 'resolta' &&
                       r.ultimMoviment?.data != null &&
                       new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          break;
        case 'no-assignada-nova':
          matchEstat = r.estat === 'no-assignada' &&
                       new Date(r.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          break;
        case 'novetats-all': {
          const hanCont = r.ultimMoviment?.actor !== CURRENT_USER &&
                          r.ultimMoviment?.actor !== 'Sistema' &&
                          ['missatge','adjunt'].includes(r.ultimMoviment?.accio) &&
                          new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          const foraT   = r.termini === 'superat';
          const resolt  = r.estat === 'resolta' && r.ultimMoviment?.data != null &&
                          new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          const reassig = r.estat === 'sense-contestar' && r.responsable.includes(CURRENT_USER);
          const novaNA  = r.estat === 'no-assignada' && new Date(r.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          matchEstat = hanCont || foraT || resolt || reassig || novaNA;
          break;
        }
        case 'atencio-all': {
          const avuiA    = new Date(); avuiA.setHours(0, 0, 0, 0);
          const ahirA    = new Date(avuiA); ahirA.setDate(ahirA.getDate() - 1);
          const ahirStrA = _localDateStr(ahirA);
          const accHui   = r.data === ahirStrA &&
                           (r.estat === 'no-assignada' || r.ultimMoviment?.actor === 'Sistema');
          const hanCo    = r.ultimMoviment?.actor !== CURRENT_USER &&
                           r.ultimMoviment?.actor !== 'Sistema' &&
                           ['missatge','adjunt'].includes(r.ultimMoviment?.accio) &&
                           new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO;
          matchEstat = r.termini === 'superat' || r.prioritat === 'alta' ||
                       r.estat === 'no-assignada' || accHui || hanCo;
          break;
        }
        case '': break;
        default: matchEstat = r.estat === state.estat;
      }

      const matchTipus = !state.filtreTipus || r.tipus === state.filtreTipus;
      const matchPrior = !state.filtrePrior || r.prioritat === state.filtrePrior;
      const matchResp  = !state.filtreResp
        ? true
        : state.filtreResp === 'sense-responsable'
          ? r.responsable.length === 0
          : r.responsable.includes(state.filtreResp);

      let matchData = true;
      if (state.filtreDataConcreta) {
        matchData = r.data === state.filtreDataConcreta;
      } else if (state.filtreData) {
        const dies  = parseInt(state.filtreData);
        const limit = new Date();
        limit.setDate(limit.getDate() - dies);
        matchData = new Date(r.data + 'T00:00:00') >= limit;
      }

      return matchCerca && matchEstat && matchTipus && matchPrior && matchResp && matchData;
    });
  }

  function sortedData(data) {
    return [...data].sort((a, b) => {
      let va, vb;
      if (state.sortCol === 'prioritat') {
        va = PRIORITAT_ORDER[a.prioritat] ?? 9;
        vb = PRIORITAT_ORDER[b.prioritat] ?? 9;
      } else if (state.sortCol === 'termini') {
        va = TERMINI_ORDER[a.termini] ?? 9;
        vb = TERMINI_ORDER[b.termini] ?? 9;
      } else if (state.sortCol === 'ultimMoviment') {
        va = a.ultimMoviment?.data ?? '';
        vb = b.ultimMoviment?.data ?? '';
      } else if (state.sortCol === 'missatges') {
        va = a.missatges ?? 0;
        vb = b.missatges ?? 0;
      } else {
        va = a[state.sortCol] ?? '';
        vb = b[state.sortCol] ?? '';
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return state.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  // ── Menú kebab flotant ──────────────────────────────── //

  let _kebab = { btn: null, codi: null };

  function _kebabItems(estat, codi) {
    const viewItem = `
      <button class="ua-kebab-float__item"
              data-action="view" data-codi="${codi}">
        <i class="ti ti-eye" aria-hidden="true"></i>
        Veu el detall
      </button>
      <div class="ua-kebab-float__sep" role="separator" aria-hidden="true"></div>`;

    if (estat === 'no-assignada') {
      return viewItem + `
        <button class="ua-kebab-float__item ua-kebab-float__item--success"
                data-action="assigna" data-codi="${codi}">
          <i class="ti ti-user-check" aria-hidden="true"></i>
          Assigna a mi
        </button>
        <div class="ua-kebab-float__sep" role="separator" aria-hidden="true"></div>
        <button class="ua-kebab-float__item ua-kebab-float__item--error"
                data-action="tanca" data-codi="${codi}">
          <i class="ti ti-lock" aria-hidden="true"></i>
          Arxiva
        </button>`;
    }
    if (estat === 'sense-contestar' || estat === 'pendent' || estat === 'esperant-usuari') {
      return viewItem + `
        <button class="ua-kebab-float__item ua-kebab-float__item--success"
                data-action="resol" data-codi="${codi}">
          <i class="ti ti-circle-check" aria-hidden="true"></i>
          Marca com a resolta
        </button>
        <button class="ua-kebab-float__item"
                data-action="reenvia" data-codi="${codi}">
          <i class="ti ti-send" aria-hidden="true"></i>
          Reenvia
        </button>
        <div class="ua-kebab-float__sep" role="separator" aria-hidden="true"></div>
        <button class="ua-kebab-float__item ua-kebab-float__item--error"
                data-action="tanca" data-codi="${codi}">
          <i class="ti ti-lock" aria-hidden="true"></i>
          Arxiva
        </button>`;
    }
    if (estat === 'resolta') {
      return viewItem + `
        <button class="ua-kebab-float__item ua-kebab-float__item--error"
                data-action="tanca" data-codi="${codi}">
          <i class="ti ti-lock" aria-hidden="true"></i>
          Arxiva
        </button>`;
    }
    if (estat === 'tancada') {
      return viewItem + `
        <button class="ua-kebab-float__item"
                data-action="reobre" data-codi="${codi}">
          <i class="ti ti-rotate" aria-hidden="true"></i>
          Reobre
        </button>`;
    }
    return viewItem;
  }

  function openKebab(triggerBtn, codi) {
    const menu = document.getElementById('kebab-menu');
    if (!menu) return;

    if (_kebab.codi === codi) { closeKebab(); return; }
    closeKebab();

    const row = DATA.find(r => r.codi === codi);
    if (!row) return;

    menu.innerHTML = _kebabItems(row.estat, codi);
    menu.setAttribute('aria-label', `Accions per a ${codi}`);

    const rect  = triggerBtn.getBoundingClientRect();
    const vw    = window.innerWidth;
    const menuW = 195;

    let left = rect.right - menuW;
    if (left < 8) left = 8;
    if (left + menuW > vw - 8) left = vw - menuW - 8;

    // Obre cap amunt si no hi ha espai avall
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > 160 ? rect.bottom + 4 : rect.top - 160;

    menu.style.top  = top + 'px';
    menu.style.left = left + 'px';
    menu.removeAttribute('hidden');
    menu.removeAttribute('aria-hidden');

    triggerBtn.setAttribute('aria-expanded', 'true');
    _kebab = { btn: triggerBtn, codi };

    requestAnimationFrame(() => menu.querySelector('button')?.focus());

    // Afegim listeners amb retard per no capturar el clic actual
    setTimeout(() => {
      document.addEventListener('click',   _onDocClick);
      document.addEventListener('keydown', _onDocKey);
    }, 0);
  }

  function closeKebab() {
    const menu = document.getElementById('kebab-menu');
    if (!menu || menu.hasAttribute('hidden')) return;

    menu.setAttribute('hidden', '');
    menu.setAttribute('aria-hidden', 'true');
    _kebab.btn?.setAttribute('aria-expanded', 'false');
    _kebab = { btn: null, codi: null };

    document.removeEventListener('click',   _onDocClick);
    document.removeEventListener('keydown', _onDocKey);
  }

  function _onDocClick(e) {
    const menu = document.getElementById('kebab-menu');
    if (!menu) return;

    const item = e.target.closest('[data-action]');
    if (item && menu.contains(item)) {
      const action = item.dataset.action;
      const codi   = item.dataset.codi;
      closeKebab();
      switch (action) {
        case 'view':    viewSolicitud(codi);         break;
        case 'assigna': assignaSolicitud(codi);      break;
        case 'resol':   resolSolicitud(codi);        break;
        case 'reenvia': renviasSolicitud(codi);      break;
        case 'tanca':   closeSolicitudConfirm(codi); break;
        case 'reobre':  reobSolicitud(codi);         break;
      }
      return;
    }

    if (!menu.contains(e.target)) closeKebab();
  }

  function _onDocKey(e) {
    const menu = document.getElementById('kebab-menu');
    if (!menu) return;

    if (e.key === 'Escape') {
      e.stopPropagation();
      const btn = _kebab.btn;
      closeKebab();
      btn?.focus();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...menu.querySelectorAll('button')];
      const idx  = items.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown'
        ? items[(idx + 1) % items.length]
        : items[(idx - 1 + items.length) % items.length];
      next?.focus();
      return;
    }

    if (e.key === 'Tab') closeKebab();
  }

  // ── Render ───────────────────────────────────────────── //

  function _renderResponsable(llista) {
    if (!llista || llista.length === 0) {
      return `<span style="color:var(--color-text-muted);font-size:var(--font-size-xs)">—</span>`;
    }
    const primer  = llista[0];
    const extra   = llista.length - 1;
    const obertes = _compteObertes(primer);
    const gestor  = GESTORS.find(g => g.nom === primer);
    const inici   = gestor?.inici ||
      primer.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const safeNom = primer.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const badgeExtra = extra > 0
      ? ` <span class="tag tag-neutral" style="font-size:var(--font-size-xs);padding:2px 6px"
               title="${llista.slice(1).join(', ')}">+${extra}</span>`
      : '';
    return `<div style="display:flex;align-items:center;gap:6px;min-width:0">
      <button class="ua-avatar-btn"
              aria-label="Veure resum de ${primer} (${obertes} assignades)"
              onclick="event.stopPropagation();tableDemo.openGestorPopup(this,'${safeNom}')"
              style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                     background:var(--color-primary-muted);color:var(--color-primary);
                     font-size:10px;font-weight:700;border:2px solid transparent;
                     cursor:pointer;display:inline-flex;align-items:center;
                     justify-content:center;font-family:var(--font-family-base);
                     transition:background var(--transition-fast),border-color var(--transition-fast)"
              onfocus="this.style.borderColor='var(--color-border-focus)'"
              onblur="this.style.borderColor='transparent'">
        ${inici}
      </button>
      <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);white-space:nowrap">${obertes} assignades</span>${badgeExtra}
    </div>`;
  }

  function renderTable() {
    const tbody  = document.getElementById('demo-table-body');
    const theads = document.querySelectorAll('#demo-table .table-th--sortable');
    if (!tbody) return;

    // Actualitza aria-sort i classes de capçaleres
    theads.forEach(th => {
      const col = th.dataset.col;
      const isSorted = col === state.sortCol;
      th.classList.toggle('table-th--sorted', isSorted);
      th.setAttribute('aria-sort', isSorted
        ? (state.sortDir === 'asc' ? 'ascending' : 'descending')
        : 'none'
      );
      const icon = th.querySelector('.sort-icon');
      if (icon) {
        if (!isSorted) icon.textContent = '↕';
        else icon.textContent = state.sortDir === 'asc' ? '↑' : '↓';
      }
    });

    const filtered = filteredData();
    const sorted   = sortedData(filtered);
    const total    = sorted.length;

    const sliced = sorted.slice(0, _visibleCount);

    if (!sliced.length) {
      const termeCerca = state.cerca.trim();
      const filtreEstat = state.estat;
      let msg = 'Cap sol·licitud coincideix amb els criteris aplicats.';
      if (state.tabFilter === 'meues' && !termeCerca && !filtreEstat) {
        msg = 'No tens cap sol·licitud assignada en aquest moment.';
      } else if (termeCerca && filtreEstat) {
        msg = `Cap sol·licitud amb estat "${filtreEstat}" coincideix amb "${termeCerca}".`;
      } else if (termeCerca) {
        msg = `Cap sol·licitud coincideix amb "${termeCerca}". Prova amb un altre terme.`;
      } else if (filtreEstat) {
        msg = `No hi ha sol·licituds amb l'estat "${filtreEstat}".`;
      }
      tbody.innerHTML = `
        <tr class="table-tr--empty">
          <td colspan="9" style="text-align:center;padding:var(--space-8);color:var(--color-text-muted)">
            <i class="ti ti-search-off" style="font-size:2rem;display:block;margin-bottom:var(--space-2)" aria-hidden="true"></i>
            ${msg}
            <button class="btn btn-sm btn-secondary"
                    onclick="filterNav('')"
                    style="margin-top:var(--space-3);display:block;margin-inline:auto">
              Mostra totes les sol·licituds
            </button>
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = sliced.map(r => {
        const estat       = ESTAT_CFG[r.estat] || { cls: 'tag-neutral', label: r.estat };
        const responsHtml = _renderResponsable(r.responsable);
        const accioLabel  = _labelAccio(r.ultimMoviment?.accio);
        const actorDisp   = r.ultimMoviment?.actor === CURRENT_USER
          ? 'Jo'
          : r.ultimMoviment?.actor === 'Sistema'
            ? 'Usuari/ària'
            : (r.ultimMoviment?.actor ?? '—');
        const msgHtml = r.missatges > 0
          ? `<span style="display:inline-flex;align-items:center;gap:3px;color:var(--color-text-secondary)">
               <i class="ti ti-message" aria-hidden="true" style="font-size:14px"></i>
               <span style="font-size:var(--font-size-xs)">${r.missatges}</span>
             </span>`
          : `<span style="color:var(--color-text-muted);font-size:var(--font-size-xs)">—</span>`;
        return `
          <tr data-row-id="${r.codi}" style="cursor:pointer" title="Obrir sol·licitud ${r.codi}">
            <td class="table-td table-td--check">
              <input type="checkbox" class="table-check-row"
                     aria-label="Selecciona la sol·licitud ${r.codi}">
            </td>
            <td class="table-td table-td--code" data-label="Codi">${r.codi}</td>
            <td class="table-td" data-label="Assumpte">${r.assumpte}</td>
            <td class="table-td table-td--date" data-label="Entrada">
              <span style="font-size:var(--font-size-xs);color:var(--color-text-secondary)"
                    title="${r.data}">${tempsRelatiu(r.data)}</span>
            </td>
            <td class="table-td" data-label="Responsable">${responsHtml}</td>
            <td class="table-td" data-label="Estat"><span class="tag ${estat.cls}">${estat.label}</span></td>
            <td class="table-td" data-label="Últim mov.">
              <span style="font-size:var(--font-size-xs);color:var(--color-text-primary);display:block">${accioLabel}</span>
              <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);display:block">${actorDisp}</span>
              <span style="font-size:var(--font-size-xs);color:var(--color-text-secondary);display:block"
                    title="${r.ultimMoviment?.data ?? ''}">${tempsRelatiu(r.ultimMoviment?.data)}</span>
            </td>
            <td class="table-td table-td--center" data-label="Missatges">${msgHtml}</td>
            <td class="table-td table-td--actions">
              ${r.estat === 'no-assignada' ? `
              <button class="btn btn-ghost btn-sm table-action-assigna"
                aria-label="Assigna la sol·licitud ${r.codi}"
                aria-haspopup="menu" aria-expanded="false"
                onclick="event.stopPropagation();tableDemo.openAssigna(this, '${r.codi}')">
                <i class="ti ti-user-plus" aria-hidden="true" style="font-size:14px"></i>
                Assigna
              </button>` : ''}
              <button class="btn btn-ghost btn-sm"
                style="padding:0 var(--space-2)"
                aria-label="Més accions per a la sol·licitud ${r.codi}"
                aria-haspopup="menu"
                aria-expanded="false"
                onclick="tableDemo.openKebab(this, '${r.codi}')">
                <i class="ti ti-dots-vertical" aria-hidden="true" style="font-size:16px"></i>
              </button>
            </td>
          </tr>`;
      }).join('');

      // Re-sincronitza checkboxes i barra de selecció si UATable gestiona la taula
      const tableEl = document.getElementById('demo-table');
      if (tableEl?._uaTable) tableEl._uaTable.onRerender();
    }

    renderLoadMore(total);
    renderCardsGrid(sliced);
    _updateTabCounts();
  }

  // ── Recompte per tabs (Totes / Les meues) ───────────────── //

  function _countTab(estatOverride) {
    const prev = state.estat;
    state.estat = estatOverride;
    const count = filteredData().length;
    state.estat = prev;
    return count;
  }

  function _updateTabCounts() {
    const elTotes = document.getElementById('count-totes');
    const elMeues = document.getElementById('count-meues');
    if (elTotes) elTotes.textContent = _countTab('') || '';
    if (elMeues) elMeues.textContent = _countTab('les-meues') || '';
  }

  // ── Vista en mosaic (targetes) ───────────────────────── //

  function renderCardsGrid(sliced) {
    const container = document.getElementById('demo-cards-grid') ?? document.getElementById('sol-cards-grid');
    if (!container) return;

    if (!sliced || sliced.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:var(--space-8);color:var(--color-text-muted)">
          <i class="ti ti-inbox" style="font-size:2.5rem;display:block;margin-bottom:var(--space-3)" aria-hidden="true"></i>
          Cap sol·licitud coincideix amb els filtres aplicats.
        </div>`;
      return;
    }

    container.innerHTML = sliced.map(r => {
      const estat      = ESTAT_CFG[r.estat] || { cls: 'tag-neutral', label: r.estat };
      const accioLabel = _labelAccio(r.ultimMoviment?.accio);
      const actorDisp  = r.ultimMoviment?.actor === CURRENT_USER ? 'Jo'
        : r.ultimMoviment?.actor === 'Sistema' ? 'Usuari/ària'
        : (r.ultimMoviment?.actor ?? '—');
      const dataFmt    = r.data ? r.data.split('-').reverse().join('/') : '—';
      const ultMovTemp = r.ultimMoviment ? tempsRelatiu(r.ultimMoviment.data) : '—';

      // Avatar sense botó (no button-in-div[role=button])
      const primer  = r.responsable[0] || null;
      const extra   = r.responsable.length - 1;
      const obertes = primer ? _compteObertes(primer) : 0;
      let respHtml  = `<span style="color:var(--color-text-muted);font-size:var(--font-size-xs)">Sense responsable</span>`;
      if (primer) {
        const gestor = GESTORS.find(g => g.nom === primer);
        const inici  = gestor?.inici ||
          primer.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const extraBadge = extra > 0
          ? ` <span class="tag tag-neutral" style="font-size:10px;padding:1px 5px;flex-shrink:0"
                   title="${r.responsable.slice(1).join(', ')}">+${extra}</span>`
          : '';
        respHtml = `
          <span style="width:26px;height:26px;border-radius:50%;flex-shrink:0;
                       background:var(--color-primary-muted);color:var(--color-primary);
                       font-size:10px;font-weight:700;display:inline-flex;
                       align-items:center;justify-content:center" aria-hidden="true">${inici}</span>
          <span style="font-size:var(--font-size-xs);overflow:hidden;white-space:nowrap;
                       text-overflow:ellipsis;min-width:0">${primer}</span>
          ${extraBadge}
          <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);
                       white-space:nowrap;margin-left:auto">${obertes} ass.</span>`;
      }

      const msgBadge = r.missatges > 0
        ? `<span style="display:inline-flex;align-items:center;gap:3px;
                        font-size:var(--font-size-xs);color:var(--color-text-secondary)">
             <i class="ti ti-message" aria-hidden="true" style="font-size:13px"></i>${r.missatges}
           </span>`
        : '';

      const assignaBtn = r.estat === 'no-assignada'
        ? `<button class="btn btn-ghost btn-sm"
                   aria-label="Assigna la sol·licitud ${r.codi}"
                   onclick="event.stopPropagation();tableDemo.openAssigna(this,'${r.codi}')">
             <i class="ti ti-user-plus" aria-hidden="true" style="font-size:13px"></i> Assigna
           </button>`
        : '';

      return `
        <div class="ua-sol-card" role="button" tabindex="0"
             onclick="tableDemo.viewSolicitud('${r.codi}')"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();tableDemo.viewSolicitud('${r.codi}')}"
             aria-label="Sol·licitud ${r.codi}: ${r.assumpte}">

          <div style="display:flex;justify-content:space-between;align-items:center;gap:var(--space-2)">
            <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);
                         font-weight:700;letter-spacing:.03em">${r.codi}</span>
            <div style="display:flex;align-items:center;gap:var(--space-2);flex-shrink:0">
              ${msgBadge}
              <span class="tag ${estat.cls}">${estat.label}</span>
            </div>
          </div>

          <div style="flex:1;min-height:0">
            <div style="font-weight:700;color:var(--color-text-primary);
                        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
                        overflow:hidden;line-height:var(--line-height-snug);
                        margin-bottom:3px">${r.assumpte}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted)">${r.tipus}</div>
          </div>

          <div style="display:flex;align-items:center;gap:var(--space-2);min-width:0;
                      padding:var(--space-2) 0;
                      border-top:1px solid var(--color-border-default);
                      border-bottom:1px solid var(--color-border-default)">
            ${respHtml}
          </div>

          <div style="font-size:var(--font-size-xs);display:flex;
                      justify-content:space-between;align-items:flex-start;gap:var(--space-3)">
            <div>
              <div style="color:var(--color-text-muted);margin-bottom:2px">
                <i class="ti ti-calendar-event" aria-hidden="true" style="font-size:11px"></i>
                Entrada ${dataFmt}
              </div>
              <div style="color:var(--color-text-secondary)">${accioLabel}</div>
              <div style="color:var(--color-text-muted)">${actorDisp} · ${ultMovTemp}</div>
            </div>
            <div style="display:flex;gap:var(--space-1);flex-shrink:0;align-items:flex-start"
                 onclick="event.stopPropagation()">
              ${assignaBtn}
              <button class="btn btn-ghost btn-sm"
                      style="padding:0 var(--space-2)"
                      aria-label="Més accions per a ${r.codi}"
                      aria-haspopup="menu" aria-expanded="false"
                      onclick="event.stopPropagation();tableDemo.openKebab(this,'${r.codi}')">
                <i class="ti ti-dots-vertical" aria-hidden="true" style="font-size:15px"></i>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function renderLoadMore(total) {
    const nav = document.getElementById('demo-pagination');
    if (!nav) return;

    const shown   = Math.min(_visibleCount, total);
    const hasMore = shown < total;
    const remaining = total - shown;
    const nextBatch = Math.min(PAGE_SIZE, remaining);

    nav.innerHTML = total === 0 ? '' : `
      <div class="ua-load-more-bar">
        <span class="ua-load-more-info" aria-live="polite" aria-atomic="true">
          Mostrant-ne <strong>${shown}</strong> de <strong>${total}</strong>
        </span>
        ${hasMore ? `
        <button class="btn btn-secondary btn-sm" id="btn-mostra-mes"
                onclick="tableDemo.loadMore()"
                aria-label="Mostra ${nextBatch} sol·licituds més">
          Mostra'n més
          <i class="ti ti-chevron-down" aria-hidden="true" style="font-size:13px"></i>
        </button>` : ''}
      </div>`;
  }

  function loadMore() {
    _visibleCount += PAGE_SIZE;
    renderTable();
    setTimeout(() => {
      const btn = document.getElementById('btn-mostra-mes');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  // ── Vista de detall ─────────────────────────────────── //

  const TIPUS_DESC = {
    'Recursos Humans':          'Sol·licitud de tramitació de documents relacionats amb la situació laboral del personal de la Universitat d\'Alacant.',
    'Secretaria Acadèmica':     'Petició formal a la Secretaria Acadèmica per a la gestió d\'aspectes de l\'expedient acadèmic.',
    'Informàtica':              'Sol·licitud de suport tècnic o d\'alta de servei al Servei d\'Informàtica de la UA. Termini de resolució: 48h hàbils.',
    'Benestar Universitari':    'Sol·licitud dirigida al Servei de Benestar Universitari que inclou orientació, beques de suport i serveis complementaris.',
    'Biblioteca':               'Petició de servei a la Biblioteca Universitària per a la gestió de fons, préstecs especials o accés a recursos digitals.',
    'Gestió d\'Espais':         'Sol·licitud de reserva o gestió d\'espais físics de la UA per a activitats, reunions o actes institucionals.',
    'Relacions Internacionals': 'Sol·licitud tramitada a través del Servei de Relacions Internacionals per a programes de mobilitat o reconeixement d\'estudis.',
    'eAdministració':           'Instància genèrica tramitada per la plataforma d\'administració electrònica de la UA (Llei 39/2015).',
    'Serveis Generals':         'Sol·licitud de suport o gestió adreçada als Serveis Generals de la Universitat d\'Alacant.',
  };

  function _addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  function generateHistorial(row) {
    const steps = [
      { date: row.data, text: 'Sol·licitud rebuda i registrada', done: true },
    ];

    if (row.estat === 'no-assignada') {
      steps.push({ date: null, text: 'Pendent d\'assignació a gestor/a', done: false });
    } else {
      steps.push({ date: _addDays(row.data, 1), text: 'Assignada a gestor/a per a la tramitació', done: true });
    }

    if (row.estat === 'sense-contestar') {
      steps.push({ date: null, text: 'Pendent de primera resposta del gestor/a', done: false });
    } else if (row.estat === 'pendent') {
      steps.push({ date: _addDays(row.data, 1), text: 'Primera resposta del gestor/a', done: true });
      steps.push({ date: null, text: 'En procés de tramitació', done: false });
    } else if (row.estat === 'esperant-usuari') {
      steps.push({ date: _addDays(row.data, 2), text: 'Gestor/a sol·licita informació addicional a l\'usuari', done: true });
      steps.push({ date: null, text: 'Esperant resposta de l\'usuari', done: false });
    } else if (row.estat === 'resolta' || row.estat === 'tancada') {
      steps.push({ date: _addDays(row.data, 3), text: 'Tramitada i resolta satisfactòriament', done: true });
    }

    if (row.estat === 'tancada') {
      steps.push({ date: _addDays(row.data, 4), text: 'Sol·licitud arxivada', done: true });
    }

    return steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      const dot    = step.done ? 'var(--color-primary)' : 'var(--color-border-strong)';
      const line   = step.done && !isLast ? 'var(--color-primary)' : 'var(--color-border-default)';
      return `
        <li style="display:flex;gap:var(--space-3);position:relative;padding-bottom:${isLast ? '0' : 'var(--space-4)'}">
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
            <div style="width:10px;height:10px;border-radius:50%;background:${dot};margin-top:4px;flex-shrink:0"></div>
            ${!isLast ? `<div style="width:2px;flex:1;background:${line};margin-top:4px"></div>` : ''}
          </div>
          <div style="flex:1;min-width:0;padding-bottom:${isLast ? '0' : 'var(--space-1)'}">
            <div style="font-size:var(--font-size-sm);color:var(--color-text-primary);font-weight:${step.done ? '700' : '400'}">${step.text}</div>
            ${step.date ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:2px">${step.date}</div>` : ''}
          </div>
        </li>`;
    }).join('');
  }

  function getRecord(codi) {
    return DATA.find(r => r.codi === codi) || null;
  }

  function viewSolicitud(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row) return;

    // Delega al drawer de la pàgina si existeix (Feature 3)
    if (typeof window.openDetall === 'function') {
      window.openDetall(codi);
      return;
    }

    if (typeof UAModal === 'undefined') {
      if (typeof showToast === 'function')
        showToast('info', 'Detall', `Sol·licitud ${codi} — ${row.assumpte}`);
      return;
    }

    const estat          = ESTAT_CFG[row.estat] || { cls: 'tag-neutral', label: row.estat };
    const desc           = TIPUS_DESC[row.tipus] || 'Sol·licitud tramitada a través del Campus Virtual de la Universitat d\'Alacant.';
    const id             = 'modal-detall-' + Date.now();
    const isNoAssignada  = row.estat === 'no-assignada';
    const isActive       = row.estat === 'sense-contestar' || row.estat === 'pendent' || row.estat === 'esperant-usuari';
    const isResolta      = row.estat === 'resolta';
    const isTancada      = row.estat === 'tancada';

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', `${id}-title`);

    // Botons del footer segons estat
    let footerLeft = '';
    if (isNoAssignada) {
      footerLeft = `
        <button class="btn btn-ghost btn-sm" id="${id}-assigna-btn"
                style="color:var(--color-info-text)">
          <i class="ti ti-user-check" aria-hidden="true" style="font-size:14px"></i>
          Assigna a mi
        </button>
        <button class="btn btn-ghost btn-sm" id="${id}-tanca-sol"
                style="color:var(--color-error-text)">
          <i class="ti ti-lock" aria-hidden="true" style="font-size:14px"></i>
          Arxiva
        </button>`;
    } else if (isActive) {
      footerLeft = `
        <button class="btn btn-ghost btn-sm" id="${id}-resol-btn"
                style="color:var(--color-success-text)">
          <i class="ti ti-circle-check" aria-hidden="true" style="font-size:14px"></i>
          Marca com a resolta
        </button>
        <button class="btn btn-ghost btn-sm" id="${id}-tanca-sol"
                style="color:var(--color-error-text)">
          <i class="ti ti-lock" aria-hidden="true" style="font-size:14px"></i>
          Arxiva
        </button>`;
    } else if (isResolta) {
      footerLeft = `
        <button class="btn btn-ghost btn-sm" id="${id}-tanca-sol"
                style="margin-right:auto;color:var(--color-error-text)">
          <i class="ti ti-lock" aria-hidden="true" style="font-size:14px"></i>
          Arxiva sol·licitud
        </button>`;
    } else if (isTancada) {
      footerLeft = `
        <button class="btn btn-secondary btn-sm" id="${id}-reobre-btn"
                style="margin-right:auto">
          <i class="ti ti-rotate" aria-hidden="true" style="font-size:14px"></i>
          Reobre
        </button>`;
    }

    const footerLeftWrapper = (isNoAssignada || isActive)
      ? `<div style="display:flex;gap:var(--space-2);margin-right:auto">${footerLeft}</div>`
      : footerLeft;

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:var(--space-1)">${row.tipus} · ${row.data}</div>
            <h2 class="modal-title" id="${id}-title">${row.codi}</h2>
          </div>
          <button class="modal-close" id="${id}-close-x" aria-label="Tanca el diàleg">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">
            <span class="tag ${estat.cls}">${estat.label}</span>
            ${row.responsable.length
              ? `<span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">Responsable:</span><span style="font-size:var(--font-size-sm)">${row.responsable.join(', ')}</span>`
              : `<span style="font-size:var(--font-size-xs);color:var(--color-text-muted);font-style:italic">Sense responsable assignat</span>`
            }
          </div>
          <div>
            <div style="font-size:var(--font-size-xs);font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-muted);margin-bottom:var(--space-2)">Assumpte</div>
            <div style="font-size:var(--font-size-base);color:var(--color-text-primary);font-weight:700;line-height:var(--line-height-snug)">${row.assumpte}</div>
          </div>
          <div>
            <div style="font-size:var(--font-size-xs);font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-muted);margin-bottom:var(--space-2)">Descripció</div>
            <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary);line-height:var(--line-height-relaxed)">${desc}</div>
          </div>
          <div>
            <div style="font-size:var(--font-size-xs);font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-muted);margin-bottom:var(--space-3)">Historial</div>
            <ul style="list-style:none;margin:0;padding:0">${generateHistorial(row)}</ul>
          </div>
        </div>
        <div class="modal-footer">
          ${footerLeftWrapper}
          <button class="btn btn-secondary" id="${id}-close-btn">Torna</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const modal = new UAModal({ onClose: () => setTimeout(() => overlay.remove(), 320) });
    modal._overlay = overlay;

    overlay.querySelector(`#${id}-close-x`).addEventListener('click',   () => modal.close());
    overlay.querySelector(`#${id}-close-btn`).addEventListener('click', () => modal.close());
    overlay.addEventListener('click', e => { if (e.target === overlay) modal.close(); });

    if (isNoAssignada || isActive || isResolta) {
      overlay.querySelector(`#${id}-tanca-sol`)?.addEventListener('click', () => {
        modal.close();
        setTimeout(() => closeSolicitudConfirm(codi), 250);
      });
    }

    if (isActive) {
      overlay.querySelector(`#${id}-resol-btn`)?.addEventListener('click', () => {
        modal.close();
        setTimeout(() => resolSolicitud(codi), 250);
      });
    }

    if (isNoAssignada) {
      overlay.querySelector(`#${id}-assigna-btn`)?.addEventListener('click', () => {
        modal.close();
        setTimeout(() => assignaSolicitud(codi), 250);
      });
    }

    if (isTancada) {
      overlay.querySelector(`#${id}-reobre-btn`)?.addEventListener('click', () => {
        modal.close();
        setTimeout(() => reobSolicitud(codi), 250);
      });
    }

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { modal.close(); document.removeEventListener('keydown', escHandler); }
    });

    modal.open(document.activeElement);
  }

  // ── Accions sobre sol·licituds ──────────────────────── //

  function closeSolicitudConfirm(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row || row.estat === 'tancada') return;

    if (typeof showConfirmDialog === 'undefined') {
      if (typeof showToast === 'function')
        showToast('warning', 'Arxiva sol·licitud', `Confirmació necessària per a ${codi}.`);
      return;
    }

    const notResolt = row.estat !== 'resolta';
    const avis = notResolt
      ? ' Nota: aquesta sol·licitud no ha estat resolta pel gestor. Arxivar-la sense resolució és vàlid (per exemple, en sol·licituds duplicades o cancel·lades), però no equival a una resolució satisfactòria.'
      : '';

    showConfirmDialog({
      title:       `Arxivar sol·licitud ${codi}`,
      description: `Estàs a punt d'arxivar "${row.assumpte}". L'expedient quedarà arxivat i no podrà ser modificat.${avis}`,
      confirmText: 'Arxiva l\'expedient',
      cancelText:  'Torna arrere',
      variant:     'warning',
      onConfirm:   () => {
        row.estat = 'tancada';
        renderTable();
        if (typeof showToast === 'function')
          showToast('success', 'Sol·licitud arxivada', `L'expedient ${codi} ha quedat arxivat correctament.`);
      },
    });
  }

  function resolSolicitud(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row || row.estat === 'resolta' || row.estat === 'tancada') return;

    row.estat = 'resolta';
    renderTable();
    if (typeof showToast === 'function')
      showToast('success', 'Sol·licitud resolta', `La sol·licitud ${codi} ha quedat marcada com a resolta.`);
  }

  function assignaSolicitud(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row || row.estat !== 'no-assignada') return;

    row.estat = 'sense-contestar';
    if (!row.responsable.includes(CURRENT_USER)) row.responsable.push(CURRENT_USER);
    renderTable();
    if (typeof showToast === 'function')
      showToast('success', 'Sol·licitud assignada', `La sol·licitud ${codi} t'ha estat assignada.`);
  }

  function marcarPendent(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row) return;
    row.estat = 'pendent';
    renderTable();
    if (typeof showToast === 'function')
      showToast('success', 'Estat actualitzat', `La sol·licitud ${codi} ha passat a Pendent.`);
  }

  function marcarEsperant(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row) return;
    row.estat = 'esperant-usuari';
    renderTable();
    if (typeof showToast === 'function')
      showToast('info', 'Estat actualitzat', `La sol·licitud ${codi} passa a Esperant usuari.`);
  }

  function renviasSolicitud(codi) {
    if (typeof showToast === 'function')
      showToast('info', 'Sol·licitud reenvida',
        `La sol·licitud ${codi} ha estat reenvida. Rebràs resposta en les pròximes 48 hores hàbils.`);
  }

  function reobSolicitud(codi) {
    const row = DATA.find(r => r.codi === codi);
    if (!row || row.estat !== 'tancada') return;

    row.estat = 'no-assignada';
    renderTable();
    if (typeof showToast === 'function')
      showToast('info', 'Sol·licitud reoberta', `La sol·licitud ${codi} s'ha reactivat i torna a l'estat No assignada.`);
  }

  // ── Dropdown Assigna ─────────────────────────────────────── //

  let _assigna = { btn: null, codi: null };

  function openAssigna(triggerBtn, codi) {
    const menu = document.getElementById('assigna-menu');
    if (!menu) return;

    if (_assigna.codi === codi) { closeAssigna(); return; }
    closeAssigna();

    const row = DATA.find(r => r.codi === codi);
    if (!row) return;

    menu.innerHTML = `
      <div style="padding:var(--space-2) var(--space-4);font-size:var(--font-size-xs);
                  color:var(--color-text-muted);font-weight:700;text-transform:uppercase;
                  letter-spacing:.06em;border-bottom:1px solid var(--color-border-default)">
        Assigna a:
      </div>
      ${GESTORS.map(g => {
        const obertes  = _compteObertes(g.nom);
        const esActual = row.responsable.includes(g.nom);
        return `
          <button class="ua-kebab-float__item${esActual ? ' ua-kebab-float__item--active' : ''}"
                  data-gestor="${g.nom}" aria-pressed="${esActual}">
            <span style="display:inline-flex;align-items:center;justify-content:center;
                         width:24px;height:24px;border-radius:50%;
                         background:var(--color-primary-muted);
                         color:var(--color-primary);font-size:10px;font-weight:700;
                         flex-shrink:0">${g.inici}</span>
            <span style="flex:1;min-width:0;text-align:left">
              <span style="display:block">${g.nom}</span>
              <span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">${obertes} assignades</span>
            </span>
            ${esActual ? '<i class="ti ti-check" aria-hidden="true" style="color:var(--color-primary)"></i>' : ''}
          </button>`;
      }).join('')}`;

    menu.setAttribute('aria-label', `Assigna la sol·licitud ${codi}`);

    const rect  = triggerBtn.getBoundingClientRect();
    const vw    = window.innerWidth;
    const menuW = 230;
    let left    = rect.right - menuW;
    if (left < 8) left = 8;
    if (left + menuW > vw - 8) left = vw - menuW - 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const menuH      = 44 + GESTORS.length * 56;
    const top        = spaceBelow > menuH + 8 ? rect.bottom + 4 : rect.top - menuH - 4;

    menu.style.top  = top + 'px';
    menu.style.left = left + 'px';
    menu.removeAttribute('hidden');
    menu.removeAttribute('aria-hidden');
    triggerBtn.setAttribute('aria-expanded', 'true');
    _assigna = { btn: triggerBtn, codi };

    setTimeout(() => {
      document.addEventListener('click',   _onAssignaDocClick);
      document.addEventListener('keydown', _onAssignaDocKey);
    }, 0);

    requestAnimationFrame(() => menu.querySelector('button')?.focus());
  }

  function closeAssigna() {
    const menu = document.getElementById('assigna-menu');
    if (!menu || menu.hasAttribute('hidden')) return;
    menu.setAttribute('hidden', '');
    menu.setAttribute('aria-hidden', 'true');
    _assigna.btn?.setAttribute('aria-expanded', 'false');
    _assigna = { btn: null, codi: null };
    document.removeEventListener('click',   _onAssignaDocClick);
    document.removeEventListener('keydown', _onAssignaDocKey);
  }

  function _onAssignaDocClick(e) {
    const menu = document.getElementById('assigna-menu');
    if (!menu) return;
    const item = e.target.closest('[data-gestor]');
    if (item && menu.contains(item)) {
      const gestor = item.dataset.gestor;
      const codi   = _assigna.codi;
      closeAssigna();
      _assignaAGestor(codi, gestor);
      return;
    }
    if (!menu.contains(e.target)) closeAssigna();
  }

  function _onAssignaDocKey(e) {
    const menu = document.getElementById('assigna-menu');
    if (!menu) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      const btn = _assigna.btn;
      closeAssigna();
      btn?.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...menu.querySelectorAll('[data-gestor]')];
      const idx   = items.indexOf(document.activeElement);
      const next  = e.key === 'ArrowDown'
        ? items[(idx + 1) % items.length]
        : items[(idx - 1 + items.length) % items.length];
      next?.focus();
    }
    if (e.key === 'Tab') closeAssigna();
  }

  function _assignaAGestor(codi, gestor) {
    const row = DATA.find(r => r.codi === codi);
    if (!row) return;
    if (!row.responsable.includes(gestor)) row.responsable.push(gestor);
    row.estat = 'sense-contestar';
    renderTable();
    renderAlertStrip();
    if (typeof showToast === 'function')
      showToast('success', 'Sol·licitud assignada',
        `La sol·licitud ${codi} ha estat assignada a ${gestor}.`);
  }

  // ── Popup resum de gestor (avatar click) ────────────────── //

  let _gestorPopup = { btn: null };

  function _gestorStats(nom) {
    const avui = new Date(); avui.setHours(0, 0, 0, 0);
    const ahir = new Date(avui); ahir.setDate(ahir.getDate() - 1);
    const ahirStr = _localDateStr(ahir);
    const meves = DATA.filter(r => r.responsable.includes(nom) && ESTATS_OBERTS.has(r.estat));
    return {
      obertes:        meves.length,
      terminiSuperat: meves.filter(r => r.termini === 'superat').length,
      accioHui:       DATA.filter(r =>
        r.data === ahirStr && r.responsable.includes(nom) &&
        (r.estat === 'no-assignada' || r.ultimMoviment?.actor === 'Sistema')).length,
      prioritatAlta:  meves.filter(r => r.prioritat === 'alta').length,
    };
  }

  function openGestorPopup(triggerBtn, nom) {
    let popup = document.getElementById('gestor-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'gestor-popup';
      popup.className = 'ua-kebab-float';
      popup.setAttribute('role', 'status');
      popup.setAttribute('hidden', '');
      popup.style.minWidth = '210px';
      popup.style.padding = '0';
      document.body.appendChild(popup);
    }

    if (_gestorPopup.btn === triggerBtn && !popup.hasAttribute('hidden')) {
      closeGestorPopup(); return;
    }
    closeGestorPopup();

    const st = _gestorStats(nom);
    popup.innerHTML = `
      <div style="padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border-default)">
        <div style="font-weight:700;font-size:var(--font-size-sm);color:var(--color-text-primary)">${nom}</div>
      </div>
      <div style="padding:var(--space-2) var(--space-4) var(--space-3);display:flex;flex-direction:column;gap:var(--space-1)">
        <div style="display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--font-size-sm)">
          <span style="color:var(--color-text-secondary)">Assignades</span>
          <span style="font-weight:700">${st.obertes}</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--font-size-sm)">
          <span style="color:var(--color-error-text)">Termini superat</span>
          <span style="font-weight:700;color:var(--color-error-text)">${st.terminiSuperat}</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:var(--space-4);font-size:var(--font-size-sm)">
          <span style="color:var(--color-warning-text)">Prioritat alta</span>
          <span style="font-weight:700;color:var(--color-warning-text)">${st.prioritatAlta}</span>
        </div>
      </div>`;

    const rect = triggerBtn.getBoundingClientRect();
    const vw = window.innerWidth;
    const menuW = 210;
    let left = rect.left;
    if (left + menuW > vw - 8) left = vw - menuW - 8;
    if (left < 8) left = 8;

    popup.style.top  = (rect.bottom + 6) + 'px';
    popup.style.left = left + 'px';
    popup.removeAttribute('hidden');
    _gestorPopup.btn = triggerBtn;

    setTimeout(() => document.addEventListener('click', _onGestorPopupClick), 0);
  }

  function closeGestorPopup() {
    const popup = document.getElementById('gestor-popup');
    if (popup && !popup.hasAttribute('hidden')) popup.setAttribute('hidden', '');
    _gestorPopup.btn = null;
    document.removeEventListener('click', _onGestorPopupClick);
  }

  function _onGestorPopupClick(e) {
    const popup = document.getElementById('gestor-popup');
    if (popup && !popup.contains(e.target) && e.target !== _gestorPopup.btn) {
      closeGestorPopup();
    }
  }

  // ── Strip d'alertes ──────────────────────────────────────── //

  function _calcAlerts() {
    const avui = new Date(); avui.setHours(0, 0, 0, 0);
    const ahir = new Date(avui); ahir.setDate(ahir.getDate() - 1);
    const ahirStr = _localDateStr(ahir);
    const set7 = new Date(avui); set7.setDate(set7.getDate() - 7);

    const accioHui = DATA.filter(r =>
      r.data === ahirStr &&
      (r.estat === 'no-assignada' || r.ultimMoviment?.actor === 'Sistema')
    ).length;

    const hanContestat = DATA.filter(r =>
      r.ultimMoviment?.actor !== CURRENT_USER &&
      r.ultimMoviment?.actor !== 'Sistema' &&
      ['missatge', 'adjunt'].includes(r.ultimMoviment?.accio) &&
      new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO
    ).length;

    const reoberta = DATA.filter(r =>
      r.ultimMoviment?.accio === 'reobre' &&
      new Date(r.ultimMoviment.data + 'T00:00:00') >= set7
    ).length;

    const novesNoAssignades = DATA.filter(r =>
      r.estat === 'no-assignada' &&
      new Date(r.data + 'T00:00:00') > ULTIMA_CONNEXIO
    ).length;

    return { accioHui, hanContestat, reoberta, novesNoAssignades };
  }

  function _countSection(estat) {
    const saved = { ...state };
    Object.assign(state, { estat, cerca: '', filtreTipus: '', filtrePrior: '', filtreResp: '', filtreData: '', filtreDataConcreta: '' });
    const n = filteredData().length;
    Object.assign(state, saved);
    return n;
  }

  function getResumConnexio() {
    const { hanContestat } = _calcAlerts();
    const foraDeTermini  = DATA.filter(r => r.termini === 'superat').length;
    const resoltes       = DATA.filter(r =>
      r.estat === 'resolta' &&
      r.ultimMoviment?.data &&
      new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO
    ).length;
    const reassignades   = DATA.filter(r =>
      r.estat === 'sense-contestar' && r.responsable.includes(CURRENT_USER)
    ).length;
    return { hanContestat, foraDeTermini, resoltes, reassignades };
  }

  function renderAlertStrip() {
    const strip = document.getElementById('ua-alert-strip');
    if (strip) strip.hidden = true;
  }

  function renderKpiCounts() {
    const { accioHui, hanContestat, novesNoAssignades } = _calcAlerts();
    const foraTermini   = DATA.filter(r => r.termini === 'superat').length;
    const prioritatAlta = DATA.filter(r => r.prioritat === 'alta').length;
    const senseResp     = DATA.filter(r => r.estat === 'no-assignada').length;
    const resoltes      = DATA.filter(r =>
      r.estat === 'resolta' && r.ultimMoviment?.data != null &&
      new Date(r.ultimMoviment.data + 'T00:00:00') > ULTIMA_CONNEXIO
    ).length;
    const reassignades  = DATA.filter(r =>
      r.estat === 'sense-contestar' && r.responsable.includes(CURRENT_USER)
    ).length;

    const counts = {
      'han-contestat':     hanContestat,
      'termini-superat':   foraTermini,
      'resolta':           resoltes,
      'sense-contestar':   reassignades,
      'no-assignada-nova': novesNoAssignades,
      'prioritat-alta':    prioritatAlta,
      'no-assignada':      senseResp,
      'accio-hui':         accioHui,
    };

    Object.entries(counts).forEach(([filter, n]) => {
      document.querySelectorAll(`button.ua-kpi[data-filter="${filter}"]`).forEach(btn => {
        const valEl = btn.querySelector('.ua-kpi__value');
        if (valEl) valEl.textContent = n;
        // Zero: desactiva visualment (gris) en lloc d'ocultar
        btn.setAttribute('aria-disabled', n === 0 ? 'true' : 'false');
        if (n === 0) {
          btn.setAttribute('tabindex', '-1');
        } else {
          btn.removeAttribute('tabindex');
        }
      });
    });

    // Totals de secció per als botons "Mostra"
    const novetatsN = _countSection('novetats-all');
    const atencioN  = _countSection('atencio-all');
    const elN = document.getElementById('mostra-novetats-count');
    const elA = document.getElementById('mostra-atencio-count');
    if (elN) elN.textContent = `(${novetatsN})`;
    if (elA) elA.textContent = `(${atencioN})`;
    const btnN = document.getElementById('btn-mostra-novetats');
    const btnA = document.getElementById('btn-mostra-atencio');
    if (btnN) btnN.setAttribute('aria-label', `Mostra totes les ${novetatsN} sol·licituds de Novetats`);
    if (btnA) btnA.setAttribute('aria-label', `Mostra totes les ${atencioN} sol·licituds que demanen atenció`);
  }

  // ── API pública ──────────────────────────────────────── //

  function goPage(p) {
    state.page = p;
    renderTable();
  }

  function sortBy(col) {
    if (state.sortCol === col) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortCol = col;
      state.sortDir = 'asc';
    }
    state.page = 1;
    renderTable();
  }

  function init() {
    const searchEl = document.getElementById('table-search-input');
    const filterEl = document.getElementById('table-filter-estat');

    if (searchEl) {
      searchEl.addEventListener('input', () => {
        state.cerca = searchEl.value;
        state.page  = 1;
        renderTable();
      });
    }

    if (filterEl) {
      filterEl.addEventListener('change', () => {
        state.estat = filterEl.value;
        state.page  = 1;
        renderTable();
      });
    }

    const table = document.getElementById('demo-table');
    if (table) {
      table.addEventListener('click', e => {
        const th = e.target.closest('.table-th--sortable');
        if (th) { sortBy(th.dataset.col); return; }

        // Clic a la fila → obre el detall (excepte botons)
        if (e.target.closest('button, a, input, select')) return;
        const tr = e.target.closest('tbody tr[data-row-id]');
        if (tr) viewSolicitud(tr.dataset.rowId);
      });

      table.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          const th = e.target.closest('.table-th--sortable');
          if (th) { e.preventDefault(); sortBy(th.dataset.col); }
        }
      });
    }

    renderTable();
    renderAlertStrip();
    renderKpiCounts();
  }

  function filterNavAlerta(estat) {
    if (typeof filterNav === 'function') filterNav(estat);
    else setEstat(estat);
  }

  function setEstat(estat) {
    state.estat  = estat;
    state.page   = 1;
    _visibleCount = PAGE_SIZE;
    renderTable();
  }

  function setFiltre(key, val) {
    state[key]    = val;
    state.page    = 1;
    _visibleCount = PAGE_SIZE;
    renderTable();
  }

  function getTipus() {
    return [...new Set(DATA.map(r => r.tipus))].sort();
  }

  function getResponsables() {
    const set = new Set();
    DATA.forEach(r => r.responsable.forEach(p => set.add(p)));
    return [...set].sort();
  }

  return {
    init, goPage, sortBy,
    viewSolicitud, closeSolicitudConfirm,
    openKebab, resolSolicitud, assignaSolicitud, marcarPendent, marcarEsperant, renviasSolicitud, reobSolicitud,
    openAssigna, closeAssigna,
    renderAlertStrip, renderKpiCounts, filterNavAlerta,
    setEstat, setFiltre, loadMore, getTipus, getResponsables,
    openGestorPopup, closeGestorPopup,
    renderCardsGrid, getRecord,
    getResumConnexio,
  };
})();

// ══════════════════════════════════════════════════════════
// UATable — Taula avançada reutilitzable
//
// Funcionalitats (s'activen per presència d'elements HTML):
//
//   Selecció de files:
//     <input class="table-check-all"> a thead
//     <input class="table-check-row"> a cada <tr data-row-id="x">
//     Shift+clic per selecció de rang.
//
//   Files expandibles:
//     <tr data-expandable data-row-id="x">
//     opts.expandFn(rowId, trEl) → HTML string del contingut
//
//   Barra d'accions en lot (apareix automàticament amb selecció):
//     opts.bulkActions = [{ action, label, icon }]
//     opts.onBulkAction(action, ids[]) → callback
//     Botó "Exporta CSV" inclòs per defecte.
//
//   Exportació CSV:
//     Exporta les files seleccionades (o totes si no n'hi ha cap).
//     opts.csvFilename  — nom del fitxer (default: 'exportació.csv')
//     opts.csvColumns   — [{ key, label }] (default: inferit de <th>)
//     Les columnes de select/expand/accions s'exclouen automàticament.
//
// API pública:
//   ua.getSelected()    → string[]
//   ua.clearSelection() → void
//   ua.exportCSV()      → void
//   ua.refresh()        → re-inicialitza (usar després de canvis al DOM)
//
// Auto-inicialització:
//   <table class="table" data-ua-table> → new UATable(el)
// ══════════════════════════════════════════════════════════

class UATable {
  constructor(tableEl, opts = {}) {
    this.el       = tableEl;
    this._opts    = opts;
    this._sel     = new Set();
    this._lastChk = null;
    this._bulkBar = null;
    this._expanded = new Map();  // rowId → <tr> de contingut expandit

    this._init();
  }

  // ── Inicialització ──────────────────────────────────────

  _init() {
    const hasSelect = !!this.el.querySelector('.table-check-all, .table-check-row');
    const hasExpand = !!this.el.querySelector('[data-expandable]');

    if (hasSelect) this._initSelection();
    if (hasExpand) this._initExpansion();

    const wrap = this.el.closest('.table-wrap');
    if (wrap && hasSelect) this._initBulkBar(wrap);
  }

  // ── Selecció de files ───────────────────────────────────

  _initSelection() {
    const allChk = this.el.querySelector('.table-check-all');
    if (allChk) {
      allChk.addEventListener('change', () => this._toggleAll(allChk.checked));
    }

    // Event delegation al tbody — funciona amb DOM dinàmic (paginació, filtratge)
    const tbody = this.el.querySelector('tbody');
    if (tbody) {
      tbody.addEventListener('click', e => {
        const chk = e.target.closest('.table-check-row');
        if (chk) this._onRowChkClick(e, chk);
      });
    }

    this.el.querySelectorAll('.table-check-row:checked').forEach(chk => {
      const id = chk.closest('tr')?.dataset.rowId;
      if (id) this._sel.add(id);
    });
  }

  // Cridar després de re-renderitzar el tbody (paginació, filtratge)
  onRerender() {
    this._lastChk = null;
    this.el.querySelectorAll('tbody tr[data-row-id]').forEach(tr => {
      const chk = tr.querySelector('.table-check-row');
      if (chk) chk.checked = this._sel.has(tr.dataset.rowId);
    });
    this._syncAllChk();
    this._updateBulkBar();
  }

  _onRowChkClick(e, chk) {
    const id = chk.closest('tr')?.dataset.rowId;
    if (!id) return;

    if (e.shiftKey && this._lastChk) {
      this._selectRange(this._lastChk, chk);
    } else {
      this._toggleRow(id, chk.checked);
      this._lastChk = chk;
    }
    this._syncAllChk();
    this._updateBulkBar();
  }

  _selectRange(from, to) {
    const rows  = [...this.el.querySelectorAll('tbody tr[data-row-id]')];
    const chks  = rows.map(tr => tr.querySelector('.table-check-row'));
    const iFrom = chks.indexOf(from);
    const iTo   = chks.indexOf(to);
    if (iFrom === -1 || iTo === -1) return;

    const [s, e] = iFrom < iTo ? [iFrom, iTo] : [iTo, iFrom];
    const check  = to.checked;
    for (let i = s; i <= e; i++) {
      const rowId = rows[i]?.dataset.rowId;
      if (!rowId) continue;
      chks[i].checked = check;
      this._toggleRow(rowId, check);
    }
    this._lastChk = to;
  }

  _toggleRow(id, checked) {
    const tr = this.el.querySelector(`tr[data-row-id="${CSS.escape(id)}"]`);
    if (checked) {
      this._sel.add(id);
      tr?.classList.add('table-tr--selected');
    } else {
      this._sel.delete(id);
      tr?.classList.remove('table-tr--selected');
    }
  }

  _toggleAll(checked) {
    this.el.querySelectorAll('tbody tr[data-row-id]').forEach(tr => {
      const chk = tr.querySelector('.table-check-row');
      if (chk) chk.checked = checked;
      this._toggleRow(tr.dataset.rowId, checked);
    });
    this._lastChk = null;
    this._updateBulkBar();
  }

  _syncAllChk() {
    const allChk = this.el.querySelector('.table-check-all');
    if (!allChk) return;
    const rows = [...this.el.querySelectorAll('tbody tr[data-row-id]')];
    const all  = rows.length > 0 && rows.every(tr => this._sel.has(tr.dataset.rowId));
    const some = rows.some(tr => this._sel.has(tr.dataset.rowId));
    allChk.checked       = all;
    allChk.indeterminate = !all && some;
  }

  // ── Barra d'accions en lot ──────────────────────────────

  _initBulkBar(wrap) {
    let bar = wrap.querySelector('.table-bulk-bar');
    if (!bar) {
      bar = this._buildBulkBar();
      wrap.appendChild(bar);
    }
    this._bulkBar = bar;

    bar.querySelector('.table-bulk-clear')?.addEventListener('click', () => this.clearSelection());

    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-bulk-action]');
      if (!btn) return;
      const action = btn.dataset.bulkAction;
      if (action === 'export-csv') {
        this.exportCSV();
      } else if (this._opts.onBulkAction) {
        this._opts.onBulkAction(action, this.getSelected());
      }
    });
  }

  _buildBulkBar() {
    const extraActions = (this._opts.bulkActions || []).map(a =>
      `<button class="btn btn-sm table-bulk-btn" data-bulk-action="${a.action}">
        ${a.icon ? `<i class="ti ${a.icon}" aria-hidden="true"></i>` : ''}
        ${a.label}
      </button>`
    ).join('');

    const bar = document.createElement('div');
    bar.className = 'table-bulk-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', uaT('table.bulk.aria', 'Accions per a les files seleccionades'));
    bar.innerHTML = `
      <span class="table-bulk-count" aria-live="polite" aria-atomic="true"></span>
      <div class="table-bulk-actions">
        ${extraActions}
        <button class="btn btn-sm table-bulk-btn" data-bulk-action="export-csv">
          <i class="ti ti-download" aria-hidden="true"></i>
          ${uaT('table.bulk.exportCsv', 'Exporta CSV')}
        </button>
      </div>
      <button class="btn btn-sm table-bulk-clear" aria-label="${uaT('table.bulk.clear', 'Esborra la selecció')}">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>`;
    return bar;
  }

  _updateBulkBar() {
    if (!this._bulkBar) return;
    const count = this._sel.size;
    this._bulkBar.classList.toggle('table-bulk-bar--visible', count > 0);
    const countEl = this._bulkBar.querySelector('.table-bulk-count');
    if (countEl) {
      countEl.textContent = count === 1
        ? uaT('table.bulk.countOne', '1 fila seleccionada')
        : uaT('table.bulk.countMany', '{n} files seleccionades').replace('{n}', count);
    }
  }

  // ── Files expandibles ───────────────────────────────────

  _initExpansion() {
    this.el.querySelectorAll('tbody tr[data-expandable]').forEach(tr => {
      let expandCell = tr.querySelector('.table-td--expand');
      if (!expandCell) {
        expandCell = document.createElement('td');
        expandCell.className = 'table-td table-td--expand';
        tr.insertBefore(expandCell, tr.firstChild);
      }

      if (!expandCell.querySelector('.table-btn-expand')) {
        const btn = document.createElement('button');
        btn.className = 'table-btn-expand';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', uaT('table.expand.aria', 'Expandeix fila'));
        btn.innerHTML = '<i class="ti ti-chevron-right" aria-hidden="true"></i>';
        expandCell.appendChild(btn);
      }

      const btn = expandCell.querySelector('.table-btn-expand');
      btn.addEventListener('click', () => this._toggleExpand(tr, btn));
    });
  }

  _toggleExpand(tr, btn) {
    const rowId  = tr.dataset.rowId;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      btn.setAttribute('aria-expanded', 'false');
      tr.classList.remove('table-tr--expanded');
      const contentTr = this._expanded.get(rowId);
      if (contentTr) {
        contentTr.classList.remove('table-tr--expand-content--open');
        setTimeout(() => contentTr.setAttribute('hidden', ''), 250);
      }
      return;
    }

    btn.setAttribute('aria-expanded', 'true');
    tr.classList.add('table-tr--expanded');

    let contentTr = this._expanded.get(rowId);
    if (!contentTr) {
      const colCount = tr.querySelectorAll('td').length;
      const html = this._opts.expandFn ? this._opts.expandFn(rowId, tr) : '';
      contentTr = document.createElement('tr');
      contentTr.className = 'table-tr--expand-content';
      contentTr.setAttribute('hidden', '');
      contentTr.innerHTML =
        `<td class="table-td--expand-content" colspan="${colCount}">
           <div class="table-expand-inner"><div>${html}</div></div>
         </td>`;
      tr.insertAdjacentElement('afterend', contentTr);
      this._expanded.set(rowId, contentTr);
    }

    contentTr.removeAttribute('hidden');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => contentTr.classList.add('table-tr--expand-content--open'))
    );
  }

  // ── Exportació CSV ──────────────────────────────────────

  exportCSV() {
    const filename = this._opts.csvFilename || 'exportació.csv';

    // Capçaleres
    let headers;
    if (this._opts.csvColumns) {
      headers = this._opts.csvColumns.map(c => c.label);
    } else {
      headers = [...this.el.querySelectorAll('thead th')]
        .filter(th =>
          !th.classList.contains('table-th--select') &&
          !th.classList.contains('table-th--expand') &&
          !th.classList.contains('table-th--actions'))
        .map(th => {
          const clone = th.cloneNode(true);
          clone.querySelectorAll('.sort-icon, [aria-hidden]').forEach(n => n.remove());
          return clone.textContent.trim();
        });
    }

    // Files: seleccionades o totes les visibles
    const ids = this._sel.size > 0 ? [...this._sel] : null;
    const rows = [...this.el.querySelectorAll('tbody tr[data-row-id]')]
      .filter(tr => !ids || ids.includes(tr.dataset.rowId));

    const csvRows = rows.map(tr => {
      let cells;
      if (this._opts.csvColumns) {
        cells = this._opts.csvColumns.map(c => {
          const td = tr.querySelector(`[data-csv-col="${c.key}"]`);
          return td ? td.textContent.trim() : (tr.dataset[c.key] ?? '');
        });
      } else {
        cells = [...tr.querySelectorAll('td')]
          .filter(td =>
            !td.classList.contains('table-td--select') &&
            !td.classList.contains('table-td--expand') &&
            !td.classList.contains('table-td--actions'))
          .map(td => {
            const clone = td.cloneNode(true);
            clone.querySelectorAll('[aria-hidden]').forEach(n => n.remove());
            return clone.textContent.trim();
          });
      }
      return cells.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    // BOM perquè Excel obri correctament l'UTF-8
    const csv  = '﻿' + [headers.map(h => `"${h}"`).join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── API pública ─────────────────────────────────────────

  getSelected() { return [...this._sel]; }

  clearSelection() {
    this._sel.clear();
    this.el.querySelectorAll('.table-check-row').forEach(chk => { chk.checked = false; });
    this.el.querySelectorAll('.table-tr--selected').forEach(tr => tr.classList.remove('table-tr--selected'));
    const allChk = this.el.querySelector('.table-check-all');
    if (allChk) { allChk.checked = false; allChk.indeterminate = false; }
    this._lastChk = null;
    this._updateBulkBar();
  }

  refresh() {
    this._sel.clear();
    this._expanded.clear();
    this._bulkBar = null;
    this._init();
  }
}

// Auto-inicialització per a <table class="table" data-ua-table>
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.table[data-ua-table]').forEach(el => {
    if (!el._uaTable) el._uaTable = new UATable(el);
  });
});

window.UATable = UATable;

// ── Skeleton in-table ────────────────────────────────────────
// Genera files de skeleton per substituir el tbody durant la càrrega.
//
// Ús:
//   tbody.innerHTML = UATable.skelRows(10, ['lg', 'md', 'sm', 'badge', 'btn']);
//
// colWidths: array de mides per columna.
//   Opcions: 'xs' | 'sm' | 'md' | 'lg' | 'full' | 'badge' | 'btn' | 'icon' | 'check'
//   Per a columnes de checkbox/expand useu 'check' o 'icon'.
//
UATable.skelRows = function(count = 5, colWidths = ['lg', 'md', 'sm', 'sm', 'badge', 'btn']) {
  const row = `<tr class="table-tr--skel">${
    colWidths.map(w =>
      `<td><div class="table-skel table-skel--${w}"></div></td>`
    ).join('')
  }</tr>`;
  return row.repeat(count);
};


/* ── components/kanban/kanban.js ───────────────────────── */

// ── UAKanban ──────────────────────────────────────────────
// Tauler Kanban: drag & drop HTML5 + navegació per teclat.
//
// HTML mínim:
//   <div class="kanban" id="kb1">
//     <div class="kanban__board">
//       <div class="kanban__column" data-col-id="todo">
//         <div class="kanban__col-header">
//           <h3 class="kanban__col-title">Per fer</h3>
//           <span class="kanban__col-count" aria-live="polite"></span>
//           <button class="kanban__col-add-btn" aria-label="Afegir targeta a Per fer"
//                   aria-expanded="false">
//             <i class="ti ti-plus" aria-hidden="true"></i>
//           </button>
//         </div>
//         <div class="kanban__col-body" role="list" aria-label="Per fer"
//              data-empty-text="Cap targeta">
//           <div class="kanban__card" data-card-id="c1" role="listitem">
//             <p class="kanban__card-title">Títol</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
//
// Opcions de columna:
//   data-wip-limit="N"   — activa barra i alerta si count > N
//
// API pública:
//   kb.addCard(colId, { title, meta, priority, labels })
//     → Element | null
//   kb.moveCard(cardId, toColId)
//   kb.getState()
//     → { columns: [{ id, title, wip, cards: [{id, title, priority}] }] }
//
// Events DOM (bubbling):
//   'ua:kanban:card:click' → detail: { cardId, card: Element }  [cancelable]
//   'ua:kanban:move'       → detail: { cardId, fromColId, toColId }
//   'ua:kanban:add'        → detail: { colId, card: Element }
//
// Navegació per teclat:
//   Tab/Shift+Tab     — mou el focus entre targetes
//   Enter / Espai     — obre el modal de detall de la targeta
//   M                 — entra o confirma mode de moviment
//   ← →               — mou la targeta a la columna anterior/següent (mode moviment)
//   Escape            — cancel·la el moviment
// ──────────────────────────────────────────────────────────

(function () {
  'use strict';

  let _idSeq = 0;

  class UAKanban {
    constructor(el) {
      this.el         = el;
      this._dragging  = null;   // Element arrossegat
      this._moving    = null;   // Element en mode moviment per teclat
      this._dndCounters = {};   // Comptadors per a dragenter/dragleave

      this._announcer = this._createAnnouncer();
      el.style.position = 'relative';
      el.appendChild(this._announcer);

      this._init();
    }

    // ── API pública ──────────────────────────────────────

    addCard(colId, { title = '', meta = '', priority = '', labels = [] } = {}) {
      const col = this._col(colId);
      if (!col) return null;

      const card = this._buildCard({ title, meta, priority, labels });
      const body = col.querySelector('.kanban__col-body');
      body.appendChild(card);
      this._initCard(card);
      this._refresh(col);

      this.el.dispatchEvent(new CustomEvent('ua:kanban:add', {
        bubbles: true,
        detail: { colId, card },
      }));
      return card;
    }

    moveCard(cardId, toColId) {
      const card  = this.el.querySelector(`[data-card-id="${CSS.escape(cardId)}"]`);
      const toCol = this._col(toColId);
      if (!card || !toCol) return;

      const fromCol = card.closest('.kanban__column');
      toCol.querySelector('.kanban__col-body').appendChild(card);
      if (fromCol) this._refresh(fromCol);
      this._refresh(toCol);

      this.el.dispatchEvent(new CustomEvent('ua:kanban:move', {
        bubbles: true,
        detail: { cardId, fromColId: fromCol?.dataset.colId ?? null, toColId },
      }));
    }

    getState() {
      return {
        columns: Array.from(this.el.querySelectorAll('.kanban__column')).map(col => ({
          id:    col.dataset.colId,
          title: col.querySelector('.kanban__col-title')?.textContent?.trim() ?? '',
          wip:   col.dataset.wipLimit != null ? parseInt(col.dataset.wipLimit) : null,
          cards: Array.from(col.querySelectorAll('.kanban__card')).map(c => ({
            id:       c.dataset.cardId,
            title:    c.querySelector('.kanban__card-title')?.textContent?.trim() ?? '',
            priority: [...c.classList]
                        .find(cls => cls.startsWith('kanban__card--priority-'))
                        ?.replace('kanban__card--priority-', '') ?? '',
          })),
        })),
      };
    }

    // ── Inicialització ───────────────────────────────────

    _init() {
      this.el.querySelectorAll('.kanban__column').forEach(col => this._initColumn(col));
      this.el.querySelectorAll('.kanban__card').forEach(card => this._initCard(card));

      // Escape global per cancel·lar moviment de teclat
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this._moving) this._cancelMove();
      });
    }

    _initColumn(col) {
      const colId = col.dataset.colId;
      const body  = col.querySelector('.kanban__col-body');
      const addBtn = col.querySelector('.kanban__col-add-btn');

      if (!col.querySelector('.kanban__add-form')) {
        col.appendChild(this._buildAddForm(col));
      }

      if (body) {
        this._dndCounters[colId] = 0;

        body.addEventListener('dragover', e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });

        body.addEventListener('dragenter', e => {
          e.preventDefault();
          this._dndCounters[colId] = (this._dndCounters[colId] || 0) + 1;
          body.classList.add('kanban__col-body--drag-over');
        });

        body.addEventListener('dragleave', () => {
          this._dndCounters[colId]--;
          if (this._dndCounters[colId] <= 0) {
            this._dndCounters[colId] = 0;
            body.classList.remove('kanban__col-body--drag-over');
          }
        });

        body.addEventListener('drop', e => {
          e.preventDefault();
          this._dndCounters[colId] = 0;
          body.classList.remove('kanban__col-body--drag-over');

          const cardId = e.dataTransfer.getData('text/plain');
          const card   = cardId ? this.el.querySelector(`[data-card-id="${CSS.escape(cardId)}"]`) : null;
          if (!card || !this._dragging) return;

          const fromBody = card.closest('.kanban__col-body');
          const fromCol  = card.closest('.kanban__column');
          if (fromBody === body) return;

          body.appendChild(card);
          if (fromCol) this._refresh(fromCol);
          this._refresh(col);

          const colTitle = col.querySelector('.kanban__col-title')?.textContent?.trim() ?? '';
          this._announce(`Targeta moguda a ${colTitle}`);

          this.el.dispatchEvent(new CustomEvent('ua:kanban:move', {
            bubbles: true,
            detail: { cardId, fromColId: fromCol?.dataset.colId ?? null, toColId: colId },
          }));
        });
      }

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const form = col.querySelector('.kanban__add-form');
          if (!form) return;
          form.removeAttribute('hidden');
          addBtn.setAttribute('aria-expanded', 'true');
          form.querySelector('.kanban__add-input')?.focus();
        });
      }

      this._refresh(col);
    }

    _initCard(card) {
      if (!card.dataset.cardId) card.dataset.cardId = `ka-${++_idSeq}`;
      card.setAttribute('draggable', 'true');
      if (!card.getAttribute('tabindex')) card.setAttribute('tabindex', '0');
      if (!card.getAttribute('role'))     card.setAttribute('role', 'listitem');
      card.setAttribute('aria-roledescription', 'targeta arrossegable');

      const cardId = card.dataset.cardId;

      card.addEventListener('dragstart', e => {
        this._dragging = card;
        card.classList.add('kanban__card--dragging');
        e.dataTransfer.setData('text/plain', cardId);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        this._dragging = null;
        card.classList.remove('kanban__card--dragging');
        this.el.querySelectorAll('.kanban__col-body--drag-over')
          .forEach(el => el.classList.remove('kanban__col-body--drag-over'));
      });

      card.addEventListener('click', () => {
        if (!this._dragging) this._openCardModal(card);
      });

      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this._moving === card) this._confirmMove();
          else this._openCardModal(card);
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          if (this._moving === card) this._confirmMove();
          else this._startMove(card);
        } else if (this._moving === card) {
          if (e.key === 'ArrowRight') { e.preventDefault(); this._shiftMove(1); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); this._shiftMove(-1); }
        }
      });
    }

    // ── Modal de detall de targeta ───────────────────────

    _openCardModal(card) {
      const cancelled = !this.el.dispatchEvent(new CustomEvent('ua:kanban:card:click', {
        bubbles: true,
        cancelable: true,
        detail: { cardId: card.dataset.cardId, card },
      }));
      if (cancelled) return;

      const title    = card.querySelector('.kanban__card-title')?.textContent?.trim() ?? '';
      const meta     = card.querySelector('.kanban__card-meta')?.textContent?.trim()  ?? '';
      const colTitle = card.closest('.kanban__column')
                           ?.querySelector('.kanban__col-title')?.textContent?.trim() ?? '';
      const priority = [...card.classList]
                         .find(c => c.startsWith('kanban__card--priority-'))
                         ?.replace('kanban__card--priority-', '') ?? '';
      const labels    = Array.from(card.querySelectorAll('.kanban__label'))
                             .map(l => l.outerHTML).join('');
      const assignees = Array.from(card.querySelectorAll('.kanban__avatar'))
                             .map(a => a.outerHTML).join('');
      const dateEl    = card.querySelector('.kanban__card-date');
      const dateText  = dateEl?.textContent?.trim() ?? '';
      const dateOverdue = dateEl?.classList.contains('kanban__card-date--overdue') ?? false;

      const id = 'ua-kcard-' + Date.now();
      const priorityLabel   = { high: 'Alta',   medium: 'Mitjana', low: 'Baixa'   };
      const priorityVariant = { high: 'error',  medium: 'warning', low: 'success' };

      const priorityHTML = priority
        ? `<span class="kanban__label kanban__label--${priorityVariant[priority] ?? 'default'}">${priorityLabel[priority] ?? priority}</span>`
        : '';

      const metaHTML = meta
        ? `<p class="kanban__card-modal-desc">${meta}</p>`
        : '';

      const labelsHTML = labels
        ? `<div class="kanban__card-labels">${labels}</div>`
        : '';

      const assigneesHTML = assignees
        ? `<div class="kanban__card-modal-row">
             <span class="kanban__card-modal-key">Assignats</span>
             <div class="kanban__card-assignees">${assignees}</div>
           </div>`
        : '';

      const dateHTML = dateText
        ? `<div class="kanban__card-modal-row">
             <span class="kanban__card-modal-key">Data límit</span>
             <time class="kanban__card-date${dateOverdue ? ' kanban__card-date--overdue' : ''}">${dateText}</time>
           </div>`
        : '';

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', `${id}-title`);

      overlay.innerHTML = `
        <div class="modal kanban__card-modal" role="document">
          <div class="modal-header">
            <div style="flex:1;min-width:0">
              <div class="kanban__card-modal-meta">
                ${priorityHTML}
                <span class="kanban__card-modal-col">${colTitle}</span>
              </div>
              <h2 class="modal-title" id="${id}-title">${title}</h2>
            </div>
            <button class="modal-close" aria-label="Tancar detall de targeta">
              <i class="ti ti-x" aria-hidden="true"></i>
            </button>
          </div>
          <div class="modal-body kanban__card-modal-body">
            ${metaHTML}
            ${labelsHTML}
            ${assigneesHTML}
            ${dateHTML}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary js-kcard-close">Tancar</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const modalEl = overlay.querySelector('.modal');
      const FOCUSABLE_SEL = [
        'a[href]', 'button:not([disabled])',
        'input:not([disabled])', '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      const close = () => {
        overlay.classList.add('modal-closing');
        const dur = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--transition-base') || '200'
        );
        setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, dur);
        document.removeEventListener('keydown', onKeydown);
        try { card.focus(); } catch (_) {}
      };

      const trapFocus = e => {
        const focusables = Array.from(modalEl.querySelectorAll(FOCUSABLE_SEL));
        if (!focusables.length) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };

      const onKeydown = e => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') trapFocus(e);
      };

      document.addEventListener('keydown', onKeydown);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      overlay.querySelector('.modal-close').addEventListener('click', close);
      overlay.querySelector('.js-kcard-close').addEventListener('click', close);

      requestAnimationFrame(() => {
        const first = modalEl.querySelector(FOCUSABLE_SEL);
        if (first) first.focus();
      });
    }

    // ── Mode de moviment per teclat ──────────────────────

    _startMove(card) {
      if (this._moving) this._cancelMove();
      this._moving = card;
      card.classList.add('kanban__card--moving');
      this._announce(
        'Targeta seleccionada per moure. ' +
        'Usa les fletxes esquerra i dreta per canviar de columna. ' +
        'Espai o Enter per confirmar, Escape per cancel·lar.'
      );
    }

    _shiftMove(dir) {
      const card = this._moving;
      if (!card) return;

      const cols   = Array.from(this.el.querySelectorAll('.kanban__column'));
      const curCol = card.closest('.kanban__column');
      const curIdx = cols.indexOf(curCol);
      const nxtIdx = curIdx + dir;

      if (nxtIdx < 0 || nxtIdx >= cols.length) return;

      const nxtCol  = cols[nxtIdx];
      const nxtBody = nxtCol.querySelector('.kanban__col-body');
      const frmCol  = curCol;

      nxtBody.appendChild(card);
      if (frmCol) this._refresh(frmCol);
      this._refresh(nxtCol);

      const title = nxtCol.querySelector('.kanban__col-title')?.textContent?.trim() ?? '';
      this._announce(`Columna ${title}`);
      card.focus();
    }

    _confirmMove() {
      const card  = this._moving;
      const title = card.closest('.kanban__column')
                        ?.querySelector('.kanban__col-title')?.textContent?.trim() ?? '';
      card.classList.remove('kanban__card--moving');
      this._moving = null;
      this._announce(`Targeta col·locada a ${title}.`);
      card.focus();
    }

    _cancelMove() {
      if (!this._moving) return;
      this._moving.classList.remove('kanban__card--moving');
      this._moving = null;
      this._announce('Moviment cancel·lat.');
    }

    // ── Render/actualitzacions ───────────────────────────

    _refresh(col) {
      this._updateCount(col);
      this._updateWip(col);
    }

    _updateCount(col) {
      const count   = col.querySelectorAll('.kanban__card').length;
      const countEl = col.querySelector('.kanban__col-count');
      if (countEl) countEl.textContent = count;

      const wip = col.dataset.wipLimit != null ? parseInt(col.dataset.wipLimit) : null;
      if (wip !== null) {
        col.classList.toggle('kanban__column--wip-exceeded', count > wip);
      }
    }

    _updateWip(col) {
      const wip = col.dataset.wipLimit != null ? parseInt(col.dataset.wipLimit) : null;
      if (wip === null) return;

      let bar = col.querySelector('.kanban__wip-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'kanban__wip-bar';
        const fill = document.createElement('div');
        fill.className = 'kanban__wip-fill';
        bar.appendChild(fill);
        col.querySelector('.kanban__col-header')?.insertAdjacentElement('afterend', bar);
      }

      const count = col.querySelectorAll('.kanban__card').length;
      bar.querySelector('.kanban__wip-fill').style.width =
        `${Math.min(100, Math.round((count / wip) * 100))}%`;
    }

    // ── Constructors de DOM ──────────────────────────────

    _buildCard({ title, meta, priority, labels }) {
      const card = document.createElement('div');
      card.className = 'kanban__card';
      if (priority) card.classList.add(`kanban__card--priority-${priority}`);
      card.dataset.cardId = `ka-${++_idSeq}`;

      const titleEl = document.createElement('p');
      titleEl.className = 'kanban__card-title';
      titleEl.textContent = title;
      card.appendChild(titleEl);

      if (meta) {
        const metaEl = document.createElement('p');
        metaEl.className = 'kanban__card-meta';
        metaEl.textContent = meta;
        card.appendChild(metaEl);
      }

      if (labels?.length) {
        const labelsEl = document.createElement('div');
        labelsEl.className = 'kanban__card-labels';
        labels.forEach(({ text, variant = 'default' }) => {
          const span = document.createElement('span');
          span.className = `kanban__label kanban__label--${variant}`;
          span.textContent = text;
          labelsEl.appendChild(span);
        });
        card.appendChild(labelsEl);
      }

      return card;
    }

    _buildAddForm(col) {
      const colId   = col.dataset.colId;
      const colTitle = col.querySelector('.kanban__col-title')?.textContent?.trim() ?? '';
      const addBtn  = col.querySelector('.kanban__col-add-btn');

      const form     = document.createElement('form');
      form.className = 'kanban__add-form';
      form.setAttribute('hidden', '');

      const textarea = document.createElement('textarea');
      textarea.className   = 'kanban__add-input';
      textarea.placeholder = 'Títol de la targeta...';
      textarea.rows        = 2;
      textarea.setAttribute('aria-label', `Títol de la nova targeta a ${colTitle}`);

      const actions = document.createElement('div');
      actions.className = 'kanban__add-actions';

      const btnSubmit = document.createElement('button');
      btnSubmit.type = 'submit';
      btnSubmit.className = 'btn btn-primary btn-sm';
      btnSubmit.textContent = 'Afegir';

      const btnCancel = document.createElement('button');
      btnCancel.type = 'button';
      btnCancel.className = 'btn btn-ghost btn-sm';
      btnCancel.textContent = 'Cancel·la';

      actions.appendChild(btnSubmit);
      actions.appendChild(btnCancel);
      form.appendChild(textarea);
      form.appendChild(actions);

      const closeForm = () => {
        form.setAttribute('hidden', '');
        textarea.value = '';
        addBtn?.setAttribute('aria-expanded', 'false');
        addBtn?.focus();
      };

      form.addEventListener('submit', e => {
        e.preventDefault();
        const title = textarea.value.trim();
        if (!title) { textarea.focus(); return; }
        this.addCard(colId, { title });
        closeForm();
      });

      btnCancel.addEventListener('click', closeForm);

      textarea.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); closeForm(); }
      });

      return form;
    }

    // ── Live region ARIA ─────────────────────────────────

    _createAnnouncer() {
      const el = document.createElement('div');
      el.className = 'kanban__announcer';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      return el;
    }

    _announce(msg) {
      this._announcer.textContent = '';
      requestAnimationFrame(() => { this._announcer.textContent = msg; });
    }

    // ── Helper ───────────────────────────────────────────

    _col(colId) {
      return this.el.querySelector(`[data-col-id="${CSS.escape(colId)}"]`);
    }
  }

  // ── Auto-inicialització ──────────────────────────────────
  function initAll(root) {
    (root || document).querySelectorAll('.kanban[id]').forEach(el => {
      if (!el._uaKanban) el._uaKanban = new UAKanban(el);
    });
  }

  document.addEventListener('DOMContentLoaded', () => initAll());

  window.UAKanban     = UAKanban;
  window.uaInitKanban = initAll;
})();


/* ── components/view-toggle/view-toggle.js ─────────────── */

/* ════════════════════════════════════════════════════════
   UACloud DS — UAViewToggle
   Gestiona l'alternança entre vista llista i vista mosaic.

   Ús:
     const toggle = new UAViewToggle({
       tableEl:     '.table-wrap',      // selector o element
       gridEl:      'sol-cards-grid',   // id o element
       btnLlistaEl: 'btn-vista-llista', // id o element
       btnMosaicEl: 'btn-vista-mosaic', // id o element
     });
     // Opcionalment: toggle.set('mosaic');
   ════════════════════════════════════════════════════════ */

class UAViewToggle {
  constructor({ tableEl, gridEl, btnLlistaEl, btnMosaicEl } = {}) {
    this.tableEl   = this._resolve(tableEl,     'querySelector');
    this.gridEl    = this._resolve(gridEl);
    this.btnLlista = this._resolve(btnLlistaEl);
    this.btnMosaic = this._resolve(btnMosaicEl);

    if (this.btnLlista) this.btnLlista.addEventListener('click', () => this.set('llista'));
    if (this.btnMosaic) this.btnMosaic.addEventListener('click', () => this.set('mosaic'));
  }

  _resolve(ref, method = 'getElementById') {
    if (!ref) return null;
    if (typeof ref !== 'string') return ref;
    return document.getElementById(ref) ?? document.querySelector(ref) ?? null;
  }

  set(mode) {
    const esLlista = mode === 'llista';
    if (this.tableEl) this.tableEl.hidden = !esLlista;
    if (this.gridEl)  this.gridEl.hidden  =  esLlista;

    [this.btnLlista, this.btnMosaic].forEach((btn, i) => {
      if (!btn) return;
      const active = esLlista ? i === 0 : i === 1;
      btn.classList.toggle('ua-view-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }
}


/* ── components/detail-drawer/detail-drawer.js ─────────── */

/* ════════════════════════════════════════════════════════
   UACloud DS — UADetailDrawer
   Panell lateral dret per mostrar el detall d'un registre.
   Gestiona: transicions CSS, focus, trampa de focus, Escape.

   Ús:
     const drawer = new UADetailDrawer({
       panelEl:   'detall-panel',   // id o element
       overlayEl: 'detall-overlay', // id o element
       onClose:   () => {},         // opcional
     });
     drawer.open();   // après de poblar el contingut
     drawer.close();
   ════════════════════════════════════════════════════════ */

class UADetailDrawer {
  constructor({ panelEl, overlayEl, onClose } = {}) {
    this.panel   = this._resolve(panelEl);
    this.overlay = this._resolve(overlayEl);
    this.onClose = onClose || null;
    this._prevFocus = null;

    this._boundKey   = this._onKeydown.bind(this);
    this._boundClose = this.close.bind(this);

    if (this.overlay) this.overlay.addEventListener('click', this._boundClose);
  }

  _resolve(ref) {
    if (!ref) return null;
    if (typeof ref !== 'string') return ref;
    return document.getElementById(ref) ?? document.querySelector(ref) ?? null;
  }

  open() {
    if (!this.panel) return;
    this._prevFocus = document.activeElement;

    this.panel.removeAttribute('hidden');
    if (this.overlay) this.overlay.removeAttribute('hidden');

    requestAnimationFrame(() => {
      this.panel.classList.add('ua-detall-panel--visible');
      if (this.overlay) this.overlay.classList.add('ua-detall-overlay--visible');
    });

    // Focus al primer element interactiu del panell
    setTimeout(() => {
      const focusable = this._focusable();
      if (focusable.length) focusable[0].focus();
    }, 50);

    document.addEventListener('keydown', this._boundKey);
  }

  close() {
    if (!this.panel) return;
    this.panel.classList.remove('ua-detall-panel--visible');
    if (this.overlay) this.overlay.classList.remove('ua-detall-overlay--visible');

    const dur = this._transitionDur();
    setTimeout(() => {
      this.panel.setAttribute('hidden', '');
      if (this.overlay) this.overlay.setAttribute('hidden', '');
    }, dur);

    document.removeEventListener('keydown', this._boundKey);

    // Retorna el focus a l'element que l'havia abans d'obrir
    if (this._prevFocus?.focus) this._prevFocus.focus();
    if (this.onClose) this.onClose();
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = this._focusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  _focusable() {
    if (!this.panel) return [];
    return [...this.panel.querySelectorAll(
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]'
    )].filter(el => !el.closest('[hidden]') && !el.hidden);
  }

  _transitionDur() {
    if (!this.panel) return 0;
    const raw = getComputedStyle(this.panel).transitionDuration;
    return (parseFloat(raw) || 0) * (raw.includes('ms') ? 1 : 1000);
  }
}


/* ── components/saved-views/saved-views.js ─────────────── */

/* ════════════════════════════════════════════════════════
   UACloud DS — UASavedViews
   Gestiona la barra de vistes personalitzades (dreceres
   de filtres guardades amb persistència localStorage).

   Modes de presentació:
     - 'chips'    (per defecte): barra amb xips clicables
     - 'dropdown': botó trigger + panell flotant

   Ús (dropdown):
     const views = new UASavedViews({
       key:          'ua-[modul]-vistes',
       demos:        [...],
       mode:         'dropdown',
       triggerEl:    'ua-vistes-trigger',
       panelEl:      'ua-vistes-panel',
       listEl:       'ua-vistes-list',
       kebabEl:      'ua-vistes-kebab',
       kebabMenuEl:  'vistes-kebab-menu',   // div.ua-kebab-float al final del body
       saveFormEl:   'ua-vista-save-form',
       saveInputEl:  'ua-vista-nom',
       getFiltre:    () => ({...}),
       suggestNom:   (filtre) => 'nom',
       onApply:      (filtre) => {},
     });

   Ús (chips):
     const views = new UASavedViews({
       key, demos, chipsEl, saveBtnEl, saveFormEl, saveInputEl,
       getFiltre, suggestNom, onApply,
     });
   ════════════════════════════════════════════════════════ */

class UASavedViews {
  constructor({
    key, demos = [],
    mode = 'chips',
    // chips mode:
    chipsEl, saveBtnEl,
    // dropdown mode:
    triggerEl, panelEl, listEl, kebabEl, kebabMenuEl,
    // both:
    saveFormEl, saveInputEl,
    getFiltre, suggestNom, onApply,
  } = {}) {
    this.key         = key;
    this.demos       = demos;
    this.mode        = mode;
    // chips refs:
    this.chipsEl     = this._resolve(chipsEl);
    this.saveBtnEl   = this._resolve(saveBtnEl);
    // dropdown refs:
    this.triggerEl   = this._resolve(triggerEl);
    this.panelEl     = this._resolve(panelEl);
    this.listEl      = this._resolve(listEl);
    this.kebabEl     = this._resolve(kebabEl);
    this.kebabMenuEl = this._resolve(kebabMenuEl);
    // both:
    this.formEl      = this._resolve(saveFormEl);
    this.inputEl     = this._resolve(saveInputEl);
    this.getFiltre   = getFiltre  || (() => ({}));
    this.suggestNom  = suggestNom || (() => 'Vista guardada');
    this.onApply     = onApply    || (() => {});
    this._active     = null;
    this._renamingId = null;

    this._bindEvents();
  }

  /* ── Resolució de referències ─────────────────────────── */

  _resolve(ref) {
    if (!ref) return null;
    if (typeof ref !== 'string') return ref;
    return document.getElementById(ref) ?? document.querySelector(ref) ?? null;
  }

  /* ── Persistència ─────────────────────────────────────── */

  _get() {
    try { const r = localStorage.getItem(this.key); return r ? JSON.parse(r) : null; } catch { return null; }
  }
  _set(vistes) {
    try { localStorage.setItem(this.key, JSON.stringify(vistes)); } catch {}
  }
  _getOrDemo() { return this._get() ?? [...this.demos]; }

  /* ── Renderització ────────────────────────────────────── */

  render() {
    if (this.mode === 'dropdown') this._renderDropdown();
    else this._renderChips();
  }

  _renderChips() {
    if (!this.chipsEl) return;
    const vistes = this._getOrDemo();
    if (!vistes.length) {
      this.chipsEl.removeAttribute('role');
      this.chipsEl.innerHTML = '<span class="ua-vistes-buida">Cap vista guardada</span>';
      return;
    }
    this.chipsEl.setAttribute('role', 'list');
    this.chipsEl.innerHTML = vistes.map(v => {
      const activa = v.id === this._active;
      const predet = v.predeterminada;
      const cls    = ['ua-vista-chip',
                      activa ? 'ua-vista-chip--active' : '',
                      predet ? 'ua-vista-chip--default' : ''].filter(Boolean).join(' ');
      return `<span class="${cls}" role="listitem" data-view-id="${v.id}">
        <button class="ua-vista-chip__main"
                aria-pressed="${activa}"
                aria-label="Aplica la vista ${v.nom}${predet ? ' (predeterminada)' : ''}">
          ${predet ? '<i class="ti ti-star-filled" style="font-size:10px;margin-right:3px;color:var(--color-warning-solid)" aria-hidden="true"></i>' : ''}${v.nom}
        </button>
        <button class="ua-vista-chip__star"
                title="${predet ? 'Treu com a predeterminada' : 'Fes-la predeterminada'}"
                aria-label="${predet ? 'Treu com a predeterminada' : 'Marca com a predeterminada'}">
          <i class="ti ti-star${predet ? '-filled' : ''}" aria-hidden="true"></i>
        </button>
        <button class="ua-vista-chip__del" aria-label="Elimina la vista ${v.nom}">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      </span>`;
    }).join('');
  }

  _renderDropdown() {
    if (!this.triggerEl) return;
    const vistes = this._getOrDemo();
    const activa = vistes.find(v => v.id === this._active);

    // Actualitza el text del trigger
    const nomEl = this.triggerEl.querySelector('[data-vista-nom]');
    if (nomEl) nomEl.textContent = activa?.nom ?? 'Totes les sol·licituds';
    this.triggerEl.classList.toggle('ua-vistes-trigger--active', !!activa);

    // Kebab: visible únicament quan hi ha vista activa
    if (this.kebabEl) this.kebabEl.hidden = !activa;

    // Renderitza la llista
    if (!this.listEl) return;
    this.listEl.innerHTML = !vistes.length
      ? `<div class="ua-vistes-panel-empty">Cap vista guardada</div>`
      : vistes.map(v => {
          const actv = v.id === this._active;
          const pred = v.predeterminada;
          return `<button class="ua-vistes-panel-item${actv ? ' ua-vistes-panel-item--active' : ''}"
                          data-view-id="${v.id}" role="menuitemradio" aria-checked="${actv}">
            <span class="ua-vistes-panel-item__check" aria-hidden="true">
              ${actv ? '<i class="ti ti-check"></i>' : ''}
            </span>
            <span class="ua-vistes-panel-item__nom">${v.nom}</span>
            ${pred ? '<i class="ti ti-star-filled ua-vistes-panel-item__star" aria-hidden="true"></i>' : ''}
          </button>`;
        }).join('');
  }

  /* ── Auto-detecció de vista activa ───────────────────── */

  matchActual(filtre) {
    const vistes = this._getOrDemo();
    const keys   = Object.keys(filtre);
    const match  = vistes.find(v => keys.every(k => v.filtre[k] === filtre[k]));
    this._active = match?.id ?? null;
    this.render();
  }

  /* ── Aplica una vista ─────────────────────────────────── */

  apply(id) {
    const vistes = this._getOrDemo();
    const v = vistes.find(x => x.id === id);
    if (!v) return;
    this._active = id;
    this.onApply(v.filtre);
  }

  getDefault() {
    return this._getOrDemo().find(v => v.predeterminada) ?? null;
  }

  /* ── Panel (dropdown mode) ───────────────────────────── */

  togglePanel() {
    if (!this.panelEl) return;
    if (this.panelEl.hidden) this._openPanel();
    else this.closePanel();
  }

  _openPanel() {
    if (!this.panelEl) return;
    this._closeKebabMenu();
    this.render();
    this.panelEl.hidden = false;
    this.triggerEl?.setAttribute('aria-expanded', 'true');
    this.panelEl.querySelector('[role="menuitemradio"]')?.focus();
  }

  closePanel() {
    if (!this.panelEl) return;
    this.panelEl.hidden = true;
    this.triggerEl?.setAttribute('aria-expanded', 'false');
  }

  /* ── Menú kebab de vista activa (dropdown mode) ───────── */

  _openKebabMenu(btn) {
    const menu = this.kebabMenuEl;
    if (!menu) return;
    const id = this._active;
    if (!id) return;
    const vistes = this._getOrDemo();
    const v = vistes.find(x => x.id === id);
    if (!v) return;

    // Toggle: si ja és obert, tanca
    if (!menu.hidden) { this._closeKebabMenu(); return; }

    this.closePanel();

    const esPred = v.predeterminada;
    menu.innerHTML = `
      <button class="ua-kebab-float__item" role="menuitem" data-sv-kb="renomena">
        <i class="ti ti-pencil" aria-hidden="true"></i> Canvia el nom
      </button>
      <button class="ua-kebab-float__item" role="menuitem" data-sv-kb="comparteix">
        <i class="ti ti-share" aria-hidden="true"></i> Comparteix
      </button>
      <button class="ua-kebab-float__item" role="menuitem" data-sv-kb="predeterminada">
        <i class="ti ti-star${esPred ? '-off' : ''}" aria-hidden="true"></i>
        ${esPred ? 'Treu predeterminada' : 'Fes predeterminada'}
      </button>
      <div class="ua-kebab-float__sep"></div>
      <button class="ua-kebab-float__item ua-kebab-float__item--error" role="menuitem" data-sv-kb="elimina">
        <i class="ti ti-trash" aria-hidden="true"></i> Elimina
      </button>`;

    const rect = btn.getBoundingClientRect();
    menu.style.top  = (rect.bottom + 4) + 'px';
    menu.style.left = rect.left + 'px';
    menu.hidden = false;
    menu.querySelector('[data-sv-kb]')?.focus();

    // Correcció d'overflow horitzontal un cop el menú és visible i té mides reals
    requestAnimationFrame(() => {
      const mw = menu.offsetWidth;
      const vw = window.innerWidth;
      if (rect.left + mw > vw - 8) menu.style.left = Math.max(8, vw - mw - 8) + 'px';
    });
  }

  _closeKebabMenu() {
    if (!this.kebabMenuEl) return;
    this.kebabMenuEl.hidden = true;
  }

  _bindArrowNav(el, role, onTab) {
    if (!el) return;
    el.addEventListener('keydown', e => {
      const items = [...el.querySelectorAll(`[role="${role}"]`)];
      const idx   = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
      if (onTab && e.key === 'Tab') onTab(e);
    });
  }

  _handleKebabAccio(accio) {
    const id = this._active;
    if (!id) return;
    switch (accio) {
      case 'renomena':
        this.initRename(id);
        break;
      case 'comparteix':
        this.share(id);
        break;
      case 'predeterminada':
        this.toggleDefault(id);
        break;
      case 'elimina': {
        const v = this._getOrDemo().find(x => x.id === id);
        if (typeof showConfirmDialog === 'function') {
          showConfirmDialog({
            title: 'Elimina la vista',
            description: `Estàs a punt d'eliminar la vista «${v?.nom ?? ''}». Aquesta acció no es pot desfer.`,
            confirmText: 'Elimina',
            variant: 'destructive',
            onConfirm: () => this.delete(id),
          });
        } else {
          this.delete(id);
        }
        break;
      }
    }
  }

  /* ── Guardat d'una nova vista ─────────────────────────── */

  initSave() {
    this.closePanel();
    if (this.saveBtnEl) this.saveBtnEl.hidden = true;
    if (this.formEl)    this.formEl.removeAttribute('hidden');
    if (this.inputEl) {
      this.inputEl.value = this.suggestNom(this.getFiltre());
      this.inputEl.focus();
      this.inputEl.select();
    }
  }

  save() {
    const nom = this.inputEl?.value.trim();
    if (!nom) { this.inputEl?.focus(); return; }
    if (this._renamingId) {
      this.rename(this._renamingId, nom);
      this._renamingId = null;
      this.cancelSave();
      return;
    }
    const vistes = this._getOrDemo();
    const nova = { id: 'v-' + Date.now(), nom, filtre: this.getFiltre(), predeterminada: false };
    vistes.push(nova);
    this._set(vistes);
    this._active = nova.id;
    this.cancelSave();
    this.render();
    if (typeof showToast === 'function')
      showToast('success', 'Vista creada', `«${nom}» disponible com a drecera.`);
  }

  cancelSave() {
    this._renamingId = null;
    if (this.mode !== 'dropdown' && this.saveBtnEl) this.saveBtnEl.hidden = false;
    if (this.formEl)  this.formEl.setAttribute('hidden', '');
    if (this.inputEl) this.inputEl.value = '';
  }

  /* ── Elimina una vista ────────────────────────────────── */

  delete(id) {
    const vistes = this._getOrDemo().filter(v => v.id !== id);
    this._set(vistes);
    if (this._active === id) this._active = null;
    this.render();
    if (typeof showToast === 'function')
      showToast('info', 'Vista eliminada', "La vista s'ha eliminat.");
  }

  /* ── Renomena una vista ───────────────────────────────── */

  initRename(id) {
    const vistes = this._getOrDemo();
    const v = vistes.find(x => x.id === id);
    if (!v) return;
    this._renamingId = id;
    this.closePanel();
    if (this.formEl) this.formEl.removeAttribute('hidden');
    if (this.inputEl) {
      this.inputEl.value = v.nom;
      this.inputEl.focus();
      this.inputEl.select();
    }
  }

  rename(id, newName) {
    const vistes = this._getOrDemo();
    const v = vistes.find(x => x.id === id);
    if (!v || !newName?.trim()) return;
    v.nom = newName.trim();
    this._set(vistes);
    this.render();
    if (typeof showToast === 'function')
      showToast('success', 'Vista renomenada', `La vista es diu ara «${v.nom}».`);
  }

  /* ── Marca / desmarca vista predeterminada ────────────── */

  toggleDefault(id) {
    const vistes   = this._getOrDemo();
    const v        = vistes.find(x => x.id === id);
    if (!v) return;
    const eraDefault = v.predeterminada;
    vistes.forEach(x => { x.predeterminada = false; });
    if (!eraDefault) v.predeterminada = true;
    this._set(vistes);
    this.render();
    if (typeof showToast === 'function') {
      if (!eraDefault)
        showToast('success', 'Vista predeterminada', `«${v.nom}» s'aplicarà automàticament en obrir el mòdul.`);
      else
        showToast('info', 'Vista predeterminada eliminada', 'El mòdul obrirà sense filtre predeterminat.');
    }
  }

  /* ── Comparteix una vista ─────────────────────────────── */

  share(id) {
    const vistes = this._getOrDemo();
    const v = vistes.find(x => x.id === id);
    if (!v) return;
    const url = window.location.href.split('?')[0] + '?vista=' + encodeURIComponent(JSON.stringify(v.filtre));
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          if (typeof showToast === 'function')
            showToast('success', 'Enllaç copiat', "L'URL de la vista s'ha copiat al portapapers.");
        })
        .catch(() => {
          if (typeof showToast === 'function')
            showToast('info', 'Comparteix', "No s'ha pogut copiar automàticament.");
        });
    } else if (typeof showToast === 'function') {
      showToast('info', 'Comparteix', "Copia l'URL de la pàgina per compartir la vista activa.");
    }
  }

  /* ── Binding d'events ─────────────────────────────────── */

  _bindEvents() {
    // === chips mode ===
    if (this.chipsEl) {
      this.chipsEl.addEventListener('click', e => {
        const chip = e.target.closest('[data-view-id]');
        if (!chip) return;
        const id = chip.dataset.viewId;
        if (e.target.closest('.ua-vista-chip__del'))  { e.stopPropagation(); this.delete(id); return; }
        if (e.target.closest('.ua-vista-chip__star')) { e.stopPropagation(); this.toggleDefault(id); return; }
        if (e.target.closest('.ua-vista-chip__main')) this.apply(id);
      });
    }
    if (this.saveBtnEl) this.saveBtnEl.addEventListener('click', () => this.initSave());

    // === dropdown mode ===
    if (this.mode === 'dropdown') {
      if (this.triggerEl) {
        this.triggerEl.addEventListener('click', e => { e.stopPropagation(); this.togglePanel(); });
      }
      if (this.listEl) {
        this.listEl.addEventListener('click', e => {
          const item = e.target.closest('[data-view-id]');
          if (!item) return;
          this.apply(item.dataset.viewId);
          this.closePanel();
        });
      }
      // Botó kebab — gestionat internament si hi ha kebabMenuEl
      if (this.kebabEl && this.kebabMenuEl) {
        this.kebabEl.addEventListener('click', e => {
          e.stopPropagation();
          this._openKebabMenu(this.kebabEl);
        });
      }
      // Delegació d'accions del menú kebab
      if (this.kebabMenuEl) {
        this.kebabMenuEl.addEventListener('click', e => {
          const btn = e.target.closest('[data-sv-kb]');
          if (!btn) return;
          this._closeKebabMenu();
          this._handleKebabAccio(btn.dataset.svKb);
        });
      }
      // Tanca panel i kebab en clicar fora
      document.addEventListener('click', e => {
        if (this.panelEl && !this.panelEl.hidden) {
          const wrap = this.panelEl.parentElement;
          if (wrap && !wrap.contains(e.target)) this.closePanel();
        }
        if (this.kebabMenuEl && !this.kebabMenuEl.hidden) {
          if (!this.kebabMenuEl.contains(e.target) && e.target !== this.kebabEl)
            this._closeKebabMenu();
        }
      });
      // Escape
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (this.kebabMenuEl && !this.kebabMenuEl.hidden) {
          this._closeKebabMenu();
          this.kebabEl?.focus();
        } else if (this.panelEl && !this.panelEl.hidden) {
          this.closePanel();
          this.triggerEl?.focus();
        }
      });

      // Navegació per fletxes — ARIA menu pattern
      this._bindArrowNav(this.kebabMenuEl, 'menuitem', e => {
        e.preventDefault(); this._closeKebabMenu(); this.kebabEl?.focus();
      });
      this._bindArrowNav(this.listEl, 'menuitemradio');
    }

    // === formulari de guardat (ambdós modes) ===
    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); this.save(); }
        if (e.key === 'Escape') { e.stopPropagation(); this.cancelSave(); }
      });
    }
    if (this.formEl) {
      this.formEl.addEventListener('click', e => {
        if (e.target.closest('[data-sv-confirm]')) this.save();
        if (e.target.closest('[data-sv-cancel]'))  this.cancelSave();
      });
    }
  }
}

