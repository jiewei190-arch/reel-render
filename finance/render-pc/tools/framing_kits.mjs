// framing_kits.mjs: the four kits' scene samplers for tools/framing_qa.mjs (the screen-space framing rules R1-R5).
// Each returns { sample(t), boardsAll, frame0 } built from the kit's own compiled recipe (C) and bundled entry (m).
// Heads include what sticks out (BOLT's antenna and ears, the figures' hair, the hooded figure's hood); 2D cards are the
// kits' DOM labels / boards / story devices with their real font sizes and colours; 3D text props are law3d's signs,
// papers and boxes and cyber3d's email tiles. Facts (sizes, colours) are from the kits' hud / objects / cast files.
import { capRatio, kitFraming } from "./framing_qa.mjs";

const CAP = () => capRatio();
const tgId = (tg) => (typeof tg === "string" ? tg.split(".")[0].split(":")[0] : "");
/** the shot's subject per the rules: the camera's target actor, else spec.subject, else its only actor (while on screen) */
const subjectsOf = (spec, ids) => {
  const tg = tgId(spec.cam?.target);
  if (ids.includes(tg)) return [{ id: tg, view: 0, why: "camera target" }];
  if (spec.subject && ids.includes(spec.subject)) return [{ id: spec.subject, view: 0, why: "the shot's subject" }];
  if (ids.length === 1) return [{ id: ids[0], view: 0, why: "the shot's only actor", ifVisible: true }];
  return [];
};
const rect = (key, label, x, y, w, h, lines, bg, landed, fix) => ({ key, label, x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2, lines, bg, landed, fix });
const ln = (text, fs, fg) => ({ text: String(text ?? ""), capPx: fs * CAP(), fg });
const view = (cam, W, H) => [{ cam, left: 0, top: 0, w: W, h: H, name: "frame" }];

// ------------------------------------------------------------------ BOLT (tech3d, cyber3d): the shell is the head
// shell r 0.3 (screen bezel 1.05 r), ears to x +-0.315, antenna tip top +0.484 above the body centre, jet to -0.5
const boltActor = (m, st) => {
  const s = st.s;
  const f = m.boltFace(st);
  return {
    id: st.id, named: true, extra: "antenna and ears",
    head: { c: [st.x, st.y + 0.085 * s, st.z], h: [0.33 * s, 0.4 * s, 0.33 * s] },
    // the head parts: the round shell as a sphere, the ears as small boxes and the antenna (stalk + tip, leaning toward +x by
    // about 0.18 rad), so the empty corners of a bounding cube do not count
    headParts: [{ c: [st.x, st.y, st.z], r: 0.315 * s }, ...[-1, 1].map((k) => ({ c: [st.x + k * 0.29 * s * Math.cos(st.yaw), st.y + 0.13 * s, st.z - k * 0.29 * s * Math.sin(st.yaw)], h: [0.04 * s, 0.08 * s, 0.06 * s], yaw: st.yaw })),
      { c: [st.x + 0.07 * s * Math.cos(st.yaw), st.y + 0.39 * s, st.z - 0.07 * s * Math.sin(st.yaw)], h: [0.07 * s, 0.1 * s, 0.06 * s], yaw: st.yaw }],
    face: { c: [st.x, st.y, st.z], h: [0.3 * s, 0.3 * s, 0.3 * s] },
    parts: [{ c: [st.x, st.y - 0.4 * s, st.z], h: [0.12 * s, 0.1 * s, 0.12 * s] }, { c: f.c, h: [f.r, f.r, f.r] }],
  };
};

