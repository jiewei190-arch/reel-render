// Pure screen layout of the doc kit's 2D scenes (1920x1080): every text box (with its measured font size, colours and
// role) and every graphic, as a function of t. The renderer (scenes.tsx) draws exactly these boxes and tools/doc_build.mjs
// checks exactly these boxes (fit, frame, caption band, callout safety, stacking, contrast), so what the gate measures is
// what renders. No React, no three.js.
import { MIN_SUB_PX, MIN_TEXT_PX, textEm } from "../longform/polish";
import { CITIES, COUNTRIES, LAND, regionBox } from "./maps";
import type { LonLat } from "./maps";
import type { DocLook } from "./themes";
import type { ChartScene, CompareScene, DocMove, DocumentScene, EvidenceScene, MapScene, PlaceRef, QuoteScene, RecapScene, StatScene, TimelineScene } from "./types";

export const W = 1920, H = 1080;
/** 2D content stays inside this box (the lower-third caption band starts at 833 px) */
export const SAFE = { x0: 120, x1: 1800, y0: 60, y1: 812 } as const;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
export const easeIO = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };
const appear = (t: number, t0: number, d = 0.3) => easeOut((t - t0) / d);

export type LookKey = keyof DocLook;
/** a text box (stage px, before the scene's camera move) */
export type TextItem = {
  key: string; text: string; lines: string[];
  x0: number; y0: number; x1: number; y1: number;
  fs: number; lh: number; weight: 700 | 800; align: "left" | "center" | "right";
  fg: LookKey; bg?: LookKey;
  /** 0..1 visibility */
  show: number;
  role: "title" | "main" | "value" | "sub" | "body" | "key" | "callout" | "tag";
  /** the size it was asked for / the minimum it may shrink to; ok = it fits at >= min */
  minFs: number; ok: boolean; need?: string;
  /** a callout: the keys of the items it explains (it must never cover them) */
  explains?: string[];
  /** words that name people / places / dates (prop-text sanity), a headline (every word in the script) */
  names?: boolean; headline?: boolean;
  /** letter spacing (px) */
  ls?: number;
};
/** the stage camera: screen = o + (p - o) * s + (tx, ty) */
export type Stage = { s: number; tx: number; ty: number; ox: number; oy: number };
export const stageAt = (move: DocMove, u: number, ox = 960, oy = 400): Stage => {
  const e = easeIO(u);
  switch (move) {
    case "push": return { s: lerp(1, 1.045, e), tx: 0, ty: 0, ox, oy };
    case "pull": return { s: lerp(1.045, 1, e), tx: 0, ty: 0, ox, oy };
    case "panL": return { s: 1.03, tx: lerp(26, -26, e), ty: 0, ox, oy };
    case "panR": return { s: 1.03, tx: lerp(-26, 26, e), ty: 0, ox, oy };
    case "rise": return { s: 1.025, tx: 0, ty: lerp(14, -14, e), ox, oy };
    default: return { s: lerp(1.01, 1.035, e), tx: lerp(10, -10, e), ty: lerp(4, -4, e), ox, oy };
  }
};
export const toScreen = (st: Stage, x: number, y: number) => [st.ox + (x - st.ox) * st.s + st.tx, st.oy + (y - st.oy) * st.s + st.ty];
export const rectOnScreen = (st: Stage, r: { x0: number; y0: number; x1: number; y1: number }) => {
  const [a, b] = toScreen(st, r.x0, r.y0), [c, d] = toScreen(st, r.x1, r.y1);
  return { x0: a, y0: b, x1: c, y1: d };
};

