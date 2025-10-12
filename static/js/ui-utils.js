(function () {
  'use strict';

  // 全局通知
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => { try { document.body.removeChild(notification); } catch (_) {} }, 300);
    }, 3000);
  }

  // 删除确认对话框（居中）
  function showDeleteConfirm(message, onConfirm, onCancel) {
    const existingConfirm = document.querySelector('.delete-confirm');
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingConfirm) existingConfirm.remove();
    if (existingBackdrop) existingBackdrop.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'false');

    const deleteConfirm = document.createElement('div');
    deleteConfirm.className = 'delete-confirm';
    deleteConfirm.setAttribute('role', 'dialog');
    deleteConfirm.setAttribute('aria-modal', 'true');
    deleteConfirm.setAttribute('aria-labelledby', 'deleteConfirmTitle');
    deleteConfirm.innerHTML = `
      <div class="delete-confirm-header">
        <div class="delete-confirm-title" id="deleteConfirmTitle">削除</div>
        <button class="delete-confirm-close" aria-label="关闭">×</button>
      </div>
      <div class="delete-confirm-content">
        <div class="delete-confirm-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="delete-confirm-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span class="delete-confirm-text"></span>
        </div>
        <div class="delete-confirm-actions">
          <button class="btn delete-confirm-cancel">取消</button>
          <button class="btn btn-danger delete-confirm-ok">删除</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(deleteConfirm);

    const msgEl = deleteConfirm.querySelector('.delete-confirm-text');
    if (msgEl) msgEl.textContent = message || '';

    const okBtn = deleteConfirm.querySelector('.delete-confirm-ok');
    const cancelBtn = deleteConfirm.querySelector('.delete-confirm-cancel');
    const closeBtn = deleteConfirm.querySelector('.delete-confirm-close');
    setTimeout(() => { if (okBtn) okBtn.focus(); }, 0);

    function cleanup() {
      try { deleteConfirm.remove(); } catch (_) {}
      try { backdrop.remove(); } catch (_) {}
      document.removeEventListener('keydown', onKeyDown);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        cleanup();
        if (onCancel) onCancel();
      }
    }
    document.addEventListener('keydown', onKeyDown);

    okBtn && okBtn.addEventListener('click', () => { cleanup(); if (onConfirm) onConfirm(); });
    cancelBtn && cancelBtn.addEventListener('click', () => { cleanup(); if (onCancel) onCancel(); });
    closeBtn && closeBtn.addEventListener('click', () => { cleanup(); if (onCancel) onCancel(); });
    backdrop.addEventListener('click', () => { cleanup(); if (onCancel) onCancel(); });
    return true;
  }

  // 简易防抖
  function debounce(fn, delay = 200) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // 注入通知动画样式（若未注入）
  (function injectNotifyKeyframes() {
    if (document.getElementById('ui-utils-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'ui-utils-keyframes';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
  })();

  // 暴露到全局
  window.showNotification = window.showNotification || showNotification;
  window.showDeleteConfirm = window.showDeleteConfirm || showDeleteConfirm;
  window.debounce = window.debounce || debounce;

  // 面板高度拖拽
  (function initPanelResizer() {
    if (window.__panelResizerInitialized) return;
    window.__panelResizerInitialized = true;

    const resizer = document.getElementById('panelResizer');
    const panels = document.getElementById('editorPanels');
    const inputSection = document.querySelector('#editorPanels .input-section');
    const contentArea = document.querySelector('#editorPanels .content-area');

    if (!resizer || !panels || !inputSection || !contentArea) return;

    let startY = 0;
    let startInputHeight = 0;
    let startContentHeight = 0;
    let dragging = false;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const applyHeights = (inputHeight) => {
      const total = panels.clientHeight - resizer.offsetHeight;
      const minInput = 120;
      const minContent = 160;
      const clampedInput = clamp(inputHeight, minInput, total - minContent);
      const contentHeight = total - clampedInput;
      inputSection.style.flex = '0 0 auto';
      contentArea.style.flex = '0 0 auto';
      inputSection.style.height = `${clampedInput}px`;
      contentArea.style.height = `${contentHeight}px`;
      inputSection.style.minHeight = `${minInput}px`;
      contentArea.style.minHeight = `${minContent}px`;
    };

    const onPointerMove = (event) => {
      if (!dragging) return;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const delta = clientY - startY;
      applyHeights(startInputHeight + delta);
      event.preventDefault();
    };

    const stopDragging = () => {
      if (!dragging) return;
      dragging = false;
      resizer.classList.remove('resizing');
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('touchend', stopDragging);
      document.removeEventListener('touchcancel', stopDragging);
    };

    const startDragging = (event) => {
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      startY = clientY;
      startInputHeight = inputSection.getBoundingClientRect().height;
      startContentHeight = contentArea.getBoundingClientRect().height;
      if (startInputHeight <= 0 || startContentHeight <= 0) {
        const total = panels.clientHeight - resizer.offsetHeight;
        startInputHeight = total * 0.5;
        startContentHeight = total - startInputHeight;
      }
      dragging = true;
      resizer.classList.add('resizing');
      document.addEventListener('mousemove', onPointerMove, { passive: false });
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', stopDragging);
      document.addEventListener('touchcancel', stopDragging);
      event.preventDefault();
    };

    resizer.addEventListener('mousedown', startDragging);
    resizer.addEventListener('touchstart', startDragging, { passive: false });
    window.addEventListener('resize', () => {
      if (dragging) return;
      const total = panels.clientHeight - resizer.offsetHeight;
      const storedInput = parseFloat(inputSection.style.height) || (total * 0.5);
      applyHeights(storedInput);
    });

    // 初始高度：输入区与显示区各占一半
    setTimeout(() => {
      const total = panels.clientHeight - resizer.offsetHeight;
      if (total > 0) applyHeights(total * 0.5);
    }, 0);
  })();
})();

