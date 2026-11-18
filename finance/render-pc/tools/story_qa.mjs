// FORMAT v1 clip QA (MAIN's hard gates): for every output frame AND 4 sub-frames per frame, every moving/static prop box
// vs every actor's head and torso box (no prop may enter a head or body), and every prop's bottom vs the floor (y >= 0).
// usage: node tools/story_qa.mjs [CompId]   -> prints a report; exit 1 if anything clips
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { pathToFileURL } from "url";
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const r = await build({ entryPoints: ["tools/story_cues_entry.ts"], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
mkdirSync("out/tmp", { recursive: true }); // not build/: render.sh owns build/
writeFileSync("out/tmp/story_qa.bundle.mjs", r.outputFiles[0].text);
const m = await import(pathToFileURL("out/tmp/story_qa.bundle.mjs").href + "?" + Date.now());
const want = process.argv[2];
const ov = (a, b) => [0, 1, 2].every((k) => Math.abs(a.c[k] - b.c[k]) < a.h[k] + b.h[k]);
let bad = 0;
for (const v of m.V1) {
  if (want && v.id !== want) continue;
  const n = v.spec.duration * 4;
  const hits = new Map();
  for (let f = 0; f < n; f++) {
    const t = f / 120;
    const { actors, props } = v.qa(t);
    for (const p of props) {
      if (p.c[1] - p.h[1] < -0.01) { const k = `${p.name} below floor`; if (!hits.has(k)) hits.set(k, t); }
      for (const a of actors) if (ov(p, a)) { const k = `${p.name} x ${a.name}`; if (!hits.has(k)) hits.set(k, t); }
    }
  }
  console.log(`${v.id}: ${n / 4} frames x 4 sub-frames checked, ${hits.size} clip(s)`);
  for (const [k, t] of hits) console.log(`  CLIP ${k} first at ${t.toFixed(3)} s (frame ${Math.floor(t * 30)})`);
  bad += hits.size;
}
process.exit(bad ? 1 : 0);