// ------------------------------------------------------------------ text measuring (Poppins 800 advance table)
export const textW = (s: string, fs: number, ls = 0) => textEm(s) * fs + ls * [...s].length;
/** greedy word wrap at fs into maxW */
export const wrap = (text: string, fs: number, maxW: number, ls = 0) => {
  const out: string[] = [];
  let cur = "";
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    const nx = cur ? `${cur} ${w}` : w;
    if (!cur || textW(nx, fs, ls) <= maxW) cur = nx; else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out;
};
/** the largest fs <= maxFs (2 px steps) at which `text` wraps into <= maxLines lines that each fit maxW */
export const fitWrap = (text: string, maxFs: number, minFs: number, maxW: number, maxLines: number, ls = 0) => {
  let fs = maxFs;
  for (; fs > 8; fs -= 2) {
    const ls2 = wrap(text, fs, maxW, ls);
    if (ls2.length <= maxLines && ls2.every((l) => textW(l, fs, ls) <= maxW)) return { fs, lines: ls2, ok: fs >= minFs - 1e-6 };
  }
  return { fs, lines: wrap(text, fs, maxW, ls), ok: false };
};
type ItemSpec = Omit<TextItem, "lines" | "x0" | "y0" | "x1" | "y1" | "fs" | "lh" | "ok" | "minFs"> & { maxFs: number; minFs?: number; maxW: number; maxLines?: number; lhK?: number };
/** a text item fitted to its box: anchor x (by align) and the TOP y */
const item = (o: ItemSpec, x: number, top: number): TextItem => {
  const minFs = o.minFs ?? (o.role === "sub" || o.role === "body" || o.role === "tag" || o.role === "title" ? MIN_SUB_PX : MIN_TEXT_PX);
  const f = fitWrap(o.text, o.maxFs, minFs, o.maxW, o.maxLines ?? 1, o.ls ?? 0);
  const lh = Math.round(f.fs * (o.lhK ?? 1.12));
  const w = Math.max(...f.lines.map((l) => textW(l, f.fs, o.ls ?? 0)), 1);
  const x0 = o.align === "left" ? x : o.align === "right" ? x - w : x - w / 2;
  const need = f.ok ? undefined : `'${o.text}' needs a font under ${minFs} px to fit ${o.maxLines ?? 1} line(s) of ${Math.round(o.maxW)} px: shorten it to about ${Math.max(1, Math.floor((o.maxW * (o.maxLines ?? 1)) / (minFs * 0.66)))} characters`;
  const { maxFs: _a, maxW: _b, maxLines: _c, lhK: _d, ...rest } = o;
  return { ...rest, lines: f.lines, x0, x1: x0 + w, y0: top, y1: top + lh * f.lines.length, fs: f.fs, lh, minFs, ok: f.ok, need };
};
const centreY = (it: TextItem, cy: number) => { const h = it.y1 - it.y0; it.y0 = cy - h / 2; it.y1 = cy + h / 2; return it; };
const up = (s: string | undefined) => String(s ?? "").toUpperCase();

/** a scene's compiled times, the input of every layout */
export type Timed = { a: number; b: number };
export type Layout = { items: TextItem[]; stage: Stage; g: Record<string, unknown> };
const titleItem = (title: string | undefined, a: number, t: number, x = 140): TextItem[] =>
  title ? [item({ key: "title", text: up(title), role: "title", fg: "ink", weight: 800, align: "left", show: appear(t, a), maxFs: 60, minFs: 42, maxW: 1500 }, x, 66)] : [];

// ------------------------------------------------------------------ stat
export const layStat = (s: StatScene & Timed, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const v = item({ key: "value", text: up(s.value), role: "value", fg: "accent", weight: 800, align: "center", show: appear(t, s.a, 0.25), maxFs: 230, minFs: 96, maxW: 1500 }, 960, 0);
  centreY(v, 350);
  const lab = item({ key: "label", text: up(s.label), role: "main", fg: "ink", weight: 800, align: "center", show: appear(t, s.a + 0.25), maxFs: 68, maxW: 1500, maxLines: 2 }, 960, 520);
  const items = [v, lab];
  if (s.sub) items.push(item({ key: "sub", text: up(s.sub), role: "sub", fg: "dim", weight: 700, align: "center", show: appear(t, s.a + 0.5), maxFs: 46, maxW: 1400, maxLines: 2 }, 960, lab.y1 + 22));
  return { items, stage: stageAt(move, u), g: { rule: { y: 488, w: 900 * easeOut((t - s.a - 0.1) / 0.5) } } };
};

