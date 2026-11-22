// The original scene library. Each component makes one kind of idea visible; the Python side validates every
// scene's params against schemas/scene_params.schema.json before a render, so jobs never inject arbitrary code.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Theme } from "./types";

export type Layout = {
  w: number; h: number; portrait: boolean; u: number;      // u = 1 at 1080 px on the short side
  top: number; bottom: number; left: number; right: number; // content box; captions live below `bottom`
};

export const layoutFor = (w: number, h: number): Layout => {
  const portrait = h > w;
  // Text and shapes are sized for a phone held at arm's length: 1.45x in portrait, 1.3x in landscape.
  const u = (Math.min(w, h) / 1080) * (portrait ? 1.45 : 1.3);
  // Portrait: keep content in the upper ~62%; captions sit in a band below it and the bottom stays clear of
  // the Shorts UI. Landscape: content above a lower-third caption band.
  return portrait
    ? { w, h, portrait, u, top: h * 0.085, bottom: h * 0.63, left: w * 0.065, right: w * 0.935 }
    : { w, h, portrait, u, top: h * 0.07, bottom: h * 0.77, left: w * 0.06, right: w * 0.94 };
};

type P = { p: Record<string, any>; theme: Theme; L: Layout; dur: number };

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const fit = (text: string, base: number, maxChars: number) =>
  Math.round(base * Math.min(1, Math.max(0.5, maxChars / Math.max(1, (text || "").length))));
// one-line text sized to the available width (bold sans: ~0.62 em per character), never clipped
const fitLine = (text: string, base: number, width: number) =>
  Math.round(Math.min(base, width / (0.66 * Math.max(1, (text || "").length))));
const fmt = (v: number, decimals = 0) =>
  v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const useIn = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.7 } });
};

const Box: React.FC<{ L: Layout; children: React.ReactNode; center?: boolean }> = ({ L, children, center = true }) => (
  <div style={{
    position: "absolute", left: L.left, right: L.w - L.right, top: L.top, height: L.bottom - L.top,
    display: "flex", flexDirection: "column", justifyContent: center ? "center" : "flex-start", alignItems: "center",
    gap: 34 * L.u, overflow: "hidden",  // graphics never spill into the caption band
  }}>{children}</div>
);

const Heading: React.FC<{ text?: string; L: Layout; theme: Theme; size?: number }> = ({ text, L, theme, size = 64 }) => {
  const s = useIn(0);
  if (!text) return null;
  return (
    <div style={{
      fontWeight: 700, fontSize: fit(text, size * L.u, 34), textAlign: "center", lineHeight: 1.1,
      transform: `scale(${0.85 + 0.15 * s})`, opacity: s, maxWidth: L.right - L.left, color: theme.text,
    }}>{text}</div>
  );
};

// ---------------------------------------------------------------- title / hook
const Title: React.FC<P> = ({ p, theme, L }) => {
  const a = useIn(0), b = useIn(6);
  const f = useCurrentFrame();
  return (
    <Box L={L}>
      {p.kicker ? <div style={{
        fontSize: 40 * L.u, fontWeight: 700, letterSpacing: 6 * L.u, color: theme.bg, background: theme.accent,
        padding: `${10 * L.u}px ${26 * L.u}px`, borderRadius: 12 * L.u, opacity: a, transform: `translateY(${(1 - a) * -30}px)`,
      }}>{String(p.kicker).toUpperCase()}</div> : null}
      <div style={{
        fontWeight: 700, fontSize: fit(p.headline, (L.portrait ? 96 : 84) * L.u, 34), lineHeight: 1.05, textAlign: "center",
        opacity: b, transform: `scale(${0.8 + 0.2 * b}) rotate(${Math.sin(f / 30) * 0.6}deg)`,
      }}>{p.headline}</div>
      {p.sub ? <div style={{ fontSize: 46 * L.u, color: theme.muted, textAlign: "center", opacity: b }}>{p.sub}</div> : null}
      <div style={{ width: (L.right - L.left) * 0.5 * b, height: 10 * L.u, borderRadius: 5 * L.u, background: theme.accent }} />
    </Box>
  );
};

