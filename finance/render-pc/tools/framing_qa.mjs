// framing_qa.mjs: the screen-space framing QA shared by every engine (Block Money and the four kits).
// Each builder hands it a scene sampler: sample(t) -> what the shot camera sees at t (views, actors, the shot's subject,
// text boards, other props, 2D cards). Everything is projected through the shot camera (incl. its roll) into output
// pixels, every output frame (30 fps; long-form: every Nth frame). Six rules (RECIPE_GUIDE.md "Framing rules"):
//   R1 CLIP  a board, sign or prop over an actor's head box (head + antennae / hair / hat), on screen
//   R2 FAIL  the shot's subject cut by the frame: < 85 % of its body box (horizontally) inside, or its head box touching
//            an edge; any named actor whose head is cut by an edge
//   R3 FAIL  a landed board / text box past the frame edge (margin 3 % of the frame width)
//   R4 FAIL  board text contrast below 4.5:1 (WCAG), or a featured board's main line under 42 px (cap height, 1080 wide)
//   R5 FAIL  frame 0: the hook text smaller than the engine's hook size, or the subject's face smaller than a close shot
//   R6 FAIL  the burned-in word caption (bottom-centre band, the real line boxes of the chunk on screen) over a
//            character's face, head or neck / collar (actors >= 15 % of the frame height; lasting >= 3 frames)
// Messages say what to move where, in the recipe's own units (metres, shot ids, prop ids).
import { readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ------------------------------------------------------------------ rule numbers (see RECIPE_GUIDE.md "Framing rules")
export const RULES = {
  fps: 30,
  persist: 3, //            frames a violation must last (0.1 s): a board flying THROUGH a face or a whip pan is motion
  headPad: 4, //            px of overlap (screen rects) needed before R1 looks closer (touching is fine)
  headArea: 144, //         px² of overlap of the exact silhouettes (12 x 12 px at 1080 wide) for R1 to fire
  propDepth: 0.6, //        m: a non-text prop counts for R1 only when its box is this close to the head box (a car 2 m behind is set)
  subjectInside: 0.85, //   R2: share of the subject's body box (horizontal extent) inside the frame
  headEdge: 0.01, //        R2: the head box must stay this share of the frame width away from every edge (11 px)
  edgeMargin: 0.03, //      R3: share of the frame width (32 px at 1080)
  contrast: 4.5, //         R4: WCAG AA
  textPx: 42, //            R4: main-line FONT size (em, like CSS font-size) at 1080 px wide; measured as the glyph cap
  //                          height (0.709 em in Poppins 800, so 29.8 px cap). Not 42 px of cap height: that would ask
  //                          for a 59 px font and fail every kit's 50-54 px callout label; 42 px em also equals the
  //                          existing long-form rule (cap >= 30 px at 1080 tall)
  closeFace: 0.16, //       R5: frame-0 subject head height >= 16 % of the frame height (307 px at 1920)
  capActor: 0.15, //        R6: actors whose body is shorter than this share of the frame height are background (ignored)
  neckDrop: 0.3, //         R6: the neck / collar box hangs this share of the face-box height below the face box (0.5
  //                          reached the shirt front on law3d close shots: chest in the band is the owner's rule v2)
  capPad: 6, //             R6: px the caption line box and the face/neck silhouette must overlap on both axes
  capArea: 400, //          R6: px² of overlap (20 x 20 px at 1080 wide) for R6 to fire (a stroke grazing the chin is fine)
  capMargin: 12, //         R6: px of air the advice leaves between the neck box and the caption band
};

// ------------------------------------------------------------------ R6: the word-caption line boxes
/** caption words as the kits' caption components print them: trailing punctuation and quotes off, upper case */
export const capWord = (w) => String(w ?? "").replace(/[.,!?…:;"]+$/, "").replace(/^"/, "").toUpperCase();
/**
 * The on-screen line boxes (output px) of a caption chunk, laid out like the components do (Poppins 800, uppercase):
 *  mode "short": RecipeCaptions / TechCaptions / LawCaptions / BizCaptions / CyberCaptions: a flex-wrap row centred in a
 *                box `side`..W-`side` wide and `box` px tall centred on `centre`; word gap 0.28 em, line height 1.05 em;
 *                wrapped lines share the box height equally (align-content: stretch)
 *  mode "lower": LowerThirdCaptions (long-form): at most 2 balanced lines in the 240..W-240 column, line height 1.12 em,
 *                centred on `centre`; word gap 0.26 em
 * `stroke` px of text stroke stick out of the glyphs on every side (half the CSS stroke width: paint-order stroke fill).
 */
export const captionLines = (words, o) => {
  const fs = o.fs, W = o.W, ws = words.map(capWord).filter(Boolean);
  if (!ws.length) return [];
  const lower = o.mode === "lower";
  const gap = fs * (lower ? 0.26 : 0.28), maxW = W - 2 * o.side, lh = fs * (lower ? 1.12 : 1.05), st = o.stroke ?? 7;
  const wid = ws.map((w) => textEm(w) * fs);
  const lineW = (a, b) => wid.slice(a, b).reduce((x, y) => x + y, 0) + gap * Math.max(0, b - a - 1);
  let lines = [];
  if (lower) {
    if (lineW(0, ws.length) <= maxW || ws.length === 1) lines = [[0, ws.length]];
    else {
      let best = 1;
      for (let k = 1; k < ws.length; k++) if (Math.max(lineW(0, k), lineW(k, ws.length)) < Math.max(lineW(0, best), lineW(best, ws.length))) best = k;
      lines = [[0, best], [best, ws.length]];
    }
  } else {
    let a = 0;
    for (let i = 1; i <= ws.length; i++) if (i === ws.length || lineW(a, i + 1) > maxW) { lines.push([a, i]); a = i; }
  }
  const n = lines.length, box = o.box ?? 240;
  return lines.map(([a, b], i) => {
    const w = Math.min(maxW, lineW(a, b)), cy = lower ? o.centre + (n === 1 ? 0 : (i - 0.5) * lh) : o.centre - box / 2 + ((i + 0.5) * box) / n;
    return { x0: W / 2 - w / 2 - st, x1: W / 2 + w / 2 + st, y0: cy - lh / 2 - st, y1: cy + lh / 2 + st, text: ws.slice(a, b).join(" ") };
  });
};

// ------------------------------------------------------------------ colour
const hex = (c) => {
  let s = String(c).trim().replace(/^#/, "");
  if (s.length === 3) s = s.split("").map((x) => x + x).join("");
  if (!/^[0-9a-f]{6}/i.test(s)) return null;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};
const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export const luminance = (c) => { const r = hex(c); return r ? 0.2126 * lin(r[0]) + 0.7152 * lin(r[1]) + 0.0722 * lin(r[2]) : null; };
/** WCAG 2 contrast ratio of two #rrggbb colours (null if either is not a hex colour) */
export const contrastRatio = (a, b) => {
  const la = luminance(a), lb = luminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const toHex = (r) => "#" + r.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
/** the nearest colour to `adj` (same hue, darker or lighter, whichever gets there first) that reaches `need` against
 *  `fixed`; null if none. fixFill(fg, bg) adjusts the fill, fixFill(bg, fg) the text. */
export const fixFill = (fixed, adj, need = RULES.contrast) => {
  const b = hex(adj); if (!b) return null;
  for (let k = 1; k <= 40; k++) {
    const u = k / 40;
    for (const darker of [luminance(fixed) > 0.18, luminance(fixed) <= 0.18]) {
      const c = toHex(b.map((v) => (darker ? v * (1 - u) : v + (1 - v) * u)));
      if (contrastRatio(fixed, c) >= need + 0.05) return c;
    }
  }
  return null;
};

// ------------------------------------------------------------------ Poppins ExtraBold metrics (canvas measureText, no kerning)
let FONT = null;
const font = () => {
  if (FONT) return FONT;
  const buf = readFileSync(join(ROOT, "public/fonts/Poppins-ExtraBold.ttf"));
  const u16 = (o) => buf.readUInt16BE(o), i16 = (o) => buf.readInt16BE(o), u32 = (o) => buf.readUInt32BE(o);
  const tables = {};
  for (let i = 0, n = u16(4); i < n; i++) { const o = 12 + 16 * i; tables[buf.toString("latin1", o, o + 4)] = u32(o + 8); }
  const upem = u16(tables.head + 18);
  const nHM = u16(tables.hhea + 34);
  const capH = tables["OS/2"] && u16(tables["OS/2"]) >= 2 ? i16(tables["OS/2"] + 88) : Math.round(0.7 * upem);
  const adv = (g) => u16(tables.hmtx + 4 * Math.min(g, nHM - 1));
  // cmap format 4 (BMP)
  const cm = tables.cmap; let sub = 0;
  for (let i = 0, n = u16(cm + 2); i < n; i++) { const pid = u16(cm + 4 + 8 * i), eid = u16(cm + 6 + 8 * i), off = u32(cm + 8 + 8 * i); if (pid === 3 && (eid === 1 || eid === 10) && u16(cm + off) === 4) { sub = cm + off; break; } }
  const seg = u16(sub + 6) / 2, ends = sub + 14, starts = ends + 2 * seg + 2, deltas = starts + 2 * seg, ranges = deltas + 2 * seg;
  const glyph = (code) => {
    for (let i = 0; i < seg; i++) {
      if (u16(ends + 2 * i) < code) continue;
      const st = u16(starts + 2 * i); if (st > code) return 0;
      const ro = u16(ranges + 2 * i), d = i16(deltas + 2 * i);
      if (!ro) return (code + d) & 0xffff;
      const g = u16(ranges + 2 * i + ro + 2 * (code - st));
      return g ? (g + d) & 0xffff : 0;
    }
    return 0;
  };
  const cache = new Map();
  FONT = { upem, capH: capH / upem, width: (s) => { let w = 0; for (const ch of String(s)) { const c = ch.codePointAt(0); let a = cache.get(c); if (a === undefined) { a = adv(glyph(c)) / upem; cache.set(c, a); } w += a; } return w; } };
  return FONT;
};
/** width of a line in em (Poppins 800) */
export const textEm = (s) => font().width(s);
/** cap height / em of Poppins 800 */
export const capRatio = () => font().capH;
/** canvas fit (the textTex / BigBlock rule): font px px, shrunk so the line is <= maxW px wide */
export const fitPx = (line, px, maxW) => { const w = textEm(line) * px; return w > maxW ? px * (maxW / w) : px; };

// ------------------------------------------------------------------ projection (three.js PerspectiveCamera, vertical fov, roll)
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/** camera basis: forward f, screen right r, screen up u (View.tsx rotates the up vector by roll degrees about f) */
export const basis = (cam) => {
  const f = nrm(sub(cam.look, cam.pos));
  const r0 = nrm(crs(f, [0, 1, 0])), u0 = crs(r0, f);
  const a = ((cam.roll ?? 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const u = [u0[0] * c + r0[0] * s, u0[1] * c + r0[1] * s, u0[2] * c + r0[2] * s];
  return { f, r: crs(f, u), u };
};
/** a world point -> output pixels in view v ({cam, left, top, w, h}); null behind the lens. k = px per metre at that depth */
export const proj = (v, p) => {
  const B = v.B ?? (v.B = basis(v.cam));
  const d = sub(p, v.cam.pos), z = dot(d, B.f);
  if (z <= 0.05) return null;
  const k = v.h / 2 / Math.tan((v.cam.fov * Math.PI) / 360) / z;
  return { x: v.left + v.w / 2 + dot(d, B.r) * k, y: v.top + v.h / 2 - dot(d, B.u) * k, z, k };
};
/** the 8 corners of a box {c, h, yaw?} (yaw about +y, radians) */
export const corners = (b) => {
  const out = [], cy = Math.cos(b.yaw ?? 0), sy = Math.sin(b.yaw ?? 0);
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) {
    const lx = dx * b.h[0], lz = dz * b.h[2];
    out.push([b.c[0] + lx * cy + lz * sy, b.c[1] + dy * b.h[1], b.c[2] - lx * sy + lz * cy]);
  }
  return out;
};
/** 3D gap (m) between two boxes (their world AABBs; 0 when they touch or overlap) */
export const boxGap = (a, b) => {
  const ext = (bx) => { const cs = corners(bx); return [0, 1, 2].map((k) => [Math.min(...cs.map((c) => c[k])), Math.max(...cs.map((c) => c[k]))]); };
  const A = ext(a), B = ext(b);
  return Math.hypot(...[0, 1, 2].map((k) => Math.max(0, A[k][0] - B[k][1], B[k][0] - A[k][1])));
};
/** screen rect of world points; null if any is behind the lens */
export const rectOf = (v, pts) => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity, k = 0;
  for (const p of pts) {
    const q = proj(v, p); if (!q) return null;
    x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); k = Math.max(k, q.k);
  }
  return { x0, x1, y0, y1, z0, z1, k };
};
export const boxRect = (v, b) => rectOf(v, corners(b));
/** the exact screen silhouette of a box: the convex hull of its 8 projected corners (null if any is behind the lens) */
export const boxHull = (v, b) => {
  const ps = [];
  for (const c of corners(b)) { const q = proj(v, c); if (!q) return null; ps.push([q.x, q.y]); }
  ps.sort((a, b2) => a[0] - b2[0] || a[1] - b2[1]);
  const cr = (o, a, b2) => (a[0] - o[0]) * (b2[1] - o[1]) - (a[1] - o[1]) * (b2[0] - o[0]);
  const lo = [], hi = [];
  for (const p of ps) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
};
const polyArea = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q2 = P[(i + 1) % P.length]; a += p[0] * q2[1] - q2[0] * p[1]; } return Math.abs(a) / 2; };
/** area of the intersection of two convex polygons (Sutherland-Hodgman; both counter-clockwise from boxHull) */
export const hullOverlap = (A, B) => {
  if (!A || !B || A.length < 3 || B.length < 3) return 0;
  let out = A;
  for (let i = 0; i < B.length && out.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    const side = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const inp = out; out = [];
    for (let j = 0; j < inp.length; j++) {
      const p = inp[j], q2 = inp[(j + 1) % inp.length], sp = side(p), sq = side(q2);
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const u = sp / (sp - sq); out.push([p[0] + u * (q2[0] - p[0]), p[1] + u * (q2[1] - p[1])]); }
    }
  }
  return out.length >= 3 ? polyArea(out) : 0;
};
const unionRect = (rs) => rs.filter(Boolean).reduce((a, r) => (a ? { x0: Math.min(a.x0, r.x0), x1: Math.max(a.x1, r.x1), y0: Math.min(a.y0, r.y0), y1: Math.max(a.y1, r.y1), z0: Math.min(a.z0, r.z0), z1: Math.max(a.z1, r.z1), k: Math.max(a.k, r.k) } : { ...r }), null);
const inter = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const ox = (a, b) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
const oy = (a, b) => Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
const viewRect = (v) => ({ x0: v.left, x1: v.left + v.w, y0: v.top, y1: v.top + v.h });
/** overlap (px²) of a convex screen polygon with an actor's head: the head proper plus each antenna / hair / hood part
 *  (a.headParts, else the one head box), so the empty air between two antennae does not count */
