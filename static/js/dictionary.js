(function () {
  'use strict';

  // 常用计算机术语读音与翻译覆盖
  const TECH_TERM_OVERRIDES = {
    'javascript': { reading: 'ジャバスクリプト', translations: { zh: 'JavaScript 脚本语言', ja: 'JavaScript', en: 'JavaScript' } },
    'typescript': { reading: 'タイプスクリプト', translations: { zh: 'TypeScript 类型化脚本', ja: 'TypeScript', en: 'TypeScript' } },
    'node.js': { reading: 'ノードジェイエス', translations: { zh: 'Node.js 运行时', ja: 'Node.js', en: 'Node.js runtime' } },
    'react': { reading: 'リアクト', translations: { zh: 'React 前端库', ja: 'React', en: 'React library' } },
    'vue': { reading: 'ヴュー', translations: { zh: 'Vue 前端框架', ja: 'Vue', en: 'Vue framework' } },
    'angular': { reading: 'アンギュラー', translations: { zh: 'Angular 前端框架', ja: 'Angular', en: 'Angular framework' } },
    'api': { reading: 'エーピーアイ', translations: { zh: '应用程序接口', ja: 'アプリケーション・プログラミング・インタフェース', en: 'Application Programming Interface' } },
    'http': { reading: 'エイチティーティーピー', translations: { zh: '超文本传输协议', ja: 'ハイパーテキスト転送プロトコル', en: 'Hypertext Transfer Protocol' } },
    'html': { reading: 'エイチティーエムエル', translations: { zh: '超文本标记语言', ja: 'ハイパーテキストマークアップ言語', en: 'HyperText Markup Language' } },
    'css': { reading: 'シーエスエス', translations: { zh: '层叠样式表', ja: 'カスケーディング・スタイル・シート', en: 'Cascading Style Sheets' } },
    'sql': { reading: 'エスキューエル', translations: { zh: '结构化查询语言', ja: '構造化問い合わせ言語', en: 'Structured Query Language' } },
    'json': { reading: 'ジェイソン', translations: { zh: 'JSON 数据格式', ja: 'JSON', en: 'JSON data format' } },
    'yaml': { reading: 'ヤムル', translations: { zh: 'YAML 配置格式', ja: 'YAML', en: 'YAML configuration format' } },
    'url': { reading: 'ユーアールエル', translations: { zh: '统一资源定位符', ja: 'URL', en: 'Uniform Resource Locator' } },
    'ui': { reading: 'ユーアイ', translations: { zh: '用户界面', ja: 'ユーザーインターフェース', en: 'User Interface' } },
    'ux': { reading: 'ユーエックス', translations: { zh: '用户体验', ja: 'ユーザーエクスペリエンス', en: 'User Experience' } },
    'ide': { reading: 'アイディーイー', translations: { zh: '集成开发环境', ja: '統合開発環境', en: 'Integrated Development Environment' } },
    'docker': { reading: 'ドッカー', translations: { zh: '容器引擎 Docker', ja: 'Docker', en: 'Docker container engine' } },
    'kubernetes': { reading: 'クバネティス', translations: { zh: '容器编排 Kubernetes', ja: 'Kubernetes', en: 'Kubernetes' } },
    'git': { reading: 'ギット', translations: { zh: '分布式版本控制 Git', ja: 'Git', en: 'Git version control' } },
    'github': { reading: 'ギットハブ', translations: { zh: '代码托管平台 GitHub', ja: 'GitHub', en: 'GitHub platform' } },
    'js': { reading: 'ジェイエス', translations: { zh: 'JS（JavaScript）', ja: 'JS（JavaScript）', en: 'JS (JavaScript)' } }
  };

  function normalizeTechKey(s) {
    return String(s || '').trim().toLowerCase();
  }

  function getTechOverride(token) {
    if (!token) return null;
    const keys = [token.surface, token.lemma, token.reading].filter(Boolean);
    for (const k of keys) {
      const key = normalizeTechKey(k);
      if (TECH_TERM_OVERRIDES[key]) return TECH_TERM_OVERRIDES[key];
      const noDot = key.replace(/\./g, '');
      if (TECH_TERM_OVERRIDES[noDot]) return TECH_TERM_OVERRIDES[noDot];
    }
    return null;
  }

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

  function formatDetailInfo(token, posInfo, i18n = {}) {
    const t = (key, fallback) => i18n[key] || fallback || key;
    const details = [];
    details.push(`<div class="detail-item"><strong>${t('lbl_surface','表层形')}:</strong> ${token.surface}</div>`);
    if (token.lemma && token.lemma !== token.surface) {
      details.push(`<div class="detail-item"><strong>${t('lbl_base','基本形')}:</strong> ${token.lemma}</div>`);
    }
    if (token.reading && token.reading !== token.surface) {
      let displayReading = token.reading;
      details.push(`<div class="detail-item"><strong>${t('lbl_reading','读音')}:</strong> ${displayReading}</div>`);
    }
    details.push(`<div class="detail-item translation-item"><strong>${t('lbl_translation','翻译')}:</strong> <span class="translation-content">${t('loading','加载中...')}</span></div>`);
    details.push(`<div class="detail-item"><strong>${t('lbl_pos','词性')}:</strong> ${posInfo.main}</div>`);
    if (posInfo.details && posInfo.details.length > 0) {
      posInfo.details.forEach(detail => {
        details.push(`<div class="detail-item">${detail}</div>`);
      });
    }
    if (posInfo.original && posInfo.original.length > 0) {
      const originalPos = posInfo.original.filter(p => p !== '*').join(' / ');
      if (originalPos) {
        details.push(`<div class="detail-item"><strong>${t('lbl_pos_raw','原始标签')}:</strong> ${originalPos}</div>`);
      }
    }
    return details.join('');
  }

  window.FudokiDict = window.FudokiDict || {
    getTechOverride,
    parsePartOfSpeech,
    formatDetailInfo
  };
})();


