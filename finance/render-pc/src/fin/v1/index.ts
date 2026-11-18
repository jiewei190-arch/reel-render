// FORMAT v1 story Shorts: composition id -> spec + audio plan (Root.tsx and tools/story_cues.mjs read this)
import type { FinSpec } from "../core";
import type { StoryAudio } from "./kit";
import { MINTRAP_AUDIO, MINTRAP_SPEC } from "./mintrap";

export const V1: { id: string; spec: FinSpec; audio: StoryAudio }[] = [
  { id: "MinimumPaymentTrapV1", spec: MINTRAP_SPEC, audio: MINTRAP_AUDIO },
];
