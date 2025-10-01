import {AbstractBatch} from 'abstract-leveldown';
import {promises as pfs} from 'fs';
import LevelDOWN from 'leveldown';
import LevelUp from 'levelup';

import {Simplified, Word} from './interfaces';
export * from './interfaces';
type Db = ReturnType<typeof LevelUp>;

// Takes ~90 seconds on 2015-era MacBook Pro, producing 140 MB Leveldb directory ("jmdict-eng-3.1.0.json").
export type SetupType = {
  db: Db,
  dictDate: string,
  version: string,
};
export async function setup(dbpath: string, filename = '', verbose = false): Promise<SetupType> {
  const db = LevelUp(LevelDOWN(dbpath));
  try {
    const opt = {asBuffer: false};
    const [dictDate, version] =
        await Promise.all([db.get('raw/dictDate', opt), db.get('raw/version', opt)]) as string[];
    return {db, dictDate, version};
  } catch {
    // pass
  }

  if (!filename) { throw new Error('database not found but cannot create it if no `filename` given'); }
  const raw: Simplified = JSON.parse(await pfs.readFile(filename, 'utf8'));
  const maxBatches = 10000;
  let batch: AbstractBatch[] = [];

  {
    // non-JSON, pure strings
    const keys: (keyof Simplified)[] = ['dictDate', 'version'];
    for (const key of keys) { batch.push({type: 'put', key: `raw/${key}`, value: raw[key]}) }
  }
  {
    // to JSONify
    const keys: (keyof Simplified)[] = ['tags', 'dictRevisions'];
    for (const key of keys) { batch.push({type: 'put', key: `raw/${key}`, value: JSON.stringify(raw[key])}) }
  }

  for (const [numWordsWritten, w] of raw.words.entries()) {
    if (batch.length > maxBatches) {
      await db.batch(batch);
      batch = [];
      if (verbose) { console.log(`${numWordsWritten} entries written`); }
    }
    batch.push({type: 'put', key: `raw/words/${w.id}`, value: JSON.stringify(w)});
    for (const key of (['kana', 'kanji'] as const)) {
      for (const k of w[key]) {
        batch.push({type: 'put', key: `indexes/${key}/${k.text}-${w.id}`, value: w.id});
        for (const substr of allSubstrings(k.text)) {
          // collisions in key ok, since value will be same
          batch.push({type: 'put', key: `indexes/partial-${key}/${substr}-${w.id}`, value: w.id});
        }
      }
    }
  }
  if (batch.length) { await db.batch(batch); }
  return {db, dictDate: raw.dictDate, version: raw.version};
}

function drainStream<T>(stream: NodeJS.ReadableStream): Promise<T[]> {
  const ret: T[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', x => ret.push(x))
        .on('error', e => reject(e))
        .on('close', () => resolve(ret))
        .on('end', () => resolve(ret));
  })
}

async function searchBeginning(db: Db, prefix: string, key: 'kana'|'kanji' = 'kana', limit: number): Promise<Word[]> {
  const gte = `indexes/${key}/${prefix}`;
  return idsToWords(db,
                    await drainStream(db.createValueStream({gte, lt: gte + '\uFE0F', valueAsBuffer: false, limit})));
}
async function searchAnywhere(db: Db, text: string, key: 'kana'|'kanji' = 'kana', limit: number): Promise<Word[]> {
  const gte = `indexes/partial-${key}/${text}`;
  return idsToWords(db,
                    await drainStream(db.createValueStream({gte, lt: gte + '\uFE0F', valueAsBuffer: false, limit})));
}
export function idsToWords(db: Db, idxs: string[]): Promise<Word[]> {
  return Promise.all(idxs.map(i => db.get(`raw/words/${i}`, {asBuffer: false}).then(x => JSON.parse(x))))
}

export async function readingBeginning(db: Db, prefix: string, limit = -1) {
  return searchBeginning(db, prefix, 'kana', limit);
}
export async function readingAnywhere(db: Db, text: string, limit = -1) {
  return searchAnywhere(db, text, 'kana', limit);
}
export async function kanjiBeginning(db: Db, prefix: string, limit = -1) {
  return searchBeginning(db, prefix, 'kanji', limit);
}
export async function kanjiAnywhere(db: Db, text: string, limit = -1) {
  return searchAnywhere(db, text, 'kanji', limit);
}

export async function getTags(db: Db): Promise<Simplified['tags']> {
  return db.get('raw/tags', {asBuffer: false}).then(x => JSON.parse(x));
}

type BetterOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export async function getField(db: Db, key: keyof BetterOmit<Simplified, 'words'>): Promise<string> {
  return db.get(`raw/${key}`, {asBuffer: false});
}

function allSubstrings(s: string) {
  const slen = s.length;
  let ret: Set<string> = new Set();
  for (let start = 0; start < slen; start++) {
    for (let length = 1; length <= slen - start; length++) { ret.add(s.substr(start, length)); }
  }
  return ret;
}

if (module === require.main) {
  (async function() {
    // TODO: Download latest jmdict-eng JSON
    const DBNAME = 'test';
    const {db, dictDate, version} = await setup(DBNAME, 'jmdict-eng-3.1.0.json', true);

    console.log({dictDate, version});

    const res = await readingBeginning(db, 'いい'); // それ
    const resPartial = await readingAnywhere(db, 'いい');
    console.log(`${res.length} exact found`);
    console.log(`${resPartial.length} partial found`);

    console.log(await idsToWords(db, ['1383480']));

    {
      const LIMIT = 4;
      const res = await readingBeginning(db, 'いい', LIMIT);
      console.log(`${res.length} found with limit ${LIMIT}`);
    }
    { console.log(Object.keys(await getTags(db))); }
    { console.log(await getField(db, "dictDate")); }
  })();
}