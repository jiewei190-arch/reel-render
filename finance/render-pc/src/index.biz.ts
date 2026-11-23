// biz3d entry ("costly mistakes and collapses" kit): the biz recipe compositions and the kit gallery, registered apart
// from the Block Money and tech3d entries, so work in progress here can never break their bundles.
//   npx remotion still src/index.biz.ts <CompId> out.jpg --frame=N --gl=swangle
import { registerRoot } from "remotion";
import { BizRoot } from "./biz/root";

registerRoot(BizRoot);
