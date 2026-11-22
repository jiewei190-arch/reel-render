// CyberRoot (src/index.cyber.ts): every built cyber3d recipe as <Pascal>Recipe (plain 30 fps, no motion-blur
// sub-frames), plus CyberGallery (one shot per kit piece, for the review stills). Width and height come from the
// recipe's layout (src/cyber/layout.ts): portrait 1080x1920 today, landscape 1920x1080 when a recipe asks for it.
import React from "react";
import { Composition } from "remotion";
import { compileCyber } from "./compile";
import type { CyberCompiled } from "./compile";
import { BrandRoot } from "./branding";
import { CyberFilm } from "./film";
import { GALLERY_RECIPE } from "./gallery";
import { CYBER_RECIPES } from "./registry.gen";

const cache = new Map<string, CyberCompiled>();
export const cyberCompiled = (id: string) => {
  let c = cache.get(id);
  if (!c) {
    if (id === "CyberGallery") c = compileCyber(GALLERY_RECIPE, [], GALLERY_RECIPE.duration);
    else {
      const r = CYBER_RECIPES.find((x) => x.id === id);
      if (!r) throw new Error(`no cyber recipe ${id}`);
      c = compileCyber(r.recipe, r.words, r.vo);
    }
    cache.set(id, c);
  }
  return c;
};
const Film: React.FC<{ id: string }> = ({ id }) => <CyberFilm c={cyberCompiled(id)} />;

export const CyberRoot: React.FC = () => (
  <>
    {["CyberGallery", ...CYBER_RECIPES.map((r) => r.id)].map((id) => {
      const c = cyberCompiled(id);
      return <Composition key={id} id={id} component={Film} durationInFrames={c.duration} fps={30} width={c.L.W} height={c.L.H} defaultProps={{ id }} />;
    })}
    <BrandRoot />
  </>
);
