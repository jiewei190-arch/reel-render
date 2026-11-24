// recipe_build.mjs: a shot recipe -> a Remotion composition, then the clip QA and the frame-0 gate.
//   node tools/recipe_build.mjs <slug> [--no-qa] [--check] [--shorts <dir>] [--qa-sample N]   (--check: compile + QA only, writes nothing)
// LONG-FORM ("format": "landscape", LONGFORM.md): the clip QA checks every Nth output frame (--qa-sample N, default 1;
// no sub-frames, since long-form renders without motion blur), the long-form gate (tools/longform_gate.mjs) replaces the
// Shorts gate, and <shorts>/<slug>/chapters.txt gets the YouTube timestamps. Shorts always get the full QA below.
// Reads   <shorts>/<slug>/recipe.json and <shorts>/<slug>/vo/timings.json   (default shorts dir: ../shorts = finance/shorts)
// Writes  src/shorts/<slug_>.recipe.gen.ts      the recipe + word timings as a TS module
//         src/fin/recipe/registry.gen.ts        every *.recipe.gen.ts (ToolkitRoot registers <Pascal>Recipe + <Pascal>RecipeSub)
//         out/tmp/<slug>.cues.json              the audio plan (STORY_CUES=<file> python tools/story_mix.py ...)
//         <shorts>/<slug>/RECIPE_QA.md          the QA + gate report
// QA (every output frame x 4 sub-frames, like tools/story_qa.mjs): every prop/set box vs every actor's head, torso, hand
// and forearm boxes (oriented props), props below the floor, feet (the lowest sole corner may not sink below the floor or
// float above it on a standing pose), and actor vs actor bodies. Gate (finance/FORMAT_V1.md "PRE-POST GATE"): frame 0
// close (a subject >= 50 % of the frame height), hook text at frame 0 (<= 8 words), the stake on screen by 0.5 s, the
// first word by 0.3 s, music + an SFX at frame 0, an emotion change by 1.5 s, no wide/dark shot in the first 1 s.
// Exit 1 if the QA or a hard gate fails. Nothing here runs third-party code.
import { build } from "esbuild";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { chaptersTxt, longformGate } from "./longform_gate.mjs";
import { capRatio, captionLines, framingQA, framingReport, textEm } from "./framing_qa.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const T0 = Date.now();
const qsi = args.indexOf("--qa-sample");
const qaSample = qsi >= 0 ? parseInt(args[qsi + 1], 10) : 1;
if (!(qaSample >= 1)) { console.error("--qa-sample N: N must be a whole number >= 1"); process.exit(2); }
const slug = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--shorts" && args[i - 1] !== "--qa-sample");
if (!slug || !/^[a-z0-9-]+$/.test(slug)) { console.error("usage: node tools/recipe_build.mjs <slug> [--no-qa] [--shorts <dir>]"); process.exit(2); }
const si = args.indexOf("--shorts");
// default: finance/shorts/<slug>; a long-form recipe can live in finance/longform/<slug> (used when shorts/<slug> is absent)
const SHORTS = si >= 0 ? resolve(args[si + 1]) : !existsSync(resolve(ROOT, "../shorts", slug)) && existsSync(resolve(ROOT, "../longform", slug)) ? resolve(ROOT, "../longform") : resolve(ROOT, "../shorts");
const noQa = args.includes("--no-qa");
const check = args.includes("--check"); // compile + QA + gate only: no codegen, no registry change, no report file
const dir = join(SHORTS, slug);
// DOC KIT (KIT_DOC.md): a documentary long-form is a folder with doc.json + chapters/NN.json (no recipe.json); it goes to
// tools/doc_build.mjs, which validates every chapter and the whole video
if (!existsSync(join(dir, "recipe.json")) && existsSync(join(dir, "doc.json"))) { const { main } = await import("./doc_build.mjs"); process.exit(await main(args)); }
const recipe = JSON.parse(readFileSync(join(dir, "recipe.json"), "utf8"));
const timings = JSON.parse(readFileSync(join(dir, "vo/timings.json"), "utf8"));
if (recipe.slug !== slug) { console.error(`recipe.slug "${recipe.slug}" != folder "${slug}"`); process.exit(2); }
// KIT DISPATCH (ENGINE.md): a recipe with "kit" is handed to that kit's own compiler/registry/entry before anything is
// written here. Recipes without "kit" (Block Money) are untouched and run the original engine below.
//   tech3d  KIT_TECH3D.md  tools/tech_build.mjs   src/index.tech.ts
//   law3d   KIT_LAW3D.md   tools/law_build.mjs    src/index.law.ts
//   biz3d   KIT_BIZ3D.md   tools/biz_build.mjs    src/index.biz.ts
//   cyber3d KIT_CYBER3D.md tools/cyber_build.mjs  src/index.cyber.ts  (Scams & Hacks)
//   storytime KIT_STORYTIME.md tools/storytime_build.mjs src/index.storytime.ts (animated school storytime)
const KITS = { tech3d: "./tech_build.mjs", law3d: "./law_build.mjs", biz3d: "./biz_build.mjs", cyber3d: "./cyber_build.mjs", storytime: "./storytime_build.mjs" };
if (recipe.kit !== undefined) {
  if (!KITS[recipe.kit]) { console.error(`unknown kit "${recipe.kit}" (known: ${Object.keys(KITS).join(", ")}; no "kit" = Block Money)`); process.exit(2); }
  const { main } = await import(KITS[recipe.kit]); process.exit(await main(args));
}