// ------------------------------------------------------------------ compare
export const layCompare = (s: CompareScene & Timed & { rightT: number }, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const items = titleItem(s.title, s.a, t);
  const y0 = s.title ? 180 : 140, y1 = 790;
  const side = (k: "left" | "right", c: { label: string; value: string; note?: string }, x0: number, x1: number, t0: number) => {
    const cx = (x0 + x1) / 2, sh = appear(t, t0, 0.35), w = x1 - x0 - 70;
    const lab = item({ key: `${k}.label`, text: up(c.label), role: "main", fg: "cardDim", bg: "card", weight: 800, align: "center", show: sh, maxFs: 52, maxW: w, maxLines: 2 }, cx, y0 + 50);
    const val = item({ key: `${k}.value`, text: up(c.value), role: "value", fg: k === "right" && s.win !== "left" ? "cardHot" : "cardInk", bg: "card", weight: 800, align: "center", show: sh, maxFs: 136, minFs: 48, maxW: w, maxLines: 2, lhK: 1.05 }, cx, 0);
    centreY(val, (y0 + y1) / 2 + 30);
    const out = [lab, val];
    if (c.note) out.push(item({ key: `${k}.note`, text: up(c.note), role: "sub", fg: "cardDim", bg: "card", weight: 700, align: "center", show: sh, maxFs: 38, maxW: w, maxLines: 2 }, cx, y1 - 110));
    return out;
  };
  items.push(...side("left", s.left, 140, 900, s.a + 0.1), ...side("right", s.right, 1020, 1780, s.rightT));
  const vs = item({ key: "vs", text: "VS", role: "tag", fg: "onAccent", bg: "accent", weight: 800, align: "center", show: appear(t, s.a + 0.2), maxFs: 44, maxW: 90 }, 960, 0);
  centreY(vs, (y0 + y1) / 2 + 30);
  items.push(vs);
  return { items, stage: stageAt(move, u), g: { panels: [[140, 900, y0, y1, appear(t, s.a + 0.1, 0.35)], [1020, 1780, y0, y1, appear(t, s.rightT, 0.35)]], vs: [960, (y0 + y1) / 2 + 30], win: s.win ?? null } };
};

// ------------------------------------------------------------------ chart
export type BarG = { x0: number; x1: number; y0: number; y1: number; u: number };
export const layChart = (s: ChartScene & Timed & { ats: number[] }, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const items = titleItem(s.title, s.a, t);
  const max = Math.max(...s.data.map((d) => Math.abs(d.value)), 1e-9);
  const g: Record<string, unknown> = { kind: s.kind };
  if (s.kind === "pie") {
    const tot = s.data.reduce((x, d) => x + Math.max(0, d.value), 0) || 1;
    let acc = 0;
    g.slices = s.data.map((d, i) => { const a0 = acc / tot; acc += Math.max(0, d.value); return { a0, a1: acc / tot, u: easeOut((t - s.ats[i]) / 0.5), i }; });
    g.pie = { cx: 600, cy: 460, r: 270 };
    s.data.forEach((d, i) => {
      const cy = 250 + i * 104, sh = appear(t, s.ats[i]);
      items.push(item({ key: `d${i}.label`, text: up(d.label), role: "sub", fg: "ink", weight: 800, align: "left", show: sh, maxFs: 44, maxW: 460 }, 1060, cy - 26));
      items.push(item({ key: `d${i}.value`, text: up(d.text), role: "value", fg: "accent", weight: 800, align: "right", show: sh, maxFs: 52, maxW: 230, explains: undefined }, 1780, cy - 30));
    });
    g.legend = s.data.map((_, i) => ({ x: 1000, y: 250 + i * 104, sh: appear(t, s.ats[i]) }));
    return { items, stage: stageAt(move, u), g };
  }
  const X0 = 250, X1 = 1700, BASE = 690, TOP = 290;
  if (s.y) items.push(item({ key: "ylabel", text: up(s.y), role: "sub", fg: "dim", weight: 700, align: "left", show: appear(t, s.a), maxFs: 36, maxW: 700 }, X0, 168));
  if (s.x) items.push(item({ key: "xlabel", text: up(s.x), role: "sub", fg: "dim", weight: 700, align: "right", show: appear(t, s.a), maxFs: 36, maxW: 700 }, X1, 168));
  const n = s.data.length, slot = (X1 - X0) / n, bw = Math.min(230, slot * 0.6);
  const bars: BarG[] = [], pts: [number, number, number][] = [];
  s.data.forEach((d, i) => {
    const cx = X0 + slot * (i + 0.5), gu = easeOut((t - s.ats[i]) / 0.45), h = Math.max(6, (Math.abs(d.value) / max) * (BASE - TOP));
    const top = BASE - h;
    if (s.kind === "bar") bars.push({ x0: cx - bw / 2, x1: cx + bw / 2, y0: BASE - h * gu, y1: BASE, u: gu });
    else pts.push([cx, top, gu]);
    const sh = appear(t, s.ats[i] + 0.2, 0.25);
    const val = item({ key: `d${i}.value`, text: up(d.text), role: "value", fg: "accent", weight: 800, align: "center", show: sh, maxFs: 60, maxW: slot * 0.94 }, cx, 0);
    centreY(val, top - 44);
    items.push(val);
    items.push(item({ key: `d${i}.label`, text: up(d.label), role: "sub", fg: "ink", weight: 800, align: "center", show: appear(t, s.ats[i]), maxFs: 40, maxW: slot * 0.94, maxLines: 2 }, cx, BASE + 18));
  });
  Object.assign(g, { bars, pts, axis: { X0, X1, BASE, TOP } });
  return { items, stage: stageAt(move, u), g };
};

