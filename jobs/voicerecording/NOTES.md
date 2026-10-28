# NOTES: voicerecording

**Template:** #15 Distilbook (demo 83), kit reels/styles/distilbook/distilbook.js, same as magnet / wrinklyfingers / snowwhite.
**Why:** a layered "why" with a hidden inside path, which is the template's page-to-diagram zoom. Beats:
- the search question on the tilted book page;
- the felt-tip head with two paths (blue air, pink bone);
- a zoom into the hatched skull with the bone path to the inner ear and a low-tone boost chart;
- a navy slide for "deeper + fuller";
- the microphone hearing only the air path, then the head-wave vs recording-wave comparison;
- the white editor card for the 2023 study;
- the payoff "you − bone = recording" shrinking into the video-player card.

My last two reels were Alchemy (noisecancel) and the recipe card (coldtaste).
**Batch N layout:** the kit's HUD writes in the top 250 px and the bottom band, so this reel draws its own: logo + label at y 304, brackets at y 262 / H-500, top-right left empty for the badge. Karaoke at y 1280 (maxW 820), chapter strip at y 1402-1436. Nothing is written in the right column below 840.
**v2 (main-session note):** the first line was re-voiced from "...the voice you hear in your head" (read as inner monologue) to "Nobody else hears your voice the way you do."; the title "Nobody else hears this." is kept. Re-rendered and re-badged.
**Voice:** af_heart 0.97, crayon bed at music_gain 0.6, 68.8 s. "2023" is spoken from words.
**QA notes:** the outer-24 px WARN is the demo's tilted book page bleeding off the frame at 3.2-6.2 s (deliberate, the template's look).
**Sources:** see sources_voicerecording.md. Holzman & Rousey 1966 is not cited (unverified).
**Code:** reels/t_voicerecording.js, t_voicerecording.html, specs/voicerecording.json, ev_voicerecording.json, tl_voicerecording.js. Thumbnail: thumb_voicerecording.jpg ("Why do I sound weird on recordings?").
**Badge:** `brand.py voicerecording --ep 65` at ("R", 256), hidden 6.0-13.7 s under the centred "two paths" title. OVR line in brand.py; checked at 11 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 65)
- [x] Hook passes HOOKS.md ("Nobody else hears your voice the way you do.", 9 words, main-session wording; frame 0 moving paths, search question at 3.2 s)
- [x] 66-86 s (68.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you like your voice on recordings? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (the head with both paths redraws under the end card; dim 40%)
- [x] pinned_voicerecording.md written
- [x] voicerecording_ep.mp4 (EP 65)
- [x] Timely window: evergreen

## QA (python3 -I reels/qa.py voicerecording)
```
QA voicerecording: WARN   (/home/user/reel-render/jobs/voicerecording/voicerecording.mp4, 68.8 s)
  PASS  static          longest no-change run 1.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 4.2 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 3.2-6.2s
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.5 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          68.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.9 (min 1.0), contrast 30.7 (min 18.0)
  PASS  9:16 frame      voicerecording.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