// ---------------------------------------------------------------- 1) codegen
const wf = (f, txt) => { if (!check) writeFileSync(f, txt); };
const us = slug.replace(/-/g, "_");
const pascal = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Recipe";
const words = timings.turns.flatMap((tn) => tn.words.map((w) => ({ w: w.w, turn: tn.turn, t: w.t, end: w.end })));
const vo = timings.source?.duration;
mkdirSync(join(ROOT, "src/shorts"), { recursive: true });
wf(join(ROOT, `src/shorts/${us}.recipe.gen.ts`),
  `// generated by tools/recipe_build.mjs from finance/shorts/${slug}/recipe.json + vo/timings.json; do not edit\n` +
  `import type { Recipe, Word } from "../fin/recipe/types";\n\n` +
  `export const ID = ${JSON.stringify(pascal)};\nexport const VO_DURATION: number | undefined = ${vo === undefined ? "undefined" : vo};\n` +
  `export const RECIPE: Recipe = ${JSON.stringify(recipe, null, 1)};\n` +
  `export const WORDS: Word[] = ${JSON.stringify(words)};\n`);
const gens = check ? [] : readdirSync(join(ROOT, "src/shorts")).filter((f) => f.endsWith(".recipe.gen.ts")).sort();
wf(join(ROOT, "src/fin/recipe/registry.gen.ts"),
  `// generated by tools/recipe_build.mjs; do not edit (lists src/shorts/*.recipe.gen.ts)\nimport type { Recipe, Word } from "./types";\n` +
  gens.map((f, i) => `import * as R${i} from "../../shorts/${f.replace(/\.ts$/, "")}";`).join("\n") +
  `\n\nexport const RECIPES: { id: string; recipe: Recipe; words: Word[]; vo?: number }[] = [\n` +
  gens.map((_, i) => `  { id: R${i}.ID, recipe: R${i}.RECIPE, words: R${i}.WORDS, vo: R${i}.VO_DURATION },`).join("\n") + `\n];\n`);
if (!check) console.log(`wrote src/shorts/${us}.recipe.gen.ts and the registry (${gens.length} recipe(s)); composition ${pascal} ${recipe.format === "landscape" ? "(1920x1080, no Sub)" : "(+Sub)"} in src/index.toolkit.ts`);

