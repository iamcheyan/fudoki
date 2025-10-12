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

    const resizer = document.getElementById('panelResizer');
    const panels = document.getElementById('editorPanels');
    const inputSection = document.querySelector('#editorPanels .input-section');
    const contentArea = document.querySelector('#editorPanels .content-area');

    // 如果元素还没加载完成，等待 DOM 加载后再试
    if (!resizer || !panels || !inputSection || !contentArea) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanelResizer);
      }
      return;
    }
    
    // 只有成功找到所有元素后才标记为已初始化
    window.__panelResizerInitialized = true;

    let startY = 0;
    let startInputHeight = 0;
    let layoutTotalHeight = null;
    let dragging = false;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const computeTotalHeight = () => {
      const inputRect = inputSection.getBoundingClientRect();
      const contentRect = contentArea.getBoundingClientRect();
      const total = inputRect.height + contentRect.height;
      return total > 0 ? total : null;
    };

    const applyHeights = (inputHeight) => {
      const total = layoutTotalHeight || computeTotalHeight();
      if (!total) return;
      const minInput = 140;
      const minContent = 180;
      const maxInput = Math.max(minInput, total - minContent);
      const clampedInput = clamp(inputHeight, minInput, maxInput);
      const contentHeight = Math.max(minContent, total - clampedInput);
      layoutTotalHeight = total;
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
      layoutTotalHeight = null;
      resizer.classList.remove('resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('touchend', stopDragging);
      document.removeEventListener('touchcancel', stopDragging);
    };

    const startDragging = (event) => {
      // 检查是否在 two-pane 模式下（不应该拖拽）
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer && mainContainer.classList.contains('two-pane')) {
        return;
      }
      
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      startY = clientY;
      startInputHeight = inputSection.getBoundingClientRect().height;
      layoutTotalHeight = computeTotalHeight();
      if (!layoutTotalHeight) {
        const autoTotal = panels.getBoundingClientRect().height - resizer.offsetHeight;
        layoutTotalHeight = autoTotal > 0 ? autoTotal : null;
      }
      if (!layoutTotalHeight) {
        layoutTotalHeight = startInputHeight + contentArea.getBoundingClientRect().height;
      }
      dragging = true;
      resizer.classList.add('resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onPointerMove, { passive: false });
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', stopDragging);
      document.addEventListener('touchcancel', stopDragging);
      event.preventDefault();
      event.stopPropagation();
    };

    resizer.addEventListener('mousedown', startDragging, { passive: false });
    resizer.addEventListener('touchstart', startDragging, { passive: false });
    
    // 添加调试信息
    console.log('Resizer initialized successfully:', {
      resizer: !!resizer,
      panels: !!panels,
      inputSection: !!inputSection,
      contentArea: !!contentArea
    });
    window.addEventListener('resize', () => {
      if (dragging) return;
      const mainContainer = document.querySelector('.main-container');
      // 在 two-pane 模式下不调整高度
      if (mainContainer && mainContainer.classList.contains('two-pane')) return;
      layoutTotalHeight = null;
      const total = computeTotalHeight() || (panels.clientHeight - resizer.offsetHeight);
      const storedInput = parseFloat(inputSection.style.height) || (total * 0.5);
      applyHeights(storedInput);
    });

    // 初始高度：输入区与显示区各占一半（仅在非 two-pane 模式下）
    // 使用 requestAnimationFrame 确保在首次渲染后执行
    requestAnimationFrame(() => {
      setTimeout(() => {
        const mainContainer = document.querySelector('.main-container');
        // 如果是 two-pane 模式，不应用高度设置
        if (mainContainer && mainContainer.classList.contains('two-pane')) return;
        layoutTotalHeight = computeTotalHeight() || (panels.clientHeight - resizer.offsetHeight);
        if (layoutTotalHeight && layoutTotalHeight > 0) {
          applyHeights(layoutTotalHeight * 0.5);
        }
      }, 100);
    });
  })();
})();
