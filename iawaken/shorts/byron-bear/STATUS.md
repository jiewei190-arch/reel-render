STATE: ready

- Fix (owner, Nov 8): the year is now voiced "eighteen-oh-seven" (Kokoro had read "1807" as "one thousand eight hundred seven"; checked with Kokoro's phonemes `ˈeɪtiːnˈoʊsˈɛvən` and whisper word timestamps: the year now lasts 0.84 s at 16.30 s, was 1.6 s). Re-voiced, re-transcribed, shots after s09 re-timed (-0.85 s), full re-render. The on-screen tag still reads "CAMBRIDGE, 1807".
# I.Awaken Short: byron-bear ("Banned From Having a Dog, He Got a Bear 🐻")
- Final: `video.mp4` (18.2 MB, no split needed), 1080x1920, 24 fps, 804 frames, 33.50 s, -14.6 LUFS, true peak -1.3 dBFS. Verify with `video.sha256`.
  Built with audio/mix.py; the mix (build/mix.wav) was muxed onto the full 804-frame silent render with video `-c:v copy` (audio AAC 192k).
- Preview: `preview_byron-bear.mp4` (540x960); contact sheet: `contact_byron-bear.png` (every 40 frames + first + last). Checked: frame 1 already moving (bear + Byron strolling in past the NO DOGS sign), Line 1 = 9 words, twist at 3.3 s ("According to legend..."), captions 1-3 words at 66 % height (clear of the Shorts bottom bar), right-side action buttons cover only background, last frame = frame 1 (loop), closer "Subscribe for more." 1.0 s.
- script.md + sources.md (topic bank #5). Fenrir VO (Kokoro am_fenrir 0.95, short gaps), words timed with tools/transcribe.py (98 % match).
- Kit project: `project/` (17 shots, Toon 3D). Render: `node render.mjs --project ../../iawaken/shorts/byron-bear/project` from `whatif/aitrends-2d-studio` (11m57s in the cloud, 4 workers, SwiftShader).
  Kit additions: `bear()` (animals.js), `gown`/`coat` outfits + `mortarboard`/`tophat` (rig.js), Regency props (sign, book, desk, candle, quill, inkpot, letter, fountain, ledge), `SETS.collegeCourt` / `SETS.collegeRoom`; README updated.
- UPLOAD.md: title, description + sources + "Voice is synthetic.", pinned either/or comment, cover frame, post time.
- Nothing posted, uploaded or scheduled.
