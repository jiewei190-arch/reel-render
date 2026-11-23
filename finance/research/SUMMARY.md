# Shorts hook study: summary (what HIGH Shorts do in the first 3 s that LOW ones don't)

Data: `shorts_hooks.csv`, 73 Shorts: 32 high (>1M views), 38 low (<5K), and 3 mid same-channel comparators (excluded
from the percentages). Long-form sources: `hook_rules.md`. Annotated frame-0 strips: `frame0_*.jpg`. Raw notes: `notes/`.

| niche | high | low |
|---|---|---|
| Blocky / Roblox-style story | 11 | 14 |
| Faceless finance | 7 | 11 |
| Money facts / "$X a day" | 14 | 13 |

Some "blocky" high items are 2D anime or comic rather than blocky; the notes flag them.

## The biggest HIGH vs LOW differences (share of each group)

| signal in the first 3 s | HIGH | LOW | gap |
|---|---|---|---|
| a face or character visibly reacting | 66 % | 29 % | +37 |
| conflict or stakes visible by 3 s | 56 % | 21 % | +35 (blocky only: 100 % vs 21 %; animated only: 76 % vs 23 %) |
| hook text already on screen at 0.0 s | 62 % | 34 % | +28 (blocky only: 55 % vs 7 %); a looser parse of the column gives 66 % vs 42 % |
| a real human face in frame 0 | 34 % | 8 % | +26 |
| a black or blank frame 0 | 9 % | 16 % | -7 |
| median length | 22.5 s | 49.5 s | |

**Did not separate the groups:**
- the number of cuts in the first 3 s;
- "no hook text by 3 s";
- shock-number hooks on their own: 3 % of high vs 16 % of low. They only worked when paired with a threat or surprise.

**Same-creator pairs** (the strongest comparison):
- ShyCammyEx, blocky: the 18M high shows avatars with "DAD?" at 0.5 s. The lows open on a black frame and then still scenery.
- realmelaninking: the 3M high has "How to save $5,000 in a few months" on frame 0. The lows are off-topic, or a wall of text over stock footage.
- Kevin O'Leary: the 14M high is a punched-in contrarian claim. The lows are 80–130 s split-screen TV reposts with almost no motion.
- Money Saving Diary: the 13M high is one coin-stacking action with no text. The low opens on a text-heavy ad graphic.

## Top 10 hook rules for Block Money

1. **Stakes in the first 3 s, not the topic.** Say what's at risk ("you owe $5,000 and pay $150"), not "how minimum payments work".
2. **Hook text on frame 0.** Captions can start at 0.0 s. Never fade in from black.
3. **The character reacts in frame 0:** face to camera, a gasp, a flinch or a point. It should fill at least a third of the frame, not sit tiny in a wide shot.
4. **One odd, readable thing in frame 0** that explains the premise with the sound off, e.g. a card on fire or a TV falling. The low blocky Shorts put premise text over a quiet wide establishing shot.
5. **Lead with a contrarian claim or a rule, then the number.** A number alone doesn't win; it needs a threat or surprise.
6. **One line of hook text**, 8 words or fewer, large, in the centre third, white or yellow with a dark outline. The low Shorts often used tiny text or 4-line paragraphs.
7. **Keep it under about 30 s and end on the payoff into the loop.** Jenny Hoyos: Shorts under 30 s need over 100 % retention.
8. **Never spend the first 3 s on scenery.** Something must visibly change in each of 0–1 s, 1–2 s and 2–3 s.
9. **Use 5th-grade words.** Avoid "finance", "profit" and "interest rate" in the hook. Say "money you owe" or "extra money you pay".
10. **Say "you", and give the character something to want.** The first line carries the topic and the conflict together.

## How the v2 hooks (finance/hooks A2/B2) line up

- **Rules 2, 3, 4 and 8 are met:**
  - frame 0 is mid-action (a TV filling the frame, or a grin with a brick);
  - captions start at 0 s;
  - the face changes 4 times in under 5 s;
  - something changes on screen at least every 0.8 s.
- **Rule 1** is met in B2 ("$8,000 for nothing" by about 1.8 s). A2 states the stake ("19 years") at 2.7 s, later than the 1 s target.
- **Rule 10 (say "you")** is not met yet in either.

## Caveats

- **Audio not captured:** `music_at_0s`, `sfx_in_first_3s`, `loop` and `cta` are "not assessed". `first_words_exact` comes from burned-in captions or the title.
- **Estimates:** cut counts, motion and `words_before_hook_lands` are estimated from frame differences and first-text time. Views are as rounded on search.
- **Channel size:** the high channels are much bigger (median about 750K subscribers vs about 285 for the low). Many low Shorts are 0–2 days old; those under a day are tagged.
- **Pairs:** true same-channel high/low pairs are few, because big channels rarely have a recent Short under 5K. Most comparisons are same-premise (`topic_cluster`); `pair_id` holds the same-creator ones.
- **Long-form sources:** 5 videos. Only Jenny Hoyos cites her own channel numbers; the others' figures are labelled as claims in `hook_rules.md`.

Study by the PC research subagent; this summary was saved by the Reel creator session from the agent's report, and its two
headline percentages were re-computed from the CSV.
