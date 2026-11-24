// biz_stills.mjs: bundle src/index.biz.ts once, then render many stills with one browser.
//   node tools/biz_stills.mjs gallery [--scale 0.5] [--out out/biz/stills] [--only <substring>]
//       every BizGallery still (src/biz/gallery.ts GALLERY_STILLS) -> <out>/<name>.jpg
//   node tools/biz_stills.mjs <CompId> <frame|Ns> [...] [--scale 0.5] [--out dir]
//       frames of a composition ("90" = frame 90, "3s" = 3.0 s, "mid", "end") -> <out>/<CompId>_f<frame>.jpg
// CPU machines: the GL backend defaults to swangle (GL=angle on the PC's GPU).
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const scale = parseFloat(opt("--scale", "0.5"));
const outDir = resolve(ROOT, opt("--out", "out/biz/stills"));
const only = opt("--only", "");
const gl = process.env.GL ?? "swangle";
const [what, ...rest] = args;
if (!what) { console.error("usage: node tools/biz_stills.mjs gallery | <CompId> <frames...>"); process.exit(2); }
mkdirSync(outDir, { recursive: true });

let jobs = [];
let comp = what;
if (what === "gallery") {
  comp = "BizGallery";
  const r = await build({ entryPoints: [join(ROOT, "src/biz/gallery.ts")], bundle: true, write: false, format: "esm", platform: "node", logLevel: "error",
    plugins: [{ name: "stub", setup(b) { b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" })); } }] });
  mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
  const f = join(ROOT, "out/tmp/biz_gallery.bundle.mjs");
  writeFileSync(f, r.outputFiles[0].text);
  const m = await import(pathToFileURL(f).href + "?" + Date.now());
  jobs = m.GALLERY_STILLS.filter((s) => !only || s.name.includes(only)).map((s) => ({ frame: s.frame, out: join(outDir, `${s.name}.jpg`) }));
}
console.log(`bundling src/index.biz.ts ...`);
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.biz.ts"), publicDir: join(ROOT, "public") });
// BROWSER_EXE=<path to a chrome-headless-shell> uses a local browser instead of the one Remotion downloads (cloud boxes)
const browserExecutable = process.env.BROWSER_EXE ?? null;
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl } });
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser, inputProps: {} });
if (what !== "gallery") {
  const last = composition.durationInFrames - 1;
  jobs = rest.map((x) => {
    const f = x === "mid" ? Math.floor(last / 2) : x === "end" ? last : x.endsWith("s") ? Math.round(parseFloat(x) * 30) : parseInt(x, 10);
    return { frame: Math.min(last, f), out: join(outDir, `${comp}_f${String(Math.min(last, f)).padStart(4, "0")}.jpg`) };
  });
}
for (const j of jobs) {
  await renderStill({ composition, serveUrl, output: j.out, frame: j.frame, scale, imageFormat: "jpeg", jpegQuality: 88, puppeteerInstance: browser, browserExecutable, chromiumOptions: { gl }, timeoutInMilliseconds: 240000 });
  console.log(`${j.out} (frame ${j.frame})`);
}
await browser.close({ silent: true });