// ---------------------------------------------------------------- question (hook)
const Question: React.FC<P> = ({ p, theme, L }) => {
  const a = useIn(0, 9);
  const f = useCurrentFrame();
  return (
    <Box L={L}>
      <div style={{ fontSize: 300 * L.u, fontWeight: 700, color: theme.accent, lineHeight: 1,
        transform: `scale(${a}) rotate(${Math.sin(f / 12) * 6}deg)` }}>?</div>
      <div style={{ fontSize: fit(p.text, 84 * L.u, 30), fontWeight: 700, textAlign: "center", lineHeight: 1.1, opacity: a }}>{p.text}</div>
    </Box>
  );
};

// ---------------------------------------------------------------- big number counter
const Counter: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const end = Math.min(dur * 0.6, 45);
  const v = interpolate(f, [4, end], [Number(p.from ?? 0), Number(p.value)], clamp);
  const pop = useIn(Math.round(end), 8);
  const tone = p.tone === "bad" ? theme.bad : p.tone === "good" ? theme.good : theme.accent;
  const text = `${p.prefix ?? ""}${fmt(v, p.decimals ?? 0)}${p.suffix ?? ""}`;
  return (
    <Box L={L}>
      <Heading text={p.label} L={L} theme={theme} size={58} />
      <div style={{ fontSize: fitLine(text, (L.portrait ? 230 : 200) * L.u, (L.right - L.left) * 0.95), fontWeight: 700, color: tone, whiteSpace: "nowrap",
        transform: `scale(${1 + 0.08 * pop * Math.max(0, 1 - (f - end) / 20)})`, fontVariantNumeric: "tabular-nums" }}>{text}</div>
      {p.note ? <div style={{ fontSize: 44 * L.u, color: theme.muted, textAlign: "center", opacity: pop }}>{p.note}</div> : null}
    </Box>
  );
};

