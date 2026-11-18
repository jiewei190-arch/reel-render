# Sources: barcode (how a barcode is read)

| Claim in the reel | Source |
|---|---|
| A barcode generally does not hold the price or name; it encodes a number that identifies the item, and price/description are looked up in a database (exceptions exist: variable-measure items, coupons) | GS1 support, "Are the description and price of the item included in the barcode?" https://support.gs1.org/support/solutions/articles/43000734158-are-the-description-and-price-of-the-item-included-in-the-barcode- |
| UPC-A is a 12-digit code; layout is start guard, six left digits, middle guard, six right digits, end guard; first digit selects a number system, last is the check digit | Wikipedia, "Universal Product Code" https://en.wikipedia.org/wiki/Universal_Product_Code (cites GS1 US barcode chart) |
| Each digit is 7 modules (thin slices) of bar/space; each digit pattern is two bars and two spaces of varying width | Wikipedia UPC article; Aspose UPC-A info card https://docs.aspose.com/barcode/info-cards/upc-a/ ; HALCON barcode documentation https://docs.mvtec.com/ |
| Right-half patterns are the optical inverse (dark/light swapped) of the left-half patterns; left digits use odd parity and right even parity so a scanner can tell a forward from an upside-down read | Wikipedia UPC article |
| Laser scanner sweeps a beam; dark bars absorb light, white spaces reflect it; a photodiode turns reflected intensity into an electrical signal that is decoded into bar/space widths | Scanbot, "How does a laser barcode scanner work?" https://scanbot.io/blog/how-does-a-laser-barcode-scanner-work/ ; Triton "How do laser barcode scanners work?" https://tritonstore.com.au/how-do-barcode-scanners-work/ |
| Check digit: (3 x sum of odd-position digits + sum of even-position digits + check digit) is a multiple of 10; example 03600029145 -> 14 x 3 = 42, 42 + 16 = 58, check digit 2 (total 60) | Wikipedia UPC article. If the check digit does not match, the scanner reports an error and the code is re-scanned (Scanbot, "How do barcodes work?" https://scanbot.io/blog/how-do-barcodes-work/) |
| First UPC-marked item scanned at retail: a 10-pack of Wrigley's Juicy Fruit, 26 June 1974, Marsh supermarket, Troy, Ohio | Wikipedia UPC article (cites Smithsonian "The History of the Bar Code", Wired 2008, Harvard Magazine 2005); Food Republic / Checkout.ie / Takeout reports agree |

## Dropped / unverified
- The red colour of the laser is a visual choice only; the script does not claim scanners use red light.
- The time of the first scan differs between sources (8:01 vs 8:06 a.m.) so no time is stated.
- Whether the actual gum pack is held by the Smithsonian is disputed between sources (Wikipedia says a facsimile is displayed); not claimed.
- The "$2.49 EXAMPLE ITEM" lookup row is a labelled illustration, not a real product record.
- "Smudge caught instead of wrong item" is the purpose of check digits in general; the scanner-error behaviour is from the Scanbot article.
