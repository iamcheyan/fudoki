/**
 * 纯前端日语分词和读音处理模块
 * 替换原Python后端的SudachiPy功能
 */

class JapaneseSegmenter {
  constructor() {
    this.kuromoji = null;
    this.kuroshiro = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // 等待一小段时间确保脚本加载完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 检查是否已经加载了全局变量
      if (typeof window.kuromoji !== 'undefined' && typeof window.Kuroshiro !== 'undefined' && typeof window.KuromojiAnalyzer !== 'undefined') {
        console.log('使用全局变量初始化分词器...');
        console.log('Kuroshiro type:', typeof window.Kuroshiro);
        console.log('Kuroshiro:', window.Kuroshiro);
        
        // 初始化kuromoji tokenizer
        this.kuromoji = await new Promise((resolve, reject) => {
          window.kuromoji.builder({ dicPath: '/static/libs/dict/' }).build((err, tokenizer) => {
            if (err) {
              reject(err);
            } else {
              resolve(tokenizer);
            }
          });
        });
        
        // 检查Kuroshiro是否是构造函数还是已经实例化的对象
        if (typeof window.Kuroshiro === 'function') {
          this.kuroshiro = new window.Kuroshiro();
        } else if (window.Kuroshiro && typeof window.Kuroshiro.init === 'function') {
          // 如果Kuroshiro已经是实例，直接使用
          this.kuroshiro = window.Kuroshiro;
        } else if (window.Kuroshiro && window.Kuroshiro.default) {
          // 尝试作为默认导出使用
          this.kuroshiro = new window.Kuroshiro.default();
        } else {
          throw new Error('无法识别Kuroshiro类型');
        }
        
        // 创建KuromojiAnalyzer实例，并配置字典路径
        const analyzer = new window.KuromojiAnalyzer({
          dictPath: '/static/libs/dict/'
        });
        
        await this.kuroshiro.init(analyzer);
        this.initialized = true;
        console.log('日语分词库加载完成');
        return;
      }

      // 如果全局变量不存在，尝试动态导入本地资源
      console.log('正在加载日语分词库...');
      const kuromoji = await import('/static/libs/kuromoji.js');
      const Kuroshiro = (await import('/static/libs/kuroshiro.min.js')).default;
      const KuromojiAnalyzer = (await import('/static/libs/kuroshiro-analyzer-kuromoji.min.js')).default;

      this.kuromoji = kuromoji;
      this.kuroshiro = new Kuroshiro();
      
      // 初始化kuroshiro
      await this.kuroshiro.init(new KuromojiAnalyzer());
      this.initialized = true;
      console.log('日语分词库加载完成');
    } catch (error) {
      console.error('Failed to initialize Japanese segmenter:', error);
      // 提供简化的分词作为备用方案
      this.initialized = true;
      this.fallbackMode = true;
      console.log('使用简化分词模式');
    }
  }

  /**
   * 年份读法处理 - 对应原Python的year_reading函数
   */
  yearReading(num) {
    if (num < 1000 || num > 9999) {
      return String(num);
    }

    const d_th = Math.floor(num / 1000);
    const d_h = Math.floor((num / 100) % 10);
    const d_t = Math.floor((num / 10) % 10);
    const d_o = num % 10;

    const one = {
      0: "", 1: "いち", 2: "に", 3: "さん", 4: "よん", 5: "ご", 
      6: "ろく", 7: "なな", 8: "はち", 9: "きゅう"
    };

    const th_map = {
      1: "せん", 2: "にせん", 3: "さんぜん", 4: "よんせん", 5: "ごせん",
      6: "ろくせん", 7: "ななせん", 8: "はっせん", 9: "きゅうせん"
    };

    const h_map = {
      0: "", 1: "ひゃく", 2: "にひゃく", 3: "さんびゃく", 4: "よんひゃく",
      5: "ごひゃく", 6: "ろっぴゃく", 7: "ななひゃく", 8: "はっぴゃく", 9: "きゅうひゃく"
    };

    const t_map = {
      0: "", 1: "じゅう", 2: "にじゅう", 3: "さんじゅう", 4: "よんじゅう",
      5: "ごじゅう", 6: "ろくじゅう", 7: "ななじゅう", 8: "はちじゅう", 9: "きゅうじゅう"
    };

    const parts = [
      th_map[d_th] || "",
      h_map[d_h] || "",
      t_map[d_t] || "",
      one[d_o] || ""
    ];
    
    return parts.filter(p => p).join('');
  }

  /**
   * 一般数字读法（0 以上，支持到万位）
   */
  numberReading(num) {
    if (typeof num !== 'number' || !isFinite(num)) return String(num);
    num = Math.floor(Math.abs(num));
    if (num === 0) return 'ゼロ';

    const one = {
      0: '', 1: 'いち', 2: 'に', 3: 'さん', 4: 'よん', 5: 'ご',
      6: 'ろく', 7: 'なな', 8: 'はち', 9: 'きゅう'
    };

    const th_map = {
      0: '', 1: 'せん', 2: 'にせん', 3: 'さんぜん', 4: 'よんせん', 5: 'ごせん',
      6: 'ろくせん', 7: 'ななせん', 8: 'はっせん', 9: 'きゅうせん'
    };

    const h_map = {
      0: '', 1: 'ひゃく', 2: 'にひゃく', 3: 'さんびゃく', 4: 'よんひゃく',
      5: 'ごひゃく', 6: 'ろっぴゃく', 7: 'ななひゃく', 8: 'はっぴゃく', 9: 'きゅうひゃく'
    };

    const t_map = {
      0: '', 1: 'じゅう', 2: 'にじゅう', 3: 'さんじゅう', 4: 'よんじゅう',
      5: 'ごじゅう', 6: 'ろくじゅう', 7: 'ななじゅう', 8: 'はちじゅう', 9: 'きゅうじゅう'
    };

    const buildUnder10000 = (n) => {
      const d_th = Math.floor(n / 1000);
      const d_h = Math.floor((n / 100) % 10);
      const d_t = Math.floor((n / 10) % 10);
      const d_o = n % 10;
      const parts = [th_map[d_th], h_map[d_h], t_map[d_t], one[d_o]];
      return parts.filter(Boolean).join('');
    };

    if (num < 10000) {
      return buildUnder10000(num);
    }

    const man = Math.floor(num / 10000);
    const rest = num % 10000;
    const manPart = buildUnder10000(man) + 'まん';
    const restPart = rest ? buildUnder10000(rest) : '';
    return manPart + restPart;
  }

  /**
   * 月份数字的特殊读法（1-12）
   * 例：4月 -> し（+ がつ）
   */
  monthNumberReading(num) {
    const map = {
      1: 'いち', 2: 'に', 3: 'さん', 4: 'し', 5: 'ご',
      6: 'ろく', 7: 'しち', 8: 'はち', 9: 'く', 10: 'じゅう',
      11: 'じゅういち', 12: 'じゅうに'
    };
    return map[num] || '';
  }

  /**
   * 英文缩写读法（A–Z）按字母名转片假名
   * 例：IT -> アイティー, AI -> エーアイ, CPU -> シーピーユー
   */
  englishAbbreviationReading(word) {
    if (!word || typeof word !== 'string') return '';
    const map = {
      'A': 'エー', 'B': 'ビー', 'C': 'シー', 'D': 'ディー', 'E': 'イー',
      'F': 'エフ', 'G': 'ジー', 'H': 'エイチ', 'I': 'アイ', 'J': 'ジェイ',
      'K': 'ケイ', 'L': 'エル', 'M': 'エム', 'N': 'エヌ', 'O': 'オー',
      'P': 'ピー', 'Q': 'キュー', 'R': 'アール', 'S': 'エス', 'T': 'ティー',
      'U': 'ユー', 'V': 'ブイ', 'W': 'ダブリュー', 'X': 'エックス', 'Y': 'ワイ', 'Z': 'ズィー'
    };
    const chars = word.toUpperCase().split('');
    const parts = [];
    for (const ch of chars) {
      if (map[ch]) parts.push(map[ch]);
      else return word; // 非纯字母，返回原文
    }
    return parts.join('');
  }

  /**
   * 简化的分词备用方案
   */
  simpleSegment(text) {
    // 简单的按字符分割，用于备用
    const chars = text.split('');
    const tokens = [];
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (char.trim()) {
        // 根据字符类型分配词性
        let pos;
        if (/[\u3040-\u309F]/.test(char)) {
          // 平假名
          pos = ['助詞', '*', '*', '*', '*', '*'];
        } else if (/[\u30A0-\u30FF]/.test(char)) {
          // 片假名
          pos = ['名詞', '一般', '*', '*', '*', '*'];
        } else if (/[\u4E00-\u9FAF]/.test(char)) {
          // 汉字
          pos = ['名詞', '一般', '*', '*', '*', '*'];
        } else if (/[a-zA-Z]/.test(char)) {
          // 英文字母
          pos = ['名詞', '固有名詞', '一般', '*', '*', '*'];
        } else if (/\d/.test(char)) {
          // 数字
          pos = ['名詞', '数', '*', '*', '*', '*'];
        } else {
          // 其他符号
          pos = ['記号', '*', '*', '*', '*', '*'];
        }
        
        tokens.push({
          surface: char,
          lemma: char,
          reading: char,
          pos: pos
        });
      }
    }
    
    return tokens;
  }

  /**
   * 分词处理 - 对应原Python的/api/segment接口
   */
  async segment(text, mode = 'B') {
    if (!this.initialized) {
      await this.init();
    }

    if (!text || !text.trim()) {
      return { lines: [] };
    }

    // 按行分割，对应原Python的处理逻辑
    const raw = (text || "").replace(/\r/g, "");
    const parts = raw.split('\n').map(s => s.trim());
    const lines = parts.filter(p => p);
    
    const result = [];
    
    for (const line of lines) {
      const t = line.trim();
      if (!t) {
        result.push([]);
        continue;
      }

      // 移除括号内容，对应原Python的逻辑
      const t_for_tok = t.replace(/（.*?）|\(.*?\)/g, '');
      
      try {
        let tokens = [];
        
        if (this.fallbackMode || !this.kuromoji) {
          // 使用简化分词
          tokens = this.simpleSegment(t_for_tok);
        } else {
          // 使用kuromoji进行分词
          tokens = this.kuromoji.tokenize(t_for_tok);
        }
        
        const tokenResults = [];

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const nextToken = tokens[i + 1] || null;
          const surface = token.surface_form || token.surface || '';
          const lemma = token.basic_form || token.lemma || surface;
          let reading = token.__override_reading || token.reading || surface;
          
          // 特殊处理四位年份
          if (surface.match(/^\d{4}$/)) {
            try {
              const year = parseInt(surface);
              reading = this.yearReading(year);
            } catch (e) {
              // 保持原reading
            }
          }

          // 一般数字（半角/全角）读法
          if (/^[0-9０-９]+$/.test(surface)) {
            try {
              const normalized = surface.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
              const num = parseInt(normalized, 10);
              if (!isNaN(num)) {
                reading = this.numberReading(num);
                // 若后续为「月」，应用月份特殊读法并将「月」读作「がつ」
                if (nextToken) {
                  const nextSurface = nextToken.surface_form || nextToken.surface || '';
                  if (nextSurface === '月') {
                    const monthR = this.monthNumberReading(num);
                    if (monthR) {
                      reading = monthR; // 仅数字部分使用月份读法
                      nextToken.__override_reading = 'がつ';
                    }
                  }
                }
              }
            } catch (e) {
              // 保持原reading
            }
          }

          // 英文缩写（纯字母）读法
          if (/^[A-Za-z]+$/.test(surface)) {
            try {
              const katakana = this.englishAbbreviationReading(surface);
              if (katakana && katakana !== surface) {
                reading = katakana;
              }
            } catch (e) {
              // 保持原reading
            }
          }

          // 获取词性信息
          const pos = token.pos || ['*', '*', '*', '*', '*', '*'];
          
          tokenResults.push({
            surface: surface,
            lemma: lemma,
            reading: reading,
            pos: Array.isArray(pos) ? pos : [pos]
          });
        }

        result.push(tokenResults);
      } catch (error) {
        console.error('Tokenization error:', error);
        // 使用简化分词作为最后的备用方案
        const simpleTokens = this.simpleSegment(t_for_tok);
        result.push(simpleTokens.map(token => ({
          surface: token.surface,
          lemma: token.lemma,
          reading: token.reading,
          pos: token.pos
        })));
      }
    }

    return { lines: result };
  }

  /**
   * 获取假名读音 - 使用kuroshiro
   */
  async getReading(text) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      return await this.kuroshiro.convert(text, { to: 'hiragana' });
    } catch (error) {
      console.error('Reading conversion error:', error);
      return text;
    }
  }
}

// 创建全局实例
window.JapaneseSegmenter = JapaneseSegmenter;
