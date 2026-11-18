// FORMAT v1 story Shorts: composition id -> spec + audio plan (Root.tsx and tools/story_cues.mjs read this)
import type { FinSpec } from "../core";
import type { Box, StoryAudio } from "./kit";
import { MINTRAP_AUDIO, MINTRAP_QA, MINTRAP_SPEC } from "./mintrap";
import { SAMECAR_AUDIO, SAMECAR_QA, SAMECAR_SPEC } from "./samecar";
import { R72_AUDIO, R72_QA, R72_SPEC } from "./rule72count";
import { D1970_AUDIO, D1970_QA, D1970_SPEC } from "./dollar70talk";
import { PENNY2_AUDIO, PENNY2_QA, PENNY2_SPEC } from "./pennysplit";
import { SURPRISE_V1_AUDIO, SURPRISE_V1_QA, SURPRISE_V1_SPEC } from "./surprise";

export const V1: { id: string; spec: FinSpec; audio: StoryAudio; qa: (t: number) => { actors: Box[]; props: Box[] } }[] = [
  { id: "MinimumPaymentTrapV1", spec: MINTRAP_SPEC, audio: MINTRAP_AUDIO, qa: MINTRAP_QA },
  { id: "SameCarMoreV1", spec: SAMECAR_SPEC, audio: SAMECAR_AUDIO, qa: SAMECAR_QA },
  { id: "SurpriseBillV1", spec: SURPRISE_V1_SPEC, audio: SURPRISE_V1_AUDIO, qa: SURPRISE_V1_QA },
  { id: "PennyDoublesV1", spec: PENNY2_SPEC, audio: PENNY2_AUDIO, qa: PENNY2_QA },
  { id: "RuleOf72V1", spec: R72_SPEC, audio: R72_AUDIO, qa: R72_QA },
  { id: "Dollar1970V1", spec: D1970_SPEC, audio: D1970_AUDIO, qa: D1970_QA },
];
