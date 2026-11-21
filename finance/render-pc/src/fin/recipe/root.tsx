// The toolkit's compositions (src/index.toolkit.ts): every built recipe as <Pascal>Recipe (sharp, 30 fps) and
// <Pascal>RecipeSub (4 sub-frames for render.sh's motion blur; portrait Shorts only, never for landscape long-form), the CC0 asset gallery, and the hand-written
// minimum-payment-trap reference (for side-by-side comparisons).
import React from "react";
import { Composition } from "remotion";
import { SUB } from "../../engine/core/frame";
import { FinFilm } from "../core";
import { AssetGallery, GALLERY_FRAMES } from "../lib/gallery";
import { MINTRAP_SPEC } from "../v1/mintrap";
import { compileRecipe, RecipeFilm } from "./compile";
import type { Compiled } from "./compile";
import { GALLERY_RECIPE } from "./gallery";
import { RECIPES } from "./registry.gen";

const cache = new Map<string, Compiled>();
export const compiledOf = (id: string) => {
  let c = cache.get(id);
  if (!c) {
    const r = RECIPES.find((x) => x.id === id);
    if (!r) throw new Error(`no recipe ${id}`);
    c = compileRecipe(r.recipe, r.words, r.vo);
    cache.set(id, c);
  }
  return c;
};
const galleryC = () => { let c = cache.get("__gallery"); if (!c) { c = compileRecipe(GALLERY_RECIPE, [], GALLERY_RECIPE.duration); cache.set("__gallery", c); } return c; };
const PresetGallery: React.FC = () => <RecipeFilm c={galleryC()} />;
const plainOf = (id: string) => { const k = `${id}:plain`; let c = cache.get(k); if (!c) { const r = RECIPES.find((x) => x.id === id)!; c = compileRecipe({ ...r.recipe, quality: false }, r.words, r.vo); cache.set(k, c); } return c; };
/** the same recipe without the animation quality pass (side-by-side comparisons) */
const Plain: React.FC<{ id: string }> = ({ id }) => <RecipeFilm c={plainOf(id)} />;
const Sharp: React.FC<{ id: string }> = ({ id }) => <RecipeFilm c={compiledOf(id)} />;
const Blur: React.FC<{ id: string }> = ({ id }) => <RecipeFilm c={compiledOf(id)} sub />;
const Mintrap: React.FC = () => <FinFilm spec={MINTRAP_SPEC} />;

export const ToolkitRoot: React.FC = () => (
  <>
    <Composition id="MinimumPaymentTrapV1" component={Mintrap} durationInFrames={MINTRAP_SPEC.duration} fps={30} width={1080} height={1920} />
    <Composition id="AssetGallery" component={AssetGallery} durationInFrames={GALLERY_FRAMES} fps={30} width={1080} height={1080} defaultProps={{}} />
    <Composition id="PresetGallery" component={PresetGallery} durationInFrames={Math.round((GALLERY_RECIPE.duration ?? 1) * 30)} fps={30} width={1080} height={1920} />
    {RECIPES.map((r) => {
      const c = compiledOf(r.id);
      return (
        <React.Fragment key={r.id}>
          <Composition id={r.id} component={Sharp} durationInFrames={c.duration} fps={30} width={c.W} height={c.H} defaultProps={{ id: r.id }} />
          <Composition id={`${r.id}Plain`} component={Plain} durationInFrames={c.duration} fps={30} width={c.W} height={c.H} defaultProps={{ id: r.id }} />
          {/* OWNER: long-form (landscape) renders the plain 30 fps composition only: no motion-blur Sub composition */}
          {c.landscape ? null : <Composition id={`${r.id}Sub`} component={Blur} durationInFrames={c.duration * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ id: r.id }} />}
        </React.Fragment>
      );
    })}
  </>
);
