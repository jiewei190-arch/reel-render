import React from "react";
import { Composition } from "remotion";
import { BLOCKY_FRAMES, BlockyTest } from "./blocky/BlockyTest";
import { SUB } from "./engine/core/frame";
import { FinFilm } from "./fin/core";
import type { FinSpec } from "./fin/core";
import { PENNY_SPEC } from "./fin/penny";
import { RULE72_SPEC } from "./fin/rule72";
import { SURPRISE_SPEC } from "./fin/surprise";
import { MATCH_SPEC } from "./fin/match";
import { DOUBLING_SPEC } from "./fin/doubling";

// <Slug> = sharp 30 fps (stills, look-dev); <Slug>Sub = SUB x fps for motion blur (render.sh averages SUB sub-frames).
const FIN: [string, FinSpec][] = [["PennyDoubles", PENNY_SPEC], ["RuleOf72", RULE72_SPEC], ["SurpriseBill", SURPRISE_SPEC], ["EmployerMatch", MATCH_SPEC], ["PricesDouble", DOUBLING_SPEC]];
// props must be JSON (Remotion serialises them): pass the id, look the spec up here
const SPECS: Record<string, FinSpec> = Object.fromEntries(FIN);
const Sharp: React.FC<{ id: string }> = ({ id }) => <FinFilm spec={SPECS[id]} />;
const Blur: React.FC<{ id: string }> = ({ id }) => <FinFilm spec={SPECS[id]} sub />;

export const Root: React.FC = () => (
  <>
    <Composition id="BlockyTest" component={BlockyTest} durationInFrames={BLOCKY_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ sub: false }} />
    <Composition id="BlockyTestSub" component={BlockyTest} durationInFrames={BLOCKY_FRAMES * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ sub: true }} />
    {FIN.map(([id, spec]) => (
      <React.Fragment key={id}>
        <Composition id={id} component={Sharp} durationInFrames={spec.duration} fps={30} width={1080} height={1920} defaultProps={{ id }} />
        <Composition id={`${id}Sub`} component={Blur} durationInFrames={spec.duration * SUB} fps={30 * SUB} width={1080} height={1920} defaultProps={{ id }} />
      </React.Fragment>
    ))}
  </>
);
