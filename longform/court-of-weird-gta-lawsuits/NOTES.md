# NOTES: court-of-weird-gta-lawsuits

Where this came from: the request for this second script arrived as a message from the parent Claude session
("the owner wants to ride the GTA 6 attention"), not from the owner directly in this session. Nothing here is voiced,
rendered or uploaded.

## Numbers
- **Final title:** 10 Real GTA Lawsuits and How They Ended (39 characters). The working title "Every Lawsuit Grand Theft Auto Ever Faced" fails the truth check: the video covers ten cases, not every one.
- **Words:** 1,674 spoken, 86 lines, 10 cases + cold open.
- **Estimated runtime:** 11 min 23 s at 2.45 words per second (`target_seconds`: 683), inside the 10-13 minute brief and inside the engine's 8-12 minute long-form gate.
- **Per case:** 47 to 72 seconds, plus 87 seconds for the GTA 6 leak.

## Order
Cold open (the hotel room; plants "what does a court do with him?") → 10 Lohan and Gravano → 9 the strip club →
8 Hot Coffee → 7 the Alabama families' suit → 6 the lawyer disbarred → 5 the man who said he was CJ →
4 Rockstar sues the BBC → 3 the fans who rebuilt the game → 2 the producer's $150 million → 1 the GTA 6 leak.

## How current the GTA 6 references are
- The only statement about the game's release is one line: "The game he leaked came out in November, twenty twenty-six."
- Basis: Wikipedia's Grand Theft Auto VI article, read live on Nov 24, 2026, which gives a release date of **19 November 2026** after delays from 2025 and from 26 May 2026. **No primary source (Rockstar, Take-Two) or major news report of the launch was read**, so treat the date as secondary-source only and check it against a news report before voicing. If it is wrong, change or cut that single line; nothing else depends on it.
- Not used because unverified beyond Wikipedia: sales and pre-order figures, review scores, launch records, platform details, the PC version.
- The leak itself is dated "September, twenty twenty-two" (Wikipedia; the BBC court reports give 2022 without the month).
- Everything else about the leak is from two BBC court reports dated 23 Aug and 21 Dec 2023. **Nothing after December 2023 was checked**: whether the hospital order has been reviewed, appealed or changed since is not known and not claimed.

## Not verified, or deliberately hedged
- **Three endings the narrator says we could not confirm:** how the Hot Coffee consumer suits closed after the class was decertified (July 2008); how the Alabama families' suit ended (Wikipedia alone reports a 2009 summary judgment for Take-Two; spoken as "reportedly"); how Rockstar's suit against the BBC ended.
- **Benzies:** the confidential settlement and its date (Feb. 2019) rest on Wikipedia and one trade site; spoken as "reportedly". The 2016 complaint details came from search-result summaries of trade coverage, not a page read in full.
- **Lohan / Gravano:** the Court of Appeals opinions could not be opened (nycourts.gov and Justia returned 403); the quotes come from the Hollywood Reporter and Engadget quoting the opinion. Reporter citations in sources.md are from memory and flagged there. Amounts sought and the vote are not stated.
- **Washington (CJ):** the appellate opinion was not read; facts are from a law-firm case summary and trade press. His 2003 meeting and photos are his account ("says").
- **Thompson in Alabama (November 2005 revocation):** Wikipedia only, citing IGN.
- **Hot Coffee:** "unfinished", "switched off" and the 2005 modder are from Wikipedia; the FTC terms are from trade press quoting the FTC, because ftc.gov returned 404 to automated reads. The separate $20.1 million shareholder settlement is not mentioned.
- **Alabama:** the suit's dollar figure (commonly $600 million) was not found on any page read live and is not spoken.
- **re3 / reVC:** which federal district the suit was in was not verified; settlement terms are not public.
- **Leak defendant's age in September 2022:** not in the reports read; the brief describes him as a minor at the time, the script says only "teenager".

## Cases considered and left out
| Case | Why |
|---|---|
| "Florida Joker" | Reporting shows public demands and a threatened suit, later dropped for a request to voice the character. No filing found, so it is not a lawsuit. |
| Pinkerton v. Take-Two | Red Dead Redemption 2, outside this title. |
| GTA Online class action (dismissed 2014), the 2003 Tennessee suit, Take-Two v. cheat makers, OpenIV cease-and-desist | Seen in passing during research but not verified to the standard; candidates if the owner wants 12 cases. |

## Sensitivity handling
- **Leak defendant:** not named anywhere (script, title, thumbnail, description). Only BBC-reported facts. No "guilty" or "convicted"; the jury's finding of fact and the hospital order are stated plainly. His autism is mentioned once, because it is the reason for the legal outcome. Left out: reports of violence in custody, the ransom demand, and the younger co-defendant.
- **Alabama:** no re-enactment, no weapon on screen, no claim either way about games and violence; both sides' positions are given.
- **Lohan, Gravano, Washington, the club:** each plaintiff's claim is stated in their own terms before the ruling; no mockery. This is why "The Most Ridiculous Lawsuits in GTA History" was rejected.
- **Trademarks:** the video is commentary on court cases. Game and company names are spoken and appear as plain text only; no footage, logos, box art or character likenesses (VISUALS.md). The description carries a "not affiliated" line. Note that case 4 is Rockstar suing over an unofficial depiction of itself; keeping to generic visuals matters here.

## For the voice and render session
- "Lapsus" is spoken without the dollar sign. "R E Three" and "R E V C" are spelled out for the narrator. "Benzies" = "BEN-zeez", "Gravano" = "gruh-VAH-no", "Fayette" = "fay-ET" (best guesses, not verified).
- `script.json` carries `format` and `target_seconds`, which are outside `SCRIPT_SCHEMA`.
- Four voice tags only: [dramatic] and [curious] in the cold open, [serious] on cases 7 and 1.