// ------------------------------------------------------------------ tech3d
export const techScene = (C, m, recipe) => {
  const L = C.layout ?? { W: 1080, H: 1920 };
  const W = L.W, H = L.H, LS = !!C.landscape;
  const k = LS ? 1 : 1; // the DOM sizes below are the portrait layout's (landscape cards are not re-checked here)
  const navy = "#14213D", white = "#ffffff", blueDeep = "#1C5BBF", sym = "#B5521A";
  const sample = (t) => {
    const s = C.shotAt(t), cam = C.camAt(t);
    const actors = C.boltsAt(t).map((st) => boltActor(m, st));
    const cards = [];
    for (const l of C.labelsAt(t)) cards.push(rect(`label ${l.text}`, l.text, l.x, l.y, l.w, l.h, [ln(l.text, 54 * k, navy)], white, l.u >= 0.99, "the engine places callout labels: aim the label at a part away from BOLT (actions[].on) or frame BOLT on the other side"));
    for (const b of C.boardsAt(t)) cards.push(rect(`board ${b.title}`, `${b.title} ${b.value}`, b.x, b.y, b.w, b.h, [ln(b.title, 40, white), ln(b.value, 118, navy)], null, b.u >= 0.99, `move the board (pos "left" / "right" / "top") to the side away from BOLT, or frame BOLT lower (cam.face)`));
    const props = [];
    // whole objects (a plane's fuselage + wings is one prop): the core skips big ones (half-size > 0.75 m) as staging
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.show(t) < 0.5) continue;
      if (p.def) { const b = m.objBox(p.def, C.placeOf(p, t)); props.push({ key: p.key, box: { c: b.c, h: b.h } }); }
      else for (const b of C.qa(t).props) if (b.name === p.key) props.push({ key: p.key, box: { c: b.c, h: b.h } });
    }
    return { shot: s.id, views: view(cam, W, H), actors, subjects: subjectsOf(s.spec, actors.map((a) => a.id)), boards: [], props, cards };
  };
  const boardsAll = [
    { key: "callout label", label: "label cards", kind: "card", lines: [{ text: "label", fg: navy }], bg: white },
    { key: "board title", label: "board title", kind: "card", lines: [{ text: "TITLE", fg: white }], bg: blueDeep },
    { key: "board value", label: "board value", kind: "card", lines: [{ text: "123", fg: navy }, { text: "$ %", fg: sym }], bg: white },
  ];
  return { sample, boardsAll, W, H, frame0: { hookPx: m.HOOK_FS, hookMinPx: 100, hookLabel: "tech3d HOOK_FS" } };
};