// ------------------------------------------------------------------ timeline
export const TL = { first: 360, gap: 560, axisY: 500, keep: 1250 } as const;
export const layTimeline = (s: TimelineScene & Timed & { ats: number[] }, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const items = titleItem(s.title, s.a, t);
  const ex = s.events.map((_, i) => TL.first + i * TL.gap);
  // the pan: the newest shown event stays at or left of TL.keep (eased over 0.9 s after it appears) + a slow drift
  const offFor = (k: number) => (k < 0 ? 0 : Math.max(0, ex[k] - TL.keep));
  let k = -1; s.ats.forEach((at, i) => { if (t >= at) k = i; });
  const off = k < 0 ? 0 : lerp(offFor(k - 1), offFor(k), easeIO((t - s.ats[k]) / 0.9)) + 30 * easeIO(u);
  const dots: [number, number][] = [];
  s.events.forEach((e, i) => {
    const x = ex[i] - off;
    const edge = clamp(Math.min(x - 300, 1620 - x) / 80 + 1); // fades out as it nears the edge
    const sh = Math.min(appear(t, s.ats[i], 0.35), edge);
    dots.push([x, sh]);
    const wh = item({ key: `e${i}.when`, text: up(e.when), role: "value", fg: "accent", weight: 800, align: "center", show: sh, maxFs: 84, minFs: 44, maxW: 520 }, x, 0);
    centreY(wh, 412);
    items.push(wh, item({ key: `e${i}.text`, text: up(e.text), role: "sub", fg: "ink", weight: 800, align: "center", show: sh, maxFs: 46, minFs: 36, maxW: 480, maxLines: 2 }, x, 552));
  });
  return { items, stage: stageAt(move, u), g: { axisY: TL.axisY, dots, off, progress: k < 0 ? 0 : (ex[k] - off) } };
};

// ------------------------------------------------------------------ document
const PAGE = { x0: 330, x1: 1590, top: 70, pad: 72 } as const;
const RECEIPT = { x0: 560, x1: 1360, top: 70, pad: 64 } as const;
export const layDocument = (s: DocumentScene & Timed & { hlT: number }, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const P = s.kind === "receipt" ? RECEIPT : PAGE;
  const tx0 = P.x0 + P.pad, tw = P.x1 - P.x0 - 2 * P.pad, cx = (P.x0 + P.x1) / 2;
  const left = s.kind === "email" || s.kind === "letter";
  const ax = left ? tx0 : cx, al: "left" | "center" = left ? "left" : "center";
  const items: TextItem[] = [];
  let y = P.top + 54;
  const sh = appear(t, s.a, 0.4);
  const hd = item({ key: "heading", text: up(s.heading), role: "sub", fg: "paperInk", bg: "paper", weight: 800, align: al, show: sh, maxFs: s.kind === "article" ? 44 : 38, maxW: tw, maxLines: 2, names: true, ls: s.kind === "article" ? 3 : 1 }, ax, y);
  items.push(hd); y = hd.y1 + 10;
  (s.meta ?? []).forEach((m, i) => { const it = item({ key: `meta${i}`, text: m, role: "sub", fg: "paperDim", bg: "paper", weight: 700, align: al, show: sh, maxFs: 32, maxW: tw, names: true }, ax, y); items.push(it); y = it.y1 + 2; });
  const ruleY = y + 14; y = ruleY + 28;
  if (s.headline) { const hl = item({ key: "headline", text: up(s.headline), role: "main", fg: "paperInk", bg: "paper", weight: 800, align: "left", show: sh, maxFs: 68, minFs: 48, maxW: tw, maxLines: 2, lhK: 1.05, headline: true }, tx0, y); items.push(hl); y = hl.y1 + 22; }
  let keyBox: { x0: number; y0: number; x1: number; y1: number } | null = null;
  s.lines.forEach((ln, i) => {
    const isKey = i === s.key;
    const it = item({ key: isKey ? "key" : `line${i}`, text: ln, role: isKey ? "key" : "body", fg: isKey ? "paperInk" : "paperDim", bg: isKey ? "marker" : "paper", weight: isKey ? 800 : 700, align: "left", show: sh, maxFs: isKey ? 54 : 42, minFs: isKey ? 42 : 32, maxW: tw, maxLines: 3, lhK: 1.25 }, tx0, y);
    items.push(it);
    if (isKey) keyBox = { x0: it.x0 - 12, y0: it.y0 + it.lh * 0.08, x1: it.x1 + 12, y1: it.y1 - it.lh * 0.08 };
    y = it.y1 + (isKey ? 16 : 10);
  });
  const kb = keyBox as { x0: number; y0: number; x1: number; y1: number } | null;
  const oy = kb ? (kb.y0 + kb.y1) / 2 : 400;
  const st = stageAt(move, u, cx, oy);
  return { items, stage: st, g: { page: { x0: P.x0, x1: P.x1, top: P.top, bottom: y + 50, slide: 1 - sh }, ruleY, kind: s.kind, marker: kb ? { ...kb, u: easeIO((t - s.hlT) / 0.7) } : null } };
};

