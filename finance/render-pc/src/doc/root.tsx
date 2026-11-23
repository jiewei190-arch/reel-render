// DocRoot (src/index.doc.ts): every built doc video as <Pascal>Doc (1920x1080, plain 30 fps; no motion-blur composition)
// plus DocGallery, one frame per scene type and theme (the review stills). Each video compiles its 3D kit sub-recipe with
// that kit's own compiler (law3d / biz3d / cyber3d), so the kits stay exactly as they are.
import React from "react";
import { Composition } from "remotion";
import { compileBiz } from "../biz/compile";
import { compileCyber } from "../cyber/compile";
import { compileLaw } from "../law/compile";
import { compileDoc } from "./compile";
import type { DocCompiled } from "./compile";
import { DocFilm } from "./film";
import type { Kit3D } from "./film";
import { DOC_VIDEOS } from "./registry.gen";

const cache = new Map<string, { c: DocCompiled; k3: Kit3D | null }>();
export const docCompiled = (id: string) => {
  let x = cache.get(id);
  if (!x) {
    const r = DOC_VIDEOS.find((v) => v.id === id);
    if (!r) throw new Error(`no doc video ${id}`);
    const c = compileDoc(r.doc, r.chapters, r.words, r.vo);
    let k3: Kit3D | null = null;
    if (c.kitRecipe) {
      const kr = c.kitRecipe as never;
      k3 = c.kit === "law3d" ? { kit: "law3d", c: compileLaw(kr, r.words, c.end) } : c.kit === "biz3d" ? { kit: "biz3d", c: compileBiz(kr, r.words, c.end) } : { kit: "cyber3d", c: compileCyber(kr, r.words, c.end) };
    }
    x = { c, k3 };
    cache.set(id, x);
  }
  return x;
};
/** `theme` (review stills only, tools/doc_stills.mjs --theme): the same video's 2D scenes in another channel's look;
 *  its scene3d windows are left out (the 3D shots belong to the video's own kit) */
const Film: React.FC<{ id: string; theme?: "law" | "biz" | "cyber" }> = ({ id, theme }) => {
  const x = docCompiled(id);
  const alt = React.useMemo(() => {
    if (!theme || theme === x.c.doc.theme) return null;
    const r = DOC_VIDEOS.find((v) => v.id === id)!;
    return compileDoc({ ...r.doc, theme }, r.chapters, r.words, r.vo);
  }, [id, theme, x]);
  return alt ? <DocFilm c={alt} k3={null} /> : <DocFilm c={x.c} k3={x.k3} />;
};

export const DocRoot: React.FC = () => (
  <>
    {DOC_VIDEOS.map((r) => {
      const x = docCompiled(r.id);
      return <Composition key={r.id} id={r.id} component={Film} durationInFrames={x.c.duration} fps={30} width={1920} height={1080} defaultProps={{ id: r.id } as { id: string; theme?: "law" | "biz" | "cyber" }} />;
    })}
  </>
);