// ------------------------------------------------------------------ law3d
// hair above the head centre (cast.tsx Hair): short .175, side .2, long .18, bun .245, curly .235, bald 0 (head top .14)
const LAW_HAIR = { short: 0.175, side: 0.2, long: 0.18, bun: 0.245, curly: 0.235, bald: 0.14 };
const LAW_ROLE_HAIR = { judge: "short", plaintiff: "short", defendant: "short", lawyer: "side", witness: "short", bailiff: "short", juror: "short" };
// 3D text: [cap height (m, scale 1), flat?, text colour, fill] (TEXT3D in law_build.mjs + objects.tsx textures)
const LAW_TEXT3D = { sign: [0.1, false, "#B8322A", "#F7F1E2"], newspaper: [0.046, false, "#1A1410", "#EDE6D6"], nameplate: [0.032, false, "#2a1c08", "#E8B44A"], box: [0.035, false, "#1A1410", "#F3EAD7"], paper: [0.026, true, "#1A1410", "#F3EAD7"], folder: [0.032, true, "#1A1410", "#F3EAD7"] };
export const lawScene = (C, m, recipe) => {
  const L = C.layout, W = L.W, H = L.H;
  const ink = "#1A1410", cream = "#FFF4DE", gold = "#E8B44A", card = "#0B1426", paper = "#F3EAD7";
  const fsOf = (d) => {
    if (d.kind === "exhibit") return [[d.label, 34, card], [d.text, L.exhibitFs ?? 58, cream]];
    if (d.kind === "verdict") return [[d.text, L.verdict?.fs ?? 170, gold], ...(d.sub ? [[d.sub, 64, cream]] : [])];
    if (d.kind === "caseCard") return [[d.title, Math.min(92, 740 / Math.max(6, (d.title ?? "").length * 0.62)), ink], [`${d.year ?? ""} ${d.place ?? ""}`, 52, ink], ...(d.note ? [[d.note, 36, ink]] : [])];
    if (d.kind === "counter") return [[d.title, L.board?.fsTitle ?? 40, card], [d.value, Math.min(L.board?.fsValue ?? 112, 600 / Math.max(3, (d.value ?? "").length * 0.6)), cream]];
    return [[d.text ?? d.title ?? "", 40, cream]];
  };
  const sample = (t) => {
    const s = C.shotAt(t), cam = C.camAt(t);
    const actors = C.figsAt(t).filter((st) => st.spec.role !== "juror").map((st) => {
      const bx = m.figBoxes(st), hd = bx.find((b) => b.name.endsWith(".head"));
      const style = st.spec.hairStyle ?? LAW_ROLE_HAIR[st.spec.role] ?? "short";
      const top = (LAW_HAIR[style] ?? 0.2) * st.s, bot = 0.15 * st.s, half = (style === "curly" ? 0.175 : 0.16) * st.s;
      return { id: st.id, named: true, extra: "hair", head: { c: [hd.c[0], hd.c[1] + (top - bot) / 2, hd.c[2]], h: [half, (top + bot) / 2, half] }, face: { c: hd.c, h: hd.h }, parts: bx.filter((b) => !b.name.endsWith(".head")).map((b) => ({ c: b.c, h: b.h })) };
    });
    const cards = C.devicesAt(t).map((d) => {
      const lines = fsOf(d).map(([tx, fs, fg]) => ln(tx, fs, fg));
      const y0 = d.kind === "caseCard" ? d.y - 23 : d.y, h = d.kind === "caseCard" ? d.h + 46 : d.h;
      return rect(`${d.kind} ${d.key}`, d.text ?? d.title ?? d.value ?? d.kind, d.x, y0, d.w, h, lines, null, d.u >= 0.99, "devices are placed by the engine: point the exhibit at a target away from the face (\"on\"), or frame the person on the other side / lower");
    });
    const boards = [];
    const props = [];
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.show(t) < 0.5) continue;
      const pl = p.place(t), bx = m.KIT_BOX[p.spec.kit]; if (!bx) continue;
      const cy = Math.cos(pl.yaw), sy = Math.sin(pl.yaw);
      const c = [pl.p[0] + (bx.c[0] * cy + bx.c[2] * sy) * pl.s, pl.p[1] + bx.c[1] * pl.s, pl.p[2] + (-bx.c[0] * sy + bx.c[2] * cy) * pl.s];
      const box = { c, h: bx.h.map((v) => v * pl.s), yaw: pl.yaw };
      const tx = LAW_TEXT3D[p.spec.kit];
      const landed = t >= (p.spec.motion ? p.hit : p.a) + 0.3;
      if (!tx || !p.text) { if (landed) props.push({ key: p.key, box }); continue; }
      const flat = tx[1];
      boards.push({ key: p.key, label: String(p.text).replace(/\n/g, " "), kind: p.spec.kit, box, landed, edge: true, featured: true, bg: tx[3],
        plane: flat ? { c, w: 2 * box.h[0], h: 2 * box.h[2], yaw: pl.yaw, flat: true } : { c, w: 2 * box.h[0], h: 2 * box.h[1], yaw: pl.yaw },
        lines: [{ text: String(p.text).split("\n")[0], capM: tx[0] * pl.s, fg: tx[2] }], scaleField: "\"s\"" });
    }
    return { shot: s.id, views: view(cam, W, H), actors, subjects: subjectsOf(s.spec, actors.map((a) => a.id)), boards, props, cards };
  };
  const boardsAll = [
    ["exhibit tag label", card, gold], ["exhibit tag text", cream, card], ["verdict", gold, card], ["verdict sub", cream, card], ["case card", ink, paper], ["case card tab", card, "#C9A15C"], ["counter title", card, gold], ["counter value", cream, card],
    ...Object.entries(LAW_TEXT3D).map(([k, v]) => [`${k} (3D)`, v[2], v[3]]), ["folder stamp (3D)", "#85241e", "#D8B46E"],
  ].map(([key, fg, bg]) => ({ key, label: key, kind: "kit text", lines: [{ text: key, fg }], bg }));
  return { sample, boardsAll, W, H, frame0: { hookPx: L.hookFs, hookMinPx: 96, hookLabel: "law3d hook fs" } };
};

