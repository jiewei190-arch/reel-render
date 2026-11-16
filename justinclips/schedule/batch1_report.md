STATE: scheduled

# Justin clips: batch 1 + batch 2 scheduled in YouTube Studio (14 Shorts, Nov 16-20)

Done by Creator on the owner's PC, Nov 15 2026 ~20:45-21:35 ET, in the owner's signed-in Chrome. **The owner approved this directly in Creator's chat** (upload + SCHEDULE all 14; slots from the heat map if any). No password/2FA/verification prompt appeared. Nothing was published now, no comments were posted, no existing video or channel setting was touched.

## Channel check
- Studio opened on another of the owner's channels ("Zheng Wei"); I switched via the account menu to **Justin clips** (no sign-in needed) and checked the channel name before every upload.
- **Heat map** (Analytics > Audience > "When your viewers are on YouTube", last 28 days): **"Not enough data"**, so the manifest slots were kept: **11:00 / 15:00 / 19:00 America/New_York**. Studio's schedule time zone is the default local GMT-05:00 (= New York time in November).
- Audience, last 28 days: monthly audience 3.5K, +28 subs, 100% new viewers. Top geographies US 60.1%, Germany 5.2%, Philippines 4.4%, India 2.4%, UK 2.2%. Age 25-34 27.4%, 13-17 24.3%, 35-44 22.6%, 18-24 12.4%. Male 67.8%. Watch time by device: phone 54%, TV 23%, tablet 16%.