// ------------------------------------------------------------------ quote
export const layQuote = (s: QuoteScene & Timed, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const q = item({ key: "quote", text: `“${s.text.replace(/^["“]|["”]$/g, "")}”`, role: "main", fg: "ink", weight: 800, align: "left", show: appear(t, s.a + 0.1, 0.45), maxFs: 112, minFs: 50, maxW: 1360, maxLines: 4, lhK: 1.12 }, 300, 0);
  centreY(q, 340);
  const who = item({ key: "who", text: `— ${up(s.who)}`, role: "main", fg: "accent", weight: 800, align: "left", show: appear(t, s.a + 0.6), maxFs: 50, maxW: 1300, names: true }, 300, q.y1 + 36);
  const src = item({ key: "source", text: up(s.source), role: "sub", fg: "dim", weight: 700, align: "left", show: appear(t, s.a + 0.85), maxFs: 36, maxW: 1300, maxLines: 2, names: true }, 300, who.y1 + 10);
  return { items: [q, who, src], stage: stageAt(move, u), g: { mark: [170, q.y0 - 10] } };
};

// ------------------------------------------------------------------ evidence board
export type CardG = { id: string; kind: string; x0: number; y0: number; x1: number; y1: number; pic: number; rot: number; sh: number };
export const layEvidence = (s: EvidenceScene & Timed, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const items = titleItem(s.title, s.a, t);
  const n = s.cards.length, two = n > 4;
  const top = s.title ? 160 : 120;
  const cw = n <= 3 ? 400 : two ? 330 : 340, chh = two ? 300 : 440;
  const rows = two ? [s.cards.slice(0, Math.ceil(n / 2)), s.cards.slice(Math.ceil(n / 2))] : [s.cards];
  const cards: CardG[] = [];
  let idx = 0;
  rows.forEach((row, r) => {
    const y0 = two ? (r === 0 ? top + 10 : top + 330) : top + 70;
    const span = 1520 - (two && r === 1 ? 260 : 0), x0 = 200 + (two && r === 1 ? 130 : 0);
    row.forEach((c, i) => {
      const cx = x0 + (span / row.length) * (i + 0.5);
      const sh = appear(t, s.a + 0.12 + 0.16 * idx, 0.35);
      const rot = [-2.2, 1.6, -1.2, 2.4, -1.8, 1.1][idx % 6];
      const cg: CardG = { id: c.id, kind: c.kind, x0: cx - cw / 2, x1: cx + cw / 2, y0, y1: y0 + chh, pic: 0, rot, sh };
      const lab = item({ key: `c.${c.id}`, text: up(c.label), role: "main", fg: "cardInk", bg: "card", weight: 800, align: "center", show: sh, maxFs: 44, minFs: 42, maxW: cw - 34, maxLines: 2, lhK: 1.08, names: true }, cx, 0);
      const subIt = c.sub ? item({ key: `c.${c.id}.sub`, text: up(c.sub), role: "sub", fg: "cardDim", bg: "card", weight: 700, align: "center", show: sh, maxFs: 32, maxW: cw - 34, names: true }, cx, 0) : null;
      const stripH = (lab.y1 - lab.y0) + (subIt ? subIt.y1 - subIt.y0 + 4 : 0) + 30;
      const ly = cg.y1 - stripH + 15;
      lab.y1 = ly + (lab.y1 - lab.y0); lab.y0 = ly;
      if (subIt) { const h = subIt.y1 - subIt.y0; subIt.y0 = lab.y1 + 4; subIt.y1 = subIt.y0 + h; items.push(lab, subIt); } else items.push(lab);
      cg.pic = cg.y1 - stripH;
      cards.push(cg);
      idx++;
    });
  });
  // strings: pin to pin, sagging; the label tag sits on the curve where it covers no card
  const pins = new Map(cards.map((c) => [c.id, [(c.x0 + c.x1) / 2, c.y0 + 18] as [number, number]]));
  const t1 = s.a + 0.12 + 0.16 * n + 0.2;
  const links = (s.links ?? []).map((l, i) => {
    const p = pins.get(l[0]), q = pins.get(l[1]);
    if (!p || !q) return null;
    const sag = 70 + 0.08 * Math.hypot(q[0] - p[0], q[1] - p[1]);
    const c: [number, number] = [(p[0] + q[0]) / 2, Math.max(p[1], q[1]) + sag];
    const lu = easeOut((t - (t1 + 0.35 * i)) / 0.45);
    return { p, q, c, u: lu, label: l[2], i, from: l[0], to: l[1] };
  }).filter(Boolean) as { p: [number, number]; q: [number, number]; c: [number, number]; u: number; label?: string; i: number; from: string; to: string }[];
  const cardRects = cards.map((c) => ({ x0: c.x0 - 6, x1: c.x1 + 6, y0: c.y0 - 6, y1: c.y1 + 6 }));
  const placedTags: { x0: number; x1: number; y0: number; y1: number }[] = [];
  for (const l of links) {
    if (!l.label) continue;
    const at = (k: number): [number, number] => [(1 - k) * (1 - k) * l.p[0] + 2 * k * (1 - k) * l.c[0] + k * k * l.q[0], (1 - k) * (1 - k) * l.p[1] + 2 * k * (1 - k) * l.c[1] + k * k * l.q[1]];
    let best: TextItem | null = null, bestHit = Infinity;
    for (const k of [0.5, 0.42, 0.58, 0.34, 0.66, 0.25, 0.75]) for (const dy of [0, 40, -40, -80, 80, -120, 120]) {
      const [x, y] = at(k);
      const it = item({ key: `link${l.i}`, text: up(l.label), role: "callout", fg: "onAccent", bg: "accent", weight: 800, align: "center", show: Math.min(l.u, appear(t, t1 + 0.35 * l.i + 0.25)), maxFs: 36, minFs: 32, maxW: 420, explains: [`c.${l.from}`, `c.${l.to}`] }, x, 0);
      centreY(it, y + dy);
      const pad = { x0: it.x0 - 14, x1: it.x1 + 14, y0: it.y0 - 6, y1: it.y1 + 6 };
      const hit = cardRects.reduce((a, r) => a + Math.max(0, Math.min(r.x1, pad.x1) - Math.max(r.x0, pad.x0)) * Math.max(0, Math.min(r.y1, pad.y1) - Math.max(r.y0, pad.y0)), 0) + (pad.y1 > SAFE.y1 ? 1e6 : 0)
        + 1e4 * placedTags.reduce((a, r) => a + Math.max(0, Math.min(r.x1, pad.x1) - Math.max(r.x0, pad.x0)) * Math.max(0, Math.min(r.y1, pad.y1) - Math.max(r.y0, pad.y0)), 0);
      if (hit < bestHit) { bestHit = hit; best = it; }
      if (hit === 0) break;
    }
    if (best) { items.push(best); placedTags.push({ x0: best.x0 - 14, x1: best.x1 + 14, y0: best.y0 - 6, y1: best.y1 + 6 }); }
  }
  return { items, stage: stageAt(move, u), g: { cards, links } };
};