// ------------------------------------------------------------------ biz3d
export const bizScene = (C, m, recipe) => {
  const L = C.L ?? C.layout ?? m.layoutOf?.(recipe) ?? m.LAYOUTS.portrait, W = L.W ?? 1080, H = L.H ?? 1920;
  const ink = "#0E1726", white = "#ffffff", slate = "#34445E";
  const TT = { green: "#15803D", red: "#C62828", gold: "#8A6212" };
  const tt = (tone) => TT[tone] ?? "#13233F";
  const devLines = (d) => {
    const sp = d.spec ?? {};
    switch (d.kind) {
      case "company": return [[sp.name, Math.min(92, 410 / Math.max(1, (sp.name ?? "").length * 0.68)), ink, white], [`FOUNDED ${sp.year ?? ""}`, 44, tt(d.tone), white], ...(sp.tagline ? [[sp.tagline, 35.2, slate, white]] : [])];
      case "decision": return [[sp.text ?? "THE DECISION", 150, white, TT.red], ...(sp.sub ? [[sp.sub, 64, ink, white]] : [])];
      case "counter": return [[sp.title, 44, white, tt(d.tone)], [d.value, 150, white, "#0A0E1A"]];
      case "worth": return [["WHAT IT'S WORTH TODAY", 44, ink, white], [sp.a?.label, 40, slate, white], [d.value ?? "", 96, TT.red, white]];
      case "board": { const fs = m.boardFonts ? m.boardFonts(L, sp, d.value ?? sp.value ?? "") : { title: 38, value: 108 }; return [[sp.title, fs.title, white, d.tone === "ink" ? slate : tt(d.tone)], [d.value ?? sp.value, fs.value, ink, white]]; }
      case "stamp": return [[sp.text, 127.5, tt(d.tone ?? "red"), white]];
      default: return [[sp.text ?? d.kind, 44, ink, white]];
    }
  };
  const sample = (t) => {
    const s = C.shotAt(t), cam = C.camAt(t);
    const actors = C.execsAt(t).map((st) => {
      const hd = m.execHead(st), sc = st.s;
      // execHead().c is the drawn head centre (fixed 2026-11-22); the hair cap reaches +0.17 s
      const c = hd.c;
      const by = st.seated ? 0.95 : 0.9, bh = st.seated ? 0.62 : 0.9;
      return { id: st.id, named: true, extra: "hair", head: { c: [c[0], c[1] + 0.016 * sc, c[2]], h: [0.145 * sc, 0.155 * sc, 0.145 * sc] }, face: { c, h: [0.125 * sc, 0.1375 * sc, 0.125 * sc] }, parts: [{ c: [st.x, st.y + by * sc, st.z], h: [0.3 * sc, bh * sc, 0.2 * sc] }] };
    });
    const cards = [];
    for (const l of C.labelsAt(t)) cards.push(rect(`label ${l.text}`, l.text, l.x, l.y, l.w, l.h, [ln(l.text, 52, ink)], white, l.u >= 0.99, "callout labels are placed by the engine: point the label at something away from the executive's head, or frame the head on the other side"));
    for (const g of C.tagsAt(t)) cards.push(rect(`tag ${g.text}`, g.text, g.x, g.y, g.w, g.h, [ln(g.text, 44, white)], tt(g.tone), g.u >= 0.99));
    for (const d of C.devicesAt(t)) {
      const lines = devLines(d).map(([tx, fs, fg]) => ln(tx, fs, fg));
      const h = d.kind === "worth" ? d.h + 46 : d.h;
      cards.push(rect(`${d.kind} ${d.key ?? ""}`.trim(), d.spec?.text ?? d.spec?.title ?? d.spec?.name ?? d.kind, d.x, d.y + (h - d.h) / 2, d.w, h, lines, null, d.u >= 0.99, "devices sit at fixed layout spots: frame the executive away from that spot (cam.face / cam.az), or move the device (pos / y)"));
    }
    return { shot: s.id, views: view(cam, W, H), actors, subjects: subjectsOf(s.spec, actors.map((a) => a.id)), boards: [], props: [], cards };
  };
  const pairs = [["label", ink, white], ["company name", ink, white], ["tagline", slate, white], ["worth label", slate, white], ["worth pill", ink, "#F5B324"], ["board value", ink, white], ["counter value", white, "#0A0E1A"], ["board title (ink)", white, slate]];
  for (const [tone, c] of Object.entries(TT)) pairs.push([`${tone} text on white (year, worth, stamp)`, c, white], [`white on ${tone} (tag, board / counter title, decision)`, white, c]);
  const boardsAll = pairs.map(([key, fg, bg]) => ({ key, label: key, kind: "kit text", lines: [{ text: key, fg }], bg }));
  return { sample, boardsAll, W, H, frame0: { hookPx: L.hook?.fs ?? 98, hookMinPx: 98, hookLabel: "biz3d hook fs" } };
};