## Settings on every upload
Title and description exactly as in the manifest (compared by script right after entry; #1 and #10 re-read on their edit pages after scheduling). Audience: **No, it's not made for kids**. Altered or synthetic content: **Yes**. Category: **Education**. Visibility: **Schedule** (each confirmation read "Your video will be set to public on <date> at <time>"). Studio showed "We're still checking your content" (its copyright/policy checks were still running at upload); I acknowledged it and the schedule went through. **Re-check the Notices column in Studio before Nov 16 11:00 ET.**

## Scheduled
| n | slug | scheduled (ET) | link | pinned comment to add once live |
|---|---|---|---|---|
| 1 | jupiter-fall | 2026-11-16 11:00 | https://youtube.com/shorts/aztF-yexSds | Jupiter or Venus: worse place to fall? 🪐 |
| 2 | beard-tax | 2026-11-16 15:00 | https://youtube.com/shorts/YuEvsLzpylg | Beard or no beard? 🧔 |
| 3 | eiffel-sold-twice | 2026-11-16 19:00 | https://youtube.com/shorts/S_pWxldoin0 | Would you have bought it? Yes or no 🗼 |
| 4 | no-mosquitoes | 2026-11-17 11:00 | https://youtube.com/shorts/Ag8-k-pwKJo | Delete mosquitoes: yes or no? 🦟 |
| 5 | lightning-7-times | 2026-11-17 15:00 | https://youtube.com/shorts/j6U76GRJelc | Luckiest man alive or unluckiest: which is he? ⚡ |
| 6 | eleven-days | 2026-11-17 19:00 | https://youtube.com/shorts/piUp1_kPPkU | Would you want your 11 days back: yes or no? 📅 |
| 7 | acoustic-kitty | 2026-11-18 11:00 | https://youtube.com/shorts/lFd94caZFT0 | Spy cat or spy dog: who'd actually follow orders? 🐈🐕 |
| 8 | ocean-bottom | 2026-11-18 15:00 | https://youtube.com/shorts/tF2-Hd2k0oQ | Space or the deep ocean: which scares you more? 🌊 |
| 9 | bat-bomb | 2026-11-18 19:00 | https://youtube.com/shorts/tgtaJR7TnLY | Genius idea or total disaster? 🦇 |
| 10 | human-photosynthesis | 2026-11-19 11:00 | https://youtube.com/shorts/qeTWcCWoqhc | Green skin or lunch? 🌱🍔 |
| 11 | miss-unsinkable | 2026-11-19 15:00 | https://youtube.com/shorts/bp961xgW6SE | Would you have gotten on ship number three: yes or no? 🚢 |
| 12 | shortest-war | 2026-11-19 19:00 | https://youtube.com/shorts/wEjhqXqJpZA | 38 minutes: shorter or longer than your morning commute? ⏱️ |
| 13 | exploding-whale | 2026-11-20 11:00 | https://youtube.com/shorts/CcblqECGorc | 20 sticks or 20 cases? 🧨 |
| 14 | mike-headless-chicken | 2026-11-20 15:00 | https://youtube.com/shorts/nfE_g4EJJ8g | Legend or lucky? 🐔 |

Studio list screenshot: `justinclips/schedule/batch1_studio_scheduled.jpg` (shows the newest 7; the full list was read by script: all 14 "Scheduled", Nov 16-20, no extra drafts).

## File integrity
All 14 `video.mp4` files matched their `.sha256` exactly (fetched from each branch with `git show`). The browser upload tool caps a file at ~10.4 MB, so the **10 files over that were re-encoded** before upload: libx264 two-pass at ~2.7-3.6 Mbps (~9.9 MB), same 1080x1920, same frames and length, audio stream copied untouched. YouTube re-encodes every upload anyway. The other 4 were uploaded byte-identical to the verified originals.

| n | slug | verified original sha256 | uploaded file |
|---|---|---|---|
| 1 | jupiter-fall | `5ed8a06cb0b720e4...` | re-encoded, 9.95 MB, sha256 `7e6b1fcda8b1049f...` |
| 2 | beard-tax | `b27d6eea115dd69a...` | re-encoded, 9.89 MB, sha256 `b44d12bc3c48edc3...` |
| 3 | eiffel-sold-twice | `e0ded1e4a2008c5d...` | re-encoded, 9.70 MB, sha256 `8725a9b9bad2bf9f...` |
| 4 | no-mosquitoes | `1739c910fee615ed...` | re-encoded, 9.94 MB, sha256 `7e2c860f39e8d153...` |
| 5 | lightning-7-times | `f3d6458d1ca72657...` | original (identical) |
| 6 | eleven-days | `e05ca250c5192ebe...` | re-encoded, 10.00 MB, sha256 `fa0d155b8c726f09...` |
| 7 | acoustic-kitty | `79ba63dd36ce3fa4...` | re-encoded, 9.86 MB, sha256 `4a070932eaa2d5dd...` |
| 8 | ocean-bottom | `9606a8de761a8648...` | original (identical) |
| 9 | bat-bomb | `006689530f3f0c2c...` | re-encoded, 9.78 MB, sha256 `4033b16be0dabb3e...` |
| 10 | human-photosynthesis | `230a93ce79ebbefc...` | original (identical) |
| 11 | miss-unsinkable | `3f53a7c05da687db...` | re-encoded, 9.90 MB, sha256 `b47bf5d589ebb526...` |
| 12 | shortest-war | `2c62fddd4230612b...` | original (identical) |
| 13 | exploding-whale | `928d0b9963419bb0...` | re-encoded, 9.89 MB, sha256 `a17081c140cbe22f...` |
| 14 | mike-headless-chicken | `db0426be4c953b1e...` | re-encoded, 9.90 MB, sha256 `6eaa75b00d0b5ebd...` |

## Held, not scheduled (as instructed)
coca-cola-cocaine-v2, immortal-jellyfish-v2, cat-mayor-v2, napoleon-rabbits-v2: not uploaded.

## Shorts already PUBLIC on Justin clips (read-only, Studio > Content > Shorts, Nov 15 ~20:50 ET)
Stayed-to-watch % not opened yet (the full channel scan is next). Views and comments from the list:

| published | title | length | views | comments |
|---|---|---|---|---|
| Nov 15 | United States once had a emperor you never heard of | 0:41 | 121 | 0 |
| Nov 15 | Can you pick up this spoon? | 0:27 | 932 | 0 |
| Nov 15 | Sharks were one of the oldest living creatures on earth. | 0:36 | 1,543 | 2 |
| Nov 14 | Did you know Coca Cola actually had cocaines in it before? 😱 | 0:41 | 1,440 | 4 |
| Nov 14 | The flood that no one talked about… | 0:48 | 1,328 | 3 |
| Nov 13 | Is this the downfall of Nvidia? | 0:38 | 1,266 | 0 |
| Nov 13 | Switzerland Made Owning One Guinea Pig Illegal 🐹 | 0:42 | 1,475 | 0 |
| Nov 13 | Crows Hated This Mask for 17 Years (Real Study) 🐦 | 0:42 | 1,474 | 0 |
| Nov 12 | A Newspaper Said Bat-People Lived on the Moon 🦇 | 0:47 | 1,362 | 0 |
| Nov 11 | You probably didn’t see this coming from a mile away! | 0:44 | 1,257 | 0 |
| Nov 11 | How pope Stephen VI won the trial! | 0:36 | 1,445 | 0 |
| Nov 10 | Kangaroo wasn’t Australias only enemy! | 1:01 | 1,329 | 0 |
| Nov 9 | Falling directly down the Earth isn't what you think it is. | 0:30 | 2,661 | 0 |
| Nov 9 | Dancing plague in the 1518 was one of the deadlist virus that happened. | 0:35 | 1,470 | 0 |
| Nov 8 | Mistakes everyone makes during a zombie apocalypse #stickman #shorts #animation | 1:06 | 1,312 | 5 |
| Nov 3 | Gills Would Be a Terrible Superpower 😂 #whatif #science #shorts | 0:17 | 2,714 | 0 |
| Oct 30 | Why One Flash Would Blind You 💥 #whatif #animation #shorts #stickman | 0:39 | 13 | 0 |
| Oct 30 | Heat Vision Has One Big Problem 😂#whatif #physics #science #shorts | 0:20 | 352 | 0 |

None of the 14 scheduled titles was already public. "Did you know Coca Cola actually had cocaines in it before?" IS public (Nov 14), so coca-cola-cocaine-v2 would repeat that topic. No jellyfish, cat-mayor or Napoleon-rabbits Short is in the public Shorts list.

