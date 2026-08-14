# Fudoki (フドキ)

> 日本語を「見える化」する Web ツール（テキスト解析＆音声読み上げ）
>
> An interactive Japanese text analysis and speech synthesis web app
>
> 让日语结构可视化的 Web 工具（文本分析与语音朗读）

![Screenshot](static/fudoki.png)

---

## English

### Overview
Fudoki is a browser-based, fully local tool that segments Japanese text, shows part-of-speech tags and readings, and reads text aloud via the Web Speech API. No account, no cloud sync — your documents live in your browser.

### Features
- **Documents**: left sidebar with search, favorites, filters and autosave; edit ⇄ analyze segmented main area.
- Text analysis: Kuromoji.js-based segmentation, POS tags, kana and romaji.
- Speech synthesis: play word/line/all; speed 0.5–2.0; voice selection.
- Playback controls: separate Pause/Resume; Play button shows a stop icon while playing.
- Instant setting changes: changing voice or speed during playback restarts near the current position; settings persist in localStorage.
- Dictionary: JMdict integration; click a word card to view translations.
- **Markdown editor**: EasyMDE with a minimal toolbar (bold, italic, heading, quote, lists, link, preview).
- UI: dark/light themes, Linear-style design, custom dropdowns and dialogs (no native controls), multilingual interface (ja/en/zh).
- Data: JSON export/import backup; PWA offline pack for full offline use.
- Mobile-first: doc drawer, bottom dock, safe-area aware at 390×844.

### Usage
Online: https://fudoki.iamcheyan.com

Local:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

### Part-of-Speech Colors
Each token pill carries a small color dot and a matching underline.

| POS | Color |
|---|---|
| Noun | green |
| Verb | blue |
| Adjective | orange |
| Adverb | purple |
| Particle | red |
| Interjection | yellow |

### Development
```
fudoki/
├── index.html
├── static/
│   ├── main-js.js
│   ├── segmenter.js
│   ├── styles.css / mobile.css
│   └── libs/
│       ├── kuromoji.js
│       └── dict/
│           ├── *.dat.gz
│           └── jmdict slices
└── README.md
```

- Design tokens (colors, radii, POS hues) live in `static/styles.css` CSS variables.
- Place updated JMdict data under `static/libs/dict/`.
- After editing JS, run `node --check static/main-js.js`.

### License and Third-party
- MIT License
- Kuromoji.js — Apache License 2.0
- JMdict — Creative Commons Attribution-ShareAlike 3.0

### Contributing and Feedback
Pull requests are welcome. For issues and feature requests, use GitHub Issues: https://github.com/iamcheyan/fudoki/issues

---

## 日本語

### 概要
Fudoki はブラウザで動作する、完全ローカルの日本語テキスト解析・音声読み上げツールです。Kuromoji.js による分かち書き、品詞、読み（かな・ローマ字）を表示し、Web Speech API で朗読します。アカウント登録もクラウド同期もありません。データはすべてブラウザ内に保存されます。

### 主な機能
- **文書管理**：左サイドバーに検索・お気に入り・フィルタ・自動保存。編集⇄解析のセグメント切替。
- 形態素解析：分割、品詞、読み（かな／ローマ字）。
- 音声合成：単語・行・全文の再生、話速 0.5–2.0、音色選択。
- 再生制御：一時停止／再開は専用ボタン。再生中は再生ボタンが停止アイコンになります。
- 設定の即時反映：再生中に音色や話速を変更すると、現在位置付近から新設定で再開します。設定は localStorage に保存。
- 辞書：JMdict と連携、単語カードのクリックで訳語を表示。
- **Markdown エディタ**：EasyMDE（最小構成ツールバー：太字・斜体・見出し・引用・リスト・リンク・プレビュー）。
- UI：ダーク／ライトテーマ、Linear 風デザイン、自描画ドロップダウンとダイアログ（ネイティブ部品不使用）、多言語 UI（日／英／中）。
- データ：JSON エクスポート／インポート。PWA オフラインパックで完全オフライン動作。
- モバイル：ドキュメントドロワー、ボトムドック、safe-area 対応（390×844 第一級）。

### 使い方
オンライン：https://fudoki.iamcheyan.com

