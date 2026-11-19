// The 2D layer over the 3D frame: the big on-screen counter (above the caption band), small corner tags, and the
// captions (the plan's CAPTIONS chunks re-cased from script.txt, Poppins ExtraBold, pop-in, safe zone).
import React from "react";
import { PopCaptions } from "../library/PopCaptions";
import type { Chunk } from "../engine/core/captions";

export type CounterLine = { text: string; color?: string; size?: number };
export type CounterState = { lines: CounterLine[]; pop?: number; accent?: string } | null;

const W = 1080;
/** the holo counter: a dark glass panel with a glowing border at ~13-22 % of the height (clear of the YouTube top UI
 *  and of the captions at 68 %). Lines are centred; the first line is the big number. pop 0..1 = a scale punch. */
export const Counter: React.FC<{ state: CounterState; top?: number }> = ({ state, top = 245 }) => {
  if (!state || !state.lines.length) return null;
  const s = 1 + 0.08 * Math.sin(Math.PI * Math.min(1, Math.max(0, state.pop ?? 0)));
  const acc = state.accent ?? "#7fefff";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          padding: "18px 44px 22px",
          borderRadius: 34,
          background: "rgba(14,10,30,0.72)",
          border: `5px solid ${acc}`,
          boxShadow: `0 0 26px ${acc}aa, inset 0 0 18px ${acc}55, 0 10px 30px rgba(0,0,0,0.45)`,
          textAlign: "center",
          fontFamily: "Poppins",
          fontWeight: 800,
          maxWidth: W * 0.84,
        }}
      >
        {state.lines.map((l, i) => (
          <div key={i} style={{ fontSize: l.size ?? (i === 0 ? Math.min(88, Math.floor(1400 / Math.max(1, l.text.length))) : 46), lineHeight: 1.08, color: l.color ?? "#ffffff", textShadow: `0 0 14px ${(l.color ?? "#ffffff")}88`, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
};
/** a small painted corner tag (honest framing like THOUGHT EXPERIMENT / EXAMPLE) under the counter, right side */
export const CornerTag: React.FC<{ text: string | null; top?: number }> = ({ text, top = 470 }) =>
  !text ? null : (
    <div style={{ position: "absolute", right: 70, top, padding: "8px 18px", borderRadius: 14, background: "rgba(255,244,200,0.94)", color: "#16121c", fontFamily: "Poppins", fontWeight: 800, fontSize: 30, letterSpacing: 1, boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }}>{text}</div>
  );

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
/** CAPTIONS from plan.gen.ts (lowercase chunks with an onset frame) -> PopCaptions chunks in script.txt casing.
 *  Every caption word is matched in order against the script's words (punctuation-insensitive); the script's spelling
 *  (capitals, punctuation) is used. */
export const casedChunks = (caps: readonly { text: string; frame: number }[], script: string, duration: number, fps = 30): Chunk[] => {
  const sw = script.replace(/\s+/g, " ").trim().split(" ");
  let k = 0;
  const out: Chunk[] = caps.map((c) => {
    const words = c.text.split(/\s+/).map((w) => {
      const n = norm(w);
      for (let j = k; j < Math.min(sw.length, k + 4); j++)
        if (norm(sw[j]) === n) {
          k = j + 1;
          return sw[j];
        }
      return w;
    });
    return { words, a: c.frame / fps, b: 0 };
  });
  out.forEach((c, i) => (c.b = i + 1 < out.length ? out[i + 1].a : duration / fps));
  return out;
};
export const Caps: React.FC<{ chunks: Chunk[]; t: number; until: number }> = ({ chunks, t, until }) => <PopCaptions chunks={chunks} t={t} until={until} />;

/** money formatting: $5,368,709.12 / $5.12 / $0.01 */
export const usd = (v: number, cents = true) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
