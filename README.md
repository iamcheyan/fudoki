# Fudoki（フドキ）

> **日本語学習者とNLP愛好家のための、インタラクティブな日本語テキスト解析＆音声読み上げWebアプリ**
>
> **An interactive Japanese text analysis and speech synthesis web app for language learners and NLP enthusiasts**
>
> **为日语学习者和NLP爱好者打造的交互式日语文本分析与语音朗读Web应用**

---

## 🌟 主要特性 / Features / 主な機能

### 🔍 **智能文本分析**
- **形態素解析**: Kuromoji.jsベースの高精度な分かち書き
- **品詞タグ付け**: 名詞・動詞・形容詞など詳細な品詞情報
- **読み仮名表示**: 各単語のカタカナ・ひらがな読み
- **ローマ字変換**: 学習者に優しいローマ字表記

### 🗣️ **音声合成機能**
- **ネイティブ音声**: Web Speech APIによる自然な日本語TTS
- **単語別再生**: クリックで個別単語を発音
- **行単位再生**: 文ごとに音声確認
- **全文再生**: ドキュメント全体の連続再生
- **速度調整**: 0.5x～2.0xで自由に調整可能

### 📚 **辞書統合**
- **JMdict辞書**: 包括的な日英辞書データベース
- **詳細翻訳**: 複数の意味・用法・例文を表示
- **ワンクリック検索**: 単語カードをクリックで即座に翻訳

### 📝 **文書管理**
- **マルチドキュメント**: 複数の文書を管理
- **自動保存**: 編集内容をローカルストレージに自動保存
- **簡単切り替え**: サイドバーからワンクリックで文書切替

### 🎨 **カスタマイズ**
- **ダークモード**: 目に優しいダーク/ライトテーマ
- **表示切替**: ふりがな・ローマ字・品詞の表示/非表示
- **多言語UI**: 日本語・英語・中文インターフェース
- **ドラッグ可能**: ツールバーの位置・サイズを自由調整

---

## 🚀 使い方 / Usage / 使用方法

