// law_segments.mjs: render a law3d Short shot by shot, so a fix re-renders only the shots it touched.
//   node tools/law_segments.mjs <slug> --out <dir> [--only 3,7-9] [--concat <file.mp4>] [--concurrency 3] [--crf 16]
// On a CPU box (swangle) a frame costs about the same at any --scale (the 3D view always renders at full size), so a
// half-size "preview" render saves nothing: render the segments once at full size, downscale a copy for the preview,
// then re-render only the shots that changed and concat again (stream copy: every segment starts on a key frame).
// Reads out/tmp/<slug>.cues.json (the cut list written by tools/recipe_build.mjs <slug>); writes <dir>/seg_NN.mp4.
// BROWSER_EXE=<chrome> uses a local browser; GL=angle on a GPU.
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const outDir = resolve(opt("--out", "out/law/segments"));
const only = opt("--only", "");
const concat = opt("--concat", "");
const concurrency = parseInt(opt("--concurrency", "3"), 10);
const crf = parseInt(opt("--crf", "16"), 10);
const slug = args[0];
if (!slug) { console.error("usage: node tools/law_segments.mjs <slug> --out <dir> [--only 3,7-9] [--concat out.mp4]"); process.exit(2); }
const comp = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Recipe";
const plan = JSON.parse(readFileSync(join(ROOT, `out/tmp/${slug}.cues.json`), "utf8"))[comp];
const total = Math.round(plan.duration * 30);
const starts = plan.cuts.map((c) => Math.round(c * 30));
const test = opt("--frames", "");
const segs0 = starts.map((a, i) => ({ n: i + 1, a, b: (i + 1 < starts.length ? starts[i + 1] : total) - 1 }));
// --frames a-b: one test range instead of the shots (seg_00.mp4)
const segs = test ? [{ n: 0, a: +test.split("-")[0], b: +test.split("-")[1] }] : segs0;
const want = new Set();
for (const part of only.split(",").filter(Boolean)) { const [x, y] = part.split("-").map(Number); for (let k = x; k <= (y ?? x); k++) want.add(k); }
const todo = segs.filter((s) => !want.size || want.has(s.n));
mkdirSync(outDir, { recursive: true });
const name = (s) => join(outDir, `seg_${String(s.n).padStart(2, "0")}.mp4`);
if (todo.length && only !== "none") {
  const gl = process.env.GL ?? "swangle", browserExecutable = process.env.BROWSER_EXE ?? null;
  console.log(`bundling src/index.law.ts ...`);
  const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.law.ts"), publicDir: join(ROOT, "public") });
  // no shared browser: renderMedia opens its own with the composition's viewport (frames captured through a shared
  // instance came out as tiled strips with concurrency > 1)
  const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions: { gl }, inputProps: {} });
  for (const s of todo) {
    const T = Date.now();
    await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: name(s), frameRange: [s.a, s.b], crf, concurrency, muted: true, browserExecutable, chromiumOptions: { gl }, timeoutInMilliseconds: 300000, logLevel: "error" });
    console.log(`shot ${s.n}: frames ${s.a}-${s.b} (${s.b - s.a + 1}) -> ${name(s)} in ${((Date.now() - T) / 1000).toFixed(0)} s`);
  }
}
if (concat) {
  const missing = segs.filter((s) => !existsSync(name(s)));
  if (missing.length) { console.error(`cannot concat: missing shot(s) ${missing.map((s) => s.n).join(", ")}`); process.exit(1); }
  const list = join(outDir, "concat.txt");
  writeFileSync(list, segs.map((s) => `file '${name(s)}'`).join("\n") + "\n");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", resolve(concat)]);
  console.log(`concat ${segs.length} shots (${total} frames) -> ${resolve(concat)}`);
}
