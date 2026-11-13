# Sources: gps (How does your phone's GPS know where you are?)
Researched Oct 28 2026.
- GPS.gov (US government), "Space Segment" (archived page): https://archive.gps.gov/systems/gps/space/ (the live gps.gov page 404s to the fetcher; same text)
- Richard W. Pogge, Ohio State University Department of Astronomy, "GPS and Relativity" (Real-World Relativity: The GPS Navigation System): https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html

| Claim (script) | Source |
|---|---|
| About thirty GPS satellites | GPS.gov: "the U.S. Space Force has been flying 31 operational GPS satellites for well over a decade" (at least 24 committed) |
| Twice a day, twenty thousand kilometres up | GPS.gov: "altitude of approximately 20,200 km"; "Each satellite circles the Earth twice a day." |
| Each broadcasts where it is and what time it is | Pogge: receivers use "the time signals it receives from the currently visible GPS satellites" and the satellites' orbital data |
| The delay tells the phone how far away the satellite is; spheres → circle → points → one point (trilateration) | Pogge: the receiver compares signal timing and "trilaterates" on the satellites' known positions |
| A fourth satellite fixes the phone's clock | Pogge: "at least 4 satellites are always visible"; GPS.gov: users "can view at least four satellites from virtually any point on the planet" (the fourth solves for the receiver's clock: standard GPS geometry) |
| Each satellite carries an atomic clock | Pogge: "Each satellite carries with it an atomic clock" |
| Moving fast: clocks run slow by about 7 µs a day | Pogge: "should fall behind clocks on the ground by about 7 microseconds per day" |
| Weaker gravity: clocks run fast by about 45 µs a day | Pogge: "should get ahead of ground-based clocks by 45 microseconds per day" |
| Net: about 38 µs a day | Pogge: "should tick faster than identical clocks on the ground by about 38 microseconds per day" |
| Uncorrected: about 10 km a day of drift | Pogge: "errors in global positions would continue to accumulate at a rate of about 10 kilometers each day" |

## Softened / careful wording
1. "About thirty" for 31 operational (the count changes; at least 24 are committed).
2. "≈ 0.07 s" on screen is arithmetic (20,200 km ÷ the speed of light), not a quoted figure; the voice says "a tiny moment".
3. "Your position would drift" (Pogge: errors in global positions accumulate).