// ---------------------------------------------------------------- two-sided comparison
const Comparison: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const sides = [p.left, p.right];
  const max = Math.max(...sides.map((s: any) => Math.abs(Number(s.value)) || 1));
  const grow = interpolate(f, [8, Math.min(dur * 0.55, 50)], [0, 1], clamp);
  const barH = (L.bottom - L.top) * (L.portrait ? 0.48 : 0.5);
  const colors = [p.left.color === "bad" ? theme.bad : p.left.color === "good" ? theme.good : theme.muted,
                  p.right.color === "bad" ? theme.bad : p.right.color === "good" ? theme.good : theme.accent];
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ display: "flex", gap: 50 * L.u, alignItems: "flex-end", height: barH + 150 * L.u }}>
        {sides.map((s: any, i: number) => {
          const h = barH * (Math.abs(Number(s.value)) / max) * grow;
          const label = `${p.prefix ?? ""}${fmt(Number(s.value) * grow, p.decimals ?? 0)}${p.suffix ?? ""}`;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * L.u, width: Math.min(300 * L.u, (L.right - L.left - 50 * L.u) / 2) }}>
              <div style={{ fontSize: fit(label, 74 * L.u, 8), fontWeight: 700, color: colors[i] }}>{label}</div>
              <div style={{ width: "78%", height: h, background: colors[i], borderRadius: 18 * L.u }} />
              <div style={{ fontSize: fit(s.label, 50 * L.u, 12), fontWeight: 700, textAlign: "center" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- bar chart
const Bars: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const bars: any[] = p.bars || [];
  const max = Math.max(...bars.map((b) => Math.abs(Number(b.value)) || 1));
  const rowH = Math.min(120 * L.u, ((L.bottom - L.top) * 0.7) / Math.max(1, bars.length));
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 * L.u }}>
        {bars.map((b, i) => {
          const g = interpolate(f, [6 + i * 6, 30 + i * 6], [0, 1], clamp);
          const hi = b.highlight ? theme.accent : theme.muted;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 * L.u, height: rowH }}>
              <div style={{ width: "32%", fontSize: fit(b.label, 44 * L.u, 12), fontWeight: 700, textAlign: "right" }}>{b.label}</div>
              <div style={{ flex: 1, height: rowH * 0.7, position: "relative" }}>
                <div style={{ width: `${(Math.abs(Number(b.value)) / max) * 100 * g}%`, height: "100%", background: hi, borderRadius: 12 * L.u }} />
              </div>
              <div style={{ width: "22%", fontSize: 44 * L.u, fontWeight: 700, color: hi }}>
                {`${p.prefix ?? ""}${fmt(Number(b.value) * g, p.decimals ?? 0)}${p.suffix ?? ""}`}</div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- timeline
const Timeline: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const ev: any[] = p.events || [];
  const step = Math.max(8, Math.min(24, (dur * 0.6) / Math.max(1, ev.length)));
  const line = interpolate(f, [0, step * ev.length], [0, 1], clamp);
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: L.portrait ? "column" : "row",
        gap: 30 * L.u, alignItems: L.portrait ? "stretch" : "flex-start" }}>
        <div style={{ position: "absolute", background: theme.accent, borderRadius: 4 * L.u,
          ...(L.portrait ? { left: 40 * L.u, top: 0, width: 8 * L.u, height: `${line * 100}%` }
                         : { top: 40 * L.u, left: 0, height: 8 * L.u, width: `${line * 100}%` }) }} />
        {ev.map((e, i) => {
          const a = interpolate(f, [i * step, i * step + 10], [0, 1], clamp);
          return (
            <div key={i} style={{ display: "flex", flexDirection: L.portrait ? "row" : "column", alignItems: L.portrait ? "center" : "flex-start",
              gap: 24 * L.u, opacity: a, transform: `translate${L.portrait ? "X" : "Y"}(${(1 - a) * 40}px)`, flex: L.portrait ? undefined : 1 }}>
              <div style={{ width: 88 * L.u, height: 88 * L.u, borderRadius: 44 * L.u, background: theme.accent, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 58 * L.u, fontWeight: 700, color: theme.accent }}>{e.when}</div>
                <div style={{ fontSize: fit(e.label, 46 * L.u, 26), lineHeight: 1.15 }}>{e.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- numbered steps / list
const Steps: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const items: string[] = p.items || [];
  const step = Math.max(8, Math.min(22, (dur * 0.6) / Math.max(1, items.length)));
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 26 * L.u }}>
        {items.map((it, i) => {
          const a = interpolate(f, [6 + i * step, 16 + i * step], [0, 1], clamp);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 * L.u, opacity: a,
              transform: `translateX(${(1 - a) * -60}px)`, background: "#ffffff12", borderRadius: 22 * L.u, padding: 24 * L.u }}>
              <div style={{ width: 84 * L.u, height: 84 * L.u, borderRadius: 42 * L.u, background: theme.accent, color: theme.bg,
                fontSize: 52 * L.u, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: fit(it, 52 * L.u, 28), fontWeight: 700, lineHeight: 1.15 }}>{it}</div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- cause -> effect chain
const Flow: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const nodes: string[] = p.nodes || [];
  const step = Math.max(8, Math.min(26, (dur * 0.65) / Math.max(1, nodes.length)));
  const vertical = L.portrait;
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: 10 * L.u }}>
        {nodes.map((n, i) => {
          const a = interpolate(f, [i * step, i * step + 12], [0, 1], clamp);
          const last = i === nodes.length - 1;
          return (
            <React.Fragment key={i}>
              <div style={{ opacity: a, transform: `scale(${0.7 + 0.3 * a})`, background: last ? theme.accent : "#ffffff18",
                color: last ? theme.bg : theme.text, border: `${4 * L.u}px solid ${theme.accent}`, borderRadius: 26 * L.u,
                padding: `${22 * L.u}px ${34 * L.u}px`, fontSize: fit(n, 52 * L.u, 22), fontWeight: 700, textAlign: "center",
                maxWidth: vertical ? (L.right - L.left) * 0.9 : (L.right - L.left) / Math.max(1, nodes.length) - 60 * L.u }}>{n}</div>
              {!last ? <div style={{ fontSize: 70 * L.u, color: theme.accent, opacity: interpolate(f, [i * step + 8, i * step + 16], [0, 1], clamp),
                transform: vertical ? "rotate(90deg)" : undefined }}>➜</div> : null}
            </React.Fragment>
          );
        })}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- document / record / headline / email card
const Doc: React.FC<P> = ({ p, theme, L }) => {
  const a = useIn(0, 12);
  const f = useCurrentFrame();
  const lines: string[] = p.lines || [];
  const hi = typeof p.highlight === "number" ? p.highlight : -1;
  return (
    <Box L={L}>
      <div style={{ width: (L.right - L.left) * (L.portrait ? 0.96 : 0.7), background: "#F4F1EA", color: "#1B1B1B",
        borderRadius: 18 * L.u, padding: 46 * L.u, boxShadow: `0 ${30 * L.u}px ${80 * L.u}px #0008`,
        transform: `rotate(${(1 - a) * -8 + Math.sin(f / 40) * 0.8}deg) translateY(${(1 - a) * 200}px)`, opacity: a }}>
        <div style={{ fontSize: 34 * L.u, fontWeight: 700, letterSpacing: 4 * L.u, color: theme.bad }}>{String(p.kind || "RECORD").toUpperCase()}</div>
        <div style={{ fontSize: fit(p.title, 64 * L.u, 24), fontWeight: 700, lineHeight: 1.1, margin: `${16 * L.u}px 0` }}>{p.title}</div>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: fit(l, 42 * L.u, 34), lineHeight: 1.3, padding: `${6 * L.u}px ${10 * L.u}px`,
            background: i === hi ? `${theme.bad}${Math.round(interpolate(f, [20, 30], [0, 0x55], clamp)).toString(16).padStart(2, "0")}` : "transparent",
            borderRadius: 8 * L.u }}>{l}</div>
        ))}
        {p.source ? <div style={{ fontSize: 30 * L.u, color: "#555", marginTop: 18 * L.u }}>Source: {p.source}</div> : null}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- stamp / verdict / alert
