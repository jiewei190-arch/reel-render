# Sources: noisecancel (How do noise-cancelling headphones work?)
Researched Oct 28 2026. Primary (university acoustics): S. J. Elliott and P. A. Nelson, "Active noise control: low-frequency techniques for suppressing acoustic noise leaps forward with signal processing", IEEE Signal Processing Magazine, 1993, Institute of Sound and Vibration Research (ISVR), University of Southampton: http://resource.isvr.soton.ac.uk/staff/pubs/Ref%203%20IEEE%20review%201993.pdf
Secondary (manufacturer, used only for the everyday examples): Sennheiser support, "How does active noise cancellation work?" (best on repetitive low-frequency noise such as engines and air conditioning, less effective on voices).
Also consulted: NC State University, "Engineering Silence" (student engineering paper on ANC headphones).

| Claim (script) | Source |
|---|---|
| Sound is a wave of air pressure, squeezes and stretches | Elliott & Nelson (acoustic pressure waves); standard acoustics |
| Microphones on the earcups listen to the noise | Elliott & Nelson (detection microphone / reference sensor in ANC headsets); Sennheiser |
| A chip flips the wave upside down; the speaker plays the anti-noise | Elliott & Nelson: a secondary source driven to produce a wave of opposite phase |
| A squeeze meets a stretch, they cancel, the noise gets much quieter | Elliott & Nelson: destructive interference between primary and secondary waves |
| The chip has to keep up | Elliott & Nelson (the controller must respond within the delay of the acoustic path) |
| Easy for slow, steady sounds: plane engine drone, AC hum | **University source:** Elliott & Nelson (ISVR, Southampton): active control is effective at low frequencies, where wavelengths are long, and in practice is used on low, steady (tonal) noise such as engine and propeller noise. Secondary, manufacturer: Sennheiser (repetitive low-frequency noise like engines and AC) |
| Low hums have long waves, so a tiny delay barely matters | Elliott & Nelson: practical because acoustic wavelengths are long at low frequencies |
| High, sudden sounds (a voice, a bark) change too fast | Elliott & Nelson (performance falls at higher frequencies); Sennheiser: less effective for voices |
| The earcup padding does most of the blocking for those | Elliott & Nelson (passive attenuation of the headset shell is effective at high frequencies) |
| First patented in 1936 | Elliott & Nelson cite Paul Lueg's patent (US 2,043,416, granted 1936) as the origin of active noise control |

## Softened / careful wording
1. "Much quieter", not "silent".
2. "Thousands of times a second" for the chip's update rate (DSP sample rates are tens of thousands per second; "thousands" is a safe lower bound).
3. Voices "still get through" (reduced, not untouched); the fan test is a suggestion, results vary by headphone.
