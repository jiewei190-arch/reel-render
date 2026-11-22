# Monster YouTube Automator: research and Claude build pack

Prepared for Jie Wei on November 21, 2026.

This is a researched implementation brief, not the finished automator. No channels have been connected and no daily publishing has been enabled. Give this folder to Claude Code on your Windows PC to build and test the application.

## Intended result

- Five separate channels, each with a different editorial niche and identity.
- One video per channel per day: five total daily videos.
- Each daily slot is either a 20-60 second Short or a 3-8 minute landscape video. Producing both is an optional increase, not the default requirement.
- No paid video, image or voice generators, no metered cloud inference fallback, and no paid publishing service.
- A local dashboard for production progress, previews, failures, revisions and release decisions.

## Start with these files

1. Read `RESEARCH_REPORT.md` for the evidence and recommended approach.
2. Paste `CLAUDE_BUILD_PROMPT.md` into Claude Code, with this folder available in its workspace.
3. Use `TECHNICAL_SPEC.md` and `ACCEPTANCE_CRITERIA.md` as the implementation contract.
4. Edit the five proposed profiles in `config/channel_profiles.json`. They are production-fit suggestions, not validated low-competition niches or actual channel names.
5. Keep `sources.json` with the project so claims about tools and platform behavior can be rechecked.

The JSON schema and fixture describe the desired job format. The fixture is deliberately non-publishable and is not a finished video script. No commands for an app named `monster` exist yet; Claude must implement the proposed command surface.

## Cost distinction

Claude is the builder and an optional editorial supervisor. Its use still depends on your account, plan and usage limits. The strict zero-additional-inference mode uses a local Ollama model for routine text tasks; that model is not Claude. Narration, graphics, captions and rendering stay local. Electricity, storage, internet and your review time remain real costs.

## Evidence limitations

Three new YouTube tutorial transcripts were read in full. Playback stalled and a direct download encountered bot verification; they are not labeled fully watched. TikTok search required sign-in, and a public creator profile failed to load its video grid. The earlier TikTok in this conversation was reviewed using its full captions and sampled frames. A public eight-second pipeline demo GIF was inspected directly. Selected repository files were read; third-party applications were not installed or benchmarked.

The hardware target comes from your earlier RTX 4060 / 32 GB RAM setup. Confirm actual VRAM, free disk, driver versions and available Claude access during implementation. Daily throughput remains a benchmark target until tested on that PC.
