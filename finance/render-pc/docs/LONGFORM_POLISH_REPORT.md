# Long-form polish: report (branch engine/longform-polish)

Branch `engine/longform-polish`, made from `engine/all` at a2e0096. A draft PR into `engine/all` is open and has not
been merged. Kits: law3d, biz3d and cyber3d, in Shorts and long-form. Block Money (`index.toolkit.ts`) and tech3d are
unchanged: their `--check` logs are identical before and after.

## What was built

| # | ask | done |
|---|---|---|
| 1 | Counters land on their exact final value and hold it | **Engine:** every counting element (law3d `counter`; biz3d `counter`, `board.count`, `worth`; cyber3d `boards[].count`, `money`) counts in a window that ends at the earliest of `dur`, the end of its **anchor word**, and 0.5 s before it leaves or its shot cuts. A count shorter than 0.25 s snaps to the target. From the window's end, the exact final text shows (`d.final`). The anchor word is found in the voice-over (`fifteen`, `$12,000`, `twelve thousand`, `54 million`, `1,152`, `$10.50`; `57 million` for `-$57M`; compact values within 5 %), or set with the new `"land": "<word>"`. The landing ding / cash sound moves with it. **Gate P1:** the value shown at the end of the anchor word must equal the target; any on-screen frame past the hold point that shows another value FAILS; the final value must hold >= 0.5 s. A counter with no anchor word gets a warning. |
| 2 | Board text-fit | **Engine:** `src/longform/polish.ts` holds the Poppins ExtraBold advance table (from the TTF). Every board title and value, label, tag, exhibit, case card, verdict, decision, stamp, worth row and cyber story-card line is measured and set on ONE line (`nowrap`), shrunk to fit its box. Counting values are fitted once at their widest (all digits as `4`), so they never jump or split. Labels and exhibit tags are sized from the measured text. **Gate P2:** a line that would need less than 42 px (main lines, rule R4) or 32 px (titles) FAILS with `... needs N px at the 42 px minimum but has M px: shorten it to K characters or <kit alternative>`. |
| 3 | Chapter cards | **Engine:** `ChapterCard` has an opt-in `safe` mode that the three kits use. It fades in with a 60 px glide (it never slides in from off screen), the title is one line fitted down to 56 px, and it sits at a compiler-chosen `top`: the first of 330 / 130 / 560 px that no fixed board or card uses during its 2.6 s (`placeChapters`). law3d exhibit tags and biz3d / cyber3d labels are placed around it. **Gate P3:** the card must be fully on screen at rest (above the caption band), one line at >= 56 px, and have no board, label, card or hook over it. Without `safe` (Block Money, tech3d) the card renders exactly as before. |
| 4 | Occlusion | **Sets:** each set now lists `occluders` (law3d: judge's chair, witness chair, four counsel chair backs; biz3d: nine boardroom chair backs; cyber3d: three monitors and the rack), on top of its blockers. Walls are excluded because they are one-sided. **Gate P4:** a piece in front of a featured face (camera target, shot subject or speaker; actors and face boxes come from `tools/framing_kits.mjs`) that covers >= 30 % of it for > 5 frames FAILS. The message gives the exact camera height for a line of sight over the piece, a sideways move, or an orbit. |
| 5 | `--check` on every recipe, before and after | See the table below. Stills are in `docs/polish/`. |
| 6 | Docs | ENGINE.md ("Polish QA"), LONGFORM.md section 7a ("Polish rules", the canonical text), KIT_LAW3D.md (sections 6, 9, 12), KIT_BIZ3D.md (sections 7, 14), KIT_CYBER3D.md (sections 8, 14). |

New files: `src/longform/polish.ts` (shared, pure, deterministic), `tools/polish_qa.mjs` (gate rules P1-P4, wired into
`law_build.mjs`, `biz_build.mjs` and `cyber_build.mjs` for Shorts and long-form), `tools/qa_fixtures/polish-defects/`
(a law3d landscape fixture that reproduces the editor's defects), and `docs/polish/*_before_after.jpg`. The clip
adapters (law_entry, biz_entry, cyber clip.ts) re-time the new `land` field. Re-clipping the biz3d and cyber3d demos
gives byte-identical recipes.

**Merging with engine/caption-safe:** `tools/framing_qa.mjs` and `tools/framing_kits.mjs` are **not touched**. The polish
gate imports their exports read-only. R1-R6 stay in framing_qa.mjs; P1-P4 live in polish_qa.mjs.

## --check counts, before and after (all 35 recipes in finance/shorts and finance/longform)

`node tools/recipe_build.mjs <slug> --check` (long-form with `--qa-sample 3`). "Gate FAIL rows" counts the hard FAIL
rows in the gate table. "Detailed findings" counts the itemised FAIL / CLIP lines (clip QA, framing QA, polish QA).

| recipe | gate FAIL rows before -> after | detailed findings before -> after | polish P1/P2/P3/P4 after |
|---|---|---|---|
| atm-fee-twenty | 3 -> 3 | 20 -> 20 | n/a (Block Money / tech3d) |
| biz-demo-blockbuster-passed | 0 -> 0 | 0 -> 0 | 0/0/0/0 |
| biz-demo-landscape | 2 -> 2 | 2 -> 2 | 0/0/0/0 |
| biz-demo-landscape-short-1 | 0 -> 0 | 0 -> 0 | 0/0/0/0 |
| coffee-could-be | 3 -> 3 | 22 -> 22 | n/a (Block Money / tech3d) |
| credit-score-car | 4 -> 4 | 22 -> 22 | n/a (Block Money / tech3d) |
| cyber-demo-landscape | 1 -> 2 | 1 -> 2 | 0/0/0/1 |
| cyber-demo-landscape-short-1 | 0 -> 1 | 0 -> 1 | 0/0/0/1 |
| cyber-fake-supplier | 0 -> 1 | 0 -> 1 | 0/0/0/1 |
| delivery-markup | 5 -> 5 | 24 -> 24 | n/a (Block Money / tech3d) |
| employer-match | 4 -> 4 | 20 -> 20 | n/a (Block Money / tech3d) |
| fake-sale | 5 -> 5 | 22 -> 22 | n/a (Block Money / tech3d) |
| fee-one-percent | 3 -> 3 | 20 -> 20 | n/a (Block Money / tech3d) |
| free-trial-204 | 3 -> 3 | 27 -> 27 | n/a (Block Money / tech3d) |
| law-demo-54-million-pants | 4 -> 4 | 14 -> 14 | 0/0/0/0 |
| law-demo-landscape | 3 -> 3 | 6 -> 6 | 0/0/0/0 |
| law-demo-landscape-short-1 | 4 -> 4 | 11 -> 11 | 0/0/0/0 |
| minimum-payment-trap | 6 -> 6 | 64 -> 64 | n/a (Block Money / tech3d) |
| mortgage-year-ten | 5 -> 5 | 21 -> 21 | n/a (Block Money / tech3d) |
| overdraft-35 | 4 -> 4 | 28 -> 28 | n/a (Block Money / tech3d) |
| payday-rollover | 3 -> 3 | 16 -> 16 | n/a (Block Money / tech3d) |
| prices-double | 4 -> 4 | 23 -> 23 | n/a (Block Money / tech3d) |
| quit-cash-out | 3 -> 3 | 17 -> 17 | n/a (Block Money / tech3d) |
| raise-tax-myth | 3 -> 3 | 32 -> 32 | n/a (Block Money / tech3d) |
| same-raise | 5 -> 5 | 45 -> 45 | n/a (Block Money / tech3d) |
| seven-year-car | 1 -> 1 | 16 -> 16 | n/a (Block Money / tech3d) |
| shop-too-fast | 0 -> 0 | 28 -> 28 | n/a (Block Money / tech3d) |
| shop-too-fast-short-1 | 3 -> 3 | 5 -> 5 | n/a (Block Money / tech3d) |
| start-25-vs-35 | 4 -> 4 | 49 -> 49 | n/a (Block Money / tech3d) |
| tech-demo-landscape | 2 -> 2 | 2 -> 2 | n/a (Block Money / tech3d) |
| tech-demo-landscape-short-1 | 2 -> 2 | 6 -> 6 | n/a (Block Money / tech3d) |
| tech-demo-planes-land-blind | 2 -> 2 | 7 -> 7 | n/a (Block Money / tech3d) |
| ten-beats-thirty | 4 -> 4 | 34 -> 34 | n/a (Block Money / tech3d) |
| wedding-or-keys | 3 -> 3 | 25 -> 25 | n/a (Block Money / tech3d) |
| zero-percent-couch | 4 -> 4 | 17 -> 17 | n/a (Block Money / tech3d) |
| **total** | 102 -> 105 | | |

- **Block Money (22) and tech3d (4):** identical logs before and after, apart from timings. Their compilers do not use
  polish.ts, and `ChapterCard` without `safe` is the old code path.
- **law3d and biz3d demos:** no new findings. P1-P4 all pass after the engine changes. Their existing fails are
  framing R1-R4 on recipe content (heads sliced by the edge, 3D signs past the edge or too small). Those were there
  before and are out of scope.
- **+3, cyber3d (true positives, recipe content):** P4 catches the middle-right monitor's back hiding the hooded
  figure's face (58 %) in shot S04 of `cyber-fake-supplier`, and in the two demos cut from the same script. I rendered
  the frame (5.4 s): the monitor does cover the face. The gate's fix, `cam.h +0.44`, clears it (re-checked on a copy).
  I did **not** edit those recipes. That is the writer's call, a one-line change per recipe.
- Warnings (not failures): biz3d `-$57M` and `$1.46B` and cyber3d `$100M` are never said in the voice-over, so those
  counters land 0.5 s before they leave.

The pre-change engine has no polish hooks, so P1-P4 cannot be counted on the old code. The "before" side of the new
rules is shown with the fixture instead. Rendered with the old engine (a worktree at a2e0096), it reproduces each
defect.

## Before / after stills (`finance/render-pc/docs/polish/`, fixture `tools/qa_fixtures/polish-defects`)

| still | before (a2e0096) | after |
|---|---|---|
| `counter_years_before_after.jpg`: the end of "fifteen" | **YEARS 14**, and chapter card 1 is piled on the board, its title wrapped onto 2 lines | **YEARS 15**; the card moved to its own spot, one line |
| `counter_offer_before_after.jpg`: the end of "twelve thousand" | **$11,999** | **$12,000** |
| `stat_board_anchor_before_after.jpg`: the end of "$64,000,000" | **$63,283,041**; the title `PER VIOLATION, PER / DAY` wraps | **$64,000,000**; the title on one line |
| `stat_board_before_after.jpg`: board landed | the title wrapped onto 2 lines, squashing the number | one fitted line |
| `chapter_card_entry_before_after.jpg`: 0.1 s into chapter 2 | **"RY CLEANER'S LAST / D"**, sliding in clipped (the "HE DRY" defect) over the DAYS IN COURT board | fading in, fully on screen, clear of the board |
| `chapter_card_rest_before_after.jpg`: at rest | the card under the counter board, 2 lines | its own region (top 560), one line |
| `occlusion_chairs_before_after.jpg`: seated defendant behind a counsel chair | the face hidden | the same frame: P4 is a check. It now FAILS with `set.chairDL covers 100 % of mom's face ... move mom 0.38 m sideways clear of it, or swing the camera around (cam.az +-20)` |

## Notes and limits

- The real Pearson v. Chung recipe (561.7 s) is not in the repo, so I could not re-run its exact timestamps
  (37 / 69 / 117 / 158 / 164 / 179 / 236 / 242 / 253 / 433 / 450 / 506 / 517 / 528 s). Rebuild it on this branch with
  `--check`: P1-P4 will list anything left.
- `dur` is now an upper bound: a counter whose number is said sooner counts faster. A count that cannot run 0.25 s
  before the anchor or the cut snaps to its final value.
- The anchor search looks 1.5 s before the counter pops until it leaves. A number said earlier than that does not
  count; set `land` if the counter should land on a specific word.
- P4 checks set pieces only. Recipe props over heads are still framing rule R1. Chapter cards are kept off boards and
  labels, but not off faces (as before); the 560 px top can sit over a chest.
- The cyber3d countdown clock is excluded from P1: it is a running timer by design.
- No motion blur was added (plain 30 fps), no logos, and the gate is deterministic (pure functions, no randomness).
