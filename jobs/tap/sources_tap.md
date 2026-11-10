# Sources: tap ("How tap-to-pay works without touching anything")

| Claim in the reel | Source |
|---|---|
| NFC runs at 13.56 MHz and uses inductive coupling between two nearby loop antennas (an air-core transformer) | Wikipedia, "Near-field communication" https://en.wikipedia.org/wiki/Near-field_communication |
| A passive target (such as a card or tag) can draw its operating power from the reader's field, so it needs no battery | Wikipedia, "Near-field communication" |
| Working range about 4 cm or less, rarely/never beyond about 10 cm; the signal weakens quickly with distance | Wikipedia, "Near-field communication" and "Contactless payment" https://en.wikipedia.org/wiki/Contactless_payment |
| The card's chip authenticates the issuer's details with the terminal under the EMV standard; the payment succeeds only if the check passes | Wikipedia, "Contactless payment" |
| Each EMV chip transaction includes a one-time cryptogram/security code that cannot be reused, which defeats replaying a recorded code | EMVCo (emvco.com) description of the chip cryptogram; explanation of replay protection in secondary EMV explainers |
| Phone wallets send a device-specific stand-in number plus a dynamic security code, not your real card number | Apple, "Apple Pay security and privacy overview" https://support.apple.com/101554 ; Wikipedia, "Contactless payment" (tokenization) |
| Contactless purchases above a Cardholder Verification limit need a PIN/biometric; the limit varies by country and bank | Wikipedia, "Contactless payment" |
| Contactless uses the same chip-and-PIN network and the same fraud protections as older cards | Wikipedia, "Contactless payment" |

## Dropped / unverified
- No specific payment limits quoted (they differ by country and change; the Wikipedia article's UK figures were in flux). **Dropped.** The reel only says the limit depends on country and bank.
- The example hex codes on screen are labelled "(example codes)"; they are not real.
- Not claimed: that physical cards never send the card number. Only phone wallets are said to send a stand-in number.
- Relay attacks are not prevented by one-time codes (noted by the sources); the reel does not say contactless is unhackable, only that a recorded code can't be replayed.
- 4 cm vs "never more than about 10 cm": Wikipedia gives both figures; the reel says "about four centimeters or less".
