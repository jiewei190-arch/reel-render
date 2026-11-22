# Monster YouTube Automator

## Research conclusion

The practical route is a small local production system that Claude can build, inspect and improve. It should have one coordinator, five channel profiles, a persistent job queue, local narration, code-driven visuals, a renderer, quality checks and an uploader. Five independent always-running agent sessions would add resource contention and make errors harder to trace.

The core should create original animations and explanations from reusable production components. A reusable camera move or chart component is useful; five interchangeable scripts with different nouns are not a strong editorial product. Expensive text-to-video generation is not required for this design.

Five daily Shorts are the easier initial throughput target. Five daily 3-8 minute videos are also a supported product goal, but their feasibility depends on writing quality, visual coverage and measured render times. This research does not establish a guaranteed render time, monetization outcome or monthly income.

## What was actually reviewed

| Evidence | Review method | Limit |
|---|---|---|
| Earlier niche-bending TikTok [S01] | Full captions and sampled frames | Creator earnings were not independently verified |
| Three new YouTube tutorials [S02-S04] | Full on-page transcripts and descriptions | Playback stalled; these were not fully watched |
| Public generator demo [S08] | Eight-second GIF, six sampled frames | Short visual sample, no audio or full application test |
| Four production/editing repositories [S05-S07, S09] | READMEs and selected implementation/config files | Not installed or benchmarked |
| Two video-analysis projects [S10-S11] | READMEs; license checked for S10 | Not installed or tested |
| Tool and platform references [S12-S30] | Official documentation, model cards and policy pages | Recheck at implementation time |

TikTok search required a login. A public creator profile loaded, but its video grid returned an error. YouTube transcripts were accessible, while playback stayed buffered and a direct download reached bot verification. No authentication bypass was attempted. Findings below distinguish source claims from direct observations and design recommendations.

## What the video research contributes

### Code-generated motion graphics

Pouya Eti's tutorial describes Claude writing animated graphics and Remotion rendering them locally. Around 4:07-5:46, it explains the local preview, output files and transparent overlays. Around 13:15-13:40, it explicitly discusses fixing cramped spacing, weak contrast and a malformed icon. [S03]

The useful lesson is to build a visual component library and inspect the result. This supports explainers, UI demonstrations, animated diagrams and reusable chart elements. The tutorial does not demonstrate unattended five-channel production, and its free-account claim should not substitute for current Claude access rules.

### Reusable 3D worlds and timed storyboards

Kreelux's Roblox workflow separates story beats, narration, word timings, rigs, staging, preview renders and shot repair. Around 6:03-6:48, it recommends starting with a limited preview, checking stills, and rerendering broken shots. Its voice step uses ElevenLabs, and its example is about two minutes, outside the requested Shorts range. [S04]

Borrow the production sequence and reusable-scene idea. Replace its voice dependency with local TTS, design original characters, and measure narration before animation. A fixed world can support distinct stories; each episode still needs its own conflict, action and payoff.

### Batch editing is useful; clip copying is not the business model

SmartBloom AI's tutorial describes combining downloaded opening clips with a transition and a product call to action. Its full transcript supports a narrow claim: FFmpeg can automate stitching and folder-based batching. It does not demonstrate original research-to-video production. [S02]

Use batch assembly and organized assets. Do not adopt the unsupported claim that credit plus a new ending automatically makes another creator's footage suitable for reuse. Research clips and licensed production assets should live in separate collections.

### Lessons from the earlier TikTok

The earlier video provides a framework for adapting a successful format to a different audience. It skips actual video production. Its displayed analytics and optimistic niche assessment do not establish repeatable earnings. Use it for hypotheses to test, rather than as the automator's revenue model. [S01]

## Repository assessment

| Project | Useful starting point | Required changes or limits |
|---|---|---|
| `snskr28/yt-autopilot` [S05] | Small Windows-oriented orchestration and local narration | One-channel assumptions; many Claude calls for a long video; outdated API notes |
| `Saggyishere/video-pipeline` [S06] | Windows queue, duration checks and explicit narrator selection | Normal default uses ElevenLabs; captions are estimated; no live research or uploader |
| `itsPremkumar/Automated-Video-Generator` [S07] | Existing CLI/MCP interfaces and segmented rendering | Disable remote fallbacks and optional cloud/posting services; validate output quality |
| `Melvynx/video-agent-skills` [S09] | Editing conventions, reusable studio setup and B-roll organization | Primarily edits supplied takes; several optional services exceed this project's cost constraint |

