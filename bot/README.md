# reelbot: one command from topic to finished Block Money Short

```
Studio metrics ──► learn: rank our Shorts by stayed-to-watch % ──► work/learnings.md (steers everything below)
topic ──► Gemini (Google-Search-grounded research)
      ──► HOOK FACTORY: Claude writes 6 openings, Claude + Gemini score them blind against our data, best one wins
      ──► Claude Opus 5.5 writes the script around the winning opening (hook, Spender vs Saver, claims + sources)
      ──► Gemini fact-checks every claim ──► Claude fixes anything that failed (up to 2 rounds)
      ──► ElevenLabs voices it line by line with EMOTION (audio tags like [shocked] [whispers] [sarcastic] [excited]
            written per line by Claude; tags are performed, not spoken), with word timings (Tyler / Christopher)
      ──► Claude writes the shot recipe ──► the engine's own checker (clip QA + frame-0 gate)
            └─ errors go back to Claude until it passes (up to 5 attempts)
      ──► GPU render on the PC (render.sh, motion blur)
      ──► SOUND DESIGN: Claude plans 8-14 custom sound effects on key words/moments, ElevenLabs generates each one
            (cached, so a repeat sound is free) ──► music + stock + custom SFX mix ──► -14 LUFS
      ──► AI EDITORS: Gemini watches the whole video, Claude checks 30+ stills ──► timestamped problems + fixes
            └─ any blocker/major issue or a weak hook: Claude fixes the shots, engine re-checks, GPU re-renders (2 rounds)
      ──► QA (loudness, Whisper) ──► Videos\BlockMoney\<slug>\video.mp4 + UPLOAD.md + sources.md + EDIT_REPORT.md
```

**Nothing is ever uploaded.** The bot stops at a finished, checked video plus its title/description file.
Posting stays with the owner / Creator and the channel rules.

## Setup on the PC (once)

1. Python 3.11+, Node 22+, ffmpeg and Git Bash on PATH (all already on the render PC).
2. In this folder:
   ```
   pip install -r requirements.txt
   pip install faster-whisper        # optional, for the Whisper QA step
   ```
3. Copy `.env.example` to `.env` and paste your keys **into that file yourself**: `GEMINI_API_KEY`
   (aistudio.google.com) and `ELEVENLABS_API_KEY`. `.env` is git-ignored. Never paste keys into a chat.
   **Claude needs no key:** by default reelbot runs the Claude Code CLI that is already logged in on this PC, so Claude
   work counts against your Claude subscription's plan limits instead of API billing (any `ANTHROPIC_API_KEY` is removed
   from the CLI's environment so it can't switch to API billing by accident). Heavy batches can hit the plan limit,
   which also slows other Claude sessions on the same account; reelbot waits and retries. To use the paid API instead,
   set `REELBOT_CLAUDE_BACKEND=api` and `ANTHROPIC_API_KEY`. Personal use on your own PC only.
