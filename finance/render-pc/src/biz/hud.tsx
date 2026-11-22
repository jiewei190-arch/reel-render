// biz3d HUD: every word on screen is DOM (crisp at phone size), Poppins 800. Every position and size comes from the
// layout (layout.ts), so the same components serve portrait and landscape.
//   BizHook      top of the frame from frame 0: <= 5 words, <= 2 lines, *one word* in the red (or green) accent
//   BizCaptions  word captions in the fixed caption band; white with an ink stroke, the spoken word in gold
//   LabelLayer   callout line + label card (pop in one at a time)
//   TagLayer     chart tags (years / events) riding the chart points, green on rises, red on falls
//   Devices      the story devices: company card, THE DECISION, money counter, "worth today", board, stamp
import React from "react";
import { chunkWords } from "../fin/lib/captions";
import type { CapChunk } from "../fin/lib/captions";
import { EASE_OUT, OVERSHOOT, prog } from "../fin/lib/motion";
import type { DeviceBox, LabelBox, TagBox } from "./compile";
import { money } from "./compile";
import type { BizLayout } from "./layout";
import { BP } from "./palette";
import { MIN_SUB_PX, MIN_TEXT_PX, fitFs } from "../longform/polish";
import type { BizDevice, CompanyIcon, Tone } from "./types";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const FONT = "Poppins";
export const toneColor = (t: Tone) => (t === "green" ? BP.green : t === "red" ? BP.red : t === "gold" ? BP.gold : BP.navy);
/** text-safe tone shades (framing QA rule R4: >= 4.5:1 with white, both as text on white and as a fill under white text):
 *  green 5.0:1, red 5.6:1, gold 5.5:1. The bright tones stay for bars, borders, lines and the chart. */
export const TEXT_TONE = { green: "#15803D", red: "#C62828", gold: "#8A6212" } as const;
export const toneText = (t: Tone) => (t === "green" ? TEXT_TONE.green : t === "red" ? TEXT_TONE.red : t === "gold" ? TEXT_TONE.gold : BP.navy);
const SHADOW = "0 16px 44px rgba(8,12,24,0.38)";

