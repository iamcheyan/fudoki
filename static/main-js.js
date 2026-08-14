(() => {
  // 元素选择器 — Linear 式壳层（左侧文档栏 + 编辑⇄分析双模式主区）
  const $ = (id) => document.getElementById(id);
  const textInput = $('textInput');
  const analyzeBtn = $('analyzeBtn');
  const content = $('content');
  // 头部控件（不存在时为 null，所有引用处均已空值保护）
  const voiceSelect = $('voiceSelect');
  const speedSlider = $('speedRange');
  const speedValue = $('speedValue');
  const headerVoiceSelect = $('headerVoiceSelect');
  const headerSpeedSlider = $('headerSpeedRange');
  const headerSpeedValue = $('headerSpeedValue');
  const playAllBtn = $('playAllBtn');
  const headerPlayToggle = $('headerPlayToggle');
  const headerPauseToggle = $('headerPauseToggle');
  const headerDownloadBtn = $('headerDownloadBtn');
  const newDocBtn = $('newDocBtn');
  const documentList = $('documentList');
  const langSelect = $('langSelect');
  const themeSelect = document.getElementById('themeSelect');
  const editorReadingToggle = null; // 旧版编辑工具栏阅读按钮（已移除；保留引用以空值保护）
  const editorDocDate = document.getElementById('editorDocDate');
  const editorCharCount = document.getElementById('editorCharCount');
  const editorStarToggle = document.getElementById('editorStarToggle');
  const docSortToggle = $('docSortToggle');
  const deleteDocBtn = document.getElementById('deleteDocBtn');
  const editorNewBtn = document.getElementById('editorNewBtn');
  const editorDeleteBtn = document.getElementById('editorDeleteBtn');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const docbarToggle = $('docbarToggle');
  const modeEditBtn = $('modeEditBtn');
  const modeAnalyzeBtn = $('modeAnalyzeBtn');
  const docSearchInput = $('docSearchInput');
  const topbarDocTitle = $('topbarDocTitle');
  const dockNewBtn = $('dockNewBtn');
  const dockModeBtn = $('dockModeBtn');
  const dockPlayBtn = $('dockPlayBtn');
  // 兼容引用（旧界面遗留，值为 null）
  const folderList = $('folderList');
  const langFlagJA = $('langFlagJA');
  const langFlagEN = $('langFlagEN');
  const langFlagZH = $('langFlagZH');
  const langDropdownBtn = $('langDropdownBtn');
  const langDropdownMenu = $('langDropdownMenu');
  const langDropdownIcon = $('langDropdownIcon');
  const sidebarVoiceSelect = $('sidebarVoiceSelect');
  const sidebarSpeedSlider = $('sidebarSpeedRange');
  const sidebarSpeedValue = $('sidebarSpeedValue');
  const sidebarPlayAllBtn = $('sidebarPlayAllBtn');
  const sidebarLangSelect = $('sidebarLangSelect');
  const sidebarThemeSelect = $('sidebarThemeSelect');
  const showKanaCheckbox = $('showKana');
  const showRomajiCheckbox = $('showRomaji');
  const showPosCheckbox = $('showPos');
  const autoReadCheckbox = $('autoRead');
  let repeatPlayCheckbox = $('repeatPlay');
  // 暴露到全局，供 tts.js 访问
  if (typeof window !== 'undefined') {
    window.repeatPlayCheckbox = repeatPlayCheckbox;
  }

  const pwaToast = $('pwaInstallToast');
  const pwaToastIcon = $('pwaInstallIcon');
  const pwaToastTitle = $('pwaInstallTitle');
  const pwaToastMessage = $('pwaInstallMessage');
  const pwaToastProgress = $('pwaInstallProgress');
  const pwaToastBar = $('pwaInstallProgressBar');
  const pwaToastClose = $('pwaToastClose');

  const sidebarShowKanaCheckbox = $('sidebarShowKana');
  const sidebarShowRomajiCheckbox = $('sidebarShowRomaji');
  const sidebarShowPosCheckbox = $('sidebarShowPos');
  const sidebarAutoReadCheckbox = $('sidebarAutoRead');
  let sidebarRepeatPlayCheckbox = $('sidebarRepeatPlay');
  // 本地存储键
  // ===== localStorage 键迁移：旧命名 → fudoki: 命名空间 =====
  // 一次性启动迁移；旧键保留不删（一版本双读），运行时只读写新键。
  const LS_KEY_MIGRATIONS = {
    'text': 'fudoki:text',
    'voiceURI': 'fudoki:voiceURI',
    'rate': 'fudoki:rate',
    'volume': 'fudoki:volume',
    'texts': 'fudoki:texts',
    'activeId': 'fudoki:activeId',
    'activeFolder': 'fudoki:activeFolder',
    'sortAsc': 'fudoki:sortAsc',
    'twoPane': 'fudoki:twoPane',
    'showKana': 'fudoki:showKana',
    'showRomaji': 'fudoki:showRomaji',
    'showPos': 'fudoki:showPos',
    'showDetails': 'fudoki:showDetails',
    'autoRead': 'fudoki:autoRead',
    'repeatPlay': 'fudoki:repeatPlay',
    'lang': 'fudoki:lang',
    'theme': 'fudoki:theme',
    'lightTheme': 'fudoki:lightTheme',
    'showUnderline': 'fudoki:showUnderline',
    'readingScript': 'fudoki:readingScript',
    'haAsWa': 'fudoki:haAsWa',
    'tokenAlignLeft': 'fudoki:tokenAlignLeft',
    'sidebarCollapsed': 'fudoki:sidebarCollapsed',
    'toolbarPosition': 'fudoki:toolbarPosition',
    'toolbarHeight': 'fudoki:toolbarHeight',
    'toolbarCollapsed': 'fudoki:toolbarCollapsed',
    'app:fontScale': 'fudoki:fontScale',
    'app:inputFont': 'fudoki:inputFont',
    'app:contentFont': 'fudoki:contentFont',
    'fudoki_user': 'fudoki:user'
  };

  function migrateLocalStorage() {
    try {
      Object.keys(LS_KEY_MIGRATIONS).forEach((oldKey) => {
        const newKey = LS_KEY_MIGRATIONS[oldKey];
        if (localStorage.getItem(newKey) !== null) return;
        const legacy = localStorage.getItem(oldKey);
        if (legacy !== null) {
          try { localStorage.setItem(newKey, legacy); } catch (_) {}
        }
      });
    } catch (_) {}
  }
  migrateLocalStorage();

  // 本地存储键（统一 fudoki: 命名空间；修改键名必须同步更新 LS_KEY_MIGRATIONS）
  const LS = {
    text: 'fudoki:text',
    voiceURI: 'fudoki:voiceURI',
    rate: 'fudoki:rate',
    volume: 'fudoki:volume',
    texts: 'fudoki:texts',
    activeId: 'fudoki:activeId',
    activeFolder: 'fudoki:activeFolder',
    sortAsc: 'fudoki:sortAsc',

    showKana: 'fudoki:showKana',
    showRomaji: 'fudoki:showRomaji',
    showPos: 'fudoki:showPos',
    showDetails: 'fudoki:showDetails',
    autoRead: 'fudoki:autoRead',
    repeatPlay: 'fudoki:repeatPlay',
    lang: 'fudoki:lang',
    theme: 'fudoki:theme',

    showUnderline: 'fudoki:showUnderline',
    readingScript: 'fudoki:readingScript',
    haAsWa: 'fudoki:haAsWa',
    tokenAlignLeft: 'fudoki:tokenAlignLeft',
    mode: 'fudoki:mode',
    fontScale: 'fudoki:fontScale',
    inputFont: 'fudoki:inputFont',
    contentFont: 'fudoki:contentFont',

  };

  // ===== 共享工具：HTML 转义（XSS 防护，所有用户数据进 innerHTML 前必须经过此处）=====
  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ===== 共享 Toast（IIFE 唯一实现，同时暴露到 window 供旧调用点使用）=====
  function showErrorToast(message) {
    const errorToast = document.getElementById('errorToast');
    const errorText = document.getElementById('errorText');
    if (errorToast && errorText) {
      errorText.textContent = message;
      errorToast.classList.add('show');
      setTimeout(() => { errorToast.classList.remove('show'); }, 3000);
    }
  }

  function showSuccessToast(message) {
    const syncToast = document.getElementById('syncProgressToast');
    const syncText = document.getElementById('syncProgressText');
    if (syncToast && syncText) {
      syncText.textContent = message;
      syncToast.classList.add('show');
      setTimeout(() => { syncToast.classList.remove('show'); }, 2000);
    }
  }

  function showInfoToast(message, duration = 3000) {
    const toast = document.getElementById('syncProgressToast');
    const text = document.getElementById('syncProgressText');
    if (toast && text) {
      text.textContent = message;
      toast.classList.add('show');
      setTimeout(() => { toast.classList.remove('show'); }, duration);
    }
  }
  window.showErrorToast = showErrorToast;
  window.showSuccessToast = showSuccessToast;
  window.showInfoToast = showInfoToast;

  // ===== 备份/导入（单一实现：设置弹窗与用户菜单共用；键与运行时一致）=====
  function collectBackupPayload() {
    const documents = (() => {
      try {
        const all = documentManager ? documentManager.getAllDocuments() : JSON.parse(localStorage.getItem(LS.texts) || '[]');
        // 排除示例文章与锁定文档
        return (Array.isArray(all) ? all : []).filter(d => d && d.folder !== 'samples' && !d.locked);
      } catch (_) { return []; }
    })();
    const activeId = localStorage.getItem(LS.activeId) || '';
    const settings = {};
    try {
      Object.values(LS).forEach((k) => {
        if (k === LS.texts || k === LS.activeId) return;
        settings[k] = localStorage.getItem(k);
      });
    } catch (_) {}
    return {
      app: 'Fudoki',
      version: 3,
      createdAt: new Date().toISOString(),
      data: { documents, activeId, settings }
    };
  }

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch (_) {} URL.revokeObjectURL(url); }, 0);
  }

  function formatNowForFile() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function applyBackup(data) {
    if (!data || !data.data) throw new Error('invalid backup file');
    const docs = Array.isArray(data.data.documents) ? data.data.documents : [];
    const activeId = typeof data.data.activeId === 'string' ? data.data.activeId : '';
    const settings = data.data.settings && typeof data.data.settings === 'object' ? data.data.settings : {};


    localStorage.setItem(LS.texts, JSON.stringify(docs));
    localStorage.setItem(LS.activeId, activeId);
    Object.keys(settings).forEach((k) => {
      // 旧备份里的旧键名迁移到 fudoki: 命名空间
      const targetKey = LS_KEY_MIGRATIONS[k] || k;
      try { if (targetKey && typeof settings[k] !== 'undefined') localStorage.setItem(targetKey, settings[k]); } catch (_) {}
    });
    try {
      if (documentManager) {
        documentManager.render();
        documentManager.setActiveId(activeId);
        documentManager.loadActiveDocument();
      }
    } catch (_) {}
    try { if (settings[LS.theme]) setThemePreference(settings[LS.theme]); } catch (_) {}
    try { if (settings[LS.lang]) setLanguage(settings[LS.lang]); } catch (_) {}
    try { applyI18n(); } catch (_) {}
  }


  // 初始化 EasyMDE Markdown 编辑器
  let easymde = null;
  
  if (textInput && typeof EasyMDE !== 'undefined') {
    easymde = new EasyMDE({
      element: textInput,
      placeholder: textInput.placeholder || '在此输入日语文本进行分析...',
      spellChecker: false,
      status: false,
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', '|',
        'preview', 'fullscreen'
      ],
      autofocus: false,
      lineWrapping: true,
      indentWithTabs: false,
      tabSize: 4,
      renderingConfig: {
        codeSyntaxHighlighting: false
      }
    });

    // 覆盖 textInput 对象的属性和方法，使其与 markdown 编辑器兼容
    // 由于 textInput 本身是一个 HTML 元素，我们可以添加新的属性/方法
    const originalGetValue = function() { return this.value; };
    const originalSetValue = function(val) { this.value = val; };
    
    Object.defineProperty(textInput, 'value', {
      get: function() {
        return easymde ? easymde.value() : '';
      },
      set: function(val) {
        if (easymde) {
          easymde.value(val || '');
        }
      },
      configurable: true
    });

    // 保存原始的 addEventListener 方法
    const originalAddEventListener = textInput.addEventListener.bind(textInput);
    
    textInput.addEventListener = function(event, handler, options) {
      if (event === 'input' && easymde) {
        easymde.codemirror.on('change', handler);
      } else if (event === 'focus' && easymde) {
        easymde.codemirror.on('focus', handler);
      } else if (event === 'blur' && easymde) {
        easymde.codemirror.on('blur', handler);
      } else {
        originalAddEventListener(event, handler, options);
      }
    };

    // 保存原始的 focus 方法
    const originalFocus = textInput.focus.bind(textInput);
    
    textInput.focus = function() {
      if (easymde && easymde.codemirror) {
        easymde.codemirror.focus();
      } else {
        originalFocus();
      }
    };

    // 将 markdown 编辑器实例保存到全局，方便调试
    window._markdownEditor = easymde;

    // 添加失去焦点时自动清理开头空行的功能
    easymde.codemirror.on('blur', () => {
      const currentValue = easymde.value();
      if (!currentValue) return;
      
      // 清理开头的所有空行和空白字符
      const trimmedValue = currentValue.replace(/^[\s\n\r]+/, '');
      
      // 如果内容发生了变化，更新编辑器
      if (trimmedValue !== currentValue) {
        // 保存当前光标位置
        const cursor = easymde.codemirror.getCursor();
        
        // 更新内容
        easymde.value(trimmedValue);
        
        // 尝试恢复光标位置（调整行号）
        const removedLines = currentValue.split('\n').length - trimmedValue.split('\n').length;
        const newLine = Math.max(0, cursor.line - removedLines);
        easymde.codemirror.setCursor({ line: newLine, ch: cursor.ch });
        
        console.log('Cleaned leading whitespace/empty lines');
      }
    });

    // 拦截 EasyMDE 的 side-by-side 按钮，改为切换 two-pane 模式
    setTimeout(() => {

      // 全局变量：标记是否正在处理
      let isProcessingFurigana = false;
      let furiganaObserver = null;
      
      // 为预览区域的日语文本添加假名和罗马音
      // 转换片假名到平假名
      function katakanaToHiragana(str) {
        return str.replace(/[\u30A1-\u30F6]/g, match => {
          const chr = match.charCodeAt(0) - 0x60;
          return String.fromCharCode(chr);
        });
      }

      async function addFuriganaToPreview() {
        const previewSide = document.querySelector('.editor-preview-side');
        if (!previewSide || isProcessingFurigana) return;
        
        // 检查是否已经处理过（通过标记属性）
        if (previewSide.hasAttribute('data-furigana-processed')) {
          return;
        }
        
        isProcessingFurigana = true;
        
        try {
          // 等待分词器初始化
          if (!segmenter) {
            await initSegmenter();
          }
          
          // 获取所有文本节点
          const walker = document.createTreeWalker(
            previewSide,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                // 跳过代码块和已处理的节点
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tagName = parent.tagName.toLowerCase();
                if (tagName === 'code' || tagName === 'pre' || tagName === 'script' || tagName === 'style') {
                  return NodeFilter.FILTER_REJECT;
                }
                // 跳过已经处理过的假名标签
                if (parent.classList.contains('furigana-wrapper') || 
                    parent.classList.contains('furigana-base') ||
                    parent.classList.contains('furigana-reading') ||
                    parent.classList.contains('furigana-hiragana') ||
                    parent.classList.contains('furigana-romaji') ||
                    parent.classList.contains('furigana-annotation')) {
                  return NodeFilter.FILTER_REJECT;
                }
                // 向上检查祖先元素
                let ancestor = parent.parentElement;
                while (ancestor && ancestor !== previewSide) {
                  if (ancestor.classList.contains('furigana-wrapper')) {
                    return NodeFilter.FILTER_REJECT;
                  }
                  ancestor = ancestor.parentElement;
                }
                // 只处理包含日语字符的文本
                const text = node.textContent.trim();
                if (text && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
                  return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
              }
            }
          );
          
          const textNodes = [];
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }
          
          // 处理每个文本节点
          for (const textNode of textNodes) {
            let text = textNode.textContent;
            if (!text.trim()) continue;
            
            // 预处理：过滤括号内容（如果全是假名或标点就移除）
            // 处理全角括号
            text = text.replace(/（([^）]+)）/g, (match, content) => {
              const hasKanji = /[\u4E00-\u9FAF]/.test(content);
              const hasEnglish = /[a-zA-Z]/.test(content);
              return (hasKanji || hasEnglish) ? match : '';
            });
            // 处理半角括号
            text = text.replace(/\(([^)]+)\)/g, (match, content) => {
              const hasKanji = /[\u4E00-\u9FAF]/.test(content);
              const hasEnglish = /[a-zA-Z]/.test(content);
              return (hasKanji || hasEnglish) ? match : '';
            });
            
            if (!text.trim()) continue;
            
            try {
              // 对文本进行分词
              const result = await segmenter.segment(text, 'B');
              if (!result.lines || result.lines.length === 0) continue;
              
              const tokens = result.lines[0]; // 单行处理
              if (!tokens || tokens.length === 0) continue;
              
              // 创建包含ruby标签的HTML
              const fragment = document.createDocumentFragment();
              
            for (const token of tokens) {
              const surface = token.surface || '';
              const reading = token.reading || '';
              
              // 检查是否为日语词汇（包含汉字或假名）
              const hasKanji = /[\u4E00-\u9FAF]/.test(surface);
              const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(surface);
              
              // 跳过纯英文/数字/符号
              const isPureAscii = /^[a-zA-Z0-9\s\.,!?;:'"()\-_/\\]+$/.test(surface);
              
              if (hasJapanese && reading && reading !== surface && !isPureAscii) {
                // 创建包装元素
                const wrapper = document.createElement('span');
                wrapper.className = 'furigana-wrapper';
                
                // 假名（顶部，第1层）
                const readingSpan = document.createElement('span');
                readingSpan.className = 'furigana-reading';
                readingSpan.textContent = reading || '';
                wrapper.appendChild(readingSpan);
                
                // 平假名（第2层）
                const hiraganaSpan = document.createElement('span');
                hiraganaSpan.className = 'furigana-hiragana';
                const hiraganaText = katakanaToHiragana(reading || '');
                if (hiraganaText && hiraganaText !== reading) {
                  hiraganaSpan.textContent = hiraganaText;
                }
                wrapper.appendChild(hiraganaSpan);
                
                // 罗马音（第3层）
                const romajiSpan = document.createElement('span');
                romajiSpan.className = 'furigana-romaji';
                if (hasKanji || /[\u30A0-\u30FF]/.test(surface)) {
                  const romaji = getRomaji(reading);
                  if (romaji && romaji !== reading) {
                    romajiSpan.textContent = romaji;
                  }
                }
                wrapper.appendChild(romajiSpan);
                
                // 主文本/汉字（底部，第4层）
                const baseSpan = document.createElement('span');
                baseSpan.className = 'furigana-base';
                baseSpan.textContent = surface;
                wrapper.appendChild(baseSpan);
                
                fragment.appendChild(wrapper);
              } else {
                // 所有文本（包括纯英文）都用wrapper包装以保持底部对齐
                const wrapper = document.createElement('span');
                wrapper.className = 'furigana-wrapper furigana-plain';
                
                // 空的假名层（保留空间）
                const readingSpan = document.createElement('span');
                readingSpan.className = 'furigana-reading';
                wrapper.appendChild(readingSpan);
                
                // 空的平假名层（保留空间）
                const hiraganaSpan = document.createElement('span');
                hiraganaSpan.className = 'furigana-hiragana';
                wrapper.appendChild(hiraganaSpan);
                
                // 空的罗马音层（保留空间）
                const romajiSpan = document.createElement('span');
                romajiSpan.className = 'furigana-romaji';
                wrapper.appendChild(romajiSpan);
                
                // 主文本
                const baseSpan = document.createElement('span');
                baseSpan.className = 'furigana-base';
                baseSpan.textContent = surface;
                wrapper.appendChild(baseSpan);
                
                fragment.appendChild(wrapper);
              }
          }
          
          // 替换原文本节点
          textNode.parentNode.replaceChild(fragment, textNode);
        } catch (error) {
          console.error('处理文本节点时出错:', error);
        }
      }
      
      // 标记已处理
      previewSide.setAttribute('data-furigana-processed', 'true');
    } finally {
      isProcessingFurigana = false;
    }
  }
      
      // 设置MutationObserver监听预览区域的变化
      function setupFuriganaObserver() {
        const previewSide = document.querySelector('.editor-preview-side');
        if (!previewSide) return;
        
        // 如果已经有observer，先断开
        if (furiganaObserver) {
          furiganaObserver.disconnect();
        }
        
        // 创建新的observer
        furiganaObserver = new MutationObserver((mutations) => {
          // 检查是否有实质性的DOM变化
          let hasChanges = false;
          for (const mutation of mutations) {
            // 如果有节点添加或删除，且不是我们添加的假名节点
            if (mutation.type === 'childList') {
              const addedNodes = Array.from(mutation.addedNodes);
              const removedNodes = Array.from(mutation.removedNodes);
              
              // 检查是否有非假名节点的变化
              const hasNonFuriganaChanges = 
                addedNodes.some(node => 
                  node.nodeType === Node.ELEMENT_NODE && 
                  !node.classList?.contains('furigana-wrapper')
                ) ||
                removedNodes.some(node => 
                  node.nodeType === Node.ELEMENT_NODE && 
                  !node.classList?.contains('furigana-wrapper')
                );
              
              if (hasNonFuriganaChanges) {
                hasChanges = true;
                break;
              }
            }
          }
          
          if (hasChanges) {
            // 移除已处理标记，以便重新处理
            previewSide.removeAttribute('data-furigana-processed');
            // 延迟处理，等待DOM稳定
            setTimeout(() => {
              addFuriganaToPreview();
            }, 100);
          }
        });
        
        // 开始观察
        furiganaObserver.observe(previewSide, {
          childList: true,
          subtree: true,
          characterData: false
        });
      }
      
      // 拦截 EasyMDE 的 fullscreen 按钮，添加隐藏工具栏功能
      const fullscreenBtn = document.querySelector('.editor-toolbar .fullscreen');
      if (fullscreenBtn) {
        // 移除 EasyMDE 的默认事件
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
        
        // 退出全屏的函数
        const exitFullscreen = () => {
          const chromeEls = ['.docbar', '.topbar', '.dock', '.reading-mode-toggle']
            .map(sel => document.querySelector(sel)).filter(Boolean);
          const container = easymde.codemirror.getWrapperElement().closest('.EasyMDEContainer');
          
          if (container.classList.contains('fullscreen')) {
            // 关闭 side-by-side 预览
            if (easymde.isPreviewActive()) {
              easymde.togglePreview();
            }
            if (easymde.isSideBySideActive()) {
              easymde.toggleSideBySide();
            }
            
            container.classList.remove('fullscreen');
            easymde.codemirror.setOption('fullScreen', false);
            newFullscreenBtn.classList.remove('active');
            
            // 显示工具栏和侧边栏
            chromeEls.forEach(el => { el.style.display = ''; });

            
            // 断开假名观察器
            if (furiganaObserver) {
              furiganaObserver.disconnect();
              furiganaObserver = null;
            }
            
            // 清除处理标记
            const previewSide = document.querySelector('.editor-preview-side');
            if (previewSide) {
              previewSide.removeAttribute('data-furigana-processed');
            }
            
            // 刷新 CodeMirror
            setTimeout(() => {
              easymde.codemirror.refresh();
            }, 50);
          }
        };
        
        // 添加新的点击事件
        newFullscreenBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const chromeEls = ['.docbar', '.topbar', '.dock', '.reading-mode-toggle']
            .map(sel => document.querySelector(sel)).filter(Boolean);
          const container = easymde.codemirror.getWrapperElement().closest('.EasyMDEContainer');
          
          // 切换全屏状态
          if (container.classList.contains('fullscreen')) {
            exitFullscreen();
          } else {
            // 进入全屏
            container.classList.add('fullscreen');
            easymde.codemirror.setOption('fullScreen', true);
            newFullscreenBtn.classList.add('active');
            
            // 隐藏工具栏和侧边栏
            chromeEls.forEach(el => { el.style.display = 'none'; });

            
            // 启用 side-by-side 预览
            setTimeout(() => {
              if (!easymde.isSideBySideActive()) {
                easymde.toggleSideBySide();
              }
              easymde.codemirror.refresh();
              
              // 等待预览渲染完成后添加假名和设置观察器
              setTimeout(() => {
                addFuriganaToPreview().then(() => {
                  // 设置观察器，监听后续的DOM变化
                  setupFuriganaObserver();
                });
              }, 300);
            }, 100);
          }
        });
        
        // 监听编辑器内容变化，实时更新假名（作为备用机制）
        let updateTimeout = null;
        easymde.codemirror.on('change', () => {
          const container = easymde.codemirror.getWrapperElement().closest('.EasyMDEContainer');
          if (container && container.classList.contains('fullscreen')) {
            const previewSide = document.querySelector('.editor-preview-side');
            if (previewSide) {
              // 防抖处理，避免频繁更新
              if (updateTimeout) clearTimeout(updateTimeout);
              updateTimeout = setTimeout(() => {
                // 清除标记以允许重新处理
                previewSide.removeAttribute('data-furigana-processed');
                addFuriganaToPreview();
              }, 1000);
            }
          }
        });
        
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
          // ESC 键退出全屏
          if (e.key === 'Escape' || e.keyCode === 27) {
            exitFullscreen();
          }
          // F11 键切换全屏
          if (e.key === 'F11' || e.keyCode === 122) {
            e.preventDefault();
            newFullscreenBtn.click();
          }
        });
      }
    }, 500);
  }

  const PWA_MANIFEST_URL = 'static/pwa-assets.json';
  const PWA_CACHE_PREFIX = 'fudoki-cache';
  const PWA_STATE = {
    installing: false,
    requestId: null,
    total: 0,
    completed: 0,
    failed: 0,
    failedAssets: [],
    registration: null,
    hideTimer: null,
    lastError: ''
  };
  let pwaListenerAttached = false;
  const swResetResolvers = new Map();

  function createRequestId(prefix = 'pwa') {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function requestServiceWorkerReset(controller, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const requestId = createRequestId('pwa-reset');
      const timer = setTimeout(() => {
        if (swResetResolvers.has(requestId)) {
          swResetResolvers.delete(requestId);
          reject(new Error('reset-timeout'));
        }
      }, timeoutMs);

      swResetResolvers.set(requestId, {
        resolve: () => {
          clearTimeout(timer);
          swResetResolvers.delete(requestId);
          resolve();
        },
        reject: (error) => {
          clearTimeout(timer);
          swResetResolvers.delete(requestId);
          const err = error instanceof Error ? error : new Error(error?.message || String(error));
          reject(err);
        }
      });

      controller.postMessage({
        type: 'PWA_RESET',
        requestId,
        cachePrefix: PWA_CACHE_PREFIX
      });
    });
  }

  let isReadingMode = false;
  let activeReadingLine = null;
  const initialUrlSearch = (() => {
    try {
      const url = new URL(window.location.href);
      // 刷新后不恢复阅读模式：若存在 ?read 参数，立即移除
      if (url.searchParams.has('read')) {
        url.searchParams.delete('read');
        try { window.history.replaceState({}, '', url); } catch (_) {}
      }
      return url.searchParams;
    } catch (_) {
      return null;
    }
  })();
  // 不从 URL 初始化阅读模式，刷新后默认关闭

  // ====== 文档栏筛选（全部 / 收藏 / 示例；自绘 chips，非原生控件） ======
  function getActiveFolderId() {
    return localStorage.getItem(LS.activeFolder) || 'all';
  }
  function setActiveFolderId(id) {
    localStorage.setItem(LS.activeFolder, id || 'all');
  }

  const DOCBAR_FILTERS = [
    { id: 'all', labelKey: 'folderAll' },
    { id: 'favorites', labelKey: 'folderFavorites' },
    { id: 'samples', labelKey: 'folderSamples' }
  ];

  function renderFolderFilters() {
    const wrap = document.getElementById('docbarFilters');
    if (!wrap) return;
    const activeId = getActiveFolderId();
    wrap.innerHTML = '';
    DOCBAR_FILTERS.forEach(f => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'docbar-filter' + (activeId === f.id ? ' active' : '');
      btn.dataset.filter = f.id;
      btn.textContent = t(f.labelKey);
      btn.addEventListener('click', () => selectFilter(f.id));
      wrap.appendChild(btn);
    });
  }

  function selectFilter(id) {
    setActiveFolderId(id);
    renderFolderFilters();
    if (documentManager) documentManager.render();
  }

  // i18n词典已移至 static/js/i18n.js
  // I18N 通过全局变量访问

  let storedLang = localStorage.getItem(LS.lang);
  
  // 如果没有存储的语言设置，根据浏览器语言自动检测
  function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || '';
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('en')) return 'en';
    return 'zh'; // 默认使用中文
  }
  
  let currentLang = (storedLang === 'ja' || storedLang === 'en' || storedLang === 'zh') ? storedLang : detectBrowserLanguage();
  if (storedLang !== currentLang) {
    try { localStorage.setItem(LS.lang, currentLang); } catch (e) {}
  }
  // 初始化文档栏筛选 chips
  renderFolderFilters();
  // 当前显示的详情弹层及其锚点
  let activeTokenDetails = null; // { element, details }

  // 解析 token 对应的详情弹层：活动引用 → 元素内 → body 中归属本元素的弹层
  function resolveTokenDetails(element) {
    if (!element) return null;
    if (activeTokenDetails && activeTokenDetails.element === element && activeTokenDetails.details) {
      return activeTokenDetails.details;
    }
    let details = element.querySelector('.token-details');
    if (!details) {
      details = Array.from(document.body.querySelectorAll('.token-details')).find(d => d.__ownerTokenElement === element) || null;
    }
    return details;
  }

  // 计算并设置详情弹层的位置
  function positionTokenDetails(element, details) {
    if (!element || !details) return;
    
    // 将 details 移动到 body 最底层
    if (details.parentNode !== document.body) {
      // 记录归属 token，便于在模态交互后正确归位
      try { details.__ownerTokenElement = element; } catch (_) {}
      document.body.appendChild(details);
    }
    
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 先确保元素可测量
    const prevDisplay = details.style.display;
    const prevVis = details.style.visibility;
    details.style.display = 'block';
    details.style.visibility = 'hidden';

    const width = Math.min(details.offsetWidth || 300, 320);
    const height = details.offsetHeight || 220;

    // 选择上下位置
    const spaceBelow = viewportHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    let top;
    if (spaceBelow >= height || spaceBelow >= spaceAbove) {
      top = rect.bottom + 8; // 放在下方
    } else {
      top = rect.top - height - 8; // 放在上方
    }

    // 水平位置：尽量与元素左对齐并避免越界
    let left = rect.left;
    if (left + width + 10 > viewportWidth) {
      left = viewportWidth - width - 10;
    }
    if (left < 10) left = 10;

    // 应用位置
    details.style.left = `${Math.max(10, Math.min(left, viewportWidth - width - 10))}px`;
    details.style.top = `${Math.max(10, Math.min(top, viewportHeight - 10))}px`;

    // 还原可见性
    details.style.visibility = prevVis || 'visible';
    details.style.display = prevDisplay || 'block';
  }

  // 滚动/缩放时，若有弹层，保持跟随
  const repositionActiveDetails = () => {
    if (activeTokenDetails && activeTokenDetails.details && activeTokenDetails.element) {
      positionTokenDetails(activeTokenDetails.element, activeTokenDetails.details);
    }
  };
  window.addEventListener('scroll', repositionActiveDetails, { passive: true });
  window.addEventListener('resize', repositionActiveDetails, { passive: true });
  if (content) {
    content.addEventListener('scroll', repositionActiveDetails, { passive: true });
  }

  function t(key) {
    const dict = I18N[currentLang] || I18N.ja;
    return dict[key] || key;
  }

  function formatMessage(key, params = {}) {
    const template = String(t(key) || key);
    return template.replace(/\{([^}]+)\}/g, (_, token) => {
      const trimmed = token.trim();
      return Object.prototype.hasOwnProperty.call(params, trimmed) ? String(params[trimmed]) : '';
    });
  }

  function clearReadingLineHighlight() {
    if (!activeReadingLine) return;
    const previous = activeReadingLine;
    activeReadingLine = null;
    previous.classList.remove('reading-line-active');
    previous.removeAttribute('aria-current');
    if (previous.hasAttribute('aria-pressed')) {
      previous.setAttribute('aria-pressed', 'false');
    }
  }

  function setPwaIcon(kind) {
    if (!pwaToastIcon) return;
    const icons = {
      download: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 18h16" /></svg>',
      success: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>',
      error: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6" /><path d="M15 9l-6 6" /></svg>'
    };
    pwaToastIcon.innerHTML = icons[kind] || icons.download;
  }

  // 格式化失败文件的简要列表（最多 N 个）
  function formatFailedAssetsSummary(max = 3) {
    const list = Array.isArray(PWA_STATE.failedAssets) ? PWA_STATE.failedAssets : [];
    if (!list.length) return '';
    
    // 在控制台打印所有失败的文件
    console.group('[PWA] 缓存失败的文件列表:');
    list.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    console.groupEnd();
    
    const labels = list.slice(0, max).map((url) => {
      try {
        const u = new URL(url, window.location.href);
        return u.origin === window.location.origin ? u.pathname : url;
      } catch (_) {
        return url;
      }
    });
    const more = list.length > max ? ` (+${list.length - max} more)` : '';
    return `失败文件: ${labels.join(', ')}${more}`;
  }

  function updatePwaToast(state, { title, message, progress, icon } = {}) {
    if (!pwaToast) return;
    if (PWA_STATE.hideTimer) {
      clearTimeout(PWA_STATE.hideTimer);
      PWA_STATE.hideTimer = null;
    }

    if (icon) setPwaIcon(icon);

    if (title && pwaToastTitle) {
      pwaToastTitle.textContent = title;
    }
    if (message && pwaToastMessage) {
      pwaToastMessage.textContent = message;
    }

    if (pwaToastProgress) {
      if (typeof progress === 'number' && !Number.isNaN(progress)) {
        const safe = Math.max(0, Math.min(1, progress));
        pwaToastProgress.style.display = 'block';
        pwaToastProgress.setAttribute('aria-valuenow', String(Math.round(safe * 100)));
        if (pwaToastBar) {
          pwaToastBar.style.width = `${Math.round(safe * 100)}%`;
        }
      } else {
        pwaToastProgress.style.display = 'none';
        if (pwaToastBar) {
          pwaToastBar.style.width = '0%';
        }
      }
    }

    pwaToast.classList.remove('is-success', 'is-error');
    if (state === 'success') {
      pwaToast.classList.add('is-success');
    } else if (state === 'error') {
      pwaToast.classList.add('is-error');
    }

    pwaToast.removeAttribute('hidden');
    requestAnimationFrame(() => {
      pwaToast.classList.add('is-visible');
    });
  }

  function hidePwaToast(delay = 0) {
    if (!pwaToast) return;
    if (delay) {
      if (PWA_STATE.hideTimer) clearTimeout(PWA_STATE.hideTimer);
      PWA_STATE.hideTimer = setTimeout(() => hidePwaToast(0), delay);
      return;
    }
    pwaToast.classList.remove('is-visible');
    PWA_STATE.hideTimer = setTimeout(() => {
      pwaToast.setAttribute('hidden', 'hidden');
      pwaToast.classList.remove('is-success', 'is-error');
      if (pwaToastBar) pwaToastBar.style.width = '0%';
      PWA_STATE.hideTimer = null;
    }, 320);
  }

  // 简易延时工具：用于让提示停留 1s
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 清理本地浏览器临时缓存：仅清除 sessionStorage，保留文档与设置（localStorage）
  function clearLocalAppCache() {
    try { sessionStorage.clear(); } catch (_) {}
  }

  function handleServiceWorkerMessage(event) {
    const data = event.data;
    if (!data) return;

    if (data.type === 'PWA_RESET_DONE' || data.type === 'PWA_RESET_FAILED') {
      const resolver = data.requestId ? swResetResolvers.get(data.requestId) : null;
      if (resolver) {
        if (data.type === 'PWA_RESET_DONE') {
          resolver.resolve();
        } else {
          resolver.reject(new Error(data.message || 'reset failed'));
        }
      } else if (data.type === 'PWA_RESET_FAILED') {
        console.warn('[PWA] Reset failed without resolver', data.message);
      }
      return;
    }

    if (data.requestId && data.requestId !== PWA_STATE.requestId) {
      return;
    }

    if (data.type === 'CACHE_PROGRESS') {
      if (data.status === 'cached') {
        // 在页面控制台打印当前已缓存的文件
        if (data.asset) {
          console.log('[PWA] Cached', `${data.completed || '?'} / ${PWA_STATE.total || '?'}:`, data.asset);
        }
        PWA_STATE.completed = data.completed || PWA_STATE.completed;
        const percentValue = PWA_STATE.total ? Math.round((PWA_STATE.completed / PWA_STATE.total) * 100) : 0;
        const progressValue = PWA_STATE.total ? PWA_STATE.completed / PWA_STATE.total : 0;
        updatePwaToast('progress', {
          title: formatMessage('pwaTitle'),
          message: formatMessage('pwaProgress', { completed: PWA_STATE.completed, total: PWA_STATE.total, percent: percentValue }),
          progress: progressValue,
          icon: 'download'
        });
      } else if (data.status === 'error') {
        // 在页面控制台打印失败的文件名
        if (data.asset) {
          console.warn('[PWA] Failed to cache:', data.asset, '|', data.message || '');
        }
        PWA_STATE.failed += 1;
        PWA_STATE.lastError = data.message || '';
        if (data.asset) {
          const exists = PWA_STATE.failedAssets.includes(data.asset);
          if (!exists) PWA_STATE.failedAssets.push(data.asset);
        }
        const percentValue = PWA_STATE.total ? Math.round((PWA_STATE.completed / PWA_STATE.total) * 100) : 0;
        const progressValue = PWA_STATE.total ? PWA_STATE.completed / PWA_STATE.total : 0;
        const details = formatFailedAssetsSummary(3);
        const progressMsg = formatMessage('pwaProgress', { completed: PWA_STATE.completed, total: PWA_STATE.total, percent: percentValue });
        const errorMsg = formatMessage('pwaError', { message: PWA_STATE.lastError });
        const combined = details ? `${progressMsg}\n\n${errorMsg}\n${details}` : `${progressMsg} · ${errorMsg}`;
        updatePwaToast('progress', {
          title: formatMessage('pwaTitle'),
          message: combined,
          progress: progressValue,
          icon: 'error'
        });
      }
    }

    if (data.type === 'CACHE_COMPLETE') {
      PWA_STATE.installing = false;
      PWA_STATE.requestId = null;
      toggleHeaderDownloadSpinner(false);
      const progressValue = data.total ? data.completed / data.total : 1;

      if (PWA_STATE.failed > 0) {
        // 在控制台打印详细的失败信息
        console.group('[PWA] 缓存完成 - 失败统计:');
        console.log(`总文件数: ${PWA_STATE.total}`);
        console.log(`成功缓存: ${PWA_STATE.completed}`);
        console.log(`失败文件: ${PWA_STATE.failed}`);
        console.log(`最后错误: ${PWA_STATE.lastError}`);
        console.groupEnd();
        
        const details = formatFailedAssetsSummary(3);
        const baseMsg = formatMessage('pwaPartial', { failed: PWA_STATE.failed });
        const message = details ? `${baseMsg}\n\n${details}` : baseMsg;
        updatePwaToast('error', {
          title: formatMessage('pwaTitle'),
          message,
          progress: progressValue,
          icon: 'error'
        });
      } else {
        updatePwaToast('success', {
          title: formatMessage('pwaTitle'),
          message: formatMessage('pwaComplete'),
          progress: progressValue,
          icon: 'success'
        });
        hidePwaToast(5000);
      }
      PWA_STATE.failed = 0;
      PWA_STATE.failedAssets = [];
      PWA_STATE.lastError = '';
    }
  }

  // 下载按钮：加载时替换为圆形指示器，完成后还原
  function toggleHeaderDownloadSpinner(active) {
    if (!headerDownloadBtn) return;
    const svg = headerDownloadBtn.querySelector('svg');
    if (!svg) return;
    if (active) {
      if (!headerDownloadBtn.dataset.originalSvg) {
        headerDownloadBtn.dataset.originalSvg = svg.innerHTML;
      }
      // 用圆形加载指示器替换当前图标（旋转由 CSS 控制）
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '18');
      svg.setAttribute('height', '18');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('fill', 'none');
      // 空心粗圆环（带缺口），通过 dasharray 形成转动感
      svg.innerHTML = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="36 24"></circle>';
      headerDownloadBtn.classList.add('is-loading', 'is-rotating');
      headerDownloadBtn.setAttribute('aria-busy', 'true');
    } else {
      headerDownloadBtn.classList.remove('is-loading', 'is-rotating');
      headerDownloadBtn.removeAttribute('aria-busy');
      if (headerDownloadBtn.dataset.originalSvg && svg) {
        svg.innerHTML = headerDownloadBtn.dataset.originalSvg;
      }
    }
  }

  async function startPwaDownload(event) {
    if (event) event.preventDefault();

    if (!('serviceWorker' in navigator) || !(window && 'caches' in window)) {
      updatePwaToast('error', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaUnsupported'),
        icon: 'error'
      });
      return;
    }

    if (navigator && 'onLine' in navigator && !navigator.onLine) {
      updatePwaToast('error', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaOffline'),
        icon: 'error'
      });
      return;
    }

    if (PWA_STATE.installing) {
      const progressValue = PWA_STATE.total ? PWA_STATE.completed / PWA_STATE.total : 0;
      updatePwaToast('progress', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaAlreadyCaching'),
        progress: progressValue,
        icon: 'download'
      });
      return;
    }

    PWA_STATE.installing = true;
    PWA_STATE.failed = 0;
    PWA_STATE.lastError = '';
    PWA_STATE.total = 0;
    PWA_STATE.completed = 0;
    PWA_STATE.failedAssets = [];
    PWA_STATE.requestId = null;
    toggleHeaderDownloadSpinner(true);

    // 第一步：清除本地浏览器缓存并提示
    try {
      clearLocalAppCache();
      updatePwaToast('success', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('localCacheCleared'),
        icon: 'success'
      });
      // 让提示停留 1 秒
      await sleep(1000);
    } catch (_) {}

    // 第二步（准备提示）：清除 PWA 离线缓存
    updatePwaToast('progress', {
      title: formatMessage('pwaTitle'),
      message: formatMessage('pwaResetting'),
      progress: null,
      icon: 'download'
    });

    let controller; 
    let registration;
    try {
      registration = await navigator.serviceWorker.register('./service-worker.js');
      PWA_STATE.registration = registration;
      const ready = await navigator.serviceWorker.ready;
      controller = navigator.serviceWorker.controller || ready.active || registration.active;
      if (!controller) {
        throw new Error('no-controller');
      }

      if (!pwaListenerAttached) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        pwaListenerAttached = true;
      }

      await requestServiceWorkerReset(controller);
    } catch (error) {
      console.error('PWA reset failed', error);
      PWA_STATE.installing = false;
      toggleHeaderDownloadSpinner(false);
      updatePwaToast('error', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaResetFailed', { message: error?.message || 'unknown' }),
        progress: 0,
        icon: 'error'
      });
      return;
    }

    // 第二步完成：提示已清除离线缓存
    updatePwaToast('success', {
      title: formatMessage('pwaTitle'),
      message: formatMessage('pwaCacheCleared'),
      progress: null,
      icon: 'success'
    });
    // 让提示停留 1 秒
    await sleep(1000);

    updatePwaToast('progress', {
      title: formatMessage('pwaTitle'),
      message: formatMessage('pwaPreparing'),
      progress: 0,
      icon: 'download'
    });

    try {
      const manifestResponse = await fetch(PWA_MANIFEST_URL, { cache: 'no-store' });
      if (!manifestResponse.ok) {
        throw new Error(`manifest ${manifestResponse.status}`);
      }
      const manifest = await manifestResponse.json();
      const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
      if (!assets.length) {
        throw new Error('no-assets');
      }

      const normalizedAssets = assets.map((asset) => {
        if (typeof asset !== 'string') return '';
        if (/^https?:/i.test(asset)) return asset;
        return asset.startsWith('.') || asset.startsWith('/') ? asset : `./${asset}`;
      }).filter(Boolean);

      PWA_STATE.total = normalizedAssets.length;

      PWA_STATE.requestId = createRequestId('pwa');
      controller.postMessage({
        type: 'CACHE_ASSETS',
        assets: normalizedAssets,
        requestId: PWA_STATE.requestId
      });

      updatePwaToast('progress', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaProgress', { completed: 0, total: PWA_STATE.total, percent: 0 }),
        progress: 0,
        icon: 'download'
      });
    } catch (error) {
      console.error('PWA cache failed', error);
      PWA_STATE.installing = false;
      PWA_STATE.requestId = null;
      toggleHeaderDownloadSpinner(false);
      updatePwaToast('error', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaError', { message: error?.message || 'unknown' }),
        progress: 0,
        icon: 'error'
      });
    }
  }

  function setupPwaInstaller() {
    const triggers = [headerDownloadBtn, document.getElementById('pwaInstallBtn')].filter(Boolean);
    if (!triggers.length) return;

    if (pwaToastClose) {
      pwaToastClose.addEventListener('click', () => hidePwaToast(0));
    }

    if (!('serviceWorker' in navigator) || !(window && 'caches' in window)) {
      triggers.forEach(btn => btn.addEventListener('click', (event) => {
        event.preventDefault();
        updatePwaToast('error', {
          title: formatMessage('pwaTitle'),
          message: formatMessage('pwaUnsupported'),
          icon: 'error'
        });
      }));
      return;
    }

    triggers.forEach(btn => btn.addEventListener('click', startPwaDownload));
  }

  function syncReadingLineAttributes(enabled) {
    if (!content) return;
    const lines = content.querySelectorAll('.line-container');
    lines.forEach((line) => {
      if (enabled) {
        line.setAttribute('tabindex', '0');
        line.setAttribute('role', 'button');
        const isActive = line.classList.contains('reading-line-active');
        line.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        if (isActive) {
          line.setAttribute('aria-current', 'true');
        } else {
          line.removeAttribute('aria-current');
        }
      } else {
        line.setAttribute('tabindex', '-1');
        if (line.getAttribute('role') === 'button') {
          line.removeAttribute('role');
        }
        line.removeAttribute('aria-pressed');
        line.removeAttribute('aria-current');
      }
    });
  }

  function setReadingLineActive(line) {
    if (!line) return;
    if (!isReadingMode) return;
    if (activeReadingLine === line) {
      clearReadingLineHighlight();
      syncReadingLineAttributes(true);
      return;
    }

    clearReadingLineHighlight();
    activeReadingLine = line;
    line.classList.add('reading-line-active');
    line.setAttribute('aria-pressed', 'true');
    line.setAttribute('aria-current', 'true');
    syncReadingLineAttributes(true);
  }

  function updateReadingToggleLabels() {
    const enterLabel = t('readingToggleEnter') || '阅读模式';
    const exitLabel = t('readingToggleExit') || '退出阅读';
    const enterTooltip = t('readingToggleTooltipEnter') || enterLabel;
    const exitTooltip = t('readingToggleTooltipExit') || exitLabel;
    const label = isReadingMode ? exitLabel : enterLabel;
    const tooltip = isReadingMode ? exitTooltip : enterTooltip;

    [readingModeToggle, editorReadingToggle].forEach((btn) => {
      if (!btn) return;
      btn.title = tooltip;
      btn.setAttribute('aria-label', tooltip);
      btn.setAttribute('aria-pressed', String(isReadingMode));
      btn.classList.toggle('is-active', isReadingMode);
    });
  }

  function setReadingMode(enabled, options = {}) {
    if (!document.body) return;
    const shouldEnable = Boolean(enabled);
    const updateUrl = options.updateUrl !== false;

    const sameState = shouldEnable === isReadingMode;
    if (sameState && !options.force) {
      if (updateUrl) {
        try {
          const url = new URL(window.location.href);
          if (shouldEnable) {
            url.searchParams.set('read', '1');
          } else {
            url.searchParams.delete('read');
          }
          window.history.replaceState({}, '', url);
        } catch (_) {}
      }
      return;
    }
    // 进入/退出按钮动画
    if (readingModeToggle) {
      if (shouldEnable) {
        readingModeToggle.classList.add('click-animation');
        setTimeout(() => readingModeToggle.classList.remove('click-animation'), 150);
      } else if (isReadingMode) {
        readingModeToggle.classList.add('exit-animation');
        setTimeout(() => readingModeToggle.classList.remove('exit-animation'), 300);
      }
    }

    isReadingMode = shouldEnable;

    const updateButtons = () => {
      [readingModeToggle, editorReadingToggle].forEach((btn) => {
        if (!btn) return;
        btn.classList.toggle('is-active', shouldEnable);
        btn.setAttribute('aria-pressed', String(shouldEnable));
      });
      updateReadingToggleLabels();
    };

    const createOverlay = () => {
      // 清理旧浮层
      const existing = document.getElementById('readingOverlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.className = 'reading-overlay';
      overlay.id = 'readingOverlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', t('readingToggleEnter') || '阅读模式');

      const backdrop = document.createElement('div');
      backdrop.className = 'overlay-backdrop';
      const contentWrap = document.createElement('div');
      contentWrap.className = 'overlay-content';

      const toolbar = document.createElement('div');
      toolbar.className = 'overlay-toolbar';
      const closeBtn = document.createElement('button');
      closeBtn.className = 'overlay-close';
      closeBtn.type = 'button';
      closeBtn.title = t('readingToggleExit') || '退出阅读';
      closeBtn.setAttribute('aria-label', closeBtn.title);
      closeBtn.innerHTML = '&times;';
      toolbar.appendChild(closeBtn);

      // 克隆右侧显示区内容
      try {
        const original = document.getElementById('content');
        if (original) {
          // 检查是否有日语分析内容（有 token-pill 或 analysis-section）
          const hasAnalysisContent = original.querySelector('.token-pill, .analysis-section, .line-container');
          
          if (hasAnalysisContent) {
            // 有日语分析内容，直接克隆
            contentWrap.innerHTML = original.innerHTML;
          } else {
            // 没有分析内容，可能是纯文本或 Markdown
            // 尝试获取原始输入文本
            const inputText = textInput ? textInput.value : '';
            
            if (inputText && inputText.trim()) {
              // 检测是否包含 Markdown 语法
              const hasMarkdown = /[#*_\[\]`]/.test(inputText) || 
                                  /^[-*+]\s/m.test(inputText) || 
                                  /^\d+\.\s/m.test(inputText) ||
                                  /^>\s/m.test(inputText);
              
              if (hasMarkdown && typeof marked !== 'undefined') {
                // 使用 marked 渲染 Markdown
                try {
                  const renderedHtml = marked.parse(inputText);
                  contentWrap.innerHTML = renderedHtml;
                  contentWrap.classList.add('markdown-content');
                } catch (e) {
                  console.warn('Markdown 渲染失败:', e);
                  contentWrap.innerHTML = original.innerHTML || '<p class="empty-state">暂无内容</p>';
                }
              } else {
                // 纯文本，保留换行
                const formattedText = inputText.split('\n').map(line => 
                  `<p>${line || '<br>'}</p>`
                ).join('');
                contentWrap.innerHTML = formattedText;
              }
            } else {
              // 如果没有输入文本，显示原始内容或空状态
              contentWrap.innerHTML = original.innerHTML || '<p class="empty-state">暂无内容</p>';
            }
          }
        }
      } catch (e) {
        console.error('创建阅读浮层内容失败:', e);
      }

      overlay.appendChild(backdrop);
      overlay.appendChild(contentWrap);
      overlay.appendChild(toolbar);
      document.body.appendChild(overlay);

      const dismiss = () => setReadingMode(false);
      backdrop.addEventListener('click', dismiss);
      closeBtn.addEventListener('click', dismiss);

      // 绑定浮层内的阅读交互
      bindReadingOverlayInteractions(contentWrap);
    };

    const removeOverlay = () => {
      try {
        const overlay = document.getElementById('readingOverlay');
        if (overlay) overlay.remove();
      } catch (_) {}
      clearReadingLineHighlight();
    };

    // 使用 requestAnimationFrame 确保动画流畅
    requestAnimationFrame(() => {
      if (shouldEnable) {
        createOverlay();
      } else {
        removeOverlay();
      }
      updateButtons();
      syncReadingLineAttributes(shouldEnable);
    });

    if (updateUrl) {
      try {
        const url = new URL(window.location.href);
        if (shouldEnable) {
          url.searchParams.set('read', '1');
        } else {
          url.searchParams.delete('read');
        }
        window.history.replaceState({}, '', url);
      } catch (_) {}
    }
  }

  // 浮层中的阅读交互：点击/键盘触发高亮；ESC 关闭
  function bindReadingOverlayInteractions(container) {
    if (!container) return;
    container.addEventListener('click', (event) => {
      if (!isReadingMode) return;
      const line = event.target.closest('.line-container');
      if (!line) return;
      setReadingLineActive(line);
    });
    container.addEventListener('keydown', (event) => {
      if (!isReadingMode) return;
      const line = event.target.closest('.line-container');
      if (!line) return;
      if ((event.key === 'Enter' || event.key === ' ') && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setReadingLineActive(line);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setReadingMode(false);
      }
    });
  }

  // 播放全文按钮的动态文案
  function playAllLabel(playing) {
    switch (currentLang) {
      case 'ja':
        return playing ? '停止' : '全文再生';
      case 'en':
        return playing ? 'Stop' : 'Play All';
      case 'zh':
      default:
        return playing ? '停止' : '播放全文';
    }
  }

  function applyI18n() {
    document.documentElement.lang = currentLang;
    document.title = t('title');

    // 通用的 data-i18n 属性处理
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key && I18N[currentLang] && I18N[currentLang][key]) {
        element.textContent = I18N[currentLang][key];
      }
    });

    if (textInput) {
      const placeholderText = t('textareaPlaceholder');
      textInput.placeholder = placeholderText;
      if (easymde && easymde.codemirror && typeof easymde.codemirror.setOption === 'function') {
        easymde.codemirror.setOption('placeholder', placeholderText);
      }
    }

    try { renderFolderFilters(); } catch (_) {}

    const emptyTextEl = $('emptyText');
    if (emptyTextEl) emptyTextEl.textContent = t('emptyText');

    // 设置弹窗内动态生成的控件文案
    try { if (typeof updateSettingsModalTexts === 'function') updateSettingsModalTexts(); } catch (_) {}

    // 语言变化时刷新主题与阅读模式标签
    updateReadingToggleLabels();
    applyTheme(savedThemePreference);
  }

  // 刷新已打开的词汇详情卡片文本
  function refreshOpenCardTexts() {
    // 查找所有当前显示的词汇详情卡片
    const openDetails = document.querySelectorAll('.token-details[style*="display: block"], .token-details[style*="display:block"]');
    
    openDetails.forEach(details => {
      // 弹层可能已被移动到 body（定位所需），通过归属引用找回 token
      const tokenPill = details.closest('.token-pill') || details.__ownerTokenElement || null;
      if (tokenPill) {
        try {
          // 获取词汇数据
          const tokenData = JSON.parse(tokenPill.getAttribute('data-token'));

          // 重新解析词性信息（F-P0-01 修复：旧代码调用不存在的 parsePos/formatDetailInfo，语言切换时必然抛错）
          const posArr = Array.isArray(tokenData.pos) ? tokenData.pos : [tokenData.pos || ''];
          const posInfo = (window.FudokiDict && window.FudokiDict.parsePartOfSpeech)
            ? window.FudokiDict.parsePartOfSpeech(posArr)
            : { main: '未知', details: [], original: posArr };

          // 重新格式化详情内容（保留播放按钮）
          const newContent = (window.FudokiDict && window.FudokiDict.formatDetailInfo)
            ? window.FudokiDict.formatDetailInfo(tokenData, posInfo, I18N[currentLang] || {})
            : '';
          const playBtn = details.querySelector('.play-token-btn');
          details.innerHTML = newContent;
          if (playBtn) details.appendChild(playBtn);

          // 重新加载翻译信息
          loadTranslation(tokenPill);
        } catch (e) {
          console.warn('Failed to refresh token details:', e);
        }
      }
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      currentLang = langSelect.value || 'ja';
      try { localStorage.setItem(LS.lang, currentLang); } catch (e) {}
      if (sidebarLangSelect) sidebarLangSelect.value = currentLang;
      // 导航国旗状态同步
      applyI18n();
      refreshOpenCardTexts();
    });
  }

  if (sidebarLangSelect) {
    sidebarLangSelect.addEventListener('change', () => {
      currentLang = sidebarLangSelect.value || 'ja';
      try { localStorage.setItem(LS.lang, currentLang); } catch (e) {}
      if (langSelect) langSelect.value = currentLang;
      applyI18n();
      refreshOpenCardTexts();
    });
  }

  // 导航国旗点击切换语言
  function setLanguage(lang) {
    if (!lang || (lang !== 'ja' && lang !== 'en' && lang !== 'zh')) return;
    currentLang = lang;
    try { localStorage.setItem(LS.lang, currentLang); } catch (e) {}
    if (langFdSelect) langFdSelect.setValue(currentLang);
    applyI18n();
    updateSettingsModalTexts();
    renderFolderFilters();
    refreshOpenCardTexts();
  }

  // 暴露语言相关函数和变量到全局，供子菜单使用
  window.applyI18n = applyI18n;
  window.getCurrentLang = () => currentLang;
  window.setCurrentLang = (lang) => {
    if (lang === 'ja' || lang === 'en' || lang === 'zh') {
      currentLang = lang;
    }
  };

  // 将所有设置项的标签文本同步为当前语言
  function updateSettingsLabels() {
    // 设置弹窗内容以 data-i18n 构建，由 applyI18n 统一刷新；此处保留空实现以兼容旧调用点
  }


  // 主题切换
  // 主题：深色优先，浅色为辅（旧版多主题值迁移归一到 dark/light）
  const THEME = { DARK: 'dark', LIGHT: 'light' };
  const LEGACY_LIGHT_THEMES = ['paper', 'sakura', 'sticky', 'green', 'blue'];

  function normalizeThemeValue(value) {
    if (value === THEME.DARK || value === THEME.LIGHT) return value;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (value === 'auto') return prefersDark ? THEME.DARK : THEME.LIGHT;
    if (value && LEGACY_LIGHT_THEMES.includes(value)) return THEME.LIGHT;
    return prefersDark ? THEME.DARK : THEME.LIGHT;
  }

  let savedThemePreference = normalizeThemeValue(localStorage.getItem(LS.theme));
  // 设置弹窗中的主题 FDSelect 句柄（mountSettingsModalContent 注入后赋值）
  let themeFdSelect = null;

  function resolveTheme(pref) {
    return pref === THEME.DARK ? THEME.DARK : THEME.LIGHT;
  }

  function syncThemeSelects(pref) {
    if (themeFdSelect) themeFdSelect.setValue(pref);
  }

  function applyTheme(pref) {
    const resolved = resolveTheme(pref);
    document.documentElement.setAttribute('data-theme', resolved);
    syncThemeSelects(pref);

    if (themeToggleBtn) {
      const label = resolved === THEME.DARK ? labelSwitchToLight() : labelSwitchToDark();
      themeToggleBtn.setAttribute('aria-label', label);
      themeToggleBtn.title = label;
    }
  }

  function setThemePreference(pref) {
    savedThemePreference = pref === THEME.DARK ? THEME.DARK : THEME.LIGHT;
    try { localStorage.setItem(LS.theme, savedThemePreference); } catch (e) {}
    applyTheme(savedThemePreference);
  }

  applyTheme(savedThemePreference);

  // 顶部主题按钮：深浅快速切换
  function labelSwitchToDark() {
    switch (currentLang) {
      case 'ja': return 'ダークモードに切り替え';
      case 'en': return 'Switch to Dark Theme';
      default: return '切换到暗色主题';
    }
  }
  function labelSwitchToLight() {
    switch (currentLang) {
      case 'ja': return 'ライトモードに切り替え';
      case 'en': return 'Switch to Light Theme';
      default: return '切换到浅色主题';
    }
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      setThemePreference(resolveTheme(savedThemePreference) === THEME.DARK ? THEME.LIGHT : THEME.DARK);
    });
  }

  // 点击页面其他地方隐藏详细信息（允许在详情面板内操作）
  document.addEventListener('click', function(event) {
    const inPill = event.target.closest && event.target.closest('.token-pill');
    const inDetails = event.target.closest && event.target.closest('.token-details');
    if (inPill || inDetails) return;
    document.querySelectorAll('.token-details').forEach(d => {
      d.style.display = 'none';
    });
    document.querySelectorAll('.token-pill').forEach(p => {
      p.classList.remove('active');
    });
    // F-P0-01：同步清除活动弹层引用，否则下次点击同一 token 会被误判为"关闭"而无响应
    activeTokenDetails = null;
  });

  // 默认文档配置
  const DEFAULT_DOC_ID = 'default-01';
  const DEFAULT_DOC_TITLE = '外来語がつくる新しい日本語';
  const DEFAULT_CONTENT = `Fudoki（フドキ）は、日本語テキストを簡単に分析できるWebアプリです。

日本語の文章を入力すると、AIが自動的に分かち書き（Tokenization）や品詞（Part of Speech, POS）を判別し、各単語のカタカナ・ローマ字（Romaji）も表示します。

さらに、Speech Synthesis APIを使って、ワンクリックでネイティブ風の音声再生も可能！

「Play All」ボタンで全文を一気に聴くこともできます。

UIはシンプルで、ダークモード（Dark Mode）やカスタムスピード（Speed Control）などのSettingsも充実。

日本語学習者やNLPエンジニア、そして好奇心旺盛な皆さんに最適なツールです。

Try Fudoki and enjoy Japanese language analysis!`;


  // 初始化日语分词器
  let segmenter = null;
  
  async function initSegmenter() {
    if (!segmenter) {
      segmenter = new JapaneseSegmenter();
      await segmenter.init();
    }
    return segmenter;
  }

  // 语音合成相关
  let voices = [];
  let currentVoice = null;
  let rate = parseFloat(localStorage.getItem(LS.rate)) || 1;// 播放状态跟踪// 全局变量
  // 同步到全局，确保 tts.js 能读取最新速率
  if (typeof window !== 'undefined') {
    window.rate = rate;
  }
  let volume = (() => { const v = parseFloat(localStorage.getItem(LS.volume)); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1; })();
  let isPlaying = false;
  let isPaused = false;
  let currentUtterance = null;
  let currentPlayingText = null; // 用于重复播放
  let currentHighlightedToken = null; // 当前高亮的词汇元素
  let highlightTimeout = null; // 高亮定时器存储当前播放的文本用于重复播放
  let progressTimer = null; // 顶部进度条的计时器（TTS边界事件不可用时的回退）
  // 播放状态：按字符总量线性推进
  let PLAY_STATE = { totalSegments: 0, totalChars: 0, charPrefix: [], current: 0 };
  let usingBoundaryProgress = false;
  // 追加：当前段落与边界信息，用于在播放中实时调整音量并续播
  let currentSegments = null;            // 当前播放的分段数组
  let currentSegmentText = '';           // 当前播放段落文本
  let currentSegmentIndex = 0;           // 当前播放段落索引
  let lastBoundaryCharIndex = 0;         // 最近一次边界事件的字符索引
  let segmentStartTs = 0;                // 当前段落开始时间（ms）
  let segmentEstimatedDuration = 0;      // 当前段落估算时长（秒）

  // 初始化速度滑块（元素可能不存在）
  if (speedSlider) speedSlider.value = String(rate);
  if (headerSpeedSlider) headerSpeedSlider.value = String(rate);
  const headerVolume = $('headerVolume');
  if (headerVolume) {
    headerVolume.value = String(volume);
    headerVolume.addEventListener('input', () => {
      const v = parseFloat(headerVolume.value);
      if (Number.isFinite(v)) {
        volume = Math.max(0, Math.min(1, v));
        try { localStorage.setItem(LS.volume, String(volume)); } catch (_) {}
        // 正在播放时：立即在当前位置以新音量续播
        if (isPlaying && currentUtterance) {
          try {
            // 计算当前位置（优先使用边界事件；否则基于时间估算）
            let idx = Math.max(0, Math.min(currentSegmentText.length, lastBoundaryCharIndex || 0));
            if (!idx && segmentStartTs && segmentEstimatedDuration && currentSegmentText) {
              const elapsed = (Date.now() - segmentStartTs) / 1000;
              const frac = Math.max(0, Math.min(1, elapsed / segmentEstimatedDuration));
              idx = Math.floor(currentSegmentText.length * frac);
            }
            // 为避免裁剪过紧，向前回退2字符
            idx = Math.max(0, idx - 2);
            restartCurrentSegmentAt(idx);
          } catch (_) {
            // 回退：如果续播失败，至少直接应用到当前utterance，下一段生效
            try { currentUtterance.volume = volume; } catch (_) {}
          }
        }
      }
    });
  }

  function setHeaderProgress(p) {
    const bar = $('headerPlayProgressFill');
    const track = $('headerPlayProgress');
    if (!bar || !track) return;
    const safe = Math.max(0, Math.min(1, Number(p) || 0));
    bar.style.width = `${Math.round(safe * 100)}%`;
    track.setAttribute('aria-valuenow', String(Math.round(safe * 100)));
  }

  function clearProgressTimer() {
    if (progressTimer) {
      try { clearInterval(progressTimer); } catch (_) {}
      progressTimer = null;
    }
  }

  function estimateSegmentDuration(text, rateVal) {
    const avgCharsPerSec = 8; // 经验值：每秒朗读约8个字符
    const len = Math.max(1, (text || '').length);
    const r = Math.max(0.5, Number(rateVal) || rate);
    const seconds = len / (avgCharsPerSec * r);
    return Math.max(0.6, Math.min(6, seconds)); // 设定合理上下限
  }

  // 取消当前语音并清理旧事件，避免取消后旧回调干扰新的播放
  function safeCancelCurrentUtterance() {
    try {
      if (currentUtterance) {
        try { currentUtterance.onend = null; } catch (_) {}
        try { currentUtterance.onerror = null; } catch (_) {}
        try { currentUtterance.onboundary = null; } catch (_) {}
      }
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  // 当音色或速度改变时，中断当前播放并从当前段落开始重新播放
  function restartPlaybackWithNewSettings() {
    if (!isPlaying || !currentUtterance || !currentSegments) return;
    try {
      // 停止当前播放
      safeCancelCurrentUtterance();
      clearProgressTimer();
      
      // 从当前段落开始重新播放
      const segmentIndex = currentSegmentIndex || 0;
      playSegments(currentSegments, segmentIndex, undefined);
    } catch (e) {
      console.error('Failed to restart playback with new settings:', e);
    }
  }

  // 在当前段落位置重启语音，应用最新音量
  function restartCurrentSegmentAt(charIndex) {
    if (!('speechSynthesis' in window)) return;
    if (!currentSegments || !currentSegmentText) return;
    const idx = Math.max(0, Math.min(currentSegmentText.length, Number(charIndex) || 0));
    const remaining = currentSegmentText.slice(idx);
    // 取消当前语音（并移除其事件回调）
    safeCancelCurrentUtterance();

    // 构建新 utterance 播放剩余文本
    const utterance = new SpeechSynthesisUtterance(remaining);
    currentUtterance = utterance;
    applyVoice(utterance);
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.pitch = 1.0;

    // 以偏移计算进度
    const len = Math.max(1, currentSegmentText.length);
    const baseOffset = Math.max(0, Math.min(1, idx / len));

    utterance.onstart = () => {
      if (utterance !== currentUtterance) return; // 忽略过期回调
      isPlaying = true;
      segmentStartTs = Date.now();
      segmentEstimatedDuration = estimateSegmentDuration(remaining, utterance.rate);
      clearProgressTimer();
    // 进度计时器，从基线偏移开始推进（按字符线性）
    progressTimer = setInterval(() => {
      const elapsed = (Date.now() - segmentStartTs) / 1000;
      const frac = Math.max(0, Math.min(1, elapsed / segmentEstimatedDuration));
        const passedChars = (PLAY_STATE.charPrefix[currentSegmentIndex] || 0) + idx + Math.round(frac * Math.max(1, remaining.length));
        if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, passedChars / PLAY_STATE.totalChars)));
      if (frac >= 1) clearProgressTimer();
    }, 80);
      updatePlayButtonStates();
    };

    utterance.onboundary = (event) => {
      if (utterance !== currentUtterance) return; // 忽略过期回调
      try {
        lastBoundaryCharIndex = idx + (typeof event.charIndex === 'number' ? event.charIndex : 0);
        clearProgressTimer();
        const segLenRemain = Math.max(1, remaining.length);
        const passedChars = (PLAY_STATE.charPrefix[currentSegmentIndex] || 0) + idx + Math.max(0, Math.min(segLenRemain, event.charIndex || 0));
        if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, passedChars / PLAY_STATE.totalChars)));
      } catch (_) {}
    };

    utterance.onend = () => {
      if (utterance !== currentUtterance) return; // 忽略过期回调
      clearProgressTimer();
      const next = currentSegmentIndex + 1;
      const nextChars = PLAY_STATE.charPrefix[next] || PLAY_STATE.totalChars;
      if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, nextChars / PLAY_STATE.totalChars)));
      setTimeout(() => {
        playSegments(currentSegments, next, undefined);
      }, 0);
    };

    utterance.onerror = (event) => {
      if (utterance !== currentUtterance) return; // 忽略过期回调
      clearProgressTimer();
      console.warn('Speech synthesis error during restart:', event);
      isPlaying = false;
      currentUtterance = null;
      setHeaderProgress(0);
      updatePlayButtonStates();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Failed to speak remaining segment:', e);
    }
  }

  // 罗马字转换（Hepburn）：支持拗音、促音、长音、ん的同化
  function getRomaji(kana) {
    if (!kana) return '';

    // 将片假名统一转为平假名，便于规则运算
    const toHiraganaLocal = (text) => {
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code >= 0x30A1 && code <= 0x30FA) { // Katakana
          out += String.fromCharCode(code - 0x60);
        } else {
          out += text[i];
        }
      }
      return out;
    };

    const macron = (v) => ({ a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' }[v] || v);

    // 基础映射（平假名）
    const base = {
      'あ':'a','い':'i','う':'u','え':'e','お':'o',
      'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
      'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
      'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
      'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
      'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
      'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
      'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
      'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
      'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
      'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
      'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
      'や':'ya','ゆ':'yu','よ':'yo',
      'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
      'わ':'wa','ゐ':'wi','ゑ':'we','を':'wo','ん':'n',
      'ゔ':'vu',
      // 小元音（常用于外来语拓展）：按基础元音处理
      'ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o'
    };

    // 拗音可组合的辅音簇
    const yoonCluster = {
      'き':'ky','ぎ':'gy','し':'sh','じ':'j','ち':'ch','ぢ':'j',
      'に':'ny','ひ':'hy','び':'by','ぴ':'py','み':'my','り':'ry','ゔ':'vy'
    };

    const text = toHiraganaLocal(kana);
    let romaji = '';
    let pendingSokuon = false; // 促音标记

    // 预取下一个音节的罗马字，用于处理「ん」同化
    const peekChunk = (s, idx) => {
      const ch = s[idx];
      if (!ch) return '';
      if (ch === 'っ') return ''; // 下一个若为促音，再往后看
      const next = s[idx + 1];
      if ((next === 'ゃ' || next === 'ゅ' || next === 'ょ') && yoonCluster[ch]) {
        const v = next === 'ゃ' ? 'a' : (next === 'ゅ' ? 'u' : 'o');
        return yoonCluster[ch] + v;
      }
      return base[ch] || '';
    };

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      // 促音：标记加倍下一音节首辅音
      if (ch === 'っ') { pendingSokuon = true; continue; }

      // 长音符号（通常来自片假名）：将前一元音加上长音符（macron）
      if (ch === 'ー') {
        const m = romaji.match(/[aeiou]$/i);
        if (m) romaji = romaji.slice(0, -1) + macron(m[0].toLowerCase());
        continue;
      }

      // ん 的同化规则
      if (ch === 'ん') {
        // 跳过连续促音，获取下一音节的起始字母
        let j = i + 1;
        while (text[j] === 'っ') j++;
        const nextChunk = peekChunk(text, j);
        const init = (nextChunk[0] || '').toLowerCase();
        if (/^[bmp]$/.test(init)) {
          romaji += 'm';
        } else if (/^[aeiouy]$/.test(init)) {
          romaji += "n'";
        } else {
          romaji += 'n';
        }
        continue;
      }

      // 拗音组合：X + (ゃ/ゅ/ょ)
      const next = text[i + 1];
      if ((next === 'ゃ' || next === 'ゅ' || next === 'ょ') && yoonCluster[ch]) {
        const v = next === 'ゃ' ? 'a' : (next === 'ゅ' ? 'u' : 'o');
        let chunk = yoonCluster[ch] + v; // 如 ky + a → kya, sh + u → shu
        if (pendingSokuon) {
          pendingSokuon = false;
          const fc = chunk[0];
          if (/^[bcdfghjklmnpqrstvwxyz]$/i.test(fc)) romaji += fc.toLowerCase();
        }
        romaji += chunk;
        i++; // 消耗拗音的第二字符
        continue;
      }

      // 常规音节
      let chunk = base[ch] || ch;
      if (pendingSokuon) {
        pendingSokuon = false;
        const fc = chunk[0] || '';
        if (/^[bcdfghjklmnpqrstvwxyz]$/i.test(fc)) romaji += fc.toLowerCase();
      }
      romaji += chunk;
    }

    return romaji;
  }

  // 读取当前读音脚本（默认片假名）
  function getReadingScript() {
    const v = localStorage.getItem(LS.readingScript);
    return (v === 'hiragana' || v === 'katakana') ? v : 'katakana';
  }

  // 片假名转平假名
  function toHiragana(text) {
    if (!text) return '';
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Katakana range to Hiragana by -0x60
      if (code >= 0x30A1 && code <= 0x30F6) {
        out += String.fromCharCode(code - 0x60);
      } else {
        out += text[i];
      }
    }
    return out;
  }

  // 平假名转片假名
  function toKatakana(text) {
    if (!text) return '';
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Hiragana range to Katakana by +0x60
      if (code >= 0x3041 && code <= 0x3096) {
        out += String.fromCharCode(code + 0x60);
      } else {
        out += text[i];
      }
    }
    return out;
  }

  function normalizeKanaByScript(text, script) {
    if (!text) return '';
    return script === 'hiragana' ? toHiragana(text) : toKatakana(text);
  }

  // 词典：技术术语覆盖与词性解析抽离至 static/js/dictionary.js（window.FudokiDict）

  // 读取“助词は→わ”开关（主弹窗、侧边栏或本地存储），默认开启
  function isHaParticleReadingEnabled() {
    try {
      const main = document.getElementById('haAsWa');
      if (main && typeof main.checked !== 'undefined') return !!main.checked;
      const sidebar = document.getElementById('sidebarHaAsWa');
      if (sidebar && typeof sidebar.checked !== 'undefined') return !!sidebar.checked;
    } catch (_) {}
    const v = localStorage.getItem(LS.haAsWa);
    return v === null ? true : v === 'true';
  }

  // 根据设置格式化读音：处理助词"は"并按脚本转换
  function formatReading(token, script) {
    const surface = token && token.surface ? token.surface : '';
    const posArr = Array.isArray(token && token.pos) ? token.pos : [token && token.pos || ''];
    const readingRaw = token && token.reading ? token.reading : '';
    const override = (window.FudokiDict && window.FudokiDict.getTechOverride) ? window.FudokiDict.getTechOverride(token) : null;
    if (override && override.reading) {
      const normalized = normalizeKanaByScript(override.reading, script);
      // 英文术语通常不显示与表层一致的假名；这里始终显示覆盖读音
      return normalized;
    }
    if (!readingRaw) return '';
    // 特例：助词"は"读作"わ/ワ"
    if (surface === 'は' && posArr[0] === '助詞' && isHaParticleReadingEnabled()) {
      return script === 'hiragana' ? 'わ' : 'ワ';
    }
    const normalized = normalizeKanaByScript(readingRaw, script);
    // 如果读音与表层一致，则不重复显示
    if (normalized === surface) return '';
    return normalized;
  }

  // 切换脚本时即时更新已渲染的读音
  function updateReadingScriptDisplay() {
    const script = getReadingScript();
    const pills = document.querySelectorAll('.token-pill');
    pills.forEach(el => {
      try {
        const raw = el.getAttribute('data-token') || '{}';
        const token = JSON.parse(raw.replace(/&apos;/g, "'"));
        const kanaEl = el.querySelector('.token-kana');
        if (kanaEl) kanaEl.textContent = formatReading(token, script);
      } catch (_) {}
    });
  }

  // 词性解析函数
  // parsePartOfSpeech 移至 FudokiDict

  // 格式化详细信息
  // formatDetailInfo 移至 FudokiDict
  if (headerSpeedValue) headerSpeedValue.textContent = `${rate.toFixed(1)}x`;
  if (headerSpeedSlider) {
    headerSpeedSlider.addEventListener('input', () => {
      rate = Math.min(2, Math.max(0.5, parseFloat(headerSpeedSlider.value) || 1));
      if (typeof window !== 'undefined') window.rate = rate;
      if (headerSpeedValue) headerSpeedValue.textContent = `${rate.toFixed(1)}x`;
      localStorage.setItem(LS.rate, String(rate));
      // 若正在播放：中断并以新速度重新播放当前段落
      restartPlaybackWithNewSettings();
    });
  }

  // 语音列表管理
  function listVoicesFiltered() { return (window.TTS && window.TTS.listVoicesFiltered) ? window.TTS.listVoicesFiltered() : []; }

  // 语音 FDSelect 句柄注册表（TTS 条 + 设置弹窗；由 shell 初始化与设置弹窗挂载时注册）
  const voiceFdSelects = [];

  function refreshVoices() {
    voices = listVoicesFiltered();

    if (!voices.length) {
      currentVoice = null;
      const none = [{ value: '', label: t('noJapaneseVoice'), disabled: true }];
      voiceFdSelects.forEach(h => h.setOptions(none, true));
      return;
    }

    const opts = voices.map((v, i) => ({
      value: v.voiceURI || v.name || String(i),
      label: `${v.name} — ${v.lang}`
    }));

    const pref = localStorage.getItem(LS.voiceURI);
    const kyoko = voices.find(v => /kyoko/i.test(v.name || '') && (v.lang || '').toLowerCase().startsWith('ja'));
    const chosen = voices.find(v => (v.voiceURI || v.name) === pref) || kyoko || voices.find(v => (v.lang || '').toLowerCase().startsWith('ja')) || voices[0];

    if (chosen) currentVoice = chosen;
    voiceFdSelects.forEach(h => {
      h.setOptions(opts, false);
      if (chosen) h.setValue(chosen.voiceURI || chosen.name);
    });
  }

  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }


  // 删除确认对话框已抽离至 static/js/ui-utils.js（window.showDeleteConfirm）

  // 文档管理类
  class DocumentManager {
    constructor() {
      this.storageKey = LS.texts;
      this.activeIdKey = LS.activeId;
      this.searchQuery = '';
      this.init();
    }

    init() {
      this.seedDefaultDocument();
      this.bindEvents();
      this.render();
      this.updateSortToggleLabel();
      this.loadActiveDocument();
    }

    // 生成唯一ID
    generateId() {
      return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // 获取所有文档
    getAllDocuments() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      } catch {
        return [];
      }
    }

    // 保存所有文档
    saveAllDocuments(docs) {
      localStorage.setItem(this.storageKey, JSON.stringify(docs || []));
    }

    // 获取活动文档ID
    getActiveId() {
      return localStorage.getItem(this.activeIdKey) || '';
    }

    // 设置活动文档ID
    setActiveId(id) {
      localStorage.setItem(this.activeIdKey, id || '');
      this.updateDeleteButtonState();
    }

    // 获取文档标题
    getDocumentTitle(content) {
      if (Array.isArray(content)) {
        const firstLine = content[0]?.trim() || '';
        return firstLine || '无标题文档';
      }
      const firstLine = (content || '').split('\n')[0]?.trim() || '';
      return firstLine || '无标题文档';
    }

    // 清理 Markdown 标记
    stripMarkdown(text) {
      if (!text) return '';
      
      return text
        // 移除标题标记 (# ## ### 等)
        .replace(/^#+\s+/gm, '')
        // 移除粗体/斜体标记
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // 移除删除线
        .replace(/~~(.*?)~~/g, '$1')
        // 移除代码块标记
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        // 移除链接，保留链接文本
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // 移除图片
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
        // 移除列表标记
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // 移除引用标记
        .replace(/^>\s+/gm, '')
        // 移除水平线
        .replace(/^[-*_]{3,}$/gm, '')
        // 清理多余空格
        .replace(/\s+/g, ' ')
        .trim();
    }

    // 截断标题
    truncateTitle(title, maxLength = 20) {
      // 先清理 Markdown 标记
      const cleanTitle = this.stripMarkdown(title);
      if (cleanTitle.length <= maxLength) return cleanTitle;
      return cleanTitle.slice(0, maxLength - 1) + '…';
    }

    // 格式化创建时间
    formatCreationTime(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }


    // 短时间格式（文档栏 meta）：今年 → MM-DD HH:mm；往年 → YYYY-MM-DD
    formatShortTime(timestamp) {
      const d = new Date(timestamp);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      const now = new Date();
      const md = `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return d.getFullYear() === now.getFullYear() ? md : `${d.getFullYear()}-${md.slice(0, 5)}`;
    }
    // 创建新文档
    createDocument(content = '') {
      const docs = this.getAllDocuments();
      const newDoc = {
        id: this.generateId(),
        content: content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        locked: false
      };
      
      docs.push(newDoc);
      this.saveAllDocuments(docs);
      this.setActiveId(newDoc.id);
      // 新建文档时清空右侧内容区，展示空状态
      try {
        if (typeof showEmptyState === 'function') {
          showEmptyState();
        } else if (typeof content !== 'undefined' && content) {
          content.innerHTML = '';
        }
      } catch (_) {
        if (typeof content !== 'undefined' && content) content.innerHTML = '';
      }
      this.render();
      this.loadActiveDocument();
      
      return newDoc;
    }

    // 删除文档
    deleteDocument(id, skipConfirm = false, targetElement = null) {
      const docs = this.getAllDocuments();
      const index = docs.findIndex(doc => doc.id === id);
      
      if (index === -1) return false;
      
      const doc = docs[index];
      if (doc.locked) {
        if (!skipConfirm) {
          showErrorToast(t('cannotDeleteDefault'));
        }
        return false;
      }

      if (!skipConfirm) {
        // 预先计算删除后的应激活文档：优先激活“上一个”文档；无上一个则激活“下一个”；都没有则清空
        const nextActiveId = (() => {
          if (index > 0) return docs[index - 1].id;           // 上一个
          if (docs.length > 1) return docs[1].id;             // 下一个（被删的是第一个）
          return '';
        })();

        showDeleteConfirm((t('confirmDelete') || '').replace('{title}', this.getDocumentTitle(doc.content)), 
          () => {
            docs.splice(index, 1);
            this.saveAllDocuments(docs);

            // 如果删除的是当前活动文档，切换到第一个文档
            if (id === this.getActiveId()) {
              if (nextActiveId) {
                this.setActiveId(nextActiveId);
              } else {
                this.setActiveId('');
              }
              this.loadActiveDocument();
            }

            this.render();
          },
          () => {
            // 取消删除
            return false;
          },
          targetElement // 传递目标元素用于定位确认对话框
        );
        return true;
      }

      // 如果是skipConfirm模式，直接删除
      if (skipConfirm) {
        const nextActiveId = (() => {
          if (index > 0) return docs[index - 1].id;
          if (docs.length > 1) return docs[1].id;
          return '';
        })();
        docs.splice(index, 1);
        this.saveAllDocuments(docs);

        // 如果删除的是当前活动文档，切换到第一个文档
        if (id === this.getActiveId()) {
          if (nextActiveId) {
            this.setActiveId(nextActiveId);
          } else {
            this.setActiveId('');
          }
          this.loadActiveDocument();
        }

        this.render();
      }
      return true;
    }

    // 切换文档
    switchToDocument(id) {
      const docs = this.getAllDocuments();
      const doc = docs.find(d => d.id === id);
      
      if (!doc) return false;

      // 保存当前文档内容
      this.saveCurrentDocument();
      
      // 如果目标文档有内容，批量删除所有空文档（不立即渲染）
      const contentText = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
      if (contentText.trim().length > 0) {
        this.deleteAllEmptyDocuments(false); // 传入 false 避免重复渲染
      }
      
      // 切换到新文档
      this.setActiveId(id);
      this.loadActiveDocument();
      
      // 统一渲染一次
      this.render();
      
      // 自动分析新文档
      if (window.analyzeText) {
        window.analyzeText();
      }
      
      return true;
    }

    // 保存当前文档（正常保存，不处理空文档删除）
    saveCurrentDocument() {
      const activeId = this.getActiveId();
      if (!activeId) return; // 没有活动文档则不保存

      const docs = this.getAllDocuments();
      const docIndex = docs.findIndex(d => d.id === activeId);
      if (docIndex === -1) return;

      const doc = docs[docIndex];
      
      // 如果是示例文档，创建一个新副本而不是修改原文档
      if (doc.folder === 'samples') {
        const newDoc = {
          id: this.generateId(),
          content: textInput.value,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          locked: false,
          folder: null, // 移除示例文件夹标记
          folderId: null,
          favorite: false
        };
        
        // 添加新文档
        docs.push(newDoc);
        this.saveAllDocuments(docs);
        
        // 切换到新文档
        this.setActiveId(newDoc.id);
        
        // 刷新列表和工具栏
        this.render();
        try { updateEditorToolbar(); } catch (_) {}
        
        // 显示提示（使用同步进度 toast）
        const syncToast = document.getElementById('syncProgressToast');
        const syncText = document.getElementById('syncProgressText');
        if (syncToast && syncText) {
          syncText.textContent = 'サンプル文書のコピーを作成しました';
          syncToast.classList.add('show');
          setTimeout(() => {
            syncToast.classList.remove('show');
          }, 2000);
        }
        
        return;
      }
      
      // 保存普通文档内容（包括空内容）
      doc.content = textInput.value;
      doc.updatedAt = Date.now();
      this.saveAllDocuments(docs);
      // 保存后刷新顶部工具栏的日期显示（改为显示最后保存时间）
      try { updateEditorToolbar(); } catch (_) {}
    }

    // 删除空文档（仅在失去焦点时调用）
    deleteEmptyDocument() {
      const activeId = this.getActiveId();
      if (!activeId) return;

      const docs = this.getAllDocuments();
      const docIndex = docs.findIndex(d => d.id === activeId);
      if (docIndex === -1) return;

      const isEmpty = textInput.value.trim().length === 0;

      if (isEmpty) {
        // 内容为空：从存储中移除该文档，避免产生空文档
        const removed = docs.splice(docIndex, 1);
        this.saveAllDocuments(docs);
        // 清除活动文档，刷新列表
        if (removed.length) {
          const firstDoc = docs[0];
          if (firstDoc) {
            this.setActiveId(firstDoc.id);
            this.loadActiveDocument();
          } else {
            this.setActiveId('');
            if (textInput) textInput.value = '';
          }
          this.render();
        }
      }
    }

    // 删除所有空文档（批量删除，只保存一次）
    deleteAllEmptyDocuments(shouldRender = true) {
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      
      // 找出所有空文档（排除锁定的文档）
      const emptyDocIds = docs
        .filter(doc => {
          if (doc.locked) return false;
          const contentText = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
          return contentText.trim().length === 0;
        })
        .map(doc => doc.id);
      
      if (emptyDocIds.length === 0) return false;
      
      // 一次性过滤掉所有空文档
      const filteredDocs = docs.filter(doc => !emptyDocIds.includes(doc.id));
      
      // 只保存一次到 localStorage
      this.saveAllDocuments(filteredDocs);
      
      // 如果当前活动文档被删除了，需要重新设置活动文档
      if (emptyDocIds.includes(activeId)) {
        if (filteredDocs.length > 0) {
          this.setActiveId(filteredDocs[0].id);
          this.loadActiveDocument();
        } else {
          this.setActiveId('');
          if (textInput) textInput.value = '';
        }
      }
      
      // 只渲染一次
      if (shouldRender) {
        this.render();
      }
      
      return true;
    }

    // 加载活动文档到编辑器
    loadActiveDocument() {
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      const doc = docs.find(d => d.id === activeId);
      
      if (doc) {
        if (Array.isArray(doc.content)) {
          textInput.value = doc.content.join('\n');
        } else {
          textInput.value = doc.content || '';
        }
      } else {
        textInput.value = '';
      }
      // 更新顶部工具栏显示
      try { updateEditorToolbar(); } catch (_) {}
    }

    // 排序偏好：读取、保存并更新按钮标签
    getSortAsc() {
      const v = localStorage.getItem(LS.sortAsc);
      return v === 'true';
    }
    setSortAsc(val) {
      localStorage.setItem(LS.sortAsc, String(!!val));
    }
    updateSortToggleLabel() {
      if (!docSortToggle) return;
      const asc = this.getSortAsc();
      const label = asc ? '並び替え：古→新' : '並び替え：新→古';
      // 仅更新无障碍与提示文本；图标通过类切换高亮
      docSortToggle.title = label;
      docSortToggle.setAttribute('aria-label', label);
      docSortToggle.classList.toggle('asc', asc);
      docSortToggle.classList.toggle('desc', !asc);
    }

    // 渲染文档列表
    // 渲染文档栏列表：标题 + 字数 + 时间；激活项靛紫左缘指示
    render() {
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      const activeFolder = getActiveFolderId();
      const queryLower = String(this.searchQuery || '').toLowerCase();

      if (!documentList) return;

      documentList.innerHTML = '';

      const filtered = docs.filter(doc => {
        if (activeFolder === 'favorites' && !doc.favorite) return false;
        if (activeFolder === 'all' && doc.folder === 'samples') return false;
        if (activeFolder === 'samples' && doc.folder !== 'samples') return false;
        if (queryLower) {
          const text = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
          const title = this.getDocumentTitle(doc.content);
          const combined = (title + '\n' + text).toLowerCase();
          if (!combined.includes(queryLower)) return false;
        }
        return true;
      });

      const asc = this.getSortAsc();
      filtered.sort((a, b) => {
        const ta = Number(a.createdAt) || 0;
        const tb = Number(b.createdAt) || 0;
        return asc ? (ta - tb) : (tb - ta);
      });

      filtered.forEach(doc => {
        const title = this.getDocumentTitle(doc.content);
        const contentText = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
        const charCount = contentText.replace(/\s/g, '').length;
        const isFav = !!doc.favorite;
        const cleanTitle = this.stripMarkdown(title);

        const docItem = document.createElement('div');
        docItem.className = 'doc-item' + (doc.id === activeId ? ' active' : '');
        docItem.dataset.docId = doc.id;
        docItem.innerHTML = `
          <div class="doc-item-main">
            <div class="doc-item-title" title="${escapeHtml(cleanTitle)}">${escapeHtml(this.truncateTitle(title, 24))}</div>
            <div class="doc-item-meta">
              <span class="doc-item-count">${charCount}</span>
              <span aria-hidden="true">·</span>
              <span>${this.formatShortTime(doc.updatedAt || doc.createdAt)}</span>
            </div>
          </div>
          <div class="doc-item-actions">
            <button type="button" class="doc-action-btn fav-btn ${isFav ? 'active' : ''}" title="${isFav ? t('unfavorite') : t('favorite')}" aria-label="${isFav ? t('unfavorite') : t('favorite')}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 17.3l6.2 3.7-1.6-7 5.4-4.7-7.2-.6L12 2 9.2 8.6 2 9.3l5.5 4.7-1.7 7z"/></svg>
            </button>
            <button type="button" class="doc-action-btn delete-btn" title="${t('deleteDoc')}" aria-label="${t('deleteDoc')}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-.9 10.1a2 2 0 0 1-2 1.9H8.9a2 2 0 0 1-2-1.9L6 9zm3.4 2.2v7.1h1.2v-7.1H9.4zm3.8 0v7.1h1.2v-7.1h-1.2z"/></svg>
            </button>
          </div>
        `;

        docItem.addEventListener('click', (e) => {
          const favBtn = e.target.closest('.fav-btn');
          const delBtn = e.target.closest('.delete-btn');
          if (favBtn) {
            e.stopPropagation();
            const all = this.getAllDocuments();
            const d = all.find(x => x.id === doc.id);
            if (d) {
              d.favorite = !d.favorite;
              this.saveAllDocuments(all);
              this.render();
              try { updateEditorToolbar(); } catch (_) {}
            }
          } else if (delBtn) {
            e.stopPropagation();
            this.deleteDocument(doc.id, false, docItem);
          } else {
            this.switchToDocument(doc.id);
            // 移动端：选中文档后收起抽屉
            document.body.classList.remove('docbar-open');
          }
        });

        documentList.appendChild(docItem);
      });

      // 空列表占位
      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'docbar-empty';
        empty.textContent = '—';
        documentList.appendChild(empty);
      }

      // 如果没有活动文档且有文档存在，激活第一个
      if (!activeId && docs.length > 0) {
        this.setActiveId(docs[0].id);
        this.loadActiveDocument();
        this.render();
      }
    }

    // 更新删除按钮状态
    updateDeleteButtonState() {
      // 同步列表删除按钮与工具栏垃圾桶按钮的禁用状态
      if (!deleteDocBtn && !editorDeleteBtn) return;
      
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      const activeDoc = docs.find(d => d.id === activeId);
      
      // 如果没有活动文档或活动文档被锁定，禁用删除按钮（允许删除最后一篇文档）
      const disabled = !activeDoc || activeDoc.locked;
      if (deleteDocBtn) deleteDocBtn.disabled = disabled;
      if (editorDeleteBtn) editorDeleteBtn.disabled = disabled;
    }

    // 初始化默认文档
    seedDefaultDocument() {
      const docs = this.getAllDocuments();
      if (docs.length === 0) {
        const defaultDoc = {
          id: DEFAULT_DOC_ID,
          content: DEFAULT_CONTENT,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          locked: true
        };
        this.saveAllDocuments([defaultDoc]);
        this.setActiveId(defaultDoc.id);
      }
    }

    // 注入示例文章（增量追加：仅追加缺失的样例）
    async seedSampleDocumentsIfNeeded(force = false) {
      try {
        const docs = this.getAllDocuments();
        const url = force ? `/static/samples.json?v=${Date.now()}` : '/static/samples.json';
        const resp = await fetch(url, { cache: force ? 'no-store' : 'default' });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!data || !Array.isArray(data.articles)) return;
        const now = Date.now();
        // 以标题/ID作为唯一键，避免重复追加
        const existingSampleTitles = new Set(
          docs.filter(d => d.folder === 'samples').map(d => this.getDocumentTitle(d.content))
        );
        const existingSampleIds = new Set(
          docs.filter(d => d.folder === 'samples').map(d => String(d.id))
        );
        const newDocs = [];
        for (const a of data.articles) {
          let title = 'サンプル';
          let contentArr = [];
          if (Array.isArray(a.lines) && a.lines.length > 0) {
            title = String(a.lines[0]).trim() || 'サンプル';
            const bodyLines = a.lines.map(l => String(l));
            // 避免重复首行标题
            if (String(bodyLines[0]).trim() === title) {
              contentArr = [title, '', ...bodyLines.slice(1)];
            } else {
              contentArr = [title, '', ...bodyLines];
            }
          } else if (typeof a.text === 'string') {
            const textStr = String(a.text);
            title = textStr.split('\n')[0].trim() || 'サンプル';
            contentArr = [title, '', textStr];
          } else {
            // 兼容旧结构（有 title 字段）
            title = String(a.title || 'サンプル');
            contentArr = [title, '', ...(Array.isArray(a.lines) ? a.lines : [String(a.text || '')])];
          }
          if (existingSampleTitles.has(title)) continue;
          // 从 a.id 解析时间戳，ID 优先使用 a.id（格式：yyyyMMdd-HHmmss）
          const rawId = String((a && a.id) || '').trim();
          let createdAtTs = now;
          const tsMatch = rawId.match(/^(\d{8})-(\d{6})$/);
          if (tsMatch) {
            const ymd = tsMatch[1];
            const hms = tsMatch[2];
            const year = parseInt(ymd.slice(0, 4), 10);
            const month = parseInt(ymd.slice(4, 6), 10) - 1; // JS 月份从 0 开始
            const day = parseInt(ymd.slice(6, 8), 10);
            const hour = parseInt(hms.slice(0, 2), 10);
            const minute = parseInt(hms.slice(2, 4), 10);
            const second = parseInt(hms.slice(4, 6), 10);
            createdAtTs = new Date(year, month, day, hour, minute, second).getTime();
          }

          const docId = rawId || this.generateId();
          if (existingSampleIds.has(docId)) continue;

          newDocs.push({
            id: docId,
            content: contentArr,
            createdAt: createdAtTs,
            updatedAt: createdAtTs,
            locked: true,
            folder: 'samples'
          });
        }
        if (newDocs.length > 0) {
          // fetch 期间本地文档可能已变化（如导入备份），保存前重读，避免用旧快照覆盖
          const current = this.getAllDocuments();
          this.saveAllDocuments(current.concat(newDocs));
        }
      } catch (_) {
        // 静默失败
      }
    }

    // 清空示例文章缓存（移除所有 folder 为 'samples' 的文档）
    clearSampleDocuments() {
      const all = this.getAllDocuments();
      const remaining = all.filter(d => d.folder !== 'samples');
      const activeId = this.getActiveId();
      const activeDoc = all.find(d => d.id === activeId);
      const activeWasSample = !!(activeDoc && activeDoc.folder === 'samples');
      this.saveAllDocuments(remaining);

      // 如果当前活动文档是示例，被清除后需要切换到第一个剩余文档或清空输入框
      if (activeWasSample) {
        const firstDoc = remaining[0];
        if (firstDoc) {
          this.setActiveId(firstDoc.id);
          this.loadActiveDocument();
        } else {
          this.setActiveId('');
          if (textInput) textInput.value = '';
        }
      }

      // 渲染列表以反映变更
      this.render();
    }

    // 绑定事件
    bindEvents() {
      // 新建文档按钮：立即创建空文档并设为活动；若保持为空，保存时会自动删除
      if (newDocBtn) {
        newDocBtn.addEventListener('click', () => {
          this.createDocument('');
          if (textInput) textInput.focus();
        });
      }


      // 顶部编辑工具栏"新建"按钮
      if (editorNewBtn) {
        editorNewBtn.addEventListener('click', () => {
          this.createDocument('');
          if (textInput) textInput.focus();
        });
      }


      // 删除文档按钮
      if (deleteDocBtn) {
        deleteDocBtn.addEventListener('click', () => {
          const activeId = this.getActiveId();
          if (activeId) {
            // 找到当前活动的文档项作为目标元素
            const activeDocItem = document.querySelector(`.doc-item[data-doc-id="${activeId}"]`);
            this.deleteDocument(activeId, false, activeDocItem);
          }
        });
      }

      // 编辑工具栏垃圾桶按钮
      if (editorDeleteBtn) {
        editorDeleteBtn.addEventListener('click', () => {
          const activeId = this.getActiveId();
          if (activeId) {
            const activeDocItem = document.querySelector(`.doc-item[data-doc-id="${activeId}"]`);
            this.deleteDocument(activeId, false, activeDocItem);
          }
        });
      }

      // 列表排序切换
      if (docSortToggle) {
        docSortToggle.addEventListener('click', () => {
          const next = !this.getSortAsc();
          this.setSortAsc(next);
          this.updateSortToggleLabel();
          this.render();
        });
      }

      // 自动保存当前文档内容
      if (textInput) {
        let saveTimeout;
        textInput.addEventListener('input', () => {
          clearTimeout(saveTimeout);

          // 如果当前没有活动文档，且输入了非空内容，则先创建文档
          if (!this.getActiveId() && textInput.value.trim().length > 0) {
            const newDoc = this.createDocument('');
            // createDocument 会设置 activeId 与渲染
          }

          saveTimeout = setTimeout(() => {
            this.saveCurrentDocument();
          }, 1000); // 1秒后自动保存
          // 同步更新顶部工具栏字数
          try { updateEditorToolbar(); } catch (_) {}
        });
      }

      // 初始化排序按钮标签（确保首次渲染后标签正确）
      this.updateSortToggleLabel();
    }
  }

  // 文档管理器实例（全局唯一；供移动端手势与备份等使用）
  const documentManager = new DocumentManager();
  window.documentManager = documentManager;


  // 语音合成功能
  // 分段播放实现自然停顿
  function speakWithPauses(text, rateOverride) {
    if (!('speechSynthesis' in window)) return;
    
    // 停止当前播放
    if (isPlaying) {
      stopSpeaking();
      return;
    }
    
    // 清理文本
    const stripped = String(text || '')
      .replace(/（[^）]*）|\([^)]*\)/g, '')
      .replace(/[\s\u00A0]+/g, ' ')
      .trim();
    if (!stripped) return;
    
    // 按标点符号分段
    const segments = splitTextByPunctuation(stripped);
    
    // 存储当前播放的文本用于重复播放
    currentPlayingText = stripped;
    
    // 初始化进度并分段播放（按字符线性推进）
    const charPrefix = [0];
    for (let i = 0; i < segments.length; i++) {
      charPrefix.push(charPrefix[charPrefix.length - 1] + (segments[i].text || '').length);
    }
    PLAY_STATE = {
      totalSegments: segments.length,
      totalChars: charPrefix[charPrefix.length - 1],
      charPrefix,
      current: 0,
    };
    setHeaderProgress(0);
    playSegments(segments, 0, rateOverride);
  }
  
  // 按标点符号分段文本
  function splitTextByPunctuation(text) {
    const normalized = String(text || '').replace(/\r\n/g, '\n');
    const segments = [];
    // 停顿时间设置（毫秒）
    const heavyPause = 800;      // 句号、感叹号、问号、换行 - 长停顿
    const mediumPause = 400;     // 逗号、顿号、分号 - 中等停顿
    const lightPause = 200;      // 冒号 - 轻微停顿
    const ellipsisPause = 1000;  // 省略号 - 更长停顿
    
    let buffer = '';
    
    const pushSegment = (pause) => {
      const segmentText = buffer.trim();
      if (segmentText) {
        segments.push({ text: segmentText, pause });
      }
      buffer = '';
    };
    
    for (let i = 0; i < normalized.length; i++) {
      const ch = normalized[i];
      const next = normalized[i + 1] || '';
      const next2 = normalized[i + 2] || '';
      
      if (ch === '\n') {
        pushSegment(heavyPause);
        continue;
      }
      
      buffer += ch;
      
      // 中文省略号
      if (ch === '…') {
        while (normalized[i + 1] === '…') {
          buffer += normalized[++i];
        }
        pushSegment(ellipsisPause);
        continue;
      }
      
      // 英文省略号 ...
      if (ch === '.' && next === '.' && next2 === '.') {
        buffer += next + next2;
        i += 2;
        pushSegment(ellipsisPause);
        continue;
      }
      
      // 句号、感叹号、问号 - 长停顿
      if ('。！？!?？！'.includes(ch)) {
        pushSegment(heavyPause);
        continue;
      }
      
      // 逗号、顿号、分号 - 中等停顿
      if ('、，,;；'.includes(ch)) {
        pushSegment(mediumPause);
        continue;
      }
      
      // 冒号 - 轻微停顿（用于列表、说明等场景）
      if (':：'.includes(ch)) {
        pushSegment(lightPause);
        continue;
      }
    }
    
    if (buffer.trim()) {
      segments.push({ text: buffer.trim(), pause: 0 });
    }
    
    if (!segments.length && normalized.trim()) {
      segments.push({ text: normalized.trim(), pause: 0 });
    }
    
    // 如果依然没有有效分段，则按固定长度切分
    if (!segments.length) {
      const plain = normalized.trim();
      const maxLength = 60;
      for (let i = 0; i < plain.length; i += maxLength) {
        const part = plain.slice(i, i + maxLength).trim();
        if (part) segments.push({ text: part, pause: 260 });
      }
    }
    
    return segments;
  }
  
  // 分段播放
  function playSegments(segments, index, rateOverride) {
    if (index >= segments.length) {
      // 播放完成
      isPlaying = false;
      currentUtterance = null;
      updatePlayButtonStates();
      
      // 检查是否需要重复播放
      if (repeatPlayCheckbox && repeatPlayCheckbox.checked && currentPlayingText) {
        // 添加更长的延迟，并检查是否仍在播放状态
        setTimeout(() => {
          // 确保没有其他语音在播放，且重复播放仍然启用
          if (repeatPlayCheckbox && repeatPlayCheckbox.checked && 
              currentPlayingText && !isPlaying && 
              !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
            console.log('开始重复播放:', currentPlayingText);
            speakWithPauses(currentPlayingText, rateOverride);
          }
        }, 1000); // 增加延迟到1秒
      } else {
        currentPlayingText = null;
        clearTokenHighlight();
      }
      return;
    }
    
    const segment = segments[index];
    console.log(`播放第${index + 1}段:`, segment.text);
    // 保存当前段落状态用于实时续播
    currentSegments = segments;
    currentSegmentIndex = index;
    currentSegmentText = segment.text || '';
    lastBoundaryCharIndex = 0;
    segmentStartTs = 0; // 重置段落开始时间标记，允许新段落初始化
    
    // 创建语音合成对象
    const utterance = new SpeechSynthesisUtterance(segment.text);
    currentUtterance = utterance;
    applyVoice(utterance);
    utterance.rate = typeof rateOverride === 'number' ? rateOverride : rate;
    utterance.volume = volume;
    utterance.pitch = 1.0;
    // 边界事件用于实时更新进度（部分浏览器支持）
  utterance.onboundary = (event) => {
    if (utterance !== currentUtterance) return; // 忽略过期回调
      try {
        const segLen = Math.max(1, segment.text.length || 1);
        const charIdx = typeof event.charIndex === 'number' ? event.charIndex : 0;
        lastBoundaryCharIndex = charIdx;
        usingBoundaryProgress = true;
        clearProgressTimer();
        const passedChars = (PLAY_STATE.charPrefix[index] || 0) + Math.max(0, Math.min(segLen, charIdx));
        if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, passedChars / PLAY_STATE.totalChars)));
      } catch (_) {}
    };
    
  utterance.onstart = () => {
    if (utterance !== currentUtterance) return; // 忽略过期回调
    isPlaying = true;
    isPaused = false; // 恢复播放时清除暂停状态
    PLAY_STATE.current = index;
    // 恢复播放时，部分浏览器会重新触发 onstart
    // 只在首次播放该段落时设置进度，避免恢复时重置进度
    if (!segmentStartTs) {
      const segLen = Math.max(1, (segment.text || '').length);
      const boundary = Math.max(0, Math.min(segLen, lastBoundaryCharIndex || 0));
      const baseChars = (PLAY_STATE.charPrefix[index] || 0) + boundary;
      if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, baseChars / PLAY_STATE.totalChars)));
    }
    updatePlayButtonStates();

      // 基于时间的进度更新回退（部分浏览器不触发 onboundary）
      if (!segmentStartTs) {
        clearProgressTimer();
        const est = estimateSegmentDuration(segment.text, utterance.rate);
        const startTs = Date.now();
        segmentStartTs = startTs; // 标记段落已开始
        progressTimer = setInterval(() => {
          if (usingBoundaryProgress) return;
          const elapsed = (Date.now() - startTs) / 1000;
          const frac = Math.max(0, Math.min(1, elapsed / est));
          const segLen = Math.max(1, segment.text.length || 1);
          const passedChars = (PLAY_STATE.charPrefix[index] || 0) + Math.round(frac * segLen);
          if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, passedChars / PLAY_STATE.totalChars)));
          if (frac >= 1) clearProgressTimer();
        }, 80);
      }
    };
    
  utterance.onend = () => {
    if (utterance !== currentUtterance) return; // 忽略过期回调
      // 添加停顿
      const nextIndex = index + 1;
      const nextChars = PLAY_STATE.charPrefix[nextIndex] || PLAY_STATE.totalChars;
      if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, nextChars / PLAY_STATE.totalChars)));
      clearProgressTimer();
      setTimeout(() => {
        playSegments(segments, nextIndex, rateOverride);
      }, segment.pause);
    };
    
  utterance.onerror = (event) => {
    if (utterance !== currentUtterance) return; // 忽略过期回调
      console.warn('Speech synthesis error:', event);
      
      // 根据错误类型进行不同处理
      if (event.error === 'interrupted') {
        // 如果是被中断，不需要额外处理，这是正常的停止操作
        console.log('Speech was interrupted (normal stop operation)');
      } else if (event.error === 'network') {
        console.error('Network error during speech synthesis');
      } else if (event.error === 'synthesis-failed') {
        console.error('Speech synthesis failed');
      } else {
        console.error('Unknown speech synthesis error:', event.error);
      }
      
      // 清理状态
      isPlaying = false;
      currentUtterance = null;
      currentPlayingText = null;
      clearTokenHighlight();
      clearProgressTimer();
      setHeaderProgress(0);
      updatePlayButtonStates();
    };
    
    // 开始播放
    try {
      // 确保在开始新的语音合成前停止之前的
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        // 给一个短暂的延迟确保取消操作完成
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      } else {
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error('Speech synthesis failed:', e);
      isPlaying = false;
      currentUtterance = null;
      clearTokenHighlight();
      updatePlayButtonStates();
    }
  }

  function speak(text, rateOverride) {
    // 使用新的分段播放功能
    speakWithPauses(text, rateOverride);
  }

  // 高亮词汇函数
  function highlightToken(text, targetElement = null, opts = {}) {
    // 清除之前的高亮
    clearTokenHighlight();
    
    if (!text) return;
    
    // 如果指定了目标元素，直接高亮该元素
    if (targetElement) {
      targetElement.classList.add('playing');
      currentHighlightedToken = targetElement;
      
      // 滚动到可视区域（允许调用方禁用）
      if (opts.scroll !== false) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
      return;
    }
    
    // 查找匹配的词汇卡片
    const tokenPills = document.querySelectorAll('.token-pill');
    for (const pill of tokenPills) {
      const kanjiEl = pill.querySelector('.token-kanji');
      if (kanjiEl && kanjiEl.textContent.trim() === text.trim()) {
        pill.classList.add('playing');
        currentHighlightedToken = pill;
        
        // 滚动到可视区域（文本匹配时默认允许）
        if (opts.scroll !== false) {
          pill.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
        break;
      }
    }
  }
  
  // 清除词汇高亮
  function clearTokenHighlight() {
    if (currentHighlightedToken) {
      currentHighlightedToken.classList.remove('playing');
      currentHighlightedToken = null;
    }
    
    // 清除所有可能的高亮状态
    document.querySelectorAll('.token-pill.playing').forEach(pill => {
      pill.classList.remove('playing');
    });
    
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      // 先检查是否有正在进行的语音合成
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    }
    isPlaying = false;
    currentUtterance = null;
    currentPlayingText = null; // 停止时清除重复播放文本
    clearTokenHighlight();
    clearProgressTimer();
    // 停止时不强制重置进度，保留用户可见的最后进度
    updatePlayButtonStates();
  }



  function updatePlayButtonStates() {
    // 更新播放全文按钮
    updateButtonIcon(playAllBtn, isPlaying);
    // 更新导航播放按钮
    updateButtonIcon(headerPlayToggle, isPlaying);
    // 更新暂停/恢复按钮
    updatePauseButtonIcon(headerPauseToggle, isPlaying, isPaused);
    
    // 更新所有行播放按钮
    document.querySelectorAll('.play-line-btn').forEach(btn => {
      updateButtonIcon(btn, isPlaying);
    });
    
    // 更新所有词汇播放按钮
    document.querySelectorAll('.play-token-btn').forEach(btn => {
      updateButtonIcon(btn, isPlaying);
    });
    
    // 移动端播放按钮已移除，不再更新移动端图标
  }

  function updateButtonIcon(button, playing) {
    if (!button) return;
    // 双图标按钮（TTS 条）：由 CSS 按 .playing 切换
    if (button.querySelector('.icon-stop')) {
      button.classList.toggle('playing', !!playing);
      const title = playAllLabel(playing);
      button.title = title;
      button.setAttribute('aria-label', title);
      return;
    }
    // 单图标按钮（行/词）：直接切换 path
    const svg = button.querySelector('svg');
    if (!svg) return;
    svg.innerHTML = playing
      ? '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>'
      : '<path d="M8 5v14l11-7z" fill="currentColor"/>';
    const title = playing ? t('stop') : t('play');
    button.title = title;
    button.setAttribute('aria-label', title);
  }

  function updatePauseButtonIcon(button, playing, paused) {
    if (!button) return;
    // 图标由 CSS 按 .paused 切换（暂停 ⇄ 恢复）
    const showPlay = !!(paused && playing);
    button.classList.toggle('paused', showPlay);
    const title = showPlay ? t('resume') : t('pause');
    button.setAttribute('aria-label', title);
    button.title = title;
  }

  // 移动端播放按钮图标更新函数已移除

  function applyVoice(u) { if (window.TTS && window.TTS.applyVoice) { window.TTS.applyVoice(u, currentVoice, 'ja-JP'); } }

  // 过滤括号内容：如果括号里全是假名或标点符号就移除，如果包含汉字或英文就保留
  function filterParentheses(text) {
    // 先处理全角括号
    const result = text.replace(/（([^）]+)）/g, (match, content) => {
      // 检查是否包含汉字
      const hasKanji = /[\u4E00-\u9FAF]/.test(content);
      // 检查是否包含英文字母
      const hasEnglish = /[a-zA-Z]/.test(content);
      
      console.log(`括号内容: "${content}", 包含汉字: ${hasKanji}, 包含英文: ${hasEnglish}, 保留: ${hasKanji || hasEnglish}`);
      
      // 如果包含汉字或英文，保留括号和内容
      if (hasKanji || hasEnglish) {
        return match;
      }
      
      // 否则移除整个括号及内容
      return '';
    });
    
    // 再处理半角括号
    const finalResult = result.replace(/\(([^)]+)\)/g, (match, content) => {
      const hasKanji = /[\u4E00-\u9FAF]/.test(content);
      const hasEnglish = /[a-zA-Z]/.test(content);
      console.log(`半角括号内容: "${content}", 包含汉字: ${hasKanji}, 包含英文: ${hasEnglish}, 保留: ${hasKanji || hasEnglish}`);
      return (hasKanji || hasEnglish) ? match : '';
    });
    
    console.log(`原文本: "${text}"\n过滤后: "${finalResult}"`);
    return finalResult;
  }

  // 文本分析功能
  async function analyzeText() {
    let text = textInput.value.trim();
    
    if (!text) {
      showEmptyState();
      return;
    }

    // 预处理：过滤括号内容
    text = filterParentheses(text);

    showLoadingState();

    try {
      const seg = await initSegmenter();
      const result = await seg.segment(text);
      
      // 使用原来的分词逻辑，按行显示结果
      displayResults(result);
    } catch (error) {
      console.error('分析错误:', error);
      showErrorState(error.message);
    }
  }

  function showEmptyState() {
    clearReadingLineHighlight();
    content.innerHTML = `
      <div style="text-align: center; color: #a0aec0; padding: 2rem;">
        <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.5;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7"/>
        </svg>
        <p>${t('emptyText')}</p>
      </div>
    `;
    syncReadingLineAttributes(isReadingMode);
  }

  function showLoadingState() {
    clearReadingLineHighlight();
    content.innerHTML = `
      <div style="text-align: center; color: #667eea; padding: 2rem;">
        <div class="loading" style="margin: 0 auto 1rem;"></div>
        <p>${t('loading')}</p>
      </div>
    `;
    syncReadingLineAttributes(isReadingMode);
  }

  function showErrorState(message) {
    clearReadingLineHighlight();
    content.innerHTML = `
      <div style="text-align: center; color: #e53e3e; padding: 2rem;">
        <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.7;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
        </svg>
        <p>${t('errorPrefix')}${message}</p>
        <button class="btn btn-secondary" onclick="analyzeText()" style="margin-top: 1rem;">${t('analyzeBtn')}</button>
      </div>
    `;
    syncReadingLineAttributes(isReadingMode);
  }

  function displayResults(result) {
    if (!result || !result.lines || result.lines.length === 0) {
      showEmptyState();
      return;
    }

    clearReadingLineHighlight();

    // 展示层词块合并规则：
    // 1) 数字 + 年/月/日 合并为一个词，并应用专用读法
    // 2) 动/形 + て/で（助词），动/形 + た（助动）
    const mergeTokensForDisplay = (tokens) => {
      const out = [];
      const isDigits = (s) => /^[0-9０-９]+$/.test(s || '');
      const toAsciiDigits = (s) => String(s || '').replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
      const monthMap = {
        1: 'いち', 2: 'に', 3: 'さん', 4: 'し', 5: 'ご', 6: 'ろく', 7: 'しち', 8: 'はち', 9: 'く', 10: 'じゅう', 11: 'じゅういち', 12: 'じゅうに'
      };
      const dayMap = {
        1: 'ついたち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか',
        14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか'
      };
      for (let i = 0; i < tokens.length; i++) {
        const cur = tokens[i];
        const next = tokens[i + 1];
        const getMainPos = (tok) => {
          if (!tok) return '';
          const p = Array.isArray(tok.pos) ? tok.pos : [tok.pos || ''];
          return p[0] || '';
        };
        // 优先处理：数字 + 年/月/日 的合并与读音
        if (next) {
          const curSurface = cur.surface || '';
          const nextSurface = next.surface || '';
          if (isDigits(curSurface) && (nextSurface === '年' || nextSurface === '月' || nextSurface === '日')) {
            const n = parseInt(toAsciiDigits(curSurface), 10);
            let reading = '';
            if (nextSurface === '年') {
              // 若分词阶段已给出年份读法，则直接加「ねん」；否则使用数字读法 + ねん
              const base = cur.reading || curSurface;
              reading = base + 'ねん';
            } else if (nextSurface === '月') {
              const base = (cur.reading && cur.reading !== curSurface) ? cur.reading : (monthMap[n] || (cur.reading || curSurface));
              reading = base + 'がつ';
            } else if (nextSurface === '日') {
              if (dayMap[n]) reading = dayMap[n];
              else {
                const base = cur.reading || curSurface;
                reading = base + 'にち';
              }
            }
            const merged = {
              surface: curSurface + nextSurface,
              reading,
              lemma: cur.lemma || curSurface + nextSurface,
              pos: Array.isArray(next.pos) ? next.pos.slice() : [next.pos || '名']
            };
            out.push(merged);
            i++;
            continue;
          }
        }
        if (next) {
          const curMain = getMainPos(cur);
          const nextMain = getMainPos(next);
          const nextSurface = next.surface || '';
          const isVerbOrAdj = (curMain === '動詞' || curMain === '形容詞');
          const ruleTeDe = isVerbOrAdj && nextMain === '助詞' && (nextSurface === 'て' || nextSurface === 'で');
          const ruleTa = isVerbOrAdj && nextMain === '助動詞' && (nextSurface === 'た');
          if (ruleTeDe || ruleTa) {
            const surface = (cur.surface || '') + nextSurface;
            const reading = (cur.reading || '') + (next.reading || nextSurface);
            const lemma = cur.lemma || cur.surface || surface;
            const merged = {
              surface,
              reading,
              lemma,
              pos: Array.isArray(cur.pos) ? cur.pos.slice() : [cur.pos || '動詞']
            };
            out.push(merged);
            i++;
            continue;
          }
        }
        out.push(cur);
      }
      return out;
    };

    // 按行显示分词结果，先过滤掉空行和只有标点符号的行
    const nonEmptyLines = result.lines.filter(line => {
      if (!Array.isArray(line) || line.length === 0) return false;
      
      // 检查整行是否都只有标点符号
      const allPunct = line.every(token => {
        const pos = Array.isArray(token.pos) ? token.pos : [token.pos || ''];
        return pos[0] === '記号' || pos[0] === '補助記号';
      });
      
      return !allPunct; // 如果整行都是标点符号，则过滤掉
    });
    
    // 将行首标点移动到上一行末尾，避免标点出现在行首
    function reflowLeadingPunctuation(lines) {
      const adjusted = [];
      for (let i = 0; i < lines.length; i++) {
        const line = Array.isArray(lines[i]) ? lines[i].slice() : [];
        if (line.length === 0) { adjusted.push(line); continue; }
        // 连续处理多个可能的行首标点
        while (line.length > 0) {
          const first = line[0];
          const posArr = Array.isArray(first && first.pos) ? first.pos : [first && first.pos || ''];
          const mainPos = posArr[0] || '';
          const isPunct = (mainPos === '記号' || mainPos === '補助記号');
          if (!isPunct) break;
          // 若存在上一行，把标点移动到上一行末尾；否则保留（避免信息丢失）
          if (adjusted.length > 0 && Array.isArray(adjusted[adjusted.length - 1])) {
            adjusted[adjusted.length - 1].push(first);
            line.shift();
          } else {
            // 第一行没有上一行，停止移动以保留内容
            break;
          }
        }
        adjusted.push(line);
      }
      return adjusted;
    }
    const linesWithoutLeadingPunct = reflowLeadingPunctuation(nonEmptyLines);
    
    // 片假名复合词拆分（如「スマート フォン アプリ」）
    const isKatakana = (s) => /^[\u30A0-\u30FFー・]+$/.test(String(s || ''));
    function splitKatakanaCompounds(tokens) {
      const suffixes = ['アプリ', 'サイト', 'サービス', 'システム', 'インターフェース'];
      // 常见内部拆分映射：键为需要进一步拆分的前缀整体
      const innerSplits = {
        'スマートフォン': ['スマート', 'フォン']
      };
      const out = [];
      for (const tok of tokens) {
        const surface = tok && tok.surface ? tok.surface : '';
        const posArr = Array.isArray(tok && tok.pos) ? tok.pos : [tok && tok.pos || ''];
        const mainPos = posArr[0] || '';
        if (mainPos === '名詞' && isKatakana(surface)) {
          const readingFull = tok.reading || surface;

          // 情况A：整词命中内部拆分
          const directInner = innerSplits[surface];
          if (directInner) {
            const left = directInner[0];
            const right = directInner[1];
            const leftReading = readingFull.slice(0, left.length);
            const rightReading = readingFull.slice(left.length);
            out.push({ surface: left, lemma: tok.lemma || left, reading: leftReading, pos: tok.pos });
            out.push({ surface: right, lemma: right, reading: rightReading, pos: tok.pos });
            continue;
          }

          // 情况B：命中后缀，先拆分前缀+后缀；前缀再做内部拆分
          const suf = suffixes.find(sf => surface.endsWith(sf) && surface.length > sf.length);
          if (suf) {
            const prefix = surface.slice(0, surface.length - suf.length);
            const prefixReading = readingFull.slice(0, prefix.length);
            const suffixReading = readingFull.slice(prefix.length);

            const inner = innerSplits[prefix];
            if (inner) {
              const left = inner[0];
              const right = inner[1];
              const leftReading = prefixReading.slice(0, left.length);
              const rightReading = prefixReading.slice(left.length);
              out.push({ surface: left, lemma: tok.lemma || left, reading: leftReading, pos: tok.pos });
              out.push({ surface: right, lemma: right, reading: rightReading, pos: tok.pos });
            } else {
              out.push({ surface: prefix, lemma: tok.lemma || prefix, reading: prefixReading, pos: tok.pos });
            }
            out.push({ surface: suf, lemma: suf, reading: suffixReading || suf, pos: tok.pos });
            continue;
          }
        }
        out.push(tok);
      }
      return out;
    }

    // 将误判为单一助词的「を通じて／を通して」等拆成「を」+「通じて/通して」
    function splitLeadingParticleVerbTeDe(tokens) {
      const out = [];
      for (const tok of tokens) {
        const surface = tok && tok.surface ? tok.surface : '';
        const posArr = Array.isArray(tok && tok.pos) ? tok.pos : [tok && tok.pos || ''];
        const mainPos = posArr[0] || '';
        if (mainPos === '助詞' && /^を.+[てで]$/.test(surface) && surface.length > 2) {
          const readingFull = tok.reading || surface;
          const headSurface = 'を';
          const tailSurface = surface.slice(1);
          const headReading = readingFull.slice(0, 1);
          const tailReading = readingFull.slice(1);
          // 「を」保留助词，后部按动词处理（用于着色/朗读逻辑）
          out.push({ surface: headSurface, lemma: headSurface, reading: headReading, pos: ['助詞'] });
          out.push({ surface: tailSurface, lemma: tok.lemma || tailSurface, reading: tailReading, pos: ['動詞'] });
          continue;
        }
        out.push(tok);
      }
      return out;
    }

    const html = linesWithoutLeadingPunct.map((line, lineIndex) => {
      // 先把可能被合成成单一助词的结构拆开，再应用展示层合并与片假名拆分
      const preSplit = splitLeadingParticleVerbTeDe(line);
      const mergedTokens = mergeTokensForDisplay(preSplit);
      const tokensForDisplay = splitKatakanaCompounds(mergedTokens);
      const lineHtml = tokensForDisplay.map((token, tokenIndex) => {
        const override = (window.FudokiDict && window.FudokiDict.getTechOverride) ? window.FudokiDict.getTechOverride(token) : null;
        const tokenForUi = (override && override.reading) ? { ...token, reading: override.reading } : token;
        const surface = tokenForUi.surface || '';
        const reading = tokenForUi.reading || '';
        const lemma = tokenForUi.lemma || surface;
        const pos = Array.isArray(tokenForUi.pos) ? tokenForUi.pos : [tokenForUi.pos || ''];
        
        // 解析词性信息
        const posInfo = (window.FudokiDict && window.FudokiDict.parsePartOfSpeech) ? window.FudokiDict.parsePartOfSpeech(pos) : { main: '未知', details: [], original: pos };
        const posDisplay = posInfo.main || '未知';
        const detailInfo = (window.FudokiDict && window.FudokiDict.formatDetailInfo) ? window.FudokiDict.formatDetailInfo(tokenForUi, posInfo, I18N[currentLang] || {}) : '';
        
        // 获取罗马音（仅针对日文读音；英文字母或数字时不显示）
        let romaji = '';
        let r = reading || surface;
        
        // 特殊处理：助词「は」读作「わ」
        if (surface === 'は' && pos[0] === '助詞' && isHaParticleReadingEnabled()) {
          r = 'わ';
        }
        
        const isLatinOrNumber = /^[A-Za-z0-9 .,:;!?\-_/+()\[\]{}'"%&@#*]+$/.test(r);
        if (!isLatinOrNumber) {
          romaji = getRomaji(r);
        }
        
        // 日文常用标点符号（只有这些可以显示为带样式的punct）
        const japaneseCommonPunct = /^[。、！？「」『』（）【】〜・※…ー〇]$/;
        
        // Markdown标记和装饰性符号（这些需要完全过滤）
        const isMarkdownSymbol = /^[#*_`>~\-=\[\]]+$/.test(surface);
        const isDecorativeSymbol = /^[•·\/\s\u00A0\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000]+$/.test(surface);

        // 先过滤掉markdown标记和装饰性符号
        if (isDecorativeSymbol || isMarkdownSymbol) {
          return '';
        }
        
        // 检查surface中是否包含任何标点符号字符
        const containsPunctuation = /[#*_`>~\-=\[\](){}|\\/:;,.<>!?'"@$%^&+：・×]/.test(surface);
        
        // 如果包含标点符号但不是日文常用标点
        if (containsPunctuation && !japaneseCommonPunct.test(surface)) {
          // 直接显示为普通文本，不用token-pill
          return surface;
        }
        
        // 如果是日文常用标点符号
        if (japaneseCommonPunct.test(surface)) {
          return `<span class="punct">${surface}</span>`;
        }
        
        // 检查词性是否为标点
        const isPunct = (pos[0] === '記号' || pos[0] === '補助記号');
        if (isPunct) {
          // 其他词性为記号的，也直接显示为普通文本
          return surface;
        }
        
        const readingText = formatReading(tokenForUi, getReadingScript());

        // 确定播放时使用的文本（考虑助词「は」的特殊情况）
        let playText = reading || surface;
        if (surface === 'は' && pos[0] === '助詞' && isHaParticleReadingEnabled()) {
          playText = 'わ';
        }
        const sanitizedPlayText = String(playText || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n');

        // 词性 → 色点/下划线语义类（UI 用色点，不用 emoji）
        const POS_CLASS = {
          '名詞': 'noun', '動詞': 'verb', '形容詞': 'adj', '副詞': 'adverb',
          '助詞': 'particle', '助動詞': 'particle', '感動詞': 'interj'
        };
        const posCls = POS_CLASS[pos[0]] || 'other';

        return `
          <span class="token-pill pos-${posCls}" onclick="toggleTokenDetails(this)" data-token='${escapeHtml(JSON.stringify(tokenForUi))}' data-pos="${escapeHtml(posDisplay)}">
            <div class="token-content">
              <div class="token-kana display-kana">${escapeHtml(readingText)}</div>
              ${romaji ? `<div class="token-romaji display-romaji">${escapeHtml(romaji)}</div>` : ''}
              <div class="token-kanji display-kanji">${escapeHtml(surface)}</div>
              <div class="token-pos display-pos"><span class="pos-dot pos-${posCls}" aria-hidden="true"></span>${escapeHtml(posDisplay)}</div>
            </div>
            <div class="token-details" style="display: none;">
              ${detailInfo}
              <button class="play-token-btn" onclick="playToken('${sanitizedPlayText}', event)" title="${t('play')}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </span>
        `;
      }).join('');
      
      // 如果行内容为空（所有token都被过滤），不生成line-container
      if (!lineHtml.trim()) {
        return '';
      }
      
      return `
        <div class="line-container" data-line-index="${lineIndex}" tabindex="-1">
          ${lineHtml}
          <button class="play-line-btn" onclick="playLine(${lineIndex})" title="${t('playThisLine')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      `;
    }).filter(html => html).join('');

    content.innerHTML = html;
    syncReadingLineAttributes(isReadingMode);
  }

  // 播放单个词汇
  window.playToken = function(text, event, tokenData) {
    if (event) {
      event.stopPropagation();
    }
    // 若正在播放，先停止，再继续播放当前点击的词
    if (isPlaying) {
      stopSpeaking();
    }
    
    // 尝试从最近的 token-pill 的 data-token 中获取tokenData
    let resolvedToken = tokenData;
    if (!resolvedToken && event) {
      const pill = event.target && event.target.closest ? event.target.closest('.token-pill') : null;
      if (pill) {
        const raw = pill.getAttribute('data-token');
        if (raw) {
          try {
            // 将 &apos; 还原为 '
            const normalized = raw.replace(/&apos;/g, "'");
            resolvedToken = JSON.parse(normalized);
          } catch (_) {
            resolvedToken = null;
          }
        }
      }
    }

    // 如果提供了或解析出了tokenData，优先使用reading字段进行朗读
    let textToSpeak = text;
    if (resolvedToken && resolvedToken.reading) {
      textToSpeak = resolvedToken.reading;
    }
    
    // 检查自定义词典，如果有自定义读音，优先使用
    if (resolvedToken && window.FudokiDict && window.FudokiDict.getTechOverride) {
      const techOverride = window.FudokiDict.getTechOverride(resolvedToken);
      if (techOverride && techOverride.reading) {
        textToSpeak = techOverride.reading;
        console.log('使用自定义词典读音:', {
          surface: resolvedToken.surface,
          originalReading: resolvedToken.reading,
          customReading: techOverride.reading
        });
      }
    }
    
    // 特殊处理：助词"は"读作"わ"
    // 检查surface而不是text，因为text可能已经是读音
    if (
      resolvedToken && 
      resolvedToken.surface === 'は' &&
      resolvedToken.pos && Array.isArray(resolvedToken.pos) && resolvedToken.pos[0] === '助詞' &&
      isHaParticleReadingEnabled()
    ) {
      textToSpeak = 'わ';
      console.log('助词「は」特殊处理: は → わ');
    }
    
    // 调试信息
    console.log('TTS播放调试:', {
      text: text,
      textToSpeak: textToSpeak,
      resolvedToken: resolvedToken,
      isHaParticleReadingEnabled: isHaParticleReadingEnabled()
    });
    
    // 高亮当前播放的词汇（优先使用解析到的 token 元素）
    const pillElement = event && event.target && event.target.closest ? event.target.closest('.token-pill') : null;
    const highlightText = resolvedToken && resolvedToken.surface ? resolvedToken.surface : text;
    highlightToken(highlightText, pillElement);
    speak(textToSpeak);
  };

  // 显示/隐藏词汇详细信息
  window.toggleTokenDetails = function(element) {
    // 读取"显示词汇详情"设置（主设置、侧边栏或本地存储）
    const showDetailsSetting = (() => {
      const main = document.getElementById('showDetails');
      const sidebar = document.getElementById('sidebarShowDetails');
      if (main && typeof main.checked !== 'undefined') return main.checked;
      if (sidebar && typeof sidebar.checked !== 'undefined') return sidebar.checked;
      const v = localStorage.getItem(LS.showDetails);
      return v === null ? true : v === 'true';
    })();
    // 仅在"自动朗读"开启时朗读；动态读取主设置、侧边栏或本地存储
    try {
      const isAutoReadEnabled = (() => {
        const main = document.getElementById('autoRead');
        const sidebar = document.getElementById('sidebarAutoRead');
        if (main && typeof main.checked !== 'undefined') return main.checked;
        if (sidebar && typeof sidebar.checked !== 'undefined') return sidebar.checked;
        const v = localStorage.getItem(LS.autoRead);
        return v === 'true';
      })();
      if (isAutoReadEnabled) {
        const tokenData = JSON.parse(element.getAttribute('data-token'));
        const surface = tokenData.surface || '';
        if (surface) {
          if (isPlaying) stopSpeaking();
          highlightToken(surface, element, { scroll: false });
          let textToSpeak = tokenData.reading || surface;
          // 只有在surface确实是单个"は"字符且为助词时才转换
          if (surface === 'は' && tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞') {
            textToSpeak = 'わ';
          }
          speak(textToSpeak);
        }
      }
    } catch (_) {}
    
    // 若关闭详情显示，仅处理可能的朗读并直接返回
    if (!showDetailsSetting) {
      return;
    }
    // 详细信息显示逻辑：统一解析弹层（活动引用 / 元素内 / body 归属）
    const details = resolveTokenDetails(element);
    
    if (details) {
      // 检查当前元素是否已经是活动状态
      const isCurrentActive = activeTokenDetails && activeTokenDetails.element === element;
      
      // 如果当前元素已经是活动状态，则关闭它
      if (isCurrentActive) {
        // 关闭当前卡片
        details.style.display = 'none';
        element.classList.remove('active');
        // 如果详情面板在body中，移回原元素
        if (details.parentNode === document.body) {
          details.style.visibility = 'hidden';
          try { element.appendChild(details); } catch (e) { /* 忽略 */ }
        }
        // 清除活动状态
        activeTokenDetails = null;
        return;
      }
      
      // 先关闭所有其他卡片，保证只有一个打开
      document.querySelectorAll('.token-details').forEach(d => {
        d.style.display = 'none';
      });
      document.querySelectorAll('.token-pill').forEach(p => {
        p.classList.remove('active');
      });
      
      // 如果之前有活动的卡片，将其详情面板移回对应的token元素
      if (activeTokenDetails && activeTokenDetails.details && activeTokenDetails.element) {
        const oldDetails = activeTokenDetails.details;
        const oldElement = activeTokenDetails.element;
        if (oldDetails.parentNode === document.body) {
          // 隐藏并移回，以便下次点击能再次找到
          oldDetails.style.display = 'none';
          oldDetails.style.visibility = 'hidden';
          try { oldElement.appendChild(oldDetails); } catch (e) { /* 忽略 */ }
        }
      }
      
      // 显示当前卡片
      details.style.display = 'block';
      details.style.visibility = 'hidden';
      positionTokenDetails(element, details);
      details.style.visibility = 'visible';
      element.classList.add('active');
      // 记录当前活动弹层
      activeTokenDetails = { element, details };
      // 加载翻译信息
      loadTranslation(element);
    }
  };

  // 当点击页面空白处关闭所有详情时，同时清除活动引用（允许在详情面板内操作）
  document.addEventListener('click', (e) => {
    const inPill = e.target.closest && e.target.closest('.token-pill');
    const inDetails = e.target.closest && e.target.closest('.token-details');
    if (inPill || inDetails) return;
    // 关闭所有卡片
    document.querySelectorAll('.token-details').forEach(d => {
      d.style.display = 'none';
    });
    document.querySelectorAll('.token-pill').forEach(p => {
      p.classList.remove('active');
    });
    activeTokenDetails = null;
  });

  // ===== F-P0-01 翻译加载：请求序号防过期回写（面板内容必须跟随最新点击）=====
  let translationRequestSeq = 0;

  // 加载翻译信息（词典加载期间面板显示真实进度，完成后自动补填）
  async function loadTranslation(element) {
    const tokenData = JSON.parse(element.getAttribute('data-token'));
    // 弹层可能为定位被移动到 body：统一按归属解析，杜绝元素内/游离态取不到内容节点
    const details = resolveTokenDetails(element);
    const translationContent = details ? details.querySelector('.translation-content') : null;
    if (!translationContent) return;

    const requestSeq = ++translationRequestSeq;
    // 写结果前复核：弹层仍归属该 token，且期间没有更新的点击/重渲
    const writeIfCurrent = (write) => {
      if (translationRequestSeq !== requestSeq) return; // 已被更新的点击取代
      if (resolveTokenDetails(element) !== details) return; // 弹层已重建/归属他词
      write();
    };

    try {
      // 先应用术语翻译覆盖（多语言）
      const override = (window.FudokiDict && window.FudokiDict.getTechOverride) ? window.FudokiDict.getTechOverride(tokenData) : null;
      if (override && override.translations) {
        const lang = (typeof currentLang === 'string') ? currentLang : 'ja';
        const text = override.translations[lang] || override.translations.ja || '';
        if (text) {
          writeIfCurrent(() => { translationContent.textContent = text; });
          return; // 已覆盖翻译，无需查询词典
        }
      }

      // 确保词典服务已初始化；期间将真实进度实时写入面板（F-P0-01/PERF-04）
      if (!window.dictionaryService.isReady()) {
        writeIfCurrent(() => { translationContent.textContent = t('dict_init') || '正在初始化词典...'; });
        const fmtProgress = (p) => (t('dict_loading') || '词典加载中 {p}%（{n} 词条）')
          .replace('{p}', Math.round((p.fraction || 0) * 100))
          .replace('{n}', String(p.entries || 0));
        const unsubscribe = window.dictionaryService.onProgress((p) => {
          if (p.phase === 'loading') writeIfCurrent(() => { translationContent.textContent = fmtProgress(p); });
        });
        try {
          await window.dictionaryService.init();
        } finally {
          unsubscribe();
        }
      }

      // 查询翻译：优先使用可查询的日文形式
      // 1) 如果 lemma 为 '*' 或为拉丁字母，则优先使用 reading
      // 2) 若仍无结果，使用别名映射（如 アプリ -> アプリケーション，Web -> ウェブ）
      const isLatin = (s) => /^[A-Za-z0-9 .,:;!?\-_/+()\[\]{}'"%&@#*]+$/.test(String(s || ''));
      const lemma = tokenData.lemma;
      const surface = tokenData.surface;
      const reading = tokenData.reading;
      const aliases = {
        'アプリ': 'アプリケーション',
        'web': 'ウェブ',
        'Web': 'ウェブ',
        'WEB': 'ウェブ'
      };

      let query = (lemma && lemma !== '*') ? lemma : (reading || surface);
      if (isLatin(query) && reading) {
        query = reading; // 将拉丁字母词转为片假名读音查询
      }

      let detailedInfo = await window.dictionaryService.getDetailedInfo(query);
      if (!detailedInfo && aliases[query]) {
        detailedInfo = await window.dictionaryService.getDetailedInfo(aliases[query]);
      }

      writeIfCurrent(() => {
        if (detailedInfo && detailedInfo.senses && detailedInfo.senses.length > 0) {
          // 显示主要翻译
          const mainTranslation = detailedInfo.senses[0].gloss;
          translationContent.innerHTML = `<span class="main-translation">${escapeHtml(mainTranslation)}</span>`;

          // 如果有多个词义，添加展开按钮
          if (detailedInfo.senses.length > 1) {
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-translation-btn';
            expandBtn.textContent = `(+${detailedInfo.senses.length - 1}个词义)`;
            expandBtn.onclick = (e) => {
              e.stopPropagation();
              showDetailedTranslation(detailedInfo, translationContent);
            };
            translationContent.appendChild(expandBtn);
          }

          // 显示假名读音（如果有）
          if (detailedInfo.kana && detailedInfo.kana.length > 0) {
            const kanaInfo = detailedInfo.kana.map(k => k.text).join('、');
            const kanaElement = document.createElement('div');
            kanaElement.className = 'translation-kana';
            kanaElement.textContent = `${t('lbl_reading') || '读音'}: ${kanaInfo}`;
            translationContent.appendChild(kanaElement);
          }
        } else {
          translationContent.textContent = t('no_translation') || '未找到翻译';
        }
      });

      // F-P1-06 例句区：按需拉取 Tanaka 分片（~几十KB），不阻塞翻译首显；
      // 同 requestSeq 守卫，重点击/重渲染后过期结果不回写
      (async () => {
        try {
          const examples = await window.dictionaryService.getExamples(query, detailedInfo);
          writeIfCurrent(() => {
            const old = details.querySelector('.example-sentences');
            if (old) old.remove();
            if (!examples || !examples.length) return;
            const box = document.createElement('div');
            box.className = 'example-sentences';
            const items = examples.map((pair) => `
              <div class="example-item">
                <div class="example-jp">${escapeHtml(pair[0])}</div>
                <div class="example-en">${escapeHtml(pair[1])}</div>
              </div>`).join('');
            box.innerHTML = `<div class="example-title">${t('lbl_examples') || '例句'}</div>${items}`;
            const anchor = details.querySelector('.translation-item');
            if (anchor && anchor.parentNode === details) details.insertBefore(box, anchor.nextSibling);
            else details.appendChild(box);
          });
        } catch (_) { /* 例句失败不影响词卡 */ }
      })();
    } catch (error) {
      console.error('加载翻译失败:', error);
      writeIfCurrent(() => { translationContent.textContent = t('translation_failed') || '翻译加载失败'; });
    }
  }

  // 显示详细翻译信息
  async function showDetailedTranslation(detailedInfo, container) {
    // 隐藏所有词汇详情弹窗，避免冲突
    document.querySelectorAll('.token-details').forEach(d => {
      d.style.display = 'none';
    });
    document.querySelectorAll('.token-pill').forEach(p => {
      p.classList.remove('active');
    });
    // 若当前有活动的详情弹层，确保在打开模态前将其归位到对应 token 元素
    try {
      const prev = activeTokenDetails;
      if (prev && prev.details && prev.element && prev.details.parentNode === document.body) {
        prev.details.style.display = 'none';
        prev.details.style.visibility = 'hidden';
        try { prev.element.appendChild(prev.details); } catch (_) {}
      }
    } catch (_) {}
    activeTokenDetails = null;
    
    const modal = document.createElement('div');
    modal.className = 'translation-modal';
    
    modal.innerHTML = `
      <div class="translation-modal-content">
        <div class="translation-modal-header">
          <h3>${escapeHtml(detailedInfo.word)} ${t('dlg_detail_translation') || '的详细翻译'}</h3>
          <button class="close-modal-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="translation-modal-body">
          ${detailedInfo.senses.map((sense, index) => `
            <div class="sense-item">
              <div class="sense-number">${index + 1}.</div>
              <div class="sense-content">
                <div class="sense-gloss">${escapeHtml(sense.gloss)}</div>
                ${sense.partOfSpeech.length > 0 ? `<div class="sense-pos">${t('lbl_pos') || '词性'}: ${escapeHtml(sense.partOfSpeech.join(', '))}</div>` : ''}
                ${sense.field.length > 0 ? `<div class="sense-field">${t('lbl_field') || '领域'}: ${escapeHtml(sense.field.join(', '))}</div>` : ''}
                ${sense.misc.length > 0 ? `<div class="sense-misc">${t('lbl_note') || '备注'}: ${escapeHtml(sense.misc.join(', '))}</div>` : ''}
                ${sense.chineseSource ? `<div class="sense-chinese">${t('lbl_chinese') || '中文'}: ${escapeHtml(sense.chineseSource)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加全局监听器，当翻译模态框出现时自动隐藏词汇详情弹窗
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains('translation-modal')) {
              // 翻译模态框出现时，隐藏所有词汇详情弹窗
              document.querySelectorAll('.token-details').forEach(d => {
                d.style.display = 'none';
              });
              document.querySelectorAll('.token-pill').forEach(p => {
                p.classList.remove('active');
              });
              activeTokenDetails = null;
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // 当模态框被移除时，停止观察
    const originalRemove = modal.remove;
    modal.remove = function() {
      observer.disconnect();
      originalRemove.call(this);
    };
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        // 确保关闭翻译模态框时，词汇详情弹窗保持隐藏，并将仍在 body 的详情归位
        document.querySelectorAll('.token-details').forEach(d => {
          if (d.parentNode === document.body && d.__ownerTokenElement) {
            try { d.__ownerTokenElement.appendChild(d); } catch (_) {}
          }
          d.style.display = 'none';
          d.style.visibility = 'hidden';
        });
        document.querySelectorAll('.token-pill').forEach(p => {
          p.classList.remove('active');
        });
        activeTokenDetails = null;
      }
    });
    
    // 监听关闭按钮点击
    const closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
        // 确保关闭翻译模态框时，词汇详情弹窗保持隐藏，并将仍在 body 的详情归位
        document.querySelectorAll('.token-details').forEach(d => {
          if (d.parentNode === document.body && d.__ownerTokenElement) {
            try { d.__ownerTokenElement.appendChild(d); } catch (_) {}
          }
          d.style.display = 'none';
          d.style.visibility = 'hidden';
        });
        document.querySelectorAll('.token-pill').forEach(p => {
          p.classList.remove('active');
        });
        activeTokenDetails = null;
      });
    }
  }

  // 播放整行文本
  window.playLine = function(lineIndex) {
    if (isPlaying) {
      stopSpeaking();
      return;
    }
    
    const lineContainer = document.querySelectorAll('.line-container')[lineIndex];
    if (lineContainer) {
      const tokens = lineContainer.querySelectorAll('.token-pill');
      const lineText = Array.from(tokens).map(token => {
        // 获取token数据
        const tokenDataAttr = token.getAttribute('data-token');
        if (tokenDataAttr) {
          try {
            const tokenData = JSON.parse(tokenDataAttr);
            // 优先使用reading字段，如果没有则使用surface
            let textToSpeak = tokenData.reading || tokenData.surface || '';
            
            // 检查自定义词典，如果有自定义读音，优先使用
            if (window.FudokiDict && window.FudokiDict.getTechOverride) {
              const techOverride = window.FudokiDict.getTechOverride(tokenData);
              if (techOverride && techOverride.reading) {
                textToSpeak = techOverride.reading;
              }
            }
            
            // 特殊处理：助词"は"单字时读作"wa"
            // 但要注意：如果surface是合并词汇（如"はつか"），则不应应用此规则
            if (
              tokenData.surface === 'は' &&
              tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞' &&
              isHaParticleReadingEnabled()
            ) {
              textToSpeak = 'わ';
            }
            
            return textToSpeak;
          } catch (e) {
            // 如果解析失败，使用原来的方法
            const kanjiEl = token.querySelector('.token-kanji');
            return kanjiEl ? kanjiEl.textContent : '';
          }
        } else {
          // 如果没有token数据，使用原来的方法
          const kanjiEl = token.querySelector('.token-kanji');
          return kanjiEl ? kanjiEl.textContent : '';
        }
      }).join('');
      speak(lineText);
    }
  };

  // 播放全部文本
  function playAllText() {
    if (isPlaying) {
      stopSpeaking();
      return;
    }
    
    // 检查是否有分析结果，优先使用content-area中的token数据（已过滤markdown标记）
    const content = document.getElementById('content');
    if (content && content.innerHTML.trim()) {
      // 从 line-container 逐行提取，保留标点符号和换行结构
      const lineContainers = content.querySelectorAll('.line-container');
      if (lineContainers.length > 0) {
        const lines = Array.from(lineContainers).map(lineContainer => {
          const lineParts = [];
          
          // 遍历 line-container 的所有子节点，按顺序提取内容
          lineContainer.childNodes.forEach(node => {
            // 跳过播放按钮
            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('play-line-btn')) {
              return;
            }
            
            // 处理 token-pill（词汇）
            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('token-pill')) {
              const tokenDataAttr = node.getAttribute('data-token');
              if (tokenDataAttr) {
                try {
                  const tokenData = JSON.parse(tokenDataAttr);
                  let textToSpeak = tokenData.reading || tokenData.surface || '';
                  
                  // 检查自定义词典
                  if (window.FudokiDict && window.FudokiDict.getTechOverride) {
                    const techOverride = window.FudokiDict.getTechOverride(tokenData);
                    if (techOverride && techOverride.reading) {
                      textToSpeak = techOverride.reading;
                    }
                  }
                  
                  // 特殊处理：助词"は"读作"わ"
                  if (
                    tokenData.surface === 'は' &&
                    tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞' &&
                    isHaParticleReadingEnabled()
                  ) {
                    textToSpeak = 'わ';
                  }
                  
                  lineParts.push(textToSpeak);
                } catch (e) {
                  const kanjiEl = node.querySelector('.token-kanji');
                  if (kanjiEl) lineParts.push(kanjiEl.textContent);
                }
              }
            }
            // 处理标点符号（.punct）
            else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('punct')) {
              const punctText = node.textContent;
              if (punctText) lineParts.push(punctText);
            }
            // 处理纯文本节点（非markdown标记的文本）
            else if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent.trim();
              if (text) lineParts.push(text);
            }
          });
          
          return lineParts.join('');
        });
        
        // 用换行符连接各行，这样 splitTextByPunctuation 可以识别换行停顿
        const fullText = lines.filter(line => line.trim()).join('\n');
        
        if (fullText.trim()) {
          console.log('使用content-area中的文本播放（已过滤markdown标记，保留标点和换行）');
          speak(fullText);
          return;
        }
      }
      
      // 如果没有 line-container，尝试直接提取所有内容
      const tokens = content.querySelectorAll('.token-pill, .punct');
      if (tokens.length > 0) {
        const readingParts = Array.from(tokens).map(node => {
          if (node.classList.contains('token-pill')) {
            const tokenDataAttr = node.getAttribute('data-token');
            if (tokenDataAttr) {
              try {
                const tokenData = JSON.parse(tokenDataAttr);
                let textToSpeak = tokenData.reading || tokenData.surface || '';
                
                if (window.FudokiDict && window.FudokiDict.getTechOverride) {
                  const techOverride = window.FudokiDict.getTechOverride(tokenData);
                  if (techOverride && techOverride.reading) {
                    textToSpeak = techOverride.reading;
                  }
                }
                
                if (
                  tokenData.surface === 'は' &&
                  tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞' &&
                  isHaParticleReadingEnabled()
                ) {
                  textToSpeak = 'わ';
                }
                
                return textToSpeak;
              } catch (e) {
                return node.textContent || '';
              }
            }
          } else if (node.classList.contains('punct')) {
            return node.textContent || '';
          }
          return '';
        }).join('');
        
        if (readingParts.trim()) {
          speak(readingParts);
          return;
        }
      }
    }
    
    // 只有在content-area完全没有内容时，才使用原始输入
    const text = textInput.value.trim();
    if (text) {
      console.log('content-area无内容，使用原始输入文本');
      speak(text);
    } else {
      showNotification(t('pleaseInputText'), 'warning');
    }
  }

  if (playAllBtn) playAllBtn.addEventListener('click', playAllText);
  if (headerPlayToggle) {
    headerPlayToggle.addEventListener('click', (e) => {
      if (isPlaying) {
        stopSpeaking();
      } else {
        playAllText();
      }
    });
  }

  // 暂停/恢复按钮
  if (headerPauseToggle) {
    headerPauseToggle.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;
      if (!isPlaying || !currentUtterance) return; // 未播放时不操作
      if (!isPaused) {
        // 执行暂停
        try { window.speechSynthesis.pause(); } catch (_) {}
        isPaused = true;
        clearProgressTimer(); // 暂停时停止进度计时器
        updatePauseButtonIcon(headerPauseToggle, isPlaying, isPaused);
      } else {
        // 执行恢复
        try { window.speechSynthesis.resume(); } catch (_) {}
        isPaused = false;
        // 恢复时间回退进度（若浏览器不触发边界事件）
        try {
          const segText = currentSegmentText || '';
          const baseChars = (PLAY_STATE.charPrefix[currentSegmentIndex] || 0) + Math.max(0, Math.min(segText.length, lastBoundaryCharIndex || 0));
          const remainingLen = Math.max(0, segText.length - (lastBoundaryCharIndex || 0));
          const est = estimateSegmentDuration(segText.slice(lastBoundaryCharIndex || 0), rate);
          const startTs = Date.now();
          clearProgressTimer();
          progressTimer = setInterval(() => {
            const elapsed = (Date.now() - startTs) / 1000;
            const frac = Math.max(0, Math.min(1, est ? (elapsed / est) : 0));
            const passedChars = baseChars + Math.round(frac * remainingLen);
            if (PLAY_STATE.totalChars > 0) setHeaderProgress(Math.max(0, Math.min(1, passedChars / PLAY_STATE.totalChars)));
            if (frac >= 1) clearProgressTimer();
          }, 80);
        } catch (_) {}
        updatePauseButtonIcon(headerPauseToggle, isPlaying, isPaused);
      }
    });
  }

  if (sidebarPlayAllBtn) {
    sidebarPlayAllBtn.addEventListener('click', playAllText);
  }

  // 分析按钮事件（按钮可能不存在）
  if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeText);

  // 文本框失焦且结构变化时自动解析
  function computeStructureSignature(text) {
    const s = (text || '').trim();
    if (!s) return '0|0';
    const lines = s.split(/\n+/).length;
    const sentences = s.split(/[。．\.!？!?；;]+/).filter(x => x.trim().length > 0).length;
    return `${lines}|${sentences}`;
  }

  let lastStructureSignature = computeStructureSignature(textInput ? textInput.value : '');
  if (textInput) {
    textInput.addEventListener('focus', () => {
      lastStructureSignature = computeStructureSignature(textInput.value);
    });
    textInput.addEventListener('blur', () => {
      const currentSig = computeStructureSignature(textInput.value);
      
      // 先检查是否需要删除空文档
      if (!textInput.value.trim()) {
        // 内容为空时，删除当前文档
        documentManager.deleteEmptyDocument();
        return; // 空文档无需分析
      }
      
      // 有内容时，检查是否需要分析
      if (currentSig !== lastStructureSignature) {
        analyzeText();
      } else if (textInput.value.trim()) {
        // 即使结构没有变化，如果有文本内容也要重新分析
        analyzeText();
      }
      lastStructureSignature = currentSig;
    });
  }

  // 清空和帮助按钮功能已移除

  // 通知系统与动画样式已抽离至 static/js/ui-utils.js（window.showNotification）

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          analyzeText();
          break;
        case 's':
          e.preventDefault();
          // 保存功能已移除
          break;
      }
    }
  });

  // 显示控制功能
  function initDisplayControls() {
    const getBool = (key, defaultVal = true) => {
      const v = localStorage.getItem(key);
      return v === null ? defaultVal : v === 'true';
    };
    // 设置弹窗内的显示开关（单一来源；键与运行时一致）
    const SWITCHES = [
      ['showKana', LS.showKana, true],
      ['showRomaji', LS.showRomaji, true],
      ['showPos', LS.showPos, true],
      ['showDetails', LS.showDetails, true],
      ['showUnderline', LS.showUnderline, true],
      ['tokenAlignLeft', LS.tokenAlignLeft, false],
      ['autoRead', LS.autoRead, false],
      ['repeatPlay', LS.repeatPlay, false],
      ['haAsWa', LS.haAsWa, true]
    ];
    SWITCHES.forEach(([id, key, def]) => {
      const cb = document.getElementById(id);
      if (!cb) return;
      cb.checked = getBool(key, def);
      if (id === 'repeatPlay') {
        repeatPlayCheckbox = cb;
        window.repeatPlayCheckbox = cb;
      }
      cb.addEventListener('change', () => {
        localStorage.setItem(key, String(cb.checked));
        updateDisplaySettings();
      });
    });
    updateDisplaySettings();
    updateReadingScriptDisplay();
  }

  function updateDisplaySettings() {
    const getBool = (key, defaultVal = true) => {
      const v = localStorage.getItem(key);
      return v === null ? defaultVal : v === 'true';
    };
    const showKana = getBool(LS.showKana);
    const showRomaji = getBool(LS.showRomaji);
    const showPos = getBool(LS.showPos);
    const showDetails = getBool(LS.showDetails);
    const showUnderline = getBool(LS.showUnderline);
    const tokenAlignLeft = getBool(LS.tokenAlignLeft, false);

    let styleElement = document.getElementById('display-control-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'display-control-styles';
      document.head.appendChild(styleElement);
    }

    let css = '';
    if (!showKana) css += '.display-kana { display: none !important; }\n';
    if (!showRomaji) css += '.display-romaji { display: none !important; }\n';
    if (!showPos) css += '.display-pos { display: none !important; }\n';
    if (!showDetails) css += '.token-details { display: none !important; }\n';
    if (!showUnderline) css += '.token-pill { border-bottom-color: transparent !important; }\n';
    styleElement.textContent = css;

    // 词块对齐（作用于行容器文本对齐）
    document.body.classList.toggle('token-align-left', tokenAlignLeft);

    if (!showDetails) {
      try {
        document.querySelectorAll('.token-details').forEach(d => { d.style.display = 'none'; });
        document.querySelectorAll('.token-pill').forEach(p => { p.classList.remove('active'); });
        activeTokenDetails = null;
      } catch (_) {}
    }
  }

  function initReadingModeToggle() {
    setReadingMode(isReadingMode, { updateUrl: false, force: true });
    [readingModeToggle, editorReadingToggle].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        setReadingMode(!isReadingMode);
      });
    });
    window.addEventListener('popstate', () => {
      try {
        const url = new URL(window.location.href);
        setReadingMode(url.searchParams.has('read'), { updateUrl: false, force: true });
      } catch (_) {}
    });
  }

  // 顶部编辑工具栏：日期、字数与星标
  function updateEditorToolbar() {
    try {
      const docs = documentManager.getAllDocuments();
      const activeId = documentManager.getActiveId();
      const doc = docs.find(d => d.id === activeId);

      if (editorDocDate) {
        const ts = doc ? (doc.updatedAt || doc.createdAt) : null;
        editorDocDate.textContent = ts ? documentManager.formatCreationTime(ts) : '';
      }
      if (editorCharCount) {
        const count = (textInput && textInput.value) ? textInput.value.length : 0;
        editorCharCount.textContent = `${count} 字`;
      }
      if (editorStarToggle) {
        const isFav = !!(doc && doc.favorite);
        editorStarToggle.classList.toggle('is-active', isFav);
        editorStarToggle.setAttribute('aria-pressed', String(isFav));
      }
      if (topbarDocTitle) {
        topbarDocTitle.textContent = doc ? documentManager.truncateTitle(documentManager.getDocumentTitle(doc.content), 32) : '';
      }
    } catch (_) {}
  }

  function initEditorToolbar() {
    if (editorStarToggle) {
      editorStarToggle.addEventListener('click', () => {
        const docs = documentManager.getAllDocuments();
        const activeId = documentManager.getActiveId();
        const docIndex = docs.findIndex(d => d.id === activeId);
        if (docIndex === -1) return;
        
        const doc = docs[docIndex];
        
        // 如果是示例文档，创建副本而不是修改原文档
        if (doc.folder === 'samples') {
          const newDoc = {
            id: documentManager.generateId(),
            content: textInput.value,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            locked: false,
            folder: null,
            folderId: null,
            favorite: true // 新副本直接设为收藏
          };
          
          docs.push(newDoc);
          documentManager.saveAllDocuments(docs);
          documentManager.setActiveId(newDoc.id);
          documentManager.render();
          updateEditorToolbar();
          
          // 显示提示
          const syncToast = document.getElementById('syncProgressToast');
          const syncText = document.getElementById('syncProgressText');
          if (syncToast && syncText) {
            syncText.textContent = 'サンプル文書のコピーをお気に入りに追加しました';
            syncToast.classList.add('show');
            setTimeout(() => {
              syncToast.classList.remove('show');
            }, 2000);
          }
          return;
        }
        
        // 普通文档直接切换收藏状态
        doc.favorite = !doc.favorite;
        documentManager.saveAllDocuments(docs);
        documentManager.render();
        updateEditorToolbar();
      });
    }

    if (textInput) {
      textInput.addEventListener('input', () => updateEditorToolbar());
    }

    updateEditorToolbar();
  }

  function initReadingModeInteractions() {
    // 主内容区不再绑定阅读模式交互，改由阅读浮层承载
  }

  // 设置弹窗内容构建（自绘控件：switch + FDSelect；无任何原生 select/confirm）
  function createToolbarContentHTML() {
    const switchRow = (id, labelKey) => `
      <label class="settings-row" for="${id}">
        <span class="settings-row-label" data-i18n="${labelKey}"></span>
        <span class="settings-row-control"><input type="checkbox" class="switch" id="${id}"></span>
      </label>`;
    return `
      <div class="settings-section">
        <div class="settings-section-title" data-i18n="voiceTitle"></div>
        <div class="settings-row">
          <span class="settings-row-label" data-i18n="voiceSelectLabel"></span>
          <span class="settings-row-control"><div class="fd-select" id="settingsVoiceSelect"></div></span>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-section-title" data-i18n="displayTitle"></div>
        ${switchRow('showKana', 'showKana')}
        ${switchRow('showRomaji', 'showRomaji')}
        ${switchRow('showPos', 'showPos')}
        ${switchRow('showUnderline', 'showUnderline')}
        ${switchRow('showDetails', 'showDetails')}
        ${switchRow('tokenAlignLeft', 'tokenAlignLeft')}
        <div class="settings-row">
          <span class="settings-row-label" data-i18n="readingScript"></span>
          <span class="settings-row-control"><div class="fd-select" id="readingScriptSelect"></div></span>
        </div>
        ${switchRow('autoRead', 'autoRead')}
        ${switchRow('repeatPlay', 'repeatPlay')}
        ${switchRow('haAsWa', 'haAsWaLabel')}
        <div class="settings-row">
          <span class="settings-row-label" data-i18n="fontSizeLabel"></span>
          <span class="settings-row-control">
            <input type="range" id="fontSizeRange" min="0.8" max="1.5" step="0.05" value="1">
            <span class="range-value" id="fontSizeValue">100%</span>
          </span>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-section-title" data-i18n="systemTitle"></div>
        <div class="settings-row">
          <span class="settings-row-label" data-i18n="themeLabel"></span>
          <span class="settings-row-control"><div class="fd-select" id="themeSelectMount"></div></span>
        </div>
        <div class="settings-row">
          <span class="settings-row-label" data-i18n="langLabel"></span>
          <span class="settings-row-control"><div class="fd-select" id="langSelectMount"></div></span>
        </div>
        <div class="settings-actions">
          <button type="button" class="btn" id="pwaInstallBtn" data-i18n="pwaTitle"></button>
          <button type="button" class="btn" id="exportJsonBtn" data-i18n="exportBtn"></button>
          <button type="button" class="btn" id="importJsonBtn" data-i18n="importBtn"></button>
        </div>
      </div>
    `;
  }
  // 设置弹窗：仅负责打开/关闭已有模态（不做内容注入）
  function initSettingsModal() {
    const btn = document.getElementById('settingsButton');
    const modal = document.getElementById('settingsModal');
    const closeBtn = document.getElementById('settingsModalClose');
    if (!modal) return;
    
    const openModal = () => { modal.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const closeModal = () => { modal.classList.remove('show'); document.body.style.overflow = ''; };
    
    // 如果设置按钮存在，绑定其点击事件
    if (btn) {
    btn.addEventListener('click', () => modal.classList.contains('show') ? closeModal() : openModal());
    }
    
    // 绑定关闭按钮
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    
    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && modal.classList.contains('show')) {
        e.preventDefault();
        closeModal();
      }
    });
    
    // 暴露 openModal 到全局，供其他地方调用
    window.openSettingsModal = openModal;
  }

  // 设置弹窗挂载：注入内容并创建 FDSelect / 备份导入
  let scriptFdSelect = null;
  let langFdSelect = null;

  function mountSettingsModalContent() {
    const body = document.getElementById('settingsModalBody');
    if (!body) return;
    if (body.childElementCount > 0) return; // 已挂载
    body.innerHTML = createToolbarContentHTML();

    // 语音选择（FDSelect，注册进 refreshVoices 同步链）
    const voiceMount = document.getElementById('settingsVoiceSelect');
    if (voiceMount && window.FDSelect) {
      voiceFdSelects.push(FDSelect.create(voiceMount, {
        placeholder: t('selectVoice'),
        onChange: (val) => {
          const v = voices.find(x => (x.voiceURI || x.name) === val);
          if (v) {
            currentVoice = v;
            try { localStorage.setItem(LS.voiceURI, v.voiceURI || v.name); } catch (_) {}
            restartPlaybackWithNewSettings();
          }
        }
      }));
    }

    // 读音表记（片假名 / 平假名）
    const scriptMount = document.getElementById('readingScriptSelect');
    if (scriptMount && window.FDSelect) {
      const cur = (() => {
        const v = localStorage.getItem(LS.readingScript);
        return v === 'hiragana' ? 'hiragana' : 'katakana';
      })();
      scriptFdSelect = FDSelect.create(scriptMount, { value: cur, onChange: onReadingScriptChange });
    }

    // 主题（深 / 浅）
    const themeMount = document.getElementById('themeSelectMount');
    if (themeMount && window.FDSelect) {
      themeFdSelect = FDSelect.create(themeMount, { value: savedThemePreference, onChange: setThemePreference });
    }

    // 界面语言
    const langMount = document.getElementById('langSelectMount');
    if (langMount && window.FDSelect) {
      langFdSelect = FDSelect.create(langMount, { value: currentLang, onChange: setLanguage });
    }

    updateSettingsModalTexts();

    try { initDisplayControls(); } catch (_) {}
    try { initFontSizeControls(); } catch (_) {}
    try { applyI18n(); } catch (_) {}
    try { if ('speechSynthesis' in window) refreshVoices(); } catch (_) {}

    // 备份导出
    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        showInfoToast(t('exporting'), 8000);
        try {
          await new Promise(r => setTimeout(r, 50));
          const payload = collectBackupPayload();
          downloadTextFile(`fudoki-backup-${formatNowForFile()}.json`, JSON.stringify(payload, null, 2));
          showSuccessToast(t('exportSuccess'));
        } catch (e) {
          console.error('Export failed:', e);
          showErrorToast(t('exportError'));
        }
      });
    }

    // 备份导入
    const importBtn = document.getElementById('importJsonBtn');
    const importFile = document.getElementById('importJsonFile');
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', () => {
        const file = importFile.files && importFile.files[0];
        if (!file) return;
        showDeleteConfirm(t('importConfirmOverwrite'), () => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              applyBackup(JSON.parse(String(reader.result || '')));
              showSuccessToast(t('importSuccess'));
            } catch (e) {
              console.error('Invalid backup file:', e);
              showErrorToast(t('importError'));
            } finally {
              importFile.value = '';
            }
          };
          reader.onerror = () => {
            showErrorToast(t('importError'));
            importFile.value = '';
          };
          reader.readAsText(file);
        }, () => {});
      });
    }
  }

  // 读音脚本切换回调（FDSelect）
  function onReadingScriptChange(val) {
    const v = val === 'hiragana' ? 'hiragana' : 'katakana';
    localStorage.setItem(LS.readingScript, v);
    updateReadingScriptDisplay();
  }

  // 语言切换后刷新 FDSelect 选项文案
  function updateSettingsModalTexts() {
    if (themeFdSelect) {
      themeFdSelect.setOptions([
        { value: 'dark', label: t('themeDark') },
        { value: 'light', label: t('themeLight') }
      ], true);
    }
    if (langFdSelect) {
      langFdSelect.setOptions([
        { value: 'ja', label: '日本語' },
        { value: 'en', label: 'English' },
        { value: 'zh', label: '中文' }
      ], true);
    }
    if (scriptFdSelect) {
      scriptFdSelect.setOptions([
        { value: 'katakana', label: t('katakanaLabel') },
        { value: 'hiragana', label: t('hiraganaLabel') }
      ], true);
    }
  }
  // TTS 条控件：语音 FDSelect（速度绑定见引擎区 headerSpeedSlider）
  function initVoiceAndSpeedControls() {
    const headerVoiceMount = document.getElementById('headerVoiceSelect');
    if (headerVoiceMount && window.FDSelect && !headerVoiceMount.dataset.fdReady) {
      headerVoiceMount.dataset.fdReady = '1';
      voiceFdSelects.push(FDSelect.create(headerVoiceMount, {
        compact: true,
        placeholder: t('selectVoice'),
        onChange: (val) => {
          const v = voices.find(x => (x.voiceURI || x.name) === val);
          if (v) {
            currentVoice = v;
            try { localStorage.setItem(LS.voiceURI, v.voiceURI || v.name); } catch (_) {}
            restartPlaybackWithNewSettings();
          }
        }
      }));
      try { refreshVoices(); } catch (_) {}
    }
  }
  // 编辑 ⇄ 分析 模式切换（分段控件与底部坞共用；状态持久化到 fudoki:mode）
  function setAppMode(mode, { persist = true } = {}) {
    const m = mode === 'analyze' ? 'analyze' : 'edit';
    document.body.setAttribute('data-mode', m);
    if (persist) { try { localStorage.setItem(LS.mode, m); } catch (_) {} }
    const editPane = document.getElementById('editorPane');
    const analyzePane = document.getElementById('analysisPane');
    if (editPane) editPane.hidden = m !== 'edit';
    if (analyzePane) analyzePane.hidden = m !== 'analyze';
    if (modeEditBtn) {
      modeEditBtn.classList.toggle('active', m === 'edit');
      modeEditBtn.setAttribute('aria-selected', String(m === 'edit'));
    }
    if (modeAnalyzeBtn) {
      modeAnalyzeBtn.classList.toggle('active', m === 'analyze');
      modeAnalyzeBtn.setAttribute('aria-selected', String(m === 'analyze'));
    }
    if (m === 'analyze') {
      try { analyzeText(); } catch (_) {}
    }
  }

  // 壳层交互：抽屉 / 搜索 / 模式 / 底部坞
  function initShell() {
    setAppMode(localStorage.getItem(LS.mode) === 'analyze' ? 'analyze' : 'edit', { persist: false });

    if (modeEditBtn) modeEditBtn.addEventListener('click', () => setAppMode('edit'));
    if (modeAnalyzeBtn) modeAnalyzeBtn.addEventListener('click', () => setAppMode('analyze'));

    // 移动端文档抽屉
    const backdrop = document.getElementById('docbarBackdrop');
    const openDrawer = (open) => {
      document.body.classList.toggle('docbar-open', open);
      if (backdrop) backdrop.hidden = !open;
    };
    if (docbarToggle) docbarToggle.addEventListener('click', () => openDrawer(!document.body.classList.contains('docbar-open')));
    if (backdrop) backdrop.addEventListener('click', () => openDrawer(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('docbar-open')) openDrawer(false);
    });

    // 文档栏搜索
    if (docSearchInput) {
      const debounced = debounce((q) => {
        if (documentManager) {
          documentManager.searchQuery = String(q || '').trim();
          documentManager.render();
        }
      }, 180);
      docSearchInput.addEventListener('input', (e) => debounced(e.target.value));
    }

    // 底部操作坞（移动端）
    if (dockNewBtn) dockNewBtn.addEventListener('click', () => {
      if (documentManager) documentManager.createDocument('');
      if (textInput) textInput.focus();
    });
    if (dockModeBtn) dockModeBtn.addEventListener('click', () => {
      setAppMode(document.body.getAttribute('data-mode') === 'analyze' ? 'edit' : 'analyze');
    });
    if (dockPlayBtn) dockPlayBtn.addEventListener('click', () => {
      setAppMode('analyze');
      playAllText();
    });

    initVoiceAndSpeedControls();
    renderFolderFilters();
  }

  function initializeApp() {
    mountSettingsModalContent(); // 设置弹窗（FDSelect + switches + 备份）
    initSettingsModal();         // 打开/关闭
    initReadingModeToggle();
    initReadingModeInteractions();
    setupPwaInstaller();
    initShell();
    try { initEditorToolbar(); } catch (_) {}
    try { applyI18n(); } catch (_) {}

    // 注入示例文章（异步），完成后刷新列表与筛选 chips
    try {
      documentManager.seedSampleDocumentsIfNeeded().then(() => {
        documentManager.render();
        renderFolderFilters();
      }).catch(() => {});
    } catch (_) {}

    // 全局函数（错误重试按钮等 inline onclick 使用）
    window.analyzeText = analyzeText;

    // 恢复字号缩放
    try { applyFontScaleFromStorage(); } catch (_) {}

    // 初始化时若有文本则自动分析，否则显示空状态
    if (textInput && textInput.value.trim()) {
      setTimeout(() => { try { analyzeText(); } catch (_) {} }, 100);
    } else if (typeof showEmptyState === 'function') {
      try { showEmptyState(); } catch (_) {}
    }
  }

  // 防抖已抽离至 static/js/ui-utils.js（window.debounce）


  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  // 全局键盘：在阅读模式下按 ESC 退出
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Escape' || e.key === 'Esc') && isReadingMode) {
      e.preventDefault();
      setReadingMode(false);
    }
  });



  // 字号缩放控制
  function initFontSizeControls() {
    const rangeEls = [
      document.getElementById('fontSizeRange'),
      document.getElementById('sidebarFontSizeRange'),
      document.getElementById('editorFontSizeRange')
    ].filter(Boolean);
    const valueEls = [
      document.getElementById('fontSizeValue'),
      document.getElementById('sidebarFontSizeValue'),
      document.getElementById('editorFontSizeValue')
    ].filter(Boolean);

    const applyScale = (v) => {
      const scale = Math.max(0.8, Math.min(1.5, parseFloat(v) || 1));
      document.documentElement.style.setProperty('--font-scale', String(scale));
      valueEls.forEach(el => { el.textContent = `${Math.round(scale * 100)}%`; });
      try { localStorage.setItem(LS.fontScale, String(scale)); } catch (_) {}
    };

    // 初始值来源：localStorage
    let initial = 1;
    try {
      const saved = localStorage.getItem(LS.fontScale);
      if (saved) initial = parseFloat(saved) || 1;
    } catch (_) {}

    // 赋初值并绑定两个滑块事件，保持同步
    if (rangeEls.length > 0) {
      rangeEls.forEach(r => { r.value = String(initial); });
      rangeEls.forEach(r => {
        const handler = () => {
          const val = r.value;
          applyScale(val);
          // 同步其它滑块的值
          rangeEls.forEach(other => { if (other !== r) other.value = val; });
        };
        r.addEventListener('input', handler);
        r.addEventListener('change', handler);
      });
    }

    applyScale(initial);
  }

  function applyFontScaleFromStorage() {
    try {
      const saved = localStorage.getItem(LS.fontScale);
      if (saved) {
        const scale = Math.max(0.8, Math.min(1.5, parseFloat(saved) || 1));
        document.documentElement.style.setProperty('--font-scale', String(scale));
      }
    } catch (_) {}
  }
  
  // 字体家族存储应用（输入区与显示区分别控制）
  function applyFontFamilyFromStorage() {
    try {
      const inFont = localStorage.getItem(LS.inputFont);
      const outFont = localStorage.getItem(LS.contentFont);
      if (inFont) document.documentElement.style.setProperty('--input-font-family', inFont);
      if (outFont) document.documentElement.style.setProperty('--content-font-family', outFont);
    } catch (_) {}
  }

  // 字体家族（FDSelect，编辑区/显示区分别控制）
  const FONT_OPTIONS = () => ([
    { value: '', label: t('fontSystem') },
    { value: 'Hiragino Sans,Meiryo,"Yu Gothic",system-ui', label: t('fontSans') },
    { value: 'Hiragino Mincho Pro,Noto Serif JP,"Times New Roman",Georgia,serif', label: t('fontSerif') },
    { value: 'PingFang SC,"Microsoft YaHei",system-ui,Arial,Helvetica', label: t('fontHei') },
    { value: 'Menlo,Monaco,Consolas,"Courier New",monospace', label: t('fontMono') }
  ]);

  function initFontFamilyControls() {
    const mounts = [
      ['editorInputFontSelect', '--input-font-family', LS.inputFont],
      ['editorContentFontSelect', '--content-font-family', LS.contentFont]
    ];
    mounts.forEach(([id, cssVar, lsKey]) => {
      const mount = document.getElementById(id);
      if (!mount || !window.FDSelect || mount.dataset.fdReady) return;
      mount.dataset.fdReady = '1';
      const saved = localStorage.getItem(lsKey) || '';
      FDSelect.create(mount, {
        options: FONT_OPTIONS(),
        value: saved,
        onChange: (val) => {
          if (val) {
            document.documentElement.style.setProperty(cssVar, val);
            try { localStorage.setItem(lsKey, val); } catch (_) {}
          } else {
            document.documentElement.style.removeProperty(cssVar);
            try { localStorage.removeItem(lsKey); } catch (_) {}
          }
        }
      });
    });
    applyFontFamilyFromStorage();
  }

  // DOM 就绪后恢复字体设置
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { applyFontFamilyFromStorage(); } catch (_) {}
      try { initFontFamilyControls(); } catch (_) {}
    });
  } else {
    try { applyFontFamilyFromStorage(); } catch (_) {}
    try { initFontFamilyControls(); } catch (_) {}
  }

})();
