/**
 * Fudoki Mobile UX — 移动端体验增强（2026-08）
 *
 * 纯体验层，不触碰 Firebase/同步/文档数据逻辑：
 *  - EasyMDE 预览切换大按钮（多语言标签）
 *  - 软键盘弹出视口处理（body.kb-open + visualViewport）
 *  - 文档列表下拉刷新
 *  - 内容区左右滑切换文档（可在 localStorage 关闭：fudoki:mobileGestures = "0"）
 *  - PWA 安装入口（Android FAB / iOS 提示）
 */
(function () {
  'use strict';

  var isMobile = function () {
    return window.matchMedia('(max-width: 768px)').matches;
  };

  var gesturesEnabled = function () {
    return localStorage.getItem('fudoki:mobileGestures') !== '0';
  };

  var t = function (ja, zh, en) {
    try {
      var lang = (localStorage.getItem('fudoki:lang') || 'ja').slice(0, 2);
      if (lang === 'zh') return zh;
      if (lang === 'en') return en;
    } catch (_) {}
    return ja;
  };

  var notify = function (msg) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(msg);
      return;
    }
    var el = document.createElement('div');
    el.className = 'fudoki-swipe-hint';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1800);
  };

  /* ------------------------------------------------
   * 1. EasyMDE 预览切换大按钮：追加本地化文字标签
   * ------------------------------------------------ */
  function decoratePreviewButton() {
    var btn = document.querySelector('.input-section .EasyMDEContainer .editor-toolbar button.preview');
    if (!btn || btn.querySelector('.mde-preview-label')) return;
    var label = document.createElement('span');
    label.className = 'mde-preview-label';
    label.textContent = t('プレビュー', '预览', 'Preview');
    btn.appendChild(label);
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
  }

  /* ------------------------------------------------
   * 2. 软键盘视口处理：visualViewport 高度骤降 ⇒ body.kb-open
   * ------------------------------------------------ */
  function initKeyboardHandling() {
    if (!window.visualViewport) return;
    var baseline = window.visualViewport.height;
    var update = function () {
      var shrunk = window.visualViewport.height < baseline - 120;
      document.body.classList.toggle('kb-open', shrunk);
    };
    window.visualViewport.addEventListener('resize', function () {
      // 键盘收起后重置基线（旋转屏幕等场景）
      if (!document.body.classList.contains('kb-open') && window.visualViewport.height > baseline) {
        baseline = window.visualViewport.height;
      }
      update();
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { baseline = window.visualViewport.height; }, 400);
    });
  }

  /* ------------------------------------------------
   * 3. 文档列表下拉刷新（抽屉打开、列表在顶时下拉）
   * ------------------------------------------------ */
  function initPullToRefresh() {
    var indicator = null;
    var startY = 0, pulling = false, armed = false;
    var TRIGGER = 72;

    var getIndicator = function () {
      if (!indicator || !indicator.isConnected) {
        indicator = document.createElement('div');
        indicator.className = 'fudoki-ptr';
        indicator.textContent = '↓';
        document.body.appendChild(indicator);
      }
      return indicator;
    };

    var drawerOpen = function () {
      var mc = document.querySelector('.main-container');
      return mc && !mc.classList.contains('collapsed');
    };

    document.addEventListener('touchstart', function (e) {
      if (!isMobile() || !drawerOpen() || e.touches.length !== 1) return;
      if (window.scrollY > 0 && document.querySelector('.sidebar-scroll').scrollTop > 0) return;
      var target = e.touches[0].target;
      if (target.closest && target.closest('input, textarea, select, button, .doc-action-btn')) return;
      startY = e.touches[0].clientY;
      pulling = true;
      armed = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (!pulling) return;
      var dy = e.touches[0].clientY - startY;
      if (dy <= 0) {
        if (indicator) indicator.classList.remove('visible');
        return;
      }
      var ind = getIndicator();
      var drag = Math.min(dy * 0.4, 90);
      ind.classList.add('visible');
      ind.style.transform = 'translate(-50%, ' + (-64 + drag) + 'px)';
      armed = dy >= TRIGGER;
      ind.classList.toggle('armed', armed);
      ind.textContent = armed ? '↻' : '↓';
    }, { passive: true });

    document.addEventListener('touchend', function () {
      if (!pulling) return;
      pulling = false;
      if (indicator) {
        indicator.classList.remove('visible', 'armed');
        indicator.style.transform = '';
        indicator.textContent = '↓';
      }
      if (!armed) return;
      armed = false;
      var ind = getIndicator();
      ind.innerHTML = '<span class="spin">↻</span>';
      setTimeout(function () { ind.innerHTML = '↓'; }, 900);
      try {
        if (window.documentManager) {
          window.documentManager.render();
          notify(t('リストを更新しました', '列表已更新', 'List refreshed'));
        }
      } catch (_) {}
    });
  }

  /* ------------------------------------------------
   * 4. 内容区左右滑切换文档
   *    （仅在分析结果区域滑动生效；编辑器聚焦/选中文字时忽略）
   * ------------------------------------------------ */
  function initSwipeNavigation() {
    var startX = 0, startY = 0, startT = 0, tracking = false;

    document.addEventListener('touchstart', function (e) {
      if (!isMobile() || !gesturesEnabled() || e.touches.length !== 1) return;
      var target = e.touches[0].target;
      // 仅在分析结果区滑动时生效
      if (!target.closest || !target.closest('.content-area')) return;
      // 词条/卡片/按钮上滑动不切文档
      if (target.closest('.token-pill, .token-details, button, input, select, a')) return;
      if (window.getSelection && String(window.getSelection())) return;
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      var dt = Date.now() - startT;
      if (dt > 500 || Math.abs(dx) < 64 || Math.abs(dy) > 56) return;
      swipeToDocument(dx > 0 ? -1 : 1); // 右滑=上一篇，左滑=下一篇
    }, { passive: true });
  }

  function swipeToDocument(dir) {
    var dm = window.documentManager;
    if (!dm) return;
    var docs;
    try { docs = dm.getAllDocuments(); } catch (_) { return; }
    if (!Array.isArray(docs) || docs.length < 2) return;

    var activeId;
    try { activeId = localStorage.getItem('fudoki:activeId'); } catch (_) {}
    var idx = docs.findIndex(function (d) { return d.id === activeId; });
    if (idx < 0) idx = 0;
    var next = idx + dir;
    if (next < 0 || next >= docs.length) {
      notify(t('これが最初のドキュメントです', '已经是第一篇文档', 'First document'));
      return;
    }
    var doc = docs[next];
    try {
      dm.switchToDocument(doc.id);
      notify((dir > 0 ? '› ' : '‹ ') + (doc.title || ''));
    } catch (_) {}
  }

  /* ------------------------------------------------
   * 5. PWA 安装入口：Android FAB / iOS 添加到主屏提示
   * ------------------------------------------------ */
  function initInstallPrompt() {
    var deferred = null;
    var fab = null;
    var standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    var dismissKey = 'fudoki:installFabDismissed';
    var dismissed = function () {
      try { return localStorage.getItem(dismissKey) === '1'; } catch (_) { return true; }
    };

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferred = e;
      showFab();
    });

    window.addEventListener('appinstalled', function () {
      removeFab();
      try { localStorage.setItem(dismissKey, '1'); } catch (_) {}
    });

    function showFab() {
      if (!isMobile() || standalone || dismissed() || fab || !deferred) return;
      fab = document.createElement('button');
      fab.className = 'fudoki-install-fab';
      fab.textContent = t('インストール', '安装', 'Install');
      fab.addEventListener('click', async function () {
        if (!deferred) return;
        deferred.prompt();
        try { await deferred.userChoice; } catch (_) {}
        deferred = null;
        removeFab();
      });
      // 可关闭：长按关闭本次会话的入口
      var pressTimer = null;
      fab.addEventListener('touchstart', function () {
        pressTimer = setTimeout(function () {
          removeFab();
          try { localStorage.setItem(dismissKey, '1'); } catch (_) {}
          notify(t('今後はユーザーメニューからインストールできます', '之后可从用户菜单安装', 'Install later from the user menu'));
        }, 600);
      }, { passive: true });
      fab.addEventListener('touchend', function () { clearTimeout(pressTimer); }, { passive: true });
      fab.addEventListener('touchmove', function () { clearTimeout(pressTimer); }, { passive: true });
      document.body.appendChild(fab);
    }

    function removeFab() {
      if (fab) { fab.remove(); fab = null; }
    }

    // iOS：无 beforeinstallprompt，进入时提示一次添加到主屏（每 7 天最多一次）
    if (isIOS && isMobile() && !standalone) {
      var hintKey = 'fudoki:iosHomeHintAt';
      var last = 0;
      try { last = parseInt(localStorage.getItem(hintKey) || '0', 10); } catch (_) {}
      if (Date.now() - last > 7 * 24 * 3600 * 1000) {
        setTimeout(function () {
          notify(t('「共有」→「ホーム画面に追加」でアプリ化できます', '通过「分享」→「添加到主屏幕」安装应用', 'Use Share → Add to Home Screen to install'));
          try { localStorage.setItem(hintKey, String(Date.now())); } catch (_) {}
        }, 2500);
      }
    }
  }

  /* ------------------------------------------------
   * 启动
   * ------------------------------------------------ */
  function init() {
    decoratePreviewButton();
    // EasyMDE 工具栏是初始化时构建的，晚一点再补一次标签
    setTimeout(decoratePreviewButton, 1500);
    initKeyboardHandling();
    initPullToRefresh();
    initSwipeNavigation();
    initInstallPrompt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
