// tech3d entry ("Tech explained" kit): the tech recipe compositions and the kit gallery, registered apart from the Block
// Money entries (src/index.ts, src/index.toolkit.ts), so work in progress here can never break their bundles.
//   npx remotion still src/index.tech.ts <CompId> out.jpg --frame=N --gl=swangle
import { registerRoot } from "remotion";
import { TechRoot } from "./tech/root";

registerRoot(TechRoot);
