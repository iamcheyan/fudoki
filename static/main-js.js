(() => {
  // 元素选择器 - 适配新的界面结构
  const $ = (id) => document.getElementById(id);
  const textInput = $('textInput');
  const analyzeBtn = $('analyzeBtn');
  const content = $('content');
  const voiceSelect = $('voiceSelect');
  const speedSlider = $('speedRange');
  const speedValue = $('speedValue');
  const playAllBtn = $('playAllBtn');
  const headerPlayToggle = $('headerPlayToggle');
  const headerDownloadBtn = $('headerDownloadBtn');
  const newDocBtn = $('newDocBtn');
  const documentList = $('documentList');
  const folderList = $('folderList');
  const langSelect = $('langSelect');
  const themeSelect = document.getElementById('themeSelect');
  const readingModeToggle = $('readingModeToggle');
  const editorReadingToggle = document.getElementById('editorReadingToggle');
  const editorDocDate = document.getElementById('editorDocDate');
  const editorCharCount = document.getElementById('editorCharCount');
  const editorStarToggle = document.getElementById('editorStarToggle');
  const editorDeleteBtn = document.getElementById('editorDeleteBtn');
  const themeToggleBtn = document.getElementById('theme-toggle');
  // 导航语言国旗按钮
  const langFlagJA = $('langFlagJA');
  const langFlagEN = $('langFlagEN');
  const langFlagZH = $('langFlagZH');
  // 移动端语言下拉
  const langDropdownBtn = $('langDropdownBtn');
  const langDropdownMenu = $('langDropdownMenu');
  const langDropdownIcon = $('langDropdownIcon');
  
  // 右侧边栏元素
  const sidebarVoiceSelect = $('sidebarVoiceSelect');
  const sidebarSpeedSlider = $('sidebarSpeedRange');
  const sidebarSpeedValue = $('sidebarSpeedValue');
  const sidebarPlayAllBtn = $('sidebarPlayAllBtn');
  const sidebarLangSelect = $('sidebarLangSelect');
  const sidebarThemeSelect = $('sidebarThemeSelect');
  
  // 显示控制元素
  const showKanaCheckbox = $('showKana');
  const showRomajiCheckbox = $('showRomaji');
  const showPosCheckbox = $('showPos');
  const autoReadCheckbox = $('autoRead');
  const repeatPlayCheckbox = $('repeatPlay');

  const pwaToast = $('pwaInstallToast');
  const pwaToastIcon = $('pwaInstallIcon');
  const pwaToastTitle = $('pwaInstallTitle');
  const pwaToastMessage = $('pwaInstallMessage');
  const pwaToastProgress = $('pwaInstallProgress');
  const pwaToastBar = $('pwaInstallProgressBar');
  const pwaToastClose = $('pwaToastClose');
  
  // 侧边栏显示控制元素
  const sidebarShowKanaCheckbox = $('sidebarShowKana');
  const sidebarShowRomajiCheckbox = $('sidebarShowRomaji');
  const sidebarShowPosCheckbox = $('sidebarShowPos');
  const sidebarAutoReadCheckbox = $('sidebarAutoRead');
  const sidebarRepeatPlayCheckbox = $('sidebarRepeatPlay');

  // 本地存储键
  const LS = { 
    text: 'text', 
    voiceURI: 'voiceURI', 
    rate: 'rate', 
    texts: 'texts', 
    activeId: 'activeId',
    activeFolder: 'activeFolder',
    showKana: 'showKana',
    showRomaji: 'showRomaji', 
    showPos: 'showPos',
    showDetails: 'showDetails',
    autoRead: 'autoRead',
    repeatPlay: 'repeatPlay',
    lang: 'lang',
    theme: 'theme',
    showUnderline: 'showUnderline',
    readingScript: 'readingScript'
  };

  const PWA_MANIFEST_URL = 'static/pwa-assets.json';
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

  let isReadingMode = false;
  let activeReadingLine = null;
  const initialUrlSearch = (() => {
    try {
      return new URL(window.location.href).searchParams;
    } catch (_) {
      return null;
    }
  })();

  if (initialUrlSearch && initialUrlSearch.has('read')) {
    isReadingMode = true;
    if (document.body) {
      document.body.id = 'reading-mode';
    }
  }

  // ====== 文件夹管理（简化版：仅"全部"和"收藏"） ======
  function getActiveFolderId() {
    return localStorage.getItem(LS.activeFolder) || 'all';
  }
  function setActiveFolderId(id) {
    localStorage.setItem(LS.activeFolder, id || 'all');
  }

  function renderFolders() {
    if (!folderList) return;
    const activeId = getActiveFolderId();
    folderList.innerHTML = '';

    // 虚拟 "全部"（多语言）
    const allItem = document.createElement('div');
    allItem.className = 'folder-item' + (activeId === 'all' ? ' active' : '');
    allItem.dataset.folderId = 'all';
    allItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3,13h2v-2H3V13M7,13h2v-2H7V13M11,13h2v-2H11V13M15,13h2v-2H15V13M19,13h2v-2H19V13M3,17h2v-2H3V17M7,17h2v-2H7V17M11,17h2v-2H11V17M15,17h2v-2H15V17M19,17h2v-2H19V17M3,9h2V7H3V9M7,9h2V7H7V9M11,9h2V7H11V9M15,9h2V7H15V9M19,9h2V7H19V9"/>
      </svg>
      <div>${t('folderAll')}</div>
    `;
    allItem.addEventListener('click', () => { selectFolder('all'); });
    folderList.appendChild(allItem);

    // 固定"收藏"（多语言）
    const favItem = document.createElement('div');
    favItem.className = 'folder-item' + (activeId === 'favorites' ? ' active' : '');
    favItem.dataset.folderId = 'favorites';
    favItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      <div>${t('folderFavorites')}</div>
    `;
    favItem.addEventListener('click', () => { selectFolder('favorites'); });
    folderList.appendChild(favItem);

    // 同步左侧标题（冗余设置，确保语言切换后与首次渲染都正确）
    const folderTitleEl = $('sidebarFolderTitle');
    if (folderTitleEl) folderTitleEl.textContent = t('sidebarFolderTitle');
  }

  function selectFolder(id) {
    const act = folderList.querySelector('.folder-item.active');
    if (act) act.classList.remove('active');
    const newItem = folderList.querySelector(`.folder-item[data-folder-id="${id}"]`);
    if (newItem) newItem.classList.add('active');
    setActiveFolderId(id);
    // 重新渲染文档列表（按文件夹过滤）
    if (documentManager) documentManager.render();
  }

  // 简易i18n词典（默认日语）
  const I18N = {
    ja: {
      title: 'Fudoki',
      navAnalyze: 'テキスト解析',
      navTTS: '音声読み上げ',
      navHelp: 'ヘルプ',
      sidebarDocsTitle: 'ドキュメント',
      newDoc: '＋ 新規ドキュメント',
      deleteDoc: 'ドキュメント削除',
      textareaPlaceholder: 'ここに日本語テキストを入力して解析…',
      analyzeBtn: '解析する',
      emptyText: '上の入力欄に日本語を入力し「解析する」をクリックしてください',
      voiceTitle: '音声設定',
      voiceSelectLabel: '音声を選択',
      selectVoice: '音声を選択...',
      speedLabel: '話速',
      playAll: '全文再生',
      displayTitle: '表示設定',
      showKana: 'ふりがなを表示',
      showRomaji: 'ローマ字を表示',
      showPos: '品詞を表示',
      showUnderline: '品詞の色下線',
      autoRead: '自動読み上げ',
      repeatPlay: 'リピート再生',
      readingToggleEnter: '読書モード',
      readingToggleExit: '通常表示へ',
      readingToggleTooltipEnter: '読書モードに入る',
      readingToggleTooltipExit: '通常表示に戻る',
      systemTitle: 'システム設定',
      themeLabel: 'テーマモード',
      themeLight: 'ライトモード',
      themeDark: 'ダークモード',
      themeAuto: 'システムに従う',
      langLabel: 'インターフェース言語',
      loading: 'テキストを解析中…',
      errorPrefix: '解析に失敗しました: '
      ,lbl_surface: '表層形'
      ,lbl_base: '基本形'
      ,lbl_reading: '読み'
      ,lbl_translation: '翻訳'
      ,lbl_pos: '品詞'
      ,lbl_pos_raw: '原始タグ'
      ,dict_init: '辞書を初期化中…'
      ,no_translation: '翻訳が見つかりません'
      ,translation_failed: '翻訳の読み込みに失敗しました'
      ,dlg_detail_translation: 'の詳細翻訳'
      ,lbl_field: '分野'
      ,lbl_note: '備考'
      ,lbl_chinese: '中文'
      ,folderAll: 'すべて',
      folderFavorites: 'お気に入り',
      sidebarFolderTitle: 'フォルダー管理',
      favorite: 'お気に入り',
      unfavorite: 'お気に入り解除',
      cannotDeleteDefault: 'デフォルトのドキュメントは削除できません',
      confirmDelete: 'ドキュメント「{title}」を削除しますか？',
      pleaseInputText: '先にテキストを入力してください',
      noJapaneseVoice: '日本語音声は利用できません',
      untitledDocument: '無題のドキュメント',
      play: '再生',
      stop: '停止',
      pause: '一時停止',
      playThisLine: 'この行を再生',
      expand: '展開',
      collapse: '折りたたむ',
      showUnderline: '品詞ラインを表示',
      showDetails: '詳細を表示',
      readingScript: 'ふりがな表記',
      katakanaLabel: 'カタカナ',
      hiraganaLabel: 'ひらがな',
      pwaTitle: 'オフラインダウンロード',
      pwaPreparing: 'オフライン用リソースを準備しています…',
      pwaProgress: 'キャッシュ中 {completed}/{total} 件（{percent}%）',
      pwaComplete: 'すべてのリソースを保存しました。オフラインでも利用できます。',
      pwaPartial: '一部のファイルを保存できませんでした。{failed} 件失敗しました。',
      pwaError: 'キャッシュに失敗しました: {message}',
      pwaUnsupported: 'このブラウザーはオフラインインストールに対応していません。',
      pwaAlreadyCaching: 'リソースをダウンロードしています…',
      pwaDismiss: '閉じる'
    },
    en: {
      title: 'Fudoki',
      navAnalyze: 'Analyze',
      navTTS: 'TTS',
      navHelp: 'Help',
      sidebarDocsTitle: 'Documents',
      newDoc: '+ New Document',
      deleteDoc: 'Delete Document',
      textareaPlaceholder: 'Enter Japanese text here for analysis…',
      analyzeBtn: 'Analyze',
      emptyText: 'Type Japanese above, then click "Analyze" to start',
      voiceTitle: 'Voice Settings',
      voiceSelectLabel: 'Voice',
      selectVoice: 'Select voice...',
      speedLabel: 'Speed',
      playAll: 'Play All',
      displayTitle: 'Display Settings',
      showKana: 'Show Kana',
      showRomaji: 'Show Romaji',
      showPos: 'Show POS',
      showDetails: 'Show token details',
      showUnderline: 'POS underline color',
      autoRead: 'Auto Read',
      repeatPlay: 'Repeat Play',
      readingToggleEnter: 'Reading Mode',
      readingToggleExit: 'Exit Reading',
      readingToggleTooltipEnter: 'Enable reading mode',
      readingToggleTooltipExit: 'Exit reading mode',
      systemTitle: 'System Settings',
      themeLabel: 'Theme Mode',
      themeLight: 'Light Mode',
      themeDark: 'Dark Mode',
      themeAuto: 'Follow System',
      langLabel: 'Interface Language',
      loading: 'Analyzing text…',
      errorPrefix: 'Analysis failed: '
      ,lbl_surface: 'Surface'
      ,lbl_base: 'Base'
      ,lbl_reading: 'Reading'
      ,lbl_translation: 'Translation'
      ,lbl_pos: 'Part of speech'
      ,lbl_pos_raw: 'Raw tags'
      ,dict_init: 'Initializing dictionary…'
      ,no_translation: 'No translation found'
      ,translation_failed: 'Failed to load translation'
      ,dlg_detail_translation: ' — details'
      ,lbl_field: 'Field'
      ,lbl_note: 'Note'
      ,lbl_chinese: 'Chinese'
      ,folderAll: 'All',
      folderFavorites: 'Favorites',
      sidebarFolderTitle: 'Folders',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      cannotDeleteDefault: 'Cannot delete the default document',
      confirmDelete: 'Delete document "{title}"?',
      pleaseInputText: 'Please enter text first',
      noJapaneseVoice: 'Japanese voice is unavailable',
      untitledDocument: 'Untitled Document',
      play: 'Play',
      stop: 'Stop',
      pause: 'Pause',
      playThisLine: 'Play this line',
      expand: 'Expand',
      collapse: 'Collapse',
      showUnderline: 'Show POS underline',
      readingScript: 'Reading script',
      katakanaLabel: 'Katakana',
      hiraganaLabel: 'Hiragana',
      pwaTitle: 'Offline Pack',
      pwaPreparing: 'Preparing offline resources…',
      pwaProgress: 'Caching {completed}/{total} files ({percent}%)',
      pwaComplete: 'All resources cached. You can use Fudoki offline now.',
      pwaPartial: '{failed} files could not be cached. Please retry.',
      pwaError: 'Caching failed: {message}',
      pwaUnsupported: 'This browser does not support offline installation.',
      pwaAlreadyCaching: 'Download in progress…',
      pwaDismiss: 'Dismiss'
    },
    zh: {
      title: 'Fudoki',
      navAnalyze: '文本分析',
      navTTS: '语音朗读',
      navHelp: '帮助',
      sidebarDocsTitle: '文档管理',
      newDoc: '+ 新建文档',
      deleteDoc: '删除文档',
      textareaPlaceholder: '在此输入日语文本进行分析...',
      analyzeBtn: '分析文本',
      emptyText: '请在上方输入日语文本，点击"分析文本"开始处理',
      voiceTitle: '语音设置',
      voiceSelectLabel: '语音选择',
      selectVoice: '选择语音...',
      speedLabel: '语速调节',
      playAll: '播放全文',
      displayTitle: '显示设置',
      showKana: '显示假名',
      showRomaji: '显示罗马音',
      showPos: '显示词性',
      showDetails: '显示词汇详情',
      autoRead: '自动朗读',
      repeatPlay: '重复播放',
      readingToggleEnter: '阅读模式',
      readingToggleExit: '退出阅读',
      readingToggleTooltipEnter: '进入阅读模式',
      readingToggleTooltipExit: '退出阅读模式',
      systemTitle: '系统设置',
      themeLabel: '主题模式',
      themeLight: '浅色模式',
      themeDark: '深色模式',
      themeAuto: '跟随系统',
      langLabel: '界面语言',
      loading: '正在分析文本...',
      errorPrefix: '分析失败: '
      ,lbl_surface: '表层形'
      ,lbl_base: '基本形'
      ,lbl_reading: '读音'
      ,lbl_translation: '翻译'
      ,lbl_pos: '词性'
      ,lbl_pos_raw: '原始标签'
      ,dict_init: '正在初始化词典...'
      ,no_translation: '未找到翻译'
      ,translation_failed: '翻译加载失败'
      ,dlg_detail_translation: ' 的详细翻译'
      ,lbl_field: '领域'
      ,lbl_note: '备注'
      ,lbl_chinese: '中文'
      ,folderAll: '全部',
      folderFavorites: '收藏',
      sidebarFolderTitle: '文件夹管理',
      favorite: '收藏',
      unfavorite: '取消收藏',
      cannotDeleteDefault: '默认文档不能删除',
      confirmDelete: '确定要删除文档"{title}"吗？',
      pleaseInputText: '请先输入文本',
      noJapaneseVoice: '日语语音不可用',
      untitledDocument: '无标题文档',
      play: '播放',
      stop: '停止',
      pause: '暂停',
      playThisLine: '播放这一行',
      expand: '展开',
      collapse: '收缩',
      showUnderline: '显示词性下划线',
      readingScript: '读音脚本',
      katakanaLabel: '片假名',
      hiraganaLabel: '平假名',
      pwaTitle: '离线资源包',
      pwaPreparing: '正在准备离线资源…',
      pwaProgress: '正在缓存 {completed}/{total} 个文件（{percent}%）',
      pwaComplete: '离线资源已就绪，可以断网使用。',
      pwaPartial: '有 {failed} 个文件缓存失败，请稍后重试。',
      pwaError: '缓存失败：{message}',
      pwaUnsupported: '当前浏览器不支持离线安装。',
      pwaAlreadyCaching: '正在下载离线资源…',
      pwaDismiss: '关闭提示'
    }
  };

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
  // 初始化文件夹列表（固定两项）
  renderFolders();
  // 当前显示的详情弹层及其锚点
  let activeTokenDetails = null; // { element, details }

  // 计算并设置详情弹层的位置
  function positionTokenDetails(element, details) {
    if (!element || !details) return;
    
    // 将 details 移动到 body 最底层
    if (details.parentNode !== document.body) {
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

  function handleServiceWorkerMessage(event) {
    const data = event.data;
    if (!data || data.requestId && data.requestId !== PWA_STATE.requestId) {
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
      headerDownloadBtn?.classList.remove('is-loading');
      const progressValue = data.total ? data.completed / data.total : 1;

      if (PWA_STATE.failed > 0) {
        // 在控制台打印详细的失败信息
        console.group('[PWA] 缓存完成 - 失败统计:');
        console.log(`总文件数: ${PWA_STATE.total}`);
        console.log(`成功缓存: ${PWA_STATE.completed}`);
        console.log(`失败文件: ${PWA_STATE.failed}`);
        console.log(`最后错误: ${PWA_STATE.lastError}`);
        console.groupEnd();
        
        const details = formatFailedAssetsSummary(5);
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
    headerDownloadBtn?.classList.add('is-loading');

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
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      PWA_STATE.registration = registration;
      const ready = await navigator.serviceWorker.ready;
      const controller = navigator.serviceWorker.controller || ready.active || registration.active;
      if (!controller) {
        throw new Error('no-controller');
      }

      if (!pwaListenerAttached) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        pwaListenerAttached = true;
      }

      PWA_STATE.requestId = `pwa-${Date.now()}`;
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
      headerDownloadBtn?.classList.remove('is-loading');
      updatePwaToast('error', {
        title: formatMessage('pwaTitle'),
        message: formatMessage('pwaError', { message: error?.message || 'unknown' }),
        progress: 0,
        icon: 'error'
      });
    }
  }

  function setupPwaInstaller() {
    if (!headerDownloadBtn) return;

    if (pwaToastClose) {
      pwaToastClose.addEventListener('click', () => hidePwaToast(0));
    }

    if (!('serviceWorker' in navigator) || !(window && 'caches' in window)) {
      headerDownloadBtn.addEventListener('click', (event) => {
        event.preventDefault();
        updatePwaToast('error', {
          title: formatMessage('pwaTitle'),
          message: formatMessage('pwaUnsupported'),
          icon: 'error'
        });
      });
      return;
    }

    headerDownloadBtn.addEventListener('click', startPwaDownload);
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
    if (document.body.id !== 'reading-mode') return;
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

    // 添加按钮点击动画 - 修复定位问题
    if (readingModeToggle && shouldEnable) {
      // 使用 CSS 类而不是直接设置 transform，避免影响定位
      readingModeToggle.classList.add('click-animation');
      setTimeout(() => {
        readingModeToggle.classList.remove('click-animation');
      }, 150);
    }

    // 添加退出阅读模式的动画
    if (readingModeToggle && !shouldEnable && isReadingMode) {
      readingModeToggle.classList.add('exit-animation');
      setTimeout(() => {
        readingModeToggle.classList.remove('exit-animation');
      }, 300);
    }

    isReadingMode = shouldEnable;
    
    // 使用 requestAnimationFrame 确保动画流畅
    requestAnimationFrame(() => {
      document.body.id = shouldEnable ? 'reading-mode' : '';
      
      [readingModeToggle, editorReadingToggle].forEach((btn) => {
        if (!btn) return;
        btn.classList.toggle('is-active', shouldEnable);
        btn.setAttribute('aria-pressed', String(shouldEnable));
      });
      
      updateReadingToggleLabels();
      
      if (!shouldEnable) {
        clearReadingLineHighlight();
      }
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

  // 播放全文按钮的动态文案
  function playAllLabel(playing) {
    switch (currentLang) {
      case 'ja':
        return playing ? '一時停止' : '全文再生';
      case 'en':
        return playing ? 'Pause' : 'Play All';
      case 'zh':
      default:
        return playing ? '暂停' : '播放全文';
    }
  }

  function applyI18n() {
    // 语言代码与标题
    document.documentElement.lang = currentLang;
    document.title = t('title');

    const logoText = $('logoText');
    if (logoText) logoText.textContent = t('title');
    // 导航菜单内容固定，不跟随语言切换
    // const navAnalyze = $('navAnalyze');
    // if (navAnalyze) navAnalyze.textContent = t('navAnalyze');
    // const navTTS = $('navTTS');
    // if (navTTS) navTTS.textContent = t('navTTS');
    // const navHelp = $('navHelp');
    // if (navHelp) navHelp.textContent = t('navHelp');

    const sidebarDocsTitle = $('sidebarDocsTitle');
    if (sidebarDocsTitle) sidebarDocsTitle.textContent = t('sidebarDocsTitle');
    if (newDocBtn) newDocBtn.textContent = t('newDoc');
    const deleteDocBtn = $('deleteDocBtn');
    if (deleteDocBtn) deleteDocBtn.textContent = t('deleteDoc');

    if (textInput) textInput.placeholder = t('textareaPlaceholder');
    if (analyzeBtn) analyzeBtn.textContent = t('analyzeBtn');

    // 工具栏头部标题
    const toolbarTitle = $('voiceTitle');
    if (toolbarTitle) toolbarTitle.textContent = t('systemTitle');

    const voiceTitle = $('voiceSettingsTitle');
    if (voiceTitle) voiceTitle.textContent = t('voiceTitle');
    const voiceSelectLabel = $('voiceSelectLabel');
    if (voiceSelectLabel) {
      voiceSelectLabel.title = t('voiceSelectLabel');
      const s = voiceSelectLabel.querySelector('.label-text');
      if (s) s.textContent = t('voiceSelectLabel');
    }
    const speedLabel = $('speedLabel');
    if (speedLabel) {
      speedLabel.title = t('speedLabel');
      const s = speedLabel.querySelector('.label-text');
      if (s) s.textContent = t('speedLabel');
    }
    if (playAllBtn) {
      // 改为仅更新提示文本，不插入按钮文字
      const currentlyPlaying = isPlaying && currentUtterance;
      playAllBtn.title = playAllLabel(currentlyPlaying);
    }

    const displayTitle = $('displayTitle');
    if (displayTitle) displayTitle.textContent = t('displayTitle');
    // 读音脚本标签与选项
    const readingScriptLabel = $('readingScriptLabel');
    if (readingScriptLabel) readingScriptLabel.textContent = t('readingScript');
    const readingScriptOptionKatakana = $('readingScriptOptionKatakana');
    if (readingScriptOptionKatakana) readingScriptOptionKatakana.textContent = t('katakanaLabel');
    const readingScriptOptionHiragana = $('readingScriptOptionHiragana');
    if (readingScriptOptionHiragana) readingScriptOptionHiragana.textContent = t('hiraganaLabel');
    const showKanaLabel = $('showKanaLabel');
    if (showKanaLabel) {
      showKanaLabel.title = t('showKana');
      const s = showKanaLabel.querySelector('.label-text');
      if (s) s.textContent = t('showKana');
    }
    const showRomajiLabel = $('showRomajiLabel');
    if (showRomajiLabel) {
      showRomajiLabel.title = t('showRomaji');
      const s = showRomajiLabel.querySelector('.label-text');
      if (s) s.textContent = t('showRomaji');
    }
    const showPosLabel = $('showPosLabel');
    if (showPosLabel) {
      showPosLabel.title = t('showPos');
      const s = showPosLabel.querySelector('.label-text');
      if (s) s.textContent = t('showPos');
    }
    const showUnderlineLabel = $('showUnderlineLabel');
    if (showUnderlineLabel) {
      showUnderlineLabel.title = t('showUnderline');
      const s = showUnderlineLabel.querySelector('.label-text');
      if (s) s.textContent = t('showUnderline');
    }
    const autoReadLabel = $('autoReadLabel');
    if (autoReadLabel) {
      autoReadLabel.title = t('autoRead');
      const s = autoReadLabel.querySelector('.label-text');
      if (s) s.textContent = t('autoRead');
    }
    const repeatPlayLabel = $('repeatPlayLabel');
    if (repeatPlayLabel) {
      repeatPlayLabel.title = t('repeatPlay');
      const s = repeatPlayLabel.querySelector('.label-text');
      if (s) s.textContent = t('repeatPlay');
    }

    // 系统设置标签
    const systemTitle = $('systemTitle');
    if (systemTitle) systemTitle.textContent = t('systemTitle');
    const themeLabel = $('themeLabel');
    if (themeLabel) themeLabel.textContent = t('themeLabel');
    const langLabel = $('langLabel');
    if (langLabel) langLabel.textContent = t('langLabel');

    // 右侧边栏标签更新
    const sidebarVoiceSettingsTitle = $('sidebarVoiceSettingsTitle');
    if (sidebarVoiceSettingsTitle) sidebarVoiceSettingsTitle.textContent = t('voiceTitle');
    const sidebarDisplayTitle = $('sidebarDisplayTitle');
    if (sidebarDisplayTitle) sidebarDisplayTitle.textContent = t('displayTitle');
    const sidebarSystemTitle = $('sidebarSystemTitle');
    if (sidebarSystemTitle) sidebarSystemTitle.textContent = t('systemTitle');
    const sidebarVoiceSelectLabel = $('sidebarVoiceSelectLabel');
    if (sidebarVoiceSelectLabel) sidebarVoiceSelectLabel.textContent = t('voiceSelectLabel');
    const sidebarSpeedLabel = $('sidebarSpeedLabel');
    if (sidebarSpeedLabel) sidebarSpeedLabel.textContent = t('speedLabel');
    
    const sidebarShowKanaLabel = $('sidebarShowKanaLabel');
    if (sidebarShowKanaLabel) sidebarShowKanaLabel.lastChild && (sidebarShowKanaLabel.lastChild.textContent = ' ' + t('showKana'));
    const sidebarShowRomajiLabel = $('sidebarShowRomajiLabel');
    if (sidebarShowRomajiLabel) sidebarShowRomajiLabel.lastChild && (sidebarShowRomajiLabel.lastChild.textContent = ' ' + t('showRomaji'));
    const sidebarShowPosLabel = $('sidebarShowPosLabel');
    if (sidebarShowPosLabel) sidebarShowPosLabel.lastChild && (sidebarShowPosLabel.lastChild.textContent = ' ' + t('showPos'));
    const sidebarShowUnderlineLabel = $('sidebarShowUnderlineLabel');
    if (sidebarShowUnderlineLabel) sidebarShowUnderlineLabel.lastChild && (sidebarShowUnderlineLabel.lastChild.textContent = ' ' + t('showUnderline'));
    const sidebarAutoReadLabel = $('sidebarAutoReadLabel');
    if (sidebarAutoReadLabel) sidebarAutoReadLabel.lastChild && (sidebarAutoReadLabel.lastChild.textContent = ' ' + t('autoRead'));
    const sidebarRepeatPlayLabel = $('sidebarRepeatPlayLabel');
    if (sidebarRepeatPlayLabel) sidebarRepeatPlayLabel.lastChild && (sidebarRepeatPlayLabel.lastChild.textContent = ' ' + t('repeatPlay'));
    const sidebarReadingScriptLabel = $('sidebarReadingScriptLabel');
    if (sidebarReadingScriptLabel) sidebarReadingScriptLabel.textContent = t('readingScript');
    const sidebarReadingScriptOptionKatakana = $('sidebarReadingScriptOptionKatakana');
    if (sidebarReadingScriptOptionKatakana) sidebarReadingScriptOptionKatakana.textContent = t('katakanaLabel');
    const sidebarReadingScriptOptionHiragana = $('sidebarReadingScriptOptionHiragana');
    if (sidebarReadingScriptOptionHiragana) sidebarReadingScriptOptionHiragana.textContent = t('hiraganaLabel');
    
    const sidebarThemeLabel = $('sidebarThemeLabel');
    if (sidebarThemeLabel) sidebarThemeLabel.textContent = t('themeLabel');
    const sidebarLangLabel = $('sidebarLangLabel');
    if (sidebarLangLabel) sidebarLangLabel.textContent = t('langLabel');

    // 更新右侧边栏的播放全文按钮
    if (sidebarPlayAllBtn) {
      const currentlyPlaying = isPlaying && currentUtterance;
      sidebarPlayAllBtn.textContent = playAllLabel(currentlyPlaying);
    }

    // 更新主题选择选项的文本
    if (themeSelect) {
      const lightOption = themeSelect.querySelector('option[value="light"]');
      const darkOption = themeSelect.querySelector('option[value="dark"]');
      const autoOption = themeSelect.querySelector('option[value="auto"]');
      if (lightOption) lightOption.textContent = t('themeLight');
      if (darkOption) darkOption.textContent = t('themeDark');
      if (autoOption) autoOption.textContent = t('themeAuto');
    }

    // 更新侧边栏主题选择选项的文本
    if (sidebarThemeSelect) {
      const sidebarLightOption = sidebarThemeSelect.querySelector('option[value="light"]');
      const sidebarDarkOption = sidebarThemeSelect.querySelector('option[value="dark"]');
      const sidebarAutoOption = sidebarThemeSelect.querySelector('option[value="auto"]');
      if (sidebarLightOption) sidebarLightOption.textContent = t('themeLight');
      if (sidebarDarkOption) sidebarDarkOption.textContent = t('themeDark');
      if (sidebarAutoOption) sidebarAutoOption.textContent = t('themeAuto');
    }

    const emptyText = $('emptyText');
    if (emptyText) emptyText.textContent = t('emptyText');

    if (langSelect) {
      langSelect.value = currentLang;
      Array.from(langSelect.options || []).forEach(opt => opt.selected = (opt.value === currentLang));
    }
    
    // 同步更新侧边栏语言选择器
    if (sidebarLangSelect) {
      sidebarLangSelect.value = currentLang;
      Array.from(sidebarLangSelect.options || []).forEach(opt => opt.selected = (opt.value === currentLang));
    }
    // 同步导航国旗按钮的选中状态
    const flagMap = { ja: langFlagJA, en: langFlagEN, zh: langFlagZH };
    Object.values(flagMap).forEach(btn => { if (btn) btn.classList.remove('active'); });
    if (flagMap[currentLang]) flagMap[currentLang].classList.add('active');
    // 更新移动端下拉的当前国旗图标
    if (langDropdownIcon) {
      const iconCfg = {
        ja: { src: 'static/flags/ja.svg', alt: '日本語', title: '日本語' },
        en: { src: 'static/flags/en.svg', alt: 'English', title: 'English' },
        zh: { src: 'static/flags/zh.svg', alt: '中文', title: '中文' }
      };
      const cfg = iconCfg[currentLang] || iconCfg.zh;
      langDropdownIcon.src = cfg.src;
      langDropdownIcon.alt = cfg.alt;
      if (langDropdownBtn) langDropdownBtn.title = cfg.title;
    }
    // 语言变化时刷新主题图标与aria标签
    updateReadingToggleLabels();
    applyTheme(savedTheme);
  }

  // 刷新已打开的词汇详情卡片文本
  function refreshOpenCardTexts() {
    // 查找所有当前显示的词汇详情卡片
    const openDetails = document.querySelectorAll('.token-details[style*="display: block"], .token-details[style*="display:block"]');
    
    openDetails.forEach(details => {
      const tokenPill = details.closest('.token-pill');
      if (tokenPill) {
        try {
          // 获取词汇数据
          const tokenData = JSON.parse(tokenPill.getAttribute('data-token'));
          const posData = tokenPill.getAttribute('data-pos');
          
          // 重新解析词性信息
          const posInfo = parsePos(tokenData.pos_detail_1, tokenData.pos_detail_2, tokenData.pos_detail_3);
          
          // 重新格式化详情内容
          const newContent = formatDetailInfo(tokenData, posInfo);
          details.innerHTML = newContent;
          
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
    if (langSelect) langSelect.value = currentLang;
    if (sidebarLangSelect) sidebarLangSelect.value = currentLang;
    applyI18n();
    refreshOpenCardTexts();
  }

  if (langFlagJA) langFlagJA.addEventListener('click', () => setLanguage('ja'));
  if (langFlagEN) langFlagEN.addEventListener('click', () => setLanguage('en'));
  if (langFlagZH) langFlagZH.addEventListener('click', () => setLanguage('zh'));

  // 语言下拉菜单交互（移动端）
  function toggleLangDropdown(forceOpen) {
    if (!langDropdownBtn) return;
    const container = langDropdownBtn.parentElement;
    if (!container) return;
    const open = typeof forceOpen === 'boolean' ? forceOpen : !container.classList.contains('open');
    container.classList.toggle('open', open);
    langDropdownBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (langDropdownBtn) {
    langDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLangDropdown();
    });
  }

  if (langDropdownMenu) {
    const opts = langDropdownMenu.querySelectorAll('.lang-option');
    opts.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = btn.getAttribute('data-lang');
        if (lang) setLanguage(lang);
        toggleLangDropdown(false);
        e.stopPropagation();
      });
    });
  }

  // 外部点击与 ESC 关闭下拉
  document.addEventListener('click', (e) => {
    if (!langDropdownBtn) return;
    const container = langDropdownBtn.parentElement;
    if (!container) return;
    if (!container.classList.contains('open')) return;
    if (!container.contains(e.target)) toggleLangDropdown(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleLangDropdown(false);
  });

  // 主题切换
  const THEME = { LIGHT: 'light', DARK: 'dark' };
  function applyTheme(theme) {
    const t = (theme === THEME.DARK) ? THEME.DARK : THEME.LIGHT;
    document.documentElement.setAttribute('data-theme', t === THEME.DARK ? 'dark' : 'light');
    if (themeSelect) {
      themeSelect.value = t === THEME.DARK ? 'dark' : 'light';
    }
    if (sidebarThemeSelect) {
      sidebarThemeSelect.value = t === THEME.DARK ? 'dark' : 'light';
    }
    // 同步顶部主题按钮图标与标签（显示"切换到"目标主题）
    if (themeToggleBtn) {
      const next = (t === THEME.DARK) ? THEME.LIGHT : THEME.DARK;
      const icon = themeToggleBtn.querySelector('.theme-icon');
      if (icon) icon.textContent = (next === THEME.DARK) ? '🌙' : '☀️';
      themeToggleBtn.setAttribute('aria-label', next === THEME.DARK ? labelSwitchToDark() : labelSwitchToLight());
      themeToggleBtn.title = themeToggleBtn.getAttribute('aria-label');
    }
  }
  let savedTheme = localStorage.getItem(LS.theme) || THEME.LIGHT;
  applyTheme(savedTheme);
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      const selectedValue = themeSelect.value;
      if (selectedValue === 'auto') {
        // 跟随系统主题
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.DARK : THEME.LIGHT;
        savedTheme = systemTheme;
      } else {
        savedTheme = selectedValue === 'dark' ? THEME.DARK : THEME.LIGHT;
      }
      try { localStorage.setItem(LS.theme, savedTheme); } catch (e) {}
      if (sidebarThemeSelect) sidebarThemeSelect.value = selectedValue;
      applyTheme(savedTheme);
    });
    
    // 监听系统主题变化（当选择跟随系统时）
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (themeSelect.value === 'auto') {
        savedTheme = e.matches ? THEME.DARK : THEME.LIGHT;
        try { localStorage.setItem(LS.theme, savedTheme); } catch (e) {}
        applyTheme(savedTheme);
      }
    });
  }

  // 顶部主题按钮：浅色/深色快速切换（不涉及跟随系统）
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
      savedTheme = (savedTheme === THEME.DARK) ? THEME.LIGHT : THEME.DARK;
      try { localStorage.setItem(LS.theme, savedTheme); } catch (e) {}
      applyTheme(savedTheme);
    });
  }
  if (sidebarThemeSelect) {
    sidebarThemeSelect.addEventListener('change', () => {
      const selectedValue = sidebarThemeSelect.value;
      if (selectedValue === 'auto') {
        // 跟随系统主题
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.DARK : THEME.LIGHT;
        savedTheme = systemTheme;
      } else {
        savedTheme = selectedValue === 'dark' ? THEME.DARK : THEME.LIGHT;
      }
      try { localStorage.setItem(LS.theme, savedTheme); } catch (e) {}
      if (themeSelect) themeSelect.value = selectedValue;
      applyTheme(savedTheme);
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
  let isPlaying = false;
  let currentUtterance = null;
  let currentPlayingText = null; // 用于重复播放
  let currentHighlightedToken = null; // 当前高亮的词汇元素
  let highlightTimeout = null; // 高亮定时器存储当前播放的文本用于重复播放

  // 初始化速度滑块（元素可能不存在）
  if (speedSlider) speedSlider.value = String(rate);

  // 罗马音转换函数
  function getRomaji(kana) {
    if (!kana) return '';
    
    const kanaToRomaji = {
      'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
      'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
      'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
      'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
      'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
      'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
      'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
      'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
      'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
      'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
      'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
      'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
      'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
      'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
      'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
      // 片假名
      'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
      'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
      'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
      'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
      'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
      'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
      'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
      'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
      'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
      'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
      'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
      'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
      'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
      'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
      'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',
      // 长音符号
      'ー': '-',
      // 小字符
      'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
      'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo',
      'っ': 'tsu', 'ッ': 'tsu'
    };
    
    let romaji = '';
    for (let i = 0; i < kana.length; i++) {
      const char = kana[i];
      if (kanaToRomaji[char]) {
        romaji += kanaToRomaji[char];
      } else {
        romaji += char;
      }
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

  // 根据设置格式化读音：处理助词"は"并按脚本转换
  function formatReading(token, script) {
    const surface = token && token.surface ? token.surface : '';
    const posArr = Array.isArray(token && token.pos) ? token.pos : [token && token.pos || ''];
    const readingRaw = token && token.reading ? token.reading : '';
    if (!readingRaw) return '';
    // 特例：助词"は"读作"わ/ワ"
    if (surface === 'は' && posArr[0] === '助詞') {
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
  function parsePartOfSpeech(pos) {
    if (!Array.isArray(pos) || pos.length === 0) {
      return { main: '未知', details: [] };
    }

    const posMap = {
      '名詞': '名',
      '動詞': '动', 
      '形容詞': '形',
      '副詞': '副',
      '助詞': '助',
      '助動詞': '助动',
      '連体詞': '连体',
      '接続詞': '接续',
      '感動詞': '感叹',
      '記号': '标点',
      '補助記号': '符号',
      'フィラー': '填充',
      '其他': '其他'
    };

    const main = pos[0] || '未知';
    const mainChinese = posMap[main] || main;
    
    const details = [];
    if (pos.length > 1 && pos[1] !== '*') details.push(`细分: ${pos[1]}`);
    if (pos.length > 2 && pos[2] !== '*') details.push(`类型: ${pos[2]}`);
    if (pos.length > 3 && pos[3] !== '*') details.push(`形态: ${pos[3]}`);
    
    return { main: mainChinese, details, original: pos };
  }

  // 格式化详细信息
  function formatDetailInfo(token, posInfo) {
    const details = [];
    
    // 基本信息
    details.push(`<div class="detail-item"><strong>${t('lbl_surface') || '表层形'}:</strong> ${token.surface}</div>`);
    if (token.lemma && token.lemma !== token.surface) {
      details.push(`<div class="detail-item"><strong>${t('lbl_base') || '基本形'}:</strong> ${token.lemma}</div>`);
    }
    if (token.reading && token.reading !== token.surface) {
      // 特殊处理：助词"は"单字时显示读音为"わ"
      let displayReading = token.reading;
      if (token.surface === 'は' && token.pos && Array.isArray(token.pos) && token.pos[0] === '助詞') {
        displayReading = 'わ';
      }
      details.push(`<div class="detail-item"><strong>${t('lbl_reading') || '读音'}:</strong> ${displayReading}</div>`);
    }
    
    // 翻译信息占位符
    details.push(`<div class="detail-item translation-item"><strong>${t('lbl_translation') || '翻译'}:</strong> <span class="translation-content">${t('loading') || '加载中...'}</span></div>`);
    
    // 词性信息
    details.push(`<div class="detail-item"><strong>${t('lbl_pos') || '词性'}:</strong> ${posInfo.main}</div>`);
    if (posInfo.details.length > 0) {
      posInfo.details.forEach(detail => {
        details.push(`<div class="detail-item">${detail}</div>`);
      });
    }
    
    // 原始词性标签
    if (posInfo.original && posInfo.original.length > 0) {
      const originalPos = posInfo.original.filter(p => p !== '*').join(' / ');
      if (originalPos) {
        details.push(`<div class="detail-item"><strong>${t('lbl_pos_raw') || '原始标签'}:</strong> ${originalPos}</div>`);
      }
    }
    
    return details.join('');
  }
  if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
  
  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      rate = Math.min(2, Math.max(0.5, parseFloat(speedSlider.value) || 1));
      if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
      if (sidebarSpeedSlider) sidebarSpeedSlider.value = rate;
      if (sidebarSpeedValue) sidebarSpeedValue.textContent = `${rate.toFixed(1)}x`;
      localStorage.setItem(LS.rate, String(rate));
    });
  }

  if (sidebarSpeedSlider) {
    sidebarSpeedSlider.addEventListener('input', () => {
      rate = Math.min(2, Math.max(0.5, parseFloat(sidebarSpeedSlider.value) || 1));
      if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
      if (sidebarSpeedValue) sidebarSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (speedSlider) speedSlider.value = rate;
      localStorage.setItem(LS.rate, String(rate));
    });
  }

  // 语音列表管理
  function listVoicesFiltered() {
    const all = window.speechSynthesis.getVoices?.() || [];
    return all.filter(v => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('ja');
    }).sort((a, b) => {
      const pa = (a.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
      const pb = (b.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
      if (pa !== pb) return pa - pb;
      if (a.default && !b.default) return -1;
      if (!a.default && b.default) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  function refreshVoices() {
    // Safari兼容性：确保语音列表已加载
    const loadVoices = () => {
      voices = listVoicesFiltered();
      
      if (!voices.length) {
        // Safari可能需要更多时间加载语音
        setTimeout(() => {
          voices = listVoicesFiltered();
          if (voices.length > 0) {
            populateVoiceSelects();
          }
        }, 100);
        
        // 显示语音不可用选项
        const voiceSelectEl = document.getElementById('voiceSelect');
        const sidebarVoiceSelectEl = document.getElementById('sidebarVoiceSelect');
        if (voiceSelectEl) voiceSelectEl.innerHTML = '';
        if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.innerHTML = '';
        
        const opt = document.createElement('option');
        opt.textContent = t('noJapaneseVoice');
        opt.disabled = true;
        opt.selected = true;
        if (voiceSelectEl) voiceSelectEl.appendChild(opt);
        
        if (sidebarVoiceSelectEl) {
          const sidebarOpt = opt.cloneNode(true);
          sidebarVoiceSelectEl.appendChild(sidebarOpt);
        }
        
        currentVoice = null;
        return;
      }
      
      populateVoiceSelects();
    };
    
    const populateVoiceSelects = () => {
      const voiceSelectEl = document.getElementById('voiceSelect');
      const sidebarVoiceSelectEl = document.getElementById('sidebarVoiceSelect');
      if (voiceSelectEl) voiceSelectEl.innerHTML = '';
      if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.innerHTML = '';
      
      voices.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI || v.name || String(i);
        opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (默认)' : ''}`;
        if (voiceSelectEl) voiceSelectEl.appendChild(opt);
        
        if (sidebarVoiceSelectEl) {
          const sidebarOpt = opt.cloneNode(true);
          sidebarVoiceSelectEl.appendChild(sidebarOpt);
        }
      });

      const pref = localStorage.getItem(LS.voiceURI);
      const kyoko = voices.find(v => /kyoko/i.test(v.name || '') && (v.lang || '').toLowerCase().startsWith('ja'));
      const chosen = voices.find(v => (v.voiceURI || v.name) === pref) || kyoko || voices.find(v => (v.lang || '').toLowerCase().startsWith('ja')) || voices[0];
      
      if (chosen) {
        currentVoice = chosen;
        if (voiceSelectEl) voiceSelectEl.value = chosen.voiceURI || chosen.name;
        if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.value = chosen.voiceURI || chosen.name;
      }
    };
    
    loadVoices();
  }

  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  // 选择事件：用事件委托到文档，确保晚注入的节点也能工作
  document.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id !== 'voiceSelect' && target.id !== 'sidebarVoiceSelect') return;
    const uri = target.value;
    const v = voices.find(v => (v.voiceURI || v.name) === uri);
    if (v) {
      currentVoice = v;
      try { localStorage.setItem(LS.voiceURI, v.voiceURI || v.name); } catch (_) {}
      const otherId = target.id === 'voiceSelect' ? 'sidebarVoiceSelect' : 'voiceSelect';
      const other = document.getElementById(otherId);
      if (other) other.value = uri;
    }
  });

  // 自定义确认对话框 - 支持动态定位
  function showDeleteConfirm(message, onConfirm, onCancel, targetElement) {
    // 移除之前的确认对话框
    const existingConfirm = document.querySelector('.delete-confirm');
    if (existingConfirm) {
      existingConfirm.remove();
    }
    
    // 创建新的确认对话框
    const deleteConfirm = document.createElement('div');
    deleteConfirm.className = 'delete-confirm';
    deleteConfirm.innerHTML = `
      <div class="delete-confirm-content">
        <div class="delete-confirm-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="delete-confirm-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span class="delete-confirm-text">${message}</span>
        </div>
        <div class="delete-confirm-actions">
          <button class="btn delete-confirm-cancel">取消</button>
          <button class="btn btn-danger delete-confirm-ok">删除</button>
        </div>
      </div>
    `;
    
    // 插入到目标元素后面
    if (targetElement && targetElement.parentNode) {
      targetElement.parentNode.insertBefore(deleteConfirm, targetElement.nextSibling);
    } else {
      // 如果没有目标元素，插入到文档列表中
      const documentList = document.getElementById('documentList');
      if (documentList) {
        documentList.appendChild(deleteConfirm);
      } else {
        return false;
      }
    }
    
    // 获取按钮元素
    const deleteConfirmOk = deleteConfirm.querySelector('.delete-confirm-ok');
    const deleteConfirmCancel = deleteConfirm.querySelector('.delete-confirm-cancel');
    
    // 添加事件监听器
    deleteConfirmOk.addEventListener('click', () => {
      deleteConfirm.remove();
      document.removeEventListener('click', closeOnOutsideClick);
      if (onConfirm) onConfirm();
    });
    
    deleteConfirmCancel.addEventListener('click', () => {
      deleteConfirm.remove();
      document.removeEventListener('click', closeOnOutsideClick);
      if (onCancel) onCancel();
    });
    
    // 点击对话框外部关闭
    const closeOnOutsideClick = (e) => {
      if (!deleteConfirm.contains(e.target)) {
        deleteConfirm.remove();
        document.removeEventListener('click', closeOnOutsideClick);
        if (onCancel) onCancel();
      }
    };

    // 延迟到下一个事件循环再绑定，避免当前点击立即触发关闭
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 0);
    
    return true;
  }

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

    // 截断标题
    truncateTitle(title, maxLength = 20) {
      if (title.length <= maxLength) return title;
      return title.slice(0, maxLength - 1) + '…';
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
          alert(t('cannotDeleteDefault'));
        }
        return false;
      }

      if (!skipConfirm) {
        showDeleteConfirm((t('confirmDelete') || '').replace('{title}', this.getDocumentTitle(doc.content)), 
          () => {
            // 确认删除
            docs.splice(index, 1);
            this.saveAllDocuments(docs);

            // 如果删除的是当前活动文档，切换到第一个文档
            if (id === this.getActiveId()) {
              const firstDoc = docs[0];
              if (firstDoc) {
                this.setActiveId(firstDoc.id);
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
        docs.splice(index, 1);
        this.saveAllDocuments(docs);

        // 如果删除的是当前活动文档，切换到第一个文档
        if (id === this.getActiveId()) {
          const firstDoc = docs[0];
          if (firstDoc) {
            this.setActiveId(firstDoc.id);
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
      
      // 切换到新文档
      this.setActiveId(id);
      this.loadActiveDocument();
      this.render();
      
      // 自动分析新文档
      if (window.analyzeText) {
        window.analyzeText();
      }
      
      return true;
    }

    // 保存当前文档（空内容时不保存并删除该文档）
    saveCurrentDocument() {
      const activeId = this.getActiveId();
      if (!activeId) return; // 没有活动文档则不保存

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
        return;
      }

      // 非空内容：正常保存
      const doc = docs[docIndex];
      doc.content = textInput.value;
      doc.updatedAt = Date.now();
      this.saveAllDocuments(docs);
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

    // 渲染文档列表
    render() {
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      const activeFolder = getActiveFolderId();
      const queryLower = String(this.searchQuery || '').toLowerCase();
      
      if (!documentList) return;
      
      documentList.innerHTML = '';
      
      docs.filter(doc => {
        // 文件夹过滤
        if (activeFolder === 'favorites' && !doc.favorite) return false;
        // 全局搜索过滤
        if (queryLower) {
          const text = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
          const title = this.getDocumentTitle(doc.content);
          const combined = (title + '\n' + text).toLowerCase();
          if (!combined.includes(queryLower)) return false;
        }
        return true;
      }).forEach(doc => {
        const title = this.getDocumentTitle(doc.content);
        const docItem = document.createElement('div');
        docItem.className = 'doc-item';
        docItem.dataset.docId = doc.id;
        
        if (doc.id === activeId) {
          docItem.classList.add('active');
        }
        
        const isFav = !!doc.favorite;
        const createdTime = this.formatCreationTime(doc.createdAt);
        docItem.innerHTML = `
          <div class="doc-item-content">
            <div class="doc-item-title" title="${title}">${this.truncateTitle(title)}</div>
            <div class="doc-item-time">${createdTime}</div>
          </div>
          <div class="doc-item-actions">
            <button class="doc-action-btn fav-btn ${isFav ? 'active' : ''}" title="${isFav ? t('unfavorite') : t('favorite')}">${isFav ? '★' : '☆'}</button>
          </div>
        `;
        
        // 点击文档项切换文档
        docItem.addEventListener('click', (e) => {
          if (e.target.classList.contains('fav-btn')) {
            e.stopPropagation();
            const all = this.getAllDocuments();
            const d = all.find(x => x.id === doc.id);
            if (d) {
              d.favorite = !d.favorite;
              this.saveAllDocuments(all);
              this.render();
            }
          } else {
            this.switchToDocument(doc.id);
          }
        });
        
        documentList.appendChild(docItem);
      });

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

    // 绑定事件
    bindEvents() {
      // 新建文档按钮：立即创建空文档并设为活动；若保持为空，保存时会自动删除
      if (newDocBtn) {
        newDocBtn.addEventListener('click', () => {
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
    }
  }

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
    
    // 分段播放
    playSegments(segments, 0, rateOverride);
  }
  
  // 按标点符号分段文本
  function splitTextByPunctuation(text) {
    console.log('分段前文本:', text);
    
    // 检查是否包含句号、感叹号、问号
    const hasPunctuation = /[。！？]/.test(text);
    
    if (!hasPunctuation) {
      // 如果没有标点符号，按长度分段（每50个字符一段）
      const maxLength = 50;
      const result = [];
      
      for (let i = 0; i < text.length; i += maxLength) {
        const segment = text.slice(i, i + maxLength).trim();
        if (segment) {
          result.push({
            text: segment,
            pause: 300 // 短停顿
          });
        }
      }
      
      console.log('没有标点符号，按长度分段:', result);
      return result;
    }
    
    // 在句号、感叹号、问号后分段
    const segments = text.split(/([。！？])/);
    console.log('分割结果:', segments);
    
    const result = [];
    
    for (let i = 0; i < segments.length; i += 2) {
      const content = segments[i]?.trim();
      const punctuation = segments[i + 1];
      
      if (content) {
        const fullText = content + (punctuation || '');
        result.push({
          text: fullText,
          pause: punctuation ? 800 : 0 // 句号后停顿800ms
        });
        console.log(`添加段落: "${fullText}", 停顿: ${punctuation ? 800 : 0}ms`);
      }
    }
    
    console.log('最终分段结果:', result);
    return result;
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
    
    // 创建语音合成对象
    const utterance = new SpeechSynthesisUtterance(segment.text);
    currentUtterance = utterance;
    applyVoice(utterance);
    utterance.rate = typeof rateOverride === 'number' ? rateOverride : rate;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      isPlaying = true;
      updatePlayButtonStates();
    };
    
    utterance.onend = () => {
      // 添加停顿
      setTimeout(() => {
        playSegments(segments, index + 1, rateOverride);
      }, segment.pause);
    };
    
    utterance.onerror = (event) => {
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
  function highlightToken(text, targetElement = null) {
    // 清除之前的高亮
    clearTokenHighlight();
    
    if (!text) return;
    
    // 如果指定了目标元素，直接高亮该元素
    if (targetElement) {
      targetElement.classList.add('playing');
      currentHighlightedToken = targetElement;
      
      // 滚动到可视区域
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      return;
    }
    
    // 查找匹配的词汇卡片
    const tokenPills = document.querySelectorAll('.token-pill');
    for (const pill of tokenPills) {
      const kanjiEl = pill.querySelector('.token-kanji');
      if (kanjiEl && kanjiEl.textContent.trim() === text.trim()) {
        pill.classList.add('playing');
        currentHighlightedToken = pill;
        
        // 滚动到可视区域
        pill.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
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
    updatePlayButtonStates();
  }



  function updatePlayButtonStates() {
    // 更新播放全文按钮
    updateButtonIcon(playAllBtn, isPlaying);
    // 更新导航播放按钮
    updateButtonIcon(headerPlayToggle, isPlaying);
    
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
    
    const svg = button.querySelector('svg');
    if (!svg) return;
    
    // 获取按钮文本内容
    const textContent = button.textContent.trim();
    let buttonText = '';
    
    // 根据按钮类型确定文本
    if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
      buttonText = playAllLabel(playing);
    } else {
      buttonText = playing ? t('stop') : t('play');
    }
    
    if (playing) {
      // 停止图标 (方形)
      svg.innerHTML = '<rect x="6" y="6" width="4" height="12" fill="currentColor"/><rect x="14" y="6" width="4" height="12" fill="currentColor"/>';
      // 根据按钮类型设置不同的title
      if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
        button.title = playAllLabel(true);
      } else {
        button.title = t('stop');
      }
    } else {
      // 播放图标 (三角形)
      svg.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
      // 根据按钮类型设置不同的title
      if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
        button.title = playAllLabel(false);
      } else {
        button.title = t('play');
      }
    }
    
    // 播放全文按钮改为纯图标：不添加文字，仅更新 title
    // 保留其他按钮默认文本行为（目前无文本）
  }

  // 移动端播放按钮图标更新函数已移除

  function applyVoice(u) {
    try {
      if (currentVoice) {
        u.voice = currentVoice;
        u.lang = currentVoice.lang || 'ja-JP';
        return;
      }
      
      const all = window.speechSynthesis.getVoices?.() || [];
      const fb = all.find(v => v.default) || all[0];
      if (fb) {
        u.voice = fb;
      } else {
        u.lang = 'ja-JP';
      }
    } catch (e) {
      u.lang = 'ja-JP';
    }
  }

  // 文本分析功能
  async function analyzeText() {
    const text = textInput.value.trim();
    
    if (!text) {
      showEmptyState();
      return;
    }

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
    
    const html = nonEmptyLines.map((line, lineIndex) => {
      
      const lineHtml = line.map((token, tokenIndex) => {
        const surface = token.surface || '';
        const reading = token.reading || '';
        const lemma = token.lemma || surface;
        const pos = Array.isArray(token.pos) ? token.pos : [token.pos || ''];
        
        // 解析词性信息
        const posInfo = parsePartOfSpeech(pos);
        const posDisplay = posInfo.main || '未知';
        const detailInfo = formatDetailInfo(token, posInfo);
        
        // 获取罗马音（仅针对日文读音；英文字母或数字时不显示）
        let romaji = '';
        const r = reading || surface;
        const isLatinOrNumber = /^[A-Za-z0-9 .,:;!?\-_/+()\[\]{}'"%&@#*]+$/.test(r);
        if (!isLatinOrNumber) {
          romaji = getRomaji(r);
        }
        
        // 检查是否为标点符号
        const isPunct = (pos[0] === '記号' || pos[0] === '補助記号');
        // 检查是否为需要过滤的装饰性符号
        const isDecorativeSymbol = /^[•·\/\s\u00A0\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000]+$/.test(surface);

        if (isDecorativeSymbol) {
          // 过滤掉装饰性符号，不显示
          return '';
        } else if (isPunct) {
          // 标点符号以普通文本显示，不作为卡片
          return `<span class="punct">${surface}</span>`;
        }
        
        const readingText = formatReading(token, getReadingScript());
        return `
          <span class="token-pill" onclick="toggleTokenDetails(this)" data-token='${JSON.stringify(token).replace(/'/g, "&apos;")}' data-pos="${posDisplay}">
            <div class="token-content">
              <div class="token-kana display-kana">${readingText}</div>
              ${romaji ? `<div class="token-romaji display-romaji">${romaji}</div>` : ''}
              <div class="token-kanji display-kanji">${surface}</div>
              <div class="token-pos display-pos">${posDisplay}</div>
            </div>
            <div class="token-details" style="display: none;">
              ${detailInfo}
              <button class="play-token-btn" onclick="playToken('${surface}', event)" title="${t('play')}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </span>
        `;
      }).join('');
      
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
    }).join('');

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
    
    // 特殊处理：助词"は"单字时读作"wa"
    if (text === 'は' && resolvedToken && resolvedToken.pos && Array.isArray(resolvedToken.pos) && resolvedToken.pos[0] === '助詞') {
      textToSpeak = 'わ';
    }
    
    // 高亮当前播放的词汇（仍然使用surface形式）
    highlightToken(text);
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
          highlightToken(surface, element);
          let textToSpeak = tokenData.reading || surface;
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

    // 详细信息显示逻辑
    const details = element.querySelector('.token-details');
    if (details) {
      // 检查当前元素是否已经是活动状态
      const isCurrentActive = activeTokenDetails && activeTokenDetails.element === element;
      
      // 先关闭所有卡片，保证只有一个打开
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
      
      // 清除活动状态
      activeTokenDetails = null;
      
      if (!isCurrentActive) {
        // 设置位置并显示
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
  });

  // 加载翻译信息
  async function loadTranslation(element) {
    const tokenData = JSON.parse(element.getAttribute('data-token'));
    // 详情面板可能被移动到 body 中，优先在元素内查找，找不到则从活动弹层中获取
    let translationContent = element.querySelector('.translation-content');
    if (!translationContent && activeTokenDetails && activeTokenDetails.element === element && activeTokenDetails.details) {
      translationContent = activeTokenDetails.details.querySelector('.translation-content');
    }
    if (!translationContent) return;
    
    try {
      // 确保词典服务已初始化
      if (!window.dictionaryService.isReady()) {
        translationContent.textContent = t('dict_init') || '正在初始化词典...';
        await window.dictionaryService.init();
      }
      
      // 查询翻译
      const word = tokenData.lemma || tokenData.surface;
      const detailedInfo = await window.dictionaryService.getDetailedInfo(word);
      
      if (detailedInfo && detailedInfo.senses && detailedInfo.senses.length > 0) {
        // 显示主要翻译
        const mainTranslation = detailedInfo.senses[0].gloss;
        translationContent.innerHTML = `<span class="main-translation">${mainTranslation}</span>`;
        
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
    } catch (error) {
      console.error('加载翻译失败:', error);
      translationContent.textContent = t('translation_failed') || '翻译加载失败';
    }
  }

  // 显示详细翻译信息
  async function showDetailedTranslation(detailedInfo, container) {
    const modal = document.createElement('div');
    modal.className = 'translation-modal';
    
    modal.innerHTML = `
      <div class="translation-modal-content">
        <div class="translation-modal-header">
          <h3>${detailedInfo.word} ${t('dlg_detail_translation') || '的详细翻译'}</h3>
          <button class="close-modal-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="translation-modal-body">
          ${detailedInfo.senses.map((sense, index) => `
            <div class="sense-item">
              <div class="sense-number">${index + 1}.</div>
              <div class="sense-content">
                <div class="sense-gloss">${sense.gloss}</div>
                ${sense.partOfSpeech.length > 0 ? `<div class="sense-pos">${t('lbl_pos') || '词性'}: ${sense.partOfSpeech.join(', ')}</div>` : ''}
                ${sense.field.length > 0 ? `<div class="sense-field">${t('lbl_field') || '领域'}: ${sense.field.join(', ')}</div>` : ''}
                ${sense.misc.length > 0 ? `<div class="sense-misc">${t('lbl_note') || '备注'}: ${sense.misc.join(', ')}</div>` : ''}
                ${sense.chineseSource ? `<div class="sense-chinese">${t('lbl_chinese') || '中文'}: ${sense.chineseSource}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
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
            
            // 特殊处理：助词"は"单字时读作"wa"
            if (tokenData.surface === 'は' && tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞') {
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
    
    // 检查是否有分析结果，如果有则使用reading字段
    const content = document.getElementById('content');
    if (content && content.innerHTML.trim()) {
      // 从分析结果中提取reading字段
      const tokens = content.querySelectorAll('.token-pill');
      if (tokens.length > 0) {
        const readingText = Array.from(tokens).map(token => {
          const tokenDataAttr = token.getAttribute('data-token');
          if (tokenDataAttr) {
            try {
              const tokenData = JSON.parse(tokenDataAttr);
              // 优先使用reading，如果没有则使用surface，保留标点符号
              let textToSpeak = tokenData.reading || tokenData.surface || '';
              
              // 特殊处理：助词"は"单字时读作"wa"
              if (tokenData.surface === 'は' && tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞') {
                textToSpeak = 'わ';
              }
              
              return textToSpeak;
            } catch (e) {
              const kanjiEl = token.querySelector('.token-kanji');
              return kanjiEl ? kanjiEl.textContent : '';
            }
          } else {
            const kanjiEl = token.querySelector('.token-kanji');
            return kanjiEl ? kanjiEl.textContent : '';
          }
        }).join('');
        
        // 如果提取的文本没有标点符号，使用原始文本
        if (!/[。！？]/.test(readingText)) {
          console.log('提取的文本没有标点符号，使用原始文本');
          const text = textInput.value.trim();
          if (text) {
            speak(text);
            return;
          }
        }
        speak(readingText);
        return;
      }
    }
    
    // 如果没有分析结果，使用原始文本
    const text = textInput.value.trim();
    if (text) {
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
      if (currentSig !== lastStructureSignature) {
        analyzeText();
      }
      lastStructureSignature = currentSig;
    });
  }

  // 清空和帮助按钮功能已移除

  // 通知系统
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

    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

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
    // 动态获取当前DOM中的控件引用
    const showKanaCheckbox = document.getElementById('showKana');
    const showRomajiCheckbox = document.getElementById('showRomaji');
    const showPosCheckbox = document.getElementById('showPos');
    const showDetailsCheckbox = document.getElementById('showDetails');
    const showUnderlineCheckbox = document.getElementById('showUnderline');
    const autoReadCheckbox = document.getElementById('autoRead');
    const repeatPlayCheckbox = document.getElementById('repeatPlay');
    const sidebarShowKanaCheckbox = document.getElementById('sidebarShowKana');
    const sidebarShowRomajiCheckbox = document.getElementById('sidebarShowRomaji');
    const sidebarShowPosCheckbox = document.getElementById('sidebarShowPos');
    const sidebarShowDetailsCheckbox = document.getElementById('sidebarShowDetails');
    const sidebarShowUnderlineCheckbox = document.getElementById('sidebarShowUnderline');
    const sidebarAutoReadCheckbox = document.getElementById('sidebarAutoRead');
    const sidebarRepeatPlayCheckbox = document.getElementById('sidebarRepeatPlay');
    // 读音脚本下拉
    const readingScriptSelect = document.getElementById('readingScriptSelect');
    const sidebarReadingScriptSelect = document.getElementById('sidebarReadingScriptSelect');
    
    // 从本地存储读取初始状态
    const getBool = (key, defaultVal = true) => {
      const v = localStorage.getItem(key);
      return v === null ? defaultVal : v === 'true';
    };
    // 设置复选框状态 - 主弹窗
    if (showKanaCheckbox) showKanaCheckbox.checked = getBool(LS.showKana, true);
    if (showRomajiCheckbox) showRomajiCheckbox.checked = getBool(LS.showRomaji, true);
    if (showPosCheckbox) showPosCheckbox.checked = getBool(LS.showPos, true);
    if (showDetailsCheckbox) showDetailsCheckbox.checked = getBool(LS.showDetails, true);
    if (showUnderlineCheckbox) showUnderlineCheckbox.checked = getBool(LS.showUnderline, true);
    if (autoReadCheckbox) autoReadCheckbox.checked = getBool(LS.autoRead, false);
    if (repeatPlayCheckbox) repeatPlayCheckbox.checked = getBool(LS.repeatPlay, false);
    
    // 设置下拉初始值 - 主弹窗
    const getScript = () => {
      const v = localStorage.getItem(LS.readingScript);
      return (v === 'hiragana' || v === 'katakana') ? v : 'katakana';
    };
    if (readingScriptSelect) readingScriptSelect.value = getScript();
    // 设置复选框状态 - 侧边栏
    if (sidebarShowKanaCheckbox) sidebarShowKanaCheckbox.checked = getBool(LS.showKana, true);
    if (sidebarShowRomajiCheckbox) sidebarShowRomajiCheckbox.checked = getBool(LS.showRomaji, true);
    if (sidebarShowPosCheckbox) sidebarShowPosCheckbox.checked = getBool(LS.showPos, true);
    if (sidebarShowDetailsCheckbox) sidebarShowDetailsCheckbox.checked = getBool(LS.showDetails, true);
    if (sidebarShowUnderlineCheckbox) sidebarShowUnderlineCheckbox.checked = getBool(LS.showUnderline, true);
    if (sidebarAutoReadCheckbox) sidebarAutoReadCheckbox.checked = getBool(LS.autoRead, false);
    if (sidebarRepeatPlayCheckbox) sidebarRepeatPlayCheckbox.checked = getBool(LS.repeatPlay, false);
    // 设置下拉初始值 - 侧边栏
    if (sidebarReadingScriptSelect) sidebarReadingScriptSelect.value = getScript();
    
    // 应用显示设置
    updateDisplaySettings();
    
    // 应用当前读音脚本显示
    updateReadingScriptDisplay();
    
    // 添加事件监听器 - 主弹窗
    if (showKanaCheckbox) {
      showKanaCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showKana, showKanaCheckbox.checked);
        // 同步侧边栏状态
        if (sidebarShowKanaCheckbox) sidebarShowKanaCheckbox.checked = showKanaCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (showRomajiCheckbox) {
      showRomajiCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showRomaji, showRomajiCheckbox.checked);
        // 同步侧边栏状态
        if (sidebarShowRomajiCheckbox) sidebarShowRomajiCheckbox.checked = showRomajiCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (showPosCheckbox) {
      showPosCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showPos, showPosCheckbox.checked);
        // 同步侧边栏状态
        if (sidebarShowPosCheckbox) sidebarShowPosCheckbox.checked = showPosCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (showUnderlineCheckbox) {
      showUnderlineCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showUnderline, showUnderlineCheckbox.checked);
        // 同步侧边栏状态
        if (sidebarShowUnderlineCheckbox) sidebarShowUnderlineCheckbox.checked = showUnderlineCheckbox.checked;
        updateDisplaySettings();
      });
    }

    // 主弹窗：显示词汇详情
    if (showDetailsCheckbox) {
      showDetailsCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showDetails, showDetailsCheckbox.checked);
        if (sidebarShowDetailsCheckbox) sidebarShowDetailsCheckbox.checked = showDetailsCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (autoReadCheckbox) {
      autoReadCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.autoRead, autoReadCheckbox.checked);
        // 同步侧边栏状态
        if (sidebarAutoReadCheckbox) sidebarAutoReadCheckbox.checked = autoReadCheckbox.checked;
      });
    }
    
    if (repeatPlayCheckbox) {
      repeatPlayCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.repeatPlay, repeatPlayCheckbox.checked);
        // 同步侧边栏状态
        if (sidebarRepeatPlayCheckbox) sidebarRepeatPlayCheckbox.checked = repeatPlayCheckbox.checked;
      });
    }
    // 主弹窗：读音脚本
    if (readingScriptSelect) {
      readingScriptSelect.addEventListener('change', () => {
        const val = readingScriptSelect.value === 'hiragana' ? 'hiragana' : 'katakana';
        localStorage.setItem(LS.readingScript, val);
        if (sidebarReadingScriptSelect) sidebarReadingScriptSelect.value = val;
        updateReadingScriptDisplay();
      });
    }
    
    // 添加事件监听器 - 侧边栏
    if (sidebarShowKanaCheckbox) {
      sidebarShowKanaCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showKana, sidebarShowKanaCheckbox.checked);
        // 同步主弹窗状态
        if (showKanaCheckbox) showKanaCheckbox.checked = sidebarShowKanaCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (sidebarShowRomajiCheckbox) {
      sidebarShowRomajiCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showRomaji, sidebarShowRomajiCheckbox.checked);
        // 同步主弹窗状态
        if (showRomajiCheckbox) showRomajiCheckbox.checked = sidebarShowRomajiCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (sidebarShowPosCheckbox) {
      sidebarShowPosCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showPos, sidebarShowPosCheckbox.checked);
        // 同步主弹窗状态
        if (showPosCheckbox) showPosCheckbox.checked = sidebarShowPosCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (sidebarShowUnderlineCheckbox) {
      sidebarShowUnderlineCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showUnderline, sidebarShowUnderlineCheckbox.checked);
        // 同步主弹窗状态
        if (showUnderlineCheckbox) showUnderlineCheckbox.checked = sidebarShowUnderlineCheckbox.checked;
        updateDisplaySettings();
      });
    }

    // 侧边栏：显示词汇详情
    if (sidebarShowDetailsCheckbox) {
      sidebarShowDetailsCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showDetails, sidebarShowDetailsCheckbox.checked);
        if (showDetailsCheckbox) showDetailsCheckbox.checked = sidebarShowDetailsCheckbox.checked;
        updateDisplaySettings();
      });
    }
    
    if (sidebarAutoReadCheckbox) {
      sidebarAutoReadCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.autoRead, sidebarAutoReadCheckbox.checked);
        // 同步主弹窗状态
        if (autoReadCheckbox) autoReadCheckbox.checked = sidebarAutoReadCheckbox.checked;
      });
    }
    
    if (sidebarRepeatPlayCheckbox) {
      sidebarRepeatPlayCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.repeatPlay, sidebarRepeatPlayCheckbox.checked);
        // 同步主弹窗状态
        if (repeatPlayCheckbox) repeatPlayCheckbox.checked = sidebarRepeatPlayCheckbox.checked;
      });
    }
    // 侧边栏：读音脚本
    if (sidebarReadingScriptSelect) {
      sidebarReadingScriptSelect.addEventListener('change', () => {
        const val = sidebarReadingScriptSelect.value === 'hiragana' ? 'hiragana' : 'katakana';
        localStorage.setItem(LS.readingScript, val);
        if (readingScriptSelect) readingScriptSelect.value = val;
        updateReadingScriptDisplay();
      });
    }
  }

  function updateDisplaySettings() {
    const showKanaCheckbox = document.getElementById('showKana');
    const showRomajiCheckbox = document.getElementById('showRomaji');
    const showPosCheckbox = document.getElementById('showPos');
    const showDetailsCheckbox = document.getElementById('showDetails');
    const showUnderlineCheckbox = document.getElementById('showUnderline');
    const sidebarShowKanaCheckbox = document.getElementById('sidebarShowKana');
    const sidebarShowRomajiCheckbox = document.getElementById('sidebarShowRomaji');
    const sidebarShowPosCheckbox = document.getElementById('sidebarShowPos');
    const sidebarShowDetailsCheckbox = document.getElementById('sidebarShowDetails');
    const sidebarShowUnderlineCheckbox = document.getElementById('sidebarShowUnderline');
    // 获取当前状态，优先从主弹窗获取，如果不存在则从侧边栏获取
    const showKana = showKanaCheckbox ? showKanaCheckbox.checked : 
                     (sidebarShowKanaCheckbox ? sidebarShowKanaCheckbox.checked : true);
    const showRomaji = showRomajiCheckbox ? showRomajiCheckbox.checked : 
                       (sidebarShowRomajiCheckbox ? sidebarShowRomajiCheckbox.checked : true);
    const showPos = showPosCheckbox ? showPosCheckbox.checked : 
                    (sidebarShowPosCheckbox ? sidebarShowPosCheckbox.checked : true);
    const showDetails = showDetailsCheckbox ? showDetailsCheckbox.checked : 
                        (sidebarShowDetailsCheckbox ? sidebarShowDetailsCheckbox.checked : true);
    const showUnderline = showUnderlineCheckbox ? showUnderlineCheckbox.checked : 
                         (sidebarShowUnderlineCheckbox ? sidebarShowUnderlineCheckbox.checked : true);
    
    // 创建或更新CSS规则
    let styleElement = document.getElementById('display-control-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'display-control-styles';
      document.head.appendChild(styleElement);
    }
    
    let css = '';
    if (!showKana) css += '.display-kana { display: none !important; }\n';
    if (!showRomaji) css += '.display-romaji { display: none !important; }\n';
    // 汉字永远显示，不添加隐藏规则
    if (!showPos) css += '.display-pos { display: none !important; }\n';
    if (!showDetails) css += '.token-details { display: none !important; }\n';
    // 关闭词性彩色下划线：移除底边线
    if (!showUnderline) css += '.token-pill { border-bottom: none !important; }\n';
    
    styleElement.textContent = css;

    // 若关闭详情同时清理活动状态
    if (!showDetails) {
      try {
        document.querySelectorAll('.token-details').forEach(d => { d.style.display = 'none'; });
        document.querySelectorAll('.token-pill').forEach(p => { p.classList.remove('active'); });
        activeTokenDetails = null;
      } catch (_) {}
    }
  }

  // 工具栏拖拽功能
  function initToolbarDrag() {
    const toolbar = document.querySelector('.sidebar-right');
    const toolbarHeader = document.querySelector('.toolbar-header');
    const minimizeBtn = document.querySelector('.toolbar-minimize-btn');
    const toolbarContent = document.querySelector('.toolbar-content');
    
    if (!toolbar || !toolbarHeader) return;
    
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    // isMinimized变量已移除
    let dragStartPos = { x: 0, y: 0 };
    let hasMoved = false;
    let justDragged = false; // 标记是否刚刚完成拖拽
    let touchStartPos = null; // 触摸开始位置
    let isTouchScrolling = false; // 是否正在触摸滚动
    
    // 获取事件坐标（支持鼠标和触摸）
    function getEventCoords(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }
    
    // 拖拽开始
    function startDrag(e) {
      // 如果点击的是最小化按钮，不开始拖拽
      if (e.target.closest('.toolbar-minimize-btn')) return;
      
      isDragging = true;
      hasMoved = false;
      const coords = getEventCoords(e);
      const rect = toolbar.getBoundingClientRect();
      dragOffset.x = coords.x - rect.left;
      dragOffset.y = coords.y - rect.top;
      dragStartPos.x = coords.x;
      dragStartPos.y = coords.y;
      
      toolbar.style.transition = 'none';
      document.body.style.userSelect = 'none';
      
      e.preventDefault();
    }
    
    // 拖拽中
    function drag(e) {
      if (!isDragging) return;
      
      const coords = getEventCoords(e);
      
      // 检查是否移动了超过5像素（判断是拖拽还是点击）
      const deltaX = Math.abs(coords.x - dragStartPos.x);
      const deltaY = Math.abs(coords.y - dragStartPos.y);
      if (deltaX > 5 || deltaY > 5) {
        hasMoved = true;
      }
      
      const x = coords.x - dragOffset.x;
      const y = coords.y - dragOffset.y;
      
      // 限制在视窗范围内
      const maxX = window.innerWidth - toolbar.offsetWidth;
      const maxY = window.innerHeight - toolbar.offsetHeight;
      
      const constrainedX = Math.max(0, Math.min(x, maxX));
      const constrainedY = Math.max(0, Math.min(y, maxY));
      
      toolbar.style.left = constrainedX + 'px';
      toolbar.style.top = constrainedY + 'px';
      toolbar.style.right = 'auto';
      
      e.preventDefault();
    }
    
    // 拖拽结束
    function endDrag(e) {
      if (!isDragging) return;
      
      isDragging = false;
      document.body.style.userSelect = '';
      toolbar.style.transition = '';
      
      // 只有在拖拽后才保存位置
      if (hasMoved) {
        justDragged = true; // 标记刚刚完成拖拽
        const rect = toolbar.getBoundingClientRect();
        localStorage.setItem('toolbarPosition', JSON.stringify({
          left: rect.left,
          top: rect.top
        }));
        // 短暂延迟后清除标记，防止 click 事件触发
        setTimeout(() => {
          justDragged = false;
        }, 100);
      }
      
      hasMoved = false;
    }
    
    // 左右收缩功能已移除，sidebar-right只能上下调整高度
    
    // 恢复保存的位置和状态
    function restoreToolbarState() {
      const savedPosition = localStorage.getItem('toolbarPosition');
      
      // 恢复位置
      if (savedPosition) {
        try {
          const position = JSON.parse(savedPosition);
          // 确保位置在视窗范围内
          const maxX = window.innerWidth - toolbar.offsetWidth;
          const maxY = window.innerHeight - toolbar.offsetHeight;
          
          const x = Math.max(0, Math.min(position.left, maxX));
          const y = Math.max(0, Math.min(position.top, maxY));
          
          toolbar.style.left = x + 'px';
          toolbar.style.top = y + 'px';
          toolbar.style.right = 'auto';
        } catch (e) {
          console.warn('Failed to restore toolbar position:', e);
        }
      }
    }
    
    // 仅允许通过 toolbar-header 呼出：移除整个工具栏的自动呼出逻辑
    // （保留 minimize 按钮点击与 header 拖拽/点击）
    
    // 绑定事件（支持鼠标和触摸）- 只在 header 上允许拖拽
    toolbarHeader.addEventListener('mousedown', (e) => {
      startDrag(e);
    });
    toolbarHeader.addEventListener('touchstart', (e) => {
      startDrag(e);
    }, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    // 上下收缩功能
    let isCollapsed = false;
    
    // 检测是否为移动端
    function isMobile() {
      return window.innerWidth <= 768;
    }
    
    function toggleCollapse() {
      // 移动端禁用折叠功能
      if (isMobile()) {
        return;
      }
      
      isCollapsed = !isCollapsed;
      
      if (isCollapsed) {
        // 收缩：只显示头部，隐藏内容
        toolbar.style.height = 'auto';
        toolbarContent.style.display = 'none';
        toolbar.classList.add('collapsed');
        minimizeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
        minimizeBtn.title = t('expand');
      } else {
        // 展开：恢复完整高度
        const savedHeight = localStorage.getItem('toolbarHeight');
        if (savedHeight) {
          const height = parseInt(savedHeight, 10);
          if (height >= 200 && height <= window.innerHeight - 100) {
            toolbar.style.height = height + 'px';
          } else {
            toolbar.style.height = '500px';
          }
        } else {
          toolbar.style.height = '500px';
        }
        toolbarContent.style.display = 'flex';
        toolbar.classList.remove('collapsed');
        minimizeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 11h12v2H6z"/></svg>';
        minimizeBtn.title = t('collapse');
      }
      
      localStorage.setItem('toolbarCollapsed', isCollapsed);
    }
    
    // 恢复收缩状态
    function restoreCollapseState() {
      // 移动端不恢复折叠状态
      if (isMobile()) {
        return;
      }
      
      const savedCollapsed = localStorage.getItem('toolbarCollapsed');
      if (savedCollapsed === 'true') {
        isCollapsed = true;
        toolbar.style.height = 'auto';
        toolbarContent.style.display = 'none';
        toolbar.classList.add('collapsed');
        minimizeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
        minimizeBtn.title = t('expand');
      }
    }
    
    // 绑定最小化按钮事件
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCollapse();
      });
    }
    
    // 恢复状态
    restoreCollapseState();
    
    // 窗口大小改变时重新约束位置
    window.addEventListener('resize', () => {
      if (toolbar.style.left && toolbar.style.top) {
        const rect = toolbar.getBoundingClientRect();
        const maxX = window.innerWidth - toolbar.offsetWidth;
        const maxY = window.innerHeight - toolbar.offsetHeight;
        
        const x = Math.max(0, Math.min(rect.left, maxX));
        const y = Math.max(0, Math.min(rect.top, maxY));
        
        toolbar.style.left = x + 'px';
        toolbar.style.top = y + 'px';
      }
      
      // 窗口大小变化时，如果从桌面端切换到移动端，确保工具栏展开
      if (isMobile() && isCollapsed) {
        isCollapsed = false;
        toolbar.style.height = '';
        toolbarContent.style.display = 'flex';
        toolbar.classList.remove('collapsed');
        minimizeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 11h12v2H6z"/></svg>';
        minimizeBtn.title = t('collapse');
      }
    });
    
    // 初始化时恢复状态
    setTimeout(restoreToolbarState, 100);
  }
  
  // 初始语言应用（双重保障）
  applyI18n();
  setTimeout(applyI18n, 0);

  // 初始化文档管理器
  const documentManager = new DocumentManager();

  // 全局函数，供其他地方调用
  window.analyzeText = analyzeText;

  // 初始化时如果有文本则自动分析
  if (textInput.value.trim()) {
    setTimeout(() => analyzeText(), 100);
  } else {
    showEmptyState();
  }
  // 初始化顶部编辑工具栏
  try { initEditorToolbar(); } catch (_) {}

// 高度调整功能
  function initToolbarResize() {
    const resizeHandle = document.getElementById('toolbarResizeHandle');
    const toolbar = document.querySelector('.sidebar-right');
    
    if (!resizeHandle || !toolbar) return;
    
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;
    
    // 开始调整高度
    function startResize(e) {
      isResizing = true;
      startY = e.clientY;
      startHeight = toolbar.offsetHeight;
      
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
      
      e.preventDefault();
    }
    
    // 调整高度中
    function resize(e) {
      if (!isResizing) return;
      
      const deltaY = e.clientY - startY;
      const newHeight = startHeight + deltaY;
      
      // 限制最小和最大高度
      const minHeight = 200;
      const maxHeight = window.innerHeight - 100;
      const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      
      toolbar.style.height = constrainedHeight + 'px';
      
      e.preventDefault();
    }
    
    // 结束调整高度
    function endResize() {
      if (!isResizing) return;
      
      isResizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      // 保存高度到本地存储
      const height = toolbar.offsetHeight;
      localStorage.setItem('toolbarHeight', height.toString());
    }
    
    // 绑定事件
    resizeHandle.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', endResize);
    
    // 恢复保存的高度
    const savedHeight = localStorage.getItem('toolbarHeight');
    if (savedHeight) {
      const height = parseInt(savedHeight, 10);
      if (height >= 200 && height <= window.innerHeight - 100) {
        toolbar.style.height = height + 'px';
      }
    }
  }
  
  // 侧边栏折叠功能
  function initSidebarToggle() {
    const sidebarStack = document.getElementById('sidebarStack');
    const mainContainer = document.querySelector('.main-container');
    const toggleBtn = document.getElementById('sidebarToggle');
    const collapseMenuBtn = document.getElementById('collapseMenuBtn');
    const editorReadingToggle = document.getElementById('editorReadingToggle');
    
    if (!sidebarStack || !mainContainer) return;
    
    let isCollapsed = false;
    
    // 检测是否为移动端
    function isMobile() {
      return window.innerWidth <= 768;
    }
    
    // 切换侧边栏状态
    function toggleSidebar() {
      // 统一折叠控制：仅在 .main-container 上切换 collapsed
      isCollapsed = !isCollapsed;
      mainContainer.classList.toggle('collapsed', isCollapsed);
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
    
    // 恢复桌面端折叠状态
    function restoreSidebarState() {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      isCollapsed = savedCollapsed === 'true';
      mainContainer.classList.toggle('collapsed', isCollapsed);
    }
    
    // 响应窗口大小变化
    function handleResize() {
      // 保持状态一致，无需额外切换其他类
      mainContainer.classList.toggle('collapsed', isCollapsed);
    }
    
    // 绑定事件 - 只有当按钮存在时才绑定
    if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
    if (collapseMenuBtn) collapseMenuBtn.addEventListener('click', toggleSidebar);
    if (editorReadingToggle) editorReadingToggle.addEventListener('click', toggleSidebar);

    // 移动端：点击/触摸 sidebar-stack 以外任意区域时收起菜单
    function handleOutsideInteraction(e) {
      try {
        if (!isMobile()) return;
        // 忽略来自菜单按钮或侧边栏折叠按钮的点击/触摸
        const isToggleClick = (collapseMenuBtn && collapseMenuBtn.contains(e.target)) ||
                              (toggleBtn && toggleBtn.contains(e.target)) ||
                              (editorReadingToggle && editorReadingToggle.contains(e.target));
        if (isToggleClick) return;

        // 仅当抽屉已展开且点击在 sidebar-stack 以外时收起
        if (!isCollapsed && !sidebarStack.contains(e.target)) {
          isCollapsed = true;
          mainContainer.classList.add('collapsed');
          localStorage.setItem('sidebarCollapsed', 'true');
        }
      } catch (_) {}
    }
    document.addEventListener('click', handleOutsideInteraction, true);
    document.addEventListener('touchstart', handleOutsideInteraction, { passive: true, capture: true });

    window.addEventListener('resize', handleResize);
    
    // 初始化
    restoreSidebarState();
  }

  // 右侧边栏移动端控制功能已移除
  
  // 右侧边栏自动收缩功能已完全移除

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
        editorDocDate.textContent = doc ? documentManager.formatCreationTime(doc.createdAt) : '';
      }
      if (editorCharCount) {
        const count = (textInput && textInput.value) ? textInput.value.length : 0;
        editorCharCount.textContent = `共 ${count} 字`;
      }
      if (editorStarToggle) {
        const isFav = !!(doc && doc.favorite);
        editorStarToggle.classList.toggle('is-active', isFav);
        editorStarToggle.setAttribute('aria-pressed', String(isFav));
        editorStarToggle.textContent = isFav ? '★' : '☆';
      }
    } catch (_) {}
  }

  function initEditorToolbar() {
    if (editorStarToggle) {
      editorStarToggle.addEventListener('click', () => {
        const docs = documentManager.getAllDocuments();
        const activeId = documentManager.getActiveId();
        const doc = docs.find(d => d.id === activeId);
        if (!doc) return;
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
    if (!content) return;

    content.addEventListener('click', (event) => {
      if (document.body.id !== 'reading-mode') return;
      const container = event.target.closest('.line-container');
      if (!container) return;
      setReadingLineActive(container);
    });

    content.addEventListener('keydown', (event) => {
      if (document.body.id !== 'reading-mode') return;
      const container = event.target.closest('.line-container');
      if (!container) return;

      if ((event.key === 'Enter' || event.key === ' ') && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setReadingLineActive(container);
      } else if (event.key === 'Escape' && activeReadingLine === container) {
        event.preventDefault();
        clearReadingLineHighlight();
        syncReadingLineAttributes(true);
      }
    });
  }

  // 创建共享工具栏内容HTML
  function createToolbarContentHTML(context) {
    const isSidebar = context === 'sidebar';
    const id = (base) => isSidebar ? `sidebar${base.charAt(0).toUpperCase()}${base.slice(1)}` : base;
    
    // 移除"系统设置"（主题/语言）区块，仅保留语音与显示设置
    return `
      <!-- 语音设置 -->
      <div class="settings-section">
        <div class="sidebar-title" id="${id('voiceSettingsTitle')}">${t('voiceTitle')}</div>
        <div class="voice-controls">
          <div class="control-group">
            <label class="control-label" id="${id('voiceSelectLabel')}">${t('voiceSelectLabel')}</label>
            <select id="${id('voiceSelect')}">
              <option value="">${t('selectVoice')}</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label" id="${id('speedLabel')}">${t('speedLabel')}</label>
            <input type="range" id="${id('speedRange')}" min="0.5" max="2" step="0.1" value="1">
            <div class="speed-display" id="${id('speedValue')}">1.0x</div>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="settings-section">
        <div class="sidebar-title" id="${id('displayTitle')}">${t('displayTitle')}</div>
        <div class="display-controls">
          <div class="control-group">
            <label class="control-label" id="${id('showKanaLabel')}">
              <input type="checkbox" id="${id('showKana')}" checked>
              ${t('showKana')}
            </label>
          </div>

          <div class="control-group">
            <label class="control-label" id="${id('readingScriptLabel')}">${t('readingScript')}</label>
            <select id="${id('readingScriptSelect')}">
              <option id="${id('readingScriptOptionKatakana')}" value="katakana">${t('katakanaLabel')}</option>
              <option id="${id('readingScriptOptionHiragana')}" value="hiragana">${t('hiraganaLabel')}</option>
            </select>
          </div>
          
          <div class="control-group">
            <label class="control-label" id="${id('showRomajiLabel')}">
              <input type="checkbox" id="${id('showRomaji')}" checked>
              ${t('showRomaji')}
            </label>
          </div>
          
          <div class="control-group">
            <label class="control-label" id="${id('showPosLabel')}">
              <input type="checkbox" id="${id('showPos')}" checked>
              ${t('showPos')}
            </label>
          </div>

          <div class="control-group">
            <label class="control-label" id="${id('showDetailsLabel')}">
              <input type="checkbox" id="${id('showDetails')}" checked>
              ${t('showDetails')}
            </label>
          </div>
          
          <div class="control-group">
            <label class="control-label" id="${id('showUnderlineLabel')}">
              <input type="checkbox" id="${id('showUnderline')}" checked>
              ${t('showUnderline')}
            </label>
          </div>
          
          <div class="control-group">
            <label class="control-label" id="${id('autoReadLabel')}">
              <input type="checkbox" id="${id('autoRead')}">
              ${t('autoRead')}
            </label>
          </div>
          
          <div class="control-group">
            <label class="control-label" id="${id('repeatPlayLabel')}">
              <input type="checkbox" id="${id('repeatPlay')}">
              ${t('repeatPlay')}
            </label>
          </div>
        </div>
      </div>
    `;
  }

  // 初始化共享工具栏内容
  function initSharedToolbarContent() {
    const toolbarContainers = document.querySelectorAll('.toolbar-content[data-context]');
    
    toolbarContainers.forEach(container => {
      const context = container.getAttribute('data-context');
      container.innerHTML = createToolbarContentHTML(context);
    });
  }

  // 设置弹窗：仅负责打开/关闭已有模态（不做内容注入）
  function initSettingsModal() {
    const btn = document.getElementById('settingsButton');
    const modal = document.getElementById('settingsModal');
    const closeBtn = document.getElementById('settingsModalClose');
    if (!btn || !modal) return;
    const openModal = () => { modal.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const closeModal = () => { modal.classList.remove('show'); document.body.style.overflow = ''; };
    btn.addEventListener('click', () => modal.classList.contains('show') ? closeModal() : openModal());
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && modal.classList.contains('show')) {
        e.preventDefault();
        closeModal();
      }
    });
  }

  // 在页面加载时为设置弹窗挂载内容并绑定事件
  function mountSettingsModalContent() {
    const body = document.getElementById('settingsModalBody');
    if (!body) return;
    if (body.childElementCount > 0) return; // 已挂载
    // 注入通用设置表单
    body.innerHTML = createToolbarContentHTML('modal');
    // 绑定控件事件
    try { initVoiceAndSpeedControls(); } catch (_) {}
    try { initDisplayControls(); } catch (_) {}
    try { applyI18n(); } catch (_) {}
    try { if ('speechSynthesis' in window) refreshVoices(); } catch (_) {}
  }

  // 在模板注入后，重新绑定语音与速度控件事件，避免初次选择为空导致不生效
  function initVoiceAndSpeedControls() {
    const voiceSelectEl = document.getElementById('voiceSelect');
    const sidebarVoiceSelectEl = document.getElementById('sidebarVoiceSelect');
    const speedSliderEl = document.getElementById('speedRange');
    const speedValueEl = document.getElementById('speedValue');
    const sidebarSpeedSliderEl = document.getElementById('sidebarSpeedRange');
    const sidebarSpeedValueEl = document.getElementById('sidebarSpeedValue');
    const playAllBtnEl = document.getElementById('playAllBtn');
    const sidebarPlayAllBtnEl = document.getElementById('sidebarPlayAllBtn');

    // 初始化速度显示
    if (speedSliderEl) speedSliderEl.value = String(rate);
    if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
    if (sidebarSpeedSliderEl) sidebarSpeedSliderEl.value = String(rate);
    if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;

    // 绑定速度事件
    if (speedSliderEl) {
      speedSliderEl.addEventListener('input', () => {
        rate = Math.min(2, Math.max(0.5, parseFloat(speedSliderEl.value) || 1));
        if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (sidebarSpeedSliderEl) sidebarSpeedSliderEl.value = rate;
        if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        localStorage.setItem(LS.rate, String(rate));
      });
    }

    if (sidebarSpeedSliderEl) {
      sidebarSpeedSliderEl.addEventListener('input', () => {
        rate = Math.min(2, Math.max(0.5, parseFloat(sidebarSpeedSliderEl.value) || 1));
        if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (speedSliderEl) speedSliderEl.value = rate;
        localStorage.setItem(LS.rate, String(rate));
      });
    }

    // 绑定语音选择事件
    if (voiceSelectEl) {
      voiceSelectEl.addEventListener('change', () => {
        const uri = voiceSelectEl.value;
        const v = voices.find(v => (v.voiceURI || v.name) === uri);
        if (v) {
          currentVoice = v;
          localStorage.setItem(LS.voiceURI, v.voiceURI || v.name);
          if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.value = uri;
        }
      });
    }

    if (sidebarVoiceSelectEl) {
      sidebarVoiceSelectEl.addEventListener('change', () => {
        const uri = sidebarVoiceSelectEl.value;
        const v = voices.find(v => (v.voiceURI || v.name) === uri);
        if (v) {
          currentVoice = v;
          localStorage.setItem(LS.voiceURI, v.voiceURI || v.name);
          if (voiceSelectEl) voiceSelectEl.value = uri;
        }
      });
    }

    // 绑定播放全文
    if (playAllBtnEl) playAllBtnEl.addEventListener('click', playAllText);
    if (sidebarPlayAllBtnEl) sidebarPlayAllBtnEl.addEventListener('click', playAllText);

    // 模板注入后再刷新语音列表以填充选择框
    if ('speechSynthesis' in window) {
      try { refreshVoices(); } catch (_) {}
    }
  }

  // 确保DOM加载完成后初始化所有功能
  function initializeApp() {
    initSharedToolbarContent(); // 首先初始化共享工具栏内容（保留其它处使用）
    mountSettingsModalContent(); // 为设置弹窗注入内容
    initSettingsModal(); // 绑定齿轮按钮与设置弹窗
    initDisplayControls();
    initToolbarDrag();
    initToolbarResize();
    initSidebarToggle();
    // 移动端右侧边栏初始化已移除
    initReadingModeToggle();
    initReadingModeInteractions();
    setupPwaInstaller();
    initGlobalSearch();
    initQuickSearch();
    // initSidebarAutoCollapse(); // 已禁用自动收缩功能
  }

  // 简易防抖
  function debounce(fn, delay = 200) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // 初始化全局搜索（针对全部文档）
  function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('globalSearchClear');
    const info = document.getElementById('globalSearchInfo');
    if (!input) return;

    const runSearch = (q) => {
      const query = String(q || '').trim();
      if (typeof documentManager !== 'undefined') {
        documentManager.searchQuery = query;
        documentManager.render();
      }

      if (!info) return;
      if (!query) { info.textContent = ''; return; }
      try {
        const docs = documentManager.getAllDocuments();
        const ql = query.toLowerCase();
        const hits = docs.filter(doc => {
          const text = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
          const title = documentManager.getDocumentTitle(doc.content);
          return (title + '\n' + text).toLowerCase().includes(ql);
        });
        info.textContent = hits.length > 0 ? `匹配文档：${hits.length}` : '未找到匹配文档';
      } catch (_) {
        info.textContent = '';
      }
    };

    const debounced = debounce(runSearch, 200);
    input.addEventListener('input', (e) => debounced(e.target.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runSearch(input.value);
      }
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        runSearch('');
        input.focus();
      });
    }
  }

  // 初始化快速搜索
  function initQuickSearch() {
    const input = document.getElementById('quickSearchInput');
    const clearBtn = document.getElementById('quickSearchClear');
    const info = document.getElementById('quickSearchInfo');
    const contentArea = document.getElementById('content');
    if (!input || !contentArea) return;

    const runSearch = (q, opts = {}) => {
      const query = String(q || '').trim();
      // 清理旧高亮
      document.querySelectorAll('.token-pill.search-hit').forEach(el => el.classList.remove('search-hit'));
      if (!query) {
        if (info) info.textContent = '';
        return;
      }
      // 搜索 token-pill
      const pills = contentArea.querySelectorAll('.token-pill');
      let count = 0;
      let firstHit = null;
      pills.forEach(pill => {
        const text = pill.textContent || '';
        if (text.toLowerCase().includes(query.toLowerCase())) {
          pill.classList.add('search-hit');
          if (!firstHit) firstHit = pill;
          count++;
        } else {
          pill.classList.remove('search-hit');
        }
      });
      if (info) {
        info.textContent = count > 0 ? `找到 ${count} 个匹配` : '未找到匹配';
      }
      if (opts.scroll !== false && firstHit) {
        try { firstHit.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
      }
    };

    const debounced = debounce(runSearch, 200);
    input.addEventListener('input', (e) => debounced(e.target.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runSearch(input.value, { scroll: true });
      }
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        runSearch('');
        input.focus();
      });
    }
  }

  // 如果DOM已经加载完成，立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  
  // 初始化应用程序抽屉
  initAppDrawer();

  // 全局键盘：在阅读模式下按 ESC 退出
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Escape' || e.key === 'Esc') && isReadingMode) {
      e.preventDefault();
      setReadingMode(false);
    }
  });

  // 初始化应用程序抽屉
  function initAppDrawer() {
    const appIcon = document.getElementById('appIcon');
    const appDrawer = document.getElementById('appDrawer');
    const appDrawerClose = document.getElementById('appDrawerClose');
    const appDrawerBackdrop = document.getElementById('appDrawerBackdrop');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!appIcon || !appDrawer || !appDrawerClose) return;

    // 打开抽屉
    appIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      appDrawer.classList.add('show');
      appDrawer.setAttribute('aria-hidden', 'false');
      if (appDrawerBackdrop) {
        appDrawerBackdrop.setAttribute('aria-hidden', 'false');
      }
    });

    // 关闭抽屉
    appDrawerClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      appDrawer.classList.remove('show');
      appDrawer.setAttribute('aria-hidden', 'true');
      if (appDrawerBackdrop) {
        appDrawerBackdrop.setAttribute('aria-hidden', 'true');
      }
    });

    // 点击遮罩关闭抽屉
    document.addEventListener('click', (e) => {
      if (appDrawer.classList.contains('show') && !appDrawer.contains(e.target) && !appIcon.contains(e.target)) {
        appDrawer.classList.remove('show');
        appDrawer.setAttribute('aria-hidden', 'true');
        if (appDrawerBackdrop) {
          appDrawerBackdrop.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // 点击遮罩关闭抽屉
    if (appDrawerBackdrop) {
      appDrawerBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        appDrawer.classList.remove('show');
        appDrawer.setAttribute('aria-hidden', 'true');
        appDrawerBackdrop.setAttribute('aria-hidden', 'true');
      });
    }

    // 应用程序项点击事件
    const appItems = appDrawer.querySelectorAll('.app-item');
    appItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const appName = item.dataset.app;
        console.log('点击了应用程序:', appName);

        // 打开对应站点（新标签页）
        switch (appName) {
          case 'fudoki':
            window.open('https://fudoki.iamcheyan.com/', '_blank');
            break;
          case 'terebi':
            window.open('https://terebi.iamcheyan.com/', '_blank');
            break;
          case 'kotoba':
            window.open('https://kotoba.iamcheyan.com/', '_blank');
            break;
          default:
            // 其他占位项（若存在）保持原有行为
            break;
        }

        // 关闭抽屉
        appDrawer.classList.remove('show');
        appDrawer.setAttribute('aria-hidden', 'true');
        if (appDrawerBackdrop) {
          appDrawerBackdrop.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // 退出按钮
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('确定要退出吗？')) {
          alert('退出功能开发中...');
          // 这里可以添加实际的退出逻辑
        }
      });
    }

    // ESC键关闭抽屉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && appDrawer.classList.contains('show')) {
        appDrawer.classList.remove('show');
        appDrawer.setAttribute('aria-hidden', 'true');
        if (appDrawerBackdrop) {
          appDrawerBackdrop.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

})();
