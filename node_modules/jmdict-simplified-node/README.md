# JMDict-Simplified for Node.js

[**@scriptin**'s `jmdict-simplified`](https://github.com/scriptin/jmdict-simplified) project provides a sane JSON version of the famous [JMDict](http://www.edrdg.org/jmdict/j_jmdict.html) open-source Japanese dictionary project.

*This* current project, `jmdict-simplified-node` (the one you're reading about), helps Node.js applications load JMDict-Simplified's JSON into a LevelDB database to facilitate fast searches for both text (which often contain kanji) and readings (no kanji), on both prefixes and full-text. It does this by simply creating indexes on all substrings of all text and readings.

This means that after a one-time setup, your apps can start instantly and search this dictionary with lightning speed (all thanks to LevelDB of course). Note that you don't need to know or care anything about LevelDB to use this library—it handles all the details for you.

This project also contains TypeScript interfaces describing the JMDict-Simplified project, allowing your TypeScript projects to effortlessly navigate this data.

## Installation and setup

I expect you have a Node.js project already. In it,
1. install jmdict-simplified-node: `npm i jmdict-simplified-node`
2. download a recent release of the [JMDict-Simplified JSON](https://github.com/scriptin/jmdict-simplified/releases/latest)
3. import jmdict-simplified-node into your project: in TypeScript, this would be `import {setup as setupJmdict} from 'jmdict-simplified-node'`
4. setup: `const jmdictPromise = setupJmdict('my-jmdict-simplified-db', 'jmdict-eng-3.1.0.json');`

## API

### `setup(dbpath: string, filename = '', verbose = false): Promise<SetupType>`
Always call this first, it returns an object you need to call all other functions.

Given
- the `dbpath`, the path you want your LevelDB database to be stored,
- optionally the `filename` of the JMDict-Simplified JSON,
- and optionally a `verbose` flag,

this function will return a promise of the following data:
```ts
export type SetupType = {
  db: Db,
  dictDate: string,
  version: string,
};
```
The first of these, `db`, is required by all lookup functions in this API, so hang on to this. The two strings are informational.

If a proper LevelDB database is not found in `dbpath`, this function will look at `filename` and parse the JSON in it. It takes ~90 seconds to take a 234 MB JSON file and create a 140 MB LevelDB database on a 2015-vintage Mac laptop.

Protip: if you plan on always having the LevelDB database for your app, you can just run this setup once (in your app's post-install stage maybe?) and never call this with a `filename`.

Protip: in my apps, I just hang on to the promise returned by this function and, in each place that needs to call anything else in this API, I `await` this promise. That way I don't have to ever worry about a function trying to do a lookup before the data is available.

### `readingBeginning(db: Db, prefix: string, limit?: number): Promise<Word[]>`
Find all readings starting with a given `prefix`. Needs a `Db`-typed object, which was one of the things `setup` gave you. `limit` defaults to -1 (no limit) but isn't super-useful since this project doens't yet support paginated search. Get in touch if you need this.

Returns a promisified array of `Word`s. A `Word` is an entry in JMDict, and contains things like
- an `id` to uniquely identify it in the dictionary,
- `kanji`, or the text being defined (might or might not actually include something you can call kanji: `ＣＤ` and `日本` are two examples),
- `kana`, the reading (that is, the pronunciation) of this kanji text,
- `sense`, i.e., the various dictionary senses this word can have.

Look at [`interfaces.ts`](./interfaces.ts) for the details. It very carefully follows the soft-schema of the [upstream `jmdict-simplified`](https://github.com/scriptin/jmdict-simplified) project.

### `readingAnywhere`, `kanjiBeginning`, `kanjiAnywhere`
These three have the same signature as `readingBeginning` above:
```ts
readingAnywhere(db: Db, text: string, limit?: number): Promise<Word[]>
kanjiBeginning(db: Db, prefix: string, limit?: number): Promise<Word[]>
kanjiAnywhere(db: Db, text: string, limit?: number): Promise<Word[]>
```
They search the reading or kanji (text) fields, either via a prefix (to match the beginning) or by free text to match anywhere.

### `getTags(db: Db): Promise<Simplified['tags']>`
JMDict uses a large number of acronyms that it calls "tags", e.g.,
- "MA" for "martial arts term",
- "aux-v" for "auxiliary verb",
- "fem" for "female term or language".

These acronyms will be found in the hits yielded by the four lookup functions above.

This function will return an object mapping these abbreviations to their full meaning.

### `getField(db: Db, key: keyof BetterOmit<Simplified, 'words'>): Promise<string>`
There are a small handful of extra pieces of information that the original JSON includes, things like
- `dictDate`, the date the original JMDict XML file was created,
- `dictRevisions`, a list of revisions in the original JMDict XML file, etc.

This function lets you access these.

### `idsToWords(db: Db, idxs: string[]): Promise<Word[]>`
This helper function will expand a list of JMDict word IDs to the full definition. This might be helpful if you only transmit words' IDs, for example.
