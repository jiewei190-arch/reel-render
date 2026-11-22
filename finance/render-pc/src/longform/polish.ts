// Shared "polish" helpers for the law3d / biz3d / cyber3d kits (Shorts and long-form), pure functions, no React, no
// three.js (LONGFORM.md "Polish rules", ENGINE.md). The same code runs in the render (HUD components) and in node (the
// compilers and tools/polish_qa.mjs), so what the gate measures is what renders.
//   textPx / fitFs     measured Poppins ExtraBold widths (the advance table below, from public/fonts/Poppins-ExtraBold.ttf);
//                      a line either shrinks to fit its box (down to MIN_TEXT_PX) or is reported as not fitting
//   countPlan / countU a counter's count window: it lands EXACTLY on its target no later than its anchor word's end (the
//                      voice saying the number) and holds it for >= COUNT_HOLD s before the device leaves or the shot cuts
//   spokenAnchor       finds the anchor word: the voice-over words that say the counter's target ("fifteen", "$12,000",
//                      "twelve thousand", "54 million", "1,152")
//   chapterBox / placeChapters   the long-form chapter card measured and given its own screen region (no clipped slide-in,
//                      never over a board or label)
// Block Money and tech3d do not call these (their output is unchanged); ChapterCard keeps its old look unless a kit passes
// `safe`.

/** Poppins 800 advance widths (em), canvas measureText without kerning (as tools/framing_qa.mjs textEm) */
export const GLYPH: Record<string, number> = {"0":0.657,"1":0.387,"2":0.569,"3":0.61,"4":0.691,"5":0.655,"6":0.635,"7":0.523,"8":0.653,"9":0.606," ":0.191,"!":0.423,"\"":0.451,"#":0.919,"$":0.661,"%":0.904,"&":0.814,"'":0.243,"(":0.47,")":0.47,"*":0.548,"+":0.589,",":0.314,"-":0.578,".":0.301,"/":0.426,":":0.302,";":0.366,"<":0.524,"=":0.661,">":0.519,"?":0.538,"@":1.104,"A":0.755,"B":0.671,"C":0.758,"D":0.735,"E":0.548,"F":0.561,"G":0.757,"H":0.743,"I":0.308,"J":0.584,"K":0.726,"L":0.491,"M":0.935,"N":0.765,"O":0.787,"P":0.636,"Q":0.788,"R":0.661,"S":0.62,"T":0.604,"U":0.712,"V":0.747,"W":1.076,"X":0.739,"Y":0.701,"Z":0.613,"[":0.522,"\\":0.84,"]":0.521,"^":0.733,"_":0.772,"`":0.307,"a":0.68,"b":0.68,"c":0.607,"d":0.68,"e":0.616,"f":0.373,"g":0.68,"h":0.686,"i":0.308,"j":0.307,"k":0.647,"l":0.308,"m":1.067,"n":0.686,"o":0.636,"p":0.68,"q":0.68,"r":0.447,"s":0.568,"t":0.421,"u":0.686,"v":0.649,"w":0.885,"x":0.628,"y":0.655,"z":0.507,"{":0.492,"|":0.277,"}":0.492,"~":0.674,"×":0.609,"·":0.324,"▲":0.5,"▼":0.5,"€":0.793,"£":0.671,"¢":0.605,"…":0.815,"’":0.346,"‘":0.346,"“":0.595,"”":0.595,"—":0.933,"–":0.689,"°":0.48};
/** an unknown glyph counts as wide (a fit errs on the safe side) */
const WIDE = 0.8;

/** the smallest main-line font size (px, CSS font-size) a board / label / card may shrink to: framing rule R4's 42 px
 *  (at 1080 px wide in portrait, 1080 px tall in landscape: both kits' layouts are already in those px) */
export const MIN_TEXT_PX = 42;
/** the smallest secondary line (a board title, a tab): 32 px, the long-form "every font >= 32 px" floor */
export const MIN_SUB_PX = 32;

