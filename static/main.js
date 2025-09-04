(() => {
  const $ = (id) => document.getElementById(id);
  const textEl = $('text');
  const openBtn = $('openBtn');
  const closeBtn = $('closeBtn');
  const editBtn = $('editBtn');
  const editingHint = $('editingHint');
  const editor = $('editor');
  const segmentBtn = $('segmentBtn');
  const linesEl = $('lines');
  const placeholderEl = $('placeholder');
  const voiceSelect = $('voiceSelect');
  const rateRange = $('rate');
  const rateVal = $('rateVal');
  const playAllBtn = $('playAllBtn');
  const playAllBtnTop = $('playAllBtnTop');
  const themeBtn = $('themeBtn');

  const LS = { text: 'text', theme: 'theme', voiceURI: 'voiceURI', rate: 'rate' };

  // theme
  const sunSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0 4a1 1 0 011 1h-2a1 1 0 011-1zm0-22a1 1 0 01-1-1h2a1 1 0 01-1 1zM1 13a1 1 0 01-1-1h2a1 1 0 01-1 1zm22 0a1 1 0 01-1-1h2a1 1 0 01-1 1zM4.222 19.778a1 1 0 01.707-1.707l1.414 1.414a1 1 0 01-1.414 1.414l-1.707-1.121zM17.657 6.343a1 1 0 01.707-1.707l1.414 1.414a1 1 0 01-1.414 1.414L17.657 6.343zM19.778 19.778l-1.121 1.707a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.121 1.121zM6.343 6.343L4.929 7.757A1 1 0 013.515 6.343L5.222 4.636a1 1 0 011.121 1.707z"/></svg>';
  const moonSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>';
  const isDark = () => document.documentElement.classList.contains('dark');
  const updateThemeIcon = () => {
    themeBtn.innerHTML = isDark() ? moonSVG : sunSVG;
    themeBtn.setAttribute('aria-label', isDark() ? 'ライトに切替' : 'ダークに切替');
  };
  const initTheme = () => {
    let t = localStorage.getItem(LS.theme);
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', t === 'dark');
    updateThemeIcon();
  };
  themeBtn.addEventListener('click', () => {
    const d = document.documentElement.classList.toggle('dark');
    localStorage.setItem(LS.theme, d ? 'dark' : 'light');
    updateThemeIcon();
  });
  initTheme();

  // voices
  let voices = [];
  let currentVoice = null;
  let rate = parseFloat(localStorage.getItem(LS.rate)) || 1;
  rateRange.value = String(rate); rateVal.textContent = `${rate.toFixed(1)}x`;
  rateRange.addEventListener('input', () => {
    rate = Math.min(2, Math.max(0.5, parseFloat(rateRange.value)||1));
    rateVal.textContent = `${rate.toFixed(1)}x`;
    localStorage.setItem(LS.rate, String(rate));
  });

  function listVoicesFiltered() {
    const all = window.speechSynthesis.getVoices?.() || [];
    return all.filter(v => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('ja');
    }).sort((a,b) => {
      const pa = (a.lang||'').toLowerCase().startsWith('ja') ? 0 : 1;
      const pb = (b.lang||'').toLowerCase().startsWith('ja') ? 0 : 1;
      if (pa !== pb) return pa - pb;
      if (a.default && !b.default) return -1;
      if (!a.default && b.default) return 1;
      return (a.name||'').localeCompare(b.name||'');
    });
  }
  function refreshVoices() {
    voices = listVoicesFiltered();
    voiceSelect.innerHTML = '';
    if (!voices.length) {
      const opt = document.createElement('option');
      opt.textContent = '日本語/英語の音声が見つかりません';
      opt.disabled = true; opt.selected = true;
      voiceSelect.appendChild(opt); currentVoice = null; return;
    }
    voices.forEach((v,i) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI || v.name || String(i);
      opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (既定)' : ''}`;
      voiceSelect.appendChild(opt);
    });
    const pref = localStorage.getItem(LS.voiceURI);
    const chosen = voices.find(v => (v.voiceURI||v.name) === pref) || voices.find(v => (v.lang||'').toLowerCase().startsWith('ja')) || voices[0];
    if (chosen) {
      currentVoice = chosen; voiceSelect.value = chosen.voiceURI || chosen.name;
    }
  }
  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }
  voiceSelect.addEventListener('change', () => {
    const uri = voiceSelect.value;
    const v = voices.find(v => (v.voiceURI||v.name) === uri);
    if (v) { currentVoice = v; localStorage.setItem(LS.voiceURI, v.voiceURI || v.name); }
  });

  // text and editor
  function openEditor(){ editor.classList.remove('hidden'); }
  function closeEditor(){ editor.classList.add('hidden'); }
  openBtn.addEventListener('click', openEditor);
  closeBtn.addEventListener('click', closeEditor);
  editBtn.addEventListener('click', openEditor);

  textEl.value = localStorage.getItem(LS.text) || '';
  textEl.addEventListener('input', () => { localStorage.setItem(LS.text, textEl.value || ''); });
  // On startup, if there is saved text, render last segmentation
  if ((textEl.value || '').trim()) {
    // Defer to next tick to ensure DOM ready
    setTimeout(() => segment(), 0);
  }

  // speak helpers
  function speak(t, rateOverride){
    if (!('speechSynthesis' in window)) return;
    const s = (t||'').trim(); if(!s) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(s);
    applyVoice(u);
    u.rate = typeof rateOverride === 'number' ? rateOverride : rate; 
    u.pitch = 1.0;
    try { window.speechSynthesis.resume(); } catch (e) {}
    window.speechSynthesis.speak(u);
  }

  // Apply preferred voice; if none available, fall back to system default instead of forcing ja-JP
  function applyVoice(u){
    try {
      if (currentVoice) {
        u.voice = currentVoice;
        u.lang = currentVoice.lang || 'ja-JP';
        return;
      }
      const all = window.speechSynthesis.getVoices?.() || [];
      const fb = all.find(v => v.default) || all[0];
      if (fb) { u.voice = fb; /* do not force lang */ }
      else { u.lang = 'ja-JP'; }
    } catch (e) { u.lang = 'ja-JP'; }
  }

  // queued playback by lines (sentence-level), highlight full line
  let queue = null; // {mode:'lines', rows:HTMLElement[], idx:number, paused:boolean, u:Utterance}
  function clearHighlights(){
    linesEl.querySelectorAll('button').forEach(b=>{
      b.classList.remove('ring-2','ring-blue-400','border-blue-400','bg-blue-100','dark:bg-blue-900/30','dark:border-blue-500');
    });
  }
  function setPlayBtnState(state){ // 'idle' | 'playing' | 'paused'
    if(!playAllBtn) return;
    if(state==='playing'){ playAllBtn.textContent = '⏸ 一時停止'; }
    else if(state==='paused'){ playAllBtn.textContent = '▶ 再開'; }
    else { playAllBtn.textContent = '全文再生'; }
  }
  function stopQueue(){
    queue = null;
    window.speechSynthesis.cancel();
    clearHighlights();
    setPlayBtnState('idle');
  }
  function highlightRow(row, on){
    if(!row) return;
    row.classList.toggle('ring-2', !!on);
    row.classList.toggle('ring-blue-400', !!on);
    row.classList.toggle('bg-blue-50', !!on);
    row.classList.toggle('dark:bg-blue-900/20', !!on);
  }
  function clearTokenHighlights(row){
    if(!row) return;
    row.querySelectorAll('button').forEach(b=>{
      b.classList.remove('ring-2','ring-blue-400','border-blue-400','bg-blue-100','dark:bg-blue-900/30','dark:border-blue-500');
    });
  }
  function textOfRow(row){
    const btns = Array.from(row.querySelectorAll('button'));
    return btns.filter(b => b.dataset.symbol !== '1').map(b => b.dataset.surface || b.textContent || '').join('');
  }
  function startTokenHighlight(row){
    // schedule light token-level highlight using estimated duration per token
    const btns = Array.from(row.querySelectorAll('button'));
    const tokens = btns.map(b=>({btn:b, text: (b.dataset.surface||b.textContent||''), symbol: b.dataset.symbol==='1'}));
    const baseCps = 8; // chars per second at rate=1
    const msFor = (t)=>{
      if(t.symbol) return 80; // quick blip for symbols
      const ch = Math.max(1, t.text.length);
      return Math.max(120, (ch / (baseCps * rate)) * 1000);
    };
    if(!queue) queue = {};
    queue.hBtns = tokens;
    queue.hIdx = 0;
    clearTokenHighlights(row);
    const step = () => {
      if(!queue || queue.paused) return; // paused: stop scheduling
      if(queue.hIdx >= tokens.length) { clearTokenHighlights(row); return; }
      const t = tokens[queue.hIdx];
      clearTokenHighlights(row);
      if(!t.symbol) {
        t.btn.classList.add('ring-2','ring-blue-400','border-blue-400','bg-blue-100','dark:bg-blue-900/30','dark:border-blue-500');
      }
      queue.hIdx++;
      queue.hTimer = setTimeout(step, msFor(t));
    };
    queue.hTimer && clearTimeout(queue.hTimer);
    step();
  }
  function playLineRow(row){
    stopQueue();
    const t = textOfRow(row);
    if(!t.trim()) return;
    highlightRow(row, true);
    const u = new SpeechSynthesisUtterance(t);
    applyVoice(u);
    u.rate = rate; u.pitch = 1.0;
    u.onend = () => { queue && queue.hTimer && clearTimeout(queue.hTimer); clearTokenHighlights(row); highlightRow(row, false); setPlayBtnState('idle'); };
    u.onpause = () => { if(queue){ queue.paused = true; queue.hTimer && clearTimeout(queue.hTimer); } };
    u.onresume = () => { if(queue){ queue.paused = false; startTokenHighlight(row); } };
    queue = {mode:'lines', rows:[row], idx:0, paused:false, u, hTimer:null, hIdx:0, hBtns:null};
    window.speechSynthesis.cancel(); try { window.speechSynthesis.resume(); } catch (e) {} window.speechSynthesis.speak(u); setPlayBtnState('playing');
    startTokenHighlight(row);
  }
  function playAllLines(){
    stopQueue();
    const rows = Array.from(linesEl.querySelectorAll('.line'));
    if(!rows.length) return;
    const step = () => {
      if(!queue) return;
      if(queue.idx >= rows.length){ stopQueue(); return; }
      const row = rows[queue.idx];
      clearHighlights(); highlightRow(row, true);
      const u = new SpeechSynthesisUtterance(textOfRow(row));
      applyVoice(u);
      u.rate = rate; u.pitch = 1.0;
      u.onend = () => { if(queue){ queue.hTimer && clearTimeout(queue.hTimer); clearTokenHighlights(row); queue.idx++; step(); } };
      u.onpause = () => { if(queue){ queue.paused = true; queue.hTimer && clearTimeout(queue.hTimer); } };
      u.onresume = () => { if(queue){ queue.paused = false; startTokenHighlight(row); } };
      queue.u = u;
      window.speechSynthesis.cancel(); try { window.speechSynthesis.resume(); } catch (e) {} window.speechSynthesis.speak(u); setPlayBtnState('playing');
      startTokenHighlight(row);
    };
    queue = {mode:'lines', rows, idx:0, paused:false, u:null};
    step();
  }
  function toggleQueue(){
    if(!queue){ // start full (line by line)
      playAllLines();
      return;
    }
    if(queue.paused){ window.speechSynthesis.resume(); queue.paused=false; setPlayBtnState('playing'); }
    else { window.speechSynthesis.pause(); queue.paused=true; setPlayBtnState('paused'); }
  }

  // helpers for ruby decision
  function isHiraganaOnly(s){ return /^[\p{Script=Hiragana}ー]+$/u.test(s||''); }
  function isKatakanaOnly(s){ return /^[\p{Script=Katakana}ー]+$/u.test(s||''); }
  function isPunct(s){ return /^[\p{P}\p{S}。、，．・…—「」『』（）()【】《》〈〉、。！？・：；,.!?]$/u.test(s||''); }

  // rendering
  function renderLines(lines){
    linesEl.innerHTML='';
    const frag = document.createDocumentFragment();
    let any = false;
    lines.forEach((line, li) => {
      const row = document.createElement('div');
      // mark each line row so playback can query them
      row.className = 'line flex flex-wrap gap-2';
      line.forEach((tk, ti) => {
        any = true;
        const btn = document.createElement('button');
        const posHead = (tk.pos && tk.pos[0]) || '';
        const posClass = (() => {
          switch (posHead) {
            case '名詞': return 'border-sky-300 text-sky-900 dark:text-sky-100 bg-sky-50 dark:bg-sky-900/20';
            case '動詞': return 'border-emerald-300 text-emerald-900 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-900/20';
            case '形容詞': return 'border-amber-300 text-amber-900 dark:text-amber-100 bg-amber-50 dark:bg-amber-900/20';
            case '副詞': return 'border-fuchsia-300 text-fuchsia-900 dark:text-fuchsia-100 bg-fuchsia-50 dark:bg-fuchsia-900/20';
            case '接続詞': return 'border-cyan-300 text-cyan-900 dark:text-cyan-100 bg-cyan-50 dark:bg-cyan-900/20';
            case '助詞':
            case '助動詞': return 'border-slate-300 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40';
            case '記号': return 'border-slate-200 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/30';
            default: return 'border-slate-300 dark:border-slate-600';
          }
        })();
        btn.className = `px-3 py-1.5 rounded-full border text-sm transition select-none hover:bg-slate-100 dark:hover:bg-slate-800 ${posClass}`;
        const surface = tk.surface || '';
        const reading = toHiragana(tk.reading || surface);
        const isSymbol = posHead === '記号' || isPunct(surface);
        const hiraOnly = isHiraganaOnly(surface);
        const kataOnly = isKatakanaOnly(surface);
        btn.innerHTML = isSymbol
          ? `${escapeHtml(surface)}`
          : (hiraOnly
              ? `${escapeHtml(surface)}` // ひらがなのみ → ルビなし
              : (kataOnly
                  ? `<ruby>${escapeHtml(surface)}<rt>${escapeHtml(reading)}</rt></ruby>` // カタカナのみ → ひらがなルビ
                  : `<ruby>${escapeHtml(surface)}<rt>${escapeHtml(reading)}</rt></ruby>`));
        // store surface so playback doesn't rely on ruby presence
        btn.dataset.surface = surface;
        btn.dataset.symbol = isSymbol ? '1' : '0';
        // click -> speak word, long press -> speak line
        let timer = null;
        btn.addEventListener('mousedown', () => { 
          // 一時停止中に他の行をクリックした場合は即時その行の再生へ切替（連続再生）
          if (queue && queue.paused) {
            playLineRow(row);
            timer = null;
            return;
          }
          // 通常は長押しで行全体を連続再生
          timer = setTimeout(() => { playLineRow(row); }, 500);
        });
        btn.addEventListener('mouseup', () => { 
          if (timer) { 
            clearTimeout(timer); 
            speak(tk.surface, 0.5); // 単語クリック→最も遅い速度で再生
          } 
        });
        btn.addEventListener('mouseleave', () => { if (timer) clearTimeout(timer); });
        row.appendChild(btn);
      });
      frag.appendChild(row);
    });
    linesEl.appendChild(frag);
    placeholderEl.classList.toggle('hidden', any);
    editingHint.classList.toggle('hidden', !any);
  }

  // segmentation via Flask API
  async function segment() {
    const text = textEl.value || '';
    if (!text.trim()) { renderLines([]); closeEditor(); return; }
    const res = await fetch('/api/segment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text, mode: 'B' }) });
    const data = await res.json();
    renderLines(data.lines || []);
    closeEditor();
  }
  segmentBtn.addEventListener('click', segment);

  // play all with toggle pause/resume and highlighting
  playAllBtn.addEventListener('click', toggleQueue);
  playAllBtnTop.addEventListener('click', () => speak(textEl.value));

  // util
  function toHiragana(s){ return (s||'').replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60)); }
  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
})();