/** split a hook into at most 2 balanced lines (an explicit "\n" wins) */
export const hookLines = (text: string): string[] => {
  if (text.includes("\n")) return text.split("\n").slice(0, 2);
  const w = text.trim().split(/\s+/);
  if (w.length <= 2 || text.replace(/\*/g, "").length <= 12) return [w.join(" ")];
  let best = 1, bd = Infinity;
  for (let k = 1; k < w.length; k++) { const d = Math.abs(w.slice(0, k).join(" ").length - w.slice(k).join(" ").length); if (d < bd) { bd = d; best = k; } }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
};
export const hookWidth = (L: BizLayout, text: string) => Math.max(...hookLines(text).map((l) => l.replace(/\*/g, "").length * 0.63 * L.hook.fs + 80));
export const BizHook: React.FC<{ L: BizLayout; text: string; t: number; t0?: number; until: number; tone?: "red" | "green" }> = ({ L, text, t, t0 = 0, until, tone = "red" }) => {
  if (t > until || t < t0) return null;
  const out = clamp((until - t) / 0.18);
  const tin = t0 > 0 ? EASE_OUT(prog(t, t0, t0 + 0.2)) : 1; // frame 0: fully on
  const breathe = 1 + 0.012 * Math.sin(t * 3.2);
  const acc = tone === "green" ? BP.green : BP.red;
  return (
    <div style={{ position: "absolute", left: L.hook.side, right: L.hook.side, top: L.hook.top, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${(0.85 + 0.15 * tin) * breathe})`, background: "rgba(255,255,255,0.97)", borderRadius: 30, padding: "16px 40px 22px", boxShadow: SHADOW, borderBottom: `10px solid ${acc}` }}>
        {hookLines(text).map((ln, i) => (
          <div key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.hook.fs, lineHeight: 1.04, color: BP.ink, textAlign: "center", whiteSpace: "nowrap", letterSpacing: -1 }}>
            {ln.split(/(\*[^*]+\*)/).map((seg, j) => (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2 ? (
              <span key={j} style={{ color: acc, display: "inline-block", transform: `translateY(${-4 * Math.abs(Math.sin(t * 4))}px) rotate(${-2 + 2 * Math.sin(t * 3)}deg)` }}>{seg.slice(1, -1)}</span>
            ) : <span key={j}>{seg}</span>))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const BizCaptions: React.FC<{ L: BizLayout; chunks: CapChunk[]; t: number; from?: number }> = ({ L, chunks, t, from }) => {
  if (t < (from ?? L.cap.from)) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  const size = L.cap.fs;
  return (
    <div style={{ position: "absolute", left: L.cap.side, right: L.cap.side, top: L.cap.centre - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {c.words.map((q, i) => {
        const on = t >= q.t - 2 / 30 && t < q.end + 0.05;
        const st = prog(t, q.t - 0.05, q.t + 0.07);
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: on ? BP.gold : "#ffffff", WebkitTextStroke: `14px ${BP.ink}`, paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,0.45)", transform: `scale(${0.92 + 0.08 * EASE_OUT(st) + (on ? 0.05 : 0)})`, display: "inline-block" }}>
            {q.w.replace(/[.,!?…:;]+$/, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
export const bizChunks = (words: readonly { w: string; t: number; end: number; turn?: number }[]) => chunkWords(words, 3);

export const LabelLayer: React.FC<{ L: BizLayout; labels: LabelBox[]; t: number }> = ({ L, labels, t }) => (
  <>
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      {labels.map((l) => {
        const ex = clamp(l.ax, l.x - l.w / 2, l.x + l.w / 2), ey = clamp(l.ay, l.y - l.h / 2, l.y + l.h / 2);
        const mx = l.ax + (ex - l.ax) * l.line, my = l.ay + (ey - l.ay) * l.line;
        const col = l.tone === "ink" ? BP.gold : toneColor(l.tone);
        return l.line > 0.01 ? (
          <g key={l.key}>
            <line x1={l.ax} y1={l.ay} x2={mx} y2={my} stroke="#000" strokeWidth={12} strokeLinecap="round" opacity={0.3} />
            <line x1={l.ax} y1={l.ay} x2={mx} y2={my} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
            <circle cx={l.ax} cy={l.ay} r={(12 + 3 * Math.sin(t * 8)) * Math.min(1, l.line * 2)} fill={col} stroke="#ffffff" strokeWidth={5} />
          </g>
        ) : null;
      })}
    </svg>
    {labels.map((l) => (l.u > 0.001 ? (
      <div key={l.key} style={{ position: "absolute", left: l.x - l.w / 2, top: l.y - l.h / 2, width: l.w, height: l.h, transform: `scale(${OVERSHOOT(l.u)})`, opacity: clamp(l.u * 3), background: "#ffffff", borderRadius: 20, boxShadow: SHADOW, borderLeft: `14px solid ${l.tone === "ink" ? BP.gold : toneColor(l.tone)}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: l.fs ?? L.label.fs, color: BP.ink, whiteSpace: "nowrap" }}>{l.text}</span>
      </div>
    ) : null))}
  </>
);

