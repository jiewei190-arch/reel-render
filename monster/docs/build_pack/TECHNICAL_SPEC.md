# Technical implementation specification

Status: requirements for an application Claude must build. The commands and modules below are proposed interfaces, not a claim that an executable already exists.

## 1. Scope and operating modes

Build for Windows first, using the actual RTX 4060 / 32 GB machine as the eventual benchmark host. Support five profiles and one daily output slot per profile. A slot chooses `short` or `long`; it does not automatically create both. Profiles and publication times must remain editable.

Mode A, the default production mode: Claude builds the app, while a local Ollama model performs routine structured text tasks. Inference, narration and rendering have no provider usage fee. Internet access remains available for approved research and media APIs; this is local inference, not a promise that all research works offline.

Mode B, optional: the user's native Claude Code installation supplies planning and writing using the user's own authorized account access. Report usage limitations and defer work when exhausted. Do not put consumer session credentials inside the app or expose account access as a service. Never silently switch to a metered API. [S12-S13]

Paid image, voice and video providers are excluded in both modes. Keep the local Ollama endpoint explicit. In strict local mode, disable cloud features and reject cloud model identifiers. [S20]

## 2. Module boundaries

| Module | Responsibility | Saved artifact |
|---|---|---|
| Profiles | Audience, identity, voice and format rules | Versioned channel configuration |
| Research | Watchlists, sources and competitor observations | `research.json` |
| Claims | Evidence, dates, calculations and uncertainties | `claims.json` |
| Editorial | Idea, outline, narration, promise and payoff | `script.json` |
| Storyboard | Per-scene purpose, camera/graphic and intended timing | `storyboard.json` |
| Assets | Owned or licensed media and attribution | `assets.json` |
| Voice | Local scene narration and pronunciations | WAV files and `voice.json` |
| Alignment | Spoken-word timing linked to display text | `words.json`, SRT and ASS |
| Renderer | Frames, scene segments, preview and master | Preview and final MP4 |
| Quality | Technical checks and editorial findings | `qc.json` and contact sheets |
| Release | Per-channel authorization and delivery | `upload.json` |
| Learning | Defects, accepted fixes and measured results | `lessons.jsonl`, analytics tables |

Use a stable job contract between modules. Expose adapters for rendering and text generation so one implementation can be replaced without rewriting the scheduler or channel history. JSON schema validation is mandatory at boundaries; valid JSON alone does not establish factual correctness.

## 3. Persistence and scheduling

Use SQLite for jobs, stage attempts, channel histories, claims, assets, release decisions and remote IDs. Store large media as files referenced by checksum and relative path.

- A unique slot key is `(channel_key, local_publish_date, format_kind)`. Validate the allowed daily total separately so switching formats does not accidentally create a sixth daily job.
- Resolve schedules in `America/New_York`, including daylight-saving changes. Store event timestamps in UTC as well as the intended local date.
- Use a single scheduler lock and stage leases. An expired worker lease can be reclaimed after verifying whether its artifact completed.
- A stage result is reusable only when its input hash, configuration version, model/tool versions and output checks match. Mark dependent stages stale after a script, voice or scene change.
- Write outputs to a temporary path, validate them, then atomically promote them. A half-written WAV or MP4 is not a completed stage.
- A missed run catches up once, within an explicit backlog policy. It must not flood the queue after a week offline.
- Keep failures isolated by channel/job. Transient fetch failures get bounded retries with backoff; deterministic failures require a revision or visible intervention.

Proposed states: `queued`, `researching`, `writing`, `script_review`, `voicing`, `aligning`, `building_visuals`, `preview_ready`, `revision_needed`, `rendering`, `qc_failed`, `ready_for_release`, `uploading`, `upload_unknown`, `scheduled`, `published`, `blocked`, `cancelled`.

The daily production goal does not override a failed quality check. Report which slot is missing and why.

## 4. Research and writing

Build a channel-specific backlog before scheduling. Ideas must have a concrete audience question and an achievable visual plan. Record an originality note describing what this video adds.

