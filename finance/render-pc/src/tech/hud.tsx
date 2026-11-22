// tech3d HUD, in the channel style (Poppins 800, navy on white cards, electric blue / mint / orange accents):
//   TechHook     top of the frame, <= 2 lines, *one word* in orange; on screen and readable at frame 0
//   TechCaptions bottom-centre word captions (the same fixed band and chunking as the Block Money recipes: centre at
//                y 1344, 170 px side margins, nothing below y 1500); the spoken word in orange
//   LabelLayer   callout lines + label cards (they pop in one at a time; positions come from the compiler)
//   Boards       a counter / number board
import React from "react";
import { chunkWords } from "../fin/lib/captions";
import type { CapChunk } from "../fin/lib/captions";
import { EASE_OUT, OVERSHOOT, prog } from "../fin/lib/motion";
import type { BoardBox, LabelBox } from "./compile";
import { TP } from "./palette";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const FONT = "Poppins";

/** split a hook into at most 2 balanced lines (an explicit "\n" wins) */
export const hookLines = (text: string): string[] => {
  if (text.includes("\n")) return text.split("\n").slice(0, 2);
  const w = text.trim().split(/\s+/);
  if (w.length <= 2 || text.replace(/\*/g, "").length <= 12) return [w.join(" ")];
  let best = 1, bd = Infinity;
  for (let k = 1; k < w.length; k++) { const d = Math.abs(w.slice(0, k).join(" ").length - w.slice(k).join(" ").length); if (d < bd) { bd = d; best = k; } }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
};
export const HOOK_TOP = 236, HOOK_FS = 100;
export const TechHook: React.FC<{ text: string; t: number; t0?: number; until: number }> = ({ text, t, t0 = 0, until }) => {
  if (t > until || t < t0) return null;
  const out = clamp((until - t) / 0.18);
  const tin = t0 > 0 ? EASE_OUT(prog(t, t0, t0 + 0.2)) : 1; // frame 0: fully on (no fade-in); a repeat pops in
  const lines = hookLines(text);
  const breathe = 1 + 0.012 * Math.sin(t * 3.2);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: HOOK_TOP, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${(0.85 + 0.15 * tin) * breathe})`, background: "rgba(255,255,255,0.96)", borderRadius: 34, padding: "18px 40px 24px", boxShadow: "0 14px 40px rgba(20,33,61,0.22)", borderBottom: `10px solid ${TP.blue}` }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: HOOK_FS, lineHeight: 1.04, color: TP.navy, textAlign: "center", whiteSpace: "nowrap", letterSpacing: -1 }}>
            {ln.split(/(\*[^*]+\*)/).map((seg, j) =>
              seg.startsWith("*") && seg.endsWith("*") && seg.length > 2 ? (
                <span key={j} style={{ color: TP.orange, display: "inline-block", transform: `translateY(${-4 * Math.abs(Math.sin(t * 4))}px) rotate(${-2 + 2 * Math.sin(t * 3)}deg)` }}>{seg.slice(1, -1)}</span>
              ) : (
                <span key={j}>{seg}</span>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CAP_CENTRE = 1344;
export const TechCaptions: React.FC<{ chunks: CapChunk[]; t: number; from?: number }> = ({ chunks, t, from = 1.0 }) => {
  if (t < from) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  const size = 82;
  return (
    <div style={{ position: "absolute", left: 170, right: 170, top: CAP_CENTRE - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {c.words.map((q, i) => {
        const on = t >= q.t - 2 / 30 && t < q.end + 0.05;
        const st = prog(t, q.t - 0.05, q.t + 0.07);
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: on ? TP.orange : TP.navy, WebkitTextStroke: "14px #ffffff", paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(20,33,61,0.30)", transform: `scale(${0.92 + 0.08 * EASE_OUT(st) + (on ? 0.05 : 0)})`, display: "inline-block" }}>
            {q.w.replace(/[.,!?…:;]+$/, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
export const techChunks = (words: readonly { w: string; t: number; end: number; turn?: number }[]) => chunkWords(words, 3);

/** callout lines (SVG) + label cards: the line draws from the part to the card, then the card pops in */
export const LabelLayer: React.FC<{ labels: LabelBox[]; t: number }> = ({ labels, t }) => (
  <>
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {labels.map((l) => {
        // the line ends at the card edge nearest the anchor
        const ex = clamp(l.ax, l.x - l.w / 2, l.x + l.w / 2), ey = clamp(l.ay, l.y - l.h / 2, l.y + l.h / 2);
        const mx = l.ax + (ex - l.ax) * l.line, my = l.ay + (ey - l.ay) * l.line;
        const r = 12 + 3 * Math.sin(t * 8);
        return l.line > 0.01 ? (
          <g key={l.key}>
            <line x1={l.ax} y1={l.ay} x2={mx} y2={my} stroke={TP.navy} strokeWidth={12} strokeLinecap="round" opacity={0.25} />
            <line x1={l.ax} y1={l.ay} x2={mx} y2={my} stroke={TP.blue} strokeWidth={6} strokeLinecap="round" />
            <circle cx={l.ax} cy={l.ay} r={r * Math.min(1, l.line * 2)} fill={TP.orange} stroke="#ffffff" strokeWidth={5} />
          </g>
        ) : null;
      })}
    </svg>
    {labels.map((l) =>
      l.u > 0.001 ? (
        <div key={l.key} style={{ position: "absolute", left: l.x - l.w / 2, top: l.y - l.h / 2, width: l.w, height: l.h, transform: `scale(${OVERSHOOT(l.u)})`, transformOrigin: "50% 50%", opacity: clamp(l.u * 3), background: "#ffffff", borderRadius: 22, boxShadow: "0 10px 28px rgba(20,33,61,0.25)", borderLeft: `14px solid ${TP.blue}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: TP.navy, letterSpacing: 0, whiteSpace: "nowrap" }}>{l.text}</span>
        </div>
      ) : null,
    )}
  </>
);

/** a counter / number board: title strip in blue, the big number in navy (it counts with a tick) */
export const Boards: React.FC<{ boards: BoardBox[]; t: number }> = ({ boards, t }) => (
  <>
    {boards.map((b, i) =>
      b.u > 0.001 ? (
        <div key={i} style={{ position: "absolute", left: b.x - b.w / 2, top: b.y - b.h / 2, width: b.w, height: b.h, transform: `scale(${OVERSHOOT(b.u)}) rotate(${0.8 * Math.sin(t * 2.4 + i)}deg)`, opacity: clamp(b.u * 3), background: "#ffffff", borderRadius: 28, overflow: "hidden", boxShadow: "0 14px 36px rgba(20,33,61,0.25)", display: "flex", flexDirection: "column" }}>
          <div style={{ background: TP.blue, color: "#ffffff", fontFamily: FONT, fontWeight: 800, fontSize: 40, padding: "10px 0", textAlign: "center", letterSpacing: 1 }}>{b.title}</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 118, color: TP.navy, letterSpacing: -2 }}>
            {b.value.split(/(\d+)/).map((seg, j) => (/^\d+$/.test(seg) ? <span key={j}>{seg}</span> : <span key={j} style={{ color: TP.orange }}>{seg}</span>))}
          </div>
          <div style={{ height: 10, background: TP.mint, width: `${40 + 60 * (0.5 + 0.5 * Math.sin(t * 2))}%` }} />
        </div>
      ) : null,
    )}
  </>
);
