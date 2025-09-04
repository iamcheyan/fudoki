const { useEffect, useMemo, useRef, useState } = React;

// Storage keys
const LS = {
  text: 'text',
  theme: 'theme',
  voiceURI: 'voiceURI',
  rate: 'rate',
};

// Reading helpers (force a furigana reading)
function toHiragana(s) {
  return (s || '').replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}
function isHiraganaOnly(s){return /^[\p{Script=Hiragana}]+$/u.test(s||'');}
function isKatakanaOnly(s){return /^[\p{Script=Katakana}]+$/u.test(s||'');}
function hasHanChar(s){return /[\p{Script=Han}]/u.test(s||'');}
function digitsToKana(s){const m={'0':'ぜろ','1':'いち','2':'に','3':'さん','4':'よん','5':'ご','6':'ろく','7':'なな','8':'はち','9':'きゅう'};return (s||'').split('').map(c=>m[c]??c).join('');}
function asciiToKana(s){const m={a:'えー',b:'びー',c:'しー',d:'でぃー',e:'いー',f:'えふ',g:'じー',h:'えいち',i:'あい',j:'じぇー',k:'けー',l:'える',m:'えむ',n:'えぬ',o:'おー',p:'ぴー',q:'きゅー',r:'あーる',s:'えす',t:'てぃー',u:'ゆー',v:'ぶい',w:'だぶりゅー',x:'えっくす',y:'わい',z:'じー'};return (s||'').toLowerCase().split('').map(c=>m[c]||c).join('');}
function readingForToken(token){
  const t=(token||'').trim();
  if(!t) return '';
  if(isHiraganaOnly(t)) return t;
  if(isKatakanaOnly(t)) return toHiragana(t);
  const kana=(t.match(/[\p{Script=Hiragana}\p{Script=Katakana}]+/gu)||[]).join('');
  if(kana) return toHiragana(kana);
  if(/^[0-9]+$/.test(t)) return digitsToKana(t);
  if(/^[A-Za-z]+$/.test(t)) return toHiragana(asciiToKana(t));
  let out='';
  for(const ch of t){
    if(/^[\p{Script=Hiragana}]$/u.test(ch)) out+=ch;
    else if(/^[\p{Script=Katakana}]$/u.test(ch)) out+=toHiragana(ch);
    else if(/^[0-9]$/.test(ch)) out+=digitsToKana(ch);
    else if(/^[A-Za-z]$/.test(ch)) out+=toHiragana(asciiToKana(ch));
  }
  if(out) return out;
  const n=Math.max(1,Math.min(6,t.length));
  return 'かな'.repeat(Math.ceil(n/2)).slice(0,n);
}

