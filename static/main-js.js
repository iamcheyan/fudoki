(() => {
  // 元素选择器 - 适配新的界面结构
  const $ = (id) => document.getElementById(id);
  const textInput = $('textInput');
  const analyzeBtn = $('analyzeBtn');
  const content = $('content');
const voiceSelect = $('voiceSelect');
const speedSlider = $('speedRange');
const speedValue = $('speedValue');
// 头部控件
const headerVoiceSelect = $('headerVoiceSelect');
const headerSpeedSlider = $('headerSpeedRange');
const headerSpeedValue = $('headerSpeedValue');
  const playAllBtn = $('playAllBtn');
  const headerPlayToggle = $('headerPlayToggle');
  const headerPauseToggle = $('headerPauseToggle');
  const headerDownloadBtn = $('headerDownloadBtn');
  const newDocBtn = $('newDocBtn');
    const twoPaneToggle = $('twoPaneToggle');
  const documentList = $('documentList');
  const folderList = $('folderList');
  const langSelect = $('langSelect');
  const themeSelect = document.getElementById('themeSelect');
  const readingModeToggle = $('readingModeToggle');
  const editorReadingToggle = document.getElementById('editorReadingToggle');
  const editorDocDate = document.getElementById('editorDocDate');
  const editorCharCount = document.getElementById('editorCharCount');
  const editorStarToggle = document.getElementById('editorStarToggle');
  const docSortToggle = $('docSortToggle');
  // 左侧列表底部按钮可能被移除，这里做安全获取
  const deleteDocBtn = document.getElementById('deleteDocBtn');
  const editorNewBtn = document.getElementById('editorNewBtn');
  const syncBtn = document.getElementById('syncBtn');
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
  
  // 侧边栏显示控制元素
  const sidebarShowKanaCheckbox = $('sidebarShowKana');
  const sidebarShowRomajiCheckbox = $('sidebarShowRomaji');
  const sidebarShowPosCheckbox = $('sidebarShowPos');
  const sidebarAutoReadCheckbox = $('sidebarAutoRead');
  let sidebarRepeatPlayCheckbox = $('sidebarRepeatPlay');

  // 本地存储键
  const LS = { 
    text: 'text', 
    voiceURI: 'voiceURI', 
    rate: 'rate', 
    volume: 'volume',
    texts: 'texts', 
    activeId: 'activeId',
    activeFolder: 'activeFolder',
    sortAsc: 'sortAsc',
    twoPane: 'twoPane',
    showKana: 'showKana',
    showRomaji: 'showRomaji', 
    showPos: 'showPos',
    showDetails: 'showDetails',
    autoRead: 'autoRead',
    repeatPlay: 'repeatPlay',
    lang: 'lang',
    theme: 'theme',
    lightTheme: 'lightTheme',
    showUnderline: 'showUnderline',
    readingScript: 'readingScript',
    haAsWa: 'haAsWa',
    tokenAlignLeft: 'tokenAlignLeft'
  };

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
        'link', 'image', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
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

    // 示例文章（多语言）
    const samplesItem = document.createElement('div');
    samplesItem.className = 'folder-item' + (activeId === 'samples' ? ' active' : '');
    samplesItem.dataset.folderId = 'samples';
    samplesItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 4h16v2H4V4m0 4h16v12H4V8m2 2v8h12v-8H6z"/>
      </svg>
      <div>${t('folderSamples')}</div>
    `;
    samplesItem.addEventListener('click', () => { selectFolder('samples'); });
    folderList.appendChild(samplesItem);

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
      emptyText: '上の入力欄に日本語を入力すると、自動的に解析します',
      // グローバル検索（多言語）
      globalSearchAria: 'グローバル検索',
      globalSearchInputAria: 'すべてのドキュメントを検索',
      globalSearchPlaceholder: 'キーワードを素早く検索',
      globalSearchClear: '検索をクリア',
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
      tokenAlignLeft: '左揃え',
      autoRead: '自動読み上げ',
      repeatPlay: 'リピート再生',
      readingToggleEnter: '読書モード',
      readingToggleExit: '通常表示へ',
      readingToggleTooltipEnter: '読書モードに入る',
      readingToggleTooltipExit: '通常表示に戻る',
      systemTitle: 'システム設定',
      themeLabel: 'テーマモード',
      themeLight: 'ライトモード',
      themePaper: '紙の白',
      themeSakura: '桜色',
      themeSticky: 'メモの黄',
      themeGreen: '目にやさしい緑',
      themeBlue: '爽やかな青',
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
      folderSamples: 'サンプル記事',
      reloadSamples: 'サンプル再読み込み',
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
      haAsWaLabel: '助詞「は」を「わ」と読む',
      readingScript: 'ふりがな表記',
      katakanaLabel: 'カタカナ',
      hiraganaLabel: 'ひらがな',
      fontSizeLabel: '文字サイズ',
      pwaTitle: 'オフラインダウンロード',
      pwaPreparing: 'オフライン用リソースを準備しています…',
      pwaProgress: 'キャッシュ中 {completed}/{total} 件（{percent}%）',
      pwaComplete: 'すべてのリソースを保存しました。オフラインでも利用できます。',
      pwaPartial: '一部のファイルを保存できませんでした。{failed} 件失敗しました。',
      pwaError: 'キャッシュに失敗しました: {message}',
      pwaUnsupported: 'このブラウザーはオフラインインストールに対応していません。',
      pwaAlreadyCaching: 'リソースをダウンロードしています…',
      pwaDismiss: '閉じる',
      pwaResetting: '古いオフラインデータを整理しています…',
      pwaResetFailed: 'キャッシュのリセットに失敗しました: {message}',
      pwaOffline: 'ネットワークに接続してからダウンロードしてください。',
      localCacheCleared: '一時キャッシュを削除しました（ドキュメントと設定保持）。',
      pwaCacheCleared: 'オフラインキャッシュを削除しました。',
      delete: '削除',
      cancel: 'キャンセル',
      newDocument: '新規ドキュメント',
      deleteDocument: 'ドキュメント削除',
      applications: 'アプリケーション',
      closeApplicationList: 'アプリケーションリストを閉じる',
      close: '閉じる',
      confirmExit: '終了しますか？',
      exitInDevelopment: '終了機能は開発中です...'
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
      emptyText: 'Type Japanese above; analysis runs automatically',
      // Global search (i18n)
      globalSearchAria: 'Global Search',
      globalSearchInputAria: 'Search all documents',
      globalSearchPlaceholder: 'Search keywords',
      globalSearchClear: 'Clear search',
      voiceTitle: 'Voice Settings',
      voiceSelectLabel: 'Voice',
      selectVoice: 'Select voice...',
      speedLabel: 'Speed',
      playAll: 'Play All',
      displayTitle: 'Display Settings',
      showKana: 'Show Kana',
      showRomaji: 'Show Romaji',
      showPos: 'Show POS',
      tokenAlignLeft: 'Left align token content',
      showDetails: 'Show token details',
      haAsWaLabel: 'Read particle “は” as “わ”',
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
      themePaper: 'Paper White',
      themeSakura: 'Sakura Pink',
      themeSticky: 'Sticky Note Yellow',
      themeGreen: 'Eye-Care Green',
      themeBlue: 'Fresh Breeze Blue',
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
      folderSamples: 'Sample Articles',
      reloadSamples: 'Reload samples',
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
      fontSizeLabel: 'Font Size',
      pwaTitle: 'Offline Pack',
      pwaPreparing: 'Preparing offline resources…',
      pwaProgress: 'Caching {completed}/{total} files ({percent}%)',
      pwaComplete: 'All resources cached. You can use Fudoki offline now.',
      pwaPartial: '{failed} files could not be cached. Please retry.',
      pwaError: 'Caching failed: {message}',
      pwaUnsupported: 'This browser does not support offline installation.',
      pwaAlreadyCaching: 'Download in progress…',
      pwaDismiss: 'Dismiss',
      pwaResetting: 'Clearing old offline cache…',
      pwaResetFailed: 'Reset failed: {message}',
      pwaOffline: 'Connect to the internet before downloading.',
      localCacheCleared: 'Temporary cache cleared (documents and settings preserved).',
      pwaCacheCleared: 'Offline cache has been cleared.',
      delete: 'Delete',
      cancel: 'Cancel',
      newDocument: 'New Document',
      deleteDocument: 'Delete Document',
      applications: 'Applications',
      closeApplicationList: 'Close application list',
      close: 'Close',
      confirmExit: 'Are you sure you want to exit?',
      exitInDevelopment: 'Exit feature is under development...'
      ,backupTitle: 'Backup & Import'
      ,exportBtn: 'Export Data'
      ,importBtn: 'Import Data'
      ,exportSuccess: 'Exported backup JSON.'
      ,exportError: 'Failed to export backup.'
      ,importSuccess: 'Backup imported.'
      ,importError: 'Failed to import backup.'
      ,importConfirmOverwrite: 'Import will overwrite current data and settings. Continue?'
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
      emptyText: '请在上方输入日语文本，系统会自动分析',
      // 全局搜索（多语言）
      globalSearchAria: '全局搜索',
      globalSearchInputAria: '搜索全部文档',
      globalSearchPlaceholder: '快速搜索关键词',
      globalSearchClear: '清除搜索',
      voiceTitle: '语音设置',
      voiceSelectLabel: '语音选择',
      selectVoice: '选择语音...',
      speedLabel: '语速调节',
      playAll: '播放全文',
      displayTitle: '显示设置',
      showKana: '显示假名',
      showRomaji: '显示罗马音',
      showPos: '显示词性',
      tokenAlignLeft: '词块左对齐',
      showDetails: '显示词汇详情',
      haAsWaLabel: '助词“は”读作“わ”',
      autoRead: '自动朗读',
      repeatPlay: '重复播放',
      readingToggleEnter: '阅读模式',
      readingToggleExit: '退出阅读',
      readingToggleTooltipEnter: '进入阅读模式',
      readingToggleTooltipExit: '退出阅读模式',
      systemTitle: '系统设置',
      themeLabel: '主题模式',
      themeLight: '浅色模式',
      themePaper: '纸张白',
      themeSakura: '樱花粉',
      themeSticky: '便签黄',
      themeGreen: '护眼绿',
      themeBlue: '清新蓝',
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
      ,fontSizeLabel: '字号'
      ,folderAll: '全部',
      folderFavorites: '收藏',
      folderSamples: '示例文章',
      reloadSamples: '重新加载示例',
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
      pwaDismiss: '关闭提示',
      pwaResetting: '正在清理旧的离线缓存…',
      pwaResetFailed: '清理缓存失败：{message}',
      pwaOffline: '请联网后再下载离线资源。',
      localCacheCleared: '已清除临时缓存（保留文档与设置）。',
      pwaCacheCleared: '已清除离线程序缓存文件。',
      delete: '删除',
      cancel: '取消',
      newDocument: '新建文档',
      deleteDocument: '删除文档',
      applications: '应用程序',
      closeApplicationList: '关闭应用程序列表',
      close: '关闭',
      confirmExit: '确定要退出吗？',
      exitInDevelopment: '退出功能开发中...'
      ,backupTitle: '备份与导入'
      ,exportBtn: '导出数据'
      ,importBtn: '导入数据'
      ,exportSuccess: '已导出备份 JSON。'
      ,exportError: '导出失败。'
      ,importSuccess: '导入成功。'
      ,importError: '导入失败：文件格式或内容无效。'
      ,importConfirmOverwrite: '导入将覆盖当前数据与设置，是否继续？'
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
          contentWrap.innerHTML = original.innerHTML;
        }
      } catch (_) {}

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
    if (newDocBtn) {
      const newDocBtnText = document.getElementById('newDocBtnText');
      if (newDocBtnText) newDocBtnText.textContent = t('newDoc');
    }
    const deleteDocBtn = $('deleteDocBtn');
    if (deleteDocBtn) {
      const deleteDocBtnText = document.getElementById('deleteDocBtnText');
      if (deleteDocBtnText) deleteDocBtnText.textContent = t('deleteDoc');
    }

    // 同步左侧文件夹区域的标题与列表
    const sidebarFolderTitle = $('sidebarFolderTitle');
    if (sidebarFolderTitle) sidebarFolderTitle.textContent = t('sidebarFolderTitle');
    // 重新渲染文件夹列表以应用新语言
    try { renderFolders(); } catch (_) {}

    if (textInput) textInput.placeholder = t('textareaPlaceholder');
    // 全局搜索输入及按钮的多语言适配
    const globalSearch = $('globalSearch');
    if (globalSearch) globalSearch.setAttribute('aria-label', t('globalSearchAria'));
    const globalSearchInput = $('globalSearchInput');
    if (globalSearchInput) {
      globalSearchInput.placeholder = t('globalSearchPlaceholder');
      globalSearchInput.setAttribute('aria-label', t('globalSearchInputAria'));
    }
    const globalSearchClear = $('globalSearchClear');
    if (globalSearchClear) {
      globalSearchClear.setAttribute('aria-label', t('globalSearchClear'));
      globalSearchClear.title = t('globalSearchClear');
    }
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
    const fontSizeLabel = $('fontSizeLabel');
    if (fontSizeLabel) fontSizeLabel.textContent = t('fontSizeLabel');
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
      const paperOption = themeSelect.querySelector('option[value="paper"]');
      const sakuraOption = themeSelect.querySelector('option[value="sakura"]');
      const stickyOption = themeSelect.querySelector('option[value="sticky"]');
      const greenOption = themeSelect.querySelector('option[value="green"]');
      const blueOption = themeSelect.querySelector('option[value="blue"]');
      const darkOption = themeSelect.querySelector('option[value="dark"]');
      const autoOption = themeSelect.querySelector('option[value="auto"]');
      if (paperOption) paperOption.textContent = t('themePaper');
      if (sakuraOption) sakuraOption.textContent = t('themeSakura');
      if (stickyOption) stickyOption.textContent = t('themeSticky');
      if (greenOption) greenOption.textContent = t('themeGreen');
      if (blueOption) blueOption.textContent = t('themeBlue');
      if (darkOption) darkOption.textContent = t('themeDark');
      if (autoOption) autoOption.textContent = t('themeAuto');
    }

    // 更新侧边栏主题选择选项的文本
    if (sidebarThemeSelect) {
      const sidebarPaperOption = sidebarThemeSelect.querySelector('option[value="paper"]');
      const sidebarSakuraOption = sidebarThemeSelect.querySelector('option[value="sakura"]');
      const sidebarStickyOption = sidebarThemeSelect.querySelector('option[value="sticky"]');
      const sidebarGreenOption = sidebarThemeSelect.querySelector('option[value="green"]');
      const sidebarBlueOption = sidebarThemeSelect.querySelector('option[value="blue"]');
      const sidebarDarkOption = sidebarThemeSelect.querySelector('option[value="dark"]');
      const sidebarAutoOption = sidebarThemeSelect.querySelector('option[value="auto"]');
      if (sidebarPaperOption) sidebarPaperOption.textContent = t('themePaper');
      if (sidebarSakuraOption) sidebarSakuraOption.textContent = t('themeSakura');
      if (sidebarStickyOption) sidebarStickyOption.textContent = t('themeSticky');
      if (sidebarGreenOption) sidebarGreenOption.textContent = t('themeGreen');
      if (sidebarBlueOption) sidebarBlueOption.textContent = t('themeBlue');
      if (sidebarDarkOption) sidebarDarkOption.textContent = t('themeDark');
      if (sidebarAutoOption) sidebarAutoOption.textContent = t('themeAuto');
    }

    if (themeSelect || sidebarThemeSelect) {
      syncThemeSelects(savedThemePreference);
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
    // 更新应用程序抽屉
    const appDrawerTitle = document.getElementById('appDrawerTitle');
    if (appDrawerTitle) appDrawerTitle.textContent = t('applications');
    
    const appDrawerClose = document.getElementById('appDrawerClose');
    if (appDrawerClose) appDrawerClose.setAttribute('aria-label', t('closeApplicationList'));
    
    // 语言变化时刷新主题图标与aria标签
    updateReadingToggleLabels();
    applyTheme(savedThemePreference);

    // 更新设置面板与（若存在）侧边栏的文案
    try { updateSettingsLabels(); } catch (_) {}
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

  // 将所有设置项的标签文本同步为当前语言
  function updateSettingsLabels() {
    const setText = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      const text = t(key);

      // 优先更新专用的文本容器，避免破坏内部结构
      const span = el.querySelector('.label-text');
      if (span) { span.textContent = text; return; }

      // 如果该标签内包含复选框，保持输入控件不变，仅更新其后的文本
      const cb = el.querySelector('input[type="checkbox"]');
      if (cb) {
        // 找到可更新的文本节点；若不存在则追加一个
        const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (textNode) {
          textNode.textContent = ' ' + text;
        } else {
          el.appendChild(document.createTextNode(' ' + text));
        }
        // 同步标题以提供悬浮提示
        el.title = text;
        return;
      }

      // 普通标签：安全地直接更新文本
      el.textContent = text;
    };
    const setOptionText = (selectId, valueToI18nKeyMap) => {
      const sel = document.getElementById(selectId);
      if (!sel) return;
      Object.entries(valueToI18nKeyMap || {}).forEach(([val, key]) => {
        const opt = sel.querySelector(`option[value="${val}"]`);
        if (opt) opt.textContent = t(key);
      });
    };

    // 通用（modal）
    setText('voiceSettingsTitle', 'voiceTitle');
    setText('voiceSelectLabel', 'voiceSelectLabel');
    // 保留“选择语音...”占位选项
    const voiceSelect = document.getElementById('voiceSelect');
    if (voiceSelect) {
      const placeholder = voiceSelect.querySelector('option[value=""]');
      if (placeholder) placeholder.textContent = t('selectVoice');
    }
    setText('speedLabel', 'speedLabel');
    setText('displayTitle', 'displayTitle');
    setText('showKanaLabel', 'showKana');
    setText('showRomajiLabel', 'showRomaji');
    setText('showPosLabel', 'showPos');
    setText('showDetailsLabel', 'showDetails');
    setText('tokenAlignLeftLabel', 'tokenAlignLeft');
    setText('showUnderlineLabel', 'showUnderline');
    setText('autoReadLabel', 'autoRead');
    setText('repeatPlayLabel', 'repeatPlay');
    setText('haAsWaLabel', 'haAsWaLabel');
    setText('readingScriptLabel', 'readingScript');
    setText('readingScriptOptionKatakana', 'katakanaLabel');
    setText('readingScriptOptionHiragana', 'hiraganaLabel');
    setText('fontSizeLabel', 'fontSizeLabel');
    // 系统设置
    setText('systemTitle', 'systemTitle');
    setText('themeLabel', 'themeLabel');
    setOptionText('themeSelect', {
      paper: 'themePaper',
      sakura: 'themeSakura',
      sticky: 'themeSticky',
      green: 'themeGreen',
      blue: 'themeBlue',
      dark: 'themeDark',
      auto: 'themeAuto'
    });
    setText('langLabel', 'langLabel');

    // 侧边栏（如果存在）
    setText('sidebarVoiceSettingsTitle', 'voiceTitle');
    setText('sidebarVoiceSelectLabel', 'voiceSelectLabel');
    const sidebarVoiceSelect = document.getElementById('sidebarVoiceSelect');
    if (sidebarVoiceSelect) {
      const placeholder2 = sidebarVoiceSelect.querySelector('option[value=""]');
      if (placeholder2) placeholder2.textContent = t('selectVoice');
    }
    setText('sidebarSpeedLabel', 'speedLabel');
    setText('sidebarDisplayTitle', 'displayTitle');
    setText('sidebarShowKanaLabel', 'showKana');
    setText('sidebarShowRomajiLabel', 'showRomaji');
    setText('sidebarShowPosLabel', 'showPos');
    setText('sidebarShowDetailsLabel', 'showDetails');
    setText('sidebarTokenAlignLeftLabel', 'tokenAlignLeft');
    setText('sidebarShowUnderlineLabel', 'showUnderline');
    setText('sidebarAutoReadLabel', 'autoRead');
    setText('sidebarRepeatPlayLabel', 'repeatPlay');
    setText('sidebarHaAsWaLabel', 'haAsWaLabel');
    setText('sidebarReadingScriptLabel', 'readingScript');
    setText('sidebarReadingScriptOptionKatakana', 'katakanaLabel');
    setText('sidebarReadingScriptOptionHiragana', 'hiraganaLabel');
    setText('sidebarSystemTitle', 'systemTitle');
    setText('sidebarThemeLabel', 'themeLabel');
    setText('sidebarLangLabel', 'langLabel');
    setOptionText('sidebarThemeSelect', {
      paper: 'themePaper',
      sakura: 'themeSakura',
      sticky: 'themeSticky',
      green: 'themeGreen',
      blue: 'themeBlue',
      dark: 'themeDark',
      auto: 'themeAuto'
    });
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
  const THEME = {
    PAPER: 'paper',
    SAKURA: 'sakura',
    STICKY: 'sticky',
    GREEN: 'green',
    BLUE: 'blue',
    DARK: 'dark',
    AUTO: 'auto'
  };
  const LIGHT_THEMES = [THEME.PAPER, THEME.SAKURA, THEME.STICKY, THEME.GREEN, THEME.BLUE];

  function normalizeThemeValue(value) {
    if (!value) return THEME.PAPER;
    if (value === 'light') return THEME.PAPER;
    if (LIGHT_THEMES.includes(value)) return value;
    if (value === THEME.DARK || value === THEME.AUTO) return value;
    return THEME.PAPER;
  }

  let savedThemePreference = normalizeThemeValue(localStorage.getItem(LS.theme));
  let lastLightTheme = normalizeThemeValue(localStorage.getItem(LS.lightTheme));
  if (!LIGHT_THEMES.includes(lastLightTheme)) lastLightTheme = THEME.PAPER;
  if (!LIGHT_THEMES.includes(savedThemePreference) && savedThemePreference !== THEME.DARK && savedThemePreference !== THEME.AUTO) {
    savedThemePreference = THEME.PAPER;
  }
  if (!localStorage.getItem(LS.lightTheme)) {
    try { localStorage.setItem(LS.lightTheme, lastLightTheme); } catch (_) {}
  }

  const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function resolveTheme(pref) {
    if (pref === THEME.AUTO) {
      const prefersDark = prefersDarkQuery.matches;
      return prefersDark ? THEME.DARK : (LIGHT_THEMES.includes(lastLightTheme) ? lastLightTheme : THEME.PAPER);
    }
    if (pref === THEME.DARK) return THEME.DARK;
    if (LIGHT_THEMES.includes(pref)) return pref;
    return THEME.PAPER;
  }

  function syncThemeSelects(pref) {
    if (themeSelect) themeSelect.value = pref;
    if (sidebarThemeSelect) sidebarThemeSelect.value = pref;
  }

  function applyTheme(pref) {
    const resolved = resolveTheme(pref);
    document.documentElement.setAttribute('data-theme', resolved);
    syncThemeSelects(pref);

    if (themeToggleBtn) {
      const nextTheme = resolved === THEME.DARK ? (LIGHT_THEMES.includes(lastLightTheme) ? lastLightTheme : THEME.PAPER) : THEME.DARK;
      const icon = themeToggleBtn.querySelector('.theme-icon');
      if (icon) icon.textContent = nextTheme === THEME.DARK ? '🌙' : '☀️';
      const label = nextTheme === THEME.DARK ? labelSwitchToDark() : labelSwitchToLight();
      themeToggleBtn.setAttribute('aria-label', label);
      themeToggleBtn.title = label;
    }
  }

  function setThemePreference(pref) {
    const normalized = normalizeThemeValue(pref);
    savedThemePreference = normalized;
    if (LIGHT_THEMES.includes(normalized)) {
      lastLightTheme = normalized;
      try { localStorage.setItem(LS.lightTheme, lastLightTheme); } catch (e) {}
    }
    try { localStorage.setItem(LS.theme, savedThemePreference); } catch (e) {}
    applyTheme(savedThemePreference);
  }

  applyTheme(savedThemePreference);

  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      setThemePreference(themeSelect.value);
    });
  }

  if (sidebarThemeSelect) {
    sidebarThemeSelect.addEventListener('change', () => {
      setThemePreference(sidebarThemeSelect.value);
    });
  }

  prefersDarkQuery.addEventListener('change', () => {
    if (savedThemePreference === THEME.AUTO) {
      applyTheme(savedThemePreference);
    }
  });

  // 顶部主题按钮：浅色/深色快速切换
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
      const resolved = resolveTheme(savedThemePreference);
      if (resolved === THEME.DARK) {
        const target = LIGHT_THEMES.includes(lastLightTheme) ? lastLightTheme : THEME.PAPER;
        setThemePreference(target);
      } else {
        setThemePreference(THEME.DARK);
      }
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
  if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
  if (headerSpeedValue) headerSpeedValue.textContent = `${rate.toFixed(1)}x`;
  
  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      rate = Math.min(2, Math.max(0.5, parseFloat(speedSlider.value) || 1));
      if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
      if (headerSpeedValue) headerSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (sidebarSpeedSlider) sidebarSpeedSlider.value = rate;
      if (sidebarSpeedValue) sidebarSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (headerSpeedSlider) headerSpeedSlider.value = rate;
      localStorage.setItem(LS.rate, String(rate));
    });
  }

  if (sidebarSpeedSlider) {
    sidebarSpeedSlider.addEventListener('input', () => {
      rate = Math.min(2, Math.max(0.5, parseFloat(sidebarSpeedSlider.value) || 1));
      if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
      if (headerSpeedValue) headerSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (sidebarSpeedValue) sidebarSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (speedSlider) speedSlider.value = rate;
      if (headerSpeedSlider) headerSpeedSlider.value = rate;
      localStorage.setItem(LS.rate, String(rate));
    });
  }

  if (headerSpeedSlider) {
    headerSpeedSlider.addEventListener('input', () => {
      rate = Math.min(2, Math.max(0.5, parseFloat(headerSpeedSlider.value) || 1));
      if (headerSpeedValue) headerSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (speedValue) speedValue.textContent = `${rate.toFixed(1)}x`;
      if (sidebarSpeedValue) sidebarSpeedValue.textContent = `${rate.toFixed(1)}x`;
      if (speedSlider) speedSlider.value = rate;
      if (sidebarSpeedSlider) sidebarSpeedSlider.value = rate;
      localStorage.setItem(LS.rate, String(rate));
    });
  }

  // 语音列表管理
  function listVoicesFiltered() { return (window.TTS && window.TTS.listVoicesFiltered) ? window.TTS.listVoicesFiltered() : []; }

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
        const headerVoiceSelectEl = document.getElementById('headerVoiceSelect');
        if (voiceSelectEl) voiceSelectEl.innerHTML = '';
        if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.innerHTML = '';
        if (headerVoiceSelectEl) headerVoiceSelectEl.innerHTML = '';
        
        const opt = document.createElement('option');
        opt.textContent = t('noJapaneseVoice');
        opt.disabled = true;
        opt.selected = true;
        if (voiceSelectEl) voiceSelectEl.appendChild(opt);
        if (headerVoiceSelectEl) {
          const headerOpt = opt.cloneNode(true);
          headerVoiceSelectEl.appendChild(headerOpt);
        }
        
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
      const headerVoiceSelectEl = document.getElementById('headerVoiceSelect');
      if (voiceSelectEl) voiceSelectEl.innerHTML = '';
      if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.innerHTML = '';
      if (headerVoiceSelectEl) headerVoiceSelectEl.innerHTML = '';
      
      voices.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI || v.name || String(i);
        opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (默认)' : ''}`;
        if (voiceSelectEl) voiceSelectEl.appendChild(opt);
        if (headerVoiceSelectEl) {
          const headerOpt = opt.cloneNode(true);
          headerVoiceSelectEl.appendChild(headerOpt);
        }
        
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
        if (headerVoiceSelectEl) headerVoiceSelectEl.value = chosen.voiceURI || chosen.name;
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
    if (target.id !== 'voiceSelect' && target.id !== 'sidebarVoiceSelect' && target.id !== 'headerVoiceSelect') return;
    const uri = target.value;
    const v = voices.find(v => (v.voiceURI || v.name) === uri);
    if (v) {
      currentVoice = v;
      try { localStorage.setItem(LS.voiceURI, v.voiceURI || v.name); } catch (_) {}
      const mirrorIds = ['voiceSelect','sidebarVoiceSelect','headerVoiceSelect'].filter(id => id !== target.id);
      mirrorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = uri;
      });
      // 若正在播放：中断并以新音色重新播放当前段落
      restartPlaybackWithNewSettings();
    }
  });

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
        // 预先计算删除后的应激活文档：优先激活“上一个”文档；无上一个则激活“下一个”；都没有则清空
        const nextActiveId = (() => {
          if (index > 0) return docs[index - 1].id;           // 上一个
          if (docs.length > 1) return docs[1].id;             // 下一个（被删的是第一个）
          return '';
        })();

        showDeleteConfirm((t('confirmDelete') || '').replace('{title}', this.getDocumentTitle(doc.content)), 
          () => {
            // 确认删除
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

      // 保存文档内容（包括空内容）
      const doc = docs[docIndex];
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
      const label = asc ? '排序：旧→新' : '排序：新→旧';
      // 仅更新无障碍与提示文本；图标通过类切换高亮
      docSortToggle.title = label;
      docSortToggle.setAttribute('aria-label', label);
      docSortToggle.classList.toggle('asc', asc);
      docSortToggle.classList.toggle('desc', !asc);
    }

    // 渲染文档列表
    render() {
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      const activeFolder = getActiveFolderId();
      const queryLower = String(this.searchQuery || '').toLowerCase();
      
      if (!documentList) return;
      
      documentList.innerHTML = '';
      
      const filtered = docs.filter(doc => {
        // 文件夹过滤
        if (activeFolder === 'favorites' && !doc.favorite) return false;
        // “全部”不显示示例文章
        if (activeFolder === 'all' && doc.folder === 'samples') return false;
        if (activeFolder === 'samples' && doc.folder !== 'samples') return false;
        // 全局搜索过滤
        if (queryLower) {
          const text = Array.isArray(doc.content) ? doc.content.join('\n') : String(doc.content || '');
          const title = this.getDocumentTitle(doc.content);
          const combined = (title + '\n' + text).toLowerCase();
          if (!combined.includes(queryLower)) return false;
        }
        return true;
      });

      // 时间排序
      const asc = this.getSortAsc();
      filtered.sort((a, b) => {
        const ta = Number(a.createdAt) || 0;
        const tb = Number(b.createdAt) || 0;
        return asc ? (ta - tb) : (tb - ta);
      });

      filtered.forEach(doc => {
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
          this.saveAllDocuments(docs.concat(newDocs));
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

      // 新建文档下拉菜单
      const newDocDropdownBtn = document.getElementById('newDocDropdownBtn');
      const newDocDropdownMenu = document.getElementById('newDocDropdownMenu');
      
      if (newDocDropdownBtn && newDocDropdownMenu) {
        // 切换下拉菜单显示/隐藏
        newDocDropdownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isVisible = newDocDropdownMenu.classList.contains('show');
          if (isVisible) {
            newDocDropdownMenu.classList.remove('show');
            newDocDropdownBtn.classList.remove('active');
          } else {
            // 计算下拉菜单位置（使用fixed定位）
            const rect = newDocDropdownBtn.getBoundingClientRect();
            newDocDropdownMenu.style.top = `${rect.bottom + 4}px`;
            newDocDropdownMenu.style.left = `${rect.left - 156}px`; // 向左偏移，使菜单与按钮组左对齐
            
            newDocDropdownMenu.classList.add('show');
            newDocDropdownBtn.classList.add('active');
          }
        });

        // 处理下拉菜单项点击
        const dropdownItems = newDocDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault(); // 阻止a标签默认跳转行为
            e.stopPropagation();
            const docType = item.getAttribute('data-doc-type');
            
            // 根据文档类型创建不同的初始内容
            let initialContent = '';
            if (docType === 'note') {
              initialContent = '# 便签\n\n';
            } else if (docType === 'todo') {
              initialContent = '# 代办事项\n\n☐ \n☐ \n☐ ';
            }
            
            this.createDocument(initialContent);
            if (textInput) textInput.focus();
            
            // 关闭下拉菜单
            newDocDropdownMenu.classList.remove('show');
            newDocDropdownBtn.classList.remove('active');
          });
        });

        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
          if (!newDocDropdownBtn.contains(e.target) && !newDocDropdownMenu.contains(e.target)) {
            newDocDropdownMenu.classList.remove('show');
            newDocDropdownBtn.classList.remove('active');
          }
        });
      }

      // 顶部编辑工具栏"新建"按钮
      if (editorNewBtn) {
        editorNewBtn.addEventListener('click', () => {
          this.createDocument('');
          if (textInput) textInput.focus();
        });
      }

      // 顶部“同步”按钮：清空示例缓存并强制从 JSON 重新注入；点击时SVG居中旋转3圈
      if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
          syncBtn.classList.add('is-loading', 'rotate-3');
          const svg = syncBtn.querySelector('svg');
          const onEnd = () => {
            syncBtn.classList.remove('rotate-3');
            svg && svg.removeEventListener('animationend', onEnd);
          };
          if (svg) svg.addEventListener('animationend', onEnd);
          try {
            // 1) 清空示例文章缓存
            this.clearSampleDocuments();
            // 2) 强制从 samples.json 重新加载示例
            await this.seedSampleDocumentsIfNeeded(true);
            // 3) 刷新列表
            this.render();
          } finally {
            syncBtn.classList.remove('is-loading');
          }
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
      // 停止图标（黑色方块）
      svg.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>';
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

  function updatePauseButtonIcon(button, playing, paused) {
    if (!button) return;
    const svg = button.querySelector('svg');
    if (!svg) return;
    // 暂停状态：显示播放图标（恢复）；播放状态：显示暂停图标；未播放：显示暂停图标但置灰
    const showPlay = paused && playing; // 恢复
    const title = showPlay ? t('resume') : t('pause');
    button.setAttribute('aria-label', title);
    button.title = title;
    // 切换图标
    if (showPlay) {
      svg.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"></path>';
    } else {
      svg.innerHTML = '<path d="M6 5h4v14H6z" fill="currentColor"></path><path d="M14 5h4v14h-4z" fill="currentColor"></path>';
    }
    // 未播放时按钮可用但不高亮
    button.classList.toggle('disabled', !playing);
  }

  // 移动端播放按钮图标更新函数已移除

  function applyVoice(u) { if (window.TTS && window.TTS.applyVoice) { window.TTS.applyVoice(u, currentVoice, 'ja-JP'); } }

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
        const surface = token.surface || '';
        const reading = token.reading || '';
        const lemma = token.lemma || surface;
        const pos = Array.isArray(token.pos) ? token.pos : [token.pos || ''];
        
        // 解析词性信息
          const posInfo = (window.FudokiDict && window.FudokiDict.parsePartOfSpeech) ? window.FudokiDict.parsePartOfSpeech(pos) : { main: '未知', details: [], original: pos };
        const posDisplay = posInfo.main || '未知';
        const detailInfo = (window.FudokiDict && window.FudokiDict.formatDetailInfo) ? window.FudokiDict.formatDetailInfo(token, posInfo, I18N[currentLang] || {}) : '';
        
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
              <button class="play-token-btn" onclick="playToken('${reading || surface}', event)" title="${t('play')}">
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
    
    // 调试信息
    console.log('TTS播放调试:', {
      text: text,
      textToSpeak: textToSpeak,
      resolvedToken: resolvedToken,
      isHaParticleReadingEnabled: isHaParticleReadingEnabled()
    });
    
    // 特殊处理：如果是"はつか"，直接播放，避免被长文本影响
    if (textToSpeak === 'はつか') {
      console.log('特殊处理：直接播放はつか');
      const utterance = new SpeechSynthesisUtterance('はつか');
      utterance.lang = 'ja-JP';
      utterance.rate = rate;
      utterance.pitch = 1.0;
      applyVoice(utterance);
      utterance.onstart = () => {
        isPlaying = true;
        updatePlayButtonStates();
      };
      utterance.onend = () => {
        isPlaying = false;
        updatePlayButtonStates();
        clearTokenHighlight();
      };
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        isPlaying = false;
        updatePlayButtonStates();
        clearTokenHighlight();
      };
      window.speechSynthesis.speak(utterance);
      return;
    }
    
    // 特殊处理：助词"は"单字时读作"wa"
    // 但要注意：如果text是合并词汇（如"はつか"），则不应应用此规则
    // 只有当text确实是单个"は"字符且为助词时才转换
    if (
      text === 'は' &&
      resolvedToken && resolvedToken.pos && Array.isArray(resolvedToken.pos) && resolvedToken.pos[0] === '助詞' &&
      isHaParticleReadingEnabled()
    ) {
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

    // 详细信息显示逻辑
    // 优先从活动状态获取details，如果不存在则从元素中查找
    let details = null;
    if (activeTokenDetails && activeTokenDetails.element === element && activeTokenDetails.details) {
      details = activeTokenDetails.details;
    } else {
      details = element.querySelector('.token-details');
    }
    // 如果详情已被移动到 body（之前打开过），尝试通过归属引用找回
    if (!details) {
      const moved = Array.from(document.body.querySelectorAll('.token-details')).find(d => d.__ownerTokenElement === element);
      if (moved) details = moved;
    }
    
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
      // 先应用术语翻译覆盖（多语言）
      const override = (window.FudokiDict && window.FudokiDict.getTechOverride) ? window.FudokiDict.getTechOverride(tokenData) : null;
      if (override && override.translations) {
        const lang = (typeof currentLang === 'string') ? currentLang : 'ja';
        const text = override.translations[lang] || override.translations.ja || '';
        if (text) {
          translationContent.textContent = text;
          return; // 已覆盖翻译，无需查询词典
        }
      }

      // 确保词典服务已初始化
      if (!window.dictionaryService.isReady()) {
        translationContent.textContent = t('dict_init') || '正在初始化词典...';
        await window.dictionaryService.init();
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
        docManager.deleteEmptyDocument();
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
    // 动态获取当前DOM中的控件引用
    const showKanaCheckbox = document.getElementById('showKana');
    const showRomajiCheckbox = document.getElementById('showRomaji');
    const showPosCheckbox = document.getElementById('showPos');
    const tokenAlignLeftCheckbox = document.getElementById('tokenAlignLeft');
    const showDetailsCheckbox = document.getElementById('showDetails');
    const showUnderlineCheckbox = document.getElementById('showUnderline');
    const autoReadCheckbox = document.getElementById('autoRead');
    // 使用全局变量，避免遮蔽
    repeatPlayCheckbox = document.getElementById('repeatPlay');
    const sidebarShowKanaCheckbox = document.getElementById('sidebarShowKana');
    const sidebarShowRomajiCheckbox = document.getElementById('sidebarShowRomaji');
    const sidebarShowPosCheckbox = document.getElementById('sidebarShowPos');
    const sidebarTokenAlignLeftCheckbox = document.getElementById('sidebarTokenAlignLeft');
    const sidebarShowDetailsCheckbox = document.getElementById('sidebarShowDetails');
    const sidebarShowUnderlineCheckbox = document.getElementById('sidebarShowUnderline');
    const sidebarAutoReadCheckbox = document.getElementById('sidebarAutoRead');
    // 使用全局变量，避免遮蔽
    sidebarRepeatPlayCheckbox = document.getElementById('sidebarRepeatPlay');
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
    if (tokenAlignLeftCheckbox) tokenAlignLeftCheckbox.checked = getBool(LS.tokenAlignLeft, false);
    if (showDetailsCheckbox) showDetailsCheckbox.checked = getBool(LS.showDetails, true);
    if (showUnderlineCheckbox) showUnderlineCheckbox.checked = getBool(LS.showUnderline, true);
    if (autoReadCheckbox) autoReadCheckbox.checked = getBool(LS.autoRead, false);
    if (repeatPlayCheckbox) repeatPlayCheckbox.checked = getBool(LS.repeatPlay, false);
    // 同步到全局，供 tts.js 使用
    if (typeof window !== 'undefined') {
      window.repeatPlayCheckbox = repeatPlayCheckbox;
    }
    // 新增：助词“は→わ”开关
    const haAsWaCheckbox = document.getElementById('haAsWa');
    const sidebarHaAsWaCheckbox = document.getElementById('sidebarHaAsWa');
    if (haAsWaCheckbox) haAsWaCheckbox.checked = getBool(LS.haAsWa, true);
    if (sidebarHaAsWaCheckbox) sidebarHaAsWaCheckbox.checked = getBool(LS.haAsWa, true);
    
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
    if (sidebarTokenAlignLeftCheckbox) sidebarTokenAlignLeftCheckbox.checked = getBool(LS.tokenAlignLeft, false);
    if (sidebarShowDetailsCheckbox) sidebarShowDetailsCheckbox.checked = getBool(LS.showDetails, true);
    if (sidebarShowUnderlineCheckbox) sidebarShowUnderlineCheckbox.checked = getBool(LS.showUnderline, true);
    if (sidebarAutoReadCheckbox) sidebarAutoReadCheckbox.checked = getBool(LS.autoRead, false);
    if (sidebarRepeatPlayCheckbox) sidebarRepeatPlayCheckbox.checked = getBool(LS.repeatPlay, false);
    if (sidebarHaAsWaCheckbox) sidebarHaAsWaCheckbox.checked = getBool(LS.haAsWa, true);
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

    if (tokenAlignLeftCheckbox) {
      tokenAlignLeftCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.tokenAlignLeft, tokenAlignLeftCheckbox.checked);
        updateDisplaySettings();
      });
    }

    if (sidebarTokenAlignLeftCheckbox) {
      sidebarTokenAlignLeftCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.tokenAlignLeft, sidebarTokenAlignLeftCheckbox.checked);
        if (tokenAlignLeftCheckbox) tokenAlignLeftCheckbox.checked = sidebarTokenAlignLeftCheckbox.checked;
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

    // 助词“は→わ”开关（主弹窗）
    if (haAsWaCheckbox) {
      haAsWaCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.haAsWa, haAsWaCheckbox.checked);
        if (sidebarHaAsWaCheckbox) sidebarHaAsWaCheckbox.checked = haAsWaCheckbox.checked;
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
    // 助词“は→わ”开关（侧边栏）
    if (sidebarHaAsWaCheckbox) {
      sidebarHaAsWaCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.haAsWa, sidebarHaAsWaCheckbox.checked);
        if (haAsWaCheckbox) haAsWaCheckbox.checked = sidebarHaAsWaCheckbox.checked;
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
    const tokenAlignLeftCheckbox = document.getElementById('tokenAlignLeft');
    const sidebarShowKanaCheckbox = document.getElementById('sidebarShowKana');
    const sidebarShowRomajiCheckbox = document.getElementById('sidebarShowRomaji');
    const sidebarShowPosCheckbox = document.getElementById('sidebarShowPos');
    const sidebarShowDetailsCheckbox = document.getElementById('sidebarShowDetails');
    const sidebarShowUnderlineCheckbox = document.getElementById('sidebarShowUnderline');
    const sidebarTokenAlignLeftCheckbox = document.getElementById('sidebarTokenAlignLeft');
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
    const tokenAlignLeft = tokenAlignLeftCheckbox ? tokenAlignLeftCheckbox.checked :
                          (sidebarTokenAlignLeftCheckbox ? sidebarTokenAlignLeftCheckbox.checked : false);
    
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
    // 词块对齐
    if (tokenAlignLeft) css += '.token-content { align-items: flex-start !important; }\n';
    
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
  // 初始化字号缩放（如有保存）
  try { applyFontScaleFromStorage(); } catch (_) {}

  // 初始化文档管理器
  const documentManager = new DocumentManager();

  // 注入示例文章（异步），然后刷新列表以反映“示例文章”文件夹
  try {
    documentManager.seedSampleDocumentsIfNeeded().then(() => {
      documentManager.render();
    });
  } catch (_) {}

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
      if (savedCollapsed === null) {
        isCollapsed = isMobile(); // 移动端默认收起
      } else {
        isCollapsed = savedCollapsed === 'true';
      }
      mainContainer.classList.toggle('collapsed', isCollapsed);
    }
    
    // 响应窗口大小变化
    function handleResize() {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsed === null) {
        isCollapsed = isMobile();
      }
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

  // 文件夹工具栏折叠按钮已移至下方统一定义

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
        const ts = doc ? (doc.updatedAt || doc.createdAt) : null;
        editorDocDate.textContent = ts ? documentManager.formatCreationTime(ts) : '';
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
    // 主内容区不再绑定阅读模式交互，改由阅读浮层承载
  }

  // Header滚动压缩切换
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    const contentMain = document.querySelector('.content-main');
    const sidebarScroll = document.getElementById('sidebarScroll');
    if (!header || (!contentMain && !sidebarScroll)) return;

    const isMobile = () => window.innerWidth <= 768;
    let hidden = false;
    let lastY = 0;
    const threshold = 6; // 轻微滑动忽略，避免抖动

    const hideHeader = () => {
      if (!hidden) {
        document.body.classList.add('header-hidden');
        hidden = true;
      }
    };
    const showHeader = () => {
      if (hidden) {
        document.body.classList.remove('header-hidden');
        hidden = false;
      }
    };

    const handleScroll = (el) => {
      const y = el.scrollTop;
      const atTop = y <= 0;
      if (!isMobile()) {
        // 桌面端不隐藏头部
        showHeader();
        return;
      }
      if (atTop) {
        showHeader();
        lastY = 0;
        return;
      }
      if (y > lastY + threshold) {
        hideHeader();
      } else if (y < lastY - threshold) {
        showHeader();
      }
      lastY = y;
    };

    const bind = (el) => {
      if (!el) return;
      lastY = el.scrollTop;
      el.addEventListener('scroll', () => handleScroll(el), { passive: true });
      el.addEventListener('touchstart', () => { lastY = el.scrollTop; }, { passive: true });
    };

    // 初始化绑定（仅移动端）
    if (isMobile()) {
      bind(contentMain);
      bind(sidebarScroll);
    }
    // 窗口尺寸变化时的处理
    window.addEventListener('resize', () => {
      if (isMobile()) {
        bind(contentMain);
        bind(sidebarScroll);
      } else {
        showHeader();
      }
    });
    // 初始状态确保显示
    showHeader();
  }

  // 内容区域滚动时，动态调整 .content-main 的 top，实现 56px -> 0px 的渐变
  function initContentTopOffset() {
    const contentMain = document.querySelector('.content-main');
    const header = document.querySelector('.header');
    if (!contentMain) return;
    const getBaseOffset = () => {
      // 若可获取到头部实际高度则使用之，否则回退为 56px
      const h = header ? header.offsetHeight : 56;
      return Math.max(h || 56, 0);
    };
    let ticking = false;
    const applyOffset = () => {
      // 当 Header 已隐藏时，不再向上平移内容（由 CSS 归零 top 实现）
      if (document.body.classList.contains('header-hidden')) {
        contentMain.style.transform = 'translateY(0)';
        return;
      }
      const base = getBaseOffset();
      const st = contentMain.scrollTop || 0;
      const offset = Math.min(st, base);
      contentMain.style.transform = `translateY(${-offset}px)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          applyOffset();
          ticking = false;
        });
      }
    };
    contentMain.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', applyOffset, { passive: true });
    // 初始化
    applyOffset();
  }

  // 文档列表区域：滚动时让 .list-panel 顶部偏移由 56px 渐变到 0
  function initListPanelTopOffset() {
    const listPanel = document.querySelector('.list-panel');
    const sidebarScroll = document.getElementById('sidebarScroll');
    const header = document.querySelector('.header');
    if (!listPanel || !sidebarScroll) return;
    // 合并后的单列侧边栏无需额外偏移
    if (sidebarScroll.contains(listPanel)) {
      listPanel.style.transform = 'translateY(0)';
      return;
    }
    const getBaseOffset = () => {
      const h = header ? header.offsetHeight : 56;
      return Math.max(h || 56, 0);
    };
    let ticking = false;
    const applyOffset = () => {
      // 当 Header 已隐藏时，不再向上平移列表面板（由 CSS 归零 top 实现）
      if (document.body.classList.contains('header-hidden')) {
        listPanel.style.transform = 'translateY(0)';
        return;
      }
      const base = getBaseOffset();
      const st = sidebarScroll.scrollTop || 0;
      const offset = Math.min(st, base);
      listPanel.style.transform = `translateY(${-offset}px)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          applyOffset();
          ticking = false;
        });
      }
    };
    sidebarScroll.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', applyOffset, { passive: true });
    // 初始化
    applyOffset();
  }

  // 创建共享工具栏内容HTML
  function createToolbarContentHTML(context) {
    const isSidebar = context === 'sidebar';
    const id = (base) => isSidebar ? `sidebar${base.charAt(0).toUpperCase()}${base.slice(1)}` : base;
    
    // 包含语音、显示与系统设置（主题/语言）
    return `
      <!-- 语音设置 -->
      <div class="settings-section">
        <div class="sidebar-title" id="${id('voiceSettingsTitle')}">${t('voiceTitle')}</div>
        <div class="voice-controls">
          <div class="control-group select-group">
            <label class="control-label" id="${id('voiceSelectLabel')}"><span class="label-text">${t('voiceSelectLabel')}</span></label>
            <select id="${id('voiceSelect')}">
              <option value="">${t('selectVoice')}</option>
            </select>
          </div>

          <div class="control-group full-width">
            <label class="control-label" id="${id('speedLabel')}"><span class="label-text">${t('speedLabel')}</span></label>
            <input type="range" id="${id('speedRange')}" min="0.5" max="2" step="0.1" value="1">
            <div class="speed-display" id="${id('speedValue')}">1.0x</div>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="settings-section">
        <div class="sidebar-title" id="${id('displayTitle')}">${t('displayTitle')}</div>
        <div class="display-controls">
          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('showKanaLabel')}">
              <input type="checkbox" id="${id('showKana')}" checked>
              <span class="label-text">${t('showKana')}</span>
            </label>
          </div>

          <div class="control-group select-group">
            <label class="control-label" id="${id('readingScriptLabel')}"><span class="label-text">${t('readingScript')}</span></label>
            <select id="${id('readingScriptSelect')}">
              <option id="${id('readingScriptOptionKatakana')}" value="katakana">${t('katakanaLabel')}</option>
              <option id="${id('readingScriptOptionHiragana')}" value="hiragana">${t('hiraganaLabel')}</option>
            </select>
          </div>
          
          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('showRomajiLabel')}">
              <input type="checkbox" id="${id('showRomaji')}" checked>
              <span class="label-text">${t('showRomaji')}</span>
            </label>
          </div>
          
          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('showPosLabel')}">
              <input type="checkbox" id="${id('showPos')}" checked>
              <span class="label-text">${t('showPos')}</span>
            </label>
          </div>

          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('tokenAlignLeftLabel')}">
              <input type="checkbox" id="${id('tokenAlignLeft')}">
              <span class="label-text">${t('tokenAlignLeft')}</span>
            </label>
          </div>

          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('showDetailsLabel')}">
              <input type="checkbox" id="${id('showDetails')}" checked>
              <span class="label-text">${t('showDetails')}</span>
            </label>
          </div>
          
          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('showUnderlineLabel')}">
              <input type="checkbox" id="${id('showUnderline')}" checked>
              <span class="label-text">${t('showUnderline')}</span>
            </label>
          </div>
          
          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('autoReadLabel')}">
              <input type="checkbox" id="${id('autoRead')}">
              <span class="label-text">${t('autoRead')}</span>
            </label>
          </div>

          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('haAsWaLabel')}">
              <input type="checkbox" id="${id('haAsWa')}" checked>
              <span class="label-text">${t('haAsWaLabel')}</span>
            </label>
          </div>
          
          <div class="control-group checkbox-group">
            <label class="control-label" id="${id('repeatPlayLabel')}">
              <input type="checkbox" id="${id('repeatPlay')}">
              <span class="label-text">${t('repeatPlay')}</span>
            </label>
          </div>
          <div class="control-group full-width">
            <label class="control-label" id="${id('fontSizeLabel')}"><span class="label-text">${t('fontSizeLabel')}</span></label>
            <input type="range" id="${id('fontSizeRange')}" min="0.8" max="1.5" step="0.05" value="1">
            <div class="speed-display" id="${id('fontSizeValue')}">100%</div>
          </div>
        </div>
      </div>

      <!-- 系统设置 -->
      <div class="settings-section">
        <div class="sidebar-title" id="${id('systemTitle')}">${t('systemTitle')}</div>
        <div class="system-controls">
          <div class="control-group select-group">
            <label class="control-label" id="${id('themeLabel')}"><span class="label-text">${t('themeLabel')}</span></label>
            <select id="${id('themeSelect')}">
              <option value="paper">${t('themePaper')}</option>
              <option value="sakura">${t('themeSakura')}</option>
              <option value="sticky">${t('themeSticky')}</option>
              <option value="green">${t('themeGreen')}</option>
              <option value="blue">${t('themeBlue')}</option>
              <option value="dark">${t('themeDark')}</option>
              <option value="auto">${t('themeAuto')}</option>
            </select>
          </div>
          <div class="control-group select-group">
            <label class="control-label" id="${id('langLabel')}"><span class="label-text">${t('langLabel')}</span></label>
            <select id="${id('langSelect')}">
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 备份与导入 -->
      <div class="settings-section">
        <div class="sidebar-title" id="${id('backupTitle')}">${t('backupTitle')}</div>
        <div class="system-controls">
          <div class="control-group">
            <button type="button" class="btn" id="${id('exportJsonBtn')}">${t('exportBtn')}</button>
            <button type="button" class="btn" id="${id('importJsonBtn')}">${t('importBtn')}</button>
            <input type="file" id="${id('importJsonFile')}" accept="application/json" style="display:none">
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
    try { initFontSizeControls(); } catch (_) {}
    try { applyI18n(); } catch (_) {}
    try { if ('speechSynthesis' in window) refreshVoices(); } catch (_) {}
    // 动态挂载的主题选择器需要在此处重新绑定事件
    try {
      const modalThemeSelect = document.getElementById('themeSelect');
      if (modalThemeSelect) {
        // 同步当前偏好到下拉
        modalThemeSelect.value = savedThemePreference;
        Array.from(modalThemeSelect.options || []).forEach(opt => {
          opt.selected = (opt.value === savedThemePreference);
        });
        // 绑定切换事件
        modalThemeSelect.addEventListener('change', () => {
          setThemePreference(modalThemeSelect.value);
        });
      }
    } catch (_) {}

    // 动态挂载的语言选择器需要在此处重新绑定事件
    try {
      const modalLangSelect = document.getElementById('langSelect');
      if (modalLangSelect) {
        // 同步当前语言到下拉
        modalLangSelect.value = currentLang;
        Array.from(modalLangSelect.options || []).forEach(opt => {
          opt.selected = (opt.value === currentLang);
        });
        // 绑定切换事件
        modalLangSelect.addEventListener('change', () => {
          setLanguage(modalLangSelect.value);
        });
      }
    } catch (_) {}

    // 备份/导入按钮事件
    try {
      const exportBtn = document.getElementById('exportJsonBtn');
      const importBtn = document.getElementById('importJsonBtn');
      const importFile = document.getElementById('importJsonFile');

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
          version: 1,
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

      function doExport() {
        try {
          const payload = collectBackupPayload();
          const json = JSON.stringify(payload, null, 2);
          const fname = `fudoki-backup-${formatNowForFile()}.json`;
          downloadTextFile(fname, json);
          try { showNotification(t('exportSuccess'), 'success'); } catch (_) {}
        } catch (e) {
          console.error('Export failed:', e);
          try { showNotification(t('exportError'), 'error'); } catch (_) {}
        }
      }

      function applyBackup(data) {
        try {
          if (!data || !data.data) throw new Error('invalid');
          const docs = Array.isArray(data.data.documents) ? data.data.documents : [];
          const activeId = typeof data.data.activeId === 'string' ? data.data.activeId : '';
          const settings = data.data.settings && typeof data.data.settings === 'object' ? data.data.settings : {};
          // 覆盖存储
          localStorage.setItem(LS.texts, JSON.stringify(docs));
          localStorage.setItem(LS.activeId, activeId);
          Object.keys(settings).forEach((k) => {
            try { if (k && typeof settings[k] !== 'undefined') localStorage.setItem(k, settings[k]); } catch (_) {}
          });
          // 刷新界面
          try { if (documentManager) { documentManager.render(); documentManager.setActiveId(activeId); } } catch (_) {}
          try { if (settings[LS.theme]) setThemePreference(settings[LS.theme]); } catch (_) {}
          try { if (settings[LS.lang]) setLanguage(settings[LS.lang]); } catch (_) {}
          try { applyI18n(); } catch (_) {}
          try { showNotification(t('importSuccess'), 'success'); } catch (_) {}
        } catch (e) {
          console.error('Import failed:', e);
          try { showNotification(t('importError'), 'error'); } catch (_) {}
        }
      }

      if (exportBtn) exportBtn.addEventListener('click', doExport);
      if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', () => {
          const file = importFile.files && importFile.files[0];
          if (!file) return;
          const proceed = (cb) => {
            if (window.showDeleteConfirm) {
              showDeleteConfirm(t('importConfirmOverwrite'), () => cb && cb(), () => {});
            } else if (window.confirm ? window.confirm(t('importConfirmOverwrite')) : true) {
              cb && cb();
            }
          };
          proceed(() => {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const text = String(reader.result || '');
                const obj = JSON.parse(text);
                applyBackup(obj);
              } catch (e) {
                console.error('Invalid backup file:', e);
                try { showNotification(t('importError'), 'error'); } catch (_) {}
              } finally {
                importFile.value = '';
              }
            };
            reader.onerror = () => {
              try { showNotification(t('importError'), 'error'); } catch (_) {}
              importFile.value = '';
            };
            reader.readAsText(file);
          });
        });
      }
    } catch (_) {}
  }

  // 在模板注入后，重新绑定语音与速度控件事件，避免初次选择为空导致不生效
  function initVoiceAndSpeedControls() {
    const voiceSelectEl = document.getElementById('voiceSelect');
    const sidebarVoiceSelectEl = document.getElementById('sidebarVoiceSelect');
    const headerVoiceSelectEl = document.getElementById('headerVoiceSelect');
    const speedSliderEl = document.getElementById('speedRange');
    const speedValueEl = document.getElementById('speedValue');
    const sidebarSpeedSliderEl = document.getElementById('sidebarSpeedRange');
    const sidebarSpeedValueEl = document.getElementById('sidebarSpeedValue');
    const headerSpeedSliderEl = document.getElementById('headerSpeedRange');
    const headerSpeedValueEl = document.getElementById('headerSpeedValue');
    const playAllBtnEl = document.getElementById('playAllBtn');
    const sidebarPlayAllBtnEl = document.getElementById('sidebarPlayAllBtn');

    // 初始化速度显示
    if (speedSliderEl) speedSliderEl.value = String(rate);
    if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
    if (sidebarSpeedSliderEl) sidebarSpeedSliderEl.value = String(rate);
    if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
    if (headerSpeedSliderEl) headerSpeedSliderEl.value = String(rate);
    if (headerSpeedValueEl) headerSpeedValueEl.textContent = `${rate.toFixed(1)}x`;

    // 绑定速度事件
    if (speedSliderEl) {
      speedSliderEl.addEventListener('input', () => {
        rate = Math.min(2, Math.max(0.5, parseFloat(speedSliderEl.value) || 1));
        if (typeof window !== 'undefined') window.rate = rate;
        if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (sidebarSpeedSliderEl) sidebarSpeedSliderEl.value = rate;
        if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (headerSpeedSliderEl) headerSpeedSliderEl.value = rate;
        if (headerSpeedValueEl) headerSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        localStorage.setItem(LS.rate, String(rate));
        // 若正在播放：中断并以新速度重新播放当前段落
        restartPlaybackWithNewSettings();
      });
    }

    if (sidebarSpeedSliderEl) {
      sidebarSpeedSliderEl.addEventListener('input', () => {
        rate = Math.min(2, Math.max(0.5, parseFloat(sidebarSpeedSliderEl.value) || 1));
        if (typeof window !== 'undefined') window.rate = rate;
        if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (speedSliderEl) speedSliderEl.value = rate;
        if (headerSpeedSliderEl) headerSpeedSliderEl.value = rate;
        if (headerSpeedValueEl) headerSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        localStorage.setItem(LS.rate, String(rate));
        // 若正在播放：中断并以新速度重新播放当前段落
        restartPlaybackWithNewSettings();
      });
    }

    if (headerSpeedSliderEl) {
      headerSpeedSliderEl.addEventListener('input', () => {
        rate = Math.min(2, Math.max(0.5, parseFloat(headerSpeedSliderEl.value) || 1));
        if (typeof window !== 'undefined') window.rate = rate;
        if (headerSpeedValueEl) headerSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (speedValueEl) speedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (sidebarSpeedValueEl) sidebarSpeedValueEl.textContent = `${rate.toFixed(1)}x`;
        if (speedSliderEl) speedSliderEl.value = rate;
        if (sidebarSpeedSliderEl) sidebarSpeedSliderEl.value = rate;
        localStorage.setItem(LS.rate, String(rate));
        // 若正在播放：中断并以新速度重新播放当前段落
        restartPlaybackWithNewSettings();
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
          if (headerVoiceSelectEl) headerVoiceSelectEl.value = uri;
          // 若正在播放：中断并以新音色重新播放当前段落
          restartPlaybackWithNewSettings();
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
          if (headerVoiceSelectEl) headerVoiceSelectEl.value = uri;
          // 若正在播放：中断并以新音色重新播放当前段落
          restartPlaybackWithNewSettings();
        }
      });
    }

    if (headerVoiceSelectEl) {
      headerVoiceSelectEl.addEventListener('change', () => {
        const uri = headerVoiceSelectEl.value;
        const v = voices.find(v => (v.voiceURI || v.name) === uri);
        if (v) {
          currentVoice = v;
          localStorage.setItem(LS.voiceURI, v.voiceURI || v.name);
          if (voiceSelectEl) voiceSelectEl.value = uri;
          if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.value = uri;
          // 若正在播放：中断并以新音色重新播放当前段落
          restartPlaybackWithNewSettings();
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
    initFolderToolbarCollapse();
    // 移动端右侧边栏初始化已移除
    initReadingModeToggle();
    initReadingModeInteractions();
    // 头部滚动压缩效果
    initHeaderScroll();
    // 内容滚动联动顶部偏移（56px -> 0px，再回到56px）
    // initContentTopOffset(); // Header 已移除，不再需要此效果
    // 文档列表滚动也联动顶部偏移
    // initListPanelTopOffset(); // Header 已移除，不再需要此效果
    setupPwaInstaller();
    initGlobalSearch();
    // 两栏模式：读取首选项并绑定按钮
    (function initTwoPane() {
      const mainContainer = document.querySelector('.main-container');
      if (!mainContainer) return;
      // 恢复
      try {
        const saved = localStorage.getItem(LS.twoPane);
        const on = saved === 'true';
        if (on) mainContainer.classList.add('two-pane');
        if (twoPaneToggle) {
          twoPaneToggle.classList.toggle('is-active', on);
          twoPaneToggle.setAttribute('aria-pressed', String(on));
        }
      } catch (_) {}

      if (twoPaneToggle) {
        twoPaneToggle.addEventListener('click', () => {
          const next = !mainContainer.classList.contains('two-pane');
          mainContainer.classList.toggle('two-pane', next);
          // 同步与保存
          twoPaneToggle.classList.toggle('is-active', next);
          twoPaneToggle.setAttribute('aria-pressed', String(next));
          twoPaneToggle.title = next ? (t('twoPaneOn') || '两栏模式已启用') : (t('twoPaneOff') || '两栏模式已关闭');
          try { localStorage.setItem(LS.twoPane, String(next)); } catch (_) {}
        });
      }
    })();
    initQuickSearch();
    // initSidebarAutoCollapse(); // 已禁用自动收缩功能
  }

  // 防抖已抽离至 static/js/ui-utils.js（window.debounce）

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
        if (confirm(t('confirmExit'))) {
          alert(t('exitInDevelopment'));
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
  // 文件夹工具栏折叠（支持多个触发按钮）
  function initFolderToolbarCollapse() {
    const buttons = Array.from(document.querySelectorAll('.folder-collapse-btn'));
    const mainContainer = document.querySelector('.main-container');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!mainContainer || buttons.length === 0) return;

    // 恢复上次状态
    let collapsed = false;
    try {
      collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (_) {}
    // 切换的是 main-container 上的类，由样式层实现具体折叠动作
    mainContainer.classList.toggle('collapsed', collapsed);

    const handleClick = (e) => {
      e.preventDefault();
      const isCollapsed = mainContainer.classList.toggle('collapsed');
      try { localStorage.setItem('sidebarCollapsed', String(isCollapsed)); } catch (_) {}
    };

    // 绑定所有触发按钮（标题区与文档列表工具栏）
    buttons.forEach(btn => btn.addEventListener('click', handleClick));
    
    // 点击遮罩时关闭侧边栏（仅移动端）
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        mainContainer.classList.add('collapsed');
        try { localStorage.setItem('sidebarCollapsed', 'true'); } catch (_) {}
      });
    }
  }
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
      try { localStorage.setItem('app:fontScale', String(scale)); } catch (_) {}
    };

    // 初始值来源：localStorage
    let initial = 1;
    try {
      const saved = localStorage.getItem('app:fontScale');
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
      const saved = localStorage.getItem('app:fontScale');
      if (saved) {
        const scale = Math.max(0.8, Math.min(1.5, parseFloat(saved) || 1));
        document.documentElement.style.setProperty('--font-scale', String(scale));
      }
    } catch (_) {}
  }
  
  // 字体家族存储应用（输入区与显示区分别控制）
  function applyFontFamilyFromStorage() {
    try {
      const inFont = localStorage.getItem('app:inputFont');
      const outFont = localStorage.getItem('app:contentFont');
      if (inFont) document.documentElement.style.setProperty('--input-font-family', inFont);
      if (outFont) document.documentElement.style.setProperty('--content-font-family', outFont);
      const inSel = document.getElementById('editorInputFontSelect');
      const outSel = document.getElementById('editorContentFontSelect');
      if (inSel && inFont) inSel.value = inFont;
      if (outSel && outFont) outSel.value = outFont;
    } catch (_) {}
  }

  // 初始化字体家族选择控件并持久化
  function initFontFamilyControls() {
    const inputSelect = document.getElementById('editorInputFontSelect');
    const contentSelect = document.getElementById('editorContentFontSelect');
    const applyInput = (val) => {
      if (!val) return;
      document.documentElement.style.setProperty('--input-font-family', val);
      try { localStorage.setItem('app:inputFont', val); } catch (_) {}
    };
    const applyContent = (val) => {
      if (!val) return;
      document.documentElement.style.setProperty('--content-font-family', val);
      try { localStorage.setItem('app:contentFont', val); } catch (_) {}
    };
    if (inputSelect) {
      inputSelect.addEventListener('change', () => applyInput(inputSelect.value));
    }
    if (contentSelect) {
      contentSelect.addEventListener('change', () => applyContent(contentSelect.value));
    }
    applyFontFamilyFromStorage();
  }

  // DOM 就绪后恢复字体并初始化控件（双重保障）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { applyFontFamilyFromStorage(); } catch (_) {}
      try { initFontFamilyControls(); } catch (_) {}
    });
  } else {
    try { applyFontFamilyFromStorage(); } catch (_) {}
    try { initFontFamilyControls(); } catch (_) {}
  }
