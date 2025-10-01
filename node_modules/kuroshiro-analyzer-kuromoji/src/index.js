import kuromoji from "kuromoji";

// Check where we are
let isNode = false;
const isBrowser = (typeof window !== "undefined");
if (!isBrowser && typeof module !== "undefined" && module.exports) {
    isNode = true;
}

/**
 * Kuromoji based morphological analyzer for kuroshiro
 */
class Analyzer {
    /**
     * Constructor
     * @param {Object} [options] JSON object which have key-value pairs settings
     * @param {string} [options.dictPath] Path of the dictionary files
     */
    constructor({ dictPath } = {}) {
        this._analyzer = null;

        if (!dictPath) {
            if (isNode) this._dictPath = require.resolve("kuromoji").replace(/src(?!.*src).*/, "dict/");
            else this._dictPath = "node_modules/kuromoji/dict/";
        }
        else {
            this._dictPath = dictPath;
        }
    }

    /**
     * Initialize the analyzer
     * @returns {Promise} Promise object represents the result of initialization
     */
    init() {
        return new Promise((resolve, reject) => {
            const self = this;
            if (this._analyzer == null) {
                kuromoji.builder({ dicPath: this._dictPath }).build((err, newAnalyzer) => {
                    if (err) {
                        return reject(err);
                    }
                    self._analyzer = newAnalyzer;
                    resolve();
                });
            }
            else {
                reject(new Error("This analyzer has already been initialized."));
            }
        });
    }

    /**
     * Parse the given string
     * @param {string} str input string
     * @returns {Promise} Promise object represents the result of parsing
     * @example The result of parsing
     * [{
     *     "surface_form": "黒白",    // 表層形
     *     "pos": "名詞",               // 品詞 (part of speech)
     *     "pos_detail_1": "一般",      // 品詞細分類1
     *     "pos_detail_2": "*",        // 品詞細分類2
     *     "pos_detail_3": "*",        // 品詞細分類3
     *     "conjugated_type": "*",     // 活用型
     *     "conjugated_form": "*",     // 活用形
     *     "basic_form": "黒白",      // 基本形
     *     "reading": "クロシロ",       // 読み
     *     "pronunciation": "クロシロ",  // 発音
     *     "verbose": {                 // Other properties
     *         "word_id": 413560,
     *         "word_type": "KNOWN",
     *         "word_position": 1
     *     }
     * }]
     */
    parse(str = "") {
        return new Promise((resolve, reject) => {
            if (str.trim() === "") return resolve([]);
            const result = this._analyzer.tokenize(str);
            for (let i = 0; i < result.length; i++) {
                result[i].verbose = {};
                result[i].verbose.word_id = result[i].word_id;
                result[i].verbose.word_type = result[i].word_type;
                result[i].verbose.word_position = result[i].word_position;
                delete result[i].word_id;
                delete result[i].word_type;
                delete result[i].word_position;
            }
            resolve(result);
        });
    }
}

export default Analyzer;