// ------------------------------------------------------------------ cyber3d
export const cyberScene = (C, m, recipe) => {
  const L = C.L, W = L.W ?? 1080, H = L.H ?? 1920;
  const wht = "#EAF6FF", glass = "#060A14", dim = "#6F86A8", red = "#FF2A3D", cyan = "#19E6FF";
  const TONE = { cyan, magenta: "#FF2BD6", red };
  const devLines = (d) => {
    switch (d.kind) {
      case "case": return [[d.title, 58, cyan], [d.name, 64, wht], [d.amount, 64, wht], [d.status, 56, red]];
      case "money": return [[d.label, 38, red], [d.value, 118, wht]];
      case "check": return [[d.title, 66, cyan], ...(d.items ?? []).map((it) => [it.text, 54, wht])];
      case "count": return [[d.label, 34, dim], [d.value, 96, red]];
      case "alert": return [[d.text, 84, red]];
      default: return [];
    }
  };
  const sample = (t) => {
    const s = C.shotAt(t), cam = C.camAt(t);
    const actors = C.boltsAt(t).map((st) => boltActor(m, st));
    for (const f of C.figuresAt(t)) {
      const bx = m.figureBoxes(f.key, f.p, f.yaw, f.s, f.rig), hd = bx.find((b) => b.name.endsWith(".head"));
      actors.push({ id: f.key, named: true, extra: "hood", head: { c: hd.c, h: hd.h }, face: { c: hd.c, h: hd.h.map((v) => v * 0.85) }, parts: bx.filter((b) => b !== hd).map((b) => ({ c: b.c, h: b.h })) });
    }
    const cards = [];
    for (const l of C.labelsAt(t)) cards.push(rect(`label ${l.text}`, l.text, l.x, l.y, l.w, l.h, [ln(l.text, 50, wht)], glass, l.u >= 0.99, "callout labels are placed by the engine: point the label at a part away from the head, or frame the head on the other side"));
    for (const b of C.boardsAt(t)) cards.push(rect(`board ${b.title}`, `${b.title} ${b.value}`, b.x, b.y, b.w, b.h, [ln(b.title, 38, "#000000"), ln(b.value, 112, wht)], null, b.u >= 0.99, `move the board (pos) to the side away from the head`));
    for (const d of C.devicesAt(t)) cards.push(rect(d.kind, d.title ?? d.label ?? d.text ?? d.kind, d.x, d.y, d.w, d.h, devLines(d).map(([tx, fs, fg]) => ln(tx, fs, fg)), glass, d.u >= 0.99, "story cards sit at fixed layout spots: frame the head away from that spot (cam.face / cam.az)"));
    const boards = [];
    for (const p of s.props) {
      if (p.spec.kit !== "email" || t < p.a || t >= p.b || (p.show && p.show(t) < 0.5)) continue;
      const pl = p.place(t), sc = pl.s ?? 1;
      const c = [pl.p[0], pl.p[1], pl.p[2]];
      const phish = !!p.spec.phish;
      boards.push({ key: p.key, label: String(p.spec.text ?? "").slice(0, 22), kind: "email", box: { c, h: [0.5 * sc, 0.18 * sc, 0.02], yaw: pl.yaw ?? 0 }, plane: { c, w: 1.0 * sc, h: 0.36 * sc, yaw: pl.yaw ?? 0 },
        lines: [{ text: String(p.spec.text ?? "").slice(0, 22), capM: (30 / 176) * 0.36 * sc * CAP(), fg: phish ? "#ffd0d6" : "#9fd8ec" }], bg: phish ? "#2a060c" : "#0b1424",
        landed: t >= (p.spec.motion ? p.hit : p.a) + 0.3, edge: true, featured: true, scaleField: "\"s\"" });
    }
    return { shot: s.id, views: view(cam, W, H), actors, subjects: subjectsOf(s.spec, actors.map((a) => a.id)), boards, props: [], cards };
  };
  const pairs = [["label", wht, glass], ["board value", wht, glass], ["case row label", dim, glass], ["money label", red, glass], ["alert", red, "#280006"], ["email", "#9fd8ec", "#0b1424"], ["phish email", "#ffd0d6", "#2a060c"]];
  for (const [tone, c] of Object.entries(TONE)) pairs.push([`board title on ${tone}`, "#000000", c], [`board symbol ${tone}`, c, glass]);
  const boardsAll = pairs.map(([key, fg, bg]) => ({ key, label: key, kind: "kit text", lines: [{ text: key, fg }], bg }));
  return { sample, boardsAll, W, H, frame0: { hookPx: L.hook?.fs ?? 96, hookMinPx: 96, hookLabel: "cyber3d hook fs" } };
};

