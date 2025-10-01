/**
 * JMDict Dictionary Service
 * 提供日语词汇查询和翻译功能
 */
class DictionaryService {
  constructor() {
    this.jmdictData = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * 初始化词典服务，加载JMDict数据
   */
  async init() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadJMDict();
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
        // 回退到加载原始文件
        return await this.loadOriginalJMDict();
      }
    } catch (error) {
      console.error('加载JMDict词典失败:', error);
      throw error;
    }
  }

  /**
   * 加载分片的JMDict数据
   */
  async loadChunkedJMDict(metadata) {
    const allWords = [];
    
    for (let i = 0; i < metadata.total_chunks; i++) {
      console.log(`加载分片 ${i + 1}/${metadata.total_chunks}...`);
      
      const chunkResponse = await fetch(`/static/libs/dict/chunks/jmdict_chunk_${i.toString().padStart(3, '0')}.json`);
      if (!chunkResponse.ok) {
        throw new Error(`Failed to load chunk ${i}: ${chunkResponse.status}`);
      }
      
      const chunkData = await chunkResponse.json();
      // 分批追加，避免一次性传入过多参数导致栈溢出
      if (Array.isArray(chunkData.words)) {
        const batchSize = 10000;
        for (let j = 0; j < chunkData.words.length; j += batchSize) {
          const batch = chunkData.words.slice(j, j + batchSize);
          Array.prototype.push.apply(allWords, batch);
          // 让事件循环有机会处理其他任务
          await new Promise(r => setTimeout(r));
        }
      }
      
    }

    this.jmdictData = {
      words: allWords,
      version: metadata.version || 'unknown',
      date: metadata.date || 'unknown'
    };
    
    this.isLoaded = true;
    console.log(`JMDict词典加载完成，共 ${allWords.length} 个词条`);
    
    return this.jmdictData;
  }

  /**
   * 加载原始的JMDict文件（回退方案）
   */
  async loadOriginalJMDict() {
    console.log('加载原始JMDict文件...');
    const response = await fetch('/static/libs/dict/jmdict-eng-3.6.1.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    this.jmdictData = await response.json();
    this.isLoaded = true;
    console.log(`JMDict词典加载完成，共 ${this.jmdictData.words.length} 个词条`);
    
    return this.jmdictData;
  }

  /**
   * 查询词汇翻译
   * @param {string} word - 要查询的词汇
   * @returns {Array} 匹配的词典条目
   */
  async lookup(word) {
    if (!this.isLoaded) {
      // 防止并发重复加载
      if (!this.loadPromise) {
        this.loadPromise = this.loadJMDict();
      }
      await this.loadPromise;
    }

    if (!word || !this.jmdictData) {
      return [];
    }

    const results = [];
    const searchTerm = word.trim();

    // 在JMDict数据中搜索匹配项
    for (const entry of this.jmdictData.words) {
      let isMatch = false;

      // 检查汉字写法
      if (entry.kanji) {
        for (const kanjiEntry of entry.kanji) {
          if (kanjiEntry.text === searchTerm) {
            isMatch = true;
            break;
          }
        }
      }

      // 检查假名读音
      if (!isMatch && entry.kana) {
        for (const kanaEntry of entry.kana) {
          if (kanaEntry.text === searchTerm) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        results.push(this.formatEntry(entry));
      }

      // 限制结果数量以提高性能
      if (results.length >= 10) {
        break;
      }
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
   * 获取词典统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    if (!this.isLoaded || !this.jmdictData) {
      return null;
    }

    return {
      totalEntries: this.jmdictData.words ? this.jmdictData.words.length : 0,
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