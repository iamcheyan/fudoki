(() => {
  // 语音工具模块：挂载到 window.TTS
  // 播放引擎（状态机、分段播放、进度、暂停/继续）的唯一实现在 static/main-js.js 的
  // TTS 引擎区（单一 isPlaying / isPaused / PLAY_STATE）。本文件只提供无状态的
  // 语音列表与音色绑定工具，避免出现第二份播放状态（原 B-P0-06 状态分裂缺陷）。

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