The inspected code in `yt-autopilot` uses native `claude -p`, saves work by stage and synthesizes scenes with Kokoro. Its documented cadence is not five long videos daily. Its source is a reference for a small coordinator, not evidence of the requested production capacity. [S05]

The larger generator's `.env.example` documents a local voice default that can fall back to Edge TTS, plus optional cloud and publishing providers. A strict local mode must explicitly refuse such fallbacks. Its MCP documentation also acknowledges that the interface lacks a hard duration parameter. [S07]

The public demo GIF was an important reality check: the inspected sample shows large unused areas of the portrait frame, very small captions and generic copy. Those are visual quality problems even if encoding checks pass. Its advertised quality-check count is a maintainer claim, not independent proof of a publishable result. [S08]

Recommendation: use a small coordinator modeled around clear saved stages. Evaluate the larger generator behind a renderer adapter if its actual previews meet the channel's standards. Do not merge several full projects before one end-to-end local pilot works.

## Recommended free local stack

| Function | Preferred component | Important condition |
|---|---|---|
| Builder and optional supervisor | Claude Code | Existing account access and limits still apply |
| Routine text tasks at zero inference fee | Local Ollama model | Use a local model, small bounded requests and validated JSON |
| Voice | Kokoro-82M, CPU first | Audition voices; keep model local; no remote fallback |
| Timing | WhisperX alignment | Validate names, numbers and missing word timings |
| Main visuals | Remotion with original graphics and SVG | Good scene design is still required |
| Original character scenes | Blender | Reusable original meshes, rigs, lighting and cameras |
| Assembly and audio | FFmpeg and ffprobe | Measure actual final duration and output properties |
| State and dashboard | Python, SQLite and a local web UI | Checkpoints, revisions and failures must be visible |
| Daily start | Windows Task Scheduler | PC must be on and available; jobs catch up after a missed run |
| Upload | Official YouTube Data API | Separate channel authorization and explicit release settings |

Kokoro's official card identifies an 82-million-parameter TTS model with Apache-licensed weights. WhisperX uses alignment for word timings and documents limitations for terms outside the alignment dictionary. Remotion's Free License currently covers individuals and qualifying teams of up to three, including automation. [S14, S16-S17]

The strict local text path can use Ollama schema-constrained responses. Disable its cloud features and do not select cloud-tagged models. Ollama also documents a Claude Code integration; running a local model through that interface does not turn it into the Claude model. Direct small API tasks are a better initial hardware fit than a large autonomous coding context. [S18-S20]

## Hardware and cost reality

The assumed PC is an RTX 4060 with 32 GB of system RAM. Confirm VRAM: the standard desktop 4060 has an 8 GB target for this design, but this session did not inspect the user's computer.

The official FLUX.2 klein 4B card advertises a standard configuration starting around 13 GB of VRAM. A third-party low-memory quantized runtime may work with less, but it needs a separate test. It should not be a mandatory dependency for five daily outputs. [S29]

Run one GPU-heavy process at a time. Start TTS on CPU. Unload local language or image models before demanding Blender renders. Use diagrams, screen demonstrations, licensed archives and reusable low-poly scenes as the main visual system. Treat diffusion as an optional enhancement.

No per-video generator fees does not mean zero total cost. Claude use, electricity, storage, internet and review time remain. Keep external paid providers disabled by configuration and by adapter validation. A failure should report the missing local capability rather than quietly switch providers.

Measure completed-video seconds per render minute for each visual family. If five long videos average five minutes each, the system must deliver 25 minutes of finished content daily. A claimed fast benchmark for an eight-second demo cannot establish that capacity.

## Five proposed channels

These are production-fit defaults, not verified profitable or unsaturated markets. Names are working labels and no channels were created.

