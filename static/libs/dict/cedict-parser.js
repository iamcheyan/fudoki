/**
 * CC-CEDICT Parser
 * 解析CC-CEDICT格式的中文-英文字典文件
 */

class CEDICTParser {
  constructor() {
    this.entries = [];
  }

  /**
   * 解析CC-CEDICT格式的行
   * 格式: 繁体 简体 [pinyin] /definition1/definition2/.../ 
   */
  parseLine(line) {
    // 跳过注释行和空行
    if (line.startsWith('#') || line.trim() === '') {
      return null;
    }

    // 使用正则表达式解析格式
    const match = line.match(/^(.+?)\s+(.+?)\s+\[(.+?)\]\s+\/(.+)\/$/);
    if (!match) {
      return null;
    }

    const [, traditional, simplified, pinyin, definitionsStr] = match;
    const definitions = definitionsStr.split('/').filter(def => def.trim() !== '');

    return {
      traditional: traditional.trim(),
      simplified: simplified.trim(),
      pinyin: pinyin.trim(),
      definitions: definitions.map(def => def.trim())
    };
  }

  /**
   * 解析整个CC-CEDICT文件
   */
  parseFile(content) {
    const lines = content.split('\n');
    this.entries = [];

    for (const line of lines) {
      const entry = this.parseLine(line);
      if (entry) {
        this.entries.push(entry);
      }
    }

    return this.entries;
  }

  /**
   * 转换为我们项目使用的格式
   */
  convertToProjectFormat() {
    const result = {};

    for (const entry of this.entries) {
      // 使用简体中文作为主键
      const key = entry.simplified;
      
      if (!result[key]) {
        result[key] = {
          word: key,
          reading: entry.pinyin,
          senses: []
        };
      }

      // 添加词义
      for (const definition of entry.definitions) {
        result[key].senses.push({
          gloss: definition,
          partOfSpeech: [],
          field: [],
          misc: [],
          chineseInfo: {
            traditional: entry.traditional,
            simplified: entry.simplified,
            pinyin: entry.pinyin
          }
        });
      }
    }

    return result;
  }

  /**
   * 查找词条
   */
  lookup(word) {
    return this.entries.filter(entry => 
      entry.simplified === word || entry.traditional === word
    );
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalEntries: this.entries.length,
      uniqueSimplified: new Set(this.entries.map(e => e.simplified)).size,
      uniqueTraditional: new Set(this.entries.map(e => e.traditional)).size
    };
  }
}

// 全局实例
const cedictParser = new CEDICTParser();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CEDICTParser, cedictParser };
} else {
  window.CEDICTParser = CEDICTParser;
  window.cedictParser = cedictParser;
}