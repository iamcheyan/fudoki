# kuroshiro-analyzer-kuromoji
 
[![Build Status](https://travis-ci.com/hexenq/kuroshiro-analyzer-kuromoji.svg?branch=master)](https://travis-ci.org/hexenq/kuroshiro-analyzer-kuromoji)
[![Coverage Status](https://coveralls.io/repos/github/hexenq/kuroshiro-analyzer-kuromoji/badge.svg?branch=master)](https://coveralls.io/github/hexenq/kuroshiro-analyzer-kuromoji?branch=master)
[![npm version](https://badge.fury.io/js/kuroshiro-analyzer-kuromoji.svg)](http://badge.fury.io/js/kuroshiro-analyzer-kuromoji)

<table>
    <tr>
        <td>Package</td>
        <td colspan=2>kuroshiro-analyzer-kuromoji</td>
    </tr>
    <tr>
        <td>Description</td>
        <td colspan=2>Kuromoji morphological analyzer for <a href="https://github.com/hexenq/kuroshiro">kuroshiro</a>.</td>
    </tr>
    <tr>
        <td rowspan=2>Compatibility</td>
        <td>Node</td>
        <td>✓ (>=6)</td>
    </tr>
    <tr>
        <td>Browser</td>
        <td>✓</td>
    </tr>
</table>

## Install
```sh
$ npm install kuroshiro-analyzer-kuromoji
```
*For legacy frontend workflows, you could include `dist/kuroshiro-analyzer-kuromoji.min.js` in your page. (you may first build it from source with `npm run build` after `npm install`)*

## Usage with kuroshiro
### Configure analyzer
This analyzer utilizes [kuromoji.js](https://github.com/takuyaa/kuromoji.js). 

You could specify the path of your dictionary files with `dictPath` param. 

```js
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

const analyzer = new KuromojiAnalyzer();

await kuroshiro.init(analyzer);
```

### Initialization Parameters
__Example:__
```js
const analyzer = new KuromojiAnalyzer({
    dictPath: "url/to/dictionary_files"
});
```
- `dictPath`: *Optional* Path of the dictionary files