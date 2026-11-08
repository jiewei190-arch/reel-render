STATE: ready

# I.Awaken Short: eiffel-sold ("He Sold the Eiffel Tower… Twice 🗼")
- **Final video:** `video.mp4` (1080x1920, 24 fps, 866 frames, 36.08 s, AAC 192k; -14.1 LUFS integrated, true peak -1.1 dBFS; 23 MB, no split needed). Verify with `sha256sum -c video.sha256`.
  Audio: `audio/mix.py` (music + SFX + Fenrir VO). mix.py's own mux can trim the last frames, so the mixed audio was muxed onto the full silent render (866 frames) with `-c:v copy` (+0.7 dB under a -1.5 dBFS limiter to sit at -14 LUFS).
- Checked on the final file: frame 1 = Lustig in front of the tower with the SOLD tag, already walking (no title card); the last frame is the same image (loop); captions are 1-3 words at 66 % height, clear of the Shorts bottom bar and right-side buttons; top labels at 14 % height.
- **Year fix (owner request, Nov 8):** the year is now spoken as "Paris, nineteen twenty-five" (before, Kokoro read the digits as "one thousand nine hundred twenty-five"). Re-voiced with the same Fenrir settings; every later word moved 0.299 s earlier, and the shots and captions moved with it. A whisper check on the final file hears "nineteen twenty-five". Captions show the digits: one gold "1925." chunk spans both spoken words (owner follow-up), and the on-screen tag still reads "PARIS · 1925". Nothing else changed.
- Script: `script.md` (11 lines, Fenrir 0.95, short gaps + 3 silent beats). Line 1 = 7 words; twist at 3.6 s; closer "Subscribe for more." = 0.86 s.
- Sources: `sources.md` (3 topic-bank sources, all loaded and checked). "According to the story" covers why Poisson stayed quiet. The video says the second buyer went to the police, because the second "sale" was never paid. No dealer count or delay is given, because no source gives one.
- Project: `project/` (Toon 3D kit, 19 shots). Re-render from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/eiffel-sold/project` then `python3 audio/mix.py --project ../../iawaken/shorts/eiffel-sold/project`.
  The 1920s pieces (suit, top hat, bowler, Eiffel Tower, SOLD tag, Paris street, hotel salon, easel, poof) are all in `project/scenes/_lib.js`, so no kit files changed. Cast cameo: HERO + BISCUIT at a café (s03).
- Preview: `preview/preview_eiffel-sold_540x960.mp4`, `preview/contact_eiffel-sold.png`, `preview/firstframe_lastframe_check.png`.
- `UPLOAD.md`: title, description (sources + "Voice is synthetic." + #history #paris #shorts), pinned either/or question, cover frame 0.9 s, post time.
- Nothing posted, uploaded or scheduled.
