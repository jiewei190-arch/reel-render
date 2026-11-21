// LawRoot (src/index.law.ts): every built law3d recipe as <Pascal>Recipe (plain 30 fps; no motion-blur sub-frame
// composition: the owner renders the plain composition only), plus LawGallery (one shot per kit piece, for the review
// stills). Width and height come from the recipe's format layout (portrait 1080 x 1920, landscape 1920 x 1080).
import React from "react";
import { Composition } from "remotion";
import { compileLaw } from "./compile";
import type { LawCompiled } from "./compile";
import { LawFilm } from "./film";
import { GALLERY_RECIPE } from "./gallery";
import { LAW_RECIPES } from "./registry.gen";

const cache = new Map<string, LawCompiled>();
export const lawCompiled = (id: string) => {
  let c = cache.get(id);
  if (!c) {
    if (id === "LawGallery") c = compileLaw(GALLERY_RECIPE, [], GALLERY_RECIPE.duration);
    else {
      const r = LAW_RECIPES.find((x) => x.id === id);
      if (!r) throw new Error(`no law recipe ${id}`);
      c = compileLaw(r.recipe, r.words, r.vo);
    }
    cache.set(id, c);
  }
  return c;
};
const Film: React.FC<{ id: string }> = ({ id }) => <LawFilm c={lawCompiled(id)} />;

export const LawRoot: React.FC = () => (
  <>
    {["LawGallery", ...LAW_RECIPES.map((r) => r.id)].map((id) => {
      const c = lawCompiled(id);
      return <Composition key={id} id={id} component={Film} durationInFrames={c.duration} fps={30} width={c.layout.W} height={c.layout.H} defaultProps={{ id }} />;
    })}
  </>
);
