// storytime entry (animated school storytime Shorts, KIT_STORYTIME.md): its own registry and root, apart from every
// other kit's entry, so work here can never break their bundles.
//   npx remotion render src/index.storytime.ts <CompId> out.mp4 --gl=swangle
import { registerRoot } from "remotion";
import { StoryRoot } from "./storytime/root";

registerRoot(StoryRoot);
