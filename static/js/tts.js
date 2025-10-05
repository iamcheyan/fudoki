(() => {
  // 语音工具模块：挂载到 window.TTS

  function listVoicesFiltered() {
    const all = window.speechSynthesis?.getVoices?.() || [];
    return all
      .filter(v => {
        const l = (v.lang || '').toLowerCase();
        return l.startsWith('ja');
      })
      .sort((a, b) => {
        const pa = (a.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
        const pb = (b.lang || '').toLowerCase().startsWith('ja') ? 0 : 1;
        if (pa !== pb) return pa - pb;
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
  }

  function applyVoice(utterance, currentVoice, fallbackLang = 'ja-JP') {
    try {
      if (currentVoice && (currentVoice.lang || '').toLowerCase().startsWith('ja')) {
        utterance.voice = currentVoice;
        utterance.lang = currentVoice.lang || fallbackLang;
        return;
      }

      const jaVoices = listVoicesFiltered();
      if (jaVoices.length > 0) {
        utterance.voice = jaVoices[0];
        utterance.lang = jaVoices[0].lang || fallbackLang;
        return;
      }

      const all = window.speechSynthesis?.getVoices?.() || [];
      const fallback = all.find(v => v.default) || all[0];
      if (fallback) {
        utterance.voice = fallback;
        const lang = (fallback.lang || '').toLowerCase();
        utterance.lang = lang.startsWith('ja') ? fallback.lang : fallbackLang;
      } else {
        utterance.lang = fallbackLang;
      }
    } catch (_) {
      utterance.lang = fallbackLang;
    }
  }

  window.TTS = Object.freeze({
    listVoicesFiltered,
    applyVoice,
  });
})();

(function () {
  'use strict';

  const t = (key) => {
    try { return (window.FudokiGetText ? window.FudokiGetText(key) : key); } catch (_) { return key; }
  };

  // 初始化与归一化音量（0..1），避免非数值导致 Web Speech API 抛错
  function getSafeVolume() {
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const v = Number(window.volume);
    if (Number.isFinite(v)) return clamp01(v);
    try {
      const lsKey = window.LS && window.LS.volume;
      if (typeof lsKey === 'string' && lsKey) {
        const raw = localStorage.getItem(lsKey);
        const fromLS = Number(raw);
        if (Number.isFinite(fromLS)) return clamp01(fromLS);
      }
    } catch (_) {}
    return 1;
  }
  if (!Number.isFinite(Number(window.volume))) {
    window.volume = getSafeVolume();
  }

  // 语音列表过滤（仅保留日语）
  window.listVoicesFiltered = function listVoicesFiltered() {
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
  };

  window.refreshVoices = function refreshVoices() {
    const loadVoices = () => {
      window.voices = window.listVoicesFiltered();
      if (!window.voices.length) {
        setTimeout(() => {
          window.voices = window.listVoicesFiltered();
          if (window.voices.length > 0) {
            populateVoiceSelects();
          }
        }, 100);

        const voiceSelectEl = document.getElementById('voiceSelect');
        const sidebarVoiceSelectEl = document.getElementById('sidebarVoiceSelect');
        const headerVoiceSelectEl = document.getElementById('headerVoiceSelect');
        if (voiceSelectEl) voiceSelectEl.innerHTML = '';
        if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.innerHTML = '';
        if (headerVoiceSelectEl) headerVoiceSelectEl.innerHTML = '';
        const opt = document.createElement('option');
        opt.textContent = t('noJapaneseVoice') || '日本語音声は利用できません';
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
        window.currentVoice = null;
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
      (window.voices || []).forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI || v.name || String(i);
        opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (默认)' : ''}`;
        if (voiceSelectEl) voiceSelectEl.appendChild(opt);
        if (headerVoiceSelectEl) headerVoiceSelectEl.appendChild(opt.cloneNode(true));
        if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.appendChild(opt.cloneNode(true));
      });
      const pref = localStorage.getItem(window.LS && window.LS.voiceURI);
      const kyoko = (window.voices || []).find(v => /kyoko/i.test(v.name || '') && (v.lang || '').toLowerCase().startsWith('ja'));
      const chosen = (window.voices || []).find(v => (v.voiceURI || v.name) === pref) || kyoko || (window.voices || []).find(v => (v.lang || '').toLowerCase().startsWith('ja')) || (window.voices || [])[0];
      if (chosen) {
        window.currentVoice = chosen;
        if (voiceSelectEl) voiceSelectEl.value = chosen.voiceURI || chosen.name;
        if (sidebarVoiceSelectEl) sidebarVoiceSelectEl.value = chosen.voiceURI || chosen.name;
        if (headerVoiceSelectEl) headerVoiceSelectEl.value = chosen.voiceURI || chosen.name;
      }
    };

    loadVoices();
  };

  window.applyVoice = function applyVoice(u) {
    try {
      if (window.currentVoice && (window.currentVoice.lang || '').toLowerCase().startsWith('ja')) {
        u.voice = window.currentVoice;
        u.lang = window.currentVoice.lang || 'ja-JP';
        return;
      }
      const jaVoices = window.listVoicesFiltered();
      if (jaVoices.length > 0) {
        u.voice = jaVoices[0];
        u.lang = jaVoices[0].lang || 'ja-JP';
        return;
      }
      const all = window.speechSynthesis.getVoices?.() || [];
      const fb = all.find(v => v.default) || all[0];
      if (fb) {
        u.voice = fb;
        const lang = (fb.lang || '').toLowerCase();
        u.lang = lang.startsWith('ja') ? fb.lang : 'ja-JP';
      } else {
        u.lang = 'ja-JP';
      }
    } catch (e) {
      u.lang = 'ja-JP';
    }
  };

  window.setHeaderProgress = function setHeaderProgress(p) {
    const bar = document.getElementById('headerPlayProgressFill');
    const track = document.getElementById('headerPlayProgress');
    if (!bar || !track) return;
    const safe = Math.max(0, Math.min(1, Number(p) || 0));
    bar.style.width = `${Math.round(safe * 100)}%`;
    track.setAttribute('aria-valuenow', String(Math.round(safe * 100)));
  };

  window.clearProgressTimer = function clearProgressTimer() {
    if (window.progressTimer) {
      try { clearInterval(window.progressTimer); } catch (_) {}
      window.progressTimer = null;
    }
  };

  window.estimateSegmentDuration = function estimateSegmentDuration(text, rateVal) {
    const avgCharsPerSec = 8;
    const len = Math.max(1, (text || '').length);
    const r = Math.max(0.5, Number(rateVal) || window.rate || 1);
    const seconds = len / (avgCharsPerSec * r);
    return Math.max(0.6, Math.min(6, seconds));
  };

  window.safeCancelCurrentUtterance = function safeCancelCurrentUtterance() {
    try {
      if (window.currentUtterance) {
        try { window.currentUtterance.onend = null; } catch (_) {}
        try { window.currentUtterance.onerror = null; } catch (_) {}
        try { window.currentUtterance.onboundary = null; } catch (_) {}
      }
      window.speechSynthesis.cancel();
    } catch (_) {}
  };

  window.restartPlaybackWithNewSettings = function restartPlaybackWithNewSettings() {
    if (!window.isPlaying || !window.currentUtterance || !window.currentSegments) return;
    try {
      window.safeCancelCurrentUtterance();
      window.clearProgressTimer();
      const segmentIndex = window.currentSegmentIndex || 0;
      window.playSegments(window.currentSegments, segmentIndex, undefined);
    } catch (e) {
      console.error('Failed to restart playback with new settings:', e);
    }
  };

  window.restartCurrentSegmentAt = function restartCurrentSegmentAt(charIndex) {
    if (!('speechSynthesis' in window)) return;
    if (!window.currentSegments || !window.currentSegmentText) return;
    const idx = Math.max(0, Math.min(window.currentSegmentText.length, Number(charIndex) || 0));
    const remaining = window.currentSegmentText.slice(idx);
    window.safeCancelCurrentUtterance();
    const utterance = new SpeechSynthesisUtterance(remaining);
    window.currentUtterance = utterance;
    window.applyVoice(utterance);
    utterance.rate = window.rate;
    const vol = getSafeVolume();
    utterance.volume = Number.isFinite(vol) ? vol : 1;
    utterance.pitch = 1.0;
    const len = Math.max(1, window.currentSegmentText.length);
    const baseOffset = Math.max(0, Math.min(1, idx / len));
    utterance.onstart = () => {
      if (utterance !== window.currentUtterance) return;
      window.isPlaying = true;
      window.segmentStartTs = Date.now();
      window.segmentEstimatedDuration = window.estimateSegmentDuration(remaining, utterance.rate);
      window.clearProgressTimer();
      window.progressTimer = setInterval(() => {
        const elapsed = (Date.now() - window.segmentStartTs) / 1000;
        const frac = Math.max(0, Math.min(1, elapsed / window.segmentEstimatedDuration));
        const passedChars = (window.PLAY_STATE.charPrefix[window.currentSegmentIndex] || 0) + idx + Math.round(frac * Math.max(1, remaining.length));
        if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, passedChars / window.PLAY_STATE.totalChars)));
        if (frac >= 1) window.clearProgressTimer();
      }, 80);
      window.updatePlayButtonStates();
    };
    utterance.onboundary = (event) => {
      if (utterance !== window.currentUtterance) return;
      try {
        window.lastBoundaryCharIndex = idx + (typeof event.charIndex === 'number' ? event.charIndex : 0);
        window.clearProgressTimer();
        const segLenRemain = Math.max(1, remaining.length);
        const passedChars = (window.PLAY_STATE.charPrefix[window.currentSegmentIndex] || 0) + idx + Math.max(0, Math.min(segLenRemain, event.charIndex || 0));
        if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, passedChars / window.PLAY_STATE.totalChars)));
      } catch (_) {}
    };
    utterance.onend = () => {
      if (utterance !== window.currentUtterance) return;
      window.clearProgressTimer();
      const next = window.currentSegmentIndex + 1;
      const nextChars = window.PLAY_STATE.charPrefix[next] || window.PLAY_STATE.totalChars;
      if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, nextChars / window.PLAY_STATE.totalChars)));
      setTimeout(() => { window.playSegments(window.currentSegments, next, undefined); }, 0);
    };
    utterance.onerror = (event) => {
      if (utterance !== window.currentUtterance) return;
      window.clearProgressTimer();
      window.isPlaying = false;
      window.currentUtterance = null;
      window.setHeaderProgress(0);
      window.updatePlayButtonStates();
    };
    try { window.speechSynthesis.speak(utterance); } catch (e) { console.error(e); }
  };

  window.speakWithPauses = function speakWithPauses(text, rateOverride) {
    if (!('speechSynthesis' in window)) return;
    if (window.isPlaying) { window.stopSpeaking(); return; }
    const stripped = String(text || '').replace(/（[^）]*）|\([^)]*\)/g, '').replace(/[\s\u00A0]+/g, ' ').trim();
    if (!stripped) return;
    const segments = (window.splitTextByPunctuation ? window.splitTextByPunctuation(stripped) : [{ text: stripped, pause: 0 }]);
    window.currentPlayingText = stripped;
    const charPrefix = [0];
    for (let i = 0; i < segments.length; i++) { charPrefix.push(charPrefix[charPrefix.length - 1] + (segments[i].text || '').length); }
    window.PLAY_STATE = { totalSegments: segments.length, totalChars: charPrefix[charPrefix.length - 1], charPrefix, current: 0 };
    window.setHeaderProgress(0);
    window.playSegments(segments, 0, rateOverride);
  };

  window.playSegments = function playSegments(segments, index, rateOverride) {
    if (index >= segments.length) {
      window.isPlaying = false;
      window.currentUtterance = null;
      window.updatePlayButtonStates();
      if (window.repeatPlayCheckbox && window.repeatPlayCheckbox.checked && window.currentPlayingText) {
        setTimeout(() => {
          if (window.repeatPlayCheckbox && window.repeatPlayCheckbox.checked && window.currentPlayingText && !window.isPlaying && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
            window.speakWithPauses(window.currentPlayingText, rateOverride);
          }
        }, 1000);
      } else {
        window.currentPlayingText = null;
        window.clearTokenHighlight && window.clearTokenHighlight();
      }
      return;
    }
    const segment = segments[index];
    window.currentSegments = segments;
    window.currentSegmentIndex = index;
    window.currentSegmentText = segment.text || '';
    window.lastBoundaryCharIndex = 0;
    window.segmentStartTs = 0;
    const utterance = new SpeechSynthesisUtterance(segment.text);
    window.currentUtterance = utterance;
    window.applyVoice(utterance);
    utterance.rate = typeof rateOverride === 'number' ? rateOverride : (window.rate || 1);
    const vol2 = getSafeVolume();
    utterance.volume = Number.isFinite(vol2) ? vol2 : 1;
    utterance.pitch = 1.0;
    utterance.onboundary = (event) => {
      if (utterance !== window.currentUtterance) return;
      try {
        const segLen = Math.max(1, segment.text.length || 1);
        const charIdx = typeof event.charIndex === 'number' ? event.charIndex : 0;
        window.lastBoundaryCharIndex = charIdx;
        window.usingBoundaryProgress = true;
        window.clearProgressTimer();
        const passedChars = (window.PLAY_STATE.charPrefix[index] || 0) + Math.max(0, Math.min(segLen, charIdx));
        if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, passedChars / window.PLAY_STATE.totalChars)));
      } catch (_) {}
    };
    utterance.onstart = () => {
      if (utterance !== window.currentUtterance) return;
      window.isPlaying = true;
      window.isPaused = false;
      window.PLAY_STATE.current = index;
      if (!window.segmentStartTs) {
        const segLen = Math.max(1, (segment.text || '').length);
        const boundary = Math.max(0, Math.min(segLen, window.lastBoundaryCharIndex || 0));
        const baseChars = (window.PLAY_STATE.charPrefix[index] || 0) + boundary;
        if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, baseChars / window.PLAY_STATE.totalChars)));
      }
      window.updatePlayButtonStates();
      if (!window.segmentStartTs) {
        window.clearProgressTimer();
        const est = window.estimateSegmentDuration(segment.text, utterance.rate);
        const startTs = Date.now();
        window.segmentStartTs = startTs;
        window.progressTimer = setInterval(() => {
          if (window.usingBoundaryProgress) return;
          const elapsed = (Date.now() - startTs) / 1000;
          const frac = Math.max(0, Math.min(1, elapsed / est));
          const segLen = Math.max(1, segment.text.length || 1);
          const passedChars = (window.PLAY_STATE.charPrefix[index] || 0) + Math.round(frac * segLen);
          if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, passedChars / window.PLAY_STATE.totalChars)));
          if (frac >= 1) window.clearProgressTimer();
        }, 80);
      }
    };
    utterance.onend = () => {
      if (utterance !== window.currentUtterance) return;
      const nextIndex = index + 1;
      const nextChars = window.PLAY_STATE.charPrefix[nextIndex] || window.PLAY_STATE.totalChars;
      if (window.PLAY_STATE.totalChars > 0) window.setHeaderProgress(Math.max(0, Math.min(1, nextChars / window.PLAY_STATE.totalChars)));
      window.clearProgressTimer();
      setTimeout(() => { window.playSegments(segments, nextIndex, rateOverride); }, segment.pause);
    };
    utterance.onerror = (event) => {
      if (utterance !== window.currentUtterance) return;
      console.warn('Speech synthesis error:', event);
      window.isPlaying = false;
      window.currentUtterance = null;
      window.currentPlayingText = null;
      window.clearTokenHighlight && window.clearTokenHighlight();
      window.clearProgressTimer();
      window.setHeaderProgress(0);
      window.updatePlayButtonStates();
    };
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(() => { window.speechSynthesis.speak(utterance); }, 50);
      } else {
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error('Speech synthesis failed:', e);
      window.isPlaying = false;
      window.currentUtterance = null;
      window.clearTokenHighlight && window.clearTokenHighlight();
      window.updatePlayButtonStates();
    }
  };

  window.speak = function speak(text, rateOverride) {
    window.speakWithPauses(text, rateOverride);
  };

  window.highlightToken = function highlightToken(text, targetElement) {
    window.clearTokenHighlight && window.clearTokenHighlight();
    if (!text) return;
    if (targetElement) {
      targetElement.classList.add('playing');
      window.currentHighlightedToken = targetElement;
      try { targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (_) {}
      return;
    }
    const tokenPills = document.querySelectorAll('.token-pill');
    for (const pill of tokenPills) {
      const kanjiEl = pill.querySelector('.token-kanji');
      if (kanjiEl && kanjiEl.textContent.trim() === String(text).trim()) {
        pill.classList.add('playing');
        window.currentHighlightedToken = pill;
        try { pill.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); } catch (_) {}
        break;
      }
    }
  };

  window.clearTokenHighlight = function clearTokenHighlight() {
    if (window.currentHighlightedToken) {
      window.currentHighlightedToken.classList.remove('playing');
      window.currentHighlightedToken = null;
    }
    document.querySelectorAll('.token-pill.playing').forEach(pill => { pill.classList.remove('playing'); });
    if (window.highlightTimeout) { try { clearTimeout(window.highlightTimeout); } catch (_) {} window.highlightTimeout = null; }
  };

  window.updateButtonIcon = function updateButtonIcon(button, playing) {
    if (!button) return;
    const svg = button.querySelector('svg');
    if (!svg) return;
    if (playing) {
      svg.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>';
      if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
        button.title = (typeof window.playAllLabel === 'function') ? window.playAllLabel(true) : '停止';
      } else {
        button.title = t('stop') || '停止';
      }
    } else {
      svg.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
      if (button.classList.contains('play-all-btn') || button.id === 'playAllBtn') {
        button.title = (typeof window.playAllLabel === 'function') ? window.playAllLabel(false) : '播放';
      } else {
        button.title = t('play') || '播放';
      }
    }
  };

  window.updatePauseButtonIcon = function updatePauseButtonIcon(button, playing, paused) {
    if (!button) return;
    const svg = button.querySelector('svg');
    if (!svg) return;
    const showPlay = paused && playing;
    const title = showPlay ? (t('resume') || '恢复') : (t('pause') || '暂停');
    button.setAttribute('aria-label', title);
    button.title = title;
    if (showPlay) { svg.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"></path>'; }
    else { svg.innerHTML = '<path d="M6 5h4v14H6z" fill="currentColor"></path><path d="M14 5h4v14h-4z" fill="currentColor"></path>'; }
    button.classList.toggle('disabled', !playing);
  };

  window.updatePlayButtonStates = function updatePlayButtonStates() {
    window.updateButtonIcon(window.playAllBtn, window.isPlaying);
    window.updateButtonIcon(document.getElementById('headerPlayToggle'), window.isPlaying);
    window.updatePauseButtonIcon(document.getElementById('headerPauseToggle'), window.isPlaying, window.isPaused);
    document.querySelectorAll('.play-line-btn').forEach(btn => window.updateButtonIcon(btn, window.isPlaying));
    document.querySelectorAll('.play-token-btn').forEach(btn => window.updateButtonIcon(btn, window.isPlaying));
  };

  window.stopSpeaking = function stopSpeaking() {
    if (window.speechSynthesis) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    }
    window.isPlaying = false;
    window.currentUtterance = null;
    window.currentPlayingText = null;
    window.clearTokenHighlight && window.clearTokenHighlight();
    window.clearProgressTimer && window.clearProgressTimer();
    window.updatePlayButtonStates && window.updatePlayButtonStates();
  };

  window.playLine = window.playLine || function(lineIndex) {
    if (window.isPlaying) { window.stopSpeaking(); return; }
    const lineContainer = document.querySelectorAll('.line-container')[lineIndex];
    if (lineContainer) {
      const tokens = lineContainer.querySelectorAll('.token-pill');
      const lineText = Array.from(tokens).map(token => {
        const tokenDataAttr = token.getAttribute('data-token');
        if (tokenDataAttr) {
          try {
            const tokenData = JSON.parse(tokenDataAttr);
            let textToSpeak = tokenData.reading || tokenData.surface || '';
            if (tokenData.surface === 'は' && tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞' && typeof window.isHaParticleReadingEnabled === 'function' && window.isHaParticleReadingEnabled()) {
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
      window.speak(lineText);
    }
  };

  window.playAllText = window.playAllText || function() {
    if (window.isPlaying) { window.stopSpeaking(); return; }
    const content = document.getElementById('content');
    if (content && content.innerHTML.trim()) {
      const tokens = content.querySelectorAll('.token-pill');
      if (tokens.length > 0) {
        const readingText = Array.from(tokens).map(token => {
          const tokenDataAttr = token.getAttribute('data-token');
          if (tokenDataAttr) {
            try {
              const tokenData = JSON.parse(tokenDataAttr);
              let textToSpeak = tokenData.reading || tokenData.surface || '';
              if (tokenData.surface === 'は' && tokenData.pos && Array.isArray(tokenData.pos) && tokenData.pos[0] === '助詞' && typeof window.isHaParticleReadingEnabled === 'function' && window.isHaParticleReadingEnabled()) {
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
        if (!/[。！？]/.test(readingText)) {
          const textInput = document.getElementById('textInput');
          const text = textInput ? textInput.value.trim() : '';
          if (text) { window.speak(text); return; }
        }
        window.speak(readingText); return;
      }
    }
    const textInput = document.getElementById('textInput');
    const text = textInput ? textInput.value.trim() : '';
    if (text) { window.speak(text); } else if (typeof window.showNotification === 'function') { window.showNotification(t('pleaseInputText') || '请先输入文本', 'warning'); }
  };
})();