export const TagLayer: React.FC<{ L: BizLayout; tags: TagBox[] }> = ({ L, tags }) => (
  <>
    {tags.map((g) => (g.u > 0.001 ? (
      <div key={g.key} style={{ position: "absolute", left: g.x - g.w / 2, top: g.y - g.h / 2, width: g.w, height: g.h, transform: `scale(${OVERSHOOT(clamp(g.u))})`, background: toneText(g.tone), borderRadius: g.h / 2, border: "5px solid #ffffff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.tag.fs, color: "#ffffff", whiteSpace: "nowrap" }}>{g.text}</span>
      </div>
    ) : null))}
  </>
);

/** generic pictograms (never a logo): white strokes on the tone tile */
export const Icon: React.FC<{ k: CompanyIcon; size: number; t: number }> = ({ k, size, t }) => {
  const s = { fill: "none", stroke: "#ffffff", strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const body = (() => {
    switch (k) {
      case "film": return <><rect x={14} y={24} width={72} height={52} rx={6} {...s} />{[30, 50, 70].map((x) => <circle key={x} cx={x} cy={50} r={6} {...s} />)}<path d="M14 36h72M14 64h72" {...s} /></>;
      case "mail": return <><rect x={12} y={26} width={76} height={50} rx={6} {...s} /><path d="M12 30l38 26 38-26" {...s} /></>;
      case "store": return <><path d="M14 40l8-18h56l8 18z" {...s} /><path d="M20 40v38h60V40" {...s} /><rect x={42} y={56} width={16} height={22} {...s} /></>;
      case "tower": return <><rect x={30} y={14} width={40} height={72} rx={3} {...s} />{[28, 42, 56, 70].map((y) => <path key={y} d={`M40 ${y}h6M54 ${y}h6`} {...s} />)}</>;
      case "rocket": return <><path d="M50 12c14 12 18 30 14 50H36c-4-20 0-38 14-50z" {...s} /><path d="M36 62l-10 14h48l-10-14" {...s} /><circle cx={50} cy={38} r={7} {...s} /></>;
      case "cart": return <><path d="M12 22h12l10 40h44l8-28H30" {...s} /><circle cx={40} cy={76} r={6} {...s} /><circle cx={72} cy={76} r={6} {...s} /></>;
      case "chip": return <><rect x={28} y={28} width={44} height={44} rx={5} {...s} />{[38, 50, 62].map((v) => <path key={v} d={`M${v} 14v14M${v} 72v14M14 ${v}h14M72 ${v}h14`} {...s} />)}</>;
      case "phone": return <><rect x={32} y={12} width={36} height={76} rx={8} {...s} /><path d="M44 78h12" {...s} /></>;
      case "camera": return <><rect x={12} y={30} width={76} height={50} rx={8} {...s} /><circle cx={50} cy={55} r={14} {...s} /><path d="M34 30l6-10h20l6 10" {...s} /></>;
      case "bank": return <><path d="M12 38l38-22 38 22z" {...s} />{[24, 42, 58, 76].map((x) => <path key={x} d={`M${x} 44v28`} {...s} />)}<path d="M12 80h76" {...s} /></>;
    }
  })();
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${2 * Math.sin(t * 2)}deg)` }}>{body}</svg>;
};

const Company: React.FC<{ L: BizLayout; d: DeviceBox; t: number }> = ({ L, d, t }) => {
  const sp = d.spec as Extract<BizDevice, { do: "company" }>;
  const col = d.tone === "ink" ? BP.slate : toneColor(d.tone);
  const tile = d.h - 60;
  const nameFs = d.fs?.name ?? Math.min(L.company.nameFs, (d.w - tile - 110) / Math.max(1, sp.name.length * 0.68));
  return (
    <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)}) rotate(${0.6 * Math.sin(t * 2)}deg)`, opacity: clamp(d.u * 3), background: "#ffffff", borderRadius: 30, boxShadow: SHADOW, display: "flex", alignItems: "center", gap: 30, padding: "0 34px", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: tile, height: tile, borderRadius: 26, background: col, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon k={sp.icon ?? "store"} size={tile * 0.8} t={t} /></div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: nameFs, color: BP.ink, lineHeight: 1, letterSpacing: -1, whiteSpace: "nowrap" }}>{sp.name.toUpperCase()}</div>
        {sp.year !== undefined ? <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.company.yearFs, color: d.tone === "ink" ? col : toneText(d.tone), marginTop: 10, letterSpacing: 2 }}>FOUNDED {sp.year}</div> : null}
        {sp.tagline ? <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.tagline ?? L.company.yearFs * 0.8, color: BP.slate, marginTop: 4, whiteSpace: "nowrap" }}>{sp.tagline.toUpperCase()}</div> : null}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 12, width: `${100 * EASE_OUT(clamp(d.tau / 0.6))}%`, background: col }} />
    </div>
  );
};
const Decision: React.FC<{ L: BizLayout; d: DeviceBox; t: number }> = ({ L, d, t }) => {
  const sp = d.spec as Extract<BizDevice, { do: "decision" }>;
  const bar = L.decision.bar * EASE_OUT(clamp(d.tau / 0.18)) * clamp(d.u * 2);
  const slam = 1.6 - 0.6 * EASE_OUT(clamp(d.tau / 0.18));
  const brk = 70, m = 70;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "#05070c" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "#05070c" }} />
      {/* viewfinder brackets + a pause mark: the moment is frozen */}
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: clamp(d.u * 2) }}>
        {[[m, bar + m, 1, 1], [L.W - m, bar + m, -1, 1], [m, L.H - bar - m, 1, -1], [L.W - m, L.H - bar - m, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M${x} ${y + sy * brk}V${y}H${x + sx * brk}`} fill="none" stroke="#ffffff" strokeWidth={8} opacity={0.9} />)}
        <g transform={`translate(${m + 10}, ${bar + m + 100})`} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 4))}><rect width={16} height={52} fill="#fff" /><rect x={28} width={16} height={52} fill="#fff" /></g>
      </svg>
      <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${slam}) rotate(${-2 + 0.5 * Math.sin(t * 3)}deg)`, opacity: clamp(d.u * 3) }}>
        <div style={{ background: TEXT_TONE.red, padding: "10px 42px 18px", borderRadius: 18, boxShadow: SHADOW, fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.text ?? L.decision.fs, color: "#ffffff", lineHeight: 1, letterSpacing: -2, whiteSpace: "nowrap" }}>{(sp.text ?? "THE DECISION").toUpperCase()}</div>
        {sp.sub ? <div style={{ marginTop: 22, background: "#ffffff", padding: "8px 28px", borderRadius: 14, fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.sub ?? L.decision.subFs, color: BP.ink, whiteSpace: "nowrap", opacity: clamp((d.tau - 0.2) / 0.15) }}>{sp.sub.toUpperCase()}</div> : null}
      </div>
    </>
  );
};
const Counter: React.FC<{ L: BizLayout; d: DeviceBox; t: number }> = ({ L, d, t }) => {
  const sp = d.spec as Extract<BizDevice, { do: "counter" }>;
  const col = toneColor(d.tone);
  const down = sp.to < sp.from;
  const shake = down ? 3 * Math.sin(t * 50) * clamp(1 - Math.abs((d.frac ?? 0) - 0.5) * 2) : 0;
  return (
    <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)}) translateX(${shake}px)`, opacity: clamp(d.u * 3), background: "rgba(10,14,26,0.94)", borderRadius: 30, boxShadow: SHADOW, overflow: "hidden", display: "flex", flexDirection: "column", border: `4px solid ${col}` }}>
      <div style={{ background: toneText(d.tone), color: "#ffffff", fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.title ?? L.counter.titleFs, padding: "10px 0", textAlign: "center", letterSpacing: 2, whiteSpace: "nowrap" }}>{sp.title.toUpperCase()}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.counter.fs * 0.5, color: col }}>{down ? "▼" : "▲"}</span>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.value ?? L.counter.fs, color: "#ffffff", letterSpacing: -3, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{d.value}</span>
      </div>
      <div style={{ height: 22, margin: "0 30px 26px", background: "rgba(255,255,255,0.12)", borderRadius: 11, overflow: "hidden" }}><div style={{ height: "100%", width: `${100 * clamp(d.frac ?? 0)}%`, background: col, borderRadius: 11 }} /></div>
    </div>
  );
};
const Worth: React.FC<{ L: BizLayout; d: DeviceBox; t: number }> = ({ L, d, t }) => {
  const sp = d.spec as Extract<BizDevice, { do: "worth" }>;
  const f = d.frac ?? 0, W = d.w - 80;
  const aw = Math.max(14, W * (sp.a.value / sp.b.value)); // the small one is a sliver: that is the point
  const bv = sp.b.value * Math.max(0.0001, f);
  const vfs = d.fs?.worth ?? L.worth.fs;
  const row = (label: string, text: string, w: number, col: string, k: number) => (
    <div style={{ marginTop: k ? 34 : 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.worth.labelFs, color: BP.slate, letterSpacing: 1, whiteSpace: "nowrap" }}>{label.toUpperCase()}</span>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: vfs, whiteSpace: "nowrap", color: col === BP.red ? TEXT_TONE.red : col === BP.green ? TEXT_TONE.green : col, letterSpacing: -2, fontVariantNumeric: "tabular-nums" }}>{text}</span>
      </div>
      <div style={{ height: 54, background: "#eef0f4", borderRadius: 14, marginTop: 8, overflow: "hidden" }}><div style={{ height: "100%", width: w, background: col, borderRadius: 14 }} /></div>
    </div>
  );
  const pop = clamp((f - 0.95) / 0.05);
  return (
    <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)})`, opacity: clamp(d.u * 3), background: "#ffffff", borderRadius: 32, boxShadow: SHADOW, padding: "34px 40px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.label ?? L.worth.labelFs * 1.1, color: BP.ink, letterSpacing: 2, marginBottom: 22, whiteSpace: "nowrap" }}>WHAT IT'S WORTH TODAY</div>
      {row(sp.a.label, sp.a.text ?? money(sp.a.value), aw, BP.red, 0)}
      {row(sp.b.label, f >= 0.999 && sp.b.text ? sp.b.text : money(bv), Math.max(aw, W * f), BP.green, 1)}
      {sp.multiple !== false && pop > 0 ? (
        <div style={{ position: "absolute", right: 30, bottom: -46, transform: `scale(${OVERSHOOT(pop)}) rotate(${-6 + Math.sin(t * 3)}deg)`, background: BP.gold, color: BP.ink, fontFamily: FONT, fontWeight: 800, fontSize: L.worth.fs * 0.8, padding: "6px 26px", borderRadius: 20, boxShadow: SHADOW }}>{d.value}</div>
      ) : null}
    </div>
  );
};
/** the board's title and value font sizes, measured (src/longform/polish.ts): both shrink to fit the board's width (the
 *  compiler passes the sizes for the widest value a counting board shows as d.fs, so the size never jumps mid-count) */