ローカル：
```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

### 品詞カラー
各トークンには小さな色点と同色の下線が付きます。

| 品詞 | 色 |
|---|---|
| 名詞 | 緑 |
| 動詞 | 青 |
| 形容詞 | オレンジ |
| 副詞 | 紫 |
| 助詞 | 赤 |
| 感動詞 | 黄 |

### 開発情報
- デザイントークン（色・角丸・品詞色）は `static/styles.css` の CSS 変数。
- JMdict データ：`static/libs/dict/` に配置。
- JS 編集後は `node --check static/main-js.js` を実行。

### ライセンスと利用ライブラリ
- MIT License
- Kuromoji.js — Apache License 2.0
- JMdict — Creative Commons Attribution-ShareAlike 3.0

### 貢献・フィードバック
Issue／PR を歓迎します。https://github.com/iamcheyan/fudoki/issues

---

## 中文

### 概述
Fudoki 是一款纯本地、基于浏览器的日语文本分析与语音朗读工具。使用 Kuromoji.js 进行分词与词性标注，显示假名和罗马音，并通过 Web Speech API 朗读文本。无账号、无云同步——数据全部保存在浏览器本地。

### 功能
- **文档管理**：左侧文档栏支持搜索、收藏、筛选、自动保存；主区为编辑 ⇄ 分析分段切换。
- 文本分析：分词、词性、假名与罗马音。
- 语音合成：按单词/按行/全文播放；语速 0.5–2.0；音色选择。
- 播放控制：暂停/继续为独立按钮；播放中播放按钮显示"停止"图标。
- 即时设置生效：播放中更改语速或音色，会在当前段附近按新设置续播；设置持久化到 localStorage。
- 词典：整合 JMdict；点击词卡查看释义。
- **Markdown 编辑器**：EasyMDE 精简工具栏（粗体、斜体、标题、引用、列表、链接、预览）。
- 界面：深/浅双主题、Linear 式设计、全自绘下拉与对话框（无原生控件）、多语言 UI（日/英/中）。
- 数据：JSON 导出/导入备份；PWA 离线资源包支持完全离线。
- 移动优先：文档抽屉、底部操作坞、safe-area 适配（390×844 第一公民）。

### 使用
在线版：https://fudoki.iamcheyan.com

本地运行：
```bash
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

### 词性颜色
每个词块带有小色点与同色下划线。

| 词性 | 颜色 |
|---|---|
| 名词 | 绿 |
| 动词 | 蓝 |
| 形容词 | 橙 |
| 副词 | 紫 |
| 助词 | 红 |
| 感叹词 | 黄 |

### 开发信息
- 设计令牌（颜色、圆角、词性色）在 `static/styles.css` 的 CSS 变量中。
- JMdict 数据：放置在 `static/libs/dict/`。
- 修改 JS 后运行 `node --check static/main-js.js`。

### 许可与第三方
- MIT License
- Kuromoji.js — Apache License 2.0
- JMdict — Creative Commons Attribution-ShareAlike 3.0

### 贡献与反馈
欢迎 Issue／PR：https://github.com/iamcheyan/fudoki/issues

---

## Name Origin / 名称の由来 / 名称由来

### English
Fudoki is named in homage to Japan’s ancient regional gazetteers “Fudoki”.
“Fudo” conveys the atmosphere and character of place and culture; “Ki” means to record.
This app similarly “records the climate of language”—prosody, rhythm, phonology, and grammar—by segmenting text, labeling parts of speech and readings, and reassembling it for spoken output. It is not the book itself, but a calm tool inspired by that spirit of attentive recording.

### 日本語
この名称 **フドキ** は、奈良時代の地誌『**風土記（ふどき）**』へのオマージュです。
日本人が「フドキ」と聞くと、多くの場合この古代の記録書を思い出します。そこには土地、暮らし、風俗、文化が静かに、しかし丹念に記されています。

- 「風土」＝地域や文化の空気感・肌ざわり
- 「記」＝記すこと、記録すること

このアプリは、まさに「言葉の風土」を記録し、見える化するための道具です。文を分解し、品詞や読み、音のリズムを捉え、発音として再構成する――それは『風土記』が土地の景色を一つひとつ書き留めた営みによく似ています。歴史書そのものではなく、その精神への敬意としての命名です。

### 中文
**Fudoki（フドキ）** 的名字向日本奈良时代的古代地志《**风土记**》致敬。

- 「风土」＝地域与文化的气息与肌理
- 「记」＝记录、书写

本应用做的，正是“记录语言的风土”：把句子拆解成词语，标注词性与读音，把语感、节奏、声韵与语法结构重新组合，并以语音方式呈现。这与《风土记》逐条记录土地与民俗的工作在结构上高度一致。它不是历史书本身，而是对那种“安静而细致地记录世界”的精神的致敬——让语言的风土逐步显形。

---

## Appendix (Brand & History)

### Brand
<div align="center">

Made with ❤️ for Japanese language learners worldwide

世界中の日本語学習者のために ❤️ を込めて

为全世界的日语学习者用心打造 ❤️

</div>

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=iamcheyan/fudoki&type=Date)](https://star-history.com/#iamcheyan/fudoki&Date)
