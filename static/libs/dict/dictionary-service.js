/**
 * JMDict Dictionary Service — PERF-02 按需分片版
 *
 * 构建期（tools/build-dict-slices.js）按词条主读音首字把 JMdict 切成 ~75 个
 * 分片（共 ~27MB，最大 1.77MB）+ 全局索引 dict_index.json（headword → 桶字符，
 * '*'=other 桶，多桶词如 する→"すそ"）。
 *
 * 运行时查询链路：索引 O(1)（hasOwnProperty 守卫防原型键）→ 单分片按需 fetch
 * → 分片内 headword→下标 Map O(1)。首查网络量从 109MB 降至 索引(~1.5MB gzip)
 * + 单分片。isReady = 索引就绪（秒级），词条分片懒加载。
 *
 * 分片缓存三层：
 *   1. 内存 LRU（SLICE_CACHE_MAX 片，防 75 片全驻留导致堆膨胀）
 *   2. IndexedDB（fudoki-dict/slices，body+ETag 持久化，跨会话零下载）
 *   3. Service Worker Cache（cacheFirst，同源静态资源天然覆盖）
 * 带 ETag 条件请求：304 用本地副本；网络失败时回落 IDB（离线可用）。
 *
 * 兼容：lookup/getMainTranslation/getDetailedInfo/formatEntry/getStats/isReady/
 * onProgress/getProgress/getExamples 签名与语义不变（formatEntry 改读投影字段）。
 */
class DictionaryService {
  constructor() {
    this.isLoaded = false;       // = 全局索引就绪
    this.loadPromise = null;
    // 全局索引：普通对象（JSON.parse 产物），查询用 hasOwnProperty 守卫
    this.indexMap = null;
    this.meta = null;            // dict_meta.json（统计/版本）
    // 分片内存 LRU：桶 → {words, hwIndex}
    this.sliceCache = new Map();
    this.slicePromises = new Map();
    this.SLICE_CACHE_MAX = 14;   // ≈ 峰值 30-50MB 解析对象，堆保护上限
    // PERF-03 LRU 查询缓存（Map 保持插入序，队首最旧）
    this.lookupCache = new Map();
    this.LOOKUP_CACHE_MAX = 100;
    // F-P1-06 例句分片缓存：桶字符 → Promise<分片对象>（总量 ~5.5MB，全缓存无压力）
    this.exampleShards = new Map();
    // PERF-04 进度状态与订阅
    this.progress = { phase: 'idle', fraction: 0, entries: 0, totalEntries: 0 };
    this._progressListeners = [];
    this._idbPromise = null;
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
   * 初始化：加载全局索引（~5.5MB 原文 / ~1.5MB gzip），不加载词条分片
   */
  async init() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // 加载失败时清空 loadPromise，允许下次查询重试
    this.loadPromise = this._loadIndex().catch((err) => {
      this.loadPromise = null;
      this._setProgress({ phase: 'error', fraction: 0 });
      throw err;
    });
    return this.loadPromise;
  }

  async _loadIndex() {
    console.log('加载词典全局索引（按需分片模式）...');
    this._setProgress({ phase: 'loading', fraction: 0, entries: 0, totalEntries: 0 });

    // 索引下载 85% + 解析 15%
    const text = await this._fetchText(
      '/static/libs/dict/slices/dict_index.json',
      (received, total) => {
        this._setProgress({ phase: 'loading', fraction: 0.85 * (received / total) });
      }
    );
    const index = JSON.parse(text);
    this.indexMap = index;
    this._setProgress({ phase: 'loading', fraction: 0.99, entries: 0 });

    try {
      const metaRes = await fetch('/static/libs/dict/slices/dict_meta.json');
      if (metaRes.ok) this.meta = await metaRes.json();
    } catch (_) { /* 元数据缺失不影响查询，仅统计退化 */ }

    const totalEntries = this.meta ? Number(this.meta.total_entries) || 0 : 0;
    this.isLoaded = true;
    this._setProgress({ phase: 'ready', fraction: 1, entries: totalEntries, totalEntries });
    const headwords = Object.keys(index).length;
    console.log(`词典索引就绪：${headwords} 词头，词条分片按需加载`);
    return index;
  }

  /**
   * 流式 fetch 文本，边下载边回报字节进度（无 body/长度时回退普通 fetch）
   */
  async _fetchText(url, onBytes) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    const total = Number(response.headers.get('Content-Length')) || 0;
    if (!response.body || !total || typeof onBytes !== 'function') {
      return response.text();
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
    return new Response(new Blob(parts)).text();
  }

  // ---- IndexedDB（fudoki-dict/slices）：分片持久缓存，不可用时静默降级 ----

  _idb() {
    if (!this._idbPromise) {
      this._idbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error('IndexedDB unavailable'));
        const req = window.indexedDB.open('fudoki-dict', 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains('slices')) {
            req.result.createObjectStore('slices', { keyPath: 'bucket' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
      }).catch(() => null);
    }
    return this._idbPromise;
  }

