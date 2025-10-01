(() => {
  const $ = (id) => document.getElementById(id);
  const textEl = $('text');
  const openBtn = null; // removed
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
  const loopBtn = $('loopBtn');

  // docs management
  const docSelect = $('docSelect');
  const addDocBtn = $('addDocBtn');
  // removed toolbar Save button
  const deleteDocBtn = $('deleteDocBtn');

  const LS = { text: 'text', theme: 'theme', voiceURI: 'voiceURI', rate: 'rate', texts: 'texts', activeId: 'activeId', loopAll: 'loopAll' };
  // Seed default non-deletable document (first run)
  const DEFAULT_DOC_ID = 'default-01';
  const DEFAULT_DOC_TITLE = '外来語がつくる新しい日本語';
  const DEFAULT_DOC_CONTENT = [
    '外来語がつくる新しい日本語。私は学生ですが、毎日の生活の中で English の言葉や カタカナ の外来語をよく使います。',
    'たとえば、友達と話すときに「スマホ」や「コンビニ」などの言葉は、もはや普通の日本語になっていると思います。',
    'さらに、大学の授業では Presentation という言葉がよく使われ、日本語と英語をまぜて話すことも多いです。',
    'このように、英語やカタカナ語は私たちの生活に深く入っていて、日本語の表現をもっと豊かにしていると感（かん）じます。'
  ].join('\n');

  // 初始化日语分词器
  let segmenter = null;
  
  async function initSegmenter() {
    if (!segmenter) {
      segmenter = new JapaneseSegmenter();
      await segmenter.init();
    }
    return segmenter;
  }

  // 主题系统
  const themes = {
    modern: { name: '现代简约', icon: '🎨' },
    tech: { name: '深色科技', icon: '🚀' },
    warm: { name: '温暖自然', icon: '🌿' },
    contrast: { name: '高对比度', icon: '⚡' }
  };

  let currentTheme = 'modern';
  const themeDropdown = document.getElementById('themeDropdown');

  const applyTheme = (theme) => {
    // 移除所有主题类
    Object.keys(themes).forEach(t => {
      document.documentElement.classList.remove(`theme-${t}`);
    });
    // 应用新主题
    document.documentElement.classList.add(`theme-${theme}`);
    currentTheme = theme;
    localStorage.setItem(LS.theme, theme);
    updateThemeIcon();
    updateThemeDropdown();
  };

  const updateThemeIcon = () => {
    const theme = themes[currentTheme];
    themeBtn.innerHTML = `<span class="text-lg">${theme.icon}</span>`;
    themeBtn.setAttribute('aria-label', `当前主题: ${theme.name}`);
  };

  const updateThemeDropdown = () => {
    const options = themeDropdown.querySelectorAll('.theme-option');
    options.forEach(option => {
      const themeKey = option.dataset.theme;
      option.classList.toggle('active', themeKey === currentTheme);
    });
  };

  const initTheme = () => {
    let savedTheme = localStorage.getItem(LS.theme);
    if (!savedTheme || !themes[savedTheme]) {
      savedTheme = 'modern'; // 默认主题
    }
    applyTheme(savedTheme);
  };

  // 主题切换事件
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('hidden');
  });

  // 点击主题选项
  themeDropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.theme-option');
    if (option) {
      const theme = option.dataset.theme;
      applyTheme(theme);
      themeDropdown.classList.add('hidden');
    }
  });

  // 点击其他地方关闭下拉菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-selector')) {
      themeDropdown.classList.add('hidden');
    }
  });

  initTheme();

  // loop toggle button (全文ループ)
  const repeatSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M4 7h10a4 4 0 014 4v1"/><path d="M10 7L7 4 4 7"/><path d="M20 17H10a4 4 0 01-4-4v-1"/><path d="M14 20l3-3 3 3"/></svg>';
  const repeatOnSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M4 7h10a4 4 0 014 4v1"/><path d="M10 7L7 4 4 7"/><path d="M20 17H10a4 4 0 01-4-4v-1"/><path d="M14 20l3-3 3 3"/></svg>';
  function updateLoopIcon(){
    const on = localStorage.getItem(LS.loopAll) === '1';
    loopBtn.innerHTML = on ? repeatOnSVG : repeatSVG;
    loopBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    loopBtn.setAttribute('aria-label', on ? 'ループ再生: ON' : 'ループ再生: OFF');
  }
  loopBtn.addEventListener('click', () => {
    const cur = localStorage.getItem(LS.loopAll) === '1';
    localStorage.setItem(LS.loopAll, cur ? '0' : '1');
    updateLoopIcon();
  });
  updateLoopIcon();

  // Icons for per-line loop button
  const rowPlayIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M4 10h3l4-3v10l-4-3H4z"/><path d="M14 9v6l4-3-4-3z"/></svg>';
  const rowPauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M4 10h3l4-3v10l-4-3H4z"/><rect x="14" y="8" width="3" height="8" rx="1"/><rect x="18.5" y="8" width="3" height="8" rx="1"/></svg>';

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
    const kyoko = voices.find(v => /kyoko/i.test(v.name||'') && (v.lang||'').toLowerCase().startsWith('ja'));
    const chosen = voices.find(v => (v.voiceURI||v.name) === pref) || kyoko || voices.find(v => (v.lang||'').toLowerCase().startsWith('ja')) || voices[0];
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
  function openEditor(){ editor.classList.remove('hidden'); try{ setTimeout(()=> textEl.focus(), 0); } catch(e){} }
  function closeEditor(){ editor.classList.add('hidden'); }
  function toggleEditor(){ editor.classList.toggle('hidden'); }
  // `openBtn` removed; use "現在のテキストを編集する" instead
  if (closeBtn) closeBtn.addEventListener('click', closeEditor);
  editBtn.addEventListener('click', openEditor);

  // Documents management (multiple saved texts)
  function uuid(){ return 'xxxxxxxx'.replace(/[x]/g, () => (Math.random()*16|0).toString(16)); }
  function loadDocs(){ try { return JSON.parse(localStorage.getItem(LS.texts)||'[]'); } catch { return []; } }
  function saveDocs(arr){ localStorage.setItem(LS.texts, JSON.stringify(arr||[])); }
  function getActiveId(){ return localStorage.getItem(LS.activeId) || ''; }
  function setActiveId(id){ localStorage.setItem(LS.activeId, id||''); }
  function titleOf(text){ const f=(text||'').split('\n')[0]?.trim()||''; return f||'無題'; }
  function shortTitle(s, max=24){ const t=(s||'').trim(); if(t.length<=max) return t; return t.slice(0, max-1)+'…'; }
  function renderDocSelect(){
    const docs = loadDocs();
    docSelect.innerHTML='';
    docs.forEach(d => {
      const full=titleOf(d.content);
      const opt=document.createElement('option');
      opt.value=d.id; opt.textContent=shortTitle(full, 24); opt.title=full;
      docSelect.appendChild(opt);
    });
    let active = getActiveId(); if(!active && docs[0]){ active=docs[0].id; setActiveId(active); }
    if(active) docSelect.value=active;
  }
  // First run seeding: ensure a default, non-deletable document exists
  (function seedDefault(){
    let docs = loadDocs();
    if(docs.length===0){
      const def={ id:DEFAULT_DOC_ID, content:DEFAULT_DOC_CONTENT, createdAt:Date.now(), locked:true };
      saveDocs([def]); setActiveId(def.id);
    }
  })();
  renderDocSelect();
  function loadActiveIntoEditor(){ const docs=loadDocs(); const id=getActiveId(); const cur=docs.find(d=>d.id===id); textEl.value=(cur&&cur.content)||''; }
  loadActiveIntoEditor();
  function updateDeleteButtonState(){
    try{
      const docs=loadDocs(); const id=getActiveId(); const cur=docs.find(d=>d.id===id);
      const locked = !!(cur && cur.locked);
      if(deleteDocBtn){ deleteDocBtn.disabled = locked; deleteDocBtn.classList.toggle('opacity-50', locked); deleteDocBtn.classList.toggle('cursor-not-allowed', locked); }
    }catch(e){}
  }
  docSelect.addEventListener('change', ()=>{ setActiveId(docSelect.value); loadActiveIntoEditor(); updateDeleteButtonState(); segment(); });
  addDocBtn.addEventListener('click', ()=>{
    const docs=loadDocs(); const d={id:uuid(),content:'',createdAt:Date.now()};
    docs.unshift(d); saveDocs(docs); setActiveId(d.id);
    renderDocSelect(); loadActiveIntoEditor(); updateDeleteButtonState(); openEditor();
  });
  // toolbar Save removed; saving is done via the editor's 保存按钮（segmentBtn）
  deleteDocBtn.addEventListener('click', ()=>{
    const docs=loadDocs(); const id=getActiveId(); const cur=docs.find(d=>d.id===id);
    if(cur && cur.locked){ return; }
    const n=docs.filter(d=>d.id!==id);
    saveDocs(n);
    const next=n[0]?.id||''; setActiveId(next); renderDocSelect(); loadActiveIntoEditor(); updateDeleteButtonState(); segment();
  });
  updateDeleteButtonState();
  if ((textEl.value || '').trim()) { setTimeout(()=>segment(),0); }

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
    linesEl.querySelectorAll('button:not(.row-loop)').forEach(b=>{
      b.classList.remove('ring-2','ring-blue-400','border-blue-400','bg-blue-100','themed-highlight');
    });
  }
  function setPlayBtnState(state){ // 'idle' | 'playing' | 'paused'
    if(!playAllBtn) return;
    if(state==='playing'){ playAllBtn.textContent = '⏸ 一時停止'; }
    else if(state==='paused'){ playAllBtn.textContent = '▶ 再開'; }
    else { playAllBtn.textContent = '全文再生'; }
  }
  // row styling helpers
  function applyRowBase(row){
    row.classList.add('rounded-3xl','border-2','px-3','py-2','shadow-sm','transition-colors','duration-200');
  }
  function setRowState(row, state){ // 'idle' | 'reading' | 'done'
    row.classList.remove(
      'border-slate-300','bg-slate-50',
      'border-blue-400','bg-blue-50',
      'border-emerald-500','bg-emerald-100',
      'border-pink-300','bg-pink-50'
    );
    if(state==='idle'){
      row.classList.add('border-slate-300','bg-slate-50');
    } else if(state==='reading'){
      // Make current reading line more conspicuous
      row.classList.add('border-emerald-500','bg-emerald-100');
    } else if(state==='done'){
      row.classList.add('border-pink-300','bg-pink-50');
      row.dataset.done='1';
    }
  }
  function centerRow(row){
    const rect=row.getBoundingClientRect();
    const y=window.scrollY + rect.top + rect.height/2 - window.innerHeight/2;
    window.scrollTo({ top: Math.max(0, y-16), behavior: 'smooth' });
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
    row.querySelectorAll('button:not(.row-loop)').forEach(b=>{
      b.classList.remove('ring-2','ring-blue-400','border-blue-400','bg-blue-100','themed-highlight');
    });
  }
  function textOfRow(row){
    const btns = Array.from(row.querySelectorAll('button:not(.row-loop)'));
    return btns.filter(b => b.dataset.symbol !== '1').map(b => b.dataset.surface || b.textContent || '').join('');
  }
  function startTokenHighlight(row){
    // schedule light token-level highlight using estimated duration per token
    const btns = Array.from(row.querySelectorAll('button:not(.row-loop)'));
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
        t.btn.classList.add('ring-2','themed-highlight');
      }
      queue.hIdx++;
      queue.hTimer = setTimeout(step, msFor(t));
    };
    queue.hTimer && clearTimeout(queue.hTimer);
    step();
  }
  function playLineRow(row){
    stopQueue();
    if (typeof stopRowLoop === 'function') try { stopRowLoop(); } catch(e) {}
    const t = textOfRow(row);
    if(!t.trim()) return;
    highlightRow(row, true);
    setRowState(row,'reading'); centerRow(row);
    const u = new SpeechSynthesisUtterance(t);
    applyVoice(u);
    u.rate = rate; u.pitch = 1.0;
    u.onend = () => { queue && queue.hTimer && clearTimeout(queue.hTimer); clearTokenHighlights(row); highlightRow(row, false); setRowState(row,'done'); setPlayBtnState('idle'); };
    u.onpause = () => { if(queue){ queue.paused = true; queue.hTimer && clearTimeout(queue.hTimer); } };
    u.onresume = () => { if(queue){ queue.paused = false; startTokenHighlight(row); } };
    queue = {mode:'lines', rows:[row], idx:0, paused:false, u, hTimer:null, hIdx:0, hBtns:null};
    window.speechSynthesis.cancel(); try { window.speechSynthesis.resume(); } catch (e) {} window.speechSynthesis.speak(u); setPlayBtnState('playing');
    startTokenHighlight(row);
  }
  function playAllLines(){
    stopQueue();
    if (typeof stopRowLoop === 'function') try { stopRowLoop(); } catch(e) {}
    const rows = Array.from(linesEl.querySelectorAll('.line'));
    if(!rows.length) return;
    const step = () => {
      if(!queue) return;
      if(queue.idx >= rows.length){
        const loop = localStorage.getItem(LS.loopAll)==='1';
        if(loop){ queue.idx = 0; }
        else { stopQueue(); return; }
      }
      const row = rows[queue.idx];
      clearHighlights(); highlightRow(row, true); setRowState(row,'reading'); centerRow(row);
      const u = new SpeechSynthesisUtterance(textOfRow(row));
      applyVoice(u);
      u.rate = rate; u.pitch = 1.0;
      u.onend = () => { if(queue){ queue.hTimer && clearTimeout(queue.hTimer); clearTokenHighlights(row); setRowState(row,'done'); queue.idx++; step(); } };
      u.onpause = () => { if(queue){ queue.paused = true; queue.hTimer && clearTimeout(queue.hTimer); } };
      u.onresume = () => { if(queue){ queue.paused = false; startTokenHighlight(row); } };
      queue.u = u;
      window.speechSynthesis.cancel(); try { window.speechSynthesis.resume(); } catch (e) {} window.speechSynthesis.speak(u); setPlayBtnState('playing');
      startTokenHighlight(row);
    };
    // reset rows visual to idle
    rows.forEach(r=>{ applyRowBase(r); setRowState(r,'idle'); });
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
  // Split incoming token lines by punctuation tokens; drop punctuation bubbles
  function splitByPunctuation(lines){
    const out=[];
    (lines||[]).forEach((line)=>{
      let buf=[];
      (line||[]).forEach((tk)=>{
        const surface=(tk?.surface||'').trim();
        const posHead=(tk?.pos&&tk.pos[0])||'';
        const sym = posHead==='記号' || isPunct(surface);
        if(sym){
          if(buf.length>0){ out.push(buf); buf=[]; }
        }else{
          buf.push(tk);
        }
      });
      if(buf.length>0) out.push(buf);
    });
    return out;
  }

  // rendering
  function renderLines(lines){
    // reset content
    linesEl.innerHTML='';
    const frag = document.createDocumentFragment();
    let any = false;
    lines.forEach((line, li) => {
      const row = document.createElement('div');
      // mark each line row so playback can query them
      row.className = 'line flex flex-wrap gap-2 relative';
      applyRowBase(row); setRowState(row,'idle');
      line.forEach((tk, ti) => {
        const btn = document.createElement('button');
        const posHead = (tk.pos && tk.pos[0]) || '';
        const posClass = (() => {
          switch (posHead) {
            case '名詞': return 'themed-token-noun';
            case '動詞': return 'themed-token-verb';
            case '形容詞': return 'themed-token-adj';
            case '副詞': return 'themed-token-adv';
            case '接続詞': return 'themed-token-conj';
            case '助詞':
            case '助動詞': return 'themed-token-particle';
            case '記号': return 'themed-token-symbol';
            default: return 'themed-token-default';
          }
        })();
        btn.className = `px-3 py-1.5 rounded-full border text-sm transition select-none themed-border hover:themed-bg-secondary relative ${posClass}`;
        const surfaceRaw = tk.surface || '';
        const surface = surfaceRaw.trim();
        if(!surface){ return; } // skip empty surface to avoid blank bubbles
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
        any = true;
      });
      // per-line loop play button (bottom-right)
      const rowBtn = document.createElement('button');
      rowBtn.type='button';
      rowBtn.className='row-loop absolute right-2 bottom-2 rounded-full bg-emerald-600 text-white shadow-md px-2 py-1 hover:bg-emerald-700 focus:outline-none transition-transform duration-100 active:scale-95';
      rowBtn.innerHTML=rowPlayIcon;
      rowBtn.addEventListener('click', (e)=>{ feedbackPulse(rowBtn); toggleRowLoop(row, rowBtn); });
      rowBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); feedbackPulse(rowBtn); toggleRowLoop(row, rowBtn); } });
      row.appendChild(rowBtn);
      frag.appendChild(row);
    });
    linesEl.appendChild(frag);
    placeholderEl.classList.toggle('hidden', any);
    editingHint.classList.toggle('hidden', !any);
  }

  // Row loop button: loop a single line; click toggles pause/resume
  let rowLoop = null; // {row: HTMLElement, btn: HTMLElement, state:'playing'|'paused'}
  function stopRowLoop(){
    if(!rowLoop) return;
    try { window.speechSynthesis.cancel(); } catch(e) {}
    setRowState(rowLoop.row,'idle');
    if (rowLoop.btn) rowLoop.btn.innerHTML = rowPlayIcon;
    rowLoop = null;
  }
  function toggleRowLoop(row, btn){
    // If clicking the same row while looping: toggle pause/resume
    if(rowLoop && rowLoop.row===row){
      if(rowLoop.state==='playing'){
        try { window.speechSynthesis.pause(); } catch(e) {}
        rowLoop.state='paused';
        if (rowLoop.btn) rowLoop.btn.innerHTML = rowPlayIcon; // show play icon while paused
      } else {
        try { window.speechSynthesis.resume(); } catch(e) {}
        rowLoop.state='playing';
        if (rowLoop.btn) rowLoop.btn.innerHTML = rowPauseIcon; // show pause icon while playing
      }
      return;
    }

    // Start a new row loop
    stopQueue(); stopRowLoop();
    setRowState(row,'reading'); centerRow(row);
    rowLoop = {row, btn, state:'playing'};
    if (btn) btn.innerHTML = rowPauseIcon;
    const speakOnce = () => {
      if(!rowLoop || rowLoop.row!==row) return;
      const text = textOfRow(row);
      if(!text.trim()){ stopRowLoop(); return; }
      const u = new SpeechSynthesisUtterance(text);
      applyVoice(u); u.rate = rate; u.pitch = 1.0; u.onend = () => { if(rowLoop && rowLoop.row===row) speakOnce(); };
      window.speechSynthesis.cancel(); try { window.speechSynthesis.resume(); } catch(e) {}
      window.speechSynthesis.speak(u);
    };
    speakOnce();
  }

  // Visual click feedback: brief ripple/halo
  function feedbackPulse(btn){
    try{
      const ripple = document.createElement('span');
      ripple.className = 'pointer-events-none absolute inset-0 rounded-full ring-4 ring-emerald-300/70 animate-ping';
      btn.appendChild(ripple);
      setTimeout(()=>{ ripple.remove(); }, 400);
    }catch(e){}
  }

  // 纯前端分词处理 - 替换原来的API调用
  async function segment() {
    const text = textEl.value || '';
    if (!text.trim()) { 
      renderLines([]); 
      closeEditor(); 
      return; 
    }

    try {
      // 初始化分词器
      await initSegmenter();
      
      // 使用本地分词器处理文本
      const data = await segmenter.segment(text, 'B');
      const processed = splitByPunctuation(data.lines || []);
      renderLines(processed);
      closeEditor();
    } catch (error) {
      console.error('Segmentation error:', error);
      // 显示错误信息
      linesEl.innerHTML = '<div class="text-red-500 p-4">分词处理失败，请检查网络连接或刷新页面重试。</div>';
      closeEditor();
    }
  }

  // Save then segment from editor button
  segmentBtn.textContent = '保存';
  segmentBtn.addEventListener('click', () => {
    const docs=loadDocs(); const id=getActiveId();
    const i=docs.findIndex(d=>d.id===id);
    if(i>=0){ docs[i].content=textEl.value||''; }
    else { const d={id:uuid(),content:textEl.value||'',createdAt:Date.now()}; docs.unshift(d); setActiveId(d.id); }
    saveDocs(docs); renderDocSelect(); updateDeleteButtonState();
    segment();
  });

  // play all with toggle pause/resume and highlighting
  playAllBtn.addEventListener('click', toggleQueue);
  if (playAllBtnTop) {
    // editor area top play button removed; keep guard in case of stale DOM
    try { playAllBtnTop.remove(); } catch(e) {}
  }

  // util
  function toHiragana(s){ return (s||'').replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60)); }
  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
})();
