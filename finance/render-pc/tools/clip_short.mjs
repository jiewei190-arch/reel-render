// clip_short.mjs: cut a vertical Short out of a long-form (or any) recipe, natively (a new portrait recipe, not a crop).
//   node tools/clip_short.mjs <slug> --from-word X --to-word Y --out <slug>-short-N [--hook "TEXT"] [--stake "TEXT"]
//        [--src <dir>] [--shorts <dir>] [--force]
// X and Y are `At` word references of the source voice-over ("forty", "forty#2", "13:forty", "line:11"...): the clip runs
// from the START of X to the END of Y. Writes <shorts>/<out>/ (default finance/shorts/<out>):
//   recipe.json      a portrait recipe (no "format": a Short) with every shot that overlaps the segment, re-timed to start
//                    at 0, plus a FRESH hook shot at frame 0 (hookZoom on the segment's first actor, the hook text and a
//                    stake board), cut away at 1.0 s so the Shorts gate (frame-0 rules) can pass
//   vo/timings.json  the segment's words, shifted so the first word lands at 0.10 s; lines renumbered from 1
//   script.txt       the segment's lines;  CLIP.md  where it came from + the next commands
// Word anchors stay word anchors: every `At` that pointed at a word inside the segment is rewritten as "<line>:<word>#<n>"
// of the new timings (checked by resolving it again); anything else becomes seconds. Then build it like any Short:
//   node tools/recipe_build.mjs <out>     (the full Shorts QA + gate)
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const slug = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--") && args[i - 1] !== "--force"));
const fromW = opt("--from-word"), toW = opt("--to-word"), out = opt("--out");
const usage = 'usage: node tools/clip_short.mjs <slug> --from-word X --to-word Y --out <slug>-short-N [--hook "TEXT"] [--stake "TEXT"] [--src <dir>] [--shorts <dir>] [--force]';
if (!slug || !fromW || !toW || !out) { console.error(usage); process.exit(2); }
if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+$/.test(out)) { console.error("slugs use a-z, 0-9 and - only"); process.exit(2); }
const srcDir = opt("--src") ? resolve(opt("--src"), slug) : [resolve(ROOT, "../longform", slug), resolve(ROOT, "../shorts", slug)].find((d) => existsSync(join(d, "recipe.json")));
if (!srcDir || !existsSync(join(srcDir, "recipe.json"))) { console.error(`no recipe for "${slug}" in finance/longform or finance/shorts`); process.exit(2); }
const dstDir = resolve(opt("--shorts") ?? resolve(ROOT, "../shorts"), out);
if (existsSync(join(dstDir, "recipe.json")) && !args.includes("--force")) { console.error(`${dstDir}/recipe.json exists: pick a new --out (or --force)`); process.exit(1); }

// the engine's own `At` resolver (src/fin/recipe/timing.ts), bundled for node
const r = await build({ entryPoints: [join(ROOT, "src/fin/recipe/timing.ts")], bundle: true, write: false, format: "esm", platform: "node", logLevel: "error" });
mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
const bundle = join(ROOT, "out/tmp/clip_short.timing.mjs");
writeFileSync(bundle, r.outputFiles[0].text);
const { makeAt, wordsOfTimings } = await import(pathToFileURL(bundle).href + "?" + Date.now());

const recipe = JSON.parse(readFileSync(join(srcDir, "recipe.json"), "utf8"));
const timings = JSON.parse(readFileSync(join(srcDir, "vo/timings.json"), "utf8"));
const W0 = wordsOfTimings(timings);
const A0 = makeAt(W0);
const end0 = recipe.duration ?? timings.source?.duration ?? Math.max(...W0.map((w) => w.end)) + 0.6;
const isWordRef = (s) => typeof s === "string" && !/^(line:|lineEnd:|end:)/.test(s.trim()) && !/^-?\d+(\.\d+)?$/.test(s.trim());
let tA, tB;
try {
  tA = A0.at(fromW);
  tB = isWordRef(toW) ? A0.at(`end:${toW}`) : A0.at(toW);
} catch (e) { console.error(e.message); process.exit(2); }
if (!(tB > tA)) { console.error(`--to-word "${toW}" (${tB.toFixed(2)} s) is not after --from-word "${fromW}" (${tA.toFixed(2)} s)`); process.exit(2); }

