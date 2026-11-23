// DocFilm: renders a compiled doc video (1920x1080, plain 30 fps: no motion blur). A 2D scene draws src/doc/scenes.tsx;
// a scene3d window mounts the theme's own 3D kit film (law3d / biz3d / cyber3d, unchanged) on the kit sub-recipe, with
// the frame number kept absolute (nested Sequence), so the kit draws its set, cast, devices and its own lower-third
// captions exactly as in a kit video. Contiguous 3D windows share one mount (shaders compile once per run of 3D).
// On top: the cold-open hook, the chapter cards (one style, src/longform/kit.tsx ChapterCard "safe"), and the
// lower-third captions on 2D scenes (the same component and phrase chunking as the kits).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { useFonts } from "../engine/core/frame";
import { ChapterCard, LF, LowerThirdCaptions, chapterAt, chunkWords } from "../longform/kit";
import { BizFilm } from "../biz/film";
import type { BizCompiled } from "../biz/compile";
import { CyberFilm } from "../cyber/film";
import type { CyberCompiled } from "../cyber/compile";
import { LawFilmLandscape } from "../law/film";
import type { LawCompiled } from "../law/compile";
import type { DocCompiled } from "./compile";
import { FPS } from "./compile";
import { easeOut } from "./layout";
import { Scene2D } from "./scenes";

export type Kit3D = { kit: "law3d"; c: LawCompiled } | { kit: "biz3d"; c: BizCompiled } | { kit: "cyber3d"; c: CyberCompiled };
const KitFilm: React.FC<{ k: Kit3D }> = ({ k }) => (k.kit === "law3d" ? <LawFilmLandscape c={k.c} /> : k.kit === "biz3d" ? <BizFilm c={k.c} /> : <CyberFilm c={k.c} />);

/** the cold-open title: top centre, one accent word (the *starred* one), fades out at hookUntil */
const Hook: React.FC<{ c: DocCompiled; t: number }> = ({ c, t }) => {
  const u = Math.min(easeOut(t / 0.2 + 1), 1 - easeOut((t - c.hookUntil) / 0.3));
  if (t > c.hookUntil + 0.3) return null;
  const parts = c.doc.hook.text.split(/(\*[^*]+\*)/).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 70, textAlign: "center", opacity: u, fontFamily: "Poppins", fontWeight: 800, fontSize: 80, lineHeight: "92px", textTransform: "uppercase", color: "#ffffff", WebkitTextStroke: "8px #120c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.6)" }}>
      {parts.map((p, i) => <span key={i} style={{ color: p.startsWith("*") ? c.look.accent : "#ffffff" }}>{p.replace(/\*/g, "")}</span>)}
    </div>
  );
};

export const DocFilm: React.FC<{ c: DocCompiled; k3: Kit3D | null }> = ({ c, k3 }) => {
  const n = useCurrentFrame();
  useFonts();
  const t = n / FPS;
  const s = c.sceneAt(t);
  const chunks = React.useMemo(() => chunkWords(c.words, LF.CAP_WORDS), [c]);
  // contiguous 3D windows -> one mount each
  const runs = React.useMemo(() => {
    const out: [number, number][] = [];
    for (const [a, b] of c.windows) { const fa = Math.round(a * FPS), fb = Math.round(b * FPS); if (out.length && out[out.length - 1][1] === fa) out[out.length - 1][1] = fb; else out.push([fa, fb]); }
    return out;
  }, [c]);
  const L = s.type === "scene3d" ? null : c.layoutAt(s, t);
  const ch = chapterAt(c.chapters as never, t) as (typeof c.chapters)[number] | undefined;
  const capOn = s.type !== "scene3d" && s.spec.caption !== "off";
  return (
    <AbsoluteFill style={{ background: c.look.bg2 }}>
      {L ? <Scene2D s={s} L={L} look={c.look} t={t} /> : null}
      {k3 ? runs.map(([fa, fb]) => (
        <Sequence key={fa} from={fa} durationInFrames={fb - fa} layout="none">
          <Sequence from={-fa} layout="none"><KitFilm k={k3} /></Sequence>
        </Sequence>
      )) : null}
      <Hook c={c} t={t} />
      {ch ? <ChapterCard n={ch.n} title={ch.title} u={t - ch.card} accent={c.look.chapterTab} edge={c.look.chapterEdge} safe top={ch.top} fs={ch.fs} /> : null}
      {capOn ? <LowerThirdCaptions chunks={chunks} t={t} centre={LF.CAP_Y / LF.H} size={60} hot={c.look.hot} hide={(x) => x < 1.0} /> : null}
    </AbsoluteFill>
  );
};
