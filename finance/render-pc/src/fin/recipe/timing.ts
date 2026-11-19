// `At` resolution: a word of the voice-over (or seconds) -> seconds. See types.ts for the syntax.
import type { At, Word } from "./types";

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9'%$-]/g, "").replace(/^'+|'+$/g, "");
export const makeAt = (words: readonly Word[]) => {
  const lineStart = (n: number) => { const q = words.filter((w) => w.turn === n); if (!q.length) throw new Error(`no line ${n}`); return q[0].t; };
  const lineEnd = (n: number) => { const q = words.filter((w) => w.turn === n); if (!q.length) throw new Error(`no line ${n}`); return Math.max(...q.map((w) => w.end)); };
  const word = (key: string, end: boolean) => {
    let turn: number | undefined;
    let k = key;
    const m = /^(\d+):(.+)$/.exec(k);
    if (m) { turn = parseInt(m[1], 10); k = m[2]; }
    let nth = 1;
    const h = /^(.+)#(\d+)$/.exec(k);
    if (h) { k = h[1]; nth = parseInt(h[2], 10); }
    const want = clean(k);
    let c = 0;
    for (const w of words) if ((turn === undefined || w.turn === turn) && clean(w.w) === want && ++c === nth) return end ? w.end : w.t;
    throw new Error(`recipe: no word "${key}" in vo/timings.json`);
  };
  /** seconds for an At */
  const at = (a: At | undefined, dflt = 0): number => {
    if (a === undefined || a === null) return dflt;
    if (typeof a === "number") return a;
    const s = a.trim();
    if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    const off = /^(.*?)([+-]\d+(\.\d+)?)$/.exec(s);
    const base = off && off[1] ? off[1] : s;
    const d = off && off[1] ? parseFloat(off[2]) : 0;
    let t: number;
    if (base.startsWith("lineEnd:")) t = lineEnd(parseInt(base.slice(8), 10));
    else if (base.startsWith("line:")) t = lineStart(parseInt(base.slice(5), 10));
    else if (base.startsWith("end:")) t = word(base.slice(4), true);
    else t = word(base, false);
    return t + d;
  };
  return { at, lineStart, lineEnd };
};
/** vo/timings.json ({turns:[{turn, words:[{w,t,end}]}]}) -> Word[] */
export const wordsOfTimings = (j: { turns: { turn: number; words: { w: string; t: number; end: number }[] }[] }): Word[] =>
  j.turns.flatMap((tn) => tn.words.map((w) => ({ w: w.w, turn: tn.turn, t: w.t, end: w.end })));
