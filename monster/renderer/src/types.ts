export type Theme = { bg: string; accent: string; text: string; muted: string; good: string; bad: string };

export type Scene = {
  id: string;
  type: string;         // one of the components in scenes.tsx; validated in Python before rendering
  start: number;        // frame
  end: number;          // frame (exclusive)
  params: Record<string, any>;
};

export type VideoProps = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  theme: Theme;
  title: string;
  scenes: Scene[];
};
