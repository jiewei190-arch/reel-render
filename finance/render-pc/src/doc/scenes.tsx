// The doc kit's 2D scene renderers: map, timeline, document, quote, compare, chart, evidence board, recap, stat. Each
// draws the boxes src/doc/layout.ts computed (the gate measures the same boxes) plus its graphics, in the channel's look
// (src/doc/themes.ts). Pure DOM + inline SVG: no images, no logos, no photos, no faces; the evidence-board people are
// generic silhouettes. Deterministic: every texture is seeded from the scene id.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneR } from "./compile";
import type { BarG, CardG, Layout, TextItem } from "./layout";
import { easeOut } from "./layout";
import type { DocLook } from "./themes";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** the channel background: law = navy with a wood-panel band and gold hairlines, biz = bright paper with a faint grid,
 *  cyber = near-black with a neon grid and scanlines */
export const Backdrop: React.FC<{ look: DocLook; seed: number; t: number }> = ({ look, seed, t }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, ${look.bg} 0%, ${look.bg2} 100%)` }}>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {look.id === "law" ? (
        <>
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 140 - 20} y={980} width={136} height={110} fill={i % 2 ? "#3A2716" : "#33210F"} opacity={0.55} />)}
          <rect x={0} y={972} width={1920} height={6} fill={look.accent} opacity={0.35} />
          <rect x={60} y={40} width={1800} height={2} fill={look.accent} opacity={0.18} />
        </>
      ) : look.id === "biz" ? (
        <>
          {Array.from({ length: 33 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1080} stroke={look.tex} strokeWidth={1} opacity={0.6} />)}
          {Array.from({ length: 19 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1920} y2={i * 60} stroke={look.tex} strokeWidth={1} opacity={0.6} />)}
        </>
      ) : (
        <>
          {Array.from({ length: 25 }, (_, i) => <line key={`v${i}`} x1={i * 80 - ((t * 6 + seed * 13) % 80)} y1={0} x2={i * 80 - ((t * 6 + seed * 13) % 80)} y2={1080} stroke={look.tex} strokeWidth={1.5} opacity={0.7} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke={look.tex} strokeWidth={1.5} opacity={0.7} />)}
          {Array.from({ length: 270 }, (_, i) => <rect key={`s${i}`} x={0} y={i * 4} width={1920} height={1} fill="#000" opacity={0.18} />)}
        </>
      )}
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
  </AbsoluteFill>
);

/** a laid-out text box */
export const Txt: React.FC<{ it: TextItem; look: DocLook; box?: boolean }> = ({ it, look, box }) => {
  if (it.show <= 0.001) return null;
  const padX = it.role === "tag" ? 14 : 18, padY = 6;
  return (
    <div style={{ position: "absolute", left: it.x0, top: it.y0, width: it.x1 - it.x0, height: it.y1 - it.y0, opacity: it.show, transform: `translateY(${(1 - it.show) * 14}px)` }}>
      {box && it.bg ? <div style={{ position: "absolute", left: -padX, right: -padX, top: -padY, bottom: -padY, background: look[it.bg], borderRadius: it.role === "tag" ? 6 : 10, boxShadow: "0 6px 18px rgba(0,0,0,0.28)" }} /> : null}
      {it.lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: it.align === "left" ? 0 : undefined, right: it.align === "right" ? 0 : undefined, width: it.align === "center" ? "100%" : undefined, top: i * it.lh, height: it.lh, lineHeight: `${it.lh}px`, textAlign: it.align, whiteSpace: "nowrap", fontFamily: "Poppins", fontWeight: it.weight, fontSize: it.fs, letterSpacing: it.ls ?? 0, color: look[it.fg] }}>{l}</div>
      ))}
    </div>
  );
};

const Stage: React.FC<{ L: Layout; children: React.ReactNode }> = ({ L, children }) => (
  <AbsoluteFill style={{ transformOrigin: `${L.stage.ox}px ${L.stage.oy}px`, transform: `translate(${L.stage.tx}px, ${L.stage.ty}px) scale(${L.stage.s})` }}>{children}</AbsoluteFill>
);

// ------------------------------------------------------------------ evidence-board pictures (generic, faceless)
const CardPic: React.FC<{ c: CardG; look: DocLook }> = ({ c, look }) => {
  const w = c.x1 - c.x0, h = c.pic - c.y0, cx = w / 2, ink = look.id === "cyber" ? look.accent : "#2B2A33", soft = look.id === "cyber" ? "#123A55" : "#C9C2B2";
  switch (c.kind) {
    case "person": return (<g><rect x={14} y={14} width={w - 28} height={h - 20} fill={soft} rx={4} /><circle cx={cx} cy={h * 0.42} r={Math.min(w, h) * 0.17} fill={ink} /><path d={`M ${cx - w * 0.3} ${h - 6} Q ${cx - w * 0.3} ${h * 0.62} ${cx} ${h * 0.62} Q ${cx + w * 0.3} ${h * 0.62} ${cx + w * 0.3} ${h - 6} Z`} fill={ink} /></g>);
    case "doc": return (<g><rect x={cx - w * 0.26} y={22} width={w * 0.52} height={h - 34} fill="#FBF7EE" stroke={soft} strokeWidth={3} />{Array.from({ length: 6 }, (_, i) => <rect key={i} x={cx - w * 0.2} y={44 + i * ((h - 70) / 6)} width={w * (i % 3 === 2 ? 0.26 : 0.4)} height={7} fill={soft} />)}</g>);
    case "place": return (<g><rect x={14} y={14} width={w - 28} height={h - 20} fill={soft} rx={4} /><path d={`M ${cx - w * 0.3} ${h - 10} L ${cx - w * 0.3} ${h * 0.45} L ${cx} ${h * 0.22} L ${cx + w * 0.3} ${h * 0.45} L ${cx + w * 0.3} ${h - 10} Z`} fill={ink} /><rect x={cx - w * 0.08} y={h * 0.68} width={w * 0.16} height={h * 0.32 - 10} fill={soft} /><rect x={cx - w * 0.22} y={h * 0.52} width={w * 0.1} height={h * 0.1} fill={soft} /><rect x={cx + w * 0.12} y={h * 0.52} width={w * 0.1} height={h * 0.1} fill={soft} /></g>);
    default: return (<g><rect x={14} y={14} width={w - 28} height={h - 20} fill={soft} rx={4} /><rect x={cx - w * 0.22} y={h * 0.38} width={w * 0.44} height={h * 0.42} fill={ink} rx={6} /><rect x={cx - w * 0.22} y={h * 0.3} width={w * 0.44} height={h * 0.1} fill={look.accent} /></g>);
  }
};

// ------------------------------------------------------------------ the scenes
export const Scene2D: React.FC<{ s: SceneR; L: Layout; look: DocLook; t: number }> = ({ s, L, look, t }) => {
  const seed = s.i + 1;
  const items = L.items;
  const g = L.g as Record<string, any>;
  const boxed = (it: TextItem) => s.type === "map" || it.role === "tag" || it.role === "callout";
  const texts = items.map((it) => <Txt key={it.key} it={it} look={look} box={boxed(it)} />);
  let art: React.ReactNode = null;
  if (s.type === "stat") {
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={960 - g.rule.w / 2} y={g.rule.y} width={g.rule.w} height={8} fill={look.accent} rx={4} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => <path key={i} d={`M ${960 + sx * 840} ${400 + sy * 300 - sy * 60} L ${960 + sx * 840} ${400 + sy * 300} L ${960 + sx * 780} ${400 + sy * 300}`} stroke={look.accent} strokeWidth={6} fill="none" opacity={0.6 * easeOut((t - s.a) / 0.5)} />)}</svg>);
  } else if (s.type === "compare") {
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
      {g.panels.map(([x0, x1, y0, y1, u]: number[], i: number) => <g key={i} opacity={u} transform={`translate(0 ${(1 - u) * 30})`}><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={18} fill={look.card} stroke={g.win === (i ? "right" : "left") ? look.accent : look.cardEdge} strokeWidth={g.win === (i ? "right" : "left") ? 10 : 4} /><rect x={x0} y={y0} width={x1 - x0} height={14} rx={7} fill={i ? look.accent2 : look.accent} /></g>)}
      <circle cx={g.vs[0]} cy={g.vs[1]} r={62} fill={look.accent} opacity={clamp((t - s.a - 0.2) / 0.3)} /></svg>);
  } else if (s.type === "chart") {
    if (g.kind === "pie") {
      const { cx, cy, r } = g.pie;
      const cols = [look.accent, look.accent2, look.dim, look.regionEdge, look.cardEdge];
      art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={look.dim} strokeWidth={2} opacity={0.4} />
        {g.slices.map((sl: any) => { if (sl.u <= 0) return null; const a0 = sl.a0 * Math.PI * 2 - Math.PI / 2, a1 = (sl.a0 + (sl.a1 - sl.a0) * sl.u) * Math.PI * 2 - Math.PI / 2; const large = a1 - a0 > Math.PI ? 1 : 0; return <path key={sl.i} d={`M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`} fill={cols[sl.i % cols.length]} stroke={look.bg2} strokeWidth={4} />; })}
        {g.legend.map((l: any, i: number) => <rect key={i} x={l.x} y={l.y - 22} width={40} height={40} rx={6} fill={cols[i % cols.length]} opacity={l.sh} />)}</svg>);
    } else {
      const A = g.axis;
      art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
        {[0.25, 0.5, 0.75, 1].map((k) => <line key={k} x1={A.X0} x2={A.X1} y1={A.BASE - (A.BASE - A.TOP) * k} y2={A.BASE - (A.BASE - A.TOP) * k} stroke={look.dim} strokeWidth={1.5} opacity={0.25} strokeDasharray="6 10" />)}
        <line x1={A.X0} x2={A.X1} y1={A.BASE} y2={A.BASE} stroke={look.ink} strokeWidth={4} opacity={0.8} />
        <line x1={A.X0} x2={A.X0} y1={A.TOP - 30} y2={A.BASE} stroke={look.ink} strokeWidth={3} opacity={0.5} />
        {g.bars.map((b: BarG, i: number) => <g key={i}><rect x={b.x0} y={b.y0} width={b.x1 - b.x0} height={Math.max(0, b.y1 - b.y0)} fill={i === g.bars.length - 1 ? look.accent2 : look.accent} rx={6} /><rect x={b.x0} y={b.y0} width={10} height={Math.max(0, b.y1 - b.y0)} fill="#ffffff" opacity={0.18} /></g>)}
        {g.pts.length ? <polyline points={pts(g.pts.filter((p: number[]) => p[2] > 0).map((p: number[]) => [p[0], A.BASE - (A.BASE - p[1]) * p[2]]))} fill="none" stroke={look.accent} strokeWidth={8} strokeLinejoin="round" /> : null}
        {g.pts.map((p: number[], i: number) => (p[2] > 0 ? <circle key={i} cx={p[0]} cy={A.BASE - (A.BASE - p[1]) * p[2]} r={14} fill={look.bg2} stroke={look.accent} strokeWidth={6} /> : null))}</svg>);
    }
  } else if (s.type === "timeline") {
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
      <line x1={0} x2={1920} y1={g.axisY} y2={g.axisY} stroke={look.dim} strokeWidth={6} opacity={0.45} />
      <line x1={0} x2={Math.max(0, g.progress)} y1={g.axisY} y2={g.axisY} stroke={look.accent} strokeWidth={8} />
      {g.dots.map(([x, sh]: number[], i: number) => <g key={i} opacity={sh}><circle cx={x} cy={g.axisY} r={22} fill={look.bg2} stroke={look.accent} strokeWidth={8} /><circle cx={x} cy={g.axisY} r={9} fill={look.accent} /><line x1={x} x2={x} y1={g.axisY + 26} y2={g.axisY + 46} stroke={look.accent} strokeWidth={4} /></g>)}</svg>);
  } else if (s.type === "document") {
    const P = g.page, k = g.kind, sl = P.slide * 70;
    const m = g.marker;
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
      <g transform={`translate(0 ${sl})`} opacity={1 - P.slide}>
        <rect x={P.x0 + 14} y={P.top + 18} width={P.x1 - P.x0} height={P.bottom - P.top} fill="#000" opacity={0.28} rx={6} />
        <rect x={P.x0} y={P.top} width={P.x1 - P.x0} height={P.bottom - P.top} fill={look.paper} rx={6} />
        {k === "receipt" ? <>{Array.from({ length: 4 }, (_, i) => <line key={i} x1={P.x0 + 40} x2={P.x1 - 40} y1={g.ruleY + 8 * i} y2={g.ruleY + 8 * i} stroke={look.paperDim} strokeWidth={2} strokeDasharray="10 10" opacity={i ? 0 : 0.7} />)}</> : <line x1={P.x0 + 60} x2={P.x1 - 60} y1={g.ruleY} y2={g.ruleY} stroke={look.paperInk} strokeWidth={k === "article" ? 6 : 2} />}
        {k === "ruling" || k === "filing" ? <><line x1={P.x0 + 60} x2={P.x1 - 60} y1={g.ruleY + 8} y2={g.ruleY + 8} stroke={look.paperInk} strokeWidth={1} /><circle cx={P.x0 + 92} cy={P.top + 78} r={34} fill="none" stroke={look.paperDim} strokeWidth={3} /><circle cx={P.x0 + 92} cy={P.top + 78} r={24} fill="none" stroke={look.paperDim} strokeWidth={2} /></> : null}
        {k === "article" ? <line x1={P.x0 + 60} x2={P.x1 - 60} y1={P.top + 30} y2={P.top + 30} stroke={look.paperInk} strokeWidth={2} /> : null}
        {k === "email" || k === "letter" ? <rect x={P.x0} y={P.top} width={P.x1 - P.x0} height={14} fill={look.accent} rx={6} /> : null}
        {m ? <rect x={m.x0} y={m.y0} width={(m.x1 - m.x0) * m.u} height={m.y1 - m.y0} fill={look.marker} opacity={0.92} rx={6} /> : null}
      </g></svg>);
  } else if (s.type === "quote") {
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}><text x={g.mark[0]} y={g.mark[1] + 150} fontFamily="Poppins" fontWeight={800} fontSize={300} fill={look.accent} opacity={0.85 * easeOut((t - s.a) / 0.4)}>“</text><rect x={248} y={g.mark[1] + 30} width={8} height={420} fill={look.accent} opacity={0.5} /></svg>);
  } else if (s.type === "evidenceboard") {
    const surf = look.id === "law" ? "#6E4A2B" : look.id === "biz" ? "#FFFFFF" : "#0B1A2E";
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
      <rect x={100} y={60} width={1720} height={760} rx={14} fill={surf} stroke={look.id === "law" ? "#3A2716" : look.cardEdge} strokeWidth={18} opacity={0.96} />
      {look.id === "law" ? Array.from({ length: 160 }, (_, i) => <circle key={`k${i}`} cx={110 + ((i * 397) % 1700)} cy={70 + ((i * 211) % 740)} r={2 + (i % 3)} fill="#4E3320" opacity={0.6} />) : null}
      {g.cards.map((c: CardG, i: number) => (
        <g key={c.id} opacity={c.sh} transform={`translate(0 ${(1 - c.sh) * -30}) rotate(${c.rot} ${(c.x0 + c.x1) / 2} ${(c.y0 + c.y1) / 2})`}>
          <rect x={c.x0 + 10} y={c.y0 + 14} width={c.x1 - c.x0} height={c.y1 - c.y0} fill="#000" opacity={0.3} />
          <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} fill={look.card} stroke={look.cardEdge} strokeWidth={3} />
          <g transform={`translate(${c.x0} ${c.y0})`}><CardPic c={c} look={look} /></g>
          <circle cx={(c.x0 + c.x1) / 2} cy={c.y0 + 18} r={13} fill={look.string} stroke="#00000055" strokeWidth={2} key={i} />
        </g>))}
      {g.links.map((l: any) => { const d = `M ${l.p[0]} ${l.p[1]} Q ${l.c[0]} ${l.c[1]} ${l.q[0]} ${l.q[1]}`; const len = Math.hypot(l.q[0] - l.p[0], l.q[1] - l.p[1]) * 1.4 + 200; return <path key={l.i} d={d} fill="none" stroke={look.string} strokeWidth={6} strokeDasharray={`${len * l.u} ${len}`} strokeLinecap="round" />; })}</svg>);
  } else if (s.type === "recap") {
    art = (<svg width={1920} height={1080} style={{ position: "absolute" }}><rect x={g.chip[0]} y={g.chip[1]} width={g.chip[2] - g.chip[0]} height={g.chip[3] - g.chip[1]} rx={6} fill={look.accent} opacity={easeOut((t - s.a) / 0.3)} />
      <rect x={170} y={260} width={6} height={Math.max(0, 520 * easeOut((t - s.a) / 1.2))} fill={look.accent} opacity={0.5} />
      {g.boxes.map(([x, y, sh]: number[], i: number) => <g key={i} opacity={sh}><rect x={x - 26} y={y - 26} width={52} height={52} rx={8} fill="none" stroke={look.accent} strokeWidth={5} /><path d={`M ${x - 14} ${y} L ${x - 3} ${y + 12} L ${x + 16} ${y - 13}`} stroke={look.accent} strokeWidth={7} fill="none" strokeDasharray="60" strokeDashoffset={60 * (1 - clamp(sh * 1.4 - 0.4))} strokeLinecap="round" /></g>)}</svg>);
  } else if (s.type === "map") {
    if (g.city) {
      const C = g.city;
      art = (<svg width={1920} height={1080} style={{ position: "absolute" }}><g transform={`translate(960 450) scale(${C.z}) translate(-960 -450)`}>
        <rect x={-200} y={-200} width={2320} height={1480} fill={look.land} />
        {C.blocks.map((b: number[], i: number) => <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill={b[4] ? "#2F5A3A" : look.region} opacity={b[4] ? 0.5 : 0.35} />)}
        <path d={`M ${C.river[0]} ${C.river[1]} Q ${C.river[2]} ${C.river[3]} ${C.river[4]} ${C.river[5]}`} stroke={look.water} strokeWidth={70} fill="none" opacity={0.9} />
        {C.streets.map((s2: number[], i: number) => <line key={i} x1={s2[0]} y1={s2[1]} x2={s2[2]} y2={s2[3]} stroke={look.id === "biz" ? "#FFFFFF" : look.dim} strokeWidth={s2[4]} opacity={look.id === "biz" ? 0.9 : 0.35} />)}
      </g></svg>);
    } else {
      art = (<svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1920} height={1080} fill={look.water} />
        {g.land.map((p: [number, number][], i: number) => <polygon key={i} points={pts(p)} fill={look.land} stroke={look.bg2} strokeWidth={2} />)}
        {g.regionPolys.map((p: [number, number][], i: number) => <polygon key={`r${i}`} points={pts(p)} fill={look.region} stroke={look.regionEdge} strokeWidth={4} opacity={g.regionU} />)}
        {g.route ? <path d={`M ${g.route.x0} ${g.route.y0} Q ${g.route.c[0]} ${g.route.c[1]} ${g.route.x1} ${g.route.y1}`} fill="none" stroke={look.pin} strokeWidth={6} strokeDasharray="18 12" pathLength={1000} style={{ strokeDashoffset: 0 }} opacity={g.route.u} /> : null}
      </svg>);
    }
    const pins = (<svg width={1920} height={1080} style={{ position: "absolute" }}>{g.pins.map((p: any, i: number) => <g key={i} opacity={p.sh}><circle cx={p.x} cy={p.y} r={18 + 40 * ((t * 0.8 + i * 0.3) % 1)} fill="none" stroke={look.pin} strokeWidth={4} opacity={1 - ((t * 0.8 + i * 0.3) % 1)} /><circle cx={p.x} cy={p.y} r={16} fill={look.pin} stroke="#ffffff" strokeWidth={4} /></g>)}</svg>);
    art = (<>{art}{pins}</>);
  }
  return (
    <AbsoluteFill>
      {s.type === "map" ? <AbsoluteFill style={{ background: look.water }} /> : <Backdrop look={look} seed={seed} t={t} />}
      <Stage L={L}>{art}{texts}</Stage>
      {s.type === "map" ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)" }} /> : null}
    </AbsoluteFill>
  );
};