/** width of a line in em (no letter spacing) */
export const textEm = (s: string) => { let w = 0; for (const ch of String(s)) w += GLYPH[ch] ?? WIDE; return w; };
/** width of a line in px at font size fs with CSS letter-spacing ls (px, added after every glyph) */
export const textPx = (s: string, fs: number, ls = 0) => textEm(s) * fs + ls * [...String(s)].length;
/** the widest a number string can get while it counts: every digit as the widest digit ("4") */
export const widestDigits = (s: string) => String(s).replace(/\d/g, "4");

export type Fit = {
  /** the font size to use (px): maxFs, or smaller so the line fits maxW */
  fs: number;
  /** false: even at minFs the line is wider than maxW (the gate fails it) */
  ok: boolean;
  /** the line's width at fs */
  w: number;
  /** the box width the line needs at minFs */
  needW: number;
  /** about how many characters of this line fit maxW at minFs */
  maxChars: number;
  text: string; maxW: number; minFs: number; maxFs: number;
};
/** the largest font size <= maxFs at which `text` fits `maxW` (one line, never wrapped), floored to 0.1 px. Below minFs
 *  the line still renders at the fitted size (never clipped), but `ok` is false and --check fails with fitAdvice(). */
export const fitFs = (text: string, maxFs: number, maxW: number, ls = 0, minFs = MIN_TEXT_PX): Fit => {
  const s = String(text ?? "");
  const n = [...s].length, em = textEm(s);
  let fs = maxFs;
  if (em > 0 && em * maxFs + ls * n > maxW) fs = Math.max(1, (maxW - ls * n) / em);
  fs = Math.floor(fs * 10) / 10;
  const needW = em * minFs + ls * n;
  const per = n ? needW / n : minFs;
  return { fs, ok: fs >= minFs - 1e-6, w: em * fs + ls * n, needW, maxChars: Math.max(1, Math.floor(maxW / Math.max(1, per))), text: s, maxW, minFs, maxFs };
};
/** the --check message for a line that does not fit */
export const fitAdvice = (what: string, f: Fit, alt?: string) =>
  `${what} '${f.text}' needs ${Math.ceil(f.needW)} px at the ${f.minFs} px minimum but its box has ${Math.floor(f.maxW)} px (it would shrink to ${f.fs.toFixed(0)} px): shorten it to ${f.maxChars} characters${alt ? ` or ${alt}` : ""}`;

// ------------------------------------------------------------------ counters
/** a landed counter shows its final value for at least this long before it leaves or the shot cuts (s) */
export const COUNT_HOLD = 0.5;
/** a count shorter than this snaps to the final value (a 3-frame count reads as a glitch) */
export const COUNT_MIN = 0.25;
export type CountPlan = {
  /** the count runs start .. end; at and after `end` the value IS the target (end <= start: shown final at once) */
  start: number; end: number;
  /** the anchor word (the voice saying the number), when found or given */
  anchor?: { w: string; t: number; end: number; given: boolean };
  /** the device leaves (or its shot cuts) at `until` */
  until: number;
  /** what limited the window ("dur", "anchor word", "hold before the cut", "snap") */
  why: string;
};
/** the count window: from `start` for `dur` s, but ending no later than the anchor word's end and COUNT_HOLD before
 *  `until`; a window shorter than COUNT_MIN snaps (the target from the first frame) */
export const countPlan = (o: { start: number; dur: number; until: number; anchor?: CountPlan["anchor"] }): CountPlan => {
  let end = o.start + o.dur, why = "dur";
  if (o.anchor && o.anchor.end < end) { end = Math.max(o.start, o.anchor.end); why = "anchor word"; }
  if (o.until - COUNT_HOLD < end) { end = o.until - COUNT_HOLD; why = "hold before the cut"; }
  if (end - o.start < COUNT_MIN) { end = o.start; why = "snap"; }
  return { start: o.start, end, anchor: o.anchor, until: o.until, why };
};
/** 0..1 progress of a count (exactly 1 from `end` on) */
export const countU = (t: number, p: CountPlan, ease: (u: number) => number) => {
  if (t >= p.end || p.end <= p.start) return 1;
  if (t <= p.start) return ease(0);
  return ease((t - p.start) / (p.end - p.start));
};

