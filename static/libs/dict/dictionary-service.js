/**
 * JMDict Dictionary Service
 * 提供日语词汇查询和翻译功能
 *
 * F-P0-02：加载时构建 headword → 词条下标 内存索引（kanji+kana 双键合并），
 * 查询 O(1)；未命中不再全表线性扫描。
 * PERF-03：查询结果 LRU 缓存（100 条），重复点击零开销。
 * PERF-04：加载/索引进度可通过 onProgress(cb) 订阅，UI 显示真实百分比。
 */
class DictionaryService {
  constructor() {
    this.jmdictData = null;
    this.isLoaded = false;
    this.loadPromise = null;
    // F-P0-02 内存索引：headword（汉字写法或假名读音）→ 词条下标数组（升序）
    this.headwordIndex = new Map();
    // PERF-03 LRU 查询缓存（Map 保持插入序，队首最旧）
    this.lookupCache = new Map();
    this.LOOKUP_CACHE_MAX = 100;
    // F-P1-06 例句分片缓存：桶字符 → Promise<分片对象>（总量 ~5.5MB，全缓存无压力）
    this.exampleShards = new Map();
    // PERF-04 进度状态与订阅
    this.progress = { phase: 'idle', fraction: 0, entries: 0, totalEntries: 0 };
    this._progressListeners = [];
  }

  /**
   * 订阅加载/索引进度。返回取消订阅函数。
   * @param {(progress: {phase: string, fraction: number, entries: number, totalEntries: number}) => void} cb
   */
  onProgress(cb) {
    if (typeof cb !== 'function') return () => {};
    this._progressListeners.push(cb);
    return () => {
      const i = this._progressListeners.indexOf(cb);
      if (i >= 0) this._progressListeners.splice(i, 1);
    };
  }

  _emitProgress() {
    const p = this.getProgress();
    this._progressListeners.forEach((cb) => {
      try { cb(p); } catch (_) { /* 订阅方异常不影响加载 */ }
    });
  }

  /**
   * 获取当前进度（fraction 为 0~1）
   */
  getProgress() {
    return Object.assign({}, this.progress);
  }

  _setProgress(patch) {
    this.progress = Object.assign({}, this.progress, patch);
    this._emitProgress();
  }

