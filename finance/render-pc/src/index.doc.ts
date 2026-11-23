// doc kit entry (documentary long-form, KIT_DOC.md): the doc compositions, registered apart from every other entry, so
// work here can never break the Block Money, tech3d or kit bundles (the 3D kits are imported read-only).
//   npx remotion still src/index.doc.ts <Pascal>Doc out.jpg --frame=N --gl=swangle
import { registerRoot } from "remotion";
import { DocRoot } from "./doc/root";

registerRoot(DocRoot);