const headOverlap = (v, poly, a) => {
  if (!poly) return 0;
  let best = 0;
  for (const b of a.headParts ?? [a.head]) {
    let hh = null;
    if (b.r !== undefined) {
      // a sphere part ({c, r}): its outline is a circle of r * k px (16-gon, the same winding as boxHull)
      const q2 = proj(v, b.c); if (q2) { const R = b.r * q2.k; hh = Array.from({ length: 16 }, (_, i) => [q2.x + R * Math.cos((i * Math.PI) / 8), q2.y + R * Math.sin((i * Math.PI) / 8)]); }
    } else hh = boxHull(v, b);
    if (hh) best = Math.max(best, hullOverlap(poly, hh));
  }
  return best;
};
/** text plane {c, w, h, yaw, flat?}: its 4 corners (front face; flat = lying on a table, text up the depth) */
const planePts = (pl) => {
  const cy = Math.cos(pl.yaw ?? 0), sy = Math.sin(pl.yaw ?? 0), out = [];
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
    const lx = (dx * pl.w) / 2, ly = (dy * pl.h) / 2;
    if (pl.flat) out.push([pl.c[0] + lx * cy + ly * sy, pl.c[1], pl.c[2] - lx * sy + ly * cy]);
    else out.push([pl.c[0] + lx * cy, pl.c[1] + ly, pl.c[2] - lx * sy]);
  }
  return out;
};
/** on-screen length of a world segment of length g (m) at p along the plane's text-up axis */
const segPx = (v, p, g, pl) => {
  const ax = pl && pl.flat ? [Math.sin(pl.yaw ?? 0) * g / 2, 0, Math.cos(pl.yaw ?? 0) * g / 2] : [0, g / 2, 0];
  const a = proj(v, [p[0] + ax[0], p[1] + ax[1], p[2] + ax[2]]), b = proj(v, [p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]]);
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
};