  /**
   * 初始化词典服务，加载JMDict数据
   */
  async init() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // 加载失败时清空 loadPromise，允许下次查询重试
    this.loadPromise = this.loadJMDict().catch((err) => {
      this.loadPromise = null;
      this._setProgress({ phase: 'error', fraction: 0 });
      throw err;
    });
    return this.loadPromise;
  }

  /**
   * 加载JMDict JSON数据（支持分片文件）
   */
  async loadJMDict() {
    try {
      console.log('开始加载JMDict词典数据...');

      if (this.isLoaded && this.jmdictData) {
        return this.jmdictData;
      }

      // 首先尝试加载元数据文件
      let metadata;
      try {
        const metadataResponse = await fetch('/static/libs/dict/chunks/jmdict_metadata.json');
        if (metadataResponse.ok) {
          metadata = await metadataResponse.json();
          console.log(`发现分片文件，共 ${metadata.total_chunks} 个分片`);
        }
      } catch (error) {
        console.log('未找到分片元数据，尝试加载原始文件...');
      }

      if (metadata) {
        // 加载分片文件
        return await this.loadChunkedJMDict(metadata);
      } else {
        // 未找到分片元数据时直接报错，不再回退到原始文件
        throw new Error('JMDict metadata not found');
      }
    } catch (error) {
      console.error('加载JMDict词典失败:', error);
      throw error;
    }
  }

  /**
   * 流式 fetch 单个分片，边下载边回报字节进度（无 body/长度时回退普通 fetch）
   */
  async _fetchChunkJSON(url, onBytes) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    const total = Number(response.headers.get('Content-Length')) || 0;
    if (!response.body || !total || typeof onBytes !== 'function') {
      return response.json();
    }
    const reader = response.body.getReader();
    const parts = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      received += value.length;
      onBytes(received, total);
    }
    return new Response(new Blob(parts)).json();
  }

  /**
   * 将词条下标写入内存索引（汉字写法与假名读音都可作为查询键）
   */
  _indexEntry(entry, index) {
    const put = (text) => {
      if (!text) return;
      let list = this.headwordIndex.get(text);
      if (!list) {
        list = [];
        this.headwordIndex.set(text, list);
      }
      // 同一词条可能同时以汉字与假名命中同一键，去重
      if (list[list.length - 1] !== index) list.push(index);
    };
    if (entry.kanji) {
      for (const k of entry.kanji) put(k.text);
    }
    if (entry.kana) {
      for (const k of entry.kana) put(k.text);
    }
  }

  /**
   * 加载分片的JMDict数据（F-P0-02：边加载边建索引，全程回报进度）
   */
  async loadChunkedJMDict(metadata) {
    const allWords = [];
    this.headwordIndex = new Map();
    const totalEntries = Number(metadata.total_words) || 0;
    this._setProgress({ phase: 'loading', fraction: 0, entries: 0, totalEntries });

    // 总进度 = 字节下载 70% + 解析建索引 30%（按词条数折算）
    const chunkWeights = [];
    for (let i = 0; i < metadata.total_chunks; i++) {
      chunkWeights.push(1 / metadata.total_chunks);
    }

    for (let i = 0; i < metadata.total_chunks; i++) {
      console.log(`加载分片 ${i + 1}/${metadata.total_chunks}...`);
      const chunkBase = i / metadata.total_chunks;
      const chunkSpan = chunkWeights[i];

      const chunkData = await this._fetchChunkJSON(
        `/static/libs/dict/chunks/jmdict_chunk_${i.toString().padStart(3, '0')}.json`,
        (received, total) => {
          const fraction = chunkBase + chunkSpan * 0.7 * (received / total);
          this._setProgress({ phase: 'loading', fraction });
        }
      );

      if (!Array.isArray(chunkData.words)) continue;

      // 分批追加并建索引，避免一次性传入过多参数导致栈溢出
      const batchSize = 10000;
      for (let j = 0; j < chunkData.words.length; j += batchSize) {
        const batch = chunkData.words.slice(j, j + batchSize);
        Array.prototype.push.apply(allWords, batch);
        // 为本批词条建立索引（下标 = allWords 追加前的长度起）
        const baseIndex = allWords.length - batch.length;
        for (let k = 0; k < batch.length; k++) {
          this._indexEntry(batch[k], baseIndex + k);
        }
        // 让事件循环有机会处理其他任务
        await new Promise(r => setTimeout(r));
        const indexedEntries = allWords.length;
        const parseFraction = totalEntries ? indexedEntries / totalEntries : 1;
        this._setProgress({
          phase: 'loading',
          entries: indexedEntries,
          fraction: chunkBase + chunkSpan * (0.7 + 0.3 * parseFraction)
        });
      }
    }

    this.jmdictData = {
      words: allWords,
      version: metadata.version || 'unknown',
      date: metadata.date || 'unknown'
    };

    this.isLoaded = true;
    this._setProgress({ phase: 'ready', fraction: 1, entries: allWords.length, totalEntries });
    console.log(`JMDict词典加载完成，共 ${allWords.length} 个词条，索引 ${this.headwordIndex.size} 个词头`);

    return this.jmdictData;
  }

  // 原始 JMDict 回退已移除：请确保使用分片文件 jmdict_metadata.json 与对应 chunks

  /**
   * 查询词汇翻译（F-P0-02：内存索引 O(1)；PERF-03：LRU 缓存）
   * @param {string} word - 要查询的词汇
   * @returns {Array} 匹配的词典条目
   */
  async lookup(word) {
    if (!this.isLoaded) {
      await this.init();
    }

    if (!word || !this.jmdictData) {
      return [];
    }

    const searchTerm = word.trim();
    if (!searchTerm) {
      return [];
    }

    // PERF-03 LRU 命中：刷新新鲜度后直接返回
    if (this.lookupCache.has(searchTerm)) {
      const cached = this.lookupCache.get(searchTerm);
      this.lookupCache.delete(searchTerm);
      this.lookupCache.set(searchTerm, cached);
      return cached;
    }

    // F-P0-02 索引查询：汉字写法与假名读音统一索引，下标升序 = 原线性扫描顺序
    const indices = this.headwordIndex.get(searchTerm);
    const results = [];
    if (indices) {
      for (const idx of indices) {
        results.push(this.formatEntry(this.jmdictData.words[idx]));
        if (results.length >= 10) {
          break;
        }
      }
    }

    // PERF-03 写入缓存并淘汰最旧项
    this.lookupCache.set(searchTerm, results);
    if (this.lookupCache.size > this.LOOKUP_CACHE_MAX) {
      const oldest = this.lookupCache.keys().next().value;
      this.lookupCache.delete(oldest);
    }

    return results;
  }

  /**
   * 格式化词典条目
   * @param {Object} entry - 原始词典条目
   * @returns {Object} 格式化后的条目
   */
  formatEntry(entry) {
    const formatted = {
      id: entry.id,
      kanji: entry.kanji ? entry.kanji.map(k => ({
        text: k.text,
        common: k.common || false
      })) : [],
      kana: entry.kana ? entry.kana.map(k => ({
        text: k.text,
        common: k.common || false
      })) : [],
      senses: []
    };

    // 处理词义
    if (entry.sense) {
      formatted.senses = entry.sense.map(sense => {
        // 提取中文词源信息
        const chineseSource = sense.languageSource ? 
          sense.languageSource.find(ls => ls.lang === 'chi') : null;
        
        return {
          partOfSpeech: sense.partOfSpeech || [],
          gloss: sense.gloss ? sense.gloss.map(g => g.text).join('; ') : '',
          field: sense.field || [],
          misc: sense.misc || [],
          info: sense.info || [],
          chineseSource: chineseSource ? chineseSource.text : null
        };
      });
    }

    return formatted;
  }

  /**
   * 获取词汇的主要翻译
   * @param {string} word - 要查询的词汇
   * @returns {string} 主要翻译文本
   */
  async getMainTranslation(word) {
    const results = await this.lookup(word);
    
    if (results.length === 0) {
      return null;
    }

    const firstResult = results[0];
    if (firstResult.senses && firstResult.senses.length > 0) {
      return firstResult.senses[0].gloss;
    }

    return null;
  }

  /**
   * 获取词汇的详细信息
   * @param {string} word - 要查询的词汇
   * @returns {Object} 详细信息对象
   */
  async getDetailedInfo(word) {
    const results = await this.lookup(word);
    
    if (results.length === 0) {
      return null;
    }

    const entry = results[0];
    
    return {
      word: word,
      kanji: entry.kanji,
      kana: entry.kana,
      senses: entry.senses,
      hasMultipleMeanings: entry.senses.length > 1,
      totalResults: results.length
    };
  }

  /**
   * 检查词典是否已加载
   * @returns {boolean} 是否已加载
   */
  isReady() {
    return this.isLoaded;
  }

  /**
   * F-P1-06 查询例句（Tanaka Corpus 离线分片，按需加载，不阻塞词典首查）
   * 分片规则与 tools/build-examples.js 一致：词条主读音首字（片假名归一平假名）。
   * @param {string} word 查询词
   * @param {Object|null} detailedInfo 词典查询结果（提供读音分桶与词形候选）
   * @returns {Array<[string, string]>} 例句 [日文, 英文] 数组（可为空）
   */
  async getExamples(word, detailedInfo) {
    const primaryReading = (detailedInfo && detailedInfo.kana && detailedInfo.kana[0] && detailedInfo.kana[0].text) || word;
    const first = [...String(primaryReading || '').trim()][0];
    if (!first) return [];
    // 片假名 → 平假名（-0x60），与构建脚本同规则；非假名归 other 桶
    const c = first.codePointAt(0);
    const bucket = (c >= 0x30a1 && c <= 0x30f6) ? String.fromCharCode(c - 0x60)
      : (c >= 0x3041 && c <= 0x3096) ? first : 'other';

    let shardPromise = this.exampleShards.get(bucket);
    if (!shardPromise) {
      shardPromise = fetch(`/static/libs/dict/examples/ex_${encodeURIComponent(bucket)}.json`)
        .then(r => (r.ok ? r.json() : {}))
        .catch(() => ({}));
      this.exampleShards.set(bucket, shardPromise);
    }
    const shard = await shardPromise;
    const candidates = [
      word,
      detailedInfo && detailedInfo.kanji && detailedInfo.kanji[0] && detailedInfo.kanji[0].text,
      detailedInfo && detailedInfo.kana && detailedInfo.kana[0] && detailedInfo.kana[0].text
    ].filter(Boolean);
    for (const key of candidates) {
      if (Array.isArray(shard[key]) && shard[key].length) return shard[key];
    }
    return [];
  }

  /**
   * 获取词典统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    if (!this.isLoaded || !this.jmdictData) {
      return null;
    }

    return {
      totalEntries: this.jmdictData.words ? this.jmdictData.words.length : 0,
      headwords: this.headwordIndex.size,
      version: this.jmdictData.version || 'unknown',
      dictDate: this.jmdictData.dictDate || 'unknown'
    };
  }
}

// 创建全局词典服务实例
window.dictionaryService = new DictionaryService();

// 导出服务（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DictionaryService;
}
