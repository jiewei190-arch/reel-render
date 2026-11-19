// Toolkit entry (finance/toolkit): the recipe compositions, the CC0 asset gallery and the mintrap reference, without the
// shared Root.tsx (so a builder's work-in-progress Short can never block a recipe render). Use it with
//   npx remotion still src/index.toolkit.ts <CompId> out.jpg --frame=N
// Root.tsx / src/index.ts are unchanged.
import { registerRoot } from "remotion";
import { ToolkitRoot } from "./fin/recipe/root";

registerRoot(ToolkitRoot);
