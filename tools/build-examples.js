#!/usr/bin/env node
/**
 * F-P1-06 例句索引构建脚本
 *
 * 数据源：EDRDG Tanaka Corpus（examples.utf，WWWJDIC 同源，每周自 tatoeba.org 更新）
 *   A: <日文>\t<英文>#ID=...
 *   B: 词(读音)[词义]{句中形} 〜 功能词带 (#ent_seq) 链接
 *
 * 输出：static/libs/dict/examples/ex_<桶>.json
 *   桶 = 词条主读音首字（片假名归一化为平假名；非假名归 other）
 *   内容 { headword: [[日文, 英文], ...] }，每词最多 3 条（优先词条原形命中的句子）
 *
 * 语料许可：Tanaka Corpus 现 由 Tatoeba 项目以 CC-BY 2.0 FR 维护（EDRDG 分发）。
 * 运行：node tools/build-examples.js [examples.utf 路径，默认 /tmp/tanaka/examples.utf]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SLICE_DIR = path.join(ROOT, 'static/libs/dict/slices');
const OUT_DIR = path.join(ROOT, 'static/libs/dict/examples');
const SRC = process.argv[2] || '/tmp/tanaka/examples.utf';
const MAX_PER_WORD = 3;

// ---- 桶归一化：片假名→平假名（-0x60）；非假名 → other ----

function bucketChar(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x30a1 && c <= 0x30f6) return String.fromCharCode(c - 0x60); // ァ..ヶ → ぁ..ヶ（ヴ→ゔ 天然成立）
  if (c >= 0x3041 && c <= 0x3096) return ch; // 平假名
  return 'other';
}


// ---- 1. 读取词典分片：headword → 桶（首现优先）----
const headwordBucket = new Map(); // word -> bucket
let entryCount = 0;
for (const file of fs.readdirSync(SLICE_DIR).filter(f => /^dict_(?!index|meta).+\.json$/.test(f)).sort()) {
  const slice = JSON.parse(fs.readFileSync(path.join(SLICE_DIR, file), 'utf8'));
  for (const e of slice.w || []) {
    entryCount++;
    const reading = e.r && e.r[0] ? e.r[0][0] : null;
    const bucket = reading ? bucketChar([...reading][0]) : null;
    if (!bucket) continue;
    for (const form of [...(e.k || []), ...(e.r || [])]) {
      if (form[0] && !headwordBucket.has(form[0])) headwordBucket.set(form[0], bucket);
    }
  }
}
console.log(`词典: ${entryCount} 词条, ${headwordBucket.size} 词头键`);

// ---- 2. 解析语料，按词头收集例句 ----
const raw = fs.readFileSync(SRC, 'utf8').split('\n');
const byBucket = new Map(); // bucket -> Map(headword -> [{jp,en,main}])
const seenSentence = new Set();
let pairs = 0, matched = 0;

let jp = null, en = null;
for (let i = 0; i < raw.length; i++) {
  const line = raw[i];
  if (line.startsWith('A: ')) {
    const tab = line.indexOf('\t');
    jp = line.slice(3, tab);
    en = line.slice(tab + 1).replace(/#ID=\S+\s*$/, '');
    pairs++;
  } else if (line.startsWith('B: ') && jp) {
    const tokens = line.slice(3).split(/\s+/);
    for (const tok of tokens) {
      const base = tok.split(/[(\[{]/)[0];
      if (!base) continue;
      const tilde = base.endsWith('~');
      const word = tilde ? base.slice(0, -1) : base;
      if (!word) continue;
      // 匹配：词形优先，未中再试读音（括号内非 # 开头组）
      const m = tok.match(/\(([^)#][^)]*)\)/);
      const reading = m ? m[1] : null;
      const addHit = (key, bucket) => {
        let shard = byBucket.get(bucket);
        if (!shard) { shard = new Map(); byBucket.set(bucket, shard); }
        let list = shard.get(key);
        if (!list) { list = []; shard.set(key, list); }
        const dedupeKey = key + '\u0000' + jp;
        if (seenSentence.has(dedupeKey)) return;
        seenSentence.add(dedupeKey);
        list.push({ jp, en, main: !tilde });
        matched++;
      };
      const wordBucket = headwordBucket.get(word);
      if (wordBucket !== undefined) {
        addHit(word, wordBucket);
        // 词形命中但读音本身也是词头（如 為る(する)）：读音键同步登记，
        // 否则 する 这类高频查询词查不到例句
        if (reading && reading !== word) {
          const rb = headwordBucket.get(reading);
          if (rb !== undefined) addHit(reading, rb);
        }
      } else if (reading && headwordBucket.has(reading)) {
        addHit(reading, headwordBucket.get(reading));
      }
    }
    jp = null; en = null;
  }
}

// ---- 3. 写分片：每词最多 3 条，词条原形（非~）优先 ----
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) fs.unlinkSync(path.join(OUT_DIR, f)); // 清理旧产物

const buckets = {};
let totalBytes = 0, wordsOut = 0;
for (const [bucket, shard] of byBucket) {
  const out = {};
  let cnt = 0;
  for (const [key, list] of shard) {
    list.sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0)); // 稳定排序：main 在前，保持文件序
    const top = list.slice(0, MAX_PER_WORD).map(x => [x.jp, x.en]);
    if (top.length) { out[key] = top; cnt++; }
  }
  if (!cnt) continue;
  const json = JSON.stringify(out);
  const file = bucket === 'other' ? 'ex_other.json' : `ex_${bucket}.json`;
  fs.writeFileSync(path.join(OUT_DIR, file), json);
  buckets[bucket] = { file, words: cnt, bytes: json.length };
  totalBytes += json.length;
  wordsOut += cnt;
}
fs.writeFileSync(path.join(OUT_DIR, 'examples_meta.json'), JSON.stringify({
  version: 1,
  generated: new Date().toISOString(),
  source: 'Tanaka Corpus (EDRDG / tatoeba.org, CC-BY 2.0 FR)',
  max_per_word: MAX_PER_WORD,
  buckets
}, null, 1));

const sizes = Object.values(buckets).map(b => b.bytes).sort((a, b) => b - a);
console.log(`输出: ${Object.keys(buckets).length} 桶, ${wordsOut} 词头, 共 ${(totalBytes / 1e6).toFixed(1)}MB`);
console.log(`最大分片 ${(sizes[0] / 1e6).toFixed(2)}MB, 中位 ${(sizes[Math.floor(sizes.length / 2)] / 1024).toFixed(0)}KB`);