4. Point it at the renderer if it is not in the default place:
   `REELBOT_RENDER_ROOT=C:\Users\jiewe\blocky-render`, and `REELBOT_AUDIO_DIR` at the folder with `music\` and `sfx\`.

## Use

Run from this `bot` folder:

| Command | What it does |
|---|---|
| `python -m reelbot learn` | rank our live Shorts by retention (from Creator's Studio pulls) into `work/learnings.md` |
| `python -m reelbot ideas --n 10` | 10 fresh, timely topic ideas with hooks |
| `python -m reelbot make "why minimum payments trap you"` | research + script + fact-check, then **stops** so you can read the script |
| `python -m reelbot continue <slug>` | voice + scenes + GPU render + QA |
| `python -m reelbot make "..." --auto` | the whole thing, no stop |
| `python -m reelbot batch topics.txt` | one topic per line, each run straight through; a failure skips to the next |
| `python -m reelbot voice <slug>` / `recipe <slug>` / `render <slug>` | redo one stage |
| `python -m reelbot review <slug>` | run the AI editors on the finished video (and fix + re-render if needed) |

Options: `--voice Tyler|Christopher|auto` (auto alternates), `--seconds 45`, `--style S1..S6`, `--notes "..."`, `--redo`,
`--edit-rounds 2` (AI editor fix-and-re-render rounds; -1 = skip the review), `--hooks 6` (how many openings to write and score; 0 = off), `--no-learn` (skip refreshing learnings first).

## Voice emotion and sound design

- **Voice director** (`tone.py`): before voicing, Claude labels every line's mood and sets its audio tags. Most lines
  get none (a plain, confident read); only the 3-5 real emotional beats (hook, twist, big number, loss, payoff) get one
  tag. Sad/serious lines never get excited, laughing or playful tags. Neutral lines are forced plain, max 1 tag per line,
  and the words can never change.
- **Per-mood voice settings**: steady settings on plain lines, more expressive ones on emotional beats, so the big
  moments stand out (`MOOD_SETTINGS` in `voice.py`). `REELBOT_VOICE_STABILITY`/`REELBOT_VOICE_STYLE` override all lines.
- **Listen-back**: Gemini listens to every take: right emotion for the moment, every word and number clear, natural
  sounding (no glitches, odd pauses, over-acting, or a tag read out loud). A failed take is re-recorded and the best
  take wins, up to `REELBOT_VOICE_RETAKES` (default 4) retakes per Short. Results in `vo/voice_check.json`.
  Off: `REELBOT_VOICE_CHECK=0`.
- Captions and timings always use the clean lines; if tagged lines ever don't match the script word for word, the
  plain lines are used.
- Sound design adds custom effects to the engine's cue file before the mix (`sound_design.json` in the Short's folder
  lists them). Generated files go to `<REELBOT_AUDIO_DIR>/sfx/gen_*.wav`. Turn it off with `REELBOT_SOUND_DESIGN=0`.

## Cloud rendering (AWS Lambda)

`--on lambda` (or `REELBOT_RENDER_ON=lambda`) renders the same composition on Remotion Lambda, split across many
cloud machines at once, so several videos render in parallel instead of one after another on the PC. One-time setup:
`aws/SETUP.md`, then `python -m reelbot lambda setup`. The output matches the PC render, so mixing,
QA and the AI editors are unchanged.

Motion blur is **off by default** everywhere (about 4x faster renders, barely visible difference).
`REELBOT_MOTION_BLUR=1` turns it back on (PC: render.sh's 4x sub-frame blur). Each render logs its time and AWS cost next to the video (`*_lambda.txt`).

## The AI editors

After every render, before anyone sees the video:
- **Gemini watches the whole Short** (motion, sound, captions) like a stranger scrolling, scores the hook, pacing,
  readability, payoff and loop, predicts stayed-to-watch %, and lists every problem with timestamps and a fix.
- **Claude checks stills** every 0.5 s through the first 3 s and every 2 s after: text over faces, unreadable or
  cut-off boards, clipping, dead frames, a weak first frame.
- It passes only with no blocker/major issue, hook >= 7.5 and overall >= 7. Otherwise Claude edits the shot recipe at
  exactly those timestamps (keeping what works), the engine's checker validates it, and the GPU re-renders. Up to 2
  rounds; the full history is in `EDIT_REPORT.md` next to the video.

## How it gets better over time

1. Creator pulls Studio metrics into `analytics/raw/<date>/block_money/metrics.csv` (and retention curves).
   Set `REELBOT_ANALYTICS_DIR` to that `analytics/raw` folder.
2. Every `make` first runs `learn`: it joins each live Short's stayed-to-watch %, % viewed and retention with its
   frame-0 hook and first spoken line, ranks them, and writes `work/learnings.md`.
3. The hook factory and the script writer both get that table: write like the top rows, never like the bottom rows.
4. The judges score each new opening against it, so the bar rises as the channel's own winners change.
All candidate hooks and their scores are saved in `script.json` (`hook_candidates`), so we can later check which
scores predicted real retention.

Each Short's working folder (`work/shorts/<slug>/`) keeps everything: `script.json`, `script.txt`, `sources.md`
(claims, sources and the last fact-check report), `voice.wav`, `vo/timings.json`, `recipe.json`, every
`recipe_check_N.log`, `RECIPE_QA.md` and `state.json` (which stages are done, so a rerun resumes).

## Cost (rough, per Short)

- Claude: $0 extra on the subscription backend (counts toward plan limits; the run prints the API-equivalent).
  On the API backend about $1.50-$3 per Short, mostly the recipe and editor steps.
- Gemini: 2-4 grounded calls.
- ElevenLabs: about 600-900 characters at 45 s, plus up to 12 new sound effects (repeats come from the cache).
- AI editors: 1 Gemini video review + 1 Claude stills review per round (about $0.10-$0.40).
- GPU render: free (your PC), about 5-10 minutes per render (a fix round adds one re-render).

## Guard rails built in

- Claude is told the channel rules (no advice or picks, only Spender and Saver, examples labelled, title + description
  only) and every claim is independently checked by Gemini with Google Search. If the fact-check does not clear after
  2 rounds, `sources.md` says **NOT CLEARED** and the run prints a warning.
- Claude calls use adaptive thinking, structured JSON output, and server-side refusal fallback.
- The scene plan only passes when the renderer's own QA passes (no clipping, frame-0 hook, captions clear of faces).

## Limits (v1)

- Block Money only (the recipe engine). Justin clips uses a different engine (aitrends-2d-studio + Chatterbox) and is
  the next adapter to add.
- A human should still watch the result before posting. The QA catches technical problems, not boring ones.