Use dated primary references for factual claims. Store the source URL, publisher, observation date, supporting passage or data, and claim status. Keep estimates, hypotheticals and established observations distinct. Run numerical calculations deterministically and save the inputs. Do not treat another AI response as the underlying evidence.

Research video analysis should prefer public captions, then local transcription; pair the words with scene-aware frames and inspect dense screens. Keep downloads used for analysis separate from production assets. The candidate `/watch` projects are references to test, not installed dependencies of this pack. A public video being accessible does not establish permission to republish it. [S10-S11]

Keep the prompt context small: profile brief, relevant recent history, evidence for the selected topic and the current stage. Do not resend entire transcripts and years of history for every scene. Cache source extraction. Limit revisions per stage and explain the cause of a rewrite.

All scripts need a specific opening, logical progression and a satisfying answer or payoff. Avoid generic promises, repeated introductions and unsupported earnings claims. Do not copy a competitor's plot, narration or illustrations. An original fictional channel can reuse its world while giving each episode distinct events.

## 5. Narration, duration and captions

Use local Kokoro with a verified model and voice inventory. Initial profiles specify candidate voices; audition pronunciation, clarity and delivery before locking them. Keep display text separate from normalized spoken text for dates, currencies, abbreviations and unfamiliar names.

Estimate length from a measured words-per-minute sample. Synthesize and measure actual audio before final scene timing. Revise content when substantially too long or short. Allow only modest, documented tempo correction for a near fit. Never cut a spoken word or pad a weak script with empty time.

- Shorts: final target 20-60 seconds, 1080 x 1920.
- Long videos: final target 180-480 seconds, 1920 x 1080.
- Default frame rate: 30 fps, with per-profile overrides only after testing.
- Validate media duration after the final encode; account for at most one frame of container rounding in diagnostics.

Align the canonical spoken text to the audio. WhisperX is a candidate; do not mistake estimated word proportions or basic ASR timestamps for verified alignment. Handle unaligned names and numbers explicitly, using a spoken-to-display mapping. Avoid diarization unless a real multivoice requirement justifies the added models. [S16]

Captions should generally use short phrases, at most two lines, with contrast and readable phone-size previews. Burn a tested ASS style into Shorts and export an SRT sidecar. Keep labels clear of UI overlays using per-platform tested margins. Recompute alignment and scenes whenever narration changes. Do not feed another provider's emotion markup to Kokoro as spoken text.

## 6. Visual production

Implement a small original Remotion component library: animated comparisons, counters, timelines, maps, labeled diagrams, code walkthroughs, UI demonstrations and cause-and-effect simulations. Render components from a validated scene description, rather than allowing an LLM to inject arbitrary executable code into every job.

For stories, use original Blender characters, a small set library, reusable actions, expression controls and camera presets. Start with simple readable staging. Preserve scene scripts and seeds so a shot can be recreated. A 3D character branch is supported, but it must not block the first working diagram-based pipeline.

Downloaded assets must carry item-level source and rights metadata, dimensions, duration, checksum and intended use. Accept owned assets, appropriate public-domain/CC0 content, and permitted licensed material with its conditions. Reject unknown rights and noncommercial-only material for a monetized workflow. Verify archive credits rather than treating an entire host as one blanket license.

Select visuals semantically and by shape. Prefer useful original graphics to unrelated stock. Do not accept a landscape image sitting in a mostly empty portrait frame as the default layout. If visual coverage is inadequate, revise the scene or mark the job blocked rather than fill it with generic title cards.

Local diffusion is optional and off by default. A selected model's actual license, runtime and measured VRAM requirement must be recorded before enabling it. The official FLUX standard setup is not an assumed 8 GB fit. [S29]

## 7. Rendering and resource control

One global GPU lease should cover large local-model calls, optional image generation, GPU alignment and demanding Blender renders. Release models between stages. Start with one CPU render worker and adjust only after profiling memory and throughput.

