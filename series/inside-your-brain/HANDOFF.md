# Inside Your Brain: handoff (Oct 29). Status: in progress, NOT finished

Remotion project for the series. Episode 1 is "You accidentally liked someone's photo from 2022."

## Done and verified
- Official Remotion Claude Code plugin installed in the cloud session (`claude plugin install remotion@remotion`, v4.0.539). The project was scaffolded with `npx create-video@latest --yes --blank --no-tailwind`, plus `@remotion/media` and `@remotion/captions`.
- **Script:** `episodes/ep01/script.json`, 21 lines, 3 characters.
- **Voices:** Kokoro TTS, a local Apache-2.0 model from the repo's `tts/` folder (`tools/voice.py`). Anxiety is af_bella (fast, pitched up), Logic is bm_george (slow), Confidence is am_michael (pitched down).
  - Real runtime: **69.5 s**.
  - Output: per-line WAVs in `public/ep01/`; timing plus a per-frame mouth envelope in `episodes/ep01/timeline.json`.
- **Intelligibility:** `tools/check_voices.py` ran faster-whisper `small.en` on every line. Every line is understood. The lines scored below 0.85 differ only in digits versus spoken years, or in hyphenation.
- **Captions:** word-synced from whisper timings (`tools/captions.py`). Output is `src/episodes/ep01/captions.json` (Remotion Caption[] plus speaker) and `episodes/ep01/captions.srt`.
- **Sound:** original synthesized SFX and music, no licences needed (`tools/sfx.py`). Output in `public/sfx/*.wav` and `public/music/{comedy_bed,tension_bed}.wav`.
- **Characters:** `src/brain/characters/` (parts.tsx, Character.tsx), with expressions, arm poses and props. `src/brain/theme.ts` holds colours and the safe zones (top 250, bottom 1440, right column x>900 from y 840).
  - Model sheet: `npx remotion still ModelSheet out/sheet.png`. It renders. The designs read well.
  - Known issue: some arm poses (thumbsUp, windup) cross the head or hair and need tuning.

## Not done
1. **Stage:** a control-room set (`src/brain/sets/ControlRoom.tsx`: wall, monitor, console with a big red LIKE button, alarm lights) and a phone close-up (`PhoneScreen.tsx`: a fictional "pixgram" post from 2022, a heart pop, Jordan's DM reply, the 2015 post).
2. **Actor:** a component that reads cues (expression, pose, prop per time) and the mouth envelope from timeline.json, with blinking, bobbing and panic jitter. Plus a camera wrapper for cuts and close-ups.
3. **Ep01 composition:** the shot list (main-session draft):
   - 0-1.4 s: phone close-up, double-tap, heart pop.
   - Anxiety close-up with the alarm.
   - Wide shot, monitor showing "2022".
   - Logic sips coffee.
   - The archives at 2 AM on the monitor.
   - Confidence: "like every photo", with a heart counter.
   - "CONFESSION" stamp.
   - The lake throw, with splash.
   - Router labelled "THE INTERNET".
   - Delete/rename/move icons.
   - GERALD name tag.
   - Record scratch on "Act... normal?"
   - Phone buzz, then Anxiety's "Read it / don't" with eye-cover poses.
   - Jordan's DM types out.
   - "Now we're even."
   - Confidence reaches for the LIKE button, Logic dives ("Don't touch that!"), tap, heart pop on the 2015 photo.
   - "Code red!" (loop back to the opening).
   - Title card: INSIDE YOUR BRAIN · EP 1.
4. **Audio in Remotion:** `<Audio>` per line and per SFX, with the music bed kept well under the dialogue.
5. **Captions:** speaker-coloured, chunked with `createTikTokStyleCaptions`, inside x 80-880 and y about 1240-1430.
6. **Checks:** render a preview, inspect it, render the full 1080x1920 30 fps H.264/AAC file, then check frames, sync, loudness/clipping and specs.

## Commands
```
python3 tools/voice.py episodes/ep01         # TTS -> public/ep01 + timeline.json
python3 tools/check_voices.py episodes/ep01  # whisper check + word timings
python3 tools/captions.py episodes/ep01      # captions.json + captions.srt
python3 tools/sfx.py                         # SFX + music library
npx remotion still ModelSheet out/sheet.png
```
