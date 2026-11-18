// prints the FORMAT v1 audio plans as JSON: { <CompId>: { music, musicDb, cues, duration, cuts } }
// bundles src/fin/v1/index.ts with esbuild, stubbing react/three/remotion (same trick as tools/hook_cues.mjs)
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { pathToFileURL } from "url";
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const r = await build({ entryPoints: ["tools/story_cues_entry.ts"], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
mkdirSync("build", { recursive: true });
writeFileSync("build/story_cues.bundle.mjs", r.outputFiles[0].text);
const m = await import(pathToFileURL("build/story_cues.bundle.mjs").href + "?" + Date.now());
const out = {};
for (const v of m.V1) out[v.id] = { music: v.audio.music, musicDb: v.audio.musicDb ?? -12, cues: v.audio.cues, duration: v.spec.duration / 30, cuts: v.spec.shots.map((s) => s.a) };
console.log(JSON.stringify(out));