// ------------------------------------------------------------------ message helpers
const f1 = (x) => (Math.abs(x) < 0.05 ? "0" : (x > 0 ? "+" : "") + x.toFixed(1));
const f2 = (x) => (x > 0 ? "+" : "") + x.toFixed(2);
const q = (s) => `'${String(s).replace(/\s+/g, " ").trim()}'`;
/** a screen move of (dxPx, dyPx) at depth k (px/m) as a world offset "dx,dy,dz" (screen right = the camera's right) */
const worldMove = (v, dxPx, dyPx, k) => {
  const B = v.B ?? (v.B = basis(v.cam));
  const mx = dxPx / k, my = -dyPx / k;
  const w = [B.r[0] * mx + B.u[0] * my, B.r[1] * mx + B.u[1] * my, B.r[2] * mx + B.u[2] * my];
  return { v: w, s: `${f2(w[0])},${f2(w[1])},${f2(w[2])}`, m: Math.hypot(...w) };
};

/**
 * Run the six rules.
 * @param o.times     output times to sample (s)
 * @param o.sample    (t) => scene (see below)
 * @param o.W, o.H    output frame size
 * @param o.landscape long-form (R5 skipped; the text rule scales RULES.textPx by H / 1080)
 * @param o.frame0    { hookPx, hookMinPx, hookLabel } for R5 (the face part comes from sample(0))
 * R6 reads scene.caption = { text, lines: captionLines(...) } (null while no caption is on screen), each view's lens
 * `face` fraction (views[i].face, for the advice) and per actor optional `face`, `neckDrop`, `yaw`, `faceTarget` (the
 * kit's camera target for that face, default "<id>.face"; biz3d "<id>.head").
 * scene: { shot, shotLabel?, views: [{cam, left, top, w, h, name?}], actors: [{id, head:{c,h}, parts:[{c,h}], named}],
 *          subjects: [{id, view, why}], boards: [{key, label, box:{c,h,yaw}, plane?:{c,w,h,yaw,flat}, lines:[{text, capM, fg}],
 *          bg, featured, landed, edge, ownerFg?, fix?}], props: [{key, box}], cards: [{key, label, x0,x1,y0,y1, lines:[{text,capPx,fg}], bg, landed}] }
 */
