# F1 status: 5 finance Shorts, ready for render

Branch `finance/f1`. Everything except the render is done. Each Short is in `finance/shorts/<slug>/`:
`script.md` (hook candidates, beats, VO with times, shot plan), `sources.md`, `voice.wav` + `script.txt`,
`vo/timings.json` (+ `vo/whisper_check.md`), `plan/plan_src.py` → `src/plan.gen.ts` + `plan/SHOTS.md`, `UPLOAD.md`.

| slug | first line (hook) | words | voice (s) | last word ends (s) | frames @30 | shots | median cut (s) | Whisper word check |
|---|---|---|---|---|---|---|---|---|
| penny-doubles | This penny beats a million dollars. | 68 | 28.57 | 27.98 | 857 | 21 | 1.28 | PASS |
| rule-of-72 | Seventy-two tells you when your money doubles. | 62 | 23.91 | 23.20 | 714 | 17 | 1.42 | PASS |
| minimum-payment-trap | Your minimum payment can take nineteen years. | 73 | 26.89 | 26.08 | 800 | 19 | 1.36 | PASS |
| dollar-1970 | Your dollar is worth under twelve cents. | 64 | 24.46 | 23.92 | 736 | 17 | 1.34 | PASS |
| ten-beats-thirty | Ten years of saving can beat thirty. | 74 | 29.84 | 29.30 | 897 | 23 | 1.22 | PASS |

All five: 20–30 s spoken, 62–74 words, first line under 8 words (MAIN's bar; 5 hook candidates listed in each
`script.md`), no intro, no CTA, the last line runs grammatically into the first (loop sentence noted in `script.md`),
twist at roughly 70%, cuts 1.0–2.1 s (every cut on a word), a big on-screen number counter in every shot (`COUNTER` in
`plan.gen.ts`), and the conflict in frame 1.

## How it was made (all free, local, CPU)
- **Voice:** the regular D2 voice, Chatterbox built-in voice, exaggeration 0.3, cfg 0.3 (`finance/voice/chatterbox_d2.py`
  and `setup_chatterbox.sh`, copied unchanged from `origin/voice-test` `whatif/voice/`), Shorts pacing `--gap 0.3 --lead 0.15`.
  `bash finance/voice/make_all.sh [slug]` re-renders. Same script and seeds give the same audio.
- **Word check:** `finance/tools/verify_words.py` (faster-whisper small.en) compares every word of `script.txt` to what
  Whisper hears. Result in `vo/whisper_check.md`.
- **Timings + plan:** `skills/blocky-shorts/template/vo/transcribe.py`, then each Short's `plan/plan_src.py`, both run by
  `bash finance/tools/post_voice.sh <slug>`. `make_script_md.py` rebuilds `script.md` from the measured facts.
- **Cast:** `finance/cast/src/library/characters.ts` is the skill's library file with the recurring cast appended:
  SAVER (green, glasses), SPENDER (red, bag), PENNY (copper kid, backpack), TELLER (violet, apron), LENDER (navy, hat).
  It typechecks against the template (`tsc --noEmit`, 0 errors). See `finance/cast/CAST.md`.

## For the PC (Creator) session
1. Copy `skills/blocky-shorts/template/` to a project per Short and copy `finance/cast/src/library/characters.ts` over
   `src/library/characters.ts`. Then copy the Short's `voice.wav`, `script.txt`, `vo/`, `plan/` and `src/plan.gen.ts`
   in (paths match the template).
2. Build the composition from `plan/SHOTS.md` (scene, camera and mood per shot; tags; counter).
3. Mux the voice at −14 LUFS per `references/render.md`.

## Open issues
- **Composition code not written.** The plan gives the shots, captions, tags and counter, but the Remotion composition
  (sets, staging, lenses) per Short is for the render session, along with the numeric framing checks.
- **New props to build** (not in the library yet): coin and coin stacks, a plain bill block (no portrait or seal), a wall
  calendar with flipping pages, a toll booth, a chart board, a big blocky clock, and the on-screen counter component.
  The list is in `finance/cast/CAST.md`.
- **Chatterbox's built-in QA prints "QA FAIL"** on lines with money (penny, minimum-payment, dollar-1970). Its normaliser
  can't match "one dollar" to Whisper's "$1" or "five point three million" to "$5.3 million". The heard text is right in
  every case (`voice.lines.json`), and `verify_words.py` passes all five. It doesn't compare the money fillers
  dollar/and/cents/point, because Whisper writes them as `$` and `.`.
- **Nobody has listened by ear yet.** Whisper confirms the words, not the delivery. Two lines were re-worded after Whisper
  misheard or the Short ran long: rule-of-72 line 2 ("Divide it by" was heard as "divided by", now "Divide that by"),
  and ten-beats-thirty lines 5–7 (tightened twice to get under 30 s).
- **dollar-1970 uses the latest CPI (Oct 2026: 337.511).** If it posts much later, re-check the latest CPI-U. The VO's
  "under twelve cents" and "almost nine times" stay true while CPI-U stays between about 323 and 388 (`sources.md`).
- **bls.gov blocks automated page fetches (403).** The 1970 CPI came from the BLS API and 2026 CPI from FRED (BLS data).
  The Investor.gov Rule-of-72 page loads its text by script, so its wording wasn't machine-checked. The rule itself is
  shown with exact maths.
- **ten-beats-thirty says "Spender, two hundred forty-five"** ("thousand" is implied by the line before) to fit 30 s.
  The on-screen tag reads ≈ $245,400.
- **The minimum-payment formula is one common formula (interest + 1%, $25 floor).** It is stated on screen as EXAMPLE.
  Real issuers differ, and the VO points viewers to their statement's warning box.
- **Not posted, uploaded or paid for:** nothing was posted, uploaded or spent.
