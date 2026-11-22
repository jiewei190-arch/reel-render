// doc_build.mjs: a documentary video ("kit": "doc", KIT_DOC.md) -> a Remotion composition + the doc gates.
//   node tools/doc_build.mjs <slug> [--check] [--chapter N] [--qa-sample N] [--no-qa] [--shorts <dir>]
//   (node tools/recipe_build.mjs <slug> forwards here when the folder has doc.json)
// Reads   finance/longform/<slug>/doc.json, chapters/NN.json (the files doc.json lists), vo/timings.json
// Checks  1. schema (every field, with the fix)            2. per chapter: variety, beats, numbers, hero set, its 2D/3D QA
//         3. the whole video: variety + budgets, spoken numbers, chapter cards, callouts, prop text, legal wording,
//            teases, the shared long-form gate (tools/kit_long.mjs), the 2D text QA, and the theme's 3D kit QA (clip QA,
//            framing R1-R6, polish P1/P2/P4) on the scene3d windows only
//         --chapter N: only chapter N (the other chapter files may not exist yet): what a writer runs after each chapter
// Writes  (not with --check) src/doc/gen/<slug_>.doc.gen.ts, src/doc/registry.gen.ts, <dir>/RECIPE_QA.md,
//         <dir>/chapters.txt, out/tmp/<slug>.cues.json. Nothing here touches Block Money, tech3d or the kits' registries.
// Exit 1 on any FAIL (warns do not fail). Every FAIL line says what to change.
import { build } from "esbuild";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { chaptersTxt, kitArgs, kitLongGate, qaTimes } from "./kit_long.mjs";
import { contrastRatio, kitFraming, boxRect } from "./framing_qa.mjs";
import { bizScene, cyberScene, lawScene } from "./framing_kits.mjs";
import { polishQA } from "./polish_qa.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KIT_ENTRY = { law3d: "law_entry.ts", biz3d: "biz_entry.ts", cyber3d: "cyber_entry.ts" };
const SCENES = { law3d: lawScene, biz3d: bizScene, cyber3d: cyberScene };
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const bundle = async (entry, name) => {
  const r = await build({ entryPoints: [join(ROOT, "tools", entry)], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
  mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
  const f = join(ROOT, `out/tmp/${name}.bundle.mjs`);
  writeFileSync(f, r.outputFiles[0].text);
  return import(pathToFileURL(f).href + "?" + Date.now());
};
const fmt = (t) => `${t.toFixed(2)} s`;
const q = (s) => `'${String(s).replace(/\s+/g, " ").trim()}'`;

// ------------------------------------------------------------------ words: stems, numbers
const SUF = [["ing", ""], ["ers", ""], ["ies", "y"], ["es", ""], ["ed", ""], ["er", ""], ["s", ""], ["d", ""]];
export const stem = (w) => {
  let x = String(w).toLowerCase().replace(/[’']s$/, "").replace(/[^a-z]/g, "");
  for (const [s, r] of SUF) if (x.endsWith(s) && x.length - s.length >= 3) { x = x.slice(0, -s.length) + r; break; }
  if (x.endsWith("e") && x.length > 3) x = x.slice(0, -1);
  return x;
};
const tokens = (s) => String(s).split(/[^A-Za-z’']+/).map((w) => w.replace(/^[’']+|[’']+$/g, "")).filter((w) => w.length >= 3);
const SCALE = { K: 1e3, THOUSAND: 1e3, M: 1e6, MILLION: 1e6, B: 1e9, BN: 1e9, BILLION: 1e9, T: 1e12, TRILLION: 1e12 };
/** every number printed in a screen text ("$54,000,000", "$54M", "54 MILLION", "2005-2007", "$10.50") */
export const screenNumbers = (s) => {
  const out = [];
  const re = /(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\s*(TRILLION|BILLION|MILLION|THOUSAND|BN|K|M|B|T)?(?![A-Za-z])/gi;
  let m;
  while ((m = re.exec(String(s)))) { let v = parseFloat(m[1].replace(/,/g, "") + (m[2] ? `.${m[2]}` : "")); if (m[3]) v *= SCALE[m[3].toUpperCase()]; out.push(v); }
  return out;
};
const sameNum = (a, b) => Math.abs(a - b) <= Math.max(0.005, 1e-6 * Math.abs(a));
const UNITS = /^(dollars?|percent|per|days?|weeks?|months?|years?|hours?|minutes?|seconds?|times|calls|people|cents?)$/i;
const MONTHS = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
const VERDICT = new Set(["convict", "guilty", "sentenc", "fraudster", "scammer", "criminal", "thief", "liar", "crook", "arrest", "indict", "jail", "felon", "murderer"].map(stem));
const NEG_EVENT = ["collapse", "crash", "crack", "fall", "fail", "bankrupt", "lose", "lost", "sink", "burn", "explode", "fire", "close", "shut", "die", "broke", "quit", "resign"].map(stem);
const NEGATION = /^(not|never|didn['’]t|don['’]t|doesn['’]t|wasn['’]t|isn['’]t|weren['’]t|won['’]t|no|without|nor|hardly|neither)$/i;
// words a name / headline field may use without a source (roles, connectors, card furniture)
const GENERIC = new Set(["the", "and", "for", "with", "from", "into", "over", "per", "versus", "plaintiff", "defendant", "defendants", "court", "case", "file", "exhibit", "chapter", "recap", "judge", "ruling", "verdict", "owner", "owners", "family", "shop", "city", "state", "home", "office", "company", "ceo", "founder", "victim", "suspect", "witness", "lawyer", "attorney", "police", "bank", "store", "street", "page", "news", "report", "daily", "times", "post", "herald", "tribune", "journal", "gazette", "inc", "llc", "ltd", "corp", "dept", "department", "superior", "district", "county", "federal", "supreme", "appeals", "civil", "division"].map(stem));

export const main = async (argv) => {
  const T0 = Date.now();
  const ka = kitArgs(argv);
  if (ka.err) { console.error(ka.err === "usage" ? "usage: node tools/doc_build.mjs <slug> [--check] [--chapter N] [--qa-sample N] [--no-qa] [--shorts <dir>]" : ka.err); return 2; }
  const { slug, dir, check, noQa, qaSample } = ka;
  const ci = argv.indexOf("--chapter");
  const only = ci >= 0 ? parseInt(argv[ci + 1], 10) : null;
  if (ci >= 0 && !(only >= 1)) { console.error("--chapter N: N is the chapter number (1, 2, ...)"); return 2; }
  if (!existsSync(join(dir, "doc.json"))) { console.error(`no ${join(dir, "doc.json")}`); return 2; }
  const doc = JSON.parse(readFileSync(join(dir, "doc.json"), "utf8"));
  if (doc.slug !== slug) { console.error(`doc.slug "${doc.slug}" != folder "${slug}"`); return 2; }
  const timings = JSON.parse(readFileSync(join(dir, doc.voice?.timings ?? "vo/timings.json"), "utf8"));
  const words = timings.turns.flatMap((tn) => tn.words.map((w) => ({ w: w.w, turn: tn.turn, t: w.t, end: w.end })));
  const vo = timings.source?.duration;
  const D = await bundle("doc_entry.ts", "doc_build");
  const kit = D.THEME_KIT[doc.theme];
  if (!kit) { console.error(`doc.json "theme" must be law, biz or cyber (got "${doc.theme}")`); return 1; }
  const K = await bundle(KIT_ENTRY[kit], `doc_${kit}`);
  const kitInfo = {
    law3d: () => ({ sets: K.LAW_SET_IDS, cams: Object.keys(K.LAW_CAMS), cast: Object.keys(doc.kit3d?.cast ?? {}) }),
    biz3d: () => ({ sets: K.BIZ_SET_IDS, cams: Object.keys(K.BIZ_CAMS), cast: Object.keys(doc.kit3d?.cast ?? {}) }),
    cyber3d: () => ({ sets: K.CYBER_SET_IDS, cams: Object.keys(K.CYBER_CAMS), cast: Object.keys(doc.kit3d?.cast ?? {}) }),
  }[kit]();
  const compileKit = { law3d: K.compileLaw, biz3d: K.compileBiz, cyber3d: K.compileCyber }[kit];

  // ---------------------------------------------------------------- 1) the chapter files + schema
  const refs = Array.isArray(doc.chapters) ? doc.chapters : [];
  const files = refs.map((r, i) => {
    if (only !== null && i + 1 !== only) return null;
    const f = r?.file && join(dir, r.file);
    if (!f || !existsSync(f)) return { missing: r?.file ?? `chapter ${i + 1}` };
    try { return JSON.parse(readFileSync(f, "utf8")); } catch (e) { return { bad: `${r.file}: ${e.message}` }; }
  });
  if (only !== null && only > refs.length) { console.error(`--chapter ${only}: doc.json lists ${refs.length} chapters`); return 2; }
  const fileErr = files.flatMap((f, i) => (f?.missing ? [{ where: `chapter ${i + 1}`, msg: `the file ${f.missing} does not exist yet (doc.json lists it): write it, or check one chapter with --chapter N` }] : f?.bad ? [{ where: `chapter ${i + 1}`, msg: `not valid JSON: ${f.bad}` }] : []));
  const chapters = files.map((f) => (f && !f.missing && !f.bad ? f : null));
  const schema = [...fileErr, ...D.validateDoc(doc, chapters, words, kitInfo)];
  // --chapter N: the other chapters that already exist and validate are compiled too (global scene numbers, repeats
  // across the chapter edges), but only chapter N is judged
  if (only !== null) refs.forEach((r, i) => {
    if (i + 1 === only || !r?.file || !existsSync(join(dir, r.file))) return;
    try { const c = JSON.parse(readFileSync(join(dir, r.file), "utf8")); const one = refs.map((_, k) => (k === i ? c : null)); if (!D.validateDoc(doc, one, words, kitInfo).length) chapters[i] = c; } catch { /* left out */ }
  });
  const scope = only === null ? "the whole video" : `chapter ${only} only`;
  console.log(`doc ${slug}: theme ${doc.theme} (3D kit ${kit}), ${refs.length} chapters, ${words.length} words, ${(vo ?? 0).toFixed(1)} s; checking ${scope}`);
  if (schema.length) {
    console.log(`SCHEMA: ${schema.length} problem(s)`);
    for (const e of schema) console.log(`FAIL  ${e.where}: ${e.msg}`);
    return 1;
  }
  let C;
  try { C = D.compileDoc(doc, chapters, words, vo); } catch (e) { console.log(`FAIL  compile: ${e.message}`); return 1; }
  const dur = C.end;
  const inCh = (s) => only === null || s.ch === only;
  const S = C.scenes;
  console.log(`compiled ${S.length} scenes (${S.filter((s) => s.type === "scene3d").length} scene3d), ${dur.toFixed(2)} s, ${C.chapters.length} chapters`);

  // ---------------------------------------------------------------- 2) the 3D kit sub-recipe
  let C3 = null;
  const winOf = (t) => C.windows.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);
  if (C.kitRecipe) {
    try { C3 = compileKit(C.kitRecipe, words, dur); } catch (e) {
      const m = /shot (\d+)|S(\d\d)/.exec(e.message);
      const n = m ? parseInt(m[1] ?? m[2], 10) : null;
      const note = n ? C.kitRecipe.shots[n - 1]?.note : null;
      console.log(`FAIL  scene3d (${kit}) compile: ${e.message}${note ? ` [kit shot ${n} = doc ${note.split(" ")[0]}]` : ""}: fix that scene's 3D fields (${kit === "law3d" ? "KIT_LAW3D.md" : kit === "biz3d" ? "KIT_BIZ3D.md" : "KIT_CYBER3D.md"})`);
      return 1;
    }
  }
  // which kit shot ids are visible (the doc scene3d shots, not the hidden fillers)
  const shotsIn = new Set();
  const kitShotOf = new Map();
  if (C3) C3.shots.forEach((ks, i) => { const note = C.kitRecipe.shots[i].note ?? ""; const id = note.split(" ")[0]; if (/^S\d+$/.test(id)) { shotsIn.add(ks.id); kitShotOf.set(id, ks); } });
  const docIdOfKit = (kid) => { for (const [d, ks] of kitShotOf) if (ks.id === kid) return d; return kid; };
  const relabel = (line) => String(line).replace(/\bS(\d\d)\b/g, (x) => (shotsIn.has(x) ? `${docIdOfKit(x)}(scene3d)` : x));

  const rows = []; // [check, ok, detail, hard, scope]
  const add = (check, ok, detail, hard = true, sc = "video") => rows.push([check, ok, detail, hard, sc]);
  const fails = new Map(); // rule -> lines
  const fl = (rule, line) => { if (!fails.has(rule)) fails.set(rule, []); fails.get(rule).push(line); };
  const pickWords = (a, b, n = 3) => { const mid = (a + b) / 2; return words.filter((w) => w.t > a + 1.5 && w.t < Math.min(b, a + D.DOC_RULES.maxScene) - 0.5).sort((x, y) => Math.abs(x.t - mid) - Math.abs(y.t - mid)).slice(0, n).map((w) => `"${w.turn}:${w.w.replace(/[^A-Za-z0-9$%,.'-]/g, "")}" (${fmt(w.t)})`); };

  // ---------------------------------------------------------------- 3) variety gates
  const chList = C.chapters.filter((c) => only === null || c.n === only);
  const SC = S.filter(inCh);
  // 3.1 a new shot / scene type at least every 6 s
  const long = SC.filter((s) => s.b - s.a > D.DOC_RULES.maxScene + 1e-6);
  for (const s of long) fl("V1", `FAIL ${s.id} ${s.type} runs ${(s.b - s.a).toFixed(1)} s (${fmt(s.a)}-${fmt(s.b)}): the limit is ${D.DOC_RULES.maxScene} s: split it with a new scene at ${pickWords(s.a, s.b).join(" or ") || "a word in its middle"}`);
  add(`variety V1: a new shot or scene type at least every ${D.DOC_RULES.maxScene} s (no scene longer)`, long.length === 0, long.length ? `${long.length} too long (see Doc gates)` : `longest ${Math.max(...SC.map((s) => s.b - s.a)).toFixed(1)} s`);
  // 3.2 no identical type + set + camera within 45 s
  const reps = [];
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length && S[j].a - S[i].a < D.DOC_RULES.repeatWindow; j++) {
    const x = S[i], y = S[j];
    if (!inCh(y) && !inCh(x)) continue;
    if (x.type === y.type && x.set === y.set && x.cam === y.cam) reps.push(`FAIL ${y.id} repeats ${x.id} (${y.type} / ${y.set} / ${y.type === "scene3d" ? `cam ${y.cam.split(":")[0]} on ${y.cam.split(":").slice(1).join(":")}` : `move ${y.move}`}) ${(y.a - x.a).toFixed(0)} s later (the limit is ${D.DOC_RULES.repeatWindow} s): ${y.type === "scene3d" ? `change ${y.id}'s "cam" (another preset or target) or "set"` : `give ${y.id} another "move" (${D.DOC_MOVES.filter((m) => m !== y.move).join(" / ")}) or use another scene type`}`);
  }
  reps.forEach((l) => fl("V2", l));
  add(`variety V2: no identical scene type + set + camera within ${D.DOC_RULES.repeatWindow} s`, reps.length === 0, reps.length ? `${reps.length} repeat(s)` : "none");
  // 3.3 scene3d share of runtime
  const t3 = (xs) => xs.filter((s) => s.type === "scene3d").reduce((a, s) => a + s.b - s.a, 0);
  const tAll = (xs) => xs.reduce((a, s) => a + s.b - s.a, 0);
  const share3 = t3(SC) / Math.max(1e-9, tAll(SC));
  if (share3 > D.DOC_RULES.max3dShare) fl("V3", `FAIL scene3d is ${(share3 * 100).toFixed(0)} % of the runtime (${t3(SC).toFixed(1)} of ${tAll(SC).toFixed(1)} s); the limit is ${D.DOC_RULES.max3dShare * 100} %: turn about ${Math.ceil((t3(SC) - D.DOC_RULES.max3dShare * tAll(SC)) / 4)} scene3d shot(s) into map / timeline / document / chart scenes (the non-beat ones: ${SC.filter((s) => s.type === "scene3d" && !s.spec.beat).map((s) => s.id).slice(0, 6).join(", ")})`);
  add(`variety V3: scene3d <= ${D.DOC_RULES.max3dShare * 100} % of the runtime`, share3 <= D.DOC_RULES.max3dShare + 1e-9, `${(share3 * 100).toFixed(0)} %`);
  // 3.4 every chapter >= 4 distinct scene types
  const typeBad = [];
  for (const ch of chList) {
    const ts = new Set(S.filter((s) => s.ch === ch.n).map((s) => s.type));
    if (ts.size < D.DOC_RULES.minTypesPerChapter) typeBad.push(`FAIL chapter ${ch.n} ${q(ch.title)} uses ${ts.size} scene type(s) (${[...ts].join(", ")}): it needs ${D.DOC_RULES.minTypesPerChapter}: add ${D.DOC_TYPES.filter((x) => !ts.has(x)).slice(0, D.DOC_RULES.minTypesPerChapter - ts.size + 1).join(" / ")}`);
  }
  typeBad.forEach((l) => fl("V4", l));
  add(`variety V4: every chapter uses >= ${D.DOC_RULES.minTypesPerChapter} distinct scene types`, typeBad.length === 0, chList.map((ch) => `ch${ch.n}: ${new Set(S.filter((s) => s.ch === ch.n).map((s) => s.type)).size}`).join(", "));
  // 3.5 big beats: scene3d with people, or document / quote / compare
  const beatScenes = new Map();
  for (const s of SC) if (s.spec.beat) beatScenes.set(s.id, { s, why: `"beat": true` });
  for (const b of doc.beats ?? []) { let t; try { t = C.at(b); } catch { fl("V5", `FAIL doc.json beats ${JSON.stringify(b)} is not a word of the voice-over`); continue; } const s = C.sceneAt(t); if (inCh(s)) beatScenes.set(s.id, { s, why: `doc.json beat ${JSON.stringify(b)}` }); }
  const beatBad = [];
  for (const { s, why } of beatScenes.values()) {
    const ok = s.type === "scene3d" ? (s.spec.actors ?? []).length > 0 : ["document", "quote", "compare"].includes(s.type);
    if (!ok) beatBad.push(`FAIL ${s.id} is a big beat (${why}) shown as ${s.type}${s.type === "scene3d" ? " with no people (an empty set)" : ""}: make it a scene3d shot with the people in it ("actors"), or a document / quote / compare`);
  }
  beatBad.forEach((l) => fl("V5", l));
  add("variety V5: big beats use scene3d with people, or document / quote / compare (never an empty set)", beatBad.length === 0, `${beatScenes.size} beat(s)${beatBad.length ? `, ${beatBad.length} wrong` : " ok"}`);

  // ---------------------------------------------------------------- 4) set / scene budget + hero sets
  if (only === null) {
    const nS = S.length, byType = new Map(), bySet = new Map(), combos = new Set();
    for (const s of S) { byType.set(s.type, (byType.get(s.type) ?? 0) + 1); if (s.type === "scene3d") bySet.set(s.set, (bySet.get(s.set) ?? 0) + 1); combos.add(`${s.type}/${s.set}`); }
    const over = [...[...byType].map(([k, n]) => ["scene type", k, n]), ...[...bySet].map(([k, n]) => ["3D set", k, n])].filter(([, , n]) => n / nS > D.DOC_RULES.maxShotShare + 1e-9);
    for (const [what, k, n] of over) fl("B1", `FAIL ${what} ${k} is ${n} of ${nS} shots (${((n / nS) * 100).toFixed(0)} %); the limit is ${D.DOC_RULES.maxShotShare * 100} %: change about ${Math.ceil(n - D.DOC_RULES.maxShotShare * nS)} of them (${S.filter((s) => (what === "3D set" ? s.type === "scene3d" && s.set === k : s.type === k) && !s.spec.beat).map((s) => s.id).slice(0, 6).join(", ")}) to another ${what === "3D set" ? "set or scene type" : "scene type"}`);
    add(`budget B1: no scene type or 3D set above ${D.DOC_RULES.maxShotShare * 100} % of the shots`, over.length === 0, [...byType].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", ") + ` | sets: ${[...bySet].map(([k, n]) => `${k} ${n}`).join(", ") || "none"}`);
    const needC = Math.max(4, Math.ceil((D.DOC_RULES.combosPer10Min * dur) / 600));
    if (combos.size < needC) fl("B2", `FAIL ${combos.size} distinct scene/set combinations; a ${(dur / 60).toFixed(1)} min video needs ${needC} (${D.DOC_RULES.combosPer10Min} per 10 min): add scene types or 3D sets you have not used (${D.DOC_TYPES.filter((x) => !byType.has(x)).join(", ") || "other sets / regions / chart kinds"})`);
    add(`budget B2: >= ${D.DOC_RULES.combosPer10Min} distinct scene/set combinations per 10 min`, combos.size >= needC, `${combos.size} (needs ${needC})`);
  }
  const heroBad = [], heroWarn = [];
  for (const ch of chList) {
    const xs = S.filter((s) => s.ch === ch.n && s.type === "scene3d");
    if (!xs.length) continue;
    const per = new Map(); for (const s of xs) per.set(s.set, (per.get(s.set) ?? 0) + s.b - s.a);
    const top = [...per].sort((a, b) => b[1] - a[1])[0][0];
    if (!ch.heroSet) heroBad.push(`FAIL chapter ${ch.n} has scene3d shots but no "heroSet": add "heroSet": "${top}" to ${ch.file}`);
    else if (ch.heroSet !== top) heroBad.push(`FAIL chapter ${ch.n} "heroSet" is ${ch.heroSet} but its most-used 3D set is ${top} (${[...per].map(([k, v]) => `${k} ${v.toFixed(1)} s`).join(", ")}): set "heroSet": "${top}" or move time to ${ch.heroSet}`);
    const prev = C.chapters[ch.n - 2];
    if (prev?.heroSet && prev.heroSet === ch.heroSet) heroWarn.push(`chapter ${ch.n} uses the same hero set as chapter ${ch.n - 1} (${ch.heroSet})`);
  }
  heroBad.forEach((l) => fl("B3", l));
  add("budget B3: one hero set per chapter (its most-used 3D set, declared as \"heroSet\")", heroBad.length === 0, chList.map((c) => `ch${c.n}: ${c.heroSet ?? "-"}`).join(", ") + (heroWarn.length ? `; warn: ${heroWarn.join("; ")}` : ""));

  // ---------------------------------------------------------------- 5) what is on screen (2D layouts + kit devices), sampled
  const STEP = 0.1;
  const hookBox = (() => { const t = doc.hook.text.replace(/\*/g, "").toUpperCase(); const w = D.textW(t, 80); return { x0: 960 - Math.min(w, 1600) / 2 - 30, x1: 960 + Math.min(w, 1600) / 2 + 30, y0: 60, y1: 60 + (w > 1600 ? 2 : 1) * 92 + 20 }; })();
  const kitTexts = (t) => {
    if (!C3) return [];
    const out = [];
    const walk = (o, d = 0) => { if (d > 3 || o == null) return; if (typeof o === "string") { out.push(o); return; } if (typeof o !== "object") return; for (const [k, v] of Object.entries(o)) if (!["key", "kind", "do", "pos", "tone", "at", "until", "land", "on", "kit", "id", "act", "plan", "fs", "anchor", "why", "color", "photo"].includes(k)) walk(v, d + 1); };
    for (const dv of C3.devicesAt(t)) if ((dv.u ?? 1) >= 0.5) walk(dv);
    for (const fn of ["labelsAt", "tagsAt", "boardsAt"]) if (C3[fn]) for (const x of C3[fn](t)) if ((x.u ?? 1) >= 0.5) walk({ t: x.text, ti: x.title, v: x.value });
    const ks = C3.shotAt(t);
    for (const p of ks.props ?? []) if (t >= p.a && t < p.b && (p.text || p.spec?.text)) out.push(String(p.text ?? p.spec.text));
    return out;
  };
  /** every text on screen at t: { src, text, scene, item? } */
  const screenAt = (t) => {
    const s = C.sceneAt(t);
    const out = [];
    if (t <= C.hookUntil) out.push({ src: "hook", text: doc.hook.text.replace(/\*/g, ""), scene: s, rect: hookBox });
    if (s.type === "scene3d") { if (winOf(t)) for (const x of kitTexts(t)) out.push({ src: "kit", text: x, scene: s }); }
    else for (const it of C.layoutAt(s, t).screen) if (it.show >= 0.5) out.push({ src: "2d", text: it.text, scene: s, item: it, rect: { x0: it.sx0, x1: it.sx1, y0: it.sy0, y1: it.sy1 } });
    return out;
  };
  const sampleTs = [];
  for (const s of SC) for (let t = s.a; t < s.b - 1e-6; t += STEP) sampleTs.push(Math.round(t * 1000) / 1000);
  const screenCache = new Map(sampleTs.map((t) => [t, screenAt(t)]));

  // ---------------------------------------------------------------- 6) spoken numbers need a board
  // spokenNumbers lists the longest phrase from every token ("fifty-four million" and "four million"): keep the outer one
  const sn = [];
  for (const n of D.spokenNumbers(words)) if (!sn.some((a) => a.i0 <= n.i0 && a.i1 >= n.i1)) sn.push(n);
  const exempt = (doc.numberExempt ?? []).map((x) => { try { return C.at(x.word); } catch { return null; } }).filter((x) => x !== null);
  const numRows = [];
  const chA = only === null ? 0 : C.chapters[only - 1].t, chB = only === null ? dur : C.chapters[only] ? C.chapters[only].t : dur;
  const tOk = (t) => t >= chA - 1e-6 && t < chB - 1e-6;
  for (const n of sn) {
    const w0 = words[n.i0], w1 = words[n.i1], after = words[n.i1 + 1];
    const digits = words.slice(n.i0, n.i1 + 1).some((w) => /\d/.test(w.w));
    const said = words.slice(n.i0, n.i1 + 1).map((w) => w.w).join(" ").replace(/[.,;:!?"”]+$/, "");
    if (!tOk(w0.t)) continue;
    if (!digits && n.value < 10 && Number.isInteger(n.value) && !(after && UNITS.test(after.w.replace(/[^A-Za-z]/g, "")))) continue; // "one pair", "three owners": counts, not figures
    if (exempt.some((t) => Math.abs(t - w0.t) < 0.05)) continue;
    const lo = w0.t - D.DOC_RULES.numberWindow, hi = w1.end + D.DOC_RULES.numberWindow;
    let found = null;
    for (let t = Math.max(0, lo); t <= Math.min(dur - 0.01, hi) && !found; t += STEP) {
      const tt = Math.round(t * 1000) / 1000;
      const scr = screenCache.get(tt) ?? screenAt(tt);
      for (const x of scr) {
        if (x.src === "2d" && x.scene.type === "document" && x.item.role !== "key") continue; // body text is not a board
        if (screenNumbers(x.text).some((v) => sameNum(v, n.value))) { found = { t: tt, x }; break; }
      }
    }
    numRows.push({ said, t: w0.t, line: w0.turn, value: n.value, found });
    if (!found) {
      const s = C.sceneAt(w0.t);
      const hint = s.type === "scene3d" ? `add a counter / board to ${s.id} (scene3d) with that value, or cut to a stat` : ["stat", "compare", "chart", "timeline", "recap"].includes(s.type) ? `show it in ${s.id} (${s.type}) or cut to a stat at "${w0.turn}:${w0.w.replace(/[.,;:!?"]+$/, "")}"` : `cut to a stat / compare / chart at "${w0.turn}:${w0.w.replace(/[.,;:!?"]+$/, "")}" (${s.id} is a ${s.type})`;
      fl("N1", `FAIL "${said}" is spoken at ${fmt(w0.t)} (line ${w0.turn}) with no board showing ${n.value.toLocaleString("en-US")} between ${fmt(Math.max(0, lo))} and ${fmt(hi)}: ${hint}; or list it in doc.json "numberExempt" with a reason`);
    }
  }
  add(`numbers N1: every spoken figure ($, digits, number words with a unit) has a board with that exact value within +-${D.DOC_RULES.numberWindow} s`, numRows.every((r) => r.found), `${numRows.filter((r) => r.found).length} of ${numRows.length} shown`);

  // ---------------------------------------------------------------- 7) chapter cards
  const cardBad = [];
  for (const ch of chList) {
    const end = C.chapters[ch.n] ? C.chapters[ch.n].t : dur;
    if (ch.card < D.DOC_RULES.noCardBefore) cardBad.push(`FAIL chapter ${ch.n} card at ${fmt(ch.card)}: no chapter card in the first ${D.DOC_RULES.noCardBefore} s (never interrupt the cold open): set its "card" in doc.json to a word after ${D.DOC_RULES.noCardBefore} s, e.g. ${words.filter((w) => w.t >= D.DOC_RULES.noCardBefore && w.turn !== words.find((x) => x.t >= D.DOC_RULES.noCardBefore)?.turn - 99).slice(0, 1).map((w) => `"${w.turn}:${w.w.replace(/[^A-Za-z0-9$]/g, "")}" (${fmt(w.t)})`)[0] ?? "a later word"}`);
    if (ch.card < ch.t - 1e-6 || ch.card > end - 3) cardBad.push(`FAIL chapter ${ch.n} card at ${fmt(ch.card)} is outside its chapter (${fmt(ch.t)}-${fmt(end)}, and it needs 3 s before the next): move its "card"`);
    if (ch.fitOk === false) cardBad.push(`FAIL chapter ${ch.n} title ${q(ch.title)} needs a font under 56 px to fit one line: shorten it to ${Math.floor((D.CHAPTER.maxW - 194) / (56 * 0.66))} characters`);
    // P3: its box vs the 2D text under it
    for (let t = ch.card + 0.35; t < ch.card + D.LF.CHAPTER_CARD_S - 0.35; t += STEP) {
      const s = C.sceneAt(t); if (s.type === "scene3d") continue;
      const hit = C.layoutAt(s, t).screen.find((it) => it.show > 0.3 && it.sx0 < ch.box.x1 && it.sx1 > ch.box.x0 && it.sy0 < ch.box.y1 && it.sy1 > ch.box.y0);
      if (hit) { cardBad.push(`FAIL chapter ${ch.n} card (top ${ch.top}) covers ${s.id} ${s.type} text ${q(hit.text)} at ${fmt(t)}: start that text later (its "at") or start the chapter on a scene with free space at the top (a map, a scene3d shot)`); break; }
    }
  }
  cardBad.forEach((l) => fl("C1", l));
  add(`chapters C1: one card per chapter, the same style, none in the first ${D.DOC_RULES.noCardBefore} s, clear of the text under it`, cardBad.length === 0, chList.map((c) => `ch${c.n} ${fmt(c.card)} top ${c.top}`).join(", "));

  // ---------------------------------------------------------------- 8) callout safety + stacking + 2D text QA
  const ovl = (a, b, m = 0) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) - m) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) - m);
  const callBad = new Map(), stackBad = new Map(), fitBad = new Map(), frameBad = new Map(), bandBad = new Map(), hookBad = new Map();
  const contrastPairs = new Map();
  const capOn = (s) => s.spec.caption !== "off";
  const BAND = { x0: D.LF.CAP_SIDE, x1: 1920 - D.LF.CAP_SIDE, y0: D.LF.CAP_Y - D.LF.CAP_HALF, y1: D.LF.CAP_Y + D.LF.CAP_HALF };
  const K3 = C3 ? SCENES[kit](C3, K, C.kitRecipe, true) : null;
  for (const t of sampleTs) {
    const s = C.sceneAt(t);
    const layers = [];
    if (t <= C.hookUntil) layers.push({ name: "the hook", r: hookBox });
    if (t >= 1.0 && capOn(s)) layers.push({ name: "the caption", r: { x0: BAND.x0, x1: BAND.x1, y0: D.LF.CAP_Y - 70, y1: D.LF.CAP_Y + 70 } });
    if (s.type !== "scene3d") {
      const L = C.layoutAt(s, t);
      for (const it of L.screen) {
        const r = { x0: it.sx0, x1: it.sx1, y0: it.sy0, y1: it.sy1 };
        if (!it.ok && !fitBad.has(`${s.id}.${it.key}`)) fitBad.set(`${s.id}.${it.key}`, `FAIL ${s.id} ${s.type} ${it.key}: ${it.need}`);
        if (it.show < 0.3) continue;
        layers.push({ name: `${s.id} ${q(it.text.slice(0, 24))}`, r });
        const fk = `${it.fg}|${it.bg ?? "bg"}`;
        if (!contrastPairs.has(fk)) contrastPairs.set(fk, `${s.id} ${it.key}`);
        if (it.show >= 0.99) {
          if ((r.x0 < 16 || r.x1 > 1904 || r.y0 < 16 || r.y1 > 1064) && !frameBad.has(`${s.id}.${it.key}`)) frameBad.set(`${s.id}.${it.key}`, `FAIL ${s.id} ${s.type} ${q(it.text)} leaves the frame (x ${r.x0.toFixed(0)}-${r.x1.toFixed(0)}, y ${r.y0.toFixed(0)}-${r.y1.toFixed(0)}) at ${fmt(t)}: shorten it or use fewer items`);
          if (capOn(s) && ovl(r, BAND) > 0 && !bandBad.has(`${s.id}.${it.key}`)) bandBad.set(`${s.id}.${it.key}`, `FAIL ${s.id} ${s.type} ${q(it.text)} is in the caption band (y ${r.y0.toFixed(0)}-${r.y1.toFixed(0)}, the band ${BAND.y0}-${BAND.y1}) at ${fmt(t)}: ${s.type === "document" ? "drop or shorten body lines" : s.type === "recap" ? "use fewer or shorter points" : "use fewer or shorter items"}`);
        }
        if (it.explains) for (const k of it.explains) {
          const tg = L.screen.find((x) => x.key === k && x.show >= 0.3);
          if (tg && ovl(r, { x0: tg.sx0, x1: tg.sx1, y0: tg.sy0, y1: tg.sy1 }) > 0 && !callBad.has(`${s.id}.${it.key}`)) callBad.set(`${s.id}.${it.key}`, `FAIL ${s.id} callout ${q(it.text)} covers ${q(tg.text)}, the text it explains, at ${fmt(t)}: shorten the callout or move the cards apart (fewer cards per board)`);
        }
        if (t <= C.hookUntil && ovl(r, hookBox) > 0 && !hookBad.has(s.id)) hookBad.set(s.id, `FAIL ${s.id} ${s.type} text ${q(it.text)} sits under the cold-open hook (until ${fmt(C.hookUntil)}): start ${s.id} after the hook, drop its title, or set doc.json "hook.until" earlier`);
      }
    } else if (K3 && winOf(t)) {
      const sc = K3.sample(t);
      if (sc) {
        const v = sc.views[0];
        const brs = (sc.boards ?? []).filter((b) => b.landed).map((b) => ({ b, r: boxRect(v, b.box) })).filter((x) => x.r);
        for (const c of sc.cards ?? []) {
          if (!c.landed) continue;
          layers.push({ name: `${s.id} card ${q(c.label)}`, r: c });
          for (const x of brs) if (ovl(c, x.r, 4) > 400 && !callBad.has(`${s.id}.${c.key}.${x.b.key}`)) callBad.set(`${s.id}.${c.key}.${x.b.key}`, `FAIL ${s.id} (scene3d) card ${q(c.label)} covers the 3D text ${q(x.b.label)} at ${fmt(t)}: point the card ("on") at another target, move the prop, or frame the text away from the card's spot`);
        }
      }
    }
    if (t < 3.0) {
      for (let i = 0; i < layers.length; i++) for (let j = i + 1; j < layers.length; j++) for (let k = j + 1; k < layers.length; k++) {
        const A = layers[i].r, B = layers[j].r, Cc = layers[k].r;
        if (ovl(A, B) > 0 && ovl(A, Cc) > 0 && ovl(B, Cc) > 0 && !stackBad.size) stackBad.set(t, `FAIL text stacks 3 deep at ${fmt(t)} (the first 3 s): ${layers[i].name}, ${layers[j].name}, ${layers[k].name}: move one of them, or start the scene's text after 3 s`);
      }
    }
  }
  const look = D.LOOKS[doc.theme];
  const conBad = [];
  for (const [k, where] of contrastPairs) {
    const [fg, bg] = k.split("|");
    for (const b of bg === "bg" ? [look.bg, look.bg2] : [look[bg]]) { const r = contrastRatio(look[fg], b); if (r !== null && r < 4.5) conBad.push(`FAIL theme ${doc.theme}: ${fg} ${look[fg]} on ${bg} ${b} is ${r.toFixed(2)}:1 (needs 4.5:1), first at ${where}: an engine colour (src/doc/themes.ts)`); }
  }
  [...callBad.values()].forEach((l) => fl("T1", l)); [...stackBad.values()].forEach((l) => fl("T1", l)); [...hookBad.values()].forEach((l) => fl("T1", l));
  add("text T1: a callout never covers what it explains; no text 3 deep in the first 3 s; nothing under the hook", callBad.size + stackBad.size + hookBad.size === 0, `${callBad.size} callout, ${stackBad.size} stack, ${hookBad.size} hook`);
  [...fitBad.values(), ...frameBad.values(), ...bandBad.values(), ...conBad].forEach((l) => fl("T2", l));
  add("text T2: 2D text fits at >= 42 px (secondary >= 32), inside the frame, out of the caption band, >= 4.5:1", fitBad.size + frameBad.size + bandBad.size + conBad.length === 0, `${fitBad.size} fit, ${frameBad.size} frame, ${bandBad.size} band, ${conBad.length} contrast`);

  // ---------------------------------------------------------------- 9) prop-text sanity, accuracy, legal wording, teases
  const sourceText = [timings.turns.map((tn) => tn.text).join(" "), ...(doc.sources ?? [])].join(" ");
  const vocab = new Set(tokens(sourceText).map(stem));
  const lowerSrc = sourceText.toLowerCase();
  const srcNums = [...D.spokenNumbers(words).map((n) => n.value), ...screenNumbers((doc.sources ?? []).join(" ")), ...D.spokenNumbers((doc.sources ?? []).join(" ").split(/\s+/).map((w) => ({ w }))).map((n) => n.value)];
  const sanBad = new Map(), accBad = new Map(), legalBad = new Map();
  const unknown = (txt, all) => tokens(txt).filter((w) => !vocab.has(stem(w)) && (all || !GENERIC.has(stem(w))) && !(all && GENERIC.has(stem(w))) && !/^(the|and|for|with|its|his|her|their|our|was|are|not|but)$/i.test(w));
  for (const [t, scr] of screenCache) {
    for (const x of scr) {
      const nameField = x.src === "kit" || x.item?.names || x.item?.headline;
      const key = `${x.scene.id}|${x.text}`;
      if (nameField && !sanBad.has(key)) {
        const bad = unknown(x.text, false);
        if (bad.length) sanBad.set(key, `FAIL ${x.scene.id} ${x.scene.type} shows ${q(x.text)}: ${bad.map((b) => `"${b}"`).join(", ")} ${bad.length > 1 ? "are" : "is"} not in the script or doc.json "sources": use the script's words (names, places, dates) or add the source`);
      }
      for (const w of tokens(x.text)) if (MONTHS.test(w) && !lowerSrc.includes(w.toLowerCase()) && !sanBad.has(key + w)) sanBad.set(key + w, `FAIL ${x.scene.id} shows the month ${w.toUpperCase()} (${q(x.text)}), which the script and sources never say: fix the date or add the source`);
      for (const v of screenNumbers(x.text)) if (!srcNums.some((s) => sameNum(s, v)) && !accBad.has(key + v)) accBad.set(key + v, `FAIL ${x.scene.id} ${x.scene.type} shows ${v.toLocaleString("en-US")} (${q(x.text)}), a number that is not in the script or sources: every number on screen must come from them`);
      for (const w of tokens(x.text)) {
        const st = stem(w);
        if (VERDICT.has(st)) {
          const ch = x.scene.ch, chA = C.chapters[ch - 1]?.t ?? 0, chB = C.chapters[ch]?.t ?? dur;
          if (!words.some((v) => v.t >= chA && v.t < chB && stem(v.w) === st) && !legalBad.has(key)) legalBad.set(key, `FAIL ${x.scene.id} shows ${q(x.text)}: "${w.toUpperCase()}" is a verdict word the voice never says in this chapter: show only what the script says happened (e.g. "SUED", "CHARGED" only if charged, "RULED")`);
        }
        if (NEG_EVENT.includes(st)) {
          const ws = words.filter((v) => v.t >= x.scene.a - 1 && v.t < x.scene.b + 0.5);
          for (let i = 0; i < ws.length; i++) if (stem(ws[i].w) === st && ws.slice(Math.max(0, i - 3), i).some((v) => NEGATION.test(v.w.replace(/[.,;:!?"]/g, ""))) && !legalBad.has(key + "neg")) legalBad.set(key + "neg", `FAIL ${x.scene.id} shows ${q(x.text)} while the voice says "${ws.slice(Math.max(0, i - 3), i + 1).map((v) => v.w).join(" ")}" (${fmt(ws[i].t)}): the picture says the opposite of the line: show what did happen`);
        }
      }
    }
  }
  // maps: the region must be one the script names (no US map for a Bangladesh story)
  for (const s of SC) {
    if (s.type !== "map" || s.spec.region === "world" || s.spec.region === "city") continue;
    const c = D.COUNTRIES[s.spec.region];
    const cities = Object.entries(D.CITIES).filter(([, v]) => v[3] === s.spec.region).map(([, v]) => v[0].toLowerCase().replace(/[^a-z ]/g, "").split(" ")[0]);
    if (!c.aka.some((a) => lowerSrc.includes(a)) && !cities.some((x) => x.length > 2 && lowerSrc.includes(x))) sanBad.set(`${s.id}|map`, `FAIL ${s.id} is a map of ${c.name}, but the script and sources never name it or one of its cities: use the region the story is about`);
  }
  // exhibits / stamps pointing at a target: the callout's words must be the target's or the voice's around it
  if (C3) for (const ks of C3.shots) {
    if (!shotsIn.has(ks.id)) continue;
    for (const ac of ks.spec.actions ?? []) {
      if (!ac.on || !ac.text) continue;
      const tg = (ks.spec.props ?? []).find((p) => p.id === String(ac.on).split(".")[0]);
      const t0 = C.at(ac.at);
      const near = words.filter((w) => w.t >= t0 - 3 && w.t <= t0 + 3).map((w) => stem(w.w));
      const pool = new Set([...near, ...tokens(tg?.text ?? "").map(stem), ...tokens(tg?.id ?? "").map(stem), ...tokens(tg?.kit ?? "").map(stem)]);
      if (!tokens(ac.text).some((w) => pool.has(stem(w))) && tokens(ac.text).length) legalBad.set(`${ks.id}|on`, `FAIL ${docIdOfKit(ks.id)} (scene3d) ${ac.do} ${q(ac.text)} points at ${ac.on}, but neither the voice (+-3 s) nor ${ac.on} says it: put the callout on the thing the voice names`);
    }
  }
  [...sanBad.values()].forEach((l) => fl("S1", l)); [...accBad.values()].forEach((l) => fl("S1", l)); [...legalBad.values()].forEach((l) => fl("S2", l));
  add("sanity S1: names, places, dates and headlines on screen are in the script or sources; every number on screen is in them; maps show the story's region", sanBad.size + accBad.size === 0, `${sanBad.size} name/place/date, ${accBad.size} number`);
  add("legal S2: no verdict words the script does not say; pictures never contradict the line; callouts sit on what the voice names", legalBad.size === 0, legalBad.size ? `${legalBad.size}` : "clean");
  if (only === null || only === 1) {
    const coldEnd = C.chapters[0].card;
    const teases = S.filter((s) => s.a < coldEnd && s.spec.tease);
    const tBad = [];
    for (const s of teases) {
      const p = S.find((x) => x.spec.id === s.spec.tease);
      if (!p) { if (only === null) tBad.push(`FAIL ${s.id} teases "${s.spec.tease}" but no scene has "id": "${s.spec.tease}": show the promised moment later (a scene3d with the people, a document or a quote) and give it that id`); continue; }
      if (p.a < coldEnd) tBad.push(`FAIL ${s.id} teases ${p.id}, which is inside the cold open: the payoff must come after the chapter 1 card (${fmt(coldEnd)})`);
      const okType = p.type === "scene3d" ? (p.spec.actors ?? []).length > 0 : ["document", "quote", "compare"].includes(p.type);
      if (!okType) tBad.push(`FAIL ${p.id} pays off the tease in ${s.id} as a ${p.type}${p.type === "scene3d" ? " with nobody in it" : ""}: show the moment itself (scene3d with the people, or the document / quote)`);
    }
    tBad.forEach((l) => fl("S3", l));
    const people0 = S.filter((s) => s.a < coldEnd && s.type === "scene3d" && (s.spec.actors ?? []).length && !s.spec.tease && s.a > 0);
    add("teases S3: every moment the cold open promises (\"tease\": \"<id>\") is shown later as a scene", tBad.length === 0, `${teases.length} tease(s)${teases.length === 0 ? " (warn: the cold open declares no tease)" : ""}${people0.length ? `; cold-open people shots without "tease": ${people0.map((s) => s.id).join(", ")}` : ""}`, true, "video");
  }

  // ---------------------------------------------------------------- 10) the theme's 3D kit QA on the scene3d windows
  let kitMd = [];
  if (C3 && !noQa) {
    const winTimes = qaTimes(C.duration, true, qaSample).filter((t) => winOf(t) && (only === null || inCh(C.sceneAt(t))));
    // clip QA
    const ov = (p, a) => [0, 1, 2].every((k) => Math.abs(p.c[k] - a.c[k]) < p.h[k] + a.h[k]);
    const hits = new Map();
    for (const t of winTimes) {
      const qa = C3.qa(t); const actors = qa.figs ?? qa.execs ?? qa.bolts ?? [];
      const sid = docIdOfKit(C3.shotAt(t).id);
      for (const b of actors) { if (b.c[1] - b.h[1] < -0.02) hits.set(`${sid} ${b.name} below the floor`, t); for (const p of qa.props ?? []) if (ov(p, b) && !hits.has(`${sid} ${p.name} x ${b.name}`)) hits.set(`${sid} ${p.name} x ${b.name}`, t); }
      const bodies = actors.filter((b) => /\.(body|head)$/.test(b.name));
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) if (bodies[i].name.split(".")[0] !== bodies[j].name.split(".")[0] && ov(bodies[i], bodies[j])) hits.set(`${sid} ${bodies[i].name} x ${bodies[j].name}`, t);
    }
    for (const [k, t] of hits) fl("K0", `CLIP ${k} first at ${fmt(t)} (scene3d): move the prop or the actor (the kit guide's "at" offsets)`);
    add(`3D clip QA (${kit}): no prop in a body, nobody below the floor, no two people overlapping`, hits.size === 0, `${hits.size} clip(s) over ${winTimes.length} sampled frames`);
    // framing R1-R6 (the kit's sampler; the whip-in skip and long-form card handling as in framing_kits.runFraming)
    const sc0 = SCENES[kit](C3, K, C.kitRecipe, true);
    const whip = (t) => { const s = C3.shotAt(t); return (s.spec.in === "whip" || s.spec.cam?.preset === "whip") && t < s.a + 0.35; };
    const sample = (t) => { if (whip(t)) return null; const x = sc0.sample(t); if (x) for (const c of x.cards) c.lines = []; return x; };
    const KF = kitFraming({ C: C3, W: 1920, H: 1080, landscape: true, times: winTimes, sample, frame0: sc0.frame0, boardsAll: sc0.boardsAll });
    for (const l of KF.fq.lines) fl("K1", relabel(l));
    for (const r of KF.rows) add(`3D ${r[0]}`, r[1], r[2], r[3]);
    // polish P1 (counters), P2 (kit text fit), P4 (occlusion); P3 (chapter cards) is the doc's C1
    const PQ = polishQA({ kit, C: C3, m: K, recipe: C.kitRecipe, words, landscape: false, step: qaSample, within: (t) => winOf(t) && (only === null || inCh(C.sceneAt(t))), shotsIn: only === null ? shotsIn : new Set([...shotsIn].filter((id) => { const d = docIdOfKit(id); return S.find((s) => s.id === d && inCh(s)); })) });
    for (const l of PQ.lines) fl("K2", relabel(l));
    for (const r of PQ.rows) add(`3D ${r[0]}`, r[1], r[2], r[3]);
    kitMd = [...KF.fr.md.map(relabel), ...PQ.md.map(relabel)];
  }

  // ---------------------------------------------------------------- 11) the shared long-form gate (whole video only)
  let pacing = null;
  if (only === null) {
    const events = [];
    for (const s of S) { for (const t of [...s.ats, ...s.pinAts]) events.push([t, `${s.id} build`]); if (s.type === "compare") events.push([s.rightT, `${s.id} right`]); if (s.type === "document") events.push([s.hlT, `${s.id} marker`]); }
    let capT = 0, capLow = 0; const moved = [];
    for (const s of S) { if (s.spec.caption === "off") continue; const a = Math.max(s.a, 1), b = s.b; if (b <= a) continue; let y = D.LF.CAP_Y; if (s.type === "scene3d" && C3) { const ks = kitShotOf.get(s.id); const cy = ks?.capY; y = cy === undefined ? D.LF.CAP_Y : cy <= 1.5 ? cy * 1080 : cy; } capT += b - a; if (y >= 0.75 * 1080) capLow += b - a; if (Math.abs(y - D.LF.CAP_Y) > 1) moved.push(`${s.id}->${(y / 10.8).toFixed(0)}%`); }
    const G = kitLongGate({ shots: S.map((s) => ({ id: s.id, a: s.a, b: s.b, set: `${s.type}/${s.set}`, beat: !!s.spec.beat })), events, chapters: C.chapters, words, dur, audio: { music: doc.music ?? "suspense", cues: C.cues }, hookUntil: C.hookUntil, hookText: doc.hook.text.replace(/\*/g, ""), caps: { share: capT ? capLow / capT : 1, moved }, boards: { small: [], edge: [], band: [] } });
    pacing = G.pacing;
    for (const g of G.gate) if (!/text readable|fully inside the frame|caption band/.test(g[0])) add(`long-form: ${g[0]}`, g[1], g[2], g[3]);
  }

  // ---------------------------------------------------------------- 12) report
  const per = chList.map((ch) => {
    const xs = S.filter((s) => s.ch === ch.n);
    const types = [...new Set(xs.map((s) => s.type))];
    const ids = new Set(xs.map((s) => s.id));
    const mine = [...fails.values()].flat().filter((l) => [...ids].some((id) => new RegExp(`\\b${id}\\b`).test(l)) || new RegExp(`chapter ${ch.n}\\b`).test(l));
    return { ch, n: xs.length, types, s3: t3(xs) / Math.max(1e-9, tAll(xs)), fails: mine };
  });
  const allFails = [...fails.values()].flat();
  const hardFail = rows.some((r) => r[3] && !r[1]) || allFails.some((l) => /^(FAIL|CLIP)/.test(l));
  for (const p of per) console.log(`chapter ${p.ch.n} ${q(p.ch.title)}: ${p.n} scenes, ${p.types.length} types (${p.types.join(", ")}), scene3d ${(p.s3 * 100).toFixed(0)} %, ${p.fails.length ? `${p.fails.length} FAIL line(s)` : "clean"}`);
  for (const [k, ok, d, hard] of rows) console.log(`${ok ? "PASS" : hard ? "FAIL" : "warn"}  ${k}: ${d}`);
  if (allFails.length) { console.log(`--- ${allFails.length} line(s) to fix:`); for (const l of allFails) console.log("  " + l); }
  const chTxt = chaptersTxt(C.chapters);
  if (only === null) console.log(`chapters:\n${chTxt.trimEnd()}`);
  console.log(`${hardFail ? "FAILED" : "PASSED"} (${scope}) in ${((Date.now() - T0) / 1000).toFixed(2)} s`);

  if (!check && only === null) {
    const us = slug.replace(/-/g, "_");
    const pascal = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Doc";
    mkdirSync(join(ROOT, "src/doc/gen"), { recursive: true });
    writeFileSync(join(ROOT, `src/doc/gen/${us}.doc.gen.ts`), `// generated by tools/doc_build.mjs from finance/longform/${slug}/doc.json + chapters + vo/timings.json; do not edit\n` +
      `import type { Word } from "../../fin/recipe/types";\nimport type { DocChapter, DocVideo } from "../types";\n\n` +
      `export const ID = ${JSON.stringify(pascal)};\nexport const VO_DURATION: number | undefined = ${vo === undefined ? "undefined" : vo};\n` +
      `export const DOC: DocVideo = ${JSON.stringify(doc, null, 1)};\nexport const CHAPTERS: DocChapter[] = ${JSON.stringify(chapters, null, 1)};\n` +
      `export const WORDS: Word[] = ${JSON.stringify(words)};\n`);
    const gens = readdirSync(join(ROOT, "src/doc/gen")).filter((f) => f.endsWith(".doc.gen.ts")).sort();
    writeFileSync(join(ROOT, "src/doc/registry.gen.ts"), `// generated by tools/doc_build.mjs; do not edit (lists src/doc/gen/*.doc.gen.ts)\nimport type { Word } from "../fin/recipe/types";\nimport type { DocChapter, DocVideo } from "./types";\n` +
      gens.map((f, i) => `import * as G${i} from "./gen/${f.replace(/\.ts$/, "")}";`).join("\n") +
      `\n\nexport const DOC_VIDEOS: { id: string; doc: DocVideo; chapters: DocChapter[]; words: Word[]; vo?: number }[] = [\n` +
      gens.map((_, i) => `  { id: G${i}.ID, doc: G${i}.DOC, chapters: G${i}.CHAPTERS, words: G${i}.WORDS, vo: G${i}.VO_DURATION },`).join("\n") + `\n];\n`);
    const kitCues = C3 ? C3.audio.cues.filter((c) => winOf(c.t)) : [];
    writeFileSync(join(ROOT, `out/tmp/${slug}.cues.json`), JSON.stringify({ [pascal]: { music: doc.music ?? "suspense", musicDb: -12, cues: [...C.cues, ...kitCues].sort((a, b) => a.t - b.t), duration: dur, cuts: S.map((s) => s.a) } }));
    const rep = [
      `# ${slug}: doc long-form QA (tools/doc_build.mjs)`, "",
      `Composition \`${pascal}\` in \`src/index.doc.ts\` (1920x1080, 30 fps, no motion blur). Theme ${doc.theme}, 3D kit ${kit}. ${S.length} scenes, ${dur.toFixed(2)} s (${(dur / 60).toFixed(2)} min), ${C.chapters.length} chapters.`, "",
      "## Per chapter", "", "| chapter | scenes | types | scene3d | fails |", "|---|---|---|---|---|",
      ...per.map((p) => `| ${p.ch.n} ${p.ch.title} | ${p.n} | ${p.types.length}: ${p.types.join(", ")} | ${(p.s3 * 100).toFixed(0)} % | ${p.fails.length} |`), "",
      "## Gates", "", "| check | result | detail |", "|---|---|---|",
      ...rows.map(([k, ok, d, hard]) => `| ${k} | ${ok ? "PASS" : hard ? "**FAIL**" : "warn"} | ${String(d).replace(/\|/g, "/")} |`), "",
      "## Lines to fix", "", ...(allFails.length ? allFails.map((l) => `- ${l}`) : ["- none"]), "",
      "## Spoken figures", "", ...numRows.map((r) => `- ${fmt(r.t)} line ${r.line} "${r.said}" = ${r.value.toLocaleString("en-US")}: ${r.found ? `shown by ${r.found.x.src === "hook" ? "the hook" : `${r.found.x.scene.id} ${r.found.x.src === "kit" ? "(3D board)" : r.found.x.scene.type}`} ${q(r.found.x.text)} at ${fmt(r.found.t)}` : "**not shown**"}`), "",
      "## Scenes", "", "| id | ch | at | len | type | set | camera | beat |", "|---|---|---|---|---|---|---|---|",
      ...S.map((s) => `| ${s.id} | ${s.ch} | ${fmt(s.a)} | ${(s.b - s.a).toFixed(1)} s | ${s.type} | ${s.set} | ${s.type === "scene3d" ? s.cam.split(":")[0] : s.move} | ${s.spec.beat ? "yes" : ""} |`), "",
      ...kitMd,
      ...(pacing ? [`Pacing: ${pacing.events} visual-change marks, longest gap ${pacing.maxGap.toFixed(2)} s, mean shot ${pacing.meanShot.toFixed(2)} s.`, ""] : []),
      "## chapters.txt", "", "```", chTxt.trimEnd(), "```", "",
    ];
    writeFileSync(join(dir, "RECIPE_QA.md"), rep.join("\n"));
    writeFileSync(join(dir, "chapters.txt"), chTxt);
    console.log(`wrote src/doc/gen/${us}.doc.gen.ts, the doc registry (${gens.length}), ${join(dir, "RECIPE_QA.md")}, chapters.txt, out/tmp/${slug}.cues.json; composition ${pascal} in src/index.doc.ts`);
  }
  return hardFail ? 1 : 0;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main(process.argv.slice(2)));