export const framingQA = (o) => {
  const W = o.W, H = o.H, LS = !!o.landscape;
  const out = { r1: new Map(), r2: new Map(), r3: new Map(), r4c: new Map(), r4h: new Map(), r5: [], r6: new Map() };
  const run = new Map(); // key -> consecutive frames
  const seen = new Set();
  const capMin = RULES.textPx * capRatio() * (LS ? H / 1080 : W / 1080); // in cap-height px
  const edgeM = RULES.edgeMargin * W;
  const textH = new Map(); // shot|board -> {best, t, cap, label, k, lines}
  // a finding is reported once it lasts RULES.persist frames; its advice comes from its WORST frame (largest `sev`), so
  // a push-in or a slam that makes it worse later gets a move big enough for the whole shot
  const worst = new Map();
  const persist = (key, ok, store, mk, sev = 0) => {
    seen.add(key);
    if (ok) { run.set(key, 0); return; }
    const n = (run.get(key) ?? 0) + 1; run.set(key, n);
    const id = key.replace(/@.*$/, "");
    if (n < RULES.persist) return;
    const w = worst.get(store)?.get(id);
    if (store.has(id) && w !== undefined && sev <= w) return;
    store.set(id, mk());
    if (!worst.has(store)) worst.set(store, new Map());
    worst.get(store).set(id, sev);
  };
  // R6: the zones a caption may not cover: the head (incl. hair / antennae), the face and the neck / upper chest (a box
  // hanging RULES.neckDrop x the face-box height below the face box, as wide as the face; a.neckDrop overrides it)
  const zonesOf = (a) => {
    const f = a.face ?? a.head, d = (a.neckDrop ?? RULES.neckDrop) * 2 * f.h[1];
    const neck = { c: [f.c[0], f.c[1] - f.h[1] - d / 2, f.c[2]], h: [f.h[0], d / 2, f.h[2]], yaw: f.yaw ?? a.yaw ?? 0 };
    return [...(a.headParts ?? [a.head]).map((b) => ["head", b]), ["face", f], ["neck", neck]];
  };
  const hullOf = (v, b) => {
    if (b.r === undefined) return boxHull(v, b);
    const q2 = proj(v, b.c); if (!q2) return null;
    const R = b.r * q2.k; return Array.from({ length: 16 }, (_, i) => [q2.x + R * Math.cos((i * Math.PI) / 8), q2.y + R * Math.sin((i * Math.PI) / 8)]);
  };
  const hullRect = (P) => ({ x0: Math.min(...P.map((p) => p[0])), x1: Math.max(...P.map((p) => p[0])), y0: Math.min(...P.map((p) => p[1])), y1: Math.max(...P.map((p) => p[1])) });
  const roomMin = new Map();
  const r6 = (sc, v, vi, vname, VR, acts, ts) => {
    const cap = sc.caption;
    // the caption lines clipped to this view (a split screen: the caption sits over the bottom view)
    const lines = cap.lines.map((l) => ({ ...l, x0: Math.max(l.x0, VR.x0), x1: Math.min(l.x1, VR.x1), y0: Math.max(l.y0, VR.y0), y1: Math.min(l.y1, VR.y1) })).filter((l) => l.x1 - l.x0 > 1 && l.y1 - l.y0 > 1);
    for (const { a, head, body } of acts) {
      if (!a.named || !head || !body) continue;
      const key = `r6|${sc.shot}|${a.id}${vname}`;
      // tiny background figures do not count (their whole body under 15 % of the frame height)
      if (!lines.length || body.y1 - body.y0 < RULES.capActor * H) { persist(key, true, out.r6, () => ""); continue; }
      let best = null;
      const zs = zonesOf(a).map(([part, b]) => { const P = hullOf(v, b); return P ? { part, P, r: hullRect(P) } : null; }).filter(Boolean);
      for (const l of lines) {
        const poly = [[l.x0, l.y0], [l.x1, l.y0], [l.x1, l.y1], [l.x0, l.y1]].reverse();
        for (const z of zs) {
          if (ox(l, z.r) <= RULES.capPad || oy(l, z.r) <= RULES.capPad) continue;
          const A = hullOverlap(poly, z.P);
          if (A >= RULES.capArea * (W / 1080) ** 2 && (!best || A > best.A || (A === best.A && z.part === "face"))) best = { A, z, l };
        }
      }
      persist(key, !best, out.r6, () => (roomShot) => {
        // the whole protected zone (head + face + neck) on screen, and the band the caption takes in this frame
        const zr = zs.reduce((u, z) => ({ x0: Math.min(u.x0, z.r.x0), x1: Math.max(u.x1, z.r.x1), y0: Math.min(u.y0, z.r.y0), y1: Math.max(u.y1, z.r.y1) }), { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity });
        const bandTop = Math.min(...lines.map((l) => l.y0)), capX0 = Math.min(...lines.map((l) => l.x0)), capX1 = Math.max(...lines.map((l) => l.x1));
        const faceR = zs.find((z) => z.part === "face")?.r ?? head;
        const part = best.z.part === "neck" && (a.neckDrop ?? RULES.neckDrop) < 0.25 ? "chin" : best.z.part === "neck" ? (best.l.y0 < faceR.y1 + 0.12 * (faceR.y1 - faceR.y0) ? "chin / neck" : "neck / collar") : best.z.part;
        const fixes = [];
        // 1) higher in frame: lift everything by `lift` px (the lens face fraction is where the target sits from the top)
        const lift = zr.y1 - (bandTop - RULES.capMargin);
        const room = Math.min(zr.y0 - (VR.y0 + RULES.headEdge * W) - 4, roomShot ?? Infinity); // R2: the head box must stay clear of the top edge, all shot long
        const vf = v.face;
        const okF = (x) => vf === undefined || vf - x / v.h >= 0.05; // a lens face fraction stays >= 0.05
        if (lift <= room && okF(lift)) fixes.push(`put ${a.id} higher in frame: lift it ${lift.toFixed(0)} px (${vf !== undefined ? `cam.face ${vf.toFixed(2)} -> ${(vf - lift / v.h).toFixed(2)}` : `cam.face -${(lift / v.h).toFixed(2)}`}, or aim cam.target lower on the body; its head keeps >= ${(room - lift).toFixed(0)} px below the top all shot)`);
        // 2) pull back: on-screen sizes scale about the camera target (it stays at the face fraction); the zone's bottom
        //    must come up to the band top
        const yt = vf !== undefined ? v.top + vf * v.h : (faceR.y0 + faceR.y1) / 2;
        const room2 = bandTop - RULES.capMargin - yt;
        const Nb = room2 > 20 && zr.y1 > yt ? Math.max(1.05, ((zr.y1 - yt) / room2) * 1.04) : Infinity;
        if (Nb <= 2.5) fixes.push(`pull the camera back (cam.dist x${Nb.toFixed(2)})`);
        if (lift > room || !okF(lift)) {
          // lifting alone would push the head into the top edge: lift what the head room allows, then pull back about the
          // lifted target; if the target is still under the caption, the camera has to aim higher (at the face)
          const L = Math.max(0, Math.min(room, vf === undefined ? room : (vf - 0.05) * v.h)), yt2 = yt - L, r3 = bandTop - RULES.capMargin - yt2;
          const lifted = vf !== undefined ? `cam.face ${vf.toFixed(2)} -> ${(vf - L / v.h).toFixed(2)}` : `cam.face -${(L / v.h).toFixed(2)}`;
          const N3 = r3 > 20 ? Math.max(1.05, ((zr.y1 - L - yt2) / r3) * 1.04) : Infinity;
          if (N3 <= 2.5) fixes.push(`lift it ${L.toFixed(0)} px (${lifted}) and pull the camera back (cam.dist x${N3.toFixed(2)})`);
          else {
            // re-aimed at the face centre placed at 0.40 of the view height: the neck bottom hangs (zone bottom - face
            // centre) px under it at today's size, and must end above the band
            const fc = (faceR.y0 + faceR.y1) / 2, yf = v.top + 0.4 * v.h, N = Math.max(1, ((zr.y1 - fc) / Math.max(20, bandTop - RULES.capMargin - yf)) * 1.04);
            if (N > 2.5) fixes.push(`${a.id}'s head sits in the caption band (y ${zr.y0.toFixed(0)}-${zr.y1.toFixed(0)}): aim this shot at ${a.id} (cam.target "${a.faceTarget ?? `${a.id}.face`}" with cam.face 0.40), or move ${a.id} out of the shot or behind the subject`);
            else fixes.push(`aim the camera at the face (cam.target "${a.faceTarget ?? `${a.id}.face`}" with cam.face 0.40${N > 1.01 ? `, cam.dist x${N.toFixed(2)}` : ""}): ${yt > bandTop ? `the camera target sits ${(yt - bandTop).toFixed(0)} px below the caption top, so` : "the head has only"} ${yt > bandTop ? `lifting it ${L.toFixed(0)} px or pulling back alone cannot clear the neck` : `${L.toFixed(0)} px to rise and pulling back alone would take more than cam.dist x2.5`}`);
          }
        }
        // 3) move the actor sideways, out of the caption's width (captions are centred, 1-3 words)
        const dxR = capX1 - zr.x0 + 8, dxL = -(zr.x1 - capX0 + 8);
        const dx = Math.abs(dxR) < Math.abs(dxL) ? dxR : dxL;
        const k = head.k || 1, mv = worldMove(v, dx, 0, k);
        // only when the head stays in frame and, on a close shot, near the middle (R2)
        const hc = (head.x0 + head.x1) / 2 + dx, hw = VR.x1 - VR.x0;
        if (head.x0 + dx >= VR.x0 + RULES.headEdge * W && head.x1 + dx <= VR.x1 - RULES.headEdge * W && Math.abs(hc - (VR.x0 + VR.x1) / 2) <= 0.3 * hw) fixes.push(`move ${a.id} ${mv.m.toFixed(2)} m to screen-${dx > 0 ? "right" : "left"} (add ${mv.s} to its at) so the caption (x ${capX0.toFixed(0)}-${capX1.toFixed(0)}) clears it`);
        return `FAIL ${sc.shot}${vname} caption ${q(cap.text ?? best.l.text)} covers ${a.id}'s ${part} (worst at ${ts}: caption line ${q(best.l.text)} x ${best.l.x0.toFixed(0)}-${best.l.x1.toFixed(0)}, y ${best.l.y0.toFixed(0)}-${best.l.y1.toFixed(0)}; ${a.id} head-to-neck box y ${zr.y0.toFixed(0)}-${zr.y1.toFixed(0)}, ${best.A.toFixed(0)} px² covered). Fix: ${fixes.join(", or ")}`;
      }, best ? Math.max(...zs.map((z) => z.r.y1)) - Math.min(...lines.map((l) => l.y0)) + best.A * 1e-6 : 0); // worst frame = the most lift needed
    }
  };
  const T0 = Date.now();
  let frames = 0;
  for (const t of o.times) {
    const sc = o.sample(t);
    if (!sc) continue;
    frames++;
    const ts = `${t.toFixed(2)} s`;
    for (let vi = 0; vi < sc.views.length; vi++) {
      const v = sc.views[vi], VR = viewRect(v), vname = sc.views.length > 1 ? ` (${v.name ?? `view ${vi + 1}`})` : "";
      // ---- actors on screen
      const acts = sc.actors.map((a) => {
        const head = boxRect(v, a.head);
        const body = unionRect([head, ...a.parts.map((b) => boxRect(v, b))]);
        return { a, head, body };
      });
      // ---- R1: boards / props over a head
      for (const { a, head } of acts) {
        if (!head || !a.named) continue;
        const onScreen = inter(head, VR) > 0;
        const items = [...sc.boards.map((b) => ({ b, text: true })), ...(sc.props ?? []).map((b) => ({ b, text: false }))];
        for (const it of items) {
          const key = `r1|${sc.shot}|${it.b.key}|${a.id}${vname}`;
          const r = onScreen ? boxRect(v, it.b.box) : null;
          let bad = false, ovA = 0;
          if (r && ox(r, head) > RULES.headPad && oy(r, head) > RULES.headPad && inter(r, VR) > 0 && (ovA = headOverlap(v, boxHull(v, it.b.box), a)) >= RULES.headArea * (W / 1080) ** 2) {
            // text boards count at any depth (they hide the head or the head hides them: S07 of minimum-payment-trap, the
            // antennae over the OWE block 3 m behind); other props only when their box is within propDepth of the head box
            // big non-text props (cars, sofas, counters: a box half-size > 0.75 m) are staging, like the set: the 3D clip QA
            // keeps them out of bodies, and an actor in front of their car is a normal shot
            bad = it.text || (Math.max(...it.b.box.h) <= 0.75 && boxGap(it.b.box, a.head) < RULES.propDepth);
          }
          persist(key, !bad, out.r1, () => {
            const label = it.b.label ? `${it.b.key} ${q(it.b.label)}` : it.b.key;
            // the four ways out (screen px -> metres at the board's depth); "down" only for boards off the floor
            const opts = [["up", 0, -(r.y1 - head.y0 + 8)], ["right of", head.x1 - r.x0 + 8, 0], ["left of", -(r.x1 - head.x0 + 8), 0]];
            if (it.b.box.c[1] - it.b.box.h[1] > 0.3) opts.push(["down", 0, head.y1 - r.y0 + 8]);
            const mv = opts.map(([w, dx, dy]) => ({ w, ...worldMove(v, dx, dy, r.k) })).sort((x, y) => x.m - y.m).slice(0, 2);
            const say = (o) => (o.w === "up" || o.w === "down" ? `${o.w} ${o.m.toFixed(2)} m` : `${o.m.toFixed(2)} m to screen-${o.w.replace(" of", "")} of ${a.id}`) + ` (add ${o.s} to its at)`;
            const where = r.z0 > head.z1 ? "behind" : r.z1 < head.z0 ? "in front of" : "at";
            const tgt = it.b.target ? ` The camera aims at this board, so moving the board moves the camera too: move ${a.id} instead, or aim the camera at ${a.id} and keep the board beside the head.` : "";
            return `CLIP ${sc.shot}${vname} ${it.text ? "board" : "prop"} ${label} is on ${a.id}'s head on screen (${where} the head; head box incl. antennae/hair; worst at ${ts}): move it ${say(mv[0])} or ${say(mv[1])}, or move ${a.id} clear of it.${tgt}`;
          }, ovA);
        }
      }
      // ---- R1 for 2D cards (kits' DOM labels, boards, devices): a card over a head on screen
      for (const { a, head } of acts) {
        if (!head || !a.named || inter(head, VR) <= 0) continue;
        for (const c of sc.cards ?? []) {
          if (!c.landed || (c.view !== undefined && c.view !== vi)) continue;
          const poly = [[c.x0, c.y0], [c.x1, c.y0], [c.x1, c.y1], [c.x0, c.y1]].reverse();
          const bad = ox(c, head) > RULES.headPad && oy(c, head) > RULES.headPad && headOverlap(v, poly, a) >= RULES.headArea * (W / 1080) ** 2;
          persist(`r1c|${sc.shot}|${c.key}|${a.id}`, !bad, out.r1, () => `CLIP ${sc.shot} card ${c.key} ${q(c.label)} covers ${a.id}'s head on screen (head box incl. ${a.extra ?? "antenna/hair"}) at ${ts} (card x ${c.x0.toFixed(0)}-${c.x1.toFixed(0)}, y ${c.y0.toFixed(0)}-${c.y1.toFixed(0)}; head x ${head.x0.toFixed(0)}-${head.x1.toFixed(0)}, y ${head.y0.toFixed(0)}-${head.y1.toFixed(0)}): ${c.fix ?? `frame ${a.id} on the other side of the screen (cam.az or the target), or move the card`}`);
        }
      }
      // ---- R2: the subject in frame; any named actor's head not cut by an edge
      const hm = RULES.headEdge * W;
      for (const { a, head, body } of acts) {
        if (!a.named || !head) continue;
        const hIn = inter(head, VR) / Math.max(1, (head.x1 - head.x0) * (head.y1 - head.y0));
        // "the shot's only actor" is the subject only while their head is (mostly) on screen; an insert shot of a hand is fine
        const subj = sc.subjects.find((s) => s.id === a.id && s.view === vi && (!s.ifVisible || hIn >= 0.5));
        if (subj) {
          const bw = Math.max(1, body.x1 - body.x0), inX = Math.max(0, Math.min(body.x1, VR.x1) - Math.max(body.x0, VR.x0)) / bw;
          const touch = head.x0 < VR.x0 + hm || head.x1 > VR.x1 - hm || head.y0 < VR.y0 + hm || head.y1 > VR.y1 - hm;
          // a close shot (the body box wider than the frame: arms reach past a face close-up by design) cannot hold
          // 85 % of the body; there the head must be clear and centred (head centre in the middle 60 % of the width)
          const close = bw > (VR.x1 - VR.x0) * 0.95;
          const hcx = (head.x0 + head.x1) / 2, off = Math.abs(hcx - (VR.x0 + VR.x1) / 2) / (VR.x1 - VR.x0);
          const ok = (close ? off <= 0.3 : inX >= RULES.subjectInside) && !touch;
          persist(`r2s|${sc.shot}|${a.id}${vname}`, ok, out.r2, () => {
            const cx = (head.x0 + head.x1) / 2, cxV = (VR.x0 + VR.x1) / 2;
            const k = head.k, need = cxV - (body.x0 + body.x1) / 2;
            const mv = worldMove(v, need, 0, k);
            const edgeName = head.x0 < VR.x0 + hm ? "left" : head.x1 > VR.x1 - hm ? "right" : head.y0 < VR.y0 + hm ? "top" : "bottom";
            const why = touch ? `its head box (incl. antennae/hair) touches the ${edgeName} edge` : close ? `close shot with the head off centre (${(off * 100).toFixed(0)} % of the width from the middle; max 30 %)` : `only ${(inX * 100).toFixed(0)} % of its body is inside the frame (needs ${(RULES.subjectInside * 100).toFixed(0)} %)`;
            const fixes = [];
            const need2 = close ? (VR.x0 + VR.x1) / 2 - hcx : need;
            const mv2 = worldMove(v, need2, 0, k);
            if (Math.abs(need2) > 0.02 * W) fixes.push(`move ${a.id} ${mv2.m.toFixed(2)} m toward screen centre (add ${mv2.s} to its at)`);
            if (subj.why !== "camera target") fixes.push(`aim the camera at ${a.id} (cam.target "${a.id}")`);
            if (touch && edgeName === "top") fixes.push(`lower the framing (cam.face +0.08)`);
            if (touch && edgeName === "bottom") fixes.push(`raise the framing (cam.face -0.08)`);
            fixes.push(`pull the camera back (cam.dist +${Math.max(0.3, close ? 0.4 : (1 - inX) * 2.5 + 0.3).toFixed(1)})`);
            return `FAIL ${sc.shot}${vname} subject ${a.id} (${subj.why}) is cut by the frame (worst at ${ts}): ${why}; head centre x ${cx.toFixed(0)} of ${W}. Fix: ${fixes.join(", or ")}`;
          }, (close ? off : 1 - inX) * 1000 + Math.max(0, VR.x0 + hm - head.x0, head.x1 - (VR.x1 - hm), VR.y0 + hm - head.y0, head.y1 - (VR.y1 - hm)));
        } else {
          // not the subject: a head may be fully in or fully out, never sliced by an edge
          const cut = hIn > 0.1 && hIn < 0.9;
          persist(`r2h|${sc.shot}|${a.id}${vname}`, !cut, out.r2, () => {
            const side = head.x0 < VR.x0 ? "left" : head.x1 > VR.x1 ? "right" : head.y0 < VR.y0 ? "top" : "bottom";
            const push = side === "left" ? VR.x0 + hm - head.x0 : side === "right" ? -(head.x1 - VR.x1 + hm) : 0;
            const mv = worldMove(v, push || 0, 0, head.k);
            return `FAIL ${sc.shot}${vname} ${a.id}'s head is sliced by the ${side} frame edge (worst at ${ts}, ${(hIn * 100).toFixed(0)} % of it in frame): move ${a.id} ${side === "left" || side === "right" ? `${mv.m.toFixed(2)} m into frame (add ${mv.s} to its at)` : "so the whole head is in frame"} or fully out of frame, or re-aim the camera`;
          }, Math.max(0, VR.x0 + hm - head.x0, head.x1 - (VR.x1 - hm)));
        }
      }
      // ---- R6: the word caption over a face, head or neck (the caption's real line boxes, while a chunk is on screen)
      // the head room over the WHOLE shot (a push-in raises the head after the R6 frame): R6's "lift" advice never
      // pushes the head box into the top edge (R2) at any frame of the shot
      for (const { a, head } of acts) if (head) { const rk = `${sc.shot}|${a.id}${vname}`, rm = head.y0 - (VR.y0 + RULES.headEdge * W) - 4; if (!(roomMin.get(rk) <= rm)) roomMin.set(rk, rm); }
      if (sc.caption?.lines?.length) r6(sc, v, vi, vname, VR, acts, ts);
      // ---- R3 + R4 height: boards
      for (const b of sc.boards) {
        const pl = b.plane;
        const r = pl ? rectOf(v, planePts(pl)) : boxRect(v, b.box);
        if (!r || inter(r, VR) <= 0) { if (b.landed && b.edge) persist(`r3|${sc.shot}|${b.key}${vname}@${vi}`, true, out.r3, () => ""); continue; }
        // background boards (multi-shot set dressing, not featured) count for R3 only when their text reads on screen
        // (main-line cap >= half the R4 minimum): a cut-off word you can read is a defect; out-of-focus clutter is set
        let prominent = b.featured;
        if (!prominent && b.lines?.length && pl) { const mc = b.lines.reduce((a, l) => Math.max(a, l.capM), 0); prominent = segPx(v, pl.c, mc, pl) >= 0.5 * capMin; }
        if (!prominent && !b.lines?.length) prominent = true;
        if (b.landed && b.edge && prominent) {
          const inside = r.x0 >= VR.x0 + edgeM && r.x1 <= VR.x1 - edgeM && r.y0 >= VR.y0 + edgeM && r.y1 <= VR.y1 - edgeM;
          const sev3 = Math.max(0, VR.x0 + edgeM - r.x0, r.x1 - (VR.x1 - edgeM), VR.y0 + edgeM - r.y0, r.y1 - (VR.y1 - edgeM));
          persist(`r3|${sc.shot}|${b.key}${vname}`, inside, out.r3, () => {
            const dx = r.x0 < VR.x0 + edgeM ? VR.x0 + edgeM - r.x0 + 12 : r.x1 > VR.x1 - edgeM ? -(r.x1 - (VR.x1 - edgeM) + 12) : 0;
            const dy = r.y0 < VR.y0 + edgeM ? VR.y0 + edgeM - r.y0 + 12 : r.y1 > VR.y1 - edgeM ? -(r.y1 - (VR.y1 - edgeM) + 12) : 0;
            const sides = [r.x0 < VR.x0 + edgeM && "left", r.x1 > VR.x1 - edgeM && "right", r.y0 < VR.y0 + edgeM && "top", r.y1 > VR.y1 - edgeM && "bottom"].filter(Boolean);
            const wide = r.x1 - r.x0 > VR.x1 - VR.x0 - 2 * edgeM || r.y1 - r.y0 > VR.y1 - VR.y0 - 2 * edgeM;
            const mv = worldMove(v, dx, dy, r.k);
            // the board's size vs the room inside the margins (per axis): how much to shrink it, or pull the camera back
            const fitK = Math.min((VR.x1 - VR.x0 - 2 * edgeM) / Math.max(1, r.x1 - r.x0), (VR.y1 - VR.y0 - 2 * edgeM) / Math.max(1, r.y1 - r.y0));
            const fix = b.target
              ? `the camera aims at this board, so moving it moves the camera too: ${fitK < 1 ? `shrink it (size x${(fitK * 0.92).toFixed(2)}) or pull the camera back (cam.dist x${(1 / (fitK * 0.92)).toFixed(2)})` : `pull the camera back (cam.dist x1.15) or aim the camera at the board's centre (cam.target "${b.key}" with no offset)`}`
              : wide ? `the board is wider/taller than the frame here: shrink its size (x${(fitK * 0.92).toFixed(2)}) or pull the camera back (cam.dist x${(1 / (fitK * 0.92)).toFixed(2)})` : `move it ${mv.m.toFixed(2)} m into frame (add ${mv.s} to its at), or pull the camera back (cam.dist +0.5)`;
            return `FAIL ${sc.shot}${vname} board ${b.key} ${q(b.label)} crosses the ${sides.join("+")} frame edge (x ${r.x0.toFixed(0)}-${r.x1.toFixed(0)}, y ${r.y0.toFixed(0)}-${r.y1.toFixed(0)}; keep ${edgeM.toFixed(0)} px clear; worst at ${ts}): ${fix}`;
          }, sev3);
        }
        if (b.featured && b.landed && b.lines?.length && pl && r.x0 >= VR.x0 - 1 && r.x1 <= VR.x1 + 1) {
          const main = b.lines.reduce((a, l) => (l.capM > a.capM ? l : a), b.lines[0]);
          const px = segPx(v, pl.c, main.capM, pl);
          const kk = `${sc.shot}|${b.key}`;
          const cur = textH.get(kk) ?? textH.set(kk, { all: [], shot: sc.shot, b, main, vname }).get(kk);
          cur.all.push([px, t]);
        }
      }
      // ---- 2D cards (kits): inside the frame; text size
      for (const c of sc.cards ?? []) {
        if (!c.landed || (c.view !== undefined && c.view !== vi) || (c.view === undefined && vi > 0)) continue;
        const inside = c.x0 >= edgeM && c.x1 <= W - edgeM && c.y0 >= edgeM && c.y1 <= H - edgeM;
        persist(`r3c|${sc.shot}|${c.key}`, inside, out.r3, () => `FAIL ${sc.shot} card ${c.key} ${q(c.label)} crosses the frame edge (x ${c.x0.toFixed(0)}-${c.x1.toFixed(0)}, y ${c.y0.toFixed(0)}-${c.y1.toFixed(0)}; keep ${edgeM.toFixed(0)} px clear) at ${ts}: shorten its text or move it inward`);
        // opt-in (a line with fitW: the biz3d / cyber3d boards): the line must fit its card, or the card edge cuts it
        // off ("200,000" at 108 px is about 470 px in a 420 px board). Kits that set no fitW are checked as before.
        (c.lines ?? []).forEach((l, li) => {
          if (!l.fitW || !l.text) return;
          const fs = l.capPx / capRatio(), w = textEm(String(l.text)) * fs;
          persist(`r3t|${sc.shot}|${c.key}|${li}`, w <= l.fitW, out.r3, () => `FAIL ${sc.shot} card ${c.key}: its line ${q(l.text)} is ${w.toFixed(0)} px wide at ${fs.toFixed(0)} px in a ${l.fitW.toFixed(0)} px card, so the card edge cuts it off (at ${ts}): ${l.fix ?? "shorten the text"}`);
        });
        if (c.lines?.length) {
          const main = Math.max(...c.lines.map((l) => l.capPx));
          const kk = `${sc.shot}|card|${c.key}`;
          const cur = textH.get(kk) ?? textH.set(kk, { all: [], shot: sc.shot, card: c }).get(kk);
          cur.all.push([main, t]);
        }
      }
    }
  }
  // ---- R4 contrast (once per board / card; every line against the fill)
  for (const kk of o.boardsAll ?? []) {
    for (const l of kk.lines ?? []) {
      const cr = contrastRatio(l.fg, kk.bg);
      if (cr === null || cr >= RULES.contrast) continue;
      const id = `${kk.key}|${l.fg}|${kk.bg}`;
      if (out.r4c.has(id)) continue;
      const fill = kk.ownerFg ? null : fixFill(l.fg, kk.bg);
      const fix = kk.fix ? kk.fix(l, cr) : fill ? `set its color to ${fill} (same hue, ${contrastRatio(l.fg, fill).toFixed(1)}:1)${kk.fgField ? ` or set ${kk.fgField} to ${luminance(kk.bg) > 0.18 ? "#16121c" : "#ffffff"}` : ""}` : `use a darker fill or ${luminance(kk.bg) > 0.18 ? "dark" : "white"} text`;
      out.r4c.set(id, `FAIL ${kk.shots ?? ""}${kk.shots ? " " : ""}${kk.kind ?? "board"} ${kk.key} ${q(kk.label)}: text ${l.fg} on fill ${kk.bg} is ${cr.toFixed(2)}:1 (needs ${RULES.contrast}:1, line ${q(l.text)}): ${fix}`);
    }
  }
  // ---- R4 text height (per shot and featured board: its largest landed size in that shot)
  for (const [, h] of textH) {
    // the size a viewer gets: the median over the frames the board is landed and fully in frame in that shot (a push-in
    // that only reaches the size in its last frames does not make a board readable)
    h.all.sort((x, y) => x[0] - y[0]);
    [h.px, h.t] = h.all[Math.floor(h.all.length / 2)];
    if (h.px >= capMin) continue;
    if (h.card) { out.r4h.set(`${h.shot}|${h.card.key}`, `FAIL ${h.shot} card ${h.card.key} ${q(h.card.label)} text is ${(h.px / capRatio()).toFixed(0)} px (font size; cap ${h.px.toFixed(0)} px; needs ${RULES.textPx} px): shorten the text or use a bigger card`); continue; }
    const k = capMin / Math.max(1, h.px);
    const b = h.b;
    const fixes = [];
    if (b.size) fixes.push(`enlarge it to size [${b.size.map((x, i) => (i < 2 ? (x * k * 1.05).toFixed(2) : x)).join(", ")}] (x${(k * 1.05).toFixed(2)})`);
    else if (b.scaleField) fixes.push(`scale it up x${(k * 1.05).toFixed(2)} (${b.scaleField})`);
    fixes.push(`move the camera ${k > 1.6 ? "much " : ""}closer (cam.dist x${(1 / (k * 1.05)).toFixed(2)})`);
    if (String(h.main.text).length > 8) fixes.push(`or shorten the line ${q(h.main.text)} (long lines shrink to fit)`);
    out.r4h.set(`${h.shot}|${b.key}`, `FAIL ${h.shot}${h.vname} board ${b.key} ${q(b.label)}: main line ${q(h.main.text)} is ${(h.px / capRatio()).toFixed(1)} px (font size; cap ${h.px.toFixed(0)} px; median while on screen, e.g. at ${h.t.toFixed(2)} s; needs ${RULES.textPx} px to read on a phone): ${fixes.join(", ")}`);
  }
  // ---- R5 frame 0
  if (!LS && o.frame0) {
    const f0 = o.frame0;
    if (f0.hookPx !== undefined && f0.hookPx < f0.hookMinPx) out.r5.push(`FAIL frame 0 hook text is ${f0.hookPx.toFixed(0)} px (needs the ${f0.hookMinPx} px hook size${f0.hookLabel ? `, ${f0.hookLabel}` : ""}): shorten the hook so it fits at full size`);
    // f0.alt (biz3d / cyber3d only, opt-in): the frame-0 subject is a HERO PROP close-up or a giant stake board, so the
    // face part does not apply (their casts are faceless). Kits that do not pass `alt` are checked exactly as before.
    const sc = f0.alt?.ok ? null : o.sample0 ? o.sample0() : o.sample(0);
    if (f0.alt?.ok) out.alt0 = f0.alt.why;
    const need = RULES.closeFace * H;
    let best = null;
    if (sc) for (const s of sc.subjects) {
      const a = sc.actors.find((x) => x.id === s.id); const v = sc.views[s.view];
      if (!a || !v) continue;
      const r = boxRect(v, a.face ?? a.head);
      if (!r) continue;
      // only the part of the face inside the view counts (a face off the side of the frame is no close-up)
      const fx = Math.max(0, Math.min(r.x1, v.left + v.w) - Math.max(r.x0, v.left)) / Math.max(1, r.x1 - r.x0);
      const hpx = Math.max(0, Math.min(r.y1, v.top + v.h) - Math.max(r.y0, v.top)) * (fx >= 0.6 ? 1 : 0);
      if (!best || hpx > best.hpx) best = { id: a.id, hpx, why: s.why, need: need * (v.h / H), view: v };
    }
    if (!best && f0.alt?.ok) { /* the hero-prop / stake-board opener stands in for the face (checked by the kit gate) */ }
    else if (!best) out.r5.push(`FAIL frame 0 has no subject face: the frame-0 shot must aim at a character (cam.target "<actor>.face") in a close shot (head >= ${(RULES.closeFace * 100).toFixed(0)} % of the frame height, ${need.toFixed(0)} px)`);
    else if (best.hpx < best.need) out.r5.push(`FAIL frame 0 subject ${best.id}'s face is ${best.hpx.toFixed(0)} px tall (${((best.hpx / H) * 100).toFixed(0)} % of the frame; a close shot needs ${best.need.toFixed(0)} px): aim the frame-0 camera at "${best.id}.face" and move it in (cam.dist x${Math.max(0.3, best.hpx / best.need).toFixed(2)}), e.g. hookZoom with dist 1.7`);
    out.face0 = best;
  }
  // R6 messages are finished once the whole run is seen (the lift is capped by the shot's smallest head room)
  for (const [id, fn] of out.r6) if (typeof fn === "function") out.r6.set(id, fn(roomMin.get(id.replace(/^r6\|/, ""))));
  out.ms = Date.now() - T0;
  out.frames = frames;
  out.capMin = capMin;
  const lines = [...out.r1.values(), ...out.r2.values(), ...out.r3.values(), ...out.r4c.values(), ...out.r4h.values(), ...out.r5, ...out.r6.values()];
  out.clips = [...out.r1.values()];
  out.fails = [...out.r2.values(), ...out.r3.values(), ...out.r4c.values(), ...out.r4h.values(), ...out.r5, ...out.r6.values()];
  out.lines = lines;
  return out;
};