export const boardFonts = (L: BizLayout, sp: { size?: "giant"; title?: string }, value: string) => {
  const g = sp.size === "giant" ? L.board.giant : null;
  const w = g ? g.w : L.board.w;
  return { title: fitFs(String(sp.title ?? "").toUpperCase(), g ? g.titleFs : L.board.titleFs, w - 20, 1, MIN_SUB_PX).fs, value: fitFs(value, g ? g.valueFs : L.board.valueFs, w - 40, -2, MIN_TEXT_PX).fs };
};
const Board: React.FC<{ L: BizLayout; d: DeviceBox; t: number }> = ({ L, d, t }) => {
  const sp = d.spec as Extract<BizDevice, { do: "board" }>;
  const col = d.tone === "ink" ? BP.slate : toneColor(d.tone);
  const fs = d.fs?.value !== undefined ? { title: d.fs.title, value: d.fs.value } : boardFonts(L, sp, d.value ?? "");
  return (
    <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)}) rotate(${(sp.size === "giant" ? 0.4 : 0.8) * Math.sin(t * 2.4)}deg)`, opacity: clamp(d.u * 3), background: "#ffffff", borderRadius: 28, overflow: "hidden", boxShadow: SHADOW, display: "flex", flexDirection: "column" }}>
      <div style={{ background: d.tone === "ink" ? col : toneText(d.tone), color: "#ffffff", fontFamily: FONT, fontWeight: 800, fontSize: fs.title, padding: "10px 0", textAlign: "center", letterSpacing: 1, whiteSpace: "nowrap" }}>{sp.title.toUpperCase()}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: fs.value, color: BP.ink, letterSpacing: -2, whiteSpace: "nowrap" }}>{d.value}</div>
    </div>
  );
};
const Stamp: React.FC<{ L: BizLayout; d: DeviceBox; t: number }> = ({ L, d }) => {
  const sp = d.spec as Extract<BizDevice, { do: "stamp" }>;
  const col = toneColor(d.tone);
  const k = 2.0 - 1.0 * EASE_OUT(clamp(d.tau / 0.16));
  return (
    <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k}) rotate(-9deg)`, opacity: clamp(d.u * 3) * (d.tau < 0 ? 0 : 1) }}>
      <div style={{ border: `14px solid ${col}`, borderRadius: 24, padding: "4px 40px 10px", fontFamily: FONT, fontWeight: 800, fontSize: d.fs?.text ?? L.decision.fs * 0.85, color: toneText(d.tone), letterSpacing: 4, background: "rgba(255,255,255,0.88)", boxShadow: SHADOW, whiteSpace: "nowrap" }}>{sp.text.toUpperCase()}</div>
    </div>
  );
};
export const Devices: React.FC<{ L: BizLayout; devices: DeviceBox[]; t: number }> = ({ L, devices, t }) => (
  <>
    {devices.map((d) => {
      if (d.u <= 0.001 && d.kind !== "decision") return null;
      switch (d.kind) {
        case "company": return <Company key={d.key} L={L} d={d} t={t} />;
        case "decision": return <Decision key={d.key} L={L} d={d} t={t} />;
        case "counter": return <Counter key={d.key} L={L} d={d} t={t} />;
        case "worth": return <Worth key={d.key} L={L} d={d} t={t} />;
        case "board": return <Board key={d.key} L={L} d={d} t={t} />;
        case "stamp": return <Stamp key={d.key} L={L} d={d} t={t} />;
      }
    })}
  </>
);
