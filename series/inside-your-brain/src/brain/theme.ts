// Inside Your Brain: shared look and layout rules for every episode.

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const INK = "#1d1630";
export const LINE = 7; // bold outline width used by every character and prop

export const CAST = {
  anxiety: { name: "ANXIETY", body: "#b98cff", shade: "#8a5ce6", accent: "#ff4d6d" },
  logic: { name: "LOGIC", body: "#7ec8e3", shade: "#4f9fc0", accent: "#e8505b" },
  confidence: { name: "CONFIDENCE", body: "#ffb547", shade: "#e8892a", accent: "#ffe066" },
} as const;

export type Who = keyof typeof CAST;

// Platform safe zones (TikTok / Reels / Shorts UI): keep key content out of these.
export const SAFE = {
  top: 250, // status bar + top tabs
  bottom: H - 480, // caption/description area starts here (y = 1440)
  rightX: 900, // like/comment/share column...
  rightFromY: 840, // ...from this height down
};
