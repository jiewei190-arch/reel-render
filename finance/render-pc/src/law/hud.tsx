// law3d HUD (DOM overlay, Poppins 800, cream on deep navy, ONE gold accent). Every position and size comes from the
// format's layout (src/law/layout.ts), so the same HUD serves portrait and landscape.
//   LawHook      top of the frame, <= 2 lines, *one word* in gold; on screen and readable at frame 0
//   LawCaptions  word captions in the caption band; the spoken word in gold
//   Devices      the case-file card, EXHIBIT tags (with a line to the exhibit), the verdict stamp, the dollar counter
import React from "react";
import { chunkWords } from "../fin/lib/captions";
import type { CapChunk } from "../fin/lib/captions";
import { EASE_OUT, OVERSHOOT, prog } from "../fin/lib/motion";
import type { DeviceBox } from "./compile";
import type { LawLayout } from "./layout";
import { LP } from "./palette";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const FONT = "Poppins";
const CARD_BG = "rgba(11,20,38,0.92)";
const SHADOW = "0 18px 46px rgba(0,0,0,0.55)";

/** split a hook into at most 2 balanced lines (an explicit "\n" wins). `oneLine` (landscape only): the most characters
 *  that still fit on one line; a hook that short stays on one line */
export const hookLines = (text: string, oneLine?: number): string[] => {
  if (text.includes("\n")) return text.split("\n").slice(0, 2);
  const w = text.trim().split(/\s+/);
  if (oneLine !== undefined && text.replace(/\*/g, "").trim().length <= oneLine) return [w.join(" ")];
  if (w.length <= 2 || text.replace(/\*/g, "").length <= 12) return [w.join(" ")];
  let best = 1, bd = Infinity;
  for (let k = 1; k < w.length; k++) { const d = Math.abs(w.slice(0, k).join(" ").length - w.slice(k).join(" ").length); if (d < bd) { bd = d; best = k; } }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
};
/** the hook card's box (the gate uses it) */
/** landscape: how many characters fit on one hook line (portrait: undefined, the Shorts 2-line rule) */
export const hookOneLine = (L: LawLayout) => (L.id === "landscape" ? Math.floor((L.hookMaxW - 80) / (0.63 * L.hookFs)) : undefined);
export const hookBox = (L: LawLayout, text: string) => {
  const lines = hookLines(text, hookOneLine(L));
  const w = Math.max(...lines.map((l) => l.replace(/\*/g, "").length * 0.63 * L.hookFs + 80));
  const h = lines.length * L.hookFs * 1.04 + 54;
  return { x: L.W / 2, y: L.hookTop + h / 2, w: w + 80, h, textW: w, lines };
};
const Gold: React.FC<{ seg: string; t: number }> = ({ seg, t }) => (
  <span style={{ color: LP.gold, display: "inline-block", textShadow: `0 0 26px rgba(232,180,74,0.55)`, transform: `translateY(${-3 * Math.abs(Math.sin(t * 4))}px) rotate(${-1.5 + 1.5 * Math.sin(t * 3)}deg)` }}>{seg}</span>
);
export const LawHook: React.FC<{ L: LawLayout; text: string; t: number; t0?: number; until: number }> = ({ L, text, t, t0 = 0, until }) => {
  if (t > until || t < t0) return null;
  const out = clamp((until - t) / 0.18);
  const tin = t0 > 0 ? EASE_OUT(prog(t, t0, t0 + 0.2)) : 1; // frame 0: fully on; the loop repeat pops in
  const lines = hookLines(text, hookOneLine(L));
  const breathe = 1 + 0.01 * Math.sin(t * 3.2);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: L.hookTop, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${(0.85 + 0.15 * tin) * breathe})`, background: CARD_BG, borderRadius: 26, padding: "16px 38px 22px", boxShadow: SHADOW, border: `3px solid rgba(232,180,74,0.55)`, borderBottom: `10px solid ${LP.gold}` }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.hookFs, lineHeight: 1.04, color: LP.cream, textAlign: "center", whiteSpace: "nowrap", letterSpacing: -1 }}>
            {ln.split(/(\*[^*]+\*)/).map((seg, j) => (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2 ? <Gold key={j} seg={seg.slice(1, -1)} t={t} /> : <span key={j}>{seg}</span>))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LawCaptions: React.FC<{ L: LawLayout; chunks: CapChunk[]; t: number; from?: number }> = ({ L, chunks, t, from = 1.0 }) => {
  if (t < from) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  const size = L.capFs;
  return (
    <div style={{ position: "absolute", left: L.capSide, right: L.capSide, top: L.capCentre - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {c.words.map((q, i) => {
        const on = t >= q.t - 2 / 30 && t < q.end + 0.05;
        const st = prog(t, q.t - 0.05, q.t + 0.07);
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: on ? LP.gold : LP.cream, WebkitTextStroke: `14px ${LP.bg}`, paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,0.6)", transform: `scale(${0.92 + 0.08 * EASE_OUT(st) + (on ? 0.05 : 0)})`, display: "inline-block" }}>
            {q.w.replace(/[.,!?…:;"]+$/, "").replace(/^"/, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
export const lawChunks = (words: readonly { w: string; t: number; end: number; turn?: number }[]) => chunkWords(words, 3);

const goldDigits = (v: string) => v.split(/([^\d,.]+)/).map((seg, j) => (/^[\d,.]+$/.test(seg) ? <span key={j}>{seg}</span> : <span key={j} style={{ color: LP.gold }}>{seg}</span>));

const Exhibit: React.FC<{ d: DeviceBox; L: LawLayout; t: number }> = ({ d, L, t }) => (
  <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)}) rotate(${-2 + 0.6 * Math.sin(t * 2.1)}deg)`, opacity: clamp(d.u * 3), background: CARD_BG, borderRadius: 18, boxShadow: SHADOW, border: `4px solid ${LP.gold}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
    <div style={{ background: LP.gold, color: LP.bg, fontFamily: FONT, fontWeight: 800, fontSize: L.exhibitLabelFs ?? 34, letterSpacing: 4, padding: "2px 22px", borderRadius: 8, marginTop: -6, marginBottom: 6 }}>{d.label}</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.exhibitFs, color: LP.cream, whiteSpace: "nowrap", lineHeight: 1.1 }}>{d.text}</div>
  </div>
);
const Verdict: React.FC<{ d: DeviceBox; L: LawLayout; t: number }> = ({ d, L, t }) => {
  // a stamp: slams down from 2.4x in 0.12 s, a squash, a little ink shake, then holds and breathes
  const slam = d.age < 0 ? 2.4 : d.age < 0.12 ? 2.4 - 1.5 * EASE_OUT(d.age / 0.12) : d.age < 0.22 ? 0.9 + 0.1 * EASE_OUT((d.age - 0.12) / 0.1) : 1 + 0.01 * Math.sin(t * 3);
  const shake = d.age > 0.12 && d.age < 0.35 ? 4 * Math.sin(d.age * 90) * (1 - (d.age - 0.12) / 0.23) : 0;
  return (
    <div style={{ position: "absolute", left: d.x - L.verdict.maxW / 2, width: L.verdict.maxW, top: d.y - d.h / 2, height: d.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: clamp(d.u * 4) * clamp((d.age + 0.07) / 0.05) }}>
      <div style={{ transform: `translate(${shake}px, 0) scale(${slam}) rotate(-7deg)`, border: `12px solid ${LP.gold}`, borderRadius: 20, padding: "0 40px", background: "rgba(11,20,38,0.72)", boxShadow: `0 0 60px rgba(232,180,74,0.35), ${SHADOW}` }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.verdict.fs, lineHeight: 1.12, color: LP.gold, letterSpacing: 6, whiteSpace: "nowrap", textShadow: "0 6px 0 rgba(0,0,0,0.35)" }}>{d.text}</div>
      </div>
      {d.sub ? <div style={{ marginTop: 34, fontFamily: FONT, fontWeight: 800, fontSize: 64, color: LP.cream, WebkitTextStroke: `12px ${LP.bg}`, paintOrder: "stroke fill", opacity: clamp((d.age - 0.25) / 0.2), transform: `translateY(${(1 - EASE_OUT(clamp((d.age - 0.25) / 0.25))) * 20}px)`, whiteSpace: "nowrap" }}>{goldDigits(d.sub)}</div> : null}
    </div>
  );
};
const CaseCard: React.FC<{ d: DeviceBox; L: LawLayout; t: number }> = ({ d, t }) => {
  const slide = 1 - EASE_OUT(clamp(d.age / 0.3));
  return (
    <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `translateY(${slide * 120}px) rotate(${-1.5 + 0.4 * Math.sin(t * 1.7)}deg) scale(${0.96 + 0.04 * clamp(d.u)})`, opacity: clamp(d.u * 3) }}>
      {/* the folder tab */}
      <div style={{ position: "absolute", left: 36, top: -46, width: 290, height: 60, background: "#C9A15C", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: LP.bg, letterSpacing: 3 }}>CASE FILE</div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#D9B46C,#C59A52)", borderRadius: 18, boxShadow: SHADOW, padding: 26, boxSizing: "border-box" }}>
        <div style={{ height: "100%", background: LP.paper, borderRadius: 8, border: `3px solid ${LP.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", padding: "0 20px" }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: Math.min(92, (d.w - 120) / Math.max(6, (d.title ?? "").length * 0.62)), color: LP.ink, whiteSpace: "nowrap", letterSpacing: -1 }}>{d.title}</div>
          <div style={{ height: 6, width: "70%", background: LP.goldDeep, margin: "12px 0 14px", borderRadius: 3 }} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: LP.ink, opacity: 0.85, whiteSpace: "nowrap" }}>{[d.year, d.place].filter(Boolean).join("  ·  ")}</div>
          {d.note ? <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 700, fontSize: 36, color: LP.ink, opacity: 0.7 }}>{d.note}</div> : null}
        </div>
      </div>
    </div>
  );
};
const Counter: React.FC<{ d: DeviceBox; L: LawLayout; t: number }> = ({ d, L, t }) => (
  <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)}) rotate(${0.7 * Math.sin(t * 2.4)}deg)`, opacity: clamp(d.u * 3), background: CARD_BG, borderRadius: 24, overflow: "hidden", boxShadow: SHADOW, border: `3px solid rgba(232,180,74,0.6)`, display: "flex", flexDirection: "column" }}>
    <div style={{ background: LP.gold, color: LP.bg, fontFamily: FONT, fontWeight: 800, fontSize: L.board.fsTitle, padding: "8px 0", textAlign: "center", letterSpacing: 2 }}>{d.title}</div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: Math.min(L.board.fsValue, (d.w - 40) / Math.max(3, (d.value ?? "").length * 0.6)), color: LP.cream, letterSpacing: -2, whiteSpace: "nowrap", transform: `scale(${1 + 0.15 * Math.sin(Math.PI * clamp(d.zero ?? 0))})` }}>{goldDigits(d.value ?? "")}</div>
  </div>
);

export const Devices: React.FC<{ L: LawLayout; ds: DeviceBox[]; t: number }> = ({ L, ds, t }) => (
  <>
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      {ds.filter((d) => d.kind === "exhibit" && d.ax !== undefined && (d.line ?? 0) > 0.01).map((d) => {
        const ex = clamp(d.ax!, d.x - d.w / 2, d.x + d.w / 2), ey = clamp(d.ay!, d.y - d.h / 2, d.y + d.h / 2);
        const mx = d.ax! + (ex - d.ax!) * d.line!, my = d.ay! + (ey - d.ay!) * d.line!;
        return (
          <g key={d.key}>
            <line x1={d.ax} y1={d.ay} x2={mx} y2={my} stroke="#000" strokeWidth={12} strokeLinecap="round" opacity={0.35} />
            <line x1={d.ax} y1={d.ay} x2={mx} y2={my} stroke={LP.gold} strokeWidth={6} strokeLinecap="round" />
            <circle cx={d.ax} cy={d.ay} r={(12 + 3 * Math.sin(t * 8)) * Math.min(1, d.line! * 2)} fill={LP.gold} stroke={LP.bg} strokeWidth={5} />
          </g>
        );
      })}
    </svg>
    {ds.map((d) => {
      if (d.u <= 0.001) return null;
      if (d.kind === "exhibit") return <Exhibit key={d.key} d={d} L={L} t={t} />;
      if (d.kind === "verdict") return <Verdict key={d.key} d={d} L={L} t={t} />;
      if (d.kind === "caseCard") return <CaseCard key={d.key} d={d} L={L} t={t} />;
      if (d.kind === "counter") return <Counter key={d.key} d={d} L={L} t={t} />;
      return null;
    })}
  </>
);
