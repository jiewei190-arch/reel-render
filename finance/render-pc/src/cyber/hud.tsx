// cyber3d HUD (DOM overlay, Poppins 800, sized from src/cyber/layout.ts): dark glass cards, neon cyan / magenta, ONE
// red for alerts and money leaving.
//   CyberHook      top of the frame, <= 2 lines, *one word* in neon cyan; readable at frame 0
//   CyberCaptions  bottom word captions (white, thick black stroke; the spoken word in cyan)
//   LabelLayer     callout lines + label cards (one at a time)
//   Boards         number boards
//   Devices        the story devices: CASE FILE card, money counter, HOW TO SPOT IT checklist, countdown, ALERT banner
//   GlitchBars     the transition glitch (subtle slices, low opacity) and AlertWash (a soft red edge, one pulse)
// Safety: nothing here flashes the full frame. Alerts are a single red edge fade (<= 0.32 opacity) and glitches are
// 0.22 s of low-opacity tinted slices; the build gate caps them (no more than 2 events in any second).
import React from "react";
import { chunkWords } from "../fin/lib/captions";
import type { CapChunk } from "../fin/lib/captions";
import { EASE_OUT, OVERSHOOT, prog } from "../fin/lib/motion";
import type { BoardBox, DeviceBox, LabelBox } from "./compile";
import type { Layout } from "./layout";
import { CP } from "./palette";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const FONT = "Poppins";
const GLASS = "rgba(6,10,20,0.88)";
const glow = (c: string, r = 18) => `0 0 ${r}px ${c}`;

