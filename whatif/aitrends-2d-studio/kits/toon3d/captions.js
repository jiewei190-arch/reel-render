// kits/toon3d/captions.js — Toon 3D caption style: 1-3 words at a time, white, bold rounded sans (Fredoka 700),
// dark outline + soft drop shadow, centred in the lower-middle of the frame (not at the very bottom). Timed from timeline/words.json.
//
// Use in a project: add scenes/_kit.js is skipped (underscore), so put this in scenes/kit.js:
//   import { useToonCaptions } from '/kits/toon3d/captions.js';  useToonCaptions({ y: 0.70 });
// and set "captions": true in config.json. Per-shot "captions": false in shots.json hides them for that shot.
// Emphasis: words listed in opts.gold (lower-case, no punctuation) are drawn gold (numbers, names, punchlines).
import { E, text, measure, ease, prog, clamp, FONTS } from '/engine/core.js';

const norm = (w) => w.toLowerCase().replace(/[^\w']/g, '');
// chunk(words, { max: 3, maxChars: 16, minGap }) -> [{ text, start, end, words:[...] }]
// Breaks after punctuation, before a long pause, or when the chunk would be too long. Never more than `max` words.
export function chunkWords(words, o = {}) {
  const { max = 3, maxChars = 16, pause = 0.28 } = o; const out = []; let cur = [];
  const flush = () => { if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.word.trim()).join(' ') }); cur = []; };
  words.forEach((w, i) => {
    const next = words[i + 1]; const len = cur.map(x => x.word.trim()).join(' ').length + w.word.trim().length + 1;
    if (cur.length && (cur.length >= max || len > maxChars)) flush();
    cur.push(w);
    if (/[.?!,;:…—]["”)]?$/.test(w.word.trim()) || (next && next.start - w.end > pause)) flush();
  });
  flush();
  // each chunk stays up until the next one starts (max +0.6 s after its last word)
  out.forEach((c, i) => { const n = out[i + 1]; c.until = n ? Math.min(n.start, c.end + 0.6) : c.end + 0.6; });
  return out;
}
let CH = null, CHK = '';
// drawToonCaption(g, globalT, opts) — draws in logical units (E.W x E.H)
export function drawToonCaption(g, t, o = {}) {
  const words = E.words; if (!words || !words.length) return;
  const { y = 0.70, size = E.vertical ? 84 : 72, max = 3, maxChars = 16, color = '#ffffff', gold = [], goldColor = '#ffd25a', stroke = 0.2, upper = false, hide = [] } = o;
  const k = `${words.length}|${max}|${maxChars}`; if (k !== CHK) { CH = chunkWords(words, { max, maxChars }); CHK = k; }
  const c = CH.find(c => t >= c.start - 0.04 && t < c.until); if (!c) return;
  if (hide.some(([a, b]) => t >= a && t < b)) return;
  const raw = upper ? c.text.toUpperCase() : c.text;
  const pop = ease.outBack(prog(t, c.start - 0.04, c.start + 0.14)), sc = 0.82 + 0.18 * pop;
  let sz = size; const w0 = measure(g, raw, sz, FONTS.title, 700); if (w0 > E.W * 0.86) sz *= (E.W * 0.86) / w0;
  const cx = E.W / 2, cy = E.H * y;
  g.save(); g.translate(cx, cy); g.scale(sc, sc); g.globalAlpha = clamp(pop * 1.4);
  // soft shadow
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = sz * 0.22; g.shadowOffsetY = sz * 0.07;
  text(g, raw, 0, 0, { size: sz, color: '#000', stroke: sz * stroke, strokeColor: '#141014', weight: 700 }); g.restore();
  // words, gold where asked
  const parts = raw.split(' '); const sp = measure(g, ' ', sz, FONTS.title, 700); const ws = parts.map(p => measure(g, p, sz, FONTS.title, 700)); const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = -tot / 2; parts.forEach((p, i) => { const isGold = gold.includes(norm(p)); text(g, p, x + ws[i] / 2, 0, { size: sz, color: isGold ? goldColor : color, stroke: sz * stroke, strokeColor: '#141014', weight: 700 }); x += ws[i] + sp; });
  g.restore();
}
// useToonCaptions(opts) — installs the style as the player's caption renderer (needs config "captions": true)
export function useToonCaptions(opts = {}) { E.captionFn = (g, t) => drawToonCaption(g, t, { ...(E.cfg.captionStyle || {}), ...opts }); }
