// StoryRoot (src/index.storytime.ts): every built storytime recipe as <Pascal>Recipe (1080 x 1920, plain 30 fps, no
// motion-blur sub-frames), plus StoryGallery (the cast's expressions, for review stills).
import React from "react";
import { Composition } from "remotion";
import { compileStory } from "./compile";
import type { Compiled } from "./compile";
import { StoryFilm } from "./film";
import { GALLERY } from "./gallery";
import { STORY_RECIPES } from "./registry.gen";

const cache = new Map<string, Compiled>();
export const storyCompiled = (id: string) => {
  let c = cache.get(id);
  if (!c) {
    if (id === "StoryGallery") c = compileStory(GALLERY.recipe, GALLERY.words, GALLERY.duration);
    else {
      const r = STORY_RECIPES.find((x) => x.id === id);
      if (!r) throw new Error(`no storytime recipe ${id}`);
      c = compileStory(r.recipe, r.words, r.vo, r.amp);
    }
    cache.set(id, c);
  }
  return c;
};
const Film: React.FC<{ id: string }> = ({ id }) => <StoryFilm c={storyCompiled(id)} />;

export const StoryRoot: React.FC = () => (
  <>
    {["StoryGallery", ...STORY_RECIPES.map((r) => r.id)].map((id) => {
      const c = storyCompiled(id);
      return <Composition key={id} id={id} component={Film} durationInFrames={c.duration} fps={30} width={c.layout.W} height={c.layout.H} defaultProps={{ id }} />;
    })}
  </>
);
