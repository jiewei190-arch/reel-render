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
  const { size = 84, hot = "#ff3b30", centre = 0.7, upper = true } = style; // OWNER 2026-11-19: bottom centre (see compile.tsx capCentre)
  if (hide && hide(t)) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  return (
    <div style={{ position: "absolute", left: SAFE.right + 10, right: SAFE.right + 10, top: 1920 * centre - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28, transform: `translateY(${(1 - enter) * 14}px)` }}>
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

/** LONG-FORM (1920x1080) lower-third captions: a phrase of up to 7 words, at most 2 lines, centred in a 1440 px column
 *  over a soft dark gradient (readable on a TV and on a phone held sideways), the spoken word in `hot`. `centre` is the
 *  caption's centre as a fraction of the height (compile.tsx CAP_Y_L / 1080). */
export const LowerThirdCaptions: React.FC<{ chunks: CapChunk[]; t: number; centre: number; size?: number; hot?: string; hide?: (t: number) => boolean }> = ({ chunks, t, centre, size = 60, hot = "#ffd23a", hide }) => {
  if (hide && hide(t)) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  const lh = size * 1.12;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080 * centre - 150, height: 1080 - (1080 * centre - 150), background: "linear-gradient(to bottom, rgba(10,6,16,0) 0%, rgba(10,6,16,0.42) 55%, rgba(10,6,16,0.55) 100%)", opacity: enter }} />
      <div style={{ position: "absolute", left: 240, right: 240, top: 1080 * centre - lh, height: lh * 2, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - enter) * 10}px)` }}>
        <div style={{ textAlign: "center", maxHeight: lh * 2, overflow: "hidden", lineHeight: `${lh}px`, textWrap: "balance" } as React.CSSProperties}>
          {c.words.map((q, i) => {
            const on = t >= q.t - 2 / 30 && t < q.end + 0.05;
            const txt = q.w.replace(/[.,!?…:]+$/, "");
            return (
              <span key={i} style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: size, color: on ? hot : "#ffffff", WebkitTextStroke: "6px #140c1c", paintOrder: "stroke fill", textShadow: "0 4px 12px rgba(8,4,16,0.6)", marginRight: i < c.words.length - 1 ? size * 0.26 : 0, display: "inline-block" }}>
                {txt.toUpperCase()}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};
