#!/usr/bin/env node
/**
 * PERF-02 词典按需分片构建脚本
 *
 * 输入：static/libs/dict/chunks/jmdict_chunk_*.json（JMdict 3.6.1 全量，源）
 * 输出（static/libs/dict/slices/）：
 *   dict_<桶>.json      按词条主读音首字分桶的词条分片（投影瘦身 + 紧凑序列化）
 *   dict_index.json     全局索引 headword → 桶字符（可多桶，如 昨日→"きさ"）
 *   dict_meta.json      版本/桶清单/统计
 * 同时更新 static/pwa-assets.json：dict 分片/索引/例句分片替换旧 chunks 条目。
 *
 * 桶规则与 tools/build-examples.js 一致：主读音首字，片假名 -0x60 归一平假名，
 * 非假名（英数等）归 other。运行时查询 = 索引 O(1) → 单分片 fetch → 分片内 Map O(1)。
 *
 * 运行：node tools/build-dict-slices.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHUNK_DIR = path.join(ROOT, 'static/libs/dict/chunks');
const OUT_DIR = path.join(ROOT, 'static/libs/dict/slices');
const PWA_ASSETS = path.join(ROOT, 'static/pwa-assets.json');

function bucketChar(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x30a1 && c <= 0x30f6) return String.fromCharCode(c - 0x60); // ァ..ヶ → ぁ..ゖ
  if (c >= 0x3041 && c <= 0x3096) return ch; // 平假名
  return 'other';
}

// ---- 词条投影：只保留 formatEntry 消费的字段，紧凑键 ----
function project(e) {
  const forms = (arr) => (arr || []).filter(k => k.text).map(k => [k.text, k.common ? 1 : 0]);
  const sense = (e.sense || []).map(s => {
    const o = {};
    if (s.partOfSpeech && s.partOfSpeech.length) o.p = s.partOfSpeech;
    const gloss = (s.gloss || []).map(g => g.text).filter(Boolean).join('; ');
    if (gloss) o.g = gloss;
    if (s.field && s.field.length) o.f = s.field;
    if (s.misc && s.misc.length) o.m = s.misc;
    if (s.info && s.info.length) o.i = s.info;
    const chi = (s.languageSource || []).find(ls => ls.lang === 'chi');
    if (chi && chi.text) o.c = chi.text;
    return o;
  });
  const out = { id: e.id };
  const kanji = forms(e.kanji);
  const kana = forms(e.kana);
  if (kanji.length) out.k = kanji;
  if (kana.length) out.r = kana;
  if (sense.length) out.s = sense;
  return out;
}

// ---- 1. 读全量 chunks，按主读音首字分桶 ----
const byBucket = new Map(); // bucket -> entries[]
const headwordBuckets = new Map(); // headword -> Set(bucket)
let totalEntries = 0;

const chunkFiles = fs.readdirSync(CHUNK_DIR).filter(f => /^jmdict_chunk_\d+\.json$/.test(f)).sort();
if (!chunkFiles.length) throw new Error('no jmdict_chunk_*.json found in ' + CHUNK_DIR);
for (const file of chunkFiles) {
  const chunk = JSON.parse(fs.readFileSync(path.join(CHUNK_DIR, file), 'utf8'));
  for (const e of chunk.words) {
    totalEntries++;
    const reading = e.kana && e.kana[0] && e.kana[0].text;
    const bucket = reading ? bucketChar([...reading][0]) : 'other';
    let list = byBucket.get(bucket);
    if (!list) { list = []; byBucket.set(bucket, list); }
    list.push(project(e));
    for (const form of [...(e.kanji || []), ...(e.kana || [])]) {
      if (!form.text) continue;
      let set = headwordBuckets.get(form.text);
      if (!set) { set = new Set(); headwordBuckets.set(form.text, set); }
      set.add(bucket);
    }
  }
}

// ---- 2. 写分片 + 全局索引 ----
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) fs.unlinkSync(path.join(OUT_DIR, f));

const bucketsMeta = {};
let sliceBytes = 0;
for (const [bucket, entries] of byBucket) {
  const file = bucket === 'other' ? 'dict_other.json' : `dict_${bucket}.json`;
  const json = JSON.stringify({ w: entries });
  fs.writeFileSync(path.join(OUT_DIR, file), json);
  bucketsMeta[bucket] = { file, entries: entries.length, bytes: json.length };
  sliceBytes += json.length;
}

fs.writeFileSync(path.join(OUT_DIR, 'dict_meta.json'), JSON.stringify({
  version: '3.6.1',
  scheme: 1,
  generated: new Date().toISOString(),
  total_entries: totalEntries,
  headwords: headwordBuckets.size,
  buckets: bucketsMeta
}, null, 1));
// 索引：headword → 桶字符连串（单桶 1 字符；多桶如 する→"すそ"）。
// other 桶编码为 '*'（否则按单字符解码会拆成 o/t/h/e/r）。
const INDEX_OTHER = '*';
const indexObj = {};
for (const [headword, set] of headwordBuckets) {
  indexObj[headword] = [...set].sort().map(b => b === 'other' ? INDEX_OTHER : b).join('');
}
const indexJson = JSON.stringify(indexObj);
fs.writeFileSync(path.join(OUT_DIR, 'dict_index.json'), indexJson);

const sliceFiles = fs.readdirSync(OUT_DIR).filter(f => f.startsWith('dict_')).sort()
  .map(f => `static/libs/dict/slices/${f}`);

// ---- 3. 更新 pwa-assets.json：chunks → slices + examples ----
const assets = JSON.parse(fs.readFileSync(PWA_ASSETS, 'utf8'));
const exDir = path.join(ROOT, 'static/libs/dict/examples');
const exFiles = fs.existsSync(exDir) ? fs.readdirSync(exDir).filter(f => f.endsWith('.json')).sort()
  .map(f => `static/libs/dict/examples/${f}`) : [];
const kept = assets.assets.filter(a => !/\/dict\/(chunks|slices|examples)\//.test(a));
// 插入位置：紧跟 dictionary-service.js
const anchor = kept.indexOf('static/libs/dict/dictionary-service.js');
kept.splice(anchor + 1, 0, ...sliceFiles, ...exFiles);
assets.assets = kept;
assets.version = String(parseFloat(assets.version || '2.0.0') + 1);
fs.writeFileSync(PWA_ASSETS, JSON.stringify(assets, null, 2) + '\n');

const sizes = Object.values(bucketsMeta).map(b => b.bytes).sort((a, b) => b - a);
console.log(`词条 ${totalEntries} → ${byBucket.size} 桶`);
console.log(`分片合计 ${(sliceBytes / 1e6).toFixed(1)}MB（最大 ${(sizes[0] / 1e6).toFixed(2)}MB, 中位 ${(sizes[Math.floor(sizes.length / 2)] / 1e3).toFixed(0)}KB）`);
console.log(`索引 ${(indexJson.length / 1e6).toFixed(1)}MB, ${headwordBuckets.size} 词头`);
console.log(`pwa-assets.json v${assets.version}: ${assets.assets.length} 条（slices ${sliceFiles.length}, examples ${exFiles.length}）`);