| Profile | Audience and content | Local visual approach |
|---|---|---|
| Tool Lab | Practical software workflows for students and creators | Own screen demonstrations and animated UI explanations |
| Business Mechanics | How pricing, products and company operations work | Original charts, diagrams and licensed editorial material |
| Orbit Explained | Space questions and grounded thought experiments | Credited science imagery and accurate animated diagrams |
| History of Inventions | Inventions, historical problems and changing constraints | Verified archive images, maps and reconstructions labeled as such |
| Blockworld Stories | Original low-poly character stories | Reusable original 3D sets, characters, props and animation clips |

Each profile needs its own audience promise, writing rules, visual family, narrator audition and topic history. Sharing production code is sensible. Publishing the same script across five channels with a different voice is not the proposed product.

Start with a 40-55 second default and support long mode per profile. A planning estimate of 150 words per minute gives roughly 50-150 words for the requested Shorts range and 450-1,200 for long videos. Actual TTS duration decides the final cut; never truncate the final sentence to hit a timer.

## How the daily system should work

1. Read each channel profile and its backlog. Create at most one job for its local publication date and chosen format.
2. Gather evidence for the selected idea. Keep references, claim status and item-level media rights with the job.
3. Produce an outline, script and shot plan. Each visual must demonstrate or clarify the narration, rather than merely match a keyword.
4. Synthesize and measure narration. Repair pronunciation and content length before aligning words or rendering final scenes.
5. Align captions and scene cuts. Build visuals from original components, owned footage and approved media.
6. Render a preview, inspect it, and revise the failed scenes. Run technical and editorial checks independently.
7. Export the video, thumbnail, captions, metadata, credits and review report. Upload only when channel authorization and release settings are explicitly configured.
8. Record results and use channel-specific evidence to improve later ideas. A failed channel job must not stop the other four.

Keep a bounded backlog and an audit trail of mistakes and fixes. Useful memory entries name the defect, its cause, the change that fixed it, and the test that now catches it. A growing pile of vague advice is not a reliable learning system.

## Current platform details that change the implementation

YouTube's policy focuses on original, varied substance, including when templates or AI tools are involved. It also restricts AI personas presented as human experts giving advice on sensitive topics. The proposed business channel is about business mechanisms, not an automated financial-advice persona. [S21]

Assess realistic synthetic content using the current disclosure criteria. AI help with a script is not the same as generating realistic footage of an event. [S22]

Current upload documentation differs from older repositories: the November 2, 2026 changelog removes the unverified-project private-only rule. Always set privacy explicitly. Current default quotas list 100 daily search calls, 100 video uploads, and a separate 10,000-unit pool for other endpoints; verify the actual project's limits. [S23-S25]

At eight minutes, eligible monetized videos can use mid-rolls. Shorter long-form videos do not qualify for those breaks. Do not add filler to reach eight minutes; serve the story or explanation first. [S26]

## Content and media quality requirements

Every important factual claim needs a usable source or a clear uncertainty label. Original fictional stories need an explicit fiction classification. Every third-party asset needs its own source and permission record; being searchable or downloadable is not enough. Pexels and NASA both publish conditions, and NASA-hosted third-party material requires special attention. [S27-S28]

Technical checks should cover duration, dimensions, audio, missing frames, alignment and output files. Editorial review should check the promise, explanation, payoff, factual support and visual relevance. A high technical score cannot compensate for a weak script or illegible layout.

The initial launch should create drafts for review. After the system has demonstrated reliable outputs and the user enables a release policy, approved jobs can use the uploader. A failed quality check should create a visible exception, not force a bad upload to meet a daily counter.

## Recommended build sequence

1. Verify local tools and hardware; render a short animation and synthesize a voice sample.
2. Finish one original Short end to end, including measured timing, credits and visual review.
3. Produce one pilot in every niche and fix the component library.
4. Run five independent Shorts in one daily batch, with restart and failure-isolation tests.
5. Add 3-8 minute production and benchmark it on the actual PC.
6. Add channel-specific authorization, release settings and analytics only after output generation works.

The final requirement remains five daily channel slots. The sequence reduces implementation risk without redefining that target. The accompanying Claude prompt, schema, channel profiles and acceptance criteria make the next step concrete.

## Sources

The complete numbered bibliography and review methods are in `sources.json` and the appended source list in the PDF. All sources were reviewed on November 21, 2026. Repository capabilities are maintainer claims unless an inspected file or direct visual observation is named. No third-party application was executed, and no performance benchmark on the user's PC was available.
