# tech-demo-planes-land-blind: fact check (DEMO for the tech3d kit, synthetic timings, no voice yet)

| Claim in script.txt | Check |
|---|---|
| ILS guides planes when pilots can't see the runway | The Instrument Landing System is a ground-based radio aid for precision approaches in low visibility (FAA Aeronautical Information Manual 1-1-9; FAA Instrument Flying Handbook, ch. 9). |
| "An antenna past the far end sends a radio beam down the centre line. That's the localizer." | The localizer array sits beyond the departure (far) end of the runway and gives left/right guidance aligned with the runway centreline (AIM 1-1-9). |
| "Another antenna beside the runway sends a beam sloping up at three degrees. The glideslope." | The glideslope transmitter stands beside the runway near the touchdown zone; the standard glide path is 3 degrees (AIM 1-1-9). |
| "Each beam is two signals. When both are equally strong, you're right on the path." | Both the localizer and the glideslope radiate two overlapping lobes modulated at 90 Hz and 150 Hz; the receiver centres the needle where the two are equal in depth of modulation (simplified to "equally strong"). |
| "Antennas in the nose catch both beams" | On airliners the localizer/glideslope antennas are usually in the nose radome; large jets add a glideslope antenna on or near the nose gear doors for the final approach. Sources: [L3Harris N9 localizer/VOR/glideslope antenna](https://l3harris.com/all-capabilities/n9-series-localizer-vor-glide-slope-antenna), [Lockheed patent US5121128 (glide-slope aerials sited in the radome)](https://patents.google.com/patent/US5121128), [Avionics News, July 2023](https://nxtbook.com/allen/avne/60-7/index.php?startid=49), [US6047925 (777 nose gear door glideslope antenna)](https://patentimages.storage.googleapis.com/4e/86/29/ef853863ee3526/US6047925.pdf). |
| "the autopilot follows them down" | A coupled approach: the autopilot flies the localizer and glideslope deviation signals. |
| "In the thickest fog, it can even land the plane while pilots watch." | Autoland, used for Category III approaches: the autopilot flies the approach, flare and touchdown while the crew monitors and can take over. Requires a certified aircraft, crew and runway. |

The cutaway is a stylised low-poly airliner: the ILS antenna is drawn as one mint block inside the nose cone. The glideslope beam is drawn at the true 3 degrees. Scale and the plane's speed are stylised.
