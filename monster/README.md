# Monster YouTube Automator

A local production system for five YouTube channels: one original video per channel per day (a 20-60 s Short or a
3-8 min landscape video per slot). Free local tools only: no paid or remote voice, image, video or inference
providers, and no silent fallback to one. Built from the brief in `docs/build_pack/`.

**What runs where**
- **Text work** (pick facts, write narration, plan visuals, editorial review): a **local Ollama model**. This is not
  Claude. Optionally, your own Claude Code CLI (`MYA_LLM=claude_cli`), under your account's limits. If either is
  unavailable, the job is deferred, never switched to a billed API.
- **Voice:** Kokoro-82M on CPU, with word timings from Kokoro itself. If it fails, the job stops.
- **Visuals:** an original Remotion scene library (`renderer/src/scenes.tsx`): counters, comparisons, bars, timelines,
  steps, cause-and-effect, record/headline/email cards, verdict stamps, code, two original block characters, and
  credited photos. The model fills validated JSON params and never writes code.
- **Assembly:** FFmpeg (two-pass loudness to about -14 LUFS, ASS captions burned into Shorts, SRT sidecar).
- **State:** SQLite (`data/mya.db`) plus one folder per job (`data/jobs/<job>/`) with every artifact and `review.html`.

## Setup (Windows, RTX 4060 PC)
```
powershell -ExecutionPolicy Bypass -File setup_windows.ps1
```
Then set `runtime.ollama_model` in `config/channel_profiles.json` (doctor recommends one from the measured VRAM)
and run:
```
.\.venv\Scripts\python -m mya doctor
.\.venv\Scripts\python -m pytest -q tests
```
Optional daily schedule: `powershell -File schedule_windows.ps1` (06:30, catches up a missed day once).

## Commands
| command | what it does |
|---|---|
| `doctor` | real GPU/VRAM, RAM, disk, Python/Node/FFmpeg, libass, fonts, Kokoro, Ollama models, what's missing |
| `audition --channel KEY` | speaks a test line in each candidate voice, to pick by ear |
| `plan --channel KEY --format short\|long [--topic T]` | research -> claim ledger -> script, then stops for review |
| `produce --job ID` | the remaining stages -> `final.mp4` + review page; reuses everything still valid |
| `revise --job ID --scene sc03 --narration "..." \| --type stamp --params '{...}'` | rebuilds only what that change affects |
| `daily [--date D] [--catchup] [--format law=long]` | fills the five slots once (lock + unique slots) and produces them; one failure never stops the rest |
| `review` | local dashboard at http://127.0.0.1:8765 (five channel columns, review pages, revision requests) |
| `release --job ID` | YouTube upload, only with an enabled policy, an authorization record and a verified channel id |
| `stats --channel KEY` | real performance only (Studio CSV pulls; YouTube Analytics once authorized) |
| `lessons add\|list` | symptom / cause / fix / regression check / evidence |

## Pipeline (each stage is saved with an input hash; restarts reuse valid work)
`research -> claims -> draft -> script -> assets -> storyboard -> voice -> align -> preview -> master -> qc`

- **Claims:** the model only *selects* sentences from the fetched sources (Wikipedia API, with revision ids). Each
  claim is the source sentence verbatim. The script must cite claim ids, and any number it says or shows that its
  cited passages don't contain is rejected.
- **Voice:** spoken text is normalized separately from display text ("$54 million" -> "fifty-four million dollars";
  per-channel pronunciations like "v." -> "versus"). If the measured narration is outside the format's range, the
  script is rewritten (bounded); nothing is clipped or padded.
- **Master:** one cached segment per scene, so a one-scene revision re-renders one segment.
- **QC:** duration bounds (one-frame rounding is reported explicitly), dimensions, codec, audio, full decode,
  black/silence detection, loudness, caption coverage, independent faster-whisper speech check, and a separate
  editorial verdict. Release eligibility also needs verified claims and known rights for every asset.

## Release
Off by default (`runtime.upload_enabled=false`, every channel's `release_policy.enabled=false`). To enable a channel:
1. Create an OAuth client in your own Google Cloud project with the YouTube Data API enabled.
2. Put `config/auth/<channel>.json` (`client_id`, `client_secret`, `refresh_token`) on the PC. It is git-ignored.
3. Set that channel's `channel_id`, `release_policy` (privacy is always explicit; the default is private) and
   `runtime.upload_enabled`.

Before uploading, the adapter verifies that the authorized channel's real id matches. A timeout after the server may
have accepted the file sets `upload_unknown`; the next attempt reconciles with the resumable session instead of
uploading again.

## Schedule (owner, Nov 22 2026)
| channel | Shorts | long videos (8-12 min) |
|---|---|---|
| Block Money | 2/day at 12:00 and 19:00 ET | none |
| Justin clips | 2/day at 12:00 and 19:00 ET | none |
| Law, Business, Scams & Hacks | 1/day at 17:00 ET | 2/week: Tue and Fri at 15:00 ET |

That's 7 uploads a day, 10 on Tuesdays and Fridays. Each channel's `schedule.slots` in `config/channel_profiles.json`
defines this. A slot with `weekdays` runs only on those days. `daily` creates exactly one job per slot (the key is
channel + date + slot number), and `--format law=long` or `--format law#0=long` switches a slot's format without
adding an upload. Every channel is produced by reelbot (3D engines, ElevenLabs voices). The automator hands each job
off with the exact command (with `--long` for long slots), then tracks and checks it. **Running reelbot automatically:** set `runtime.run_handoffs` to `true` (and optionally `runtime.reelbot_python`,
default `bot/.venv`). `daily` then runs `python -m reelbot make "<topic>" --channel X --auto [--long]` for each slot,
records the video path and the cost line in the job's `handoff.json`/`handoff.log`, and marks the job
`ready_for_review` (or `blocked` with the error). This spends API and ElevenLabs credits, so it is off by default.
Topic backlog:
`config/backlog.json`; it needs about 7-10 topics a day across channels, so refill it with
`python -m reelbot bend/ideas --channel X` or the owner's own lists.

## Channels
`config/channel_profiles.json`: Block Money, Justin clips, Law, Business, Scams & Hacks. Each has its own audience,
promise, voice, theme, scene family, disclaimers and publish time. The build pack's sample profiles are in
`config/channel_profiles.pack_defaults.json`. Topic backlog: `config/backlog.json`.

See `REPORT.md` for what has been tested, measured and what is still blocked.
