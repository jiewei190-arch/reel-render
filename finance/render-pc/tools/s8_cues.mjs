// prints the S8 four-money-minds SFX cues (S8_CUES in src/fin/s8/fourminds.tsx) as JSON: esbuild bundle with
// react/three/remotion stubbed (same trick as hook_cues.mjs). Used by tools/s8_mix.py.
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { pathToFileURL } from "url";
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*|react|react\/jsx-runtime)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const r = await build({ stdin: { contents: 'export { S8_CUES, S8_DURATION } from "./src/fin/s8/fourminds";', resolveDir: ".", loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
mkdirSync("build", { recursive: true });
writeFileSync("build/s8_cues.bundle.mjs", r.outputFiles[0].text);
const m = await import(pathToFileURL("build/s8_cues.bundle.mjs").href + "?" + Date.now());
console.log(JSON.stringify({ duration: m.S8_DURATION, cues: m.S8_CUES }));
