import React from "react";
import { Composition, Still } from "remotion";
import { Video, Thumbnail } from "./Video";
import type { VideoProps } from "./types";

// One composition renders any job: its size, fps and length come from the validated scene description (props.json).
const defaults: VideoProps = {
  width: 1080, height: 1920, fps: 30, durationInFrames: 150,
  theme: { bg: "#101A2B", accent: "#36B8E9", text: "#FFFFFF", muted: "#9FB3C8", good: "#3DDC97", bad: "#FF5A5F" },
  title: "Preview", scenes: [
    { id: "s1", type: "title", start: 0, end: 150, params: { kicker: "MONSTER", headline: "Renderer works" } },
  ],
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Main"
      component={Video}
      defaultProps={defaults}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={150}
      calculateMetadata={({ props }) => ({
        width: props.width, height: props.height, fps: props.fps, durationInFrames: props.durationInFrames,
      })}
    />
    <Still
      id="Thumb"
      component={Thumbnail}
      defaultProps={defaults}
      width={1080}
      height={1920}
      calculateMetadata={({ props }) => ({ width: props.width, height: props.height })}
    />
  </>
);
