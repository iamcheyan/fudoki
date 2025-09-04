(() => {
  const textEl = document.getElementById('inputText');
  const playBtn = document.getElementById('playBtn');
  const segmentBtn = document.getElementById('segmentBtn');
  const segmentsEl = document.getElementById('segments');
  const themeToggleBtn = document.getElementById('themeToggle');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateRange = document.getElementById('rateRange');
  const rateValueEl = document.getElementById('rateValue');

  let jaVoice = null;
  let voices = [];
  let rate = 1.0;

  // 文本内容持久化
  const TEXT_KEY = 'text';
  (function initText() {
    try {
      const saved = localStorage.getItem(TEXT_KEY);
      if (typeof saved === 'string') textEl.value = saved;
    } catch (e) {}
  })();
  let textSaveTimer = null;
  textEl?.addEventListener('input', () => {
    clearTimeout(textSaveTimer);
    textSaveTimer = setTimeout(() => {
      try { localStorage.setItem(TEXT_KEY, textEl.value || ''); } catch (e) {}
    }, 200);
  });

  function populateVoices() {
    voices = window.speechSynthesis.getVoices?.() || [];
    if (!voiceSelect) return;
    const prev = voiceSelect.value;
    voiceSelect.innerHTML = '';

    // 仅筛选日语/英语语音，并按语言优先级排序（ja 优先，再 en）
    const pool = voices
      .filter(v => {
        const l = (v.lang || '').toLowerCase();
        return l.startsWith('ja') || l.startsWith('en');
      })
      .sort((a, b) => {
        const pa = (a.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
        const pb = (b.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
        if (pa !== pb) return pa - pb;
        // 默认语音靠前
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

    if (!pool.length) {
      const opt = document.createElement('option');
      opt.textContent = '未检测到日语/英语语音';
      opt.disabled = true;
      opt.selected = true;
      voiceSelect.appendChild(opt);
      jaVoice = null;
      return;
    }

    pool.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI || v.name || String(idx);
      opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (默认)' : ''}`;
      voiceSelect.appendChild(opt);
    });

    // 恢复已选项或初始化默认
    let preferred = null;
    try { preferred = localStorage.getItem('voiceURI') || null; } catch (e) {}
    const matchByPref = pool.find(v => (v.voiceURI || v.name) === preferred);
    const matchByPrev = pool.find(v => (v.voiceURI || v.name) === prev);
    const firstJa = pool.find(v => (v.lang || '').toLowerCase().startsWith('ja'));
    const firstEn = pool.find(v => (v.lang || '').toLowerCase().startsWith('en'));
    const def = pool.find(v => v.default);
    const chosen = matchByPref || matchByPrev || firstJa || def || firstEn || pool[0] || null;
    if (chosen) {
      jaVoice = chosen;
      voiceSelect.value = chosen.voiceURI || chosen.name;
    }
  }

  // 初次和后续变化时尝试加载语音列表
  if ('speechSynthesis' in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      populateVoices();
    };
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('当前浏览器不支持语音合成功能。请使用 Chrome/Edge/Safari 等现代浏览器。');
      return;
    }
    const t = (text || '').trim();
    if (!t) return;
    // 取消之前的朗读，避免叠音
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    if (jaVoice) {
      u.voice = jaVoice;
      u.lang = jaVoice.lang || 'ja-JP';
    } else {
      u.lang = 'ja-JP';
    }
    u.rate = rate; // 语速
    u.pitch = 1.0; // 音高
    window.speechSynthesis.speak(u);
  }

  function hasJapaneseChars(s) {
    // 包含任意日/中字符、假名、拉丁字母或数字则认为是“词”
    return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Za-z0-9]/u.test(s);
  }

  function segmentJa(text) {
    const t = (text || '').replace(/[\n\r]+/g, ' ').trim();
    if (!t) return [];
    // 优先使用 Intl.Segmenter 进行日语分词
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      try {
        const seg = new Intl.Segmenter('ja', { granularity: 'word' });
        const parts = [];
        for (const item of seg.segment(t)) {
          const s = (item.segment || '').trim();
          if (s && hasJapaneseChars(s)) parts.push(s);
        }
        if (parts.length) return parts;
      } catch (e) {
        // ignore and fall back
      }
    }
    // 简易回退：按空白和常见标点拆分，然后保留含日文或字母数字的片段
    return t
      .split(/([\s、。．，,\.！？!?:；;“”"'（）()【】《》〈〉…—\-]+)/)
      .map(s => s.trim())
      .filter(s => s && hasJapaneseChars(s));
  }

  function renderSegments(parts) {
    segmentsEl.innerHTML = '';
    if (!parts.length) {
      segmentsEl.innerHTML = '<div class="hint">未拆出可点击的词。请检查文本或更换浏览器。</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    parts.forEach(p => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.text = p;
      chip.setAttribute('aria-label', `朗读：${p}`);
      // 生成简单假名（仅对全假名词准确；含汉字需词典支持）
      const kana = toHiragana(readingForToken(p));
      chip.innerHTML = kana && kana !== p
        ? `<ruby>${escapeHtml(p)}<rt>${escapeHtml(kana)}</rt></ruby>`
        : `<ruby>${escapeHtml(p)}<rt>${escapeHtml(kana || p)}</rt></ruby>`;
      chip.addEventListener('click', () => speak(p));
      frag.appendChild(chip);
    });
    segmentsEl.appendChild(frag);
  }

  playBtn.addEventListener('click', () => {
    speak(textEl.value);
  });

  segmentBtn.addEventListener('click', () => {
    const parts = segmentJa(textEl.value);
    renderSegments(parts);
  });

  // 主题切换
  const root = document.documentElement;
  function updateToggleLabel(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent = theme === 'light' ? '深色' : '浅色';
    themeToggleBtn.setAttribute('aria-label', theme === 'light' ? '切换到深色模式' : '切换到浅色模式');
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    updateToggleLabel(theme);
  }
  // 初始化主题：优先本地存储，否则参考系统偏好
  (function initTheme() {
    let theme = 'dark';
    try { theme = localStorage.getItem('theme') || theme; } catch (e) {}
    if (!localStorage.getItem('theme') && window.matchMedia) {
      theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    setTheme(theme);
  })();
  themeToggleBtn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  // 语音选择
  voiceSelect?.addEventListener('change', () => {
    const uri = voiceSelect.value;
    const v = voices.find(v => (v.voiceURI || v.name) === uri);
    if (v) {
      jaVoice = v;
      try { localStorage.setItem('voiceURI', v.voiceURI || v.name); } catch (e) {}
    }
  });

  // 语速控制
  function setRate(val) {
    rate = Math.min(2, Math.max(0.5, Number(val) || 1));
    if (rateValueEl) rateValueEl.textContent = `${rate.toFixed(1)}x`;
    try { localStorage.setItem('rate', String(rate)); } catch (e) {}
  }
  // 初始化语速
  (function initRate() {
    let saved = 1;
    try { saved = parseFloat(localStorage.getItem('rate')) || 1; } catch (e) {}
    setRate(saved);
    if (rateRange) rateRange.value = String(rate);
  })();
  rateRange?.addEventListener('input', () => setRate(rateRange.value));

  // 工具函数：生成假名（占位实现）
  function readingForToken(token) {
    // 简单规则：
    // - 全平假名/片假名：返回其假名（片假名转平假名）
    // - 含汉字：返回已有的假名部分（去除标点和拉丁字符），无法精准标注需词典
    const t = (token || '').trim();
    if (!t) return '';
    if (/^[\p{Script=Hiragana}\p{Script=Katakana}]+$/u.test(t)) return t;
    const kana = t.match(/[\p{Script=Hiragana}\p{Script=Katakana}]+/gu);
    return kana ? kana.join('') : '';
  }
  function toHiragana(s) {
    return (s || '').replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  }
  function escapeHtml(s) {
    return (s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
