# The Con Man Who Sold the Eiffel Tower — script & shot list

**EMOTION: LOL**
**LINE 1:** "A con man sold the Eiffel Tower. Twice."
**CAPTION (top, frame 1 → 3.4 s):** "the buyer was too embarrassed / to call the cops"

**Slug:** `eiffel-sold-twice` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 24.5 s (brief ~22 s, ±3) · Toon 3D + BEANMEN FX
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.5`; all 7 lines passed Whisper QA (seeds 7/11). Take was 25.5 s, sped up 4.5 % (ffmpeg `atempo=1.045`, pitch kept) to land inside the ±3 s window; raw take kept as `input/voiceover_raw.wav`.
The year is spelled out for the TTS only; captions keep digits ("1925", "6").

## Jail-break checklist
- [x] Triple hook in the first 2 s: frame 1 = a tiny top-hat man leaning on the WHOLE Eiffel Tower, waving a big SOLD sign (camera already pushing in, sign waggling, birds, sparkle) · VO line 1 word for word, no setup (0.00–3.0 s) · top caption from frame 1 to 3.4 s that ADDS story ("the buyer was too embarrassed to call the cops"), top ~8–14 % of the frame, separate from the 1–3-word captions at 79 %.
- [x] One emotion (LOL): every line is audacity — fake letterhead, the bribe, the too-embarrassed victim, round 2, the "not for the tower" twist. Cut from the owner's 29 s script: "To two different buyers", "read that the tower needed expensive repairs" (kept as the newspaper on screen), "secret meeting", "The second buyer did report him... vanished", "worried the US Treasury", "still not for sale".
- [x] No padding: 7 VO lines, 24.5 s (owner script ~29 s).
- [x] New shot every 1.0–2.4 s (14 shots). Pause before "AGAIN" (0.6 s beat, deadpan close-up), then the SOLD AGAIN stamp.
- [x] Payoff in the last 2 s: "Not for the tower. For counterfeiting." (fake dollars fan out). "Subscribe for more." dropped (ran 1.3 s, > 1 s, and it hurt the loop). Last frame (Lustig smirking with fake bills) hard-cuts to frame 1 (smirking Lustig + SOLD sign) — loop.
- [x] Hedges kept: "reportedly sold it... AGAIN" (the 2nd sale is disputed, see sources.md). Nobody hurt.

## Narration (exact VO, after the tempo fix)
1. A con man sold the Eiffel Tower. Twice.  *(0.00–3.02)*
2. In 1925, Victor Lustig forged government letterhead.  *(3.40–6.68)*
3. He told 6 scrap dealers the tower was being torn down.  *(7.08–9.76)*
4. Andre Poisson paid, plus a bribe. Lustig fled the country.  *(10.12–13.16)*
5. Poisson was too embarrassed to call the cops.  *(13.60–15.90)*
6. So Lustig came back, and reportedly sold it... AGAIN.  *(16.52–20.20, held beat before "AGAIN")*
7. He did end up in Alcatraz. Not for the tower. For counterfeiting.  *(20.56–23.92, PAYOFF)*

## Shots
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–2.40 | Paris lawn: tiny Lustig (top hat, suit) leans on a leg of the whole Eiffel Tower, waving a big SOLD sign; camera pushing in | top caption, sparkle, birds |
| s02 | 2.40–3.40 | Low angle from the other side; a giant red "SOLD x2" stamp slams onto the tower, Lustig holds up 2 fingers | whipBlur, flash, "!" |
| s03 | 3.40–5.10 | Park café: Lustig lowers a newspaper "TOWER REPAIRS TOO COSTLY", smirks | flash, "1925" stamp |
| s04 | 5.10–7.00 | 2D insert: letter on "MINISTERE DES POSTES ET TELEGRAPHES" letterhead, signed "Deputy Director"; "TOTALLY REAL" stamp on "letterhead" | whipBlur (word captions hidden) |
| s05 | 7.00–8.50 | Hotel suite: six dealers on stools, numbered 1–6 as they pop; Lustig at a podium | iris |
| s06 | 8.50–10.12 | Close on the easel drawing of the tower → "DEMOLITION" stamp on "torn" → reverse to the dealers, $ eyes | whipBlur, shake |
| s07 | 10.12–12.25 | Poisson (sweating) slides a case of cash over the podium, then a second little envelope on "bribe"; Lustig grabs both | sparkle, "!" |
| s08 | 12.25–13.50 | Departing train: Lustig tips his hat from the window, case beside him | whipBlur, speed lines |
| s09 | 13.50–14.95 | Poisson marches to the POLICE door, raises his fist to knock | whipBlur, "!" |
| s10 | 14.95–16.38 | He freezes, lowers the fist, turns away embarrassed, shuffles off | sweat, "?" |
| s11 | 16.38–18.50 | Lustig POPS back at the same podium, new dealers, "ROUND 2", raises the SOLD sign | flash, sparkle |
| s12 | 18.50–20.42 | Close-up: deadpan... beat... "SOLD AGAIN" stamp on "AGAIN", hat hops | shake, flash |
| s13 | 20.42–22.12 | Alcatraz cell: striped prison clothes, still the top hat, bored on the bunk | iris, zzz |
| s14 | 22.12–24.50 | Shakes his head at a crossed-out tower postcard ("not for the tower") → fans out fake dollars on "counterfeiting", smirks → hard cut to s01 | flash, sparkle, "FAKE DOLLARS" |

## Tone guards
Comedy only; nobody hurt, no arrests or violence shown. Lustig, Poisson and the dealers are original toon characters, not likenesses. The train, café, hotel room and cell are generic toon sets.