// ---------------------------------------------------------------- the segment's words, re-timed
const LEAD_IN = 0.1; // the first word lands at 0.10 s (the Shorts gate: first word by 0.2 s)
const off = tA - LEAD_IN;
const segIdx = W0.map((w, i) => i).filter((i) => W0[i].t >= tA - 1e-6 && W0[i].end <= tB + 1e-6);
const turnMap = new Map();
for (const i of segIdx) if (!turnMap.has(W0[i].turn)) turnMap.set(W0[i].turn, turnMap.size + 1);
const r3 = (x) => Math.round(x * 1000) / 1000;
const origTurns = new Map(timings.turns.map((tn) => [tn.turn, tn]));
const turns = [...turnMap].map(([ot, nt]) => {
  const ws = origTurns.get(ot).words.filter((w) => w.t >= tA - 1e-6 && w.end <= tB + 1e-6).map((w) => ({ ...w, t: r3(w.t - off), end: r3(w.end - off) }));
  return { turn: nt, text: ws.map((w) => w.w).join(" "), words: ws };
});
const dur = r3(tB - off + 0.7);
const newTimings = { source: { ...(timings.source ?? {}), duration: dur, clippedFrom: slug, clipFrom: r3(tA), clipTo: r3(tB) }, turns };
const W1 = wordsOfTimings(newTimings);
const A1 = makeAt(W1);
const clean = (w) => w.toLowerCase().replace(/[^a-z0-9'%$-]/g, "").replace(/^'+|'+$/g, "");

// ---------------------------------------------------------------- re-anchor every At
const near = (a, b) => Math.abs(a - b) < 1e-4;
/** an At of the source -> an At of the clip: a word ref when it points inside the segment, else seconds (>= 0) */
const remap = (a, keepNeg = false) => {
  if (a === undefined || a === null) return a;
  const tOld = A0.at(a);
  const tNew = r3(tOld - off);
  const num = keepNeg ? tNew : Math.max(0, tNew);
  if (typeof a === "number" || /^-?\d+(\.\d+)?$/.test(String(a).trim())) return num;
  const s = String(a).trim();
  const m = /^(.*?)([+-]\d+(\.\d+)?)$/.exec(s);
  const base = m && m[1] ? m[1] : s, d = m && m[1] ? m[2] : "";
  const tb = A0.at(base);
  let ref = null;
  if (base.startsWith("line:") || base.startsWith("lineEnd:")) {
    const n = parseInt(base.split(":")[1], 10), nt = turnMap.get(n);
    const all = W0.filter((w) => w.turn === n), inSeg = all.filter((w) => w.t >= tA - 1e-6 && w.end <= tB + 1e-6);
    if (nt && inSeg.length === all.length) ref = `${base.startsWith("line:") ? "line" : "lineEnd"}:${nt}`;
  } else {
    const isEnd = base.startsWith("end:");
    const i = segIdx.find((k) => near(isEnd ? W0[k].end : W0[k].t, tb) && (isEnd || near(W0[k].t, tb)));
    if (i !== undefined) {
      const w = W0[i], nt = turnMap.get(w.turn), cw = clean(w.w);
      const nth = segIdx.filter((k) => k <= i && W0[k].turn === w.turn && clean(W0[k].w) === cw).length;
      ref = `${isEnd ? "end:" : ""}${nt}:${cw}${nth > 1 ? `#${nth}` : ""}`;
    }
  }
  if (ref) {
    const cand = ref + d;
    try { if (near(A1.at(cand), tNew)) return cand; } catch { /* falls back to seconds */ }
  }
  return num;
};

// ---------------------------------------------------------------- shots that overlap the segment
const starts = recipe.shots.map((s) => A0.at(s.at));
let set = recipe.shots[0].set ?? "store";
const sets = recipe.shots.map((s) => (set = s.set ?? set));
const segEnd = tB + 0.7;
let keep = recipe.shots.map((s, i) => ({ s, i, a: starts[i], b: i + 1 < starts.length ? starts[i + 1] : end0 })).filter((x) => x.b > tA && x.a < tB - 0.05); // a shot starting after the last word would be a flash
const HOOK_END = 1.0; // the frame-0 board shot cuts away by ~1.0 s (Shorts gate)
// shots that would start inside the hook shot: keep only the last of them, starting at HOOK_END
const early = keep.filter((x) => x.a - off <= HOOK_END + 0.3);
keep = [early[early.length - 1], ...keep.filter((x) => x.a - off > HOOK_END + 0.3)];
const dropped = early.length - 1;
const shots = keep.map((x, k) => {
  const s = JSON.parse(JSON.stringify(x.s));
  s.at = k === 0 ? HOOK_END : remap(s.at);
  s.set = sets[x.i]; // every kept shot names its set (the source may have set it on an earlier, dropped shot)
  delete s.beat;
  if (s.cam?.hit !== undefined) s.cam.hit = remap(s.cam.hit);
  for (const a of s.actors ?? []) {
    if (a.from !== undefined) a.from = remap(a.from);
    if (a.squash) a.squash = a.squash.map((q) => remap(q));
    if (a.then) a.then = a.then.map((q) => ({ ...q, at: remap(q.at) }));
    if (a.gestures) a.gestures = a.gestures.map((q) => ({ ...q, at: remap(q.at) }));
  }
  for (const p of s.props ?? []) if (p.hit !== undefined) p.hit = remap(p.hit); // shot props' `from` is a place (fly-in origin)
  if (s.fx) s.fx = s.fx.map((f) => (typeof f === "string" ? f : f.at !== undefined ? { ...f, at: remap(f.at) } : f));
  if (s.sfx) s.sfx = s.sfx.map((q) => ({ ...q, at: remap(q.at) })).filter((q) => (typeof q.at === "number" ? q.at < dur : true));
  return s;
});
// times that now fall before their shot's start are harmless (the pose/prop is simply already there), except a
// first-shot cam.hit, which has to be inside the shot for slamZoom: move it to the shot start + 0.12 s
if (typeof shots[0].cam?.hit === "number" && shots[0].cam.hit < HOOK_END) shots[0].cam.hit = r3(HOOK_END + 0.12);

// the Shorts loop rule (recipe_build gate): on the last shot a text board lands ON the last word, not before it
const lastW = W1[W1.length - 1];
const lastRef = remap(A0.at(`${[...turnMap].find(([, nt]) => nt === lastW.turn)[0]}:${clean(lastW.w)}#${W0.filter((w, i) => i <= segIdx[segIdx.length - 1] && w.turn === W0[segIdx[segIdx.length - 1]].turn && clean(w.w) === clean(lastW.w)).length}`) + off);
const loopMoved = [];
for (const p of shots[shots.length - 1].props ?? []) {
  if (!(p.kit === "label" || p.kit === "stamp" || p.text)) continue;
  // the gate reads a board's landing as its hit when it moves, else the shot start (a static board or stamp is there from the cut)
  const h = p.motion ? (p.hit === undefined ? null : typeof p.hit === "number" ? p.hit : A1.at(p.hit)) : null;
  if (h !== null && h >= lastW.t - 0.05) continue;
  if (!p.motion) { p.motion = "dropSlam"; p.drop = 0.8; }
  p.hit = lastRef;
  loopMoved.push(p.id ?? p.kit);
}
// ---------------------------------------------------------------- the fresh hook shot at frame 0
const firstActor = keep.flatMap((x) => x.s.actors ?? []).find((a) => a.pose !== "walk" && a.pose !== "run") ?? null;
const who = firstActor?.id ?? Object.keys(recipe.cast)[0];
const chapter = (recipe.chapters ?? []).map((c) => ({ ...c, t: A0.at(c.word) })).filter((c) => c.t <= tA + 1e-6).pop();
const words5 = (s) => s.trim().split(/\s+/).slice(0, 5).join(" ");
const hookText = words5(opt("--hook") ?? (chapter?.title ?? recipe.hook.text.replace(/\*/g, "")).toUpperCase());
const STAKE = /\$\s?\d|\d[\d,.]*\s*%|^\d[\d,.]*$/;
const stakeWord = W1.find((w) => STAKE.test(w.w.replace(/[.,!?:;]+$/, "")));
const stake = opt("--stake") ?? (stakeWord ? stakeWord.w.replace(/[.,!?:;]+$/, "").toUpperCase() : null);
const hookShot = {
  at: 0, set: sets[keep[0].i], note: `fresh hook card (tools/clip_short.mjs): "${hookText}"`,
  cam: { preset: "hookZoom", target: who, dist: 2.1 },
  actors: [{ id: who, pose: "smug", at: "mark", then: [{ at: 0.45, pose: "shock" }], squash: [0.45] }],
  props: [{ id: "stake", kit: "label", text: [stake ?? hookText.split(" ")[0]], color: "#d62a2a", size: [0.62, 0.26, 0.05], at: "mark:0,0.62,0.4" }],
  fx: [{ fx: "shake", at: 0.45 }],
};
const tag = recipe.tag ? { ...recipe.tag, from: Math.max(1.0, A0.at(recipe.tag.from) - off), until: Math.min(dur, Math.max(1.0, A0.at(recipe.tag.until) - off)) } : undefined;
if (tag) { tag.from = r3(tag.from); tag.until = r3(tag.until); if (tag.until <= tag.from) tag.until = dur; }
const gprops = (recipe.props ?? []).filter((p) => A0.at(p.from, 0) < segEnd && A0.at(p.until, end0 + 1) > tA).map((p) => ({ ...p, from: p.from === undefined ? undefined : remap(p.from), until: p.until === undefined ? undefined : remap(p.until) }));
const firstLineEnd = Math.max(...W1.filter((w) => w.turn === 1).map((w) => w.end));
const clip = {
  slug: out,
  style: recipe.style ?? "S1",
  hook: { text: hookText, until: r3(Math.min(firstLineEnd + 0.25, 2.5)) },
  ...(recipe.music ? { music: recipe.music } : {}),
  ...(recipe.talk ? { talk: recipe.talk } : {}),
  ...(recipe.quality !== undefined ? { quality: recipe.quality } : {}),
  ...(recipe.extras !== undefined ? { extras: recipe.extras } : {}),
  cast: recipe.cast,
  ...(tag ? { tag } : {}),
  ...(gprops.length ? { props: gprops } : {}),
  shots: [hookShot, ...shots],
};

// ---------------------------------------------------------------- portrait fit
// boards laid out for 16:9 can fall off a 9:16 frame: compile the clip (the engine in node, like recipe_build) and pull
// a shot's camera back (cam.dist x 1.15 per pass, up to 2x) until every landed text board is inside the frame
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const rb = await build({ entryPoints: [join(ROOT, "tools/recipe_entry.ts")], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
const eng = join(ROOT, "out/tmp/clip_short.engine.mjs");
writeFileSync(eng, rb.outputFiles[0].text);
const E = await import(pathToFileURL(eng).href + "?" + Date.now());
const PRESET_DIST = { hookZoom: 1.7, closeUp: 1.3, medium: 2.6, wide: 5.4, slamZoom: 2.2, pushIn: 2.4, whip: 2.4, orbit: 2.8, splitScreen: 2.3 };
const fitted = [], squeezed = [];
const outside = (C, si) => {
  const sh = C.shots[si];
  for (let t = sh.a + 0.05; t < sh.b; t += 0.1) {
    const cams = C.camAt(t);
    if (cams.split) return false;
    const texty = new Set(sh.props.filter((p) => (p.spec.kit === "label" || p.spec.kit === "stamp" || p.spec.text) && !p.held && t >= (p.spec.motion ? p.hit : p.a) + 0.3).map((p) => p.key));
    for (const b of C.qa(t).props) {
      if (!texty.has(b.name)) continue;
      for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
        const q = E.project(cams.main, [b.c[0] + dx * b.h[0], b.c[1] + dy * b.h[1], b.c[2]], 1920, 0);
        if (!q || q.x < 24 || q.x > 1056 || q.y < 24 || q.y > 1896) return true;
      }
    }
  }
  return false;
};
for (let pass = 0; pass < 7; pass++) {
  let C;
  try { C = E.compileRecipe(clip, W1, dur); } catch (e) { console.error(`portrait fit skipped: ${e.message}`); break; }
  let moved = false;
  clip.shots.forEach((s, i) => {
    if (i === 0 || s.cam.preset === "povFirstPerson" || s.cam.preset === "splitScreen") return;
    if (!outside(C, i)) return;
    // first pass: squeeze the shot's own text boards toward the lens target (x halved about it; absolute places)
    if (pass === 0) {
      const sh = C.shots[i], cx = sh.lens.subj(sh.a)[0];
      let sq = 0;
      (s.props ?? []).forEach((p, k) => {
        const pr = sh.props.find((q) => q.key === (p.id ?? p.asset ?? p.kit ?? `p${k}`));
        if (!pr || pr.held || p.motion === "stick-to-face" || p.motion === "rain" || !(p.kit === "label" || p.kit === "stamp" || p.text)) return;
        const q = pr.pos(sh.a);
        if (Math.abs(q[0] - cx) < 0.5) return;
        p.at = [Math.round((cx + (q[0] - cx) * 0.5) * 100) / 100, Math.round(q[1] * 100) / 100, Math.round(q[2] * 100) / 100];
        sq++;
      });
      if (sq) { squeezed.push(i); moved = true; return; }
    }
    const d0 = s.cam.dist ?? PRESET_DIST[s.cam.preset] ?? 2.6;
    const f = fitted.find((x) => x.i === i);
    const base = f ? f.from : d0;
    if (d0 >= base * 2.0) return;
    s.cam.dist = Math.round(Math.min(base * 2.0, d0 * 1.15) * 100) / 100;
    if (f) f.to = s.cam.dist; else fitted.push({ i, from: d0, to: s.cam.dist });
    moved = true;
  });
  if (!moved) break;
}
if (squeezed.length) console.log(`portrait fit: squeezed the boards of shot(s) ${squeezed.map((i) => i + 1).join(", ")} toward the lens target`);
if (fitted.length) console.log(`portrait fit: pulled back ${fitted.map((f) => `shot ${f.i + 1} dist ${f.from} -> ${f.to}`).join(", ")}`);

// ---------------------------------------------------------------- write
mkdirSync(join(dstDir, "vo"), { recursive: true });
const fmtRecipe = (o) => JSON.stringify({ ...o, shots: "@@SHOTS@@" }, null, 2).replace('"@@SHOTS@@"', "[\n" + o.shots.map((s) => "    " + JSON.stringify(s)).join(",\n") + "\n  ]");
writeFileSync(join(dstDir, "recipe.json"), fmtRecipe(clip) + "\n");
writeFileSync(join(dstDir, "vo/timings.json"), JSON.stringify(newTimings, null, 1) + "\n");
writeFileSync(join(dstDir, "script.txt"), turns.map((t) => t.text).join("\n") + "\n");
const anchored = JSON.stringify(shots).match(/"\d+:[^"]+"/g)?.length ?? 0;
writeFileSync(join(dstDir, "CLIP.md"), [
  `# ${out}: a Short cut from ${slug}`, "",
  `- Source: \`${srcDir.replace(resolve(ROOT, ".."), "finance")}\` (${recipe.format ?? "portrait"}), words "${fromW}" to "${toW}": ${tA.toFixed(2)}-${tB.toFixed(2)} s of the source.`,
  `- Re-timed: source time - ${off.toFixed(3)} s, so the first word lands at ${LEAD_IN.toFixed(2)} s. Length ${dur.toFixed(2)} s, ${W1.length} words, ${turns.length} lines.`,
  `- Shots: a fresh hook shot (0-${HOOK_END.toFixed(1)} s: hookZoom on \`${who}\`, hook "${hookText}", stake board "${hookShot.props[0].text[0]}") + ${shots.length} source shot(s) (${keep.map((x) => `S${String(x.i + 1).padStart(2, "0")}`).join(", ")})${dropped ? `; ${dropped} source shot(s) that would start inside the hook were folded into the first` : ""}.`,
  `- ${anchored} time(s) stay anchored to words of the new timings; the rest are seconds.`,
  ...(squeezed.length ? [`- Portrait fit: the text boards of shot(s) ${squeezed.map((i) => i + 1).join(", ")} moved halfway toward the lens target (absolute places), so they fit 9:16.`] : []),
  ...(fitted.length ? [`- Portrait fit: the camera pulled back so the 16:9 boards fit 9:16 on ${fitted.map((f) => `shot ${f.i + 1} (dist ${f.from} -> ${f.to})`).join(", ")}.`] : []),
  ...(loopMoved.length ? [`- Loop rule: board(s) ${loopMoved.join(", ")} on the last shot now land on the last word ("${lastW.w}").`] : []),
  `- Rendered natively at 1080x1920 (portrait framing from the same 3D scene), not cropped from the 16:9 video.`, "",
  "Next:", "```", `node tools/recipe_build.mjs ${out}`, `npx remotion render src/index.toolkit.ts ${out.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("")}Recipe out/${out}.mp4 --gl=angle`, "```",
  "If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.", "",
].join("\n"));
console.log(`wrote ${dstDir}/recipe.json, vo/timings.json, script.txt, CLIP.md`);
console.log(`clip ${tA.toFixed(2)}-${tB.toFixed(2)} s of ${slug} -> ${dur.toFixed(2)} s portrait Short: hook "${hookText}", ${shots.length + 1} shots, ${W1.length} words, ${anchored} word-anchored times`);
console.log(`next: node tools/recipe_build.mjs ${out}`);