// ------------------------------------------------------------------ recap
export const layRecap = (s: RecapScene & Timed, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const chip = item({ key: "chip", text: "RECAP", role: "tag", fg: "onAccent", bg: "accent", weight: 800, align: "left", show: appear(t, s.a), maxFs: 32, maxW: 300, ls: 4 }, 214, 94);
  const ti = item({ key: "title", text: up(s.title), role: "main", fg: "ink", weight: 800, align: "left", show: appear(t, s.a + 0.1), maxFs: 72, minFs: 48, maxW: 1500 }, 200, 150);
  const items = [chip, ti];
  let y = ti.y1 + 46;
  const boxes: [number, number, number][] = [];
  s.points.forEach((p, i) => {
    const sh = appear(t, s.a + 0.45 + 0.45 * i, 0.35);
    const it = item({ key: `p${i}`, text: up(p), role: "main", fg: "ink", weight: 800, align: "left", show: sh, maxFs: 64, maxW: 1380, maxLines: 2 }, 300, y);
    items.push(it); boxes.push([226, (it.y0 + it.y0 + it.lh) / 2, sh]);
    y = it.y1 + 40;
  });
  return { items, stage: stageAt(move, u), g: { boxes, chip: [chip.x0 - 14, chip.y0 - 4, chip.x1 + 14, chip.y1 + 4] } };
};

