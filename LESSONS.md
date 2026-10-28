# LESSONS: every piece of feedback, turned into a rule (living file)

Read this before scripting any reel. When the owner (or a reviewer) says something about a reel, add it here the same day as a rule with the reel name and date. Owner scores live in the "Reel Dailies" page (https://claude.ai/artifact/4i1CintFhB3ZJLqswwSnQA, db collection `scores/<reel>`); the main session copies new notes into this file.

## From the owner
| Date | Reel | What the owner said | Rule |
|---|---|---|---|
| Oct 27 | (all intros) | "the intros aren't catchy enough" | HOOKS.md: subject large and moving at frame 0, first line of 12 words or fewer, "but" by 5 s |
| Oct 27 | (all) | "sound effects are overpowering the voice-over" | mix2.py fx 0.5, ducked 40%, never raise (rule 12) |
| Oct 27 | magnet | "goes very well with the current style" | match the template's storytelling engine to the explanation (STYLE_FIT rule 2) |
| Oct 28 | caffeine, tickle, quake, zipper, touch | "the quality is terrible, never make these again" | no flat generic cartoon, no sterile isometric, no plain grid diagrams, no static repeated compositions, no loose template interpretation (STYLE_FIT REJECTED) |
| Oct 28 | flush v1 | blotchy paper, blank frame, kanji seal, empty bottom | clean paper texture, no blank frames, English-only seals, fill the bottom third with the demo's own devices |
| Oct 28 | ouija | years read as "one thousand eight hundred..." | years are spoken the way people say them (rule 14, voice2.py) |
| Oct 28 | (growth) | wants growth: one show, retention, searched topics, talking, profiles, pace | GROWTH.md checklist on every reel (rule 16) |

## From review and QA (main session, peer reviewers)
| Date | Reel | Problem | Rule |
|---|---|---|---|
| Oct 28 | owl (first cut) | same wing diagram on screen 8-36 s | no single composition held longer than about 6 s; change scene, angle or zoom (qa.py static check) |
| Oct 28 | owl (first cut) | "above 2,000 Hz", "below what prey can hear": unsourced | every number needs a source line; if it isn't found, cut it (rule 2) |
| Oct 28 | harvestmoon | "ILLU / SION" split across lines | never break a word across lines; shrink the type or reflow |
| Oct 28 | darkeyes | only Wikipedia as a source | each reel cites at least one primary or institutional source (university, government, peer-reviewed) next to any encyclopaedia |
| Oct 28 | barcode, onion (badges) | badge under TikTok's right-hand buttons | keep everything important out of x > 900, y 900-1650 (TikTok/Shorts buttons) and the bottom 220 px |
| Oct 28 | skeleton, catseyes | labels caught mid-handwrite looked clipped in the contact sheet | check write-on text at its finished frame before calling it clipped |

## Craft rules learned so far (short version)
1. The hook image is the template's most striking frame, already moving.
2. One idea per reel, one "wow" moment in the middle (35-45 s).
3. Something visibly new every 5-8 s; re-hooks at about 25 s and 50 s.
4. Fill vertical space with the demo's own devices (HUD, measurement boxes, stacked stats), never empty paper.
5. Material texture always (paper, ink, film, grain); the owner prefers hand-made looks.
6. Effects sit under the voice; the voice is always the clearest thing.
7. Years spoken as people say them; numbers rounded and sourced.
8. End: one-word question, then exactly "Follow for more of how it really works.", then the standard end card, then the loop back.