### オンライン版
🌐 **[https://fudoki.iamcheyan.com](https://fudoki.iamcheyan.com)**

### ローカル起動

```bash
# リポジトリをクローン
git clone https://github.com/iamcheyan/fudoki.git
cd fudoki

# HTTPサーバーを起動（例：Python）
python -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

### 基本操作

1. **テキスト入力**: 上部のテキストエリアに日本語を入力
2. **分析実行**: 「分析」ボタンをクリック
3. **結果確認**: 色分けされた単語カードで品詞を確認
4. **音声再生**: 単語・行・全文の再生ボタンをクリック
5. **辞書確認**: 単語カードをクリックして翻訳を表示

---

## 📖 日本語版ガイド

### Fudokiとは？

Fudoki（フドキ）は、日本語学習者やNLP研究者向けに開発された、ブラウザで動作する日本語テキスト解析ツールです。形態素解析エンジン「Kuromoji.js」を搭載し、入力した日本語文を自動的に単語に分割し、品詞・読み仮名・ローマ字を表示します。

### 主な用途

- **日本語学習**: 文章の構造理解、発音練習
- **教育現場**: 教材作成、読解指導
- **NLP研究**: トークナイゼーション、品詞タグ付けの検証
- **翻訳作業**: 語彙確認、用法チェック

### 技術スタック

- **形態素解析**: Kuromoji.js
- **辞書データ**: JMdict (Japanese-Multilingual Dictionary)
- **音声合成**: Web Speech API
- **フロントエンド**: Vanilla JavaScript, CSS3

### 品詞の色分け

| 色 | 品詞 |
|---|---|
| 🟢 緑 | 名詞 |
| 🔵 青 | 動詞 |
| 🟠 橙 | 形容詞 |
| 🟣 紫 | 副詞 |
| 🔴 赤 | 助詞 |
| 🟡 黄 | 感動詞 |

---

## 📖 English Guide

### What is Fudoki?

Fudoki is a browser-based Japanese text analysis tool designed for language learners and NLP enthusiasts. Powered by the Kuromoji.js morphological analyzer, it automatically segments Japanese sentences into words and displays part-of-speech tags, kana readings, and romaji transliterations.

### Key Use Cases

- **Language Learning**: Understanding sentence structure and pronunciation practice
- **Education**: Creating teaching materials and reading comprehension instruction
- **NLP Research**: Tokenization and POS tagging verification
- **Translation Work**: Vocabulary checking and usage verification

### Tech Stack

- **Morphological Analysis**: Kuromoji.js
- **Dictionary Data**: JMdict (Japanese-Multilingual Dictionary)
- **Speech Synthesis**: Web Speech API
- **Frontend**: Vanilla JavaScript, CSS3

### Part-of-Speech Color Coding

| Color | Part of Speech |
|---|---|
| 🟢 Green | Noun |
| 🔵 Blue | Verb |
| 🟠 Orange | Adjective |
| 🟣 Purple | Adverb |
| 🔴 Red | Particle |
| 🟡 Yellow | Interjection |

### Browser Compatibility

- ✅ Chrome 70+
- ✅ Firefox 62+
- ✅ Safari 14+
- ✅ Edge 79+

*Note: Speech synthesis availability depends on your OS and browser language settings*

---

## 📖 中文指南

### Fudoki是什么？

Fudoki（复读机）是一款专为日语学习者和自然语言处理研究者设计的浏览器端日语文本分析工具。采用「Kuromoji.js」形态素解析引擎，可自动将输入的日语句子分词，并显示词性、假名读音和罗马音标注。

### 主要应用场景

- **日语学习**: 理解句子结构、练习发音
- **教育教学**: 制作教材、阅读理解指导
- **NLP研究**: 分词、词性标注验证
- **翻译工作**: 词汇确认、用法检查

### 技术栈

- **形态素解析**: Kuromoji.js
- **词典数据**: JMdict（日语多语言词典）
- **语音合成**: Web Speech API
- **前端技术**: Vanilla JavaScript, CSS3

### 词性颜色标注

| 颜色 | 词性 |
|---|---|
| 🟢 绿色 | 名词 |
| 🔵 蓝色 | 动词 |
| 🟠 橙色 | 形容词 |
| 🟣 紫色 | 副词 |
| 🔴 红色 | 助词 |
| 🟡 黄色 | 感叹词 |

### 浏览器兼容性

- ✅ Chrome 70+
- ✅ Firefox 62+
- ✅ Safari 14+
- ✅ Edge 79+

*注意：语音合成功能的可用性取决于您的操作系统和浏览器语言设置*

---

## 🛠️ 开発情報 / Development / 开发信息

### プロジェクト構成

```
fudoki/
├── index.html              # メインHTML
├── static/
│   ├── main-js.js         # アプリケーションロジック
│   ├── segmenter.js       # 形態素解析ラッパー
│   ├── styles.css         # スタイルシート
│   └── libs/
│       ├── kuromoji.js    # 形態素解析エンジン
│       └── dict/          # 辞書データ
│           ├── *.dat.gz   # Kuromojiバイナリ辞書
│           └── jmdict_*.json  # JMdict翻訳データ
└── README.md
```

### ローカル開発

```bash
# 依存関係なし、静的ファイルのみ
# 任意のHTTPサーバーで起動可能

# Python
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### カスタマイズ

#### テーマカラーの変更

`static/styles.css`のCSS変数を編集:

```css
:root {
  --primary: #0066cc;  /* プライマリカラー */
  --bg: #ffffff;       /* 背景色 */
  --text: #333333;     /* テキスト色 */
}
```

#### 辞書データの更新

JMdictの最新版をダウンロードして`static/libs/dict/`に配置。

---

## 📄 ライセンス / License / 许可协议

MIT License

### 使用しているライブラリ / Third-party Libraries / 使用的第三方库

- **Kuromoji.js** - Apache License 2.0
- **JMdict** - Creative Commons Attribution-ShareAlike 3.0

---

## 👨‍💻 作者 / Author / 作者

**Cheyan**

- Website: [https://iamcheyan.com](https://iamcheyan.com)
- GitHub: [@iamcheyan](https://github.com/iamcheyan)

---

## 🤝 貢献 / Contributing / 贡献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

We welcome pull requests! For major changes, please open an issue first to discuss what you would like to change.

欢迎提交 Pull Request！对于重大更改，请先开启 issue 讨论您想要更改的内容。

---

## ⭐ Star History

If you find Fudoki useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=iamcheyan/fudoki&type=Date)](https://star-history.com/#iamcheyan/fudoki&Date)

---

## 📮 フィードバック / Feedback / 反馈

バグ報告や機能リクエストは [GitHub Issues](https://github.com/iamcheyan/fudoki/issues) までお願いします。

Bug reports and feature requests: [GitHub Issues](https://github.com/iamcheyan/fudoki/issues)

错误报告和功能请求：[GitHub Issues](https://github.com/iamcheyan/fudoki/issues)

---

<div align="center">

**Made with ❤️ for Japanese language learners worldwide**

**世界中の日本語学習者のために ❤️ を込めて**

**为全世界的日语学习者用心打造 ❤️**

</div>