// ------------------------------------------------------------------ map
export const placeLL = (p: PlaceRef): LonLat => {
  if (Array.isArray(p)) return [p[0], p[1]];
  const c = CITIES[p];
  if (!c) throw new Error(`no bundled place "${p}"`);
  return [c[1], c[2]];
};
const hash = (s: string) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
export const rng = (seed: string) => { let x = Math.floor(hash(seed) * 2 ** 31) || 1; return () => { x = (x * 48271) % 2147483647; return x / 2147483647; }; };
const MAPR = { x0: 110, x1: 1810, y0: 170, y1: 790 } as const;
export type MapView = { lon0: number; lat0: number; lon1: number; lat1: number };
/** lon/lat -> stage px for a view box fitted (aspect kept, cos(lat) squeeze) into the map rect */
export const projector = (v: MapView) => {
  const k = Math.cos(((v.lat0 + v.lat1) / 2) * Math.PI / 180);
  const w = (v.lon1 - v.lon0) * k, h = v.lat1 - v.lat0;
  const sc = Math.min((MAPR.x1 - MAPR.x0) / w, (MAPR.y1 - MAPR.y0) / h);
  const cx = (MAPR.x0 + MAPR.x1) / 2, cy = (MAPR.y0 + MAPR.y1) / 2, mlon = (v.lon0 + v.lon1) / 2, mlat = (v.lat0 + v.lat1) / 2;
  return (p: LonLat): [number, number] => [cx + (p[0] - mlon) * k * sc, cy - (p[1] - mlat) * sc];
};
const boxOf = (b: [number, number, number, number], pad = 0.08): MapView => { const dx = (b[2] - b[0]) * pad, dy = (b[3] - b[1]) * pad; return { lon0: b[0] - dx, lat0: b[1] - dy, lon1: b[2] + dx, lat1: b[3] + dy }; };
export const mapViews = (s: MapScene) => {
  if (s.region === "city") return { from: null, to: null };
  const rb = regionBox(s.region);
  const from = boxOf(rb, 0.06);
  const pts = [...(s.pins ?? []).map((p) => placeLL(p.place)), ...(s.route ? [placeLL(s.route.from), placeLL(s.route.to)] : [])];
  if (!pts.length || s.zoom === false) return { from, to: boxOf(rb, 0.02) };
  const lo = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  // at least 38 % of the region's span around the pins (enough land to read the shape)
  const sw = Math.max(lo[2] - lo[0], (rb[2] - rb[0]) * 0.38), shh = Math.max(lo[3] - lo[1], (rb[3] - rb[1]) * 0.38);
  const mx = (lo[0] + lo[2]) / 2, my = (lo[1] + lo[3]) / 2;
  return { from, to: boxOf([mx - sw / 2, my - shh / 2, mx + sw / 2, my + shh / 2], 0.12) };
};
export const layMap = (s: MapScene & Timed & { pinAts: number[]; routeAt: number }, t: number, move: DocMove): Layout => {
  const u = (t - s.a) / (s.b - s.a);
  const items = titleItem(s.title, s.a, t);
  for (const it of items) it.bg = "card", it.fg = "cardInk", it.names = true;
  const g: Record<string, unknown> = { region: s.region };
  const pinsPx: { x: number; y: number; sh: number; label: string }[] = [];
  if (s.region === "city") {
    const z = lerp(1.18, 1.0, easeIO(u / 0.8));
    const R = rng(s.name ?? s.title ?? "city");
    const streets: [number, number, number, number, number][] = [];
    const ang = (R() - 0.5) * 0.5;
    for (let i = -7; i <= 7; i++) for (const dir of [0, 1]) {
      const off = i * (120 + R() * 30), wd = R() < 0.2 ? 18 : 8;
      const c = Math.cos(ang + dir * Math.PI / 2), sn = Math.sin(ang + dir * Math.PI / 2);
      const px = 960 - sn * off, py = 450 + c * off;
      streets.push([px - c * 1400, py - sn * 1400, px + c * 1400, py + sn * 1400, wd]);
    }
    const blocks = Array.from({ length: 26 }, () => [R() * 1920, R() * 1080, 60 + R() * 90, 40 + R() * 80, R() < 0.15 ? 1 : 0]);
    g.city = { z, streets, blocks, river: [R() * 300, 1080, 600 + R() * 400, 500 + R() * 200, 1920, R() * 300] };
    (s.pins ?? []).forEach((p, i) => pinsPx.push({ x: 960 + (i ? (i % 2 ? 260 : -260) : 0), y: 430 + (i ? 120 : 0), sh: appear(t, s.pinAts[i], 0.3), label: p.label }));
  } else {
    const V = mapViews(s);
    const e = easeIO(u / 0.75);
    const v: MapView = { lon0: lerp(V.from!.lon0, V.to!.lon0, e), lat0: lerp(V.from!.lat0, V.to!.lat0, e), lon1: lerp(V.from!.lon1, V.to!.lon1, e), lat1: lerp(V.from!.lat1, V.to!.lat1, e) };
    const P = projector(v);
    g.land = Object.values(LAND).map((poly) => poly.map(P));
    g.regionPolys = s.region === "world" ? [] : COUNTRIES[s.region].poly.map((poly) => poly.map(P));
    g.regionU = appear(t, s.a + 0.1, 0.6);
    (s.pins ?? []).forEach((p, i) => { const [x, y] = P(placeLL(p.place)); pinsPx.push({ x, y, sh: appear(t, s.pinAts[i], 0.3), label: p.label }); });
    if (s.route) {
      const [x0, y0] = P(placeLL(s.route.from)), [x1, y1] = P(placeLL(s.route.to));
      const ru = easeIO((t - s.routeAt) / 1.0);
      g.route = { x0, y0, x1, y1, u: ru, c: [(x0 + x1) / 2, Math.min(y0, y1) - 0.25 * Math.hypot(x1 - x0, y1 - y0)] };
      if (s.route.label) { const it = item({ key: "route", text: up(s.route.label), role: "callout", fg: "cardInk", bg: "card", weight: 800, align: "center", show: appear(t, s.routeAt + 0.6), maxFs: 40, minFs: 32, maxW: 600, explains: (s.pins ?? []).map((_, i) => `pin${i}`) }, (x0 + x1) / 2, 0); centreY(it, Math.min(y0, y1) - 0.25 * Math.hypot(x1 - x0, y1 - y0) - 40); items.push(it); }
    }
  }
  pinsPx.forEach((p, i) => {
    const lab = item({ key: `pin${i}`, text: up(p.label), role: "main", fg: "cardInk", bg: "card", weight: 800, align: "left", show: p.sh, maxFs: 46, minFs: 42, maxW: 760, names: true }, p.x + 40, 0);
    centreY(lab, p.y);
    if (lab.x1 > MAPR.x1) { const w = lab.x1 - lab.x0; lab.x1 = p.x - 40; lab.x0 = lab.x1 - w; lab.align = "right"; }
    if (lab.y1 > SAFE.y1 - 8) { const h = lab.y1 - lab.y0; lab.y1 = p.y - 36; lab.y0 = lab.y1 - h; }
    items.push(lab);
  });
  g.pins = pinsPx;
  return { items, stage: stageAt(move, u), g };
};

export const DEFAULT_MOVE: Record<string, DocMove> = { map: "push", timeline: "drift", document: "push", quote: "push", compare: "drift", chart: "rise", evidenceboard: "panR", recap: "drift", stat: "push" };
/** the "set" of a 2D scene for the variety rules (type + set + camera) */
export const setKey = (s: { type: string; [k: string]: unknown }) => {
  switch (s.type) {
    case "map": return String(s.region);
    case "document": return String(s.kind);
    case "chart": return String(s.kind);
    case "timeline": return "strip";
    case "quote": return "quote";
    case "compare": return "split";
    case "evidenceboard": return "board";
    case "recap": return "list";
    case "stat": return "number";
    default: return String(s.set ?? "");
  }
};