/** markdown section + console lines for a builder's report */
export const framingReport = (fq, opts = {}) => {
  const head = `## Framing QA (screen space, ${fq.frames} frames, ${(fq.ms / 1000).toFixed(2)} s): ${fq.clips.length} clip(s), ${fq.fails.length} fail(s)`;
  const body = fq.lines.length ? fq.lines.map((l) => `- ${l}`) : ["- none: no board or prop on a head, the subject in frame, boards inside the frame (3 % margin), board text >= 4.5:1 and big enough, frame 0 close, captions off faces and necks."];
  const summary = [`R1 head clips ${fq.r1.size}`, `R2 subject/edge ${fq.r2.size}`, `R3 board past edge ${fq.r3.size}`, `R4 contrast ${fq.r4c.size}`, `R4 text size ${fq.r4h.size}`, `R5 frame 0 ${fq.r5.length}`, `R6 caption on face/neck ${fq.r6.size}`].join(", ");
  return { md: [head, "", `Rules: RECIPE_GUIDE.md "Framing rules". ${summary}.${fq.face0 ? ` Frame-0 face: ${fq.face0.id} ${fq.face0.hpx.toFixed(0)} px.` : ""}`, "", ...body, ""], summary, console: fq.lines, ...opts };
};

/**
 * The kits' wrapper: runs framingQA and returns the gate rows + report lines + exit flags, so each *_build.mjs adds
 * framing with a few lines. sample(t) -> scene (see framingQA); frame0 = { hookPx, hookMinPx, hookLabel }.
 */
