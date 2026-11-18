// prints HOOK_AUDIO (+ durations) as JSON: bundles src/fin/hooks.tsx with esbuild, stubbing react/three/remotion
import { build } from "esbuild";
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const r = await build({ entryPoints: ["src/fin/hooks.tsx"], bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
import { writeFileSync, mkdirSync } from "fs";
import { pathToFileURL } from "url";
mkdirSync("build", { recursive: true });
writeFileSync("build/hook_cues.bundle.mjs", r.outputFiles[0].text);
const m = await import(pathToFileURL("build/hook_cues.bundle.mjs").href + "?" + Date.now());
const out = {};
for (const h of ["A", "B", "C"]) out[h] = { ...m.HOOK_AUDIO[h], duration: m[`HOOK_${h}`].duration / 30, cuts: m[`HOOK_${h}`].shots.map((s) => s.a) };
console.log(JSON.stringify(out));
