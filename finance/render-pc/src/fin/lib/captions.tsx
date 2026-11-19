// Word-timed captions for the recipe system. The chunk/hold logic and the per-word pop are adapted from
// hassancs91/claude-faceless-shorts-creator (remotion/src/lib/shorts.tsx chunkLines / Captions; MIT, (c) 2026 Hasan
// Aboul Hasan; see THIRD_PARTY_NOTICES.md). Our rules (finance/FORMAT_V1.md): 1-3 words, bold with an outline, the
// spoken word highlighted, clear of the bottom 420 px, the right-hand button rail (160 px) and faces.
import React from "react";
import { EASE_OUT, prog } from "./motion";

export type CapWord = { w: string; t: number; end: number; turn?: number };
export type CapChunk = { words: CapWord[]; start: number; end: number; hold: number };
/** the safe zone (px at 1080 x 1920) */
export const SAFE = { top: 220, bottom: 420, right: 160, left: 60 } as const;
/** chunk words into 1-maxWords groups (break on punctuation and pauses > 0.25 s); a chunk holds until the next one
 *  starts or its end + 0.6 s (the last: end + 0.8 s) */
export const chunkWords = (words: readonly CapWord[], maxWords = 3): CapChunk[] => {
  const out: CapChunk[] = [];
  let cur: CapWord[] = [];
  words.forEach((q, i) => {
    cur.push(q);
    const nx = words[i + 1];
    if (cur.length >= maxWords || /[.,!?…:]$/.test(q.w) || !nx || nx.t - q.end > 0.25 || (nx.turn ?? 0) !== (q.turn ?? 0)) {
      out.push({ words: cur, start: cur[0].t, end: cur[cur.length - 1].end, hold: 0 });
      cur = [];
    }
  });
  out.forEach((c, i) => { const n = out[i + 1]; c.hold = n ? Math.min(n.start, c.end + 0.6) : c.end + 0.8; });
  return out;
};
export type CaptionStyle = { size?: number; hot?: string; centre?: number; upper?: boolean };
/** the caption band: the chunk on screen at t, the spoken word in `hot`; each word pops 0.92 -> 1 over 0.12 s */
export const RecipeCaptions: React.FC<{ chunks: CapChunk[]; t: number; style?: CaptionStyle; hide?: (t: number) => boolean }> = ({ chunks, t, style = {}, hide }) => {
  const { size = 84, hot = "#ff3b30", centre = 0.31, upper = true } = style;
  if (hide && hide(t)) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  return (
    <div style={{ position: "absolute", left: SAFE.left + 10, right: SAFE.right + 10, top: 1920 * centre - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {c.words.map((q, i) => {
        const on = t >= q.t - 2 / 30 && t < q.end + 0.05; // highlight 2 frames before the word (herk-edit-kit, idea)
        const st = prog(t, q.t - 0.05, q.t + 0.07);
        const txt = q.w.replace(/[.,!?…:]+$/, "");
        return (
          <span key={i} style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.05, color: on ? hot : "#ffffff", WebkitTextStroke: "7px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 16px rgba(8,4,16,0.6)", transform: `scale(${0.92 + 0.08 * EASE_OUT(st) + (on ? 0.05 : 0)})`, display: "inline-block" }}>
            {upper ? txt.toUpperCase() : txt}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ two-layer captions (finance/research/TOP3D_SUMMARY.md)
// A tiny full-sentence line near the top (5-12 % down) for skim-readers + a BIG bold 1-3 word chunk in the lower third
// (baseline ~76 % down, cap height ~5.5 % of the frame) that keeps the beat. ONE accent colour per chunk on the word
// that matters (the money word / number / emotion): red for losses, green for gains (or the recipe's colour). The
// chunk may show from frame 0 (hook text + one chunk, nothing else); the sentence line waits until the hook is gone.
const NUMWORD = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|double|half|percent)/i;
const GAIN = /^(save|saved|saves|saver|savings|gain|gains|done|win|wins|won|grow|grows|grew|free|rich|more)$/i;
const LOSS = /^(nothing|zero|lose|lost|loses|owe|owes|debt|interest|broke|paying|pay|paid|cost|costs|extra|minimum|wrong|trap|traps|bill|bills|fee|fees|gone|worst)$/i;
/** the accent word of a chunk: a number/$ word first, then a loss/gain word, else the longest word */
export const accentOf = (ws: CapWord[]): number => {
  const bare = ws.map((q) => q.w.replace(/[^A-Za-z0-9$%'-]/g, ""));
  let k = bare.findIndex((w) => /\d|\$/.test(w) || NUMWORD.test(w));
  if (k < 0) k = bare.findIndex((w) => LOSS.test(w) || GAIN.test(w));
  if (k < 0) { let L = 0; bare.forEach((w, i) => { if (w.length > L) { L = w.length; k = i; } }); }
  return k;
};
export type TwoLayerStyle = { loss?: string; gain?: string; neutral?: string };
export const TwoLayerCaptions: React.FC<{ chunks: CapChunk[]; words: readonly CapWord[]; t: number; hookUntil: number; style?: TwoLayerStyle; hideChunk?: boolean }> = ({ chunks, words, t, hookUntil, style = {}, hideChunk = false }) => {
  const { loss = "#ff3b30", gain = "#3ee07a", neutral = "#ffd23a" } = style;
  // the small sentence: the line (turn) being spoken, after the hook has gone
  let sentence = "";
  if (t > hookUntil) {
    const cur = words.find((q) => t >= q.t - 0.1 && t < q.end + 0.4);
    if (cur) sentence = words.filter((q) => (q.turn ?? 0) === (cur.turn ?? 0)).map((q) => q.w).join(" ");
  }
  const c = hideChunk ? undefined : chunks.find((k) => t >= k.start - 2 / 30 && t < k.hold);
  const enter = c ? EASE_OUT(prog(t, c.start - 2 / 30, c.start + 0.1)) : 0;
  const ak = c ? accentOf(c.words) : -1;
  const txt = c ? c.words.map((q) => q.w.replace(/[.,!?…:]+$/, "").toUpperCase()) : [];
  const chars = txt.join(" ").length;
  const size = Math.min(150, Math.max(92, 1500 / Math.max(6, chars))); // ~150 px = cap height ~5.5 % of 1920
  return (
    <>
      {sentence ? (
        <div style={{ position: "absolute", left: 90, right: 190, top: 170, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: "#ffffff", textAlign: "center", background: "rgba(20,12,28,0.62)", padding: "6px 16px", borderRadius: 14 }}>{sentence}</div>
        </div>
      ) : null}
      {c ? (
        <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: 1460 - size * 1.05 * (chars * size * 0.6 > 860 ? 2 : 1), display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.25, transform: `translateY(${(1 - enter) * 18}px) scale(${0.94 + 0.06 * enter})` }}>
          {c.words.map((q, i) => {
            const w = txt[i];
            const col = i !== ak ? "#ffffff" : GAIN.test(w) ? gain : LOSS.test(w) ? loss : /\$|\d/.test(w) || NUMWORD.test(w) ? neutral : neutral;
            const on = t >= q.t - 2 / 30 && t < q.end + 0.05;
            return <span key={i} style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.05, color: col, WebkitTextStroke: `${Math.round(size / 11)}px #140c1c`, paintOrder: "stroke fill", textShadow: "0 8px 20px rgba(8,4,16,0.6)", display: "inline-block", transform: `scale(${on ? 1.06 : 1})` }}>{w}</span>;
          })}
        </div>
      ) : null}
    </>
  );
};
