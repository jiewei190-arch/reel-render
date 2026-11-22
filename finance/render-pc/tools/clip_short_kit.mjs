// clip_short_kit.mjs: the KIT half of tools/clip_short.mjs. A kit recipe ("kit": "law3d" | "biz3d" | "cyber3d" |
// "tech3d") is clipped with the kit's own clip adapter (`clipAdapter`, exported by tools/<kit>_entry.ts), because each
// kit has its own time fields, cards, hook rules and frame-0 gate:
//   clipAdapter.compile(recipe, words, vo)            the kit compiler (validates the clip)
//   clipAdapter.retimeShot(shot, remap, srcRecipe)    rewrite every time (`At`) field of a shot in place; places stay
//   clipAdapter.retimeRecipe(recipe, remap, seg)      -> the clip's extra top-level fields (global props etc.)
//   clipAdapter.hookText(text)                        -> the kit's hook text (<= 5 words, kit markup such as *gold*)
//   clipAdapter.hookShot({ recipe, first, src, hookText, stake, set, hookEnd })  -> a fresh shot at 0 (the frame-0 card)
//   clipAdapter.loopFix?(lastShot, lastRef, lastT)    -> names of cards/boards re-timed to land on the last word
// clip_short.mjs has already cut and re-timed the words (shared with the Block Money path); this file builds the
// shots, writes the recipe and checks that it compiles. Then: node tools/recipe_build.mjs <out> (the kit's Shorts gate).
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";

const ENTRY = { tech3d: "tech_entry.ts", law3d: "law_entry.ts", biz3d: "biz_entry.ts", cyber3d: "cyber_entry.ts" };
const INDEX = { tech3d: "src/index.tech.ts", law3d: "src/index.law.ts", biz3d: "src/index.biz.ts", cyber3d: "src/index.cyber.ts" };