export const kitFraming = ({ C, W = 1080, H = 1920, landscape = false, times, sample, sample0, frame0, boardsAll }) => {
  const fq = framingQA({ times: times ?? Array.from({ length: C.duration }, (_, f) => f / 30), sample, sample0, W, H, landscape, frame0, boardsAll });
  const fr = framingReport(fq);
  const capMin = fq.capMin;
  const rows = [
    ["framing R1: no board, card or prop over a head (head box incl. antenna/hair/hat)", fq.r1.size === 0, fq.r1.size ? `${fq.r1.size} clip(s) (see Framing QA)` : "clear", true],
    ["framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge", fq.r2.size === 0, fq.r2.size ? `${fq.r2.size} (see Framing QA)` : "all in frame", true],
    ["framing R3: every landed board / card inside the frame (3 % margin)", fq.r3.size === 0, fq.r3.size ? `${fq.r3.size} (see Framing QA)` : "all inside", true],
    [`framing R4: text >= 4.5:1 on its fill; featured main lines >= ${RULES.textPx} px (font size)`, fq.r4c.size + fq.r4h.size === 0, fq.r4c.size + fq.r4h.size ? `${fq.r4c.size} contrast, ${fq.r4h.size} size (see Framing QA)` : "readable", true],
  ];
  if (!landscape) rows.push(["framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height)", fq.r5.length === 0, fq.face0 ? `${fq.face0.id} face ${fq.face0.hpx.toFixed(0)} px (needs ${(RULES.closeFace * H).toFixed(0)})${fq.r5.length ? "; " + fq.r5.map((x) => x.replace(/^FAIL /, "")).join("; ") : ""}` : fq.alt0 ? `face rule replaced by the opener: ${fq.alt0}${fq.r5.length ? "; " + fq.r5.map((x) => x.replace(/^FAIL /, "")).join("; ") : ""}` : fq.r5.join("; ") || "ok", true]);
  rows.push(["framing R6: the word caption never covers a face, head or neck (actors >= 15 % of the frame height)", fq.r6.size === 0, fq.r6.size ? `${fq.r6.size} (see Framing QA)` : "clear", true]);
  return { fq, fr, rows, failed: fq.lines.length > 0, console: `framing QA: ${fq.clips.length} clip(s), ${fq.fails.length} fail(s) over ${fq.frames} frames in ${(fq.ms / 1000).toFixed(2)} s (${fr.summary})` };
};
