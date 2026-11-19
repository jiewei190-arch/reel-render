// prints the S8 four-money-minds SFX cues (S8_CUES in src/fin/s8/fourminds.tsx) as JSON: esbuild bundle with
// react/three/remotion stubbed (same trick as hook_cues.mjs). Used by tools/s8_mix.py.
// Optional args: <module> <cuesExport> <durationExport> [voSegsExport] (default: the four-money-minds exports), e.g.
//   node tools/s8_cues.mjs ./src/fin/s8/thousand S8B_CUES S8B_DURATION S8B_VO_SEGS
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { pathToFileURL } from "url";
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*|react|react\/jsx-runtime)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" }));
} };
const [mod = "./src/fin/s8/fourminds", cuesN = "S8_CUES", durN = "S8_DURATION", voN] = process.argv.slice(2);
const names = [cuesN, durN, voN].filter(Boolean).join(", ");
const r = await build({ stdin: { contents: `export { ${names} } from "${mod}";`, resolveDir: ".", loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node", plugins: [stub], jsx: "automatic", logLevel: "error" });
mkdirSync("build", { recursive: true });
writeFileSync("build/s8_cues.bundle.mjs", r.outputFiles[0].text);
const m = await import(pathToFileURL("build/s8_cues.bundle.mjs").href + "?" + Date.now());
const out = { duration: m[durN], cues: m[cuesN] };
if (voN) out.vo = m[voN];
console.log(JSON.stringify(out));
