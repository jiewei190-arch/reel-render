# Sources: faceid (how Face ID recognises you)

| Claim in the reel | Source |
|---|---|
| The TrueDepth camera projects and analyses thousands of invisible dots to create a depth map of your face, and also captures an infrared image | Apple Support, "About Face ID advanced technology" https://support.apple.com/102381 ; Apple Platform Security, "Face ID and Touch ID security" https://support.apple.com/guide/security/face-id-and-touch-id-security-sec067eb0c9e/web ("projects and reads thousands of infrared dots to form a depth map of the face") |
| A protected part of the neural engine inside the Secure Enclave turns the depth map and infrared image into a mathematical representation and compares it with the enrolled face data | Apple Support 102381; Apple Platform Security (above) |
| Face data stays on the device ("doesn't leave your device") | Apple Support 102381 |
| A photo can't fool it: Face ID always requires depth information, not found in print or 2D photos | Apple Support 102381 |
| Attention aware: checks your eyes are open and you are looking at the device | Apple Support 102381 |
| Adapts to changes (makeup, facial hair); a major change such as shaving a full beard requires the passcode before the data updates | Apple Support 102381 |
| Chance a random person unlocks it is less than 1 in 1,000,000 with a single enrolled appearance; higher for twins and siblings that look like you, and for children under 13 | Apple Support 102381 (also Apple's 2017 Face ID Security Guide) |
| Dots shift with depth (nose nearer than cheeks), which is how the depth map is built | Explanatory simplification of the structured-light idea behind "reads thousands of dots to form a depth map" in the Apple pages; Apple also notes the dot pattern is device-specific and random |

## Dropped / unverified
- "30,000 dots": appears in third-party explainers (e.g. Kaspersky) but Apple's own pages only say "thousands", so the reel says "thousands".
- Wavelength / frame-rate details from third-party sites: not used.
- The "1 in 1,000,000" visual is symbolic (a million-pixel field with one lit pixel); it makes no claim beyond Apple's "less than 1 in 1,000,000".
- The depth-map face and beard animation are illustrative, not real sensor data.