const SCENES = { tech3d: techScene, law3d: lawScene, biz3d: bizScene, cyber3d: cyberScene };
/** run the framing rules for a kit recipe: every output frame (Shorts) or every `step`-th (long-form). Long-form keeps
 *  R1-R4 (R5 is the Shorts frame-0 rule); the 2D card sizes there come from the landscape layout, so only their
 *  placement and colours are checked, not their font size. */
export const runFraming = (kit, C, m, recipe, landscape = false, step = 1, frame0Alt = null) => {
  const sc0 = SCENES[kit](C, m, recipe);
  if (frame0Alt) sc0.frame0 = { ...sc0.frame0, alt: frame0Alt };
  // a whip-in swings the frame across the set on purpose: its first 0.35 s is motion, not framing
  const whip = (t) => { const s = C.shotAt(t); return (s.spec.in === "whip" || s.spec.cam?.preset === "whip") && t < s.a + 0.35; };
  const sc = { ...sc0, sample: (t) => (whip(t) ? null : sc0.sample(t)) };
  const times = [];
  for (let f = 0; f < C.duration; f += landscape ? step : 1) times.push(f / 30);
  const sample = landscape ? (t) => { const x = sc.sample(t); if (x) for (const c of x.cards) c.lines = []; return x; } : sc.sample;
  const KF = kitFraming({ C, W: sc.W, H: sc.H, landscape, times, sample, frame0: sc.frame0, boardsAll: sc.boardsAll });
  console.log(KF.console);
  for (const l of KF.fq.lines) console.log("  " + l);
  return KF;
};