// ------------------------------------------------------------------ spoken numbers (the anchor word)
const ONES: Record<string, number> = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const SCALE: Record<string, number> = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12, k: 1e3, m: 1e6, b: 1e9, bn: 1e9 };
type Tok = { s: string; brk: boolean };
const tok = (w: string): Tok[] => {
  const raw = String(w).toLowerCase().replace(/[“”"’‘]/g, "");
  const brk = /[.,;:!?…]$/.test(raw);
  const core = raw.replace(/^[^a-z0-9$€£]+/, "").replace(/[^a-z0-9%]+$/, "");
  const parts = /\d/.test(core) ? [core] : core.split("-").filter(Boolean);
  return parts.map((s, i) => ({ s, brk: brk && i === parts.length - 1 }));
};
const numTok = (s: string): number | null => {
  const m = s.match(/^[$€£]?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(k|m|bn|b|%|x)?$/);
  if (!m) return null;
  let v = parseFloat(m[1].replace(/,/g, "") + (m[2] ? `.${m[2]}` : ""));
  if (m[3] && SCALE[m[3]]) v *= SCALE[m[3]];
  return v;
};
/** every number phrase in the words: { value, i0, i1 } (word indices), longest phrase from each start */
export const spokenNumbers = (words: readonly { w: string }[]) => {
  const flat: { s: string; brk: boolean; wi: number }[] = [];
  words.forEach((w, wi) => tok(w.w).forEach((x) => flat.push({ ...x, wi })));
  const out: { value: number; i0: number; i1: number }[] = [];
  for (let i = 0; i < flat.length; i++) {
    let total = 0, cur = 0, any = false, last = -1, j = i, digits = false;
    for (; j < flat.length; j++) {
      const s = flat[j].s;
      const d = numTok(s);
      if (d !== null) { if (any && !digits) break; if (digits) break; cur = d; any = true; digits = true; last = j; }
      else if (s in ONES && !digits) { if (cur % 10 !== 0 && cur % 100 > 0 && cur < 100 && cur >= 20 && ONES[s] >= 10) break; cur += ONES[s]; any = true; last = j; }
      else if (s in TENS && !digits) { if (cur % 100 >= 10) break; cur += TENS[s]; any = true; last = j; }
      else if (s === "hundred" && any && !digits) { cur = (cur || 1) * 100; last = j; }
      else if ((s === "a" || s === "an") && !any && j + 1 < flat.length && (flat[j + 1].s === "hundred" || flat[j + 1].s in SCALE)) { cur = 1; any = true; }
      else if (s in SCALE && any && s.length > 2) { total += (cur || 1) * SCALE[s]; cur = 0; last = j; }
      else if (s === "and" && any && !digits) continue;
      else if (s === "point" && any && j + 1 < flat.length && flat[j + 1].s in ONES) { cur += ONES[flat[j + 1].s] / 10; j++; last = j; }
      else break;
      if (flat[j].brk) { j++; break; }
    }
    if (any && last >= 0) out.push({ value: total + cur, i0: flat[i].wi, i1: flat[last].wi });
  }
  return out;
};
/** the anchor word of a counter: the LAST word of the first phrase in [from, to) that says `target` (exactly, or to the
 *  shown rounding: 54,000,000 matches "54 million"; 10.5 matches "$10.50") */
export const spokenAnchor = (words: readonly { w: string; t: number; end: number }[], target: number, from: number, to: number, decimals = 0, rel = 1e-6) => {
  // rel: a compact display ($1.46B) matches what it rounds ("one point four six billion", "about 1.5 billion": rel 0.005-0.05)
  const near = (v: number) => Math.abs(v - target) <= Math.max(1e-9, 0.5 * 10 ** -Math.max(0, decimals)) || Math.abs(v - target) <= rel * Math.abs(target);
  // only look at words around the window (cheap on 10-minute scripts)
  const i0 = words.findIndex((w) => w.end >= from);
  if (i0 < 0) return undefined;
  let i1 = i0; while (i1 < words.length && words[i1].t < to) i1++;
  const sub = words.slice(Math.max(0, i0 - 6), Math.min(words.length, i1 + 6));
  const off = Math.max(0, i0 - 6);
  for (const n of spokenNumbers(sub)) {
    const a = sub[n.i0], b = sub[n.i1];
    if (a.t < from - 1e-6 || a.t >= to) continue;
    // a loss shown as -$57M is said as "57 million"
    if (near(n.value) || near(-n.value)) return { w: sub.slice(n.i0, n.i1 + 1).map((x) => x.w).join(" "), t: a.t, end: b.end, given: false, index: off + n.i1 };
  }
  return undefined;
};
/** where the anchor search looks, relative to the counter's pop-in: a little before (the counter may pop on "about") */
export const ANCHOR_LOOKBACK = 1.5;

// ------------------------------------------------------------------ the long-form chapter card (safe mode)
/** chapter card numbers (px at 1920x1080): the bar starts at the left edge; the title shrinks to fit one line */
export const CHAPTER = { left: 120, padR: 60, edge: 14, maxW: 1500, tabFs: 34, tabH: 54, gap: 14, titleFs: 96, minFs: 56, titlePadV: 40, tops: [330, 130, 560], margin: 18, rightMax: 1920 - 58 } as const;
export type Rect4 = { x0: number; x1: number; y0: number; y1: number };
/** the card's measured box at `top` (the tab + the title bar) and the title font size */
export const chapterBox = (title: string, top: number = CHAPTER.tops[0]) => {
  const T = String(title).toUpperCase();
  const avail = CHAPTER.maxW - CHAPTER.left - CHAPTER.padR - CHAPTER.edge;
  const fit = fitFs(T, CHAPTER.titleFs, avail, 0, CHAPTER.minFs);
  const w = CHAPTER.left + fit.w + CHAPTER.padR + CHAPTER.edge;
  const h = CHAPTER.tabH + CHAPTER.gap + fit.fs * 1.05 + CHAPTER.titlePadV;
  return { x0: 0, x1: w, y0: top, y1: top + h, fs: fit.fs, fit, top, title: T };
};
export const rectsOverlap = (a: Rect4, b: Rect4, m = 0) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.y0 < b.y1 + m && b.y0 < a.y1 + m;
const overlapArea = (a: Rect4, b: Rect4) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
/** each chapter card gets the first top (330, 130, 560 px) whose box is clear of every fixed board / card on screen during
 *  its window (busy(t0, t1) -> rects); with none clear, the least covered. Movable labels / exhibit tags then avoid it. */
export const placeChapters = <C extends { title: string; card: number }>(chapters: readonly C[], busy: (t0: number, t1: number) => Rect4[], dur: number) =>
  chapters.map((ch) => {
    const rs = busy(ch.card, ch.card + dur);
    let best = chapterBox(ch.title, CHAPTER.tops[0]), bs = Infinity;
    for (const top of CHAPTER.tops) {
      const b = chapterBox(ch.title, top);
      const sc = rs.reduce((a, r) => a + overlapArea({ x0: b.x0, x1: b.x1 + CHAPTER.margin, y0: b.y0 - CHAPTER.margin, y1: b.y1 + CHAPTER.margin }, r), 0);
      if (sc < bs - 1e-6) { bs = sc; best = b; }
      if (sc === 0) break;
    }
    return { ...ch, top: best.top, box: { x0: best.x0, x1: best.x1, y0: best.y0, y1: best.y1 }, fs: best.fs, fitOk: best.fit.ok };
  });
