import React from "react";
import { Composition } from "remotion";
import { BLOCKY_FRAMES, BlockyTest } from "./blocky/BlockyTest";
import { SUB } from "./engine/core/frame";
import { FinShort } from "./fin/engine";
import { SHORTS, BY_SLUG } from "./shorts";

// props must be serializable: pass the slug, look the staging up inside
const ShortBySlug: React.FC<{ slug: string; sub: boolean }> = ({ slug, sub }) => <FinShort def={BY_SLUG[slug]} sub={sub} />;

// One pair per finance Short: <Comp> (30 fps, sharp: stills and look-dev) and <Comp>Sub (SUB x fps for motion blur;
// render.sh averages every SUB sub-frames). BlockyTest is the skill's smoke test.
export const Root: React.FC = () => (
  <>
    {SHORTS.map((d) => (
      <React.Fragment key={d.slug}>
        <Composition id={d.comp} component={ShortBySlug} durationInFrames={d.plan.DURATION} fps={30} width={1080} height={1920} defaultProps={{ slug: d.slug, sub: false }} />
        <Composition id={`${d.comp}Sub`} component={ShortBySlug} durationInFrames={d.plan.DURATION * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ slug: d.slug, sub: true }} />
      </React.Fragment>
    ))}
    <Composition id="BlockyTest" component={BlockyTest} durationInFrames={BLOCKY_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ sub: false }} />
    <Composition id="BlockyTestSub" component={BlockyTest} durationInFrames={BLOCKY_FRAMES * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ sub: true }} />
  </>
);
