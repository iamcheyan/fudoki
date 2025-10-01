// Hand-written interfaces for https://github.com/scriptin/jmdict-simplified 3.0.1
export type Tag = string;
export interface Kanji {
  common: boolean;
  text: string;
  tags: Tag[];
}
export interface Kana {
  common: boolean;
  text: string;
  tags: Tag[];
  appliesToKanji: string[];
}
export type Xref = [string, string, number]|[string, number]|[string];
export interface Source {
  lang: string;
  full: boolean;
  wasei: boolean;
  text?: string;
}
export enum GlossType {
  literal = "literal",
  figurative = "figurative",
  explanation = "explanation",
}
export interface Gloss {
  lang: string;
  text: string;
  type: GlossType|null;
}
export interface Sense {
  partOfSpeech: Tag[];
  appliesToKanji: string[];
  appliesToKana: string[];
  related: Xref[];
  antonym: Xref[];
  field: Tag[];
  dialect: Tag[];
  misc: Tag[];
  info: string[];
  languageSource: Source[];
  gloss: Gloss[];
}
export interface Word {
  id: string;
  kanji: Kanji[];
  kana: Kana[];
  sense: Sense[];
}
export interface Simplified {
  version: string;
  dictDate: string;
  dictRevisions: string[];
  tags: {[k: string]: string};
  words: Word[];
}
