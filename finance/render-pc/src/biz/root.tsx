// BizRoot (src/index.biz.ts): every built biz3d recipe as <Pascal>Recipe (sharp 30 fps; the kit has no motion-blur
// "Sub" composition by the owner's decision), plus BizGallery (one shot per kit piece, for the review stills).
// Width and height come from the recipe's layout (layout.ts): portrait 1080 x 1920, landscape 1920 x 1080.
import React from "react";
import { Composition } from "remotion";
import { BizBrandBanner, BizBrandPfp, BRAND } from "./brand";
import { compileBiz } from "./compile";
import type { BizCompiled } from "./compile";
import { BizFilm } from "./film";
import { GALLERY_RECIPE } from "./gallery";
import { BIZ_RECIPES } from "./registry.gen";

const cache = new Map<string, BizCompiled>();
export const bizCompiled = (id: string) => {
  let c = cache.get(id);
  if (!c) {
    if (id === "BizGallery") c = compileBiz(GALLERY_RECIPE, [], GALLERY_RECIPE.duration);
    else {
      const r = BIZ_RECIPES.find((x) => x.id === id);
      if (!r) throw new Error(`no biz recipe ${id}`);
      c = compileBiz(r.recipe, r.words, r.vo);
    }
    cache.set(id, c);
  }
  return c;
};
const Sharp: React.FC<{ id: string }> = ({ id }) => <BizFilm c={bizCompiled(id)} />;

export const BizRoot: React.FC = () => (
  <>
    {["BizGallery", ...BIZ_RECIPES.map((r) => r.id)].map((id) => {
      const c = bizCompiled(id);
      return <Composition key={id} id={id} component={Sharp} durationInFrames={c.duration} fps={30} width={c.layout.W} height={c.layout.H} defaultProps={{ id }} />;
    })}
    {/* channel branding stills (tools/biz_brand.mjs) */}
    <Composition id="BizBrandPfp" component={BizBrandPfp} durationInFrames={60} fps={30} width={BRAND.pfp.W} height={BRAND.pfp.H} />
    <Composition id="BizBrandBanner" component={BizBrandBanner} durationInFrames={60} fps={30} width={BRAND.banner.W} height={BRAND.banner.H} />
  </>
);
