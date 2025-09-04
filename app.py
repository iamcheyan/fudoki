from __future__ import annotations

import os
import sys
from dataclasses import asdict, dataclass
import re
from typing import List

from flask import Flask, jsonify, render_template, request

try:
    from sudachipy import dictionary, tokenizer as sudachi_tokenizer
except Exception as e:  # pragma: no cover
    dictionary = None
    sudachi_tokenizer = None


app = Flask(__name__, static_folder="static", template_folder="templates")


@dataclass
class TokenOut:
    surface: str
    lemma: str
    reading: str
    pos: list[str]


def year_reading(num: int) -> str:
    """Return natural Japanese reading (hiragana) for 4‑digit years.

    Examples
    - 2009 -> にせんきゅう
    - 2010 -> にせんじゅう
    - 1985 -> せんきゅうひゃくはちじゅうご
    """
    if num < 1000 or num > 9999:
        return str(num)

    d_th = num // 1000
    d_h = (num // 100) % 10
    d_t = (num // 10) % 10
    d_o = num % 10

    one = {0: "", 1: "いち", 2: "に", 3: "さん", 4: "よん", 5: "ご", 6: "ろく", 7: "なな", 8: "はち", 9: "きゅう"}

    th_map = {
        1: "せん",
        2: "にせん",
        3: "さんぜん",
        4: "よんせん",
        5: "ごせん",
        6: "ろくせん",
        7: "ななせん",
        8: "はっせん",
        9: "きゅうせん",
    }

    h_map = {
        0: "",
        1: "ひゃく",
        2: "にひゃく",
        3: "さんびゃく",
        4: "よんひゃく",
        5: "ごひゃく",
        6: "ろっぴゃく",
        7: "ななひゃく",
        8: "はっぴゃく",
        9: "きゅうひゃく",
    }

    t_map = {
        0: "",
        1: "じゅう",
        2: "にじゅう",
        3: "さんじゅう",
        4: "よんじゅう",
        5: "ごじゅう",
        6: "ろくじゅう",
        7: "ななじゅう",
        8: "はちじゅう",
        9: "きゅうじゅう",
    }

    parts = [th_map.get(d_th, ""), h_map.get(d_h, ""), t_map.get(d_t, ""), one.get(d_o, "")]
    return "".join(p for p in parts if p)


def _get_tokenizer():
    global _TOKENIZER
    if getattr(_get_tokenizer, "_tok", None) is None:
        if dictionary is None:
            raise RuntimeError(
                "SudachiPy がインストールされていません。`pip install -r requirements.txt` を実行してください。"
            )
        _get_tokenizer._tok = dictionary.Dictionary().create()
    return _get_tokenizer._tok


SPLIT_MODE_MAP = {
    "A": "A",  # Short
    "B": "B",  # Middle
    "C": "C",  # Long
}


def _split_mode(mode: str):
    if sudachi_tokenizer is None:
        raise RuntimeError("SudachiPy not available")
    m = (mode or "B").upper()
    m = SPLIT_MODE_MAP.get(m, "B")
    if m == "A":
        return sudachi_tokenizer.Tokenizer.SplitMode.A
    if m == "C":
        return sudachi_tokenizer.Tokenizer.SplitMode.C
    return sudachi_tokenizer.Tokenizer.SplitMode.B


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/segment")
def api_segment():
    data = request.get_json(silent=True) or {}
    text: str = data.get("text", "")
    mode: str = data.get("mode", "B")

    tok = _get_tokenizer()
    smode = _split_mode(mode)

    # Respect explicit line breaks: each non-empty line is one unit to tokenize
    raw = (text or "").replace("\r", "")
    parts = [s.strip() for s in raw.split("\n")]
    lines = [p for p in parts if p]
    out: List[List[TokenOut]] = []
    for line in lines:
        t = (line or "").strip()
        if not t:
            out.append([])
            continue
        arr: List[TokenOut] = []
        for morpheme in tok.tokenize(t, smode):
            surface = morpheme.surface()
            lemma = morpheme.dictionary_form()
            reading = morpheme.reading_form() or surface
            # Special handling for 4-digit years: override with natural reading
            if surface.isdigit() and len(surface) == 4:
                try:
                    reading = year_reading(int(surface))
                except Exception:
                    pass
            try:
                pos_tuple = tuple(morpheme.part_of_speech())
            except Exception:
                pos_tuple = ("*", "*", "*", "*", "*", "*")
            arr.append(TokenOut(surface=surface, lemma=lemma, reading=reading, pos=list(pos_tuple)))
        out.append(arr)

    return jsonify({
        "lines": [[asdict(t) for t in line] for line in out]
    })


def main():  # pragma: no cover
    # コマンドライン引数からポート番号を取得（指定がない場合は環境変数またはデフォルト値を使用）
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"エラー: 無効なポート番号です: {sys.argv[1]}")
            sys.exit(1)
    else:
        port = int(os.environ.get("PORT", 8000))
    
    app.run(host="0.0.0.0", port=port, debug=True)


if __name__ == "__main__":  # pragma: no cover
    main()
