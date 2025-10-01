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

  // 本地存储键
  const LS = { 
    text: 'text', 
    voiceURI: 'voiceURI', 
    rate: 'rate', 
    texts: 'texts', 
    activeId: 'activeId' 
  };

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

  // 语音合成相关
  let voices = [];
  let currentVoice = null;
  let rate = parseFloat(localStorage.getItem(LS.rate)) || 1;

  // 初始化速度滑块
  speedSlider.value = String(rate);

  // 词性解析函数
  function parsePartOfSpeech(pos) {
    if (!Array.isArray(pos) || pos.length === 0) {
      return { main: '未知', details: [] };
    }

    const posMap = {
      '名詞': '名词',
      '動詞': '动词', 
      '形容詞': '形容词',
      '副詞': '副词',
      '助詞': '助词',
      '助動詞': '助动词',
      '連体詞': '连体词',
      '接続詞': '接续词',
      '感動詞': '感叹词',
      '記号': '符号',
      '補助記号': '辅助符号',
      'フィラー': '填充词',
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
    details.push(`<div class="detail-item"><strong>表层形:</strong> ${token.surface}</div>`);
    if (token.lemma && token.lemma !== token.surface) {
      details.push(`<div class="detail-item"><strong>基本形:</strong> ${token.lemma}</div>`);
    }
    if (token.reading && token.reading !== token.surface) {
      details.push(`<div class="detail-item"><strong>读音:</strong> ${token.reading}</div>`);
    }
    
    // 词性信息
    details.push(`<div class="detail-item"><strong>词性:</strong> ${posInfo.main}</div>`);
    if (posInfo.details.length > 0) {
      posInfo.details.forEach(detail => {
        details.push(`<div class="detail-item">${detail}</div>`);
      });
    }
    
    // 原始词性标签
    if (posInfo.original && posInfo.original.length > 0) {
      const originalPos = posInfo.original.filter(p => p !== '*').join(' / ');
      if (originalPos) {
        details.push(`<div class="detail-item"><strong>原始标签:</strong> ${originalPos}</div>`);
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

  // 文档管理功能
  function uuid() {
    return 'xxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
  }

  function loadDocs() {
    try {
      return JSON.parse(localStorage.getItem(LS.texts) || '[]');
    } catch {
      return [];
    }
  }

  function saveDocs(arr) {
    localStorage.setItem(LS.texts, JSON.stringify(arr || []));
  }

  function getActiveId() {
    return localStorage.getItem(LS.activeId) || '';
  }

  function setActiveId(id) {
    localStorage.setItem(LS.activeId, id || '');
  }

  function titleOf(text) {
    const f = (text || '').split('\n')[0]?.trim() || '';
    return f || '无标题';
  }

  function shortTitle(s, max = 24) {
    const t = (s || '').trim();
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + '…';
  }

  function renderDocumentList() {
    const docs = loadDocs();
    if (!documentList) return;
    
    documentList.innerHTML = '';
    
    docs.forEach(d => {
      const full = titleOf(d.content);
      const docItem = document.createElement('div');
      docItem.className = 'sidebar-btn';
      docItem.style.cursor = 'pointer';
      docItem.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        ${shortTitle(full, 20)}
      `;
      docItem.title = full;
      docItem.onclick = () => {
        setActiveId(d.id);
        loadActiveIntoEditor();
        analyzeText(); // 自动分析新加载的文档
        // 更新视觉状态
        document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
        docItem.classList.add('active');
      };
      
      if (d.id === getActiveId()) {
        docItem.classList.add('active');
      }
      
      documentList.appendChild(docItem);
    });

    let active = getActiveId();
    if (!active && docs[0]) {
      active = docs[0].id;
      setActiveId(active);
    }
  }

  // 初始化默认文档
  (function seedDefault() {
    let docs = loadDocs();
    if (docs.length === 0) {
      const def = {
        id: DEFAULT_DOC_ID,
        content: DEFAULT_DOC_CONTENT,
        createdAt: Date.now(),
        locked: true
      };
      saveDocs([def]);
      setActiveId(def.id);
    }
  })();

  renderDocumentList();

  function loadActiveIntoEditor() {
    const docs = loadDocs();
    const id = getActiveId();
    const cur = docs.find(d => d.id === id);
    textInput.value = (cur && cur.content) || '';
  }

  loadActiveIntoEditor();

  function updateDeleteButtonState() {
    // 删除按钮功能已移除，保留函数以避免错误
  }

  // 文档选择事件已移至renderDocumentList函数中处理

  // 保存和删除按钮事件已移除，功能集成到文档列表中

  updateDeleteButtonState();

  // 语音合成功能
  function speak(text, rateOverride) {
    if (!('speechSynthesis' in window)) return;
    const s = (text || '').trim();
    if (!s) return;
    
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(s);
    applyVoice(u);
    u.rate = typeof rateOverride === 'number' ? rateOverride : rate;
    u.pitch = 1.0;
    
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    
    window.speechSynthesis.speak(u);
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
        <p>在上方输入日语文本，点击"分析文本"开始处理</p>
      </div>
    `;
  }

  function showLoadingState() {
    content.innerHTML = `
      <div style="text-align: center; color: #667eea; padding: 2rem;">
        <div class="loading" style="margin: 0 auto 1rem;"></div>
        <p>正在分析文本...</p>
      </div>
    `;
  }

  function showErrorState(message) {
    content.innerHTML = `
      <div style="text-align: center; color: #e53e3e; padding: 2rem;">
        <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.7;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
        </svg>
        <p>分析失败: ${message}</p>
        <button class="btn btn-secondary" onclick="analyzeText()" style="margin-top: 1rem;">重试</button>
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
        
        return `
          <span class="token-pill" onclick="toggleTokenDetails(this)" data-token='${JSON.stringify(token).replace(/'/g, "&apos;")}'>
            ${surface}
            ${reading && reading !== surface ? `<span class="furigana">${reading}</span>` : ''}
            <span class="pos-tag">${posDisplay}</span>
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
    speak(text);
  };

  // 显示/隐藏词汇详细信息
  window.toggleTokenDetails = function(element) {
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
        // 计算详细信息面板的位置
        const rect = element.getBoundingClientRect();
        const detailsHeight = 200; // 预估高度
        const viewportHeight = window.innerHeight;
        
        // 确定显示位置（在元素下方或上方）
        let top = rect.bottom + 5;
        if (top + detailsHeight > viewportHeight - 20) {
          top = rect.top - detailsHeight - 5;
        }
        
        // 设置位置
        details.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 350)) + 'px';
        details.style.top = Math.max(10, top) + 'px';
        
        details.style.display = 'block';
        element.classList.add('active');
      }
    }
  };

  // 播放整行文本
  window.playLine = function(lineIndex) {
    const lineContainer = document.querySelectorAll('.line-container')[lineIndex];
    if (lineContainer) {
      const tokens = lineContainer.querySelectorAll('.token-pill');
      const lineText = Array.from(tokens).map(token => token.textContent.split('\n')[0]).join('');
      speak(lineText);
    }
  };

  // 播放全部文本
  playAllBtn.addEventListener('click', () => {
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

  // 初始化时如果有文本则自动分析
  if (textInput.value.trim()) {
    setTimeout(() => analyzeText(), 100);
  } else {
    showEmptyState();
  }

})();
