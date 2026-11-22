// Scam Files TV channel branding: renders BrandPfp (800x800) and BrandBanner (2560x1440) from src/cyber/branding.tsx
// at full resolution (plain frames, no motion blur), then the previews (tools/brand_previews.py).
//   node tools/brand_stills.mjs            -> ../../branding/scam-files-tv/{pfp,banner,preview_phone,preview_circle}.png
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const OUT = "../../branding/scam-files-tv";
mkdirSync(OUT, { recursive: true });
const FRAMES = { BrandPfp: [45, "pfp.png"], BrandBanner: [75, "banner.png"] };
for (const [id, [frame, file]] of Object.entries(FRAMES)) {
  const t0 = Date.now();
  execFileSync("npx", ["remotion", "still", "src/index.cyber.ts", id, `${OUT}/${file}`, `--frame=${frame}`, "--gl=swangle", "--image-format=png", "--overwrite"], { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`${OUT}/${file}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
execFileSync("python3", ["tools/brand_previews.py", OUT], { stdio: "inherit" });
