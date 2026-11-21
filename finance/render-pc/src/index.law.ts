// law3d entry ("weird true court cases" kit): the law recipe compositions and the kit gallery, registered apart from the
// Block Money (src/index.ts) and tech3d (src/index.tech.ts) entries, so work here can never break their bundles.
//   npx remotion still src/index.law.ts <CompId> out.jpg --frame=N --gl=swangle
import { registerRoot } from "remotion";
import { LawRoot } from "./law/root";

registerRoot(LawRoot);
