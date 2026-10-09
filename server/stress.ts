import type { TtsEngine } from '../shared/protocol.js';
// imported rather than read from disk, so the desktop sidecar carries it inside its single binary
import stress from './content/stress.json' with { type: 'json' };
import stressWords from './content/stress-words.json' with { type: 'json' };

/**
 * Stress marks for homographs in the narrator's sentences («р+уки» or «рук+и» depending on the
 * sentence), applied right before a sentence goes to an engine, so the text on screen never sees them.
 * Vosk takes `+` before the stressed vowel. The marks were set by reading every sentence that holds a
 * word the Vosk dictionary knows two stresses for, and only those that differ from the stress its
 * dictionary would pick anyway are kept, so audio stays valid wherever it was already right.
 *
 * Words the Vosk dictionary lacks altogether (made-up titles, rare forms) it reads with no stress at
 * all, so those carry a mark in every sentence they appear in, from a separate word list.
 */

/** sentence → word in lower case → the word with `+` before its stressed vowel */
type Marks = Record<string, Record<string, string>>;

const data = stress as Partial<Record<TtsEngine, Marks>>;
/** word in lower case → the word with `+` before its stressed vowel */
const everywhere = stressWords as Partial<Record<TtsEngine, Record<string, string>>>;

// a word glued to a `+` is marked already, by its sentence
const WORD = /(?<![а-яё+])[а-яё]+(?![а-яё+])/giu;

/** `found` with the pluses of `marked` put in at the same letters, its capitals kept. */
function withMarks(found: string, marked: string): string {
  let out = '';
  let i = 0;
  for (const ch of marked) out += ch === '+' ? '+' : found[i++];
  return out;
}

/** The sentence as `engine` should read it, with stress marked on its homographs; unchanged when it has none. */
export function stressed(engine: TtsEngine, sentence: string): string {
  let out = sentence;
  for (const [word, marked] of Object.entries(data[engine]?.[sentence] ?? {})) {
    // the first whole-word match, in any case
    out = out.replace(new RegExp(`(?<![а-яё])${word}(?![а-яё])`, 'iu'), (found) => withMarks(found, marked));
  }
  const words = everywhere[engine];
  return words ? out.replace(WORD, (found) => (words[found.toLowerCase()] ? withMarks(found, words[found.toLowerCase()]!) : found)) : out;
}

