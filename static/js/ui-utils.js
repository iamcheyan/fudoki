/**
 * Fudoki UI 工具集
 *  - FDSelect：自绘下拉组件（替代原生 <select>，深浅双主题）
 *  - showDeleteConfirm：自绘确认对话框（替代原生 confirm）
 *  - debounce：简易防抖
 */
(function () {
  'use strict';

  /* ============================================================
   * FDSelect — 自绘下拉
   * 用法：
   *   const sel = FDSelect.create(mountEl, {
   *     options: [{ value, label, disabled? }],   // 或 getOptions: () => [...]
   *     value: 'x',
   *     placeholder: '…',
   *     onChange: (value, option) => {},
   *     compact: true
   *   });
   *   sel.setOptions(options); sel.setValue(value); sel.getValue();
   * ============================================================ */
  const FDSelect = {
    _registry: new Map(),

    create(mountEl, config = {}) {
      if (!mountEl) return null;
      if (FDSelect._registry.has(mountEl)) {
        FDSelect._registry.get(mountEl).destroy();
      }

      const state = {
        options: [],
        value: config.value != null ? config.value : '',
        placeholder: config.placeholder || '',
        onChange: config.onChange || function () {},
        open: false,
        focusIndex: -1,
        handles: [],
      };

      mountEl.classList.add('fd-select');
      if (config.compact) mountEl.classList.add('fd-select-compact');
      mountEl.setAttribute('data-fd-select', '');
      mountEl.innerHTML = `
        <button type="button" class="fd-select-btn" aria-haspopup="listbox" aria-expanded="false">
          <span class="fd-select-value"></span>
          <svg class="chev" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 15.2 6.4 9.6l1.1-1.1L12 13l4.5-4.5 1.1 1.1z" fill="currentColor"/></svg>
        </button>
        <div class="fd-select-menu" role="listbox"></div>
      `;

      const btn = mountEl.querySelector('.fd-select-btn');
      const valueEl = mountEl.querySelector('.fd-select-value');
      const menu = mountEl.querySelector('.fd-select-menu');

      function getOptions() {
        return typeof config.getOptions === 'function' ? config.getOptions() : state.options;
      }

      function optionByValue(v) {
        return getOptions().find(function (o) { return String(o.value) === String(v); }) || null;
      }

      function renderValue() {
        const opt = optionByValue(state.value);
        valueEl.textContent = opt ? opt.label : (state.placeholder || '—');
      }

      function renderMenu() {
        const opts = getOptions();
        menu.innerHTML = '';
        opts.forEach(function (o, i) {
          const item = document.createElement('div');
          item.className = 'fd-select-item' + (String(o.value) === String(state.value) ? ' selected' : '');
          item.setAttribute('role', 'option');
          if (o.disabled) item.setAttribute('disabled', '');
          item.innerHTML = `<span class="fd-select-item-label"></span>
            <svg class="fd-check" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M9.5 16.2 5.3 12l-1.1 1.1 5.3 5.3L20 7.9l-1.1-1.1z" fill="currentColor"/></svg>`;
          item.querySelector('.fd-select-item-label').textContent = o.label;
          item.addEventListener('click', function (e) {
            e.stopPropagation();
            if (o.disabled) return;
            setValue(o.value, true);
            close();
          });
          menu.appendChild(item);
        });
      }

      function positionMenu() {
        const rect = btn.getBoundingClientRect();
        menu.style.visibility = 'hidden';
        menu.style.display = 'block';
        const mw = menu.offsetWidth;
        const mh = menu.offsetHeight;
        menu.style.display = '';
        menu.style.visibility = '';
        let left = Math.min(rect.left, window.innerWidth - mw - 8);
        left = Math.max(8, left);
        let top = rect.bottom + 4;
        if (top + mh > window.innerHeight - 8) {
          const above = rect.top - mh - 4;
          top = above >= 8 ? above : Math.max(8, window.innerHeight - mh - 8);
        }
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        menu.style.minWidth = Math.max(rect.width, 140) + 'px';
      }

      function open() {
        if (state.open) return;
        renderMenu();
        state.open = true;
        mountEl.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        positionMenu();
        const selectedIdx = getOptions().findIndex(function (o) { return String(o.value) === String(state.value); });
        state.focusIndex = selectedIdx >= 0 ? selectedIdx : 0;
        updateFocus();
      }

      function close() {
        if (!state.open) return;
        state.open = false;
        mountEl.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }

      function updateFocus() {
        const items = menu.querySelectorAll('.fd-select-item');
        items.forEach(function (el, i) {
          el.classList.toggle('focused', i === state.focusIndex);
          if (i === state.focusIndex) el.scrollIntoView({ block: 'nearest' });
        });
      }

      function setValue(v, fire) {
        state.value = v;
        renderValue();
        // 默认编程式赋值不触发 onChange（与原生 select 语义一致），
        // 仅用户交互（点选/键盘确认）以 fire === true 显式触发，
        // 避免 onChange → setValue 的无限递归。
        if (fire === true) {
          const opt = optionByValue(v);
          state.onChange(v, opt);
          if (state.open) renderMenu();
        }
      }

      function setOptions(options, keepValue) {
        state.options = options || [];
        if (!keepValue || !optionByValue(state.value)) {
          state.value = state.options.length ? state.options[0].value : '';
        }
        renderValue();
        if (state.open) { renderMenu(); positionMenu(); }
      }

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (state.open) { close(); } else {
          FDSelect.closeAll(mountEl);
          open();
        }
      });

      btn.addEventListener('keydown', function (e) {
        const opts = getOptions();
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!state.open) { open(); return; }
          const dir = e.key === 'ArrowDown' ? 1 : -1;
          state.focusIndex = Math.min(opts.length - 1, Math.max(0, state.focusIndex + dir));
          updateFocus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (state.open) {
            const opt = opts[state.focusIndex];
            if (opt && !opt.disabled) { setValue(opt.value, true); close(); }
          } else {
            open();
          }
        } else if (e.key === 'Escape' && state.open) {
          e.stopPropagation();
          close();
        }
      });

      const handle = {
        get value() { return state.value; },
        set value(v) { setValue(v); },
        setValue: function (v) { setValue(v); },
        getValue: function () { return state.value; },
        setOptions: setOptions,
        setPlaceholder: function (p) { state.placeholder = p; renderValue(); },
        onChange: function (fn) { state.onChange = fn || function () {}; },
        close: close,
        destroy: function () {
          close();
          FDSelect._registry.delete(mountEl);
        },
      };

      // 初始化
      if (typeof config.getOptions !== 'function') state.options = config.options || [];
      renderValue();

      FDSelect._registry.set(mountEl, handle);
      return handle;
    },

    closeAll: function (except) {
      FDSelect._registry.forEach(function (handle, el) {
        if (el !== except) handle.close();
      });
    },

    get: function (el) {
      return FDSelect._registry.get(el) || null;
    },
  };

  // 点击外部关闭所有下拉
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.fd-select')) FDSelect.closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') FDSelect.closeAll();
  });
  window.addEventListener('resize', function () { FDSelect.closeAll(); });
  window.addEventListener('scroll', function () { FDSelect.closeAll(); }, true);

  /* ============================================================
   * 自绘确认对话框（替代原生 confirm）
   * ============================================================ */
  function showDeleteConfirm(message, onConfirm, onCancel, targetElement) {
    const existingConfirm = document.querySelector('.delete-confirm');
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingConfirm) existingConfirm.remove();
    if (existingBackdrop) existingBackdrop.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'delete-confirm';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'deleteConfirmTitle');
    dialog.innerHTML = `
      <button type="button" class="delete-confirm-close" aria-label="閉じる">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
      </button>
      <h3 class="delete-confirm-title" id="deleteConfirmTitle">確認</h3>
      <p class="delete-confirm-text"></p>
      <div class="delete-confirm-buttons">
        <button type="button" class="btn btn-secondary delete-confirm-cancel">キャンセル</button>
        <button type="button" class="btn btn-danger delete-confirm-ok">削除</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);

    const msgEl = dialog.querySelector('.delete-confirm-text');
    if (msgEl) msgEl.textContent = message || '';

    const okBtn = dialog.querySelector('.delete-confirm-ok');
    const cancelBtn = dialog.querySelector('.delete-confirm-cancel');
    const closeBtn = dialog.querySelector('.delete-confirm-close');
    setTimeout(function () { if (okBtn) okBtn.focus(); }, 0);

    let done = false;
    function cleanup() {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKeyDown);
      backdrop.remove();
      dialog.remove();
    }
    function onKeyDown(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        cleanup();
        if (onCancel) onCancel();
      }
    }
    document.addEventListener('keydown', onKeyDown);

    okBtn && okBtn.addEventListener('click', function () { cleanup(); if (onConfirm) onConfirm(); });
    cancelBtn && cancelBtn.addEventListener('click', function () { cleanup(); if (onCancel) onCancel(); });
    closeBtn && closeBtn.addEventListener('click', function () { cleanup(); if (onCancel) onCancel(); });
    backdrop.addEventListener('click', function () { cleanup(); if (onCancel) onCancel(); });
    return true;
  }

  /* ============================================================
   * 通用通知（轻量 toast）
   * ============================================================ */
  function showNotification(message, type = 'info') {
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.innerHTML = '<span class="toast-dot"></span><span class="toast-text"></span>';
    el.querySelector('.toast-text').textContent = message;
    document.body.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast-leaving');
      setTimeout(function () { el.remove(); }, 220);
    }, 2600);
  }

  /* ============================================================
   * 简易防抖
   * ============================================================ */
  function debounce(fn, delay = 200) {
    let timer = null;
    return function () {
      const args = arguments;
      const self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, delay);
    };
  }

  // 暴露到全局
  window.FDSelect = FDSelect;
  window.showNotification = window.showNotification || showNotification;
  window.showDeleteConfirm = window.showDeleteConfirm || showDeleteConfirm;
  window.debounce = window.debounce || debounce;
})();
