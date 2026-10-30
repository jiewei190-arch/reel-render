# NOTES: mirrorflip (EP 99)

**Template:** #9 scifi-toon (lemo-opuscar), kit reels/styles/scifitoon, with the same cast (Juno + Spud) and screen layer as slipperyice. Lip sync uses lip_mirrorflip.js (a 24 fps loudness envelope of the voice).
**Why:** the template's profile is "myth-busting everyday objects, it's actually X". The lab board carries the classic, accurate top-down explanation:
- you face north at a mirror line, and your image faces south;
- your raised right hand stays on the east side for both;
- only north-south (into the glass) is flipped.

U-1 Mirror Test runs the checks. U-2 Imagine World shows where "left-right" comes from: a pretend twin walks around to face you, so its right hand lands on the west. Spud's head-over-heels flip is the up/down gag.

**Shots:**
- frame 0: the lab, Spud waving, the floor plan waving the east hand, the "MIRRORS FLIP / FRONT↔BACK" lockup, and the "LEFT ⇄ RIGHT?" panel stamped at 2 s;
- the axis line-up on the board, then the portal;
- U-1: right hand east for both; up → up and "at you"; "only into the glass" (E–W same, N–S flipped); equal distances behind;
- U-2: "FROM US!"; the pretend twin walking around; "its right = west", "IT'S FLIPPED!"; L/R = you vs UP = sky; head-over-heels, "NOBODY TURNS LIKE THIS";
- the verdict board; D. Harrison (U. Toronto) readout; yes/no cards;
- end card with the lockup.

**Batch N layout:**
- subtitles centred at y 1360 (Baloo, Juno pill);
- signs and readouts inside the board (y ≤ 1070) so they clear the subtitles;
- tags at the top-left, the badge top-right;
- Juno at x 830 and the wall clock moved below the badge (fixes from the first render).

**Script:** the first cut was 65.0 s, under the 66 s minimum, so I added a sourced line: "As Toronto physicist David Harrison puts it, it's front and back that are being reversed." Now 70.9 s.

**QA:** first render no FAIL (WARN: Juno in the right UI column). The re-render is a full PASS.

**Voice:** af_heart 0.97, jazz bed at music_gain 0.55; spec `tail` 0.7, so the end card runs 3.0 s.
**Sources:** sources_mirrorflip.md (institutional only: University of Toronto and University of Sydney physics).
**Code:** reels/t_mirrorflip.js, t_mirrorflip.html, lip_mirrorflip.js, specs/mirrorflip.json, ev_mirrorflip.json, tl_mirrorflip.js.
**Thumbnail:** thumb_mirrorflip.jpg ("IT'S NOT LEFT↔RIGHT").
**Badge:** `brand.py mirrorflip --ep 99` at ("R", 256), no hide needed.

**v3 (main-session fixes):** line 3 now reads "The hand in the mirror is on the same side, east, as yours."; the "IT'S FLIPPED!" plaque moved up to y 940, clear of the JUNO tag and caption. 72.0 s, QA PASS.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 99)
- [x] Hook passes HOOKS.md (11 words; frame 0 is Spud waving with the board plan waving back and the title popping in; search question at 4.1 s)
- [x] 66-86 s (72.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you think mirrors swap left and right? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (portal swirl back to frame 0's lab)
- [x] pinned_mirrorflip.md written (try-it)
- [x] mirrorflip_ep.mp4 (EP 99)
- [x] Evergreen

## QA (python3 -I reels/qa.py mirrorflip), v3 render
```
QA mirrorflip: PASS   (/home/user/reel-render/jobs/mirrorflip/mirrorflip.mp4, 72.0 s)
  PASS  static          longest no-change run 3.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.3 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 11.1 (min 1.0), contrast 51.2 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      mirrorflip.mp4 1080x1920 SAR 1:1; mirrorflip_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
