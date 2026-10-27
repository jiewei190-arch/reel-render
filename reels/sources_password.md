# Sources: password (How a password gets stored safely)

Pages actually fetched with WebFetch:
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html (OWASP)
- https://en.wikipedia.org/wiki/Salt_(cryptography) (Wikipedia)
- https://github.com/usnistgov/800-63-3/blob/nist-pages/sp800-63b/sec5_authenticators.md (NIST SP 800-63B, section 5.1.1.2, from NIST's own repository)

| Claim in script | URL of fetched page |
|---|---|
| Passwords should never be stored in plain text; use adaptive hashes such as Argon2id, bcrypt, or PBKDF2 rather than encryption or plaintext | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| Encryption is two-way; hashing is one-way, and it is impossible to decrypt a hash to get the original value | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| An attacker who has the hashed password cannot use it to log in as the victim | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| A salt is a unique, randomly generated string added to each password as part of hashing | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html ; https://en.wikipedia.org/wiki/Salt_(cryptography) |
| A unique salt prevents attackers from using precomputed lookup tables (rainbow tables) | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html ; https://en.wikipedia.org/wiki/Salt_(cryptography) (precomputed tables for unique salts "not viable") |
| The salt is stored alongside the hash | https://en.wikipedia.org/wiki/Salt_(cryptography) ; NIST 800-63B 5.1.1.2 ("Both the salt value and the resulting hash SHALL be stored") |
| At login, the system combines the stored salt with the entered password, hashes the result, and compares it to the stored hash | https://en.wikipedia.org/wiki/Salt_(cryptography) |
| Memorized secrets are salted and hashed with a one-way key derivation function, and stored in a form resistant to offline attacks | https://github.com/usnistgov/800-63-3/blob/nist-pages/sp800-63b/sec5_authenticators.md |
| Good hashes should be slow; MD5 and SHA-1 were designed to be fast | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| Slow, memory-hard hashing makes brute-force attacks more difficult, expensive, and time-consuming | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| The work factor is the number of hashing iterations performed for each password | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| Modern algorithm examples: Argon2id, bcrypt, PBKDF2 | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |

## Dropped or unverified

- "Good sites never store your password as plain text" turns OWASP's "should never" into a present-tense claim about good sites. Treated as normative guidance.
- "Good hashes are supposed to be slow" is OWASP's "should be slow," softened to "supposed to be."
- NIST's numeric minimums (salt of at least 32 bits, at least 10,000 PBKDF2 iterations) were read and left out. They are not useful to a beginner and are not repeated in the script.
- The login-check sentence rests on Wikipedia. OWASP's fetched text only says the entered password "should be re-hashed" at login and does not describe the comparison step.
- The Clemson University PDF on Linux authentication was not fetched (robots disallowed).
- "Billions of guesses" was not in any fetched text and is not used.
- The smoothie and lookup-table analogies are analogies, not claims.

## Re-check (Oct 27, 2026, re-fetched)

- OWASP Password Storage Cheat Sheet re-fetched: confirms "Passwords should never be stored in plain text", one-way hashing, "Even if an attacker obtains the hashed password, they cannot use it to log in as the victim", salt definition, rainbow-table protection, "they should be slow (unlike ... MD5 and SHA-1)", work factor = iterations per password.
- Change: OWASP now names Argon2id as the primary recommendation and treats bcrypt as legacy, so the line "Modern choices include Argon2id and bcrypt" became "The top pick today is Argon2id, built to be slow on purpose."
- Wikipedia "Salt (cryptography)" re-fetched: salt and hash stored together; login appends the user's salt and compares the resulting hash; precomputed tables "not viable" with unique salts.
