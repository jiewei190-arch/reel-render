// FORMAT v1 story Shorts: composition id -> spec + audio plan (Root.tsx and tools/story_cues.mjs read this)
import type { FinSpec } from "../core";
import type { Box, StoryAudio } from "./kit";
import { MINTRAP_AUDIO, MINTRAP_QA, MINTRAP_SPEC } from "./mintrap";

export const V1: { id: string; spec: FinSpec; audio: StoryAudio; qa: (t: number) => { actors: Box[]; props: Box[] } }[] = [
  { id: "MinimumPaymentTrapV1", spec: MINTRAP_SPEC, audio: MINTRAP_AUDIO, qa: MINTRAP_QA },
];
