// storytime_stills.mjs: bundle src/index.storytime.ts once, then render many stills with one browser.
//   node tools/storytime_stills.mjs <CompId> <frame|Ns|mid|end> [...] [--scale 0.5] [--out out/storytime/stills] [--prefix name]
//   node tools/storytime_stills.mjs StoryGallery all      every gallery second (expressions, sets, the shatter)
// CPU machines: the GL backend defaults to swangle (GL=angle on a GPU).
import { mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const scale = parseFloat(opt("--scale", "0.5"));
const outDir = resolve(ROOT, opt("--out", "out/storytime/stills"));
const prefix = opt("--prefix", "");
const gl = process.env.GL ?? "swangle";
const [comp, ...rest] = args;
if (!comp) { console.error("usage: node tools/storytime_stills.mjs <CompId> <frames...>"); process.exit(2); }
mkdirSync(outDir, { recursive: true });
console.log("bundling src/index.storytime.ts ...");
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.storytime.ts"), publicDir: join(ROOT, "public") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser, inputProps: {} });
const last = composition.durationInFrames - 1;
const frames = rest[0] === "all" ? Array.from({ length: Math.floor(last / 30) + 1 }, (_, k) => k * 30 + 15).filter((f) => f <= last)
  : rest.map((x) => (x === "mid" ? Math.floor(last / 2) : x === "end" ? last : x.endsWith("s") ? Math.round(parseFloat(x) * 30) : parseInt(x, 10)));
for (const f0 of frames) {
  const f = Math.min(last, f0);
  const png = process.env.PNG === "1";
  const out = join(outDir, png ? `${prefix || comp}.png` : `${prefix || comp}_f${String(f).padStart(4, "0")}.jpg`);
  const T = Date.now();
  await renderStill({ composition, serveUrl, output: out, frame: f, scale, ...(process.env.PNG === "1" ? { imageFormat: "png" } : { imageFormat: "jpeg", jpegQuality: 88 }), puppeteerInstance: browser, chromiumOptions: { gl }, timeoutInMilliseconds: 240000 });
  console.log(`${out} (frame ${f}, ${((Date.now() - T) / 1000).toFixed(1)} s)`);
}
await browser.close({ silent: true });
