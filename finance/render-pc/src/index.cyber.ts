// cyber3d entry ("Scams & Hacks" kit): the cyber recipe compositions and the kit gallery, registered apart from the
// Block Money (src/index.ts) and tech3d (src/index.tech.ts) entries, so work here can never break their bundles.
//   npx remotion still src/index.cyber.ts <CompId> out.jpg --frame=N --gl=swangle
import { registerRoot } from "remotion";
import { CyberRoot } from "./cyber/root";

registerRoot(CyberRoot);
