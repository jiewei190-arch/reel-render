# NOTES: turkeysleepy (Thanksgiving seasonal, unbadged)

**Template:** #4 crayon-book (lemo-opuscar/styles/crayon-book grammar via reels/styles/crayon, same module as flamingo and owl).
**History:**
- v1 was built in the midcentury classroom-film kit with am_michael.
- The main session flagged that midcentury isn't an approved template and that the owner's rule is af_heart for all new reels, so I killed that render before it finished.
- I rebuilt it in #4 with af_heart and the crayon bed.
- With af_heart the script ran 65.8 s, so I added nuts to the cheese line (Texas Health) and one framing beat ("turkey just gets the blame because it's the star of the table"), giving 69.7 s.

**Why crayon-book:** a kid-friendly food myth as a picture book: a steaming crayon roast on a red-check table, a red crayon X across "turkey = sleepy?", amino-acid beads, crayon bar charts, big crayon numbers 1-2-3 for the culprits (child logic), a halo for "innocent!". One amber wash, with white-wax stars resisting it.
**Batch N layout:** lettering from y 330, table/floor line at y 1150, the printed words on the ragged paper patch at y 1215-1400. The floor crayon fills the bottom band (texture only, no text).
**QA notes:** the safe-zone and outer-edge WARNs are the full-bleed crayon floor and paper texture (graphics, no text), as with the kit's other reels.
**Sources:** see sources_turkeysleepy.md (OSU primary; no unverified mg numbers).
**Code:** reels/t_turkeysleepy.js, t_turkeysleepy.html, specs/turkeysleepy.json, ev_turkeysleepy.json, tl_turkeysleepy.js. Thumbnail: thumb_turkeysleepy.jpg ("Turkey sleepy?").
**Badge:** none (seasonal rule).

## GROWTH checklist
- [x] Topic is a searched question (main-session seasonal assignment)
- [x] Hook passes HOOKS.md (11 words, frame 0 steaming roast + question lettering, the X at 0.9 s, search question at 4.0 s)
- [x] 66-86 s (69.7 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you nap after Thanksgiving dinner? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (the roast on the table at both ends)
- [x] pinned_turkeysleepy.md written
- [x] No badge (seasonal)
- [x] Timely window: Thanksgiving (Nov 26)

## QA (python3 -I reels/qa.py turkeysleepy)
```
QA turkeysleepy: WARN   (/home/user/reel-render/jobs/turkeysleepy/turkeysleepy.mp4, 69.8 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 0.0-30.0s, 30.2-62.8s, 63.0-69.8s; bottom y>1700: content 0.0-69.8s
  WARN  outer 24 px     content at the frame edge 0.0-69.8s
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 13.2 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          69.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 29.7 (min 1.0), contrast 38.6 (min 18.0)
  PASS  9:16 frame      turkeysleepy.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
