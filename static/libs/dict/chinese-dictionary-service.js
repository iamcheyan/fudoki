/**
 * Chinese Dictionary Service
 * 中文字典服务，基于CC-CEDICT数据
 */

class ChineseDictionaryService {
  constructor() {
    this.dictionary = {};
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * 初始化字典服务
   */
  async init() {
    if (this.isLoaded) {
      return this.dictionary;
    }
    
    return await this.loadDictionary();
  }

  /**
   * 加载字典数据
   */
  async loadDictionary() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadDictionaryData();
    return this.loadPromise;
  }

  async _loadDictionaryData() {
    try {
      console.log('Loading CC-CEDICT dictionary...');
      
      // 加载CC-CEDICT文件
      const response = await fetch('/static/libs/dict/cedict_1_0_ts_utf-8_mdbg.txt');
      if (!response.ok) {
        throw new Error(`Failed to load CC-CEDICT: ${response.status}`);
      }
      
      const content = await response.text();
      
      // 解析字典数据
      const entries = cedictParser.parseFile(content);
      this.dictionary = cedictParser.convertToProjectFormat();
      
      this.isLoaded = true;
      console.log(`CC-CEDICT loaded: ${entries.length} entries`);
      
      return this.dictionary;
    } catch (error) {
      console.error('Failed to load CC-CEDICT dictionary:', error);
      throw error;
    }
  }

  /**
   * 查找中文词条
   */
  lookup(word) {
    if (!this.isLoaded) {
      console.warn('Chinese dictionary not loaded yet');
      return null;
    }

    // 直接查找
    if (this.dictionary[word]) {
      return this.dictionary[word];
    }

    // 查找繁体字对应的简体字
    for (const [key, entry] of Object.entries(this.dictionary)) {
      if (entry.senses && entry.senses.length > 0) {
        const chineseInfo = entry.senses[0].chineseInfo;
        if (chineseInfo && chineseInfo.traditional === word) {
          return entry;
        }
      }
    }

    return null;
  }

  /**
   * 获取主要翻译
   */
  getMainTranslation(word) {
    const entry = this.lookup(word);
    if (!entry || !entry.senses || entry.senses.length === 0) {
      return null;
    }

    return entry.senses[0].gloss;
  }

  /**
   * 获取详细信息
   */
  getDetailedInfo(word) {
    const entry = this.lookup(word);
    if (!entry) {
      return null;
    }

    return {
      word: entry.word,
      reading: entry.reading,
      senses: entry.senses.map(sense => ({
        gloss: sense.gloss,
        partOfSpeech: sense.partOfSpeech || [],
        field: sense.field || [],
        misc: sense.misc || [],
        chineseInfo: sense.chineseInfo
      }))
    };
  }

  /**
   * 检查字典是否已加载
   */
  isReady() {
    return this.isLoaded;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    if (!this.isLoaded) {
      return { loaded: false };
    }

    const totalEntries = Object.keys(this.dictionary).length;
    return {
      loaded: true,
      totalEntries,
      source: 'CC-CEDICT'
    };
  }

  /**
   * 格式化词条用于显示
   */
  formatEntry(word) {
    const entry = this.lookup(word);
    if (!entry) {
      return null;
    }

    return {
      word: entry.word,
      reading: entry.reading,
      mainTranslation: entry.senses[0]?.gloss || '',
      senses: entry.senses.map(sense => ({
        gloss: sense.gloss,
        partOfSpeech: sense.partOfSpeech || [],
        field: sense.field || [],
        misc: sense.misc || [],
        chineseInfo: sense.chineseInfo
      }))
    };
  }
}

// 全局实例
const chineseDictionaryService = new ChineseDictionaryService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChineseDictionaryService, chineseDictionaryService };
} else {
  window.ChineseDictionaryService = ChineseDictionaryService;
  window.chineseDictionaryService = chineseDictionaryService;
}