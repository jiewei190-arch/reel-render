// doc_stills.mjs: bundle src/index.doc.ts once and render review stills of a doc video with one browser.
//   node tools/doc_stills.mjs <slug> [--types] [--scale 1] [--out docs/longform_doc]
//       --types (default): the first scene of every scene type at its start / middle / end -> <out>/<type>_<Sxx>_<when>.jpg
//   node tools/doc_stills.mjs <slug> --frames 30 450 12.5s ...   specific frames -> <out>/<slug>_f<frame>.jpg
// Prints the render time of every still (2D vs scene3d) so the per-minute cost can be estimated.
// CPU machines: the GL backend defaults to swangle (GL=angle on the PC's GPU).
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const scale = parseFloat(opt("--scale", "1"));
const theme = opt("--theme", "");
const all = args.includes("--all");
const outDir = resolve(ROOT, opt("--out", "docs/longform_doc"));
const gl = process.env.GL ?? "swangle";
const slug = args[0];
if (!slug) { console.error("usage: node tools/doc_stills.mjs <slug> [--types | --frames ...]"); process.exit(2); }
const fi = args.indexOf("--frames");
mkdirSync(outDir, { recursive: true });
const id = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Doc";
// compile in node to find the scenes (the same compiler the render uses)
const stub = { name: "stub", setup(b) { b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" })); } };
const r = await build({ entryPoints: [join(ROOT, "tools/doc_entry.ts")], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
writeFileSync(join(ROOT, "out/tmp/doc_stills.bundle.mjs"), r.outputFiles[0].text);
const D = await import(pathToFileURL(join(ROOT, "out/tmp/doc_stills.bundle.mjs")).href + "?" + Date.now());
const dir = resolve(ROOT, "../longform", slug);
const doc = JSON.parse(readFileSync(join(dir, "doc.json"), "utf8"));
const tj = JSON.parse(readFileSync(join(dir, doc.voice?.timings ?? "vo/timings.json"), "utf8"));
const words = tj.turns.flatMap((tn) => tn.words.map((w) => ({ w: w.w, turn: tn.turn, t: w.t, end: w.end })));
const C = D.compileDoc(doc, doc.chapters.map((c) => JSON.parse(readFileSync(join(dir, c.file), "utf8"))), words, tj.source?.duration);
let jobs = [];
if (fi >= 0) jobs = args.slice(fi + 1).map((x) => { const f = x.endsWith("s") ? Math.round(parseFloat(x) * 30) : parseInt(x, 10); return { frame: f, out: join(outDir, `${slug}_f${String(f).padStart(4, "0")}.jpg`), kind: C.sceneAt(f / 30).type }; });
else {
  const seen = new Set();
  for (const s of C.scenes) {
    if (theme && s.type === "scene3d") continue;
    if (all) { jobs.push({ frame: Math.floor(((s.a + s.b) / 2) * 30), out: join(outDir, `${theme ? theme + "_" : ""}${s.id}_${s.type}.jpg`), kind: s.type }); continue; }
    if (seen.has(s.type)) continue; seen.add(s.type);
    const at = { start: s.a + Math.min(0.5, (s.b - s.a) * 0.15), mid: (s.a + s.b) / 2, end: s.b - 0.1 };
    for (const [k, t] of Object.entries(at)) jobs.push({ frame: Math.floor(t * 30), out: join(outDir, `${theme ? theme + "_" : ""}${s.type}_${s.id}_${k}.jpg`), kind: s.type });
  }
}
console.log(`bundling src/index.doc.ts ...`);
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.doc.ts"), publicDir: join(ROOT, "public") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
const inputProps = theme ? { id, theme } : { id };
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, inputProps });
const times = { d2: [], d3: [] };
for (const j of jobs) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, inputProps, output: j.out, frame: Math.min(composition.durationInFrames - 1, j.frame), scale, imageFormat: "jpeg", jpegQuality: 86, puppeteerInstance: browser, chromiumOptions: { gl }, timeoutInMilliseconds: 300000 });
  const dt = (Date.now() - t0) / 1000;
  (j.kind === "scene3d" ? times.d3 : times.d2).push(dt);
  console.log(`${j.out} (frame ${j.frame}, ${j.kind}, ${dt.toFixed(1)} s)`);
}
await browser.close({ silent: true });
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
console.log(`still render time at scale ${scale} (${gl}): 2D ${avg(times.d2).toFixed(2)} s/frame over ${times.d2.length}, scene3d ${avg(times.d3).toFixed(2)} s/frame over ${times.d3.length} (stills include a page load; a video render reuses the page)`);