export const clipKit = async (ctx) => {
  const { ROOT, opt, slug, out, srcDir, dstDir, recipe, fromW, toW, tA, tB, off, dur, turns, newTimings, W1, A0, keep, sets, dropped, remap, end0, HOOK_END, LEAD_IN, clean } = ctx;
  const kit = recipe.kit;
  if (!ENTRY[kit]) { console.error(`clip_short: unknown kit "${kit}"`); return 2; }
  const stub = { name: "stub", setup(b) {
    b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
  } };
  const rb = await build({ entryPoints: [join(ROOT, "tools", ENTRY[kit])], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
  mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
  const f = join(ROOT, `out/tmp/clip_short.${kit}.mjs`);
  writeFileSync(f, rb.outputFiles[0].text);
  const E = await import(pathToFileURL(f).href + "?" + Date.now());
  const K = E.clipAdapter;
  if (!K) { console.error(`clip_short: tools/${ENTRY[kit]} exports no clipAdapter`); return 2; }

  // ---------------------------------------------------------------- shots that overlap the segment, re-timed
  const shots = keep.map((x, k) => {
    const s = JSON.parse(JSON.stringify(x.s));
    K.retimeShot(s, remap, recipe); // the source recipe too (a kit may need its format to re-place px fields)
    s.at = k === 0 ? HOOK_END : s.at;
    if (sets[x.i] !== undefined) s.set = sets[x.i];
    delete s.beat;
    return s;
  });
  const lastW = W1[W1.length - 1];
  const turnOf = new Map([...ctx.turnMap].map(([o, n]) => [n, o]));
  const lastRefSrc = `${turnOf.get(lastW.turn)}:${clean(lastW.w)}`;
  let lastRef;
  try { lastRef = remap(A0.at(`${lastRefSrc}#${countUpTo(ctx.W0, tB, turnOf.get(lastW.turn), clean(lastW.w), clean)}`)); } catch { lastRef = Math.round(lastW.t * 1000) / 1000; }
  const loopMoved = K.loopFix ? K.loopFix(shots[shots.length - 1], lastRef, lastW.t) ?? [] : [];

  // ---------------------------------------------------------------- the fresh hook shot at frame 0
  const chapter = (recipe.chapters ?? []).map((c) => ({ ...c, t: A0.at(c.word) })).filter((c) => c.t <= tA + 1e-6).pop();
  const raw = opt("--hook") ?? chapter?.title ?? String(recipe.hook.text).replace(/\*/g, "");
  const hookText = K.hookText(raw);
  const STAKE = /\$\s?\d|\d[\d,.]*\s*%|^\d[\d,.]*$/;
  const stakeWord = W1.find((w) => STAKE.test(w.w.replace(/[.,!?:;]+$/, "")));
  const stake = opt("--stake") ?? (stakeWord ? stakeWord.w.replace(/[.,!?:;]+$/, "").toUpperCase() : null);
  const firstShot = keep[0].s;
  const hookShot = K.hookShot({ recipe, first: shots[0], src: firstShot, hookText, stake, set: sets[keep[0].i], hookEnd: HOOK_END });
  const extra = K.retimeRecipe ? K.retimeRecipe(recipe, remap, { tA, tB, off, end: tB + 0.7, end0, at: A0.at }) ?? {} : {};
  const firstLineEnd = Math.max(...W1.filter((w) => w.turn === 1).map((w) => w.end));
  const skip = new Set(["slug", "format", "frame", "chapters", "shots", "hook", "duration", "props"]);
  const top = Object.fromEntries(Object.entries(recipe).filter(([k]) => !skip.has(k)));
  const clip = { ...top, kit, slug: out, hook: { text: hookText, until: Math.round(Math.min(firstLineEnd + 0.25, 2.5) * 1000) / 1000 }, ...extra, shots: [hookShot, ...shots] };

  // ---------------------------------------------------------------- compile (the kit's own compiler)
  let C = null, err = null;
  try { C = K.compile(clip, W1, dur); } catch (e) { err = e.message; }

  // ---------------------------------------------------------------- write
  mkdirSync(join(dstDir, "vo"), { recursive: true });
  const fmtRecipe = (o) => JSON.stringify({ ...o, shots: "@@SHOTS@@" }, null, 2).replace('"@@SHOTS@@"', "[\n" + o.shots.map((s) => "    " + JSON.stringify(s)).join(",\n") + "\n  ]");
  writeFileSync(join(dstDir, "recipe.json"), fmtRecipe(clip) + "\n");
  writeFileSync(join(dstDir, "vo/timings.json"), JSON.stringify(newTimings, null, 1) + "\n");
  writeFileSync(join(dstDir, "script.txt"), turns.map((t) => t.text).join("\n") + "\n");
  const anchored = JSON.stringify(shots).match(/"\d+:[^"]+"/g)?.length ?? 0;
  const pascal = out.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Recipe";
  writeFileSync(join(dstDir, "CLIP.md"), [
    `# ${out}: a ${kit} Short cut from ${slug}`, "",
    `- Source: \`${srcDir.replace(resolve(ROOT, ".."), "finance")}\` (${kit}, ${recipe.format ?? "portrait"}), words "${fromW}" to "${toW}": ${tA.toFixed(2)}-${tB.toFixed(2)} s of the source.`,
    `- Re-timed: source time - ${off.toFixed(3)} s, so the first word lands at ${LEAD_IN.toFixed(2)} s. Length ${dur.toFixed(2)} s, ${W1.length} words, ${turns.length} lines.`,
    `- Shots: a fresh hook shot (0-${HOOK_END.toFixed(1)} s, made by the ${kit} clip adapter: hook "${hookText}"${stake ? `, stake "${stake}"` : ""}) + ${shots.length} source shot(s) (${keep.map((x) => `S${String(x.i + 1).padStart(2, "0")}`).join(", ")})${dropped ? `; ${dropped} source shot(s) that would start inside the hook were folded into the first` : ""}.`,
    `- ${anchored} time(s) stay anchored to words of the new timings; the rest are seconds.`,
    ...(loopMoved.length ? [`- Loop rule: ${loopMoved.join(", ")} on the last shot now land on the last word ("${lastW.w}").`] : []),
    `- Rendered natively at 1080x1920 by the ${kit} kit (portrait layout: its own hook, cards and captions), not cropped from the 16:9 video.`,
    err ? `- **The clip does not compile yet:** ${err}` : `- Compiles: ${C.shots.length} shots, ${(C.duration / 30).toFixed(2)} s.`, "",
    "Next:", "```", `node tools/recipe_build.mjs ${out}`, `npx remotion render ${INDEX[kit]} ${pascal} out/${out}.mp4 --gl=angle`, "```",
    "If the gate fails: pick another --from-word (no character names in the first 2 s, the stake early), or pass --hook / --stake.", "",
  ].join("\n"));
  console.log(`wrote ${dstDir}/recipe.json, vo/timings.json, script.txt, CLIP.md`);
  console.log(`clip ${tA.toFixed(2)}-${tB.toFixed(2)} s of ${slug} (${kit}) -> ${dur.toFixed(2)} s portrait Short: hook "${hookText}", ${shots.length + 1} shots, ${W1.length} words, ${anchored} word-anchored times`);
  if (err) { console.error(`COMPILE ERROR in the clip: ${err}`); return 1; }
  console.log(`next: node tools/recipe_build.mjs ${out}`);
  return 0;
};
/** the n of `<turn>:<word>#n` for the last occurrence of word w in turn `turn` up to time tB */
const countUpTo = (W0, tB, turn, w, clean) => W0.filter((x) => x.turn === turn && clean(x.w) === w && x.end <= tB + 1e-6).length;