  async _idbGet(bucket) {
    const db = await this._idb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const req = db.transaction('slices', 'readonly').objectStore('slices').get(bucket);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    });
  }

  async _idbPut(record) {
    const db = await this._idb();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('slices', 'readwrite');
        tx.objectStore('slices').put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (_) { resolve(); }
    });
  }

  /**
   * 拉取单个词条分片文本：ETag 条件请求，304/网络失败回落 IndexedDB 副本
   */
  async _fetchSliceBody(bucket) {
    const url = `/static/libs/dict/slices/dict_${encodeURIComponent(bucket)}.json`;
    const cached = await this._idbGet(bucket);
    try {
      const res = await fetch(url, cached && cached.etag
        ? { headers: { 'If-None-Match': cached.etag } }
        : undefined);
      if (res.status === 304 && cached) return cached.body;
      if (res.ok) {
        const body = await res.text();
        this._idbPut({ bucket, etag: res.headers.get('ETag') || '', body });
        return body;
      }
      throw new Error(`Failed to load slice ${bucket}: ${res.status}`);
    } catch (err) {
      if (cached) return cached.body; // 离线/网络失败 → 本地副本兜底
      throw err;
    }
  }

  /**
   * 加载并解析分片，构建分片内 headword → 词条下标 索引；内存 LRU 淘汰
   */
  _loadSlice(bucket) {
    const hit = this.sliceCache.get(bucket);
    if (hit) {
      this.sliceCache.delete(bucket);
      this.sliceCache.set(bucket, hit);
      return Promise.resolve(hit);
    }
    const existing = this.slicePromises.get(bucket);
    if (existing) return existing;

    const p = this._fetchSliceBody(bucket).then((text) => {
      const words = (JSON.parse(text).w) || [];
      const hwIndex = new Map();
      const put = (key, idx) => {
        if (!key) return;
        let list = hwIndex.get(key);
        if (!list) { list = []; hwIndex.set(key, list); }
        // 同一词条可能以汉字与假名命中同一键，去重
        if (list[list.length - 1] !== idx) list.push(idx);
      };
      for (let i = 0; i < words.length; i++) {
        const e = words[i];
        if (e.k) for (const k of e.k) put(k[0], i);
        if (e.r) for (const r of e.r) put(r[0], i);
      }
      const slice = { words, hwIndex };
      this.slicePromises.delete(bucket);
      this.sliceCache.set(bucket, slice);
      while (this.sliceCache.size > this.SLICE_CACHE_MAX) {
        const oldest = this.sliceCache.keys().next().value;
        this.sliceCache.delete(oldest);
      }
      return slice;
    }).catch((err) => {
      this.slicePromises.delete(bucket);
      throw err;
    });
    this.slicePromises.set(bucket, p);
    return p;
  }

  /**
   * 查询词汇翻译（索引 O(1) → 分片 O(1)；PERF-03：LRU 缓存）
   * @param {string} word - 要查询的词汇
   * @returns {Array} 匹配的词典条目
   */
  async lookup(word) {
    if (!this.isLoaded) {
      await this.init();
    }

    if (!word || !this.indexMap) {
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

    const has = Object.prototype.hasOwnProperty;
    const bucketsStr = has.call(this.indexMap, searchTerm) ? this.indexMap[searchTerm] : null;
    const results = [];
    if (bucketsStr) {
      const seen = new Set();
      // 索引值为桶字符连串（'*'=other），按码点迭代
      for (const ch of bucketsStr) {
        const bucket = ch === '*' ? 'other' : ch;
        if (seen.has(bucket)) continue;
        seen.add(bucket);
        const slice = await this._loadSlice(bucket);
        const indices = slice.hwIndex.get(searchTerm);
        if (!indices) continue;
        for (const idx of indices) {
          results.push(this.formatEntry(slice.words[idx]));
          if (results.length >= 10) break;
        }
        if (results.length >= 10) break;
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
   * 格式化词典条目（输入为构建期投影的紧凑分片条目：
   * k=[[汉字写法,常用?1:0]], r=[[假名读音,…]], s=[{p,g,f,m,i,c}]）
   * @param {Object} entry - 分片内词条
   * @returns {Object} 格式化后的条目
   */
  formatEntry(entry) {
    const forms = (arr) => (arr || []).map((f) => ({ text: f[0], common: !!f[1] }));
    const formatted = {
      id: entry.id,
      kanji: forms(entry.k),
      kana: forms(entry.r),
      senses: []
    };

    if (entry.s) {
      formatted.senses = entry.s.map((s) => ({
        partOfSpeech: s.p || [],
        gloss: s.g || '',
        field: s.f || [],
        misc: s.m || [],
        info: s.i || [],
        chineseSource: s.c || null
      }));
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
   * 检查词典是否已加载（= 全局索引就绪；词条分片按需加载）
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
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .catch(() => {
          // 失败不缓存：本会话下次点击重试，避免离线一次后例句永久失效
          this.exampleShards.delete(bucket);
          return {};
        });
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
    if (!this.isLoaded || !this.meta) {
      return null;
    }

    return {
      totalEntries: this.meta.total_entries || 0,
      headwords: this.meta.headwords || 0,
      version: this.meta.version || 'unknown',
      dictDate: this.meta.generated || 'unknown'
    };
  }
}

// 创建全局词典服务实例
window.dictionaryService = new DictionaryService();

// 导出服务（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DictionaryService;
}
