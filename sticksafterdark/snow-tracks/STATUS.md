STATE: ready

Sticks After Dark #7 "snow-tracks", Instagram cut (60-70 s rule). Full render done in the cloud.
- video.mp4: 1080x1920, 24 fps, 1535 frames, 63.96 s (end card included), H.264 + AAC 192k, 36.3 MB (one file, no split needed). sha256 in video.sha256.
- Narration: the brief's narration, word for word (script.md). Kokoro am_fenrir via kits/sticks/tools/voice.py at speed 0.85, beat 1.8 s, last beat 2.2 s, tail 2.2 s.
  The first pass ran about 56 s, so three pacing beats ('##') went in after "Only away.", "I checked it twice." and "And then it left.". No words were added or cut. The 2.4 s held frame before "There's a new set of tracks." is kept.
  Word times come from voice.py estimates inside exactly known sentence chunks (Whisper was not used).
- 28 shots, a new visual every 1.5-3.1 s. Frame 1: snow past the cabin window at night, with a too-tall shape moving at the treeline (only its legs show against the snow).
  Then: the cabin alone in the snow, snow on the roof, me asleep, the grey morning walk to the window, the line of bare prints (too-long toes, wide stride), one print up close,
  the prints leaving from the wall under my window, the push to the woods, a high wide view with a single line (only away), the prints going into the trees, the locked latch, my hand shoving it twice (two ticks),
  a slow push into the dark corner, my bed seen from too high up with a long shadow over it, long finger shadows over my sleeping face, the prints appearing one by one as it left that night,
  sitting on the bed, the deadbolt and the chain, sitting up awake as night comes back, snow again, the walk to the window, the held silent look at the woods (heartbeat),
  a tilt down to the NEW line coming out of the woods to right under the glass, then on "Coming back." long fingers resting on the outside of the glass (never the face), with a 1-frame jitter and a sting at 57.61 s. Hard cut to "Follow for more." at 60.4 s.
- Look: kit chalk lines, white stick figures, one accent: cold blue moonlight (#9cc4ff) on white snow. No gore. New sets (cabin, snow field with perspective footprints, window from inside, latch, door locks) live in project/scenes/shots/snow.js. The kit was not changed.
- Audio: audio/mix.py (wind and roomtone beds, footsteps, latch ticks, lock impact, heartbeat, stinger at -3 dB, dark drone at -24 dB). mix.py trimmed 4 frames, so the mix was muxed onto the full silent render with -c:v copy (all 1535 frames kept). Final: -14.1 LUFS integrated, true peak -1.3 dBTP.
- Captions: story/captions.json, 1-3 words at x470/y1250 (clear of the bottom 20% and right 15%). "Footprints.", "twice." and "Coming back." each get a caption to themselves. "six miles" shows as "6 miles".
- Checks: contact_sheet.png (frame 1 ... last frame, from the final video), contact_sheet_zones.png (--debug safe zones).
