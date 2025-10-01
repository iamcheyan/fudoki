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
  const newDocBtn = $('newDocBtn');
  const documentList = $('documentList');
  const langSelect = $('langSelect');
  const themeToggle = document.getElementById('themeToggle');
  
  // 显示控制元素
  const showKanaCheckbox = $('showKana');
  const showRomajiCheckbox = $('showRomaji');
  const showPosCheckbox = $('showPos');
  const autoReadCheckbox = $('autoRead');
  const repeatPlayCheckbox = $('repeatPlay');

  // 本地存储键
  const LS = { 
    text: 'text', 
    voiceURI: 'voiceURI', 
    rate: 'rate', 
    texts: 'texts', 
    activeId: 'activeId',
    showKana: 'showKana',
    showRomaji: 'showRomaji', 
    showPos: 'showPos',
    autoRead: 'autoRead',
    repeatPlay: 'repeatPlay',
    lang: 'lang',
    theme: 'theme'
  };

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
      speedLabel: '話速',
      playAll: '全文再生',
      displayTitle: '表示設定',
      showKana: 'ふりがなを表示',
      showRomaji: 'ローマ字を表示',
      showPos: '品詞を表示',
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
      speedLabel: 'Speed',
      playAll: 'Play All',
      displayTitle: 'Display Settings',
      showKana: 'Show Kana',
      showRomaji: 'Show Romaji',
      showPos: 'Show POS',
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
      speedLabel: '语速调节',
      playAll: '播放全文',
      displayTitle: '显示设置',
      showKana: '显示假名',
      showRomaji: '显示罗马音',
      showPos: '显示词性',
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
    }
  };

  let storedLang = localStorage.getItem(LS.lang);
  let currentLang = (storedLang === 'ja' || storedLang === 'en' || storedLang === 'zh') ? storedLang : 'ja';
  if (storedLang !== currentLang) {
    try { localStorage.setItem(LS.lang, currentLang); } catch (e) {}
  }
  // 当前显示的详情弹层及其锚点
  let activeTokenDetails = null; // { element, details }

  // 计算并设置详情弹层的位置
  function positionTokenDetails(element, details) {
    if (!element || !details) return;
    const rect = element.getBoundingClientRect();
    const detailsHeight = 200; // 预估高度
    const viewportHeight = window.innerHeight;
    let top = rect.bottom + 5;
    if (top + detailsHeight > viewportHeight - 20) {
      top = rect.top - detailsHeight - 5;
    }
    details.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 350)) + 'px';
    details.style.top = Math.max(10, top) + 'px';
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
    const navAnalyze = $('navAnalyze');
    if (navAnalyze) navAnalyze.textContent = t('navAnalyze');
    const navTTS = $('navTTS');
    if (navTTS) navTTS.textContent = t('navTTS');
    const navHelp = $('navHelp');
    if (navHelp) navHelp.textContent = t('navHelp');

    const sidebarDocsTitle = $('sidebarDocsTitle');
    if (sidebarDocsTitle) sidebarDocsTitle.textContent = t('sidebarDocsTitle');
    if (newDocBtn) newDocBtn.textContent = t('newDoc');
    const deleteDocBtn = $('deleteDocBtn');
    if (deleteDocBtn) deleteDocBtn.textContent = t('deleteDoc');

    if (textInput) textInput.placeholder = t('textareaPlaceholder');
    if (analyzeBtn) analyzeBtn.textContent = t('analyzeBtn');

    const voiceTitle = $('voiceTitle');
    if (voiceTitle) voiceTitle.textContent = t('voiceTitle');
    const voiceSelectLabel = $('voiceSelectLabel');
    if (voiceSelectLabel) voiceSelectLabel.textContent = t('voiceSelectLabel');
    const speedLabel = $('speedLabel');
    if (speedLabel) speedLabel.textContent = t('speedLabel');
    if (playAllBtn) playAllBtn.textContent = t('playAll');

    const displayTitle = $('displayTitle');
    if (displayTitle) displayTitle.textContent = t('displayTitle');
    const showKanaLabel = $('showKanaLabel');
    if (showKanaLabel) showKanaLabel.lastChild && (showKanaLabel.lastChild.textContent = ' ' + t('showKana'));
    const showRomajiLabel = $('showRomajiLabel');
    if (showRomajiLabel) showRomajiLabel.lastChild && (showRomajiLabel.lastChild.textContent = ' ' + t('showRomaji'));
    const showPosLabel = $('showPosLabel');
    if (showPosLabel) showPosLabel.lastChild && (showPosLabel.lastChild.textContent = ' ' + t('showPos'));

    const emptyText = $('emptyText');
    if (emptyText) emptyText.textContent = t('emptyText');

    if (langSelect) {
      langSelect.value = currentLang;
      Array.from(langSelect.options || []).forEach(opt => opt.selected = (opt.value === currentLang));
    }
    // 语言变化时刷新主题图标与aria标签
    applyTheme(savedTheme);
  }

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      currentLang = langSelect.value || 'ja';
      try { localStorage.setItem(LS.lang, currentLang); } catch (e) {}
      applyI18n();
      refreshOpenCardTexts();
    });
  }

  // 主题切换
  const THEME = { LIGHT: 'light', DARK: 'dark' };
  function applyTheme(theme) {
    const t = (theme === THEME.DARK) ? THEME.DARK : THEME.LIGHT;
    document.documentElement.setAttribute('data-theme', t === THEME.DARK ? 'dark' : 'light');
    if (themeToggle) {
      themeToggle.innerHTML = t === THEME.DARK
        ? '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M21.64 13a1 1 0 0 1-1.1.27A8 8 0 0 1 10.73 3.46a1 1 0 0 1 .27-1.1 1 1 0 0 1 1.09-.17 10 10 0 1 0 9.72 9.72 1 1 0 0 1-.17 1.09Z"></path></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"></line></g></svg>';
      themeToggle.setAttribute('aria-label', t === THEME.DARK ? '切换为亮色' : '切换为深色');
      themeToggle.setAttribute('title', '切换主题');
    }
  }
  let savedTheme = localStorage.getItem(LS.theme) || THEME.LIGHT;
  applyTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      savedTheme = (savedTheme === THEME.DARK) ? THEME.LIGHT : THEME.DARK;
      try { localStorage.setItem(LS.theme, savedTheme); } catch (e) {}
      applyTheme(savedTheme);
    });
  }

  // 点击页面其他地方隐藏详细信息
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.token-pill')) {
      document.querySelectorAll('.token-details').forEach(d => {
        d.style.display = 'none';
      });
      document.querySelectorAll('.token-pill').forEach(p => {
        p.classList.remove('active');
      });
    }
  });

  // 默认文档配置
  const DEFAULT_DOC_ID = 'default-01';
  const DEFAULT_DOC_TITLE = '外来語がつくる新しい日本語';
  const DEFAULT_CONTENT = `欢迎使用日语文本分析工具！

这是一个功能强大的日语学习助手，可以帮助您：

1. 分析日语文本的语法结构
2. 显示假名读音和罗马字
3. 标注词性信息
4. 语音朗读功能

请在上方文本框中输入日语文本，然后点击"分析文本"按钮开始使用。

您可以：
- 创建多个文档进行管理
- 切换不同的文档
- 删除不需要的文档
- 自动保存您的编辑内容

开始您的日语学习之旅吧！`;

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

  // 初始化速度滑块
  speedSlider.value = String(rate);

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
      details.push(`<div class="detail-item"><strong>${t('lbl_reading') || '读音'}:</strong> ${token.reading}</div>`);
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
  speedValue.textContent = `${rate.toFixed(1)}x`;
  
  speedSlider.addEventListener('input', () => {
    rate = Math.min(2, Math.max(0.5, parseFloat(speedSlider.value) || 1));
    speedValue.textContent = `${rate.toFixed(1)}x`;
    localStorage.setItem(LS.rate, String(rate));
  });

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
    voices = listVoicesFiltered();
    voiceSelect.innerHTML = '';
    
    if (!voices.length) {
      const opt = document.createElement('option');
      opt.textContent = '日语语音不可用';
      opt.disabled = true;
      opt.selected = true;
      voiceSelect.appendChild(opt);
      currentVoice = null;
      return;
    }

    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI || v.name || String(i);
      opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (默认)' : ''}`;
      voiceSelect.appendChild(opt);
    });

    const pref = localStorage.getItem(LS.voiceURI);
    const kyoko = voices.find(v => /kyoko/i.test(v.name || '') && (v.lang || '').toLowerCase().startsWith('ja'));
    const chosen = voices.find(v => (v.voiceURI || v.name) === pref) || kyoko || voices.find(v => (v.lang || '').toLowerCase().startsWith('ja')) || voices[0];
    
    if (chosen) {
      currentVoice = chosen;
      voiceSelect.value = chosen.voiceURI || chosen.name;
    }
  }

  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  voiceSelect.addEventListener('change', () => {
    const uri = voiceSelect.value;
    const v = voices.find(v => (v.voiceURI || v.name) === uri);
    if (v) {
      currentVoice = v;
      localStorage.setItem(LS.voiceURI, v.voiceURI || v.name);
    }
  });

  // 文档管理类
  class DocumentManager {
    constructor() {
      this.storageKey = LS.texts;
      this.activeIdKey = LS.activeId;
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
      this.render();
      this.loadActiveDocument();
      
      return newDoc;
    }

    // 删除文档
    deleteDocument(id) {
      const docs = this.getAllDocuments();
      const index = docs.findIndex(doc => doc.id === id);
      
      if (index === -1) return false;
      
      const doc = docs[index];
      if (doc.locked) {
        alert('默认文档不能删除');
        return false;
      }

      if (!confirm(`确定要删除文档"${this.getDocumentTitle(doc.content)}"吗？`)) {
        return false;
      }

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

    // 保存当前文档
    saveCurrentDocument() {
      const activeId = this.getActiveId();
      if (!activeId) return;

      const docs = this.getAllDocuments();
      const doc = docs.find(d => d.id === activeId);
      
      if (doc) {
        doc.content = textInput.value;
        doc.updatedAt = Date.now();
        this.saveAllDocuments(docs);
      }
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
    }

    // 渲染文档列表
    render() {
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      
      if (!documentList) return;
      
      documentList.innerHTML = '';
      
      docs.forEach(doc => {
        const title = this.getDocumentTitle(doc.content);
        const docItem = document.createElement('div');
        docItem.className = 'doc-item';
        docItem.dataset.docId = doc.id;
        
        if (doc.id === activeId) {
          docItem.classList.add('active');
        }
        
        docItem.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <div class="doc-item-title" title="${title}">${this.truncateTitle(title)}</div>
          <div class="doc-item-actions">
            ${!doc.locked ? '<button class="doc-action-btn delete-btn" title="删除">×</button>' : ''}
          </div>
        `;
        
        // 点击文档项切换文档
        docItem.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-btn')) {
            e.stopPropagation();
            this.deleteDocument(doc.id);
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
      if (!deleteDocBtn) return;
      
      const docs = this.getAllDocuments();
      const activeId = this.getActiveId();
      const activeDoc = docs.find(d => d.id === activeId);
      
      // 如果没有活动文档、只有一个文档或活动文档被锁定，禁用删除按钮
      deleteDocBtn.disabled = !activeDoc || docs.length <= 1 || activeDoc.locked;
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
      // 新建文档按钮
      if (newDocBtn) {
        newDocBtn.addEventListener('click', () => {
          this.createDocument('新しいドキュメントの内容をここに入力してください');
        });
      }

      // 删除文档按钮
      if (deleteDocBtn) {
        deleteDocBtn.addEventListener('click', () => {
          const activeId = this.getActiveId();
          if (activeId) {
            this.deleteDocument(activeId);
          }
        });
      }

      // 自动保存当前文档内容
      if (textInput) {
        let saveTimeout;
        textInput.addEventListener('input', () => {
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            this.saveCurrentDocument();
          }, 1000); // 1秒后自动保存
        });
      }
    }
  }

  // 语音合成功能
  function speak(text, rateOverride) {
    if (!('speechSynthesis' in window)) return;
    
    // 如果正在播放，停止当前播放
    if (isPlaying) {
      stopSpeaking();
      return;
    }
    
    // 朗读前移除括号（全角/半角）及其中内容
    const stripped = String(text || '')
      .replace(/（[^）]*）|\([^)]*\)/g, '')
      .replace(/[\s\u00A0]+/g, ' ')
      .trim();
    if (!stripped) return;
    
    // 存储当前播放的文本用于重复播放
    currentPlayingText = stripped;
    
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(stripped);
    currentUtterance = u;
    applyVoice(u);
    u.rate = typeof rateOverride === 'number' ? rateOverride : rate;
    u.pitch = 1.0;
    
    // 添加事件监听器
    u.onstart = () => {
      isPlaying = true;
      updatePlayButtonStates();
    };
    
    u.onend = () => {
      isPlaying = false;
      currentUtterance = null;
      updatePlayButtonStates();
      
      // 检查是否需要重复播放
      if (repeatPlayCheckbox && repeatPlayCheckbox.checked && currentPlayingText) {
        // 延迟一小段时间后重复播放，避免立即重复
        setTimeout(() => {
          if (repeatPlayCheckbox && repeatPlayCheckbox.checked && currentPlayingText) {
            speak(currentPlayingText, rateOverride);
          }
        }, 500);
      } else {
        // 如果不重复播放，清除当前播放文本和高亮
        currentPlayingText = null;
        clearTokenHighlight();
      }
    };
    
    u.onerror = () => {
      isPlaying = false;
      currentUtterance = null;
      currentPlayingText = null;
      clearTokenHighlight(); // 出错时也清除高亮
      updatePlayButtonStates();
    };
    
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    
    window.speechSynthesis.speak(u);
  }

  // 高亮词汇函数
  function highlightToken(text) {
    // 清除之前的高亮
    clearTokenHighlight();
    
    if (!text) return;
    
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
      window.speechSynthesis.cancel();
    }
    isPlaying = false;
    currentUtterance = null;
    currentPlayingText = null; // 停止时清除重复播放文本
    clearTokenHighlight(); // 清除词汇高亮
    updatePlayButtonStates();
  }

  function updatePlayButtonStates() {
    // 更新播放全文按钮
    updateButtonIcon(playAllBtn, isPlaying);
    
    // 更新所有行播放按钮
    document.querySelectorAll('.play-line-btn').forEach(btn => {
      updateButtonIcon(btn, isPlaying);
    });
    
    // 更新所有词汇播放按钮
    document.querySelectorAll('.play-token-btn').forEach(btn => {
      updateButtonIcon(btn, isPlaying);
    });
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
      buttonText = playing ? '停止' : '播放';
    }
    
    if (playing) {
      // 停止图标 (方形)
      svg.innerHTML = '<rect x="6" y="6" width="4" height="12" fill="currentColor"/><rect x="14" y="6" width="4" height="12" fill="currentColor"/>';
      // 根据按钮类型设置不同的title
      if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
        button.title = playAllLabel(true);
      } else {
        button.title = '停止';
      }
    } else {
      // 播放图标 (三角形)
      svg.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
      // 根据按钮类型设置不同的title
      if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
        button.title = playAllLabel(false);
      } else {
        button.title = '播放';
      }
    }
    
    // 更新按钮文本（保留SVG）
    if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
      // 对于播放全文按钮，保留SVG和更新文本
      const svgElement = button.querySelector('svg');
      button.innerHTML = '';
      button.appendChild(svgElement);
      button.appendChild(document.createTextNode(buttonText));
    }
  }

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
    content.innerHTML = `
      <div style="text-align: center; color: #a0aec0; padding: 2rem;">
        <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.5;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7"/>
        </svg>
        <p>${t('emptyText')}</p>
      </div>
    `;
  }

  function showLoadingState() {
    content.innerHTML = `
      <div style="text-align: center; color: #667eea; padding: 2rem;">
        <div class="loading" style="margin: 0 auto 1rem;"></div>
        <p>${t('loading')}</p>
      </div>
    `;
  }

  function showErrorState(message) {
    content.innerHTML = `
      <div style="text-align: center; color: #e53e3e; padding: 2rem;">
        <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.7;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
        </svg>
        <p>${t('errorPrefix')}${message}</p>
        <button class="btn btn-secondary" onclick="analyzeText()" style="margin-top: 1rem;">${t('analyzeBtn')}</button>
      </div>
    `;
  }

  function displayResults(result) {
    if (!result || !result.lines || result.lines.length === 0) {
      showEmptyState();
      return;
    }

    // 按行显示分词结果
    const html = result.lines.map((line, lineIndex) => {
      if (!Array.isArray(line) || line.length === 0) {
        return '';
      }
      
      const lineHtml = line.map((token, tokenIndex) => {
        const surface = token.surface || '';
        const reading = token.reading || '';
        const lemma = token.lemma || surface;
        const pos = Array.isArray(token.pos) ? token.pos : [token.pos || ''];
        
        // 解析词性信息
        const posInfo = parsePartOfSpeech(pos);
        const posDisplay = posInfo.main || '未知';
        const detailInfo = formatDetailInfo(token, posInfo);
        
        // 获取罗马音
        const romaji = getRomaji(reading || surface);
        
        const isPunct = (pos[0] === '記号' || pos[0] === '補助記号');
        if (isPunct) {
          return `
          <span class="punct">${surface}</span>
        `;
        }
        
        return `
          <span class="token-pill" onclick="toggleTokenDetails(this)" data-token='${JSON.stringify(token).replace(/'/g, "&apos;")}' data-pos="${posDisplay}">
            <div class="token-content">
              <div class="token-kana display-kana">${reading && reading !== surface ? reading : ''}</div>
              <div class="token-romaji display-romaji">${romaji}</div>
              <div class="token-kanji display-kanji">${surface}</div>
              <div class="token-pos display-pos">${posDisplay}</div>
            </div>
            <div class="token-details" style="display: none;">
              ${detailInfo}
              <button class="play-token-btn" onclick="playToken('${surface}', event)" title="播放">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </span>
        `;
      }).join('');
      
      return `
        <div class="line-container">
          ${lineHtml}
          <button class="play-line-btn" onclick="playLine(${lineIndex})" title="播放这一行">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      `;
    }).filter(line => line).join('');

    content.innerHTML = html;
  }

  // 播放单个词汇
  window.playToken = function(text, event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (isPlaying) {
      stopSpeaking();
      return;
    }
    
    // 高亮当前播放的词汇
    highlightToken(text);
    speak(text);
  };

  // 显示/隐藏词汇详细信息
  window.toggleTokenDetails = function(element) {
    // 检查是否启用了自动朗读功能
    if (autoReadCheckbox && autoReadCheckbox.checked) {
      // 如果启用了自动朗读，朗读词汇
      const tokenData = JSON.parse(element.getAttribute('data-token'));
      const surface = tokenData.surface || '';
      if (surface) {
        speak(surface);
      }
      // 继续执行显示详细信息面板的逻辑，不要直接返回
    }
    
    // 详细信息显示逻辑
    const details = element.querySelector('.token-details');
    if (details) {
      const isVisible = details.style.display !== 'none';
      
      // 隐藏所有其他详细信息
      document.querySelectorAll('.token-details').forEach(d => {
        d.style.display = 'none';
      });
      document.querySelectorAll('.token-pill').forEach(p => {
        p.classList.remove('active');
      });
      
      if (!isVisible) {
        // 设置位置并显示
        positionTokenDetails(element, details);
        details.style.display = 'block';
        element.classList.add('active');
        // 记录当前活动弹层
        activeTokenDetails = { element, details };
        // 加载翻译信息
        loadTranslation(element);
      } else {
        // 若当前就是活动弹层，关闭时清除引用
        if (activeTokenDetails && activeTokenDetails.details === details) {
          activeTokenDetails = null;
        }
      }
    }
  };

  // 当点击页面空白处关闭所有详情时，同时清除活动引用
  document.addEventListener('click', (e) => {
    const isPill = e.target.closest && e.target.closest('.token-pill');
    if (!isPill) {
      activeTokenDetails = null;
    }
  });

  // 加载翻译信息
  async function loadTranslation(element) {
    const tokenData = JSON.parse(element.getAttribute('data-token'));
    const translationContent = element.querySelector('.translation-content');
    
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
        const kanjiEl = token.querySelector('.token-kanji');
        return kanjiEl ? kanjiEl.textContent : '';
      }).join('');
      speak(lineText);
    }
  };

  // 播放全部文本
  playAllBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopSpeaking();
      return;
    }
    
    const text = textInput.value.trim();
    if (text) {
      speak(text);
    } else {
      showNotification('请先输入文本', 'warning');
    }
  });

  // 分析按钮事件
  analyzeBtn.addEventListener('click', analyzeText);

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
    // 从本地存储加载设置
    const showKana = localStorage.getItem(LS.showKana) !== 'false';
    const showRomaji = localStorage.getItem(LS.showRomaji) !== 'false';
    const showPos = localStorage.getItem(LS.showPos) !== 'false';
    const autoRead = localStorage.getItem(LS.autoRead) === 'true';
    const repeatPlay = localStorage.getItem(LS.repeatPlay) === 'true';
    
    // 设置复选框状态
    if (showKanaCheckbox) showKanaCheckbox.checked = showKana;
    if (showRomajiCheckbox) showRomajiCheckbox.checked = showRomaji;
    if (showPosCheckbox) showPosCheckbox.checked = showPos;
    if (autoReadCheckbox) autoReadCheckbox.checked = autoRead;
    if (repeatPlayCheckbox) repeatPlayCheckbox.checked = repeatPlay;
    
    // 应用显示设置
    updateDisplaySettings();
    
    // 添加事件监听器
    if (showKanaCheckbox) {
      showKanaCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showKana, showKanaCheckbox.checked);
        updateDisplaySettings();
      });
    }
    
    if (showRomajiCheckbox) {
      showRomajiCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showRomaji, showRomajiCheckbox.checked);
        updateDisplaySettings();
      });
    }
    
    if (showPosCheckbox) {
      showPosCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.showPos, showPosCheckbox.checked);
        updateDisplaySettings();
      });
    }
    
    if (autoReadCheckbox) {
      autoReadCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.autoRead, autoReadCheckbox.checked);
      });
    }
    
    if (repeatPlayCheckbox) {
      repeatPlayCheckbox.addEventListener('change', () => {
        localStorage.setItem(LS.repeatPlay, repeatPlayCheckbox.checked);
      });
    }
  }

  function updateDisplaySettings() {
    const showKana = showKanaCheckbox ? showKanaCheckbox.checked : true;
    const showRomaji = showRomajiCheckbox ? showRomajiCheckbox.checked : true;
    const showPos = showPosCheckbox ? showPosCheckbox.checked : true;
    
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
    
    styleElement.textContent = css;
  }

  // 初始化显示控制
  initDisplayControls();

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

})();
