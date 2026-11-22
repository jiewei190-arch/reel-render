// TechRoot (src/index.tech.ts): every built tech3d recipe as <Pascal>Recipe (sharp, 30 fps) and <Pascal>RecipeSub
// (4 sub-frames for render.sh's motion blur), plus TechGallery (one shot per kit piece, for the review stills).
import React from "react";
import { Composition } from "remotion";
import { SUB } from "../engine/core/frame";
import { compileTech } from "./compile";
import type { TechCompiled } from "./compile";
import { TechFilm } from "./film";
import { GALLERY_RECIPE } from "./gallery";
import { TECH_RECIPES } from "./registry.gen";

const cache = new Map<string, TechCompiled>();
export const techCompiled = (id: string) => {
  let c = cache.get(id);
  if (!c) {
    if (id === "TechGallery") c = compileTech(GALLERY_RECIPE, [], GALLERY_RECIPE.duration);
    else {
      const r = TECH_RECIPES.find((x) => x.id === id);
      if (!r) throw new Error(`no tech recipe ${id}`);
      c = compileTech(r.recipe, r.words, r.vo);
    }
    cache.set(id, c);
  }
  return c;
};
const Sharp: React.FC<{ id: string }> = ({ id }) => <TechFilm c={techCompiled(id)} />;
const Blur: React.FC<{ id: string }> = ({ id }) => <TechFilm c={techCompiled(id)} sub />;

export const TechRoot: React.FC = () => (
  <>
    <Composition id="TechGallery" component={Sharp} durationInFrames={techCompiled("TechGallery").duration} fps={30} width={1080} height={1920} defaultProps={{ id: "TechGallery" }} />
    {TECH_RECIPES.map((r) => {
      const c = techCompiled(r.id);
      return (
        <React.Fragment key={r.id}>
          <Composition id={r.id} component={Sharp} durationInFrames={c.duration} fps={30} width={1080} height={1920} defaultProps={{ id: r.id }} />
          <Composition id={`${r.id}Sub`} component={Blur} durationInFrames={c.duration * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ id: r.id }} />
        </React.Fragment>
      );
    })}
  </>
);
