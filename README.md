# 日本語読み上げ・分割ツール (Flask + SudachiPy)

Flask（Python）バックエンドとブラウザの Web Speech API を使った日本語リーダーです。テキストをサーバー側で形態素解析（SudachiPy）し、フロントはテンプレート（`templates/index.html`）＋`static/main.js` で表示・読み上げします。

このリポジトリは Python 版のみを残し、静的な単体ページ（`index.html` / `app.jsx` / `script.js` / `styles.css`）は削除しています。

## 特長
- 形態素解析 API（`/api/segment`）：SudachiPy で単語に分割し読み仮名も付与
- 読み上げ：Web Speech API による語/行/全文の読み上げ、ハイライト付き
- 音声選択と速度調整：日本語優先、設定は `localStorage` に保存
- テーマ切替：ライト/ダーク、保存対応

## ディレクトリ構成（Python 版）
```
ja-reader/
├── app.py              # Flask アプリ本体
├── requirements.txt    # 依存（Flask, SudachiPy, sudachidict）
├── templates/
│   └── index.html      # UI（Tailwind CDN + エントリ）
└── static/
    └── main.js         # フロントの振る舞い（音声・分割・表示）
```

## セットアップ
1) Python 環境を用意（3.10+ 推奨）
2) 依存のインストール：
```
pip install -r ja-reader/requirements.txt
```

SudachiPy の辞書は `sudachidict_core` を使います（`requirements.txt` で同時に入ります）。

## 起動
```
python ja-reader/app.py
```
デフォルトで `http://127.0.0.1:8000/` で起動します。

## 使い方
1. 画面上部の「＋新しいテキスト」を押してテキストを入力
2. 「分割」でサーバーに送信し単語に分割して表示
3. 単語クリックでその語を再生、長押しで行を再生、全文再生ボタンで全体を再生
4. 右上ボタンでライト/ダーク切替、音声と速度を調整

## 注意（音声について）
- 実際の音声はブラウザと OS が提供します。日本語音声が無い場合は OS に日本語 TTS 音声を追加してください。
  - macOS: システム設定 > アクセシビリティ > 読み上げコンテンツ > 声
  - Windows: 設定 > 時刻と言語 > 言語と地域（音声パック）
- Safari などではユーザー操作後でないと再生されない場合があります（本 UI はクリック操作で開始します）。

## ライセンス
プロジェクト方針に合わせて LICENSE を追加してください。