/** split a hook into at most 2 balanced lines (an explicit "\n" wins) */
export const hookLines = (text: string): string[] => {
  if (text.includes("\n")) return text.split("\n").slice(0, 2);
  const w = text.trim().split(/\s+/);
  if (w.length <= 2 || text.replace(/\*/g, "").length <= 12) return [w.join(" ")];
  let best = 1, bd = Infinity;
  for (let k = 1; k < w.length; k++) { const d = Math.abs(w.slice(0, k).join(" ").length - w.slice(k).join(" ").length); if (d < bd) { bd = d; best = k; } }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
};
/** the hook card's box (the gate uses it too) */
export const hookBox = (text: string, L: Layout) => {
  const lines = hookLines(text);
  const w = Math.max(...lines.map((l) => l.replace(/\*/g, "").length * 0.63 * L.hook.fs + 80 * L.k));
  const h = lines.length * L.hook.fs * 1.04 + 52 * L.k;
  return { x: L.W / 2, y: L.hook.top + h / 2, w: w + 80 * L.k, h, lines, textW: w };
};
export const CyberHook: React.FC<{ text: string; t: number; t0?: number; until: number; L: Layout; g?: number }> = ({ text, t, t0 = 0, until, L, g = 0 }) => {
  if (t > until || t < t0) return null;
  const out = clamp((until - t) / 0.18);
  const tin = t0 > 0 ? EASE_OUT(prog(t, t0, t0 + 0.2)) : 1;
  const lines = hookLines(text);
  const breathe = 1 + 0.01 * Math.sin(t * 3.0);
  const split = 3 + 10 * g;
  return (
    <div style={{ position: "absolute", left: L.hook.side, right: L.hook.side, top: L.hook.top, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${(0.85 + 0.15 * tin) * breathe})`, background: GLASS, borderRadius: 18 * L.k, padding: `${16 * L.k}px ${40 * L.k}px ${22 * L.k}px`, boxShadow: `0 0 0 3px ${CP.cyan}55, 0 18px 50px rgba(0,0,0,0.6)`, borderBottom: `${10 * L.k}px solid ${CP.magenta}` }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.hook.fs, lineHeight: 1.04, color: CP.white, textAlign: "center", whiteSpace: "nowrap", letterSpacing: -1, textShadow: `${-split * 0.3}px 0 ${CP.magenta}88, ${split * 0.3}px 0 ${CP.cyan}88` }}>
            {ln.split(/(\*[^*]+\*)/).map((seg, j) =>
              seg.startsWith("*") && seg.endsWith("*") && seg.length > 2 ? (
                <span key={j} style={{ color: CP.cyan, display: "inline-block", textShadow: glow(CP.cyan, 22), transform: `translateY(${-3 * Math.abs(Math.sin(t * 3.6))}px)` }}>{seg.slice(1, -1)}</span>
              ) : <span key={j}>{seg}</span>,
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CyberCaptions: React.FC<{ chunks: CapChunk[]; t: number; L: Layout; from?: number }> = ({ chunks, t, L, from }) => {
  if (t < (from ?? L.cap.from)) return null;
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.hold);
  if (!c) return null;
  const enter = EASE_OUT(prog(t, c.start - 0.05, c.start + 0.1));
  const size = L.cap.fs;
  return (
    <div style={{ position: "absolute", left: L.cap.side, right: L.cap.side, top: L.cap.centre - 120 * L.k, height: 240 * L.k, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.28, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {c.words.map((q, i) => {
        const on = t >= q.t - 2 / 30 && t < q.end + 0.05;
        const st = prog(t, q.t - 0.05, q.t + 0.07);
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: on ? CP.cyan : CP.white, WebkitTextStroke: `${14 * L.k}px #000000`, paintOrder: "stroke fill", textShadow: on ? `${glow(CP.cyan, 26)}, 0 8px 22px rgba(0,0,0,0.6)` : "0 8px 22px rgba(0,0,0,0.6)", transform: `scale(${0.92 + 0.08 * EASE_OUT(st) + (on ? 0.05 : 0)})`, display: "inline-block" }}>
            {q.w.replace(/[.,!?…:;]+$/, "").toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};
export const cyberChunks = (words: readonly { w: string; t: number; end: number; turn?: number }[]) => chunkWords(words, 3);

export const LabelLayer: React.FC<{ labels: LabelBox[]; t: number; L: Layout }> = ({ labels, t, L }) => (
  <>
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      {labels.map((l) => {
        const c = l.tone === "red" ? CP.red : CP.cyan;
        const ex = clamp(l.ax, l.x - l.w / 2, l.x + l.w / 2), ey = clamp(l.ay, l.y - l.h / 2, l.y + l.h / 2);
        const mx = l.ax + (ex - l.ax) * l.line, my = l.ay + (ey - l.ay) * l.line;
        const r = (11 + 2 * Math.sin(t * 5)) * L.k;
        return l.line > 0.01 ? (
          <g key={l.key}>
            <line x1={l.ax} y1={l.ay} x2={mx} y2={my} stroke="#000" strokeWidth={11 * L.k} strokeLinecap="round" opacity={0.5} />
            <line x1={l.ax} y1={l.ay} x2={mx} y2={my} stroke={c} strokeWidth={5 * L.k} strokeLinecap="round" />
            <circle cx={l.ax} cy={l.ay} r={r * Math.min(1, l.line * 2)} fill="#000" stroke={c} strokeWidth={5 * L.k} />
          </g>
        ) : null;
      })}
    </svg>
    {labels.map((l) => {
      const c = l.tone === "red" ? CP.red : CP.cyan;
      return l.u > 0.001 ? (
        <div key={l.key} style={{ position: "absolute", left: l.x - l.w / 2, top: l.y - l.h / 2, width: l.w, height: l.h, transform: `scale(${OVERSHOOT(l.u)})`, opacity: clamp(l.u * 3), background: GLASS, borderRadius: 12 * L.k, boxShadow: `0 0 0 2px ${c}AA, 0 0 26px ${c}55`, borderLeft: `${12 * L.k}px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: L.label.fs, color: CP.white, whiteSpace: "nowrap" }}>{l.text}</span>
        </div>
      ) : null;
    })}
  </>
);

const TONE = { cyan: CP.cyan, magenta: CP.magenta, red: CP.red } as const;
export const Boards: React.FC<{ boards: BoardBox[]; t: number; L: Layout }> = ({ boards, t, L }) => (
  <>
    {boards.map((b, i) => {
      const c = TONE[b.tone];
      return b.u > 0.001 ? (
        <div key={i} style={{ position: "absolute", left: b.x - b.w / 2, top: b.y - b.h / 2, width: b.w, height: b.h, transform: `scale(${OVERSHOOT(b.u)})`, opacity: clamp(b.u * 3), background: GLASS, borderRadius: 16 * L.k, overflow: "hidden", boxShadow: `0 0 0 3px ${c}99, 0 0 34px ${c}44`, display: "flex", flexDirection: "column" }}>
          <div style={{ background: c, color: "#000", fontFamily: FONT, fontWeight: 800, fontSize: 38 * L.k, padding: `${8 * L.k}px 0`, textAlign: "center", letterSpacing: 2 }}>{b.title}</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 112 * L.k, color: CP.white, letterSpacing: -2, textShadow: glow(c, 20) }}>
            {b.value.split(/(\d[\d,.]*)/).map((seg, j) => (/^\d/.test(seg) ? <span key={j}>{seg}</span> : <span key={j} style={{ color: c }}>{seg}</span>))}
          </div>
          <div style={{ height: 8 * L.k, background: c, width: `${30 + 70 * (0.5 + 0.5 * Math.sin(t * 1.6 + i))}%` }} />
        </div>
      ) : null;
    })}
  </>
);

/** text typed out over `dur` s (a terminal reveal) */
const typed = (s: string, tau: number, t0: number, dur: number) => s.slice(0, Math.round(s.length * clamp((tau - t0) / dur)));
const Card: React.FC<{ d: { x: number; y: number; w: number; h: number; u: number }; L: Layout; edge: string; children: React.ReactNode; tilt?: number }> = ({ d, L, edge, children, tilt = 0 }) => (
  <div style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `scale(${OVERSHOOT(d.u)}) rotate(${tilt}deg)`, opacity: clamp(d.u * 3), background: GLASS, borderRadius: 20 * L.k, boxShadow: `0 0 0 3px ${edge}AA, 0 0 50px ${edge}44, 0 24px 60px rgba(0,0,0,0.7)`, boxSizing: "border-box", padding: `${28 * L.k}px ${40 * L.k}px`, overflow: "hidden", fontFamily: FONT, fontWeight: 800, color: CP.white }}>
    {/* faint scanlines inside every card */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(25,230,255,0.05) 0 2px, transparent 2px 6px)" }} />
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);

export const Devices: React.FC<{ devices: DeviceBox[]; t: number; L: Layout }> = ({ devices, t, L }) => (
  <>
    {devices.map((d, i) => {
      if (d.u <= 0.001) return null;
      const k = L.k;
      switch (d.kind) {
        case "case": {
          const stamp = clamp((d.tau - 1.0) / 0.18);
          const row = (lab: string, val: string, n: number, color: string = CP.white) => (
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 * k, marginTop: 18 * k }}>
              <span style={{ fontSize: 34 * k, color: CP.dim, width: 230 * k, letterSpacing: 2 }}>{lab}</span>
              <span style={{ fontSize: 64 * k, color, letterSpacing: -1, textShadow: color === CP.red ? glow(CP.red, 18) : "none", whiteSpace: "nowrap" }}>{typed(val, d.tau, 0.15 + n * 0.22, 0.32)}</span>
            </div>
          );
          return (
            <Card key={i} d={d} L={L} edge={CP.cyan} tilt={-1 + 0.4 * Math.sin(t * 1.2)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `4px solid ${CP.cyan}66`, paddingBottom: 12 * k }}>
                <span style={{ fontSize: 58 * k, letterSpacing: 6, color: CP.cyan, textShadow: glow(CP.cyan, 16) }}>{d.title}</span>
                <span style={{ fontSize: 30 * k, color: CP.dim }}>#{(Math.abs(d.name.length * 7919) % 9000) + 1000}</span>
              </div>
              {row("NAME", d.name, 0)}
              {row("YEARS", d.year, 1)}
              {row("STOLEN", d.amount, 2, CP.red)}
              {d.status ? (
                <div style={{ position: "absolute", right: 0, bottom: -10 * k, transform: `rotate(-12deg) scale(${stamp > 0 ? 1.6 - 0.6 * EASE_OUT(stamp) : 0})`, opacity: stamp, border: `6px solid ${CP.red}`, color: CP.red, fontSize: 56 * k, padding: `${4 * k}px ${22 * k}px`, borderRadius: 10 * k, letterSpacing: 4, textShadow: glow(CP.red, 10) }}>{d.status}</div>
              ) : null}
            </Card>
          );
        }
        case "money":
          return (
            <Card key={i} d={d} L={L} edge={CP.red}>
              <div style={{ fontSize: 38 * k, color: CP.red, letterSpacing: 4 }}>{d.label}</div>
              <div style={{ fontSize: 118 * k, letterSpacing: -2, color: CP.white, textShadow: glow(CP.red, 22), lineHeight: 1.05 }}>{d.value}</div>
              <div style={{ marginTop: 10 * k, height: 18 * k, borderRadius: 9 * k, background: "#1a0a10", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${100 * d.frac}%`, background: `linear-gradient(90deg, ${CP.redDeep}, ${CP.red})` }} />
              </div>
            </Card>
          );
        case "count":
          return (
            <Card key={i} d={d} L={L} edge={CP.red}>
              <div style={{ textAlign: "center", fontSize: 34 * k, color: CP.dim, letterSpacing: 4, marginTop: -8 * k }}>{d.label}</div>
              <div style={{ textAlign: "center", fontSize: 96 * k, color: CP.red, letterSpacing: 4, textShadow: glow(CP.red, 20), fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{d.value}</div>
            </Card>
          );
        case "check":
          return (
            <Card key={i} d={d} L={L} edge={CP.cyan}>
              <div style={{ fontSize: 66 * k, color: CP.cyan, letterSpacing: 2, textShadow: glow(CP.cyan, 18), borderBottom: `4px solid ${CP.magenta}`, paddingBottom: 14 * k, marginBottom: 14 * k }}>{d.title}</div>
              {d.items.map((it, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 26 * k, marginTop: 26 * k, opacity: 0.35 + 0.65 * clamp(it.on * 2), transform: `translateX(${(1 - EASE_OUT(it.on)) * 30}px)` }}>
                  <div style={{ flex: "0 0 auto", width: 70 * k, height: 70 * k, borderRadius: 12 * k, border: `5px solid ${it.on > 0.5 ? CP.cyan : CP.dim}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: it.on > 0.5 ? glow(CP.cyan, 16) : "none" }}>
                    <svg width={50 * k} height={50 * k} viewBox="0 0 50 50"><path d="M8 26 L20 38 L42 12" fill="none" stroke={CP.cyan} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - clamp(it.on))} /></svg>
                  </div>
                  <span style={{ fontSize: 54 * k, lineHeight: 1.1 }}>{it.text}</span>
                </div>
              ))}
            </Card>
          );
        case "alert":
          return (
            <div key={i} style={{ position: "absolute", left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, opacity: d.u, transform: `scale(${0.9 + 0.1 * EASE_OUT(clamp(d.tau / 0.2))})`, background: "rgba(40,0,6,0.9)", border: `5px solid ${CP.red}`, borderRadius: 14 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 * k, boxShadow: glow(CP.red, 30) }}>
              <svg width={92 * k} height={82 * k} viewBox="0 0 92 82"><path d="M46 4 L88 78 L4 78 Z" fill="none" stroke={CP.red} strokeWidth={8} strokeLinejoin="round" /><rect x={42} y={28} width={8} height={28} fill={CP.red} /><rect x={42} y={62} width={8} height={8} fill={CP.red} /></svg>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 84 * k, color: CP.red, letterSpacing: 10, textShadow: glow(CP.red, 18) }}>{d.text}</span>
            </div>
          );
      }
      return null;
    })}
  </>
);

/** the glitch transition: a few low-opacity tinted slices that hop every 2 frames (g <= 0.55) */
export const GlitchBars: React.FC<{ g: number; frame: number; L: Layout }> = ({ g, frame, L }) => {
  if (g <= 0.01) return null;
  const seed = Math.floor(frame / 2);
  return (
    <>
      {Array.from({ length: 6 }, (_, k) => {
        const y = hash(seed * 13 + k) * L.H, h = (10 + 60 * hash(seed * 7 + k * 3)) * L.k;
        const dx = (hash(seed + k * 5) - 0.5) * 60 * g * L.k;
        return <div key={k} style={{ position: "absolute", left: dx, top: y, width: L.W, height: h, background: k % 2 ? CP.cyan : CP.magenta, opacity: 0.22 * g, mixBlendMode: "screen" }} />;
      })}
    </>
  );
};
/** the alert wash: a red edge glow (inset), one soft pulse */
export const AlertWash: React.FC<{ a: number; L: Layout }> = ({ a, L }) => (a > 0.005 ? <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${L.alert.border * 4}px ${L.alert.border}px rgba(255,42,61,${a.toFixed(3)})` }} /> : null);
