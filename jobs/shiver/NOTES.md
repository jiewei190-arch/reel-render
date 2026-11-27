# shiver: why do we shiver when we're cold? (Batch N, worker H4, EP 82)

- Template: **#15 handdrawn "Distilbook"** (styles/distilbook/distilbook.js, the wrinklyfingers grammar; reserved by the main session; last Distilbook was voicerecording EP 65). Why: a layered body mechanism (brain thermostat -> muscle -> heat -> fuel) is Distilbook's page-to-diagram zoom.
- Length 75.0 s (spec tail 0.7, end card about 3 s); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_shiver.js, t_shiver.html, specs/shiver.json, tl_shiver.js, ev_shiver.json.
- Copied from the demo/wrinklyfingers: bold stacked lines with the last line blue ("Shaking / = heat.", "Muscles / leak heat."), the tilted serif book page "7.4 Shivering" with depth blur and marker sweeps, felt-tip diagrams with crayon fills and hatching, red circle callouts, wavy arrows, handwritten labels with one blue word, white editor cards (SHIVER PATTERNS, ENERGY), the dark navy slide with a big pink counter (1.0x -> 3.5x), the diagram shrinking into the video-player card, the chapter strip (thermostat / muscles / heat / fuel / fever), HUD, logo end card with the handle pill.
- Batch N layout: content between y 370 and ~1150 (titles below the top-right badge strip), karaoke at y 1330, chapter strip only in the bottom band (no captions there), nothing written in the right column below y 840.
- Hook: frame 0 is the felt-tip figure hugging itself and shaking (jitter + tremble marks), a crayon flame inside the torso; the stack "Shaking / = heat." and a "furnace" label with a wavy arrow; "but" at 3.8 s.
- Beats: book page with the search question -> brain with the hypothalamus circled + a thermostat dial (too cold -> SHIVER: ON switch) -> muscle fibre tightening/relaxing with a contraction counter -> steady vs burst traces -> energy bar (fuel -> a little motion, a lot of heat) -> "moved: 0 m" -> navy slide 3.5x (shoulder-deep, 18 °C, 1988) -> glycogen granules burning -> brown fat cell with glowing mitochondria -> fever set-point dial moving up -> payoff chain shrinking into the video card -> "Teeth chatter?" pills.
- Re-hooks: 24.6 s "Here's the trick: muscles never turn fuel into motion perfectly", 39.4 s the 3.5x counter, 47.3 s "But that heater burns fuel".
- Main session asks: the 3.5x stays tied to its study condition on screen (cold-water study, 1988, shoulder-deep 18 °C); no goosebumps/cold-breeze beat (EP 55); focus on muscle heat, brown fat and fever.
- Demand signal: "why do we shiver" / "why do I shiver when I have a fever" are evergreen People-Also-Ask questions; winter season.

## Softened / not used
See sources_shiver.md.

## QA (python3 -I reels/qa.py shiver, handoff qa.py)
```
QA shiver: PASS   (/home/user/reel-render/jobs/shiver/shiver.mp4, 75.0 s)
  PASS  static          longest no-change run 0.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.7 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          75.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.5 (min 1.0), contrast 31.3 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      shiver.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Audio note: the standard enc_hq.sh encode failed true peak (+0.1 to +3.5 dBTP, moving around as cues changed). The cause is ffmpeg's default AAC coder ("twoloop") at 72k after the alimiter: the same input encoded with `-aac_coder fast` peaks at -2.1 dBTP. shiver.mp4 was encoded with the exact enc_hq.sh command plus `-aac_coder fast` (reported to the main session; enc_hq.sh itself is unchanged).
Fix history: the hook's stack overlapped the figure's head and the legs reached the karaoke (figure scaled to 0.9 and moved; the heat waves above the head removed).

## Episode badge
`python3 -I reels/brand.py shiver --ep 82` with OVR spot ("R", 260). Frames checked at 6, 9, 13, 17, 22, 27, 34, 43, 49, 53, 58, 64, 70 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (9-word first line, frame 0 subject moving, "but" at 3.8 s)
- [x] 66-86 s (75.0 s); ends on the exact closing line; end card about 3 s
- [x] One-word-answer question before the closing line ("Do your teeth chatter when you're cold? Yes or no?", YES/NO pills, chattering teeth)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (the shaking figure returns over the end card)
- [x] pinned_shiver.md written
- [x] shiver_ep.mp4 made with brand.py (EP 82)
- [x] Seasonal: winter, otherwise evergreen

## Peer review
(pending; main session assigns a reviewer)
