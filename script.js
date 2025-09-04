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

  // テキスト内容の永続化
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

  // 音声リストの取得（日本語/英語のみを表示）
  function populateVoices() {
    voices = window.speechSynthesis.getVoices?.() || [];
    if (!voiceSelect) return;
    const prev = voiceSelect.value;
    voiceSelect.innerHTML = '';

    // 日本語/英語のみ抽出。日本語を優先し、次に英語。
    const pool = voices
      .filter(v => {
        const l = (v.lang || '').toLowerCase();
        return l.startsWith('ja') || l.startsWith('en');
      })
      .sort((a, b) => {
        const pa = (a.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
        const pb = (b.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
        if (pa !== pb) return pa - pb;
        // 既定音声を前へ
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

    if (!pool.length) {
      const opt = document.createElement('option');
      opt.textContent = '日本語/英語の音声が見つかりません';
      opt.disabled = true;
      opt.selected = true;
      voiceSelect.appendChild(opt);
      jaVoice = null;
      return;
    }

    pool.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI || v.name || String(idx);
      opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (既定)' : ''}`;
      voiceSelect.appendChild(opt);
    });

    // 保存済みの選択を復元、なければ日本語/既定を選択
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

  // 初回と変更時に音声リストをロード
  if ('speechSynthesis' in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      populateVoices();
    };
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('このブラウザは音声合成をサポートしていません。Chrome/Edge/Safari などの最新ブラウザをご利用ください。');
      return;
    }
    const t = (text || '').trim();
    if (!t) return;
    // 直前の発話をキャンセルして重なりを防ぐ
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    if (jaVoice) {
      u.voice = jaVoice;
      u.lang = jaVoice.lang || 'ja-JP';
    } else {
      u.lang = 'ja-JP';
    }
    u.rate = rate; // 速度
    u.pitch = 1.0; // ピッチ
    window.speechSynthesis.speak(u);
  }

  function hasJapaneseChars(s) {
    // 漢字・ひらがな・カタカナ、または英数字を含むか
    return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Za-z0-9]/u.test(s);
  }

  function segmentJa(text) {
    const t = (text || '').replace(/[\n\r]+/g, ' ').trim();
    if (!t) return [];
    // 可能なら Intl.Segmenter を使って日本語の単語単位に分割
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
        // 失敗したらフォールバックへ
      }
    }
    // 簡易フォールバック：空白と句読点で分割し、日本語/英数字を含む断片のみ残す
    return t
      .split(/([\s、。．，,\.！？!?:；;“”"'（）()【】《》〈〉…—\-]+)/)
      .map(s => s.trim())
      .filter(s => s && hasJapaneseChars(s));
  }

  // 行ごとに分割してから語分割した配列を返す
  function segmentJaLines(text) {
    const src = (text || '').replace(/[\r]+/g, '');
    const lines = src.split('\n');
    const out = [];
    for (const line of lines) {
      const t = (line || '').trim();
      if (!t) { out.push([]); continue; }
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        try {
          const seg = new Intl.Segmenter('ja', { granularity: 'word' });
          const parts = [];
          for (const item of seg.segment(t)) {
            const s = (item.segment || '').trim();
            if (s && hasJapaneseChars(s)) parts.push(s);
          }
          out.push(parts);
          continue;
        } catch (e) {}
      }
      const parts = t
        .split(/[\s、。．，,\.！？!?:；;“”\"'（）()【】《》〈〉…—\-]+/)
        .map(s => s.trim())
        .filter(s => s && hasJapaneseChars(s));
      out.push(parts);
    }
    return out;
  }

  function renderSegments(data) {
    segmentsEl.innerHTML = '';
    const isNested = Array.isArray(data[0]);
    const lines = isNested ? data : [data];
    if (!lines.length || lines.every(arr => arr.length === 0)) {
      segmentsEl.innerHTML = '<div class="hint">クリック可能な語を分割できませんでした。テキストを確認するか別のブラウザをお試しください。</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    let idx = 0;
    lines.forEach(line => {
      const row = document.createElement('div');
      row.className = 'line';
      line.forEach(p => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.dataset.text = p;
        chip.dataset.idx = String(idx);
        chip.setAttribute('aria-label', `読み上げ: ${p}`);
        chip.innerHTML = buildRubyContent(p);
        chip.addEventListener('click', () => handleChipClick(idx));
        row.appendChild(chip);
        idx += 1;
      });
      frag.appendChild(row);
    });
    segmentsEl.appendChild(frag);
    clearRangeSelection();
  }

  playBtn.addEventListener('click', () => {
    speak(textEl.value);
  });

  segmentBtn.addEventListener('click', () => {
    const byLine = segmentJaLines(textEl.value);
    renderSegments(byLine);
  });

  // テーマ切り替え
  const root = document.documentElement;
  function updateToggleLabel(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent = theme === 'light' ? 'ダーク' : 'ライト';
    themeToggleBtn.setAttribute('aria-label', theme === 'light' ? 'ダークモードに切り替える' : 'ライトモードに切り替える');
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    updateToggleLabel(theme);
  }
  // 初期化：保存済みテーマ > システムの設定
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

  // 音声の選択
  voiceSelect?.addEventListener('change', () => {
    const uri = voiceSelect.value;
    const v = voices.find(v => (v.voiceURI || v.name) === uri);
    if (v) {
      jaVoice = v;
      try { localStorage.setItem('voiceURI', v.voiceURI || v.name); } catch (e) {}
    }
  });

  // 速度の制御
  function setRate(val) {
    rate = Math.min(2, Math.max(0.5, Number(val) || 1));
    if (rateValueEl) rateValueEl.textContent = `${rate.toFixed(1)}x`;
    try { localStorage.setItem('rate', String(rate)); } catch (e) {}
  }
  // 初期化（速度）
  (function initRate() {
    let saved = 1;
    try { saved = parseFloat(localStorage.getItem('rate')) || 1; } catch (e) {}
    setRate(saved);
    if (rateRange) rateRange.value = String(rate);
  })();
  rateRange?.addEventListener('input', () => setRate(rateRange.value));

  // ユーティリティ：ふりがな生成（簡易実装）
  function isHiraganaOnly(s) { return /^[\p{Script=Hiragana}]+$/u.test(s || ''); }
  function isKatakanaOnly(s) { return /^[\p{Script=Katakana}]+$/u.test(s || ''); }
  function hasHanChar(s) { return /[\p{Script=Han}]/u.test(s || ''); }

  function asciiToKana(s) {
    const map = {
      a:'えー', b:'びー', c:'しー', d:'でぃー', e:'いー', f:'えふ', g:'じー', h:'えいち', i:'あい', j:'じぇー', k:'けー', l:'える', m:'えむ', n:'えぬ', o:'おー', p:'ぴー', q:'きゅー', r:'あーる', s:'えす', t:'てぃー', u:'ゆー', v:'ぶい', w:'だぶりゅー', x:'えっくす', y:'わい', z:'じー',
    };
    return (s || '').toLowerCase().split('').map(ch => map[ch] || ch).join('');
  }
  function digitsToKana(s) {
    const map = { '0':'ぜろ','1':'いち','2':'に','3':'さん','4':'よん','5':'ご','6':'ろく','7':'なな','8':'はち','9':'きゅう' };
    return (s || '').split('').map(ch => map[ch] ?? ch).join('');
  }
  function ensureKanaFallback(p) {
    // 長さに応じて「あ」や「かな」を繰り返して必ずかなを返す
    if (!p) return 'あ';
    const n = Math.max(1, Math.min(6, p.length));
    return 'かな'.repeat(Math.ceil(n/2)).slice(0, n);
  }
  function computeReading(p) {
    if (!p) return 'あ';
    if (isHiraganaOnly(p)) return p; // そのまま
    if (isKatakanaOnly(p)) return toHiragana(p);
    // 既存のかなを抽出
    const kana = toHiragana(readingForToken(p));
    if (kana) return kana;
    // 数字・ASCII
    if (/^[0-9]+$/.test(p)) return digitsToKana(p);
    if (/^[A-Za-z]+$/.test(p)) return toHiragana(asciiToKana(p));
    // 混在の場合も、ASCII/数字を変換して連結
    let out = '';
    for (const ch of p) {
      if (/^[\p{Script=Hiragana}]$/u.test(ch)) out += ch;
      else if (/^[\p{Script=Katakana}]$/u.test(ch)) out += toHiragana(ch);
      else if (/^[0-9]$/.test(ch)) out += digitsToKana(ch);
      else if (/^[A-Za-z]$/.test(ch)) out += toHiragana(asciiToKana(ch));
    }
    if (out) return out;
    return ensureKanaFallback(p);
  }
  function buildRubyContent(token) {
    const p = token || '';
    const reading = computeReading(p);
    return `<ruby>${escapeHtml(p)}<rt>${escapeHtml(reading)}</rt></ruby>`;
  }
  function readingForToken(token) {
    // ルール：
    // - ひらがな/カタカナのみ: そのまま返す（カタカナはひらがなに変換）
    // - 漢字を含む: 既に含まれるかな部分のみ抽出（正確な読みには辞書が必要）
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

  // クリック範囲選択 → 再生
  let rangeStart = null; // number | null
  let rangeEnd = null;   // number | null
  let playBtnFloating = null; // 再生ボタン

  function getChips() { return Array.from(segmentsEl.querySelectorAll('.chip')); }
  function getSelectedChips() { return getChips().filter(c => c.classList.contains('selected')); }
  function clearRangeSelection() {
    rangeStart = null; rangeEnd = null;
    getChips().forEach(c => c.classList.remove('selected'));
    hidePlayBtn();
  }
  function selectRange(a, b) {
    const [min, max] = a <= b ? [a, b] : [b, a];
    getChips().forEach(c => {
      const i = Number(c.dataset.idx || -1);
      if (i >= min && i <= max) c.classList.add('selected');
      else c.classList.remove('selected');
    });
  }
  function ensurePlayBtn() {
    if (!playBtnFloating) {
      playBtnFloating = document.createElement('button');
      playBtnFloating.type = 'button';
      playBtnFloating.className = 'btn primary selection-play';
      playBtnFloating.textContent = '🔊';
      playBtnFloating.setAttribute('aria-label', '選択範囲を読み上げ');
      playBtnFloating.addEventListener('click', () => {
        const text = getSelectedChips().map(c => c.dataset.text || '').join('');
        speak(text);
      });
      document.body.appendChild(playBtnFloating);
    }
  }
  function hidePlayBtn() { if (playBtnFloating) playBtnFloating.style.display = 'none'; }
  function showPlayBtnAt(rect) {
    ensurePlayBtn();
    const top = Math.max(8, rect.top - 36);
    const left = rect.left + rect.width / 2;
    playBtnFloating.style.display = 'inline-block';
    playBtnFloating.style.top = `${top}px`;
    playBtnFloating.style.left = `${left}px`;
  }
  function updatePlayBtnPosition() {
    const selected = getSelectedChips();
    if (!selected.length) { hidePlayBtn(); return; }
    const rects = selected.map(el => el.getBoundingClientRect());
    const left = Math.min(...rects.map(r => r.left));
    const right = Math.max(...rects.map(r => r.right));
    const top = Math.min(...rects.map(r => r.top));
    const bottom = Math.max(...rects.map(r => r.bottom));
    showPlayBtnAt({ left, top, width: right - left, height: bottom - top });
  }
  function handleChipClick(idx) {
    if (rangeStart === null) {
      rangeStart = idx;
      selectRange(idx, idx);
      updatePlayBtnPosition();
      return;
    }
    rangeEnd = idx;
    selectRange(rangeStart, rangeEnd);
    updatePlayBtnPosition();
  }

  // 外側クリックで選択解除
  document.addEventListener('mousedown', (e) => {
    if (segmentsEl.contains(e.target)) return;
    if (playBtnFloating && playBtnFloating.contains(e.target)) return;
    clearRangeSelection();
  });
  window.addEventListener('scroll', () => updatePlayBtnPosition(), { passive: true });
  window.addEventListener('resize', () => updatePlayBtnPosition());
})();