const Stamp: React.FC<P> = ({ p, theme, L }) => {
  const a = useIn(4, 8);
  const f = useCurrentFrame();
  const tone = p.tone === "good" ? theme.good : p.tone === "bad" ? theme.bad : theme.accent;
  const flash = p.tone === "bad" ? 0.12 * Math.max(0, Math.sin(f / 5)) * Math.max(0, 1 - f / 40) : 0;
  return (
    <Box L={L}>
      <AbsoluteFill style={{ background: tone, opacity: flash }} />
      <div style={{ border: `${12 * L.u}px solid ${tone}`, color: tone, borderRadius: 24 * L.u, padding: `${20 * L.u}px ${50 * L.u}px`,
        fontSize: fitLine(String(p.text), 150 * L.u, (L.right - L.left) * 0.78), fontWeight: 700, letterSpacing: 6 * L.u,
        whiteSpace: "nowrap",
        transform: `rotate(-6deg) scale(${2.2 - 1.2 * a})`, opacity: Math.min(1, a * 1.5) }}>{String(p.text).toUpperCase()}</div>
      {p.sub ? <div style={{ fontSize: fit(p.sub, 52 * L.u, 28), fontWeight: 700, textAlign: "center", opacity: a }}>{p.sub}</div> : null}
    </Box>
  );
};