Use FFmpeg for scene assembly, final encoding, mixes and audio analysis. Target H.264, AAC and broadly compatible pixel formats. Hardware encoding is optional: detect an actual working encoder and retain a tested software path. Availability in an encoder list does not prove that the host has a usable GPU.

For each profile, benchmark a short representative job and a three-minute representative job. Record warm/cold cache time, render wall time, peak RAM/VRAM, output size, retry count and review findings. Extrapolations must be labeled, then replaced with measured five-job batches.

Audio targets are internal production choices, not YouTube requirements: a clear narration-led mix around -16 to -14 integrated LUFS and a true-peak ceiling around -1.5 dBTP are reasonable starting points. Use measured two-pass loudness normalization and verify the final mix. [S30]

Render previews first. Inspect starts, middles, ends and transitions of every shot. Rebuild failed shots from their causes; avoid destructive frame edits that leave the underlying scene broken.

## 8. Quality model

Technical checks cover format bounds, dimensions, codec, audio presence, silence/black-frame anomalies, missing media, caption coverage, timing, fonts, clipping and frame integrity. Allow intentional holds or fades only when explicitly represented in the storyboard.

Editorial review covers evidence, the opening promise, explanation, visual relevance, originality and payoff. Its verdict is separate from technical success. Missing support for an important fact, broken spoken text or a misleading title cannot be averaged away by a good color score.

Render an HTML review page per job with preview, script, claims, scene stills, rights, findings and revision history. Show five distinct channel columns in the dashboard. Enable per-scene notes and regenerations. Keep the initial output in review; publishing automation becomes an explicit user-configured release policy after successful pilots.

Substance must vary across the five channels and within each series. Cosmetic rotation alone does not address YouTube's originality standards. [S21]

## 9. Uploads and analytics

Implement the official YouTube API adapter after local production works. Store a separate OAuth credential record for each authorized channel and verify its real channel ID before upload. Do not use a public `channelId` input as if it selected the destination account; normal uploads follow the authorized channel.

Always set privacy explicitly. Default to private review in this product, independent of platform defaults. Set audience and realistic-synthetic-content disclosures from actual video attributes. Current Google documentation no longer imposes the older blanket private-only restriction for unverified projects. Read actual project quotas instead of hardcoding historical upload costs. [S23-S25]

Persist the returned video ID and resumable-upload session information. If a request times out after the server may have accepted it, mark `upload_unknown` and reconcile before retrying; do not claim an exactly-once remote API guarantee. A retry must not create duplicate uploads or change channels.

Use long-video impressions/CTR and viewing behavior where available; for Shorts, use their relevant engaged viewing and viewed/swiped metrics. Keep formats and channels separate. Analyze after enough observations; avoid rewriting a channel strategy from one early outlier. Never fabricate unavailable analytics.

## 10. Retention, reproducibility and learning

Keep final videos, metadata, sources, rights, tool versions, prompts and hashes together. Use bounded caches and a declared retention setting. Temporary render frames may be cleaned only after final output validation. Keep a disk-space reserve and stop cleanly when it is breached.

For every accepted repair, record `symptom`, `root_cause`, `fix`, `affected_stage`, `regression_check` and `evidence`. Retrieve relevant lessons when planning the next job. An untested proposed fix must not become a proven rule. Preserve failed previews long enough to compare improvements.

## 11. Proposed CLI and dashboard

Claude must implement equivalent commands; these are not working commands in this pack:

- `doctor`: tools, versions, model availability, VRAM, disk, encoder and font checks.
- `plan --channel KEY --format short|long`: create one sourced draft job.
- `produce --job ID`: run local stages and stop at review-ready output.
- `revise --job ID --scene ID`: invalidate and rebuild only affected work.
- `daily --date YYYY-MM-DD`: fill the five intended slots once.
- `review`: open the local review dashboard.
- `release --job ID`: use configured channel authorization and release policy.
- `stats --channel KEY`: read real performance for that channel.

The dashboard should make progress, exceptions and missing configuration understandable without forcing the user to read logs. Provider and implementation details belong in diagnostics, while release decisions show the actual video and its material findings.
