import React from "react";
import { Composition } from "remotion";
import { FinFilm } from "../core";
import { AssetGallery, GALLERY_FRAMES } from "../lib/gallery";
import { MINTRAP_SPEC } from "../v1/mintrap";

export const ToolkitRoot: React.FC = () => (
  <>
    <Composition id="MinimumPaymentTrapV1" component={() => <FinFilm spec={MINTRAP_SPEC} />} durationInFrames={MINTRAP_SPEC.duration} fps={30} width={1080} height={1920} />
    <Composition id="AssetGallery" component={AssetGallery} durationInFrames={GALLERY_FRAMES} fps={30} width={1080} height={1080} defaultProps={{}} />
  </>
);