// Segment per line using Intl.Segmenter with fallback
function hasJapaneseChars(s){return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Za-z0-9]/u.test(s);}
function segmentLines(text){
  const src=(text||'').replace(/[\r]+/g,'');
  const lines=src.split('\n');
  return lines.map(line=>{
    const t=(line||'').trim();
    if(!t) return [];
    if(typeof Intl!=='undefined'&&Intl.Segmenter){
      try{
        const seg=new Intl.Segmenter('ja',{granularity:'word'});
        const arr=[];for(const it of seg.segment(t)){const s=(it.segment||'').trim(); if(s&&hasJapaneseChars(s)) arr.push(s);} 
        return arr;
      }catch(e){}
    }
    return t.split(/[\s、。．，,\.！？!?:；;“”"'（）()【】《》〈〉…—\-]+/).map(s=>s.trim()).filter(s=>s&&hasJapaneseChars(s));
  });
}

// Speech helpers
function listVoicesFiltered(){
  const voices=window.speechSynthesis.getVoices?.()||[];
  return voices.filter(v=>{const l=(v.lang||'').toLowerCase();return l.startsWith('ja')||l.startsWith('en');})
    .sort((a,b)=>{const pa=(a.lang||'').toLowerCase().startsWith('ja')?0:1;const pb=(b.lang||'').toLowerCase().startsWith('ja')?0:1; if(pa!==pb) return pa-pb; if(a.default&&!b.default) return -1; if(!a.default&&b.default) return 1; return (a.name||'').localeCompare(b.name||'');});
}

function App(){
  const [collapsed,setCollapsed]=useState(true);
  const [text,setText]=useState(()=>localStorage.getItem(LS.text)||'');
  const [lines,setLines]=useState([]); // string[][]
  const [voices,setVoices]=useState([]);
  const [voiceURI,setVoiceURI]=useState(()=>localStorage.getItem(LS.voiceURI)||'');
  const [rate,setRate]=useState(()=>parseFloat(localStorage.getItem(LS.rate))||1);
  const [playing,setPlaying]=useState({mode:'idle', line:-1, idx:-1});

  // theme
  useEffect(()=>{
    let theme=localStorage.getItem(LS.theme);
    if(!theme){ theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'; }
    document.documentElement.classList.toggle('dark', theme==='dark');
  },[]);
  const toggleTheme=()=>{
    const isDark=document.documentElement.classList.toggle('dark');
    localStorage.setItem(LS.theme, isDark?'dark':'light');
  };

  // voices
  useEffect(()=>{
    if(!('speechSynthesis' in window)) return;
    const refresh=()=>{
      const pool=listVoicesFiltered();
      setVoices(pool);
      const pref=localStorage.getItem(LS.voiceURI)||voiceURI;
      const chosen=pool.find(v=> (v.voiceURI||v.name)===pref) || pool.find(v=>(v.lang||'').toLowerCase().startsWith('ja')) || pool[0];
      if(chosen){ setVoiceURI(chosen.voiceURI||chosen.name); }
    };
    refresh();
    window.speechSynthesis.onvoiceschanged=refresh;
  },[]);

  // persist text/rate/voice
  useEffect(()=>{ localStorage.setItem(LS.text, text); },[text]);
  useEffect(()=>{ localStorage.setItem(LS.rate, String(rate)); },[rate]);
  useEffect(()=>{ if(voiceURI) localStorage.setItem(LS.voiceURI, voiceURI); },[voiceURI]);

  // segmentation
  const doSegment=()=>{ setLines(segmentLines(text)); setCollapsed(true); };
  useEffect(()=>{ if((text||'').trim()){ setLines(segmentLines(text)); } },[]);

  // speech
  const currentVoice=useMemo(()=> voices.find(v=> (v.voiceURI||v.name)===voiceURI) || null, [voices,voiceURI]);
  const speakText=(t)=>{
    if(!('speechSynthesis' in window)) { alert('このブラウザは音声合成をサポートしていません。'); return; }
    const s=(t||'').trim(); if(!s) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(s);
    if(currentVoice){ u.voice=currentVoice; u.lang=currentVoice.lang||'ja-JP'; } else { u.lang='ja-JP'; }
    u.rate=rate; u.pitch=1.0;
    window.speechSynthesis.speak(u);
  };

  // sequential speak for full or per-line
  const queueRef=useRef(null);
  const stopQueue=()=>{ queueRef.current=null; window.speechSynthesis.cancel(); setPlaying({mode:'idle',line:-1,idx:-1}); };
  const playQueue=(items)=>{
    stopQueue();
    queueRef.current={items, i:0};
    const step=()=>{
      const q=queueRef.current; if(!q) return;
      if(q.i>=q.items.length){ stopQueue(); return; }
      const {text,line,idx}=q.items[q.i];
      setPlaying({mode:'queue',line,idx});
      const u=new SpeechSynthesisUtterance(text);
      if(currentVoice){ u.voice=currentVoice; u.lang=currentVoice.lang||'ja-JP'; } else { u.lang='ja-JP'; }
      u.rate=rate; u.pitch=1.0; u.onend=()=>{ if(queueRef.current){ queueRef.current.i++; step(); } };
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    };
    step();
  };

  const playFull=()=>{
    const items=[]; lines.forEach((ln,li)=> ln.forEach((tk,ti)=> items.push({text:tk,line:li,idx:ti})) );
    playQueue(items);
  };
  const playLine=(li)=>{
    const items=[]; (lines[li]||[]).forEach((tk,ti)=> items.push({text:tk,line:li,idx:ti}));
    playQueue(items);
  };

  const onTokenClick=(li,ti,token)=>{
    if(!('speechSynthesis' in window)) return;
    setPlaying({mode:'single', line:li, idx:ti});
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance((token||'').trim());
    if(currentVoice){ u.voice=currentVoice; u.lang=currentVoice.lang||'ja-JP'; } else { u.lang='ja-JP'; }
    u.rate=rate; u.pitch=1.0; u.onend=()=>setPlaying({mode:'idle', line:-1, idx:-1});
    window.speechSynthesis.speak(u);
  };
  const onTokenLongPress=(li)=>{ playLine(li); };

  // long-press helper
  const pressTimer=useRef(null);
  const startPress=(li,ti,tk)=>{ clearTimeout(pressTimer.current); pressTimer.current=setTimeout(()=> onTokenLongPress(li), 500); };
  const endPress=(li,ti,tk)=>{ if(pressTimer.current){ clearTimeout(pressTimer.current); onTokenClick(li,ti,tk); } };

  const header= (
    <header className="w-full border-b border-slate-200/70 dark:border-slate-700/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">日本語読み上げ・分割ツール</h1>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">テーマ</button>
        </div>
      </div>
    </header>
  );

  const inputCollapsed = (
    <div className="mx-auto max-w-5xl px-4 mt-6">
      <button onClick={()=>setCollapsed(false)} className="w-full md:w-auto inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
        ＋新しいテキスト
      </button>
      {text && (
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          <button className="underline" onClick={()=>setCollapsed(false)}>現在のテキストを編集する</button>
        </div>
      )}
    </div>
  );

  const inputExpanded = (
    <div className="mx-auto max-w-5xl px-4 mt-6 transition-all">
      <div className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} placeholder="ここに日本語の文章を貼り付けてください。"
          className="w-full outline-none bg-transparent resize-vertical text-base" />
        <div className="mt-3 flex gap-2">
          <button onClick={doSegment} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">分割</button>
          <button onClick={()=>{setCollapsed(true);}} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">閉じる</button>
          <div className="flex-1" />
          <button onClick={()=>speakText(text)} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">全文を再生</button>
        </div>
      </div>
    </div>
  );

  const controls = (
    <section className="mx-auto max-w-5xl px-4 mt-6">
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-3 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">音声</label>
          <select value={voiceURI} onChange={e=>setVoiceURI(e.target.value)} className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent">
            {voices.length===0 && <option value="">日本語/英語の音声が見つかりません</option>}
            {voices.map((v,i)=>{
              const val=v.voiceURI||v.name||String(i);
              const label=`${v.name} — ${v.lang}${v.default?' (既定)':''}`;
              return <option key={val} value={val}>{label}</option>;
            })}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">速度</label>
          <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e=>setRate(parseFloat(e.target.value)||1)} />
          <span className="text-sm tabular-nums">{rate.toFixed(1)}x</span>
        </div>
        <div className="flex-1" />
        <button onClick={playFull} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">全文再生</button>
      </div>
    </section>
  );

  const words = (
    <section className="mx-auto max-w-5xl px-4 mt-6 mb-10">
      <div className="space-y-3" aria-live="polite">
        {lines.map((ln,li)=> (
          <div key={li} className="flex flex-wrap gap-2">
            {ln.map((tk,ti)=>{
              const reading=toHiragana(readingForToken(tk));
              const active= playing.line===li && playing.idx===ti;
              return (
                <button key={ti}
                  onMouseDown={()=>startPress(li,ti,tk)} onMouseUp={()=>endPress(li,ti,tk)} onMouseLeave={()=>clearTimeout(pressTimer.current)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition select-none ${active?'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500':'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <ruby>
                    {tk}
                    <rt>{reading}</rt>
                  </ruby>
                </button>
              );
            })}
          </div>
        ))}
        {(!lines || lines.length===0) && (
          <div className="text-sm text-slate-500">テキストを入力して「分割」を押してください。</div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-full">
      {header}
      {collapsed ? inputCollapsed : inputExpanded}
      {controls}
      {words}
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
