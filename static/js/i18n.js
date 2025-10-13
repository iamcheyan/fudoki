/**
 * Fudoki - 国际化（i18n）翻译词典
 * 支持语言：日语 (ja)、英语 (en)、中文 (zh)
 */

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
    ,backupTitle: 'バックアップとインポート'
    ,userMenuSyncData: 'データを同期'
    ,userMenuSettings: '設定'
    ,userMenuDataManagement: 'データ管理'
    ,userMenuExport: 'エクスポート'
    ,userMenuImport: 'インポート'
    ,userMenuDownload: 'ダウンロード'
    ,userMenuSwitchAccount: 'アカウントを切り替え'
    ,userMenuLogout: 'ログアウト'
    ,exportBtn: 'データをエクスポート'
    ,importBtn: 'データをインポート'
    ,exportSuccess: 'バックアップJSONをエクスポートしました。'
    ,exportError: 'エクスポートに失敗しました。'
    ,importSuccess: 'バックアップをインポートしました。'
    ,importError: 'インポートに失敗しました。'
    ,importConfirmOverwrite: 'インポートすると現在のデータと設定が上書きされます。続行しますか？'
    ,resume: '再開'
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
    haAsWaLabel: 'Read particle "は" as "わ"',
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
    resume: 'Resume',
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
    ,userMenuSyncData: 'Sync Data'
    ,userMenuSettings: 'Settings'
    ,userMenuDataManagement: 'Data Management'
    ,userMenuExport: 'Export'
    ,userMenuImport: 'Import'
    ,userMenuDownload: 'Download'
    ,userMenuSwitchAccount: 'Switch Account'
    ,userMenuLogout: 'Logout'
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
    haAsWaLabel: '助词"は"读作"わ"',
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
    resume: '继续',
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
    ,userMenuSyncData: '同步数据'
    ,userMenuSettings: '设置'
    ,userMenuDataManagement: '数据管理'
    ,userMenuExport: '导出'
    ,userMenuImport: '导入'
    ,userMenuDownload: '下载'
    ,userMenuSwitchAccount: '切换账户'
    ,userMenuLogout: '登出'
    ,exportBtn: '导出数据'
    ,importBtn: '导入数据'
    ,exportSuccess: '已导出备份 JSON。'
    ,exportError: '导出失败。'
    ,importSuccess: '导入成功。'
    ,importError: '导入失败：文件格式或内容无效。'
    ,importConfirmOverwrite: '导入将覆盖当前数据与设置，是否继续？'
  }
};

