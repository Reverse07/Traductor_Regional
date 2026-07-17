// lib/translate.ts
import { DICTIONARY, DictionaryEntry, LangPair } from './dictionary';

export type Direction = 'es-x' | 'x-es';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!,.']/g, '')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const temp = dp[i];
      dp[i] = Math.min(
        dp[i] + 1,
        dp[i - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = temp;
    }
  }
  return dp[m];
}

interface Entry extends DictionaryEntry {}
interface Indices {
  phraseMap: Map<string, Entry>;
  wordMap: Map<string, Entry>;
  wordKeys: string[];
}

function buildIndices(pair: LangPair, direction: Direction): Indices {
  const phraseMap = new Map<string, Entry>();
  const wordMap = new Map<string, Entry>();
  for (const entry of DICTIONARY) {
    const sourceKey = normalize(direction === 'es-x' ? entry.es : entry[pair]);
    if (entry.phrase) {
      phraseMap.set(sourceKey, entry);
    } else {
      wordMap.set(sourceKey, entry);
    }
  }
  return { phraseMap, wordMap, wordKeys: Array.from(wordMap.keys()) };
}

export interface TranslationResult {
  output: string;
  matchedPhrase: boolean;
  unmatched: string[];
  approximated: { original: string; matchedAs: string }[];
}

export function translate(text: string, pair: LangPair, direction: Direction): TranslationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { output: '', matchedPhrase: false, unmatched: [], approximated: [] };
  }

  const { phraseMap, wordMap, wordKeys } = buildIndices(pair, direction);
  const normalizedFull = normalize(trimmed);

  // Frase completa
  const phraseHit = phraseMap.get(normalizedFull);
  if (phraseHit) {
    const value = direction === 'es-x' ? phraseHit[pair] : phraseHit.es;
    return { output: value, matchedPhrase: true, unmatched: [], approximated: [] };
  }

  // Palabra por palabra
  const words = normalizedFull.split(' ');
  const unmatched: string[] = [];
  const approximated: { original: string; matchedAs: string }[] = [];

  const translatedWords = words.map((word) => {
    const direct = wordMap.get(word);
    if (direct) {
      return direction === 'es-x' ? direct[pair] : direct.es;
    }
    // Fuzzy matching
    let best: { key: string; dist: number } | null = null;
    for (const key of wordKeys) {
      const dist = levenshtein(word, key);
      const threshold = key.length <= 4 ? 1 : 2;
      if (dist <= threshold && (!best || dist < best.dist)) {
        best = { key, dist };
      }
    }
    if (best) {
      const entry = wordMap.get(best.key)!;
      approximated.push({ original: word, matchedAs: best.key });
      return direction === 'es-x' ? entry[pair] : entry.es;
    }
    unmatched.push(word);
    return `[${word}]`; // palabra no encontrada
  });

  const output = translatedWords.join(' ');
  return { output, matchedPhrase: false, unmatched, approximated };
}

export function pairLabel(pair: LangPair): string {
  return pair === 'qu' ? 'Quechua' : 'Aimara';
}