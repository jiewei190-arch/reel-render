# reelbot: one command from topic to finished Block Money Short

```
topic ──► Gemini (Google-Search-grounded research)
      ──► Claude Opus 5.5 writes the script (hook, Spender vs Saver, claims + sources)
      ──► Gemini fact-checks every claim ──► Claude fixes anything that failed (up to 2 rounds)
      ──► ElevenLabs voices it line by line, with word timings (Tyler / Christopher)
      ──► Claude writes the shot recipe ──► the engine's own checker (clip QA + frame-0 gate)
            └─ errors go back to Claude until it passes (up to 5 attempts)
      ──► GPU render on the PC (render.sh, motion blur) ──► music + SFX mix ──► -14 LUFS
      ──► QA (loudness, Whisper) ──► Videos\BlockMoney\<slug>\video.mp4 + UPLOAD.md + sources.md
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
3. Copy `.env.example` to `.env` and paste your three keys **into that file yourself**:
   `ANTHROPIC_API_KEY` (console.anthropic.com), `GEMINI_API_KEY` (aistudio.google.com), `ELEVENLABS_API_KEY`.
   `.env` is git-ignored. Never paste keys into a chat.
4. Point it at the renderer if it is not in the default place:
   `REELBOT_RENDER_ROOT=C:\Users\jiewe\blocky-render`, and `REELBOT_AUDIO_DIR` at the folder with `music\` and `sfx\`.

## Use

Run from this `bot` folder:

| Command | What it does |
|---|---|
| `python -m reelbot ideas --n 10` | 10 fresh, timely topic ideas with hooks |
| `python -m reelbot make "why minimum payments trap you"` | research + script + fact-check, then **stops** so you can read the script |
| `python -m reelbot continue <slug>` | voice + scenes + GPU render + QA |
| `python -m reelbot make "..." --auto` | the whole thing, no stop |
| `python -m reelbot batch topics.txt` | one topic per line, each run straight through; a failure skips to the next |
| `python -m reelbot voice <slug>` / `recipe <slug>` / `render <slug>` | redo one stage |

Options: `--voice Tyler|Christopher|auto` (auto alternates), `--seconds 45`, `--style S1..S6`, `--notes "..."`, `--redo`.

Each Short's working folder (`work/shorts/<slug>/`) keeps everything: `script.json`, `script.txt`, `sources.md`
(claims, sources and the last fact-check report), `voice.wav`, `vo/timings.json`, `recipe.json`, every
`recipe_check_N.log`, `RECIPE_QA.md` and `state.json` (which stages are done, so a rerun resumes).

## Cost (rough, per Short)

- Claude Opus 5.5: about $0.50-$2, mostly the recipe step (long guide + examples). Printed at the end of every run.
- Gemini: 2-4 grounded calls.
- ElevenLabs: about 600-900 characters at 45 s.
- GPU render: free (your PC), about 5-10 minutes.

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