// ---------------------------------------------------------------- code walkthrough (typewriter)
const Code: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const lines: string[] = p.lines || [];
  const total = lines.join("\n").length;
  const shown = Math.floor(interpolate(f, [4, Math.max(10, dur * 0.7)], [0, total], clamp));
  let left = shown;
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ width: "100%", background: "#0B0F17", borderRadius: 20 * L.u, padding: 34 * L.u, border: `${3 * L.u}px solid ${theme.accent}55`,
        fontFamily: "monospace", fontSize: 38 * L.u, lineHeight: 1.45, whiteSpace: "pre-wrap", color: "#D6E2FF" }}>
        {lines.map((l, i) => {
          const part = l.slice(0, Math.max(0, left));
          left -= l.length + 1;
          return <div key={i}>{part}{left < 0 && left > -l.length - 2 ? <span style={{ color: theme.accent }}>▌</span> : null}</div>;
        })}
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- two original block characters facing off
const Block: React.FC<{ color: string; mood: string; L: Layout; bob: number }> = ({ color, mood, L, bob }) => {
  const s = L.u;
  const mouth = mood === "happy" ? "M 30 70 Q 60 95 90 70" : mood === "sad" ? "M 30 85 Q 60 62 90 85"
              : mood === "shocked" ? "M 50 72 a 10 12 0 1 0 20 0 a 10 12 0 1 0 -20 0" : "M 35 78 L 85 78";
  return (
    <svg width={240 * s} height={360 * s} viewBox="0 0 120 180" style={{ transform: `translateY(${bob}px)` }}>
      <rect x="10" y="10" width="100" height="100" rx="12" fill={color} stroke="#0006" strokeWidth="3" />
      <rect x="32" y="40" width="14" height={mood === "shocked" ? 20 : 14} rx="3" fill="#111" />
      <rect x="74" y="40" width="14" height={mood === "shocked" ? 20 : 14} rx="3" fill="#111" />
      <path d={mouth} stroke="#111" strokeWidth="6" fill={mood === "shocked" ? "#111" : "none"} strokeLinecap="round" />
      <rect x="25" y="115" width="70" height="55" rx="10" fill={color} opacity="0.85" stroke="#0006" strokeWidth="3" />
    </svg>
  );
};

const Duel: React.FC<P> = ({ p, theme, L }) => {
  const f = useCurrentFrame();
  const a = useIn(0), b = useIn(6);
  const sides = [p.left, p.right];
  return (
    <Box L={L}>
      <Heading text={p.title} L={L} theme={theme} />
      <div style={{ display: "flex", gap: 80 * L.u, alignItems: "flex-end" }}>
        {sides.map((s: any, i: number) => {
          const color = s.color === "red" ? "#E5484D" : s.color === "green" ? "#3DDC97" : s.color || theme.accent;
          const k = i === 0 ? a : b;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * L.u,
              opacity: k, transform: `translateX(${(1 - k) * (i === 0 ? -200 : 200)}px)` }}>
              {s.value ? <div style={{ fontSize: fit(s.value, 70 * L.u, 8), fontWeight: 700, color }}>{s.value}</div> : null}
              <Block color={color} mood={s.mood || "neutral"} L={L} bob={Math.sin((f + i * 15) / 9) * 6 * L.u} />
              <div style={{ fontSize: 50 * L.u, fontWeight: 700 }}>{s.name}</div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};


// ---------------------------------------------------------------- licensed / public-domain photo with credit
const Photo: React.FC<P> = ({ p, theme, L, dur }) => {
  const f = useCurrentFrame();
  const a = useIn(0, 16);
  const zoom = interpolate(f, [0, dur], [1.0, 1.12]);
  const pan = interpolate(f, [0, dur], [-2, 2]);
  const boxW = L.right - L.left, boxH = (L.bottom - L.top) * 0.78;
  return (
    <Box L={L}>
      <div style={{ width: boxW, height: boxH, borderRadius: 26 * L.u, overflow: "hidden", position: "relative", opacity: a,
        boxShadow: `0 ${24 * L.u}px ${70 * L.u}px #000a`, border: `${5 * L.u}px solid ${theme.accent}` }}>
        <Img src={staticFile(p.file)} style={{ width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${zoom}) translateX(${pan}%)` }} />
        <div style={{ position: "absolute", right: 0, bottom: 0, background: "#000b", color: "#ddd", fontSize: 22 * L.u,
          padding: `${6 * L.u}px ${12 * L.u}px`, maxWidth: "80%" }}>{p.credit}</div>
      </div>
      {p.caption ? <div style={{ fontSize: fit(p.caption, 56 * L.u, 30), fontWeight: 700, textAlign: "center", opacity: a }}>{p.caption}</div> : null}
    </Box>
  );
};

export const SCENES: Record<string, React.FC<P>> = {
  title: Title, question: Question, counter: Counter, comparison: Comparison, bars: Bars, timeline: Timeline,
  steps: Steps, flow: Flow, document: Doc, stamp: Stamp, code: Code, duel: Duel, photo: Photo,
};
