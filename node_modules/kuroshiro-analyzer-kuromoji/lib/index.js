"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _kuromoji = require("kuromoji");

var _kuromoji2 = _interopRequireDefault(_kuromoji);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Check where we are
var isNode = false;
var isBrowser = typeof window !== "undefined";
if (!isBrowser && typeof module !== "undefined" && module.exports) {
    isNode = true;
}

/**
 * Kuromoji based morphological analyzer for kuroshiro
 */

var Analyzer = function () {
    /**
     * Constructor
     * @param {Object} [options] JSON object which have key-value pairs settings
     * @param {string} [options.dictPath] Path of the dictionary files
     */
    function Analyzer() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            dictPath = _ref.dictPath;

        _classCallCheck(this, Analyzer);

        this._analyzer = null;

        if (!dictPath) {
            if (isNode) this._dictPath = require.resolve("kuromoji").replace(/src(?!.*src).*/, "dict/");else this._dictPath = "node_modules/kuromoji/dict/";
        } else {
            this._dictPath = dictPath;
        }
    }

    /**
     * Initialize the analyzer
     * @returns {Promise} Promise object represents the result of initialization
     */


    _createClass(Analyzer, [{
        key: "init",
        value: function init() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var self = _this;
                if (_this._analyzer == null) {
                    _kuromoji2.default.builder({ dicPath: _this._dictPath }).build(function (err, newAnalyzer) {
                        if (err) {
                            return reject(err);
                        }
                        self._analyzer = newAnalyzer;
                        resolve();
                    });
                } else {
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

    }, {
        key: "parse",
        value: function parse() {
            var _this2 = this;

            var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

            return new Promise(function (resolve, reject) {
                if (str.trim() === "") return resolve([]);
                var result = _this2._analyzer.tokenize(str);
                for (var i = 0; i < result.length; i++) {
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
    }]);

    return Analyzer;
}();

exports.default = Analyzer;
module.exports = exports["default"];