// ---------------------------------------------------------------- 2) compile in node
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const r = await build({ entryPoints: [join(ROOT, "tools/recipe_entry.ts")], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
const bundle = join(ROOT, "out/tmp/recipe_build.bundle.mjs");
writeFileSync(bundle, r.outputFiles[0].text);
const m = await import(pathToFileURL(bundle).href + "?" + Date.now());
let C;
try { C = m.compileRecipe(recipe, words, vo); } catch (e) { console.error(`COMPILE ERROR: ${e.message}`); process.exit(1); }
// caption-safe framing (owner rule v2): lift shots whose faces land in the bottom caption band, then bake the values into
// the generated recipe (cam.face / cam.face2) so the browser render reads them directly (no re-solve at render time).
// Head room (framing QA R2): a lift never pushes the subject's head box into the top edge / split seam; when the face
// would still sit in the band, the view is pulled back (cam.dist / cam.dist2 sized from the head-to-face span, up to 4 passes, max x2.5) and the
// recipe recompiled and re-solved. Pulls are baked like the lifts.
const work = JSON.parse(JSON.stringify(recipe));
const pulled = [];
let lifts = m.captionSafeFraming(C);
for (let pass = 0; pass < 4; pass++) {
  const pulls = lifts.filter((l) => l.key === "dist" || l.key === "dist2");
  if (!pulls.length) break;
  let moved = false;
  for (const l of pulls) {
    const cam0 = recipe.shots[l.i].cam, cap = 2.5 * (l.key === "dist2" ? cam0.dist2 ?? cam0.dist ?? l.v : cam0.dist ?? l.v);
    if (l.v > cap + 1e-6) continue;
    work.shots[l.i].cam[l.key] = l.v; moved = true;
    const k = pulled.findIndex((x) => x.i === l.i && x.key === l.key); if (k >= 0) pulled[k] = l; else pulled.push(l);
  }
  if (!moved) break;
  C = m.compileRecipe(work, words, vo);
  lifts = m.captionSafeFraming(C);
  if (process.env.CSF_DEBUG) console.error("pass", pass, JSON.stringify(lifts));
}
lifts = lifts.filter((l) => l.key === "face" || l.key === "face2").concat(pulled);
if (lifts.length) {
  if (C.shots.length !== recipe.shots.length) { console.error("shot count mismatch: cannot bake caption-safe framing"); process.exit(1); }
  const baked = JSON.parse(JSON.stringify(work));
  for (const l of lifts) baked.shots[l.i].cam[l.key] = l.v;
  wf(join(ROOT, `src/shorts/${us}.recipe.gen.ts`),
    `// generated by tools/recipe_build.mjs from finance/shorts/${slug}/recipe.json + vo/timings.json; do not edit
` +
    `// caption-safe framing baked: ${lifts.map((l) => `${C.shots[l.i].id}.${l.key}=${l.v}`).join(", ")}
` +
    `import type { Recipe, Word } from "../fin/recipe/types";

` +
    `export const ID = ${JSON.stringify(pascal)};
export const VO_DURATION: number | undefined = ${vo === undefined ? "undefined" : vo};
` +
    `export const RECIPE: Recipe = ${JSON.stringify(baked, null, 1)};
` +
    `export const WORDS: Word[] = ${JSON.stringify(words)};
`);
  console.log(`caption-safe framing: ${lifts.map((l) => `${C.shots[l.i].id} ${l.key} ${l.v}`).join(", ")}`);
}
const dur = C.duration / 30;
writeFileSync(join(ROOT, `out/tmp/${slug}.cues.json`), JSON.stringify({ [pascal]: { music: C.audio.music, musicDb: -12, cues: C.audio.cues, duration: dur, cuts: C.shots.map((s) => s.a) } }));
console.log(`compiled ${C.shots.length} shots, ${dur.toFixed(2)} s (${C.duration} frames), ${C.assets.length} CC0 assets, ${C.audio.cues.length} sfx cues`);
const LS = C.landscape;
if (LS) console.log(`landscape long-form: ${C.W}x${C.H}, ${C.chapters.length} chapters, ${C.words.length} words; no Sub composition (no motion blur); compiled in ${((Date.now() - T0) / 1000).toFixed(1)} s`);
else if (qsi >= 0) console.log("--qa-sample is for long-form only: a Short always gets the full QA (every frame x 4 sub-frames)");
if (noQa) process.exit(0);

// ---------------------------------------------------------------- 3) clip QA
const ov = (p, a) => {
  if (!p.yaw) return [0, 1, 2].every((k) => Math.abs(p.c[k] - a.c[k]) < p.h[k] + a.h[k]);
  const dx = a.c[0] - p.c[0], dz = a.c[2] - p.c[2], c = Math.cos(p.yaw), s = Math.sin(p.yaw);
  const lx = dx * c - dz * s, lz = dx * s + dz * c, rr = Math.max(a.h[0], a.h[2]);
  return Math.abs(lx) < p.h[0] + rr && Math.abs(a.c[1] - p.c[1]) < p.h[1] + a.h[1] && Math.abs(lz) < p.h[2] + rr;
};
const hits = new Map();
const note = (k, t) => { if (!hits.has(k)) hits.set(k, t); };
// Shorts: every output frame x 4 sub-frames. Long-form: every Nth output frame (no sub-frames: no motion blur)
const SUBS = LS ? 1 : 4, STEP = LS ? qaSample : 1;
const n = C.duration * SUBS;
const T1 = Date.now();
for (let f = 0; f < n; f += STEP) {
  const t = f / (30 * SUBS);
  const { actors, props, feet } = C.qa(t);
  const sid = C.shotAt(t).id;
  for (const p of props) {
    if (p.c[1] - p.h[1] < -0.01) note(`${sid} ${p.name} below the floor`, t);
    for (const a of actors) if (ov(p, a)) note(`${sid} ${p.name} x ${a.name}`, t);
  }
  for (const ft of feet) {
    if (ft.low < -0.012) note(`${sid} ${ft.name} feet sink into the floor (lowest sole corner ${(ft.low * 100).toFixed(1)} cm)`.replace(/ \(lowest.*/, ""), t);
    if (ft.grounded && ft.low > 0.03) note(`${sid} ${ft.name} feet float above the floor`, t);
  }
  const torsos = actors.filter((a) => a.name.endsWith(".torso") || a.name.endsWith(".head"));
  for (let i = 0; i < torsos.length; i++) for (let j = i + 1; j < torsos.length; j++) {
    if (torsos[i].name.split(".")[0] !== torsos[j].name.split(".")[0] && ov(torsos[i], torsos[j])) note(`${sid} ${torsos[i].name} x ${torsos[j].name}`, t);
  }
}
const qaLines = [...hits].map(([k, t]) => `CLIP ${k} first at ${t.toFixed(3)} s (frame ${Math.floor(t * 30)})`);
// ---------------------------------------------------------------- 3b) framing QA (screen space, tools/framing_qa.mjs)
// every output frame (Shorts) or every Nth (long-form): boards/props on heads (CLIP), the subject cut by the frame,
// boards past the edge, board text contrast + size, frame 0 close (RECIPE_GUIDE.md "Framing rules")
const FM = { em: textEm, cap: capRatio() };
const fTimes = [];
for (let f = 0; f < C.duration; f += STEP) fTimes.push(f / 30);
// R6: the caption line boxes (framing_qa.mjs captionLines) from the composition's own caption plan
const fSample = (t) => { const x = m.framingAt(C, t, FM); if (x?.captionSpec) { const lines = captionLines(x.captionSpec.words, x.captionSpec); x.caption = lines.length ? { text: lines.map((l) => l.text).join(" / "), lines } : null; } return x; };
const fq = framingQA({ times: fTimes, sample: fSample, W: C.W, H: C.H, landscape: LS, boardsAll: m.framingBoards(C, FM),
  frame0: { hookPx: 84, hookMinPx: 84, hookLabel: "Block Money HookText" } });
const fr = framingReport(fq);
for (const l of fq.clips) qaLines.push(l);
console.log(`framing QA: ${fq.clips.length} clip(s), ${fq.fails.length} fail(s) over ${fq.frames} frames in ${(fq.ms / 1000).toFixed(2)} s (${fr.summary})`);
for (const l of fq.fails) console.log("  " + l);
const framingFail = fq.fails.length > 0;
if (LS) {
  // ---------------------------------------------------------------- 4L) long-form gate + chapters.txt
  const qaS = (Date.now() - T1) / 1000;
  const T2 = Date.now();
  const { gate, pacing } = longformGate({ C, m, recipe, words, dur });
  const gateS = (Date.now() - T2) / 1000;
  const hardFail = gate.some((g) => g[3] && !g[1]);
  const chTxt = chaptersTxt(C.chapters);
  wf(join(dir, "chapters.txt"), chTxt);
  const sampled = Math.ceil(C.duration / qaSample);
  const rep = [
    `# ${slug}: long-form recipe QA (tools/recipe_build.mjs + tools/longform_gate.mjs)`, "",
    `Composition: \`${pascal}\` (1920x1080, 30 fps, no Sub composition: long-form renders without motion blur) in \`src/index.toolkit.ts\`. ${C.shots.length} shots, ${dur.toFixed(2)} s (${(dur / 60).toFixed(2)} min), ${C.words.length} words, ${C.chapters.length} chapters.`, "",
    `## Clip QA: ${sampled} of ${C.duration} frames (every ${qaSample === 1 ? "frame" : `${qaSample}th frame`}), ${hits.size} clip(s), ${qaS.toFixed(1)} s`, "",
    ...(qaLines.length ? qaLines.map((l) => `- ${l}`) : ["- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor."]), "",
    ...fr.md,
    `## Long-form gate (${gateS.toFixed(1)} s)`, "", "| check | result | detail |", "|---|---|---|",
    ...gate.map(([k, ok, d, hard]) => `| ${k} | ${ok ? "PASS" : hard ? "**FAIL**" : "warn"} | ${d} |`), "",
    `Pacing: ${pacing.events} visual-change marks, longest gap ${pacing.maxGap.toFixed(2)} s, mean shot ${pacing.meanShot.toFixed(2)} s, ${pacing.beats} beat marks.`, "",
    "## chapters.txt", "", "```", chTxt.trimEnd(), "```", "",
  ];
  wf(join(dir, "RECIPE_QA.md"), rep.join("\n"));
  console.log(`clip QA: ${hits.size} clip(s) over ${sampled} sampled frames (every ${qaSample}) in ${qaS.toFixed(1)} s`);
  for (const l of qaLines) console.log("  " + l);
  for (const [k, ok, d, hard] of gate) console.log(`${ok ? "PASS" : hard ? "FAIL" : "warn"}  ${k}: ${d}`);
  console.log(`chapters:\n${chTxt.trimEnd()}`);
  console.log(`report: ${join(dir, "RECIPE_QA.md")}${check ? " (not written: --check)" : ` + ${join(dir, "chapters.txt")}`}; total ${((Date.now() - T0) / 1000).toFixed(1)} s`);
  process.exit(hits.size || fq.clips.length || hardFail || framingFail ? 1 : 0);
}

// ---------------------------------------------------------------- 4) frame-0 gate
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); };
/** fraction of the frame height covered by box b (centre c, half h) seen by cam (clipped to the frame) */
const coverage = (cam, b, aspect = 1080 / 1920, frameH = 1) => {
  const f = nrm(sub3(cam.look, cam.pos)), rgt = nrm(crs(f, [0, 1, 0])), up = crs(rgt, f);
  const th = Math.tan((cam.fov * Math.PI) / 360);
  let y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const p = [b.c[0] + sx * b.h[0], b.c[1] + sy * b.h[1], b.c[2] + sz * b.h[2]];
    const d = sub3(p, cam.pos), z = dot(d, f);
    if (z <= 0.05) return 0;
    const ny = dot(d, up) / (z * th), nx = dot(d, rgt) / (z * th * aspect * frameH);
    y0 = Math.min(y0, ny); y1 = Math.max(y1, ny); x0 = Math.min(x0, nx); x1 = Math.max(x1, nx);
  }
  if (x1 < -1 || x0 > 1) return 0;
  return Math.max(0, Math.min(1, y1) - Math.max(-1, y0)) / 2;
};
const cams0 = C.camAt(0);
const qa0 = C.qa(0);
const subjects = [];
for (const st of C.actorsAt(0)) {
  if (C.shots[0].pov === st.id) continue;
  const low = st.pose.y - 0.6 * st.s, top = st.head[1] + 0.22 * st.s;
  subjects.push({ name: st.id, c: [st.pose.x, (Math.max(0, low) + top) / 2, st.pose.z], h: [0.3 * st.s, (top - Math.max(0, low)) / 2, 0.2 * st.s] });
}
for (const p of qa0.props) if (!p.name.startsWith("set.")) subjects.push(p);
const covs = subjects.map((b) => ({ name: b.name, k: Math.max(coverage(cams0.main, b, 1080 / 1920), cams0.split ? 0 : 0) }));
if (cams0.split) for (const b of subjects) covs.push({ name: `${b.name} (half)`, k: coverage(cams0.main, b, 1080 / 960) });
covs.sort((a, b) => b.k - a.k);
const best = covs[0] ?? { name: "nothing", k: 0 };
const hookWords = recipe.hook.text.trim().split(/\s+/).length;
const STAKE = /\$\s?\d|\d[\d,.]*\s*(%|percent|years?|yrs?|months?|weeks?|days?|hours?|minutes?)\b|\b(year|years)\s+\d+/i;
let stakeAt = null;
for (let f = 0; f <= 15 && stakeAt === null; f++) if (C.textsAt(f / 30).some((s) => STAKE.test(s))) stakeAt = f / 30;
const emo0 = new Map(C.actorsAt(0).map((a) => [a.id, a.emotion]));
let emoAt = null;
for (let f = 1; f <= 45 && emoAt === null; f++) for (const a of C.actorsAt(f / 30)) if (!emo0.has(a.id) || emo0.get(a.id) !== a.emotion) { emoAt = f / 30; break; }
const early = C.shots.filter((s) => s.a < 1.0);
// day-1 fixes (FORMAT_V1 "Day-1 data and fixes", 2026-11-18)
const castNames = Object.values(recipe.cast).map((k) => String(k).toLowerCase()).concat(["spender", "saver"]); // the characters' names (looks), not cast ids like "you"
const clean = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const namesEarly = words.filter((w) => w.t < 2.0 && castNames.includes(clean(w.w))).map((w) => `${w.w}@${w.t.toFixed(2)}`);
const tagFrom = recipe.tag ? C.at(recipe.tag.from) : 99;
const PUNCH = /^(impact|drop|crash|boom|thud|punch|stamp|coins|scratch|paper|rip)/;
const sfx0 = C.audio.cues.filter((c) => c.t <= 0.02);
const moves = new Set();
for (const s of C.shots) {
  if (s.a > 0 && s.a <= 3.0) moves.add(`cut ${s.a.toFixed(2)}`);
  for (const [t] of s.kicks) if (t <= 3.0) moves.add(`hit ${t.toFixed(2)}`);
}
// who + what at frame 0 (retention tactics: the whole situation readable in ONE frame): a character and a prop in view
const whoAt0 = covs.filter((c) => C.actorsAt(0).some((a) => a.id === c.name.replace(" (half)", "")) && c.k >= 0.15);
const whatAt0 = covs.filter((c) => !C.actorsAt(0).some((a) => a.id === c.name.replace(" (half)", "")) && !c.name.startsWith("egg.") && c.k >= 0.04);
// caption band (owner rule v2, 2026-11-19): the caption is fixed at the bottom; shots must keep faces out of the band
const capFrom = 1.0;
let capT = 0, capLow = 0;
const capMoved = [], capBoards = [];
for (const s of C.shots) {
  const a = Math.max(s.a, capFrom), b = s.b; if (b <= a) continue;
  const p = m.capPlan(C, s);
  capT += b - a; if (p.y >= 0.65 * 1920) capLow += b - a;
  if (p.y !== m.CAP_Y) capMoved.push(`${s.id}@${s.a.toFixed(1)}s->${(p.y / 19.2).toFixed(0)}%`);
  if (p.boards.length) capBoards.push(`${s.id}@${s.a.toFixed(1)}s:${p.boards.join("+")}`);
}
const capShare = capT ? capLow / capT : 1;
// frame-edge check (MAIN 2026-11-19): every text prop, once landed (0.3 s after its hit), sits fully inside its view
// with a 1.5 % margin (16 px); sampled every 0.1 s. Approximate (front-face corners, yaw ignored), so it warns, not fails. Split screens: the view the prop is seen in (top or bottom).
const EDGE = 16, edgeHits = new Map();
for (let t = 0; t < dur; t += 0.1) {
  const sh = C.shotAt(t); const cams = C.camAt(t);
  const texty = new Map(sh.props.filter((p) => (p.spec.kit === "label" || p.spec.text) && t >= p.a && t < p.b && t >= (p.spec.motion ? p.hit : p.a) + 0.3).map((p) => [p.key, p]));
  if (!texty.size) continue;
  const views = cams.split && cams.second ? [[cams.main, 960, 0], [cams.second, 960, 960]] : [[cams.main, 1920, 0]];
  for (const b of C.qa(t).props) {
    if (!texty.has(b.name)) continue;
    let worst = null, seen = false;
    for (const [cam, h, top] of views) {
      const xs = [], ys = [];
      for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
        const q = m.project(cam, [b.c[0] + dx * b.h[0], b.c[1] + dy * b.h[1], b.c[2]], h, top);
        if (q) { xs.push(q.x); ys.push(q.y); }
      }
      if (xs.length < 4) continue;
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      if (x1 < 0 || x0 > 1080 || y1 < top || y0 > top + h) continue; // not in this view at all
      seen = true;
      const bad = x0 < EDGE || x1 > 1080 - EDGE || y0 < top + EDGE || y1 > top + h - EDGE;
      if (!bad) { worst = null; break; }
      worst = `${b.name} x ${x0.toFixed(0)}-${x1.toFixed(0)} y ${y0.toFixed(0)}-${y1.toFixed(0)}`;
    }
    if (seen && worst && !edgeHits.has(b.name)) edgeHits.set(b.name, `${worst} at ${t.toFixed(1)} s`);
  }
}
// hook-board timing (MAIN rule 2026-11-19, (a)+(b)): the frame-0 board shot cuts away by about 1.0 s, so the captions own
// the band from then on; on the loop shot the board slams in only after the last spoken word
const firstCut = C.shots.length > 1 ? C.shots[1].a : dur;
const lastShot = C.shots[C.shots.length - 1];
// (most voices run to the 29.5 s fit cap, so "after the last word" means: the board lands on the last word, not before)
const lastWordEnd = words[words.length - 1].t;
const loopBoards = lastShot.props.filter((p) => (p.spec.kit === "label" || p.spec.text) && p.a >= lastShot.a - 0.01);
const loopEarly = loopBoards.filter((p) => (p.spec.motion ? p.hit : p.a) < lastWordEnd - 0.05);
const gate = [
  ["frame 0 is close: a subject covers >= 50 % of the frame height", best.k >= 0.5, `${best.name} ${(best.k * 100).toFixed(0)} %`, true],
  ["hook text on screen at frame 0, <= 5 words (day-1 fix 2)", C.hookUntil > 0 && hookWords <= 5, `"${recipe.hook.text}" (${hookWords} words, until ${C.hookUntil.toFixed(2)} s)`, true],
  ["who + what readable at frame 0 (a character >= 15 % and a prop in view)", whoAt0.length > 0 && whatAt0.length > 0, `who: ${whoAt0.map((c) => c.name).join(", ") || "none"}; what: ${whatAt0.slice(0, 3).map((c) => c.name).join(", ") || "none"}`, true],
  ["the stake ($ or a time) on screen by 0.5 s", stakeAt !== null, stakeAt === null ? "no $/time text by 0.5 s" : `at ${stakeAt.toFixed(2)} s`, true],
  ["first spoken word by 0.2 s (day-1 fix 3)", words[0].t <= 0.2, `${words[0].w} at ${words[0].t.toFixed(2)} s`, true],
  ["a sound punch at 0.00 s (impact/drop/crash/rip...)", sfx0.some((c) => PUNCH.test(c.sfx)), sfx0.map((c) => c.sfx).join(", ") || "none", true],
  ["no character names in the first 2 s of speech (day-1 fix 1)", namesEarly.length === 0, namesEarly.join(", ") || "none", true],
  ["no tag/HUD before 1.0 s; word captions start at 1.0 s (day-1 fix 2)", tagFrom >= 1.0, recipe.tag ? `tag from ${tagFrom.toFixed(2)} s` : "no tag", true],
  ["2-3 cuts or big moves in the first 3 s (day-1 fix 5)", moves.size >= 2, [...moves].join(", ") || "none", true],
  ["music + an SFX at frame 0", !!C.audio.music && C.audio.cues.some((c) => c.t <= 0.05), `${C.audio.music}, ${C.audio.cues.filter((c) => c.t <= 0.05).map((c) => c.sfx).join(", ")}`, true],
  ["an emotion change by 1.5 s", emoAt !== null, emoAt === null ? "no actor's emotion changes by 1.5 s" : `at ${emoAt.toFixed(2)} s`, true],
  ["no wide or dark shot in the first 1 s", early.every((s) => s.spec.cam.preset !== "wide" && s.lens.mood !== "whisper"), early.map((s) => `${s.id} ${s.spec.cam.preset}/${s.lens.mood}`).join(", "), true],
  ["caption centre >= 65 % of the height on >= 90 % of caption time (faces framed above the bottom band)", capShare >= 0.9, `${(capShare * 100).toFixed(0)} %; nudged: ${capMoved.join(", ") || "none"}`, true],
  ["frame-0 board shot cuts away by ~1.0 s (first cut <= 1.25 s)", firstCut <= 1.25, `first cut at ${firstCut.toFixed(2)} s`, true],
  ["loop board lands on the last word (not before)", loopEarly.length === 0, loopBoards.length ? `last word starts ${lastWordEnd.toFixed(2)} s; ${loopBoards.map((p) => `${p.key} at ${(p.spec.motion ? p.hit : p.a).toFixed(2)} s`).join(", ")}` : "no board on the loop shot", true],
  ["framing R2: the shot's subject >= 85 % in frame, head clear of the edges; no head sliced by an edge", fq.r2.size === 0, fq.r2.size ? `${fq.r2.size} (see Framing QA)` : "all in frame", true],
  ["framing R3: every landed board inside the frame (3 % margin)", fq.r3.size === 0, fq.r3.size ? `${fq.r3.size} (see Framing QA)` : "all inside", true],
  ["framing R4: board text >= 4.5:1 on its fill; featured main lines >= 42 px font size", fq.r4c.size + fq.r4h.size === 0, fq.r4c.size + fq.r4h.size ? `${fq.r4c.size} contrast, ${fq.r4h.size} size (see Framing QA)` : "readable", true],
  ["framing R5: frame-0 hook at full size and the subject's face a close shot (>= 16 % of the height)", fq.r5.length === 0, fq.face0 ? `${fq.face0.id} face ${fq.face0.hpx.toFixed(0)} px (needs ${(0.16 * 1920).toFixed(0)})` : "no subject face", true],
  ["no text board in the caption band (recompose: raise the board or lower the target)", capBoards.length === 0, capBoards.join(", ") || "none", false],
  ["length 20-30 s", dur >= 20 && dur <= 30.5, `${dur.toFixed(2)} s`, false],
];
const hardFail = gate.some((g) => g[3] && !g[1]);
const rep = [
  `# ${slug}: recipe QA (tools/recipe_build.mjs)`, "",
  `Composition: \`${pascal}\` (+ \`${pascal}Sub\`) in \`src/index.toolkit.ts\`. Style ${recipe.style}. ${C.shots.length} shots, ${dur.toFixed(2)} s.`, "",
  `## Clip QA: ${C.duration} frames x 4 sub-frames, ${hits.size} clip(s) + ${fq.clips.length} framing clip(s)`, "",
  ...(qaLines.length ? qaLines.map((l) => `- ${l}`) : ["- none: no prop/set box enters a head, torso, hand or forearm; no prop below the floor; feet on the floor."]), "",
  ...fr.md,
  `## Frame-0 gate`, "", "| check | result | detail |", "|---|---|---|",
  ...gate.map(([k, ok, d, hard]) => `| ${k} | ${ok ? "PASS" : hard ? "**FAIL**" : "warn"} | ${d} |`), "",
  `Frame-0 coverage by subject: ${covs.slice(0, 5).map((c) => `${c.name} ${(c.k * 100).toFixed(0)} %`).join(", ")}.`, "",
];
wf(join(dir, "RECIPE_QA.md"), rep.join("\n"));
console.log(`clip QA: ${hits.size} clip(s) + ${fq.clips.length} framing clip(s)`);
for (const l of qaLines) console.log("  " + l);
for (const [k, ok, d, hard] of gate) console.log(`${ok ? "PASS" : hard ? "FAIL" : "warn"}  ${k}: ${d}`);
console.log(`report: ${join(dir, "RECIPE_QA.md")}${check ? " (not written: --check)" : ""}; total ${((Date.now() - T0) / 1000).toFixed(1)} s`);
process.exit(hits.size || fq.clips.length || hardFail ? 1 : 0);
