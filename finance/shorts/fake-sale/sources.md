# Sources and maths: fake-sale (for MAIN QA)

**Hypothetical example (the jacket and its prices), not advice.** Results differ by retailer; Checkbook found a few chains ran legitimate discounts.

- "Consumer watchdogs tracked twenty-five big chains for six months": Consumers' Checkbook, "Sale Fail" (published 2025-11-03, updated Nov 2025): "Consumers' Checkbook's researchers spent six months tracking prices at 25 major retailers"; "Beginning in February 2025, once a week for 24 weeks". Checkbook is a nonprofit consumer group.
  - https://www.checkbook.org/national/sale-fail/
- "At nineteen of them, items were 'on sale' about seventy-six percent of the time": same page: "The other 19 retailers labeled their items "on sale" about 76 percent of the time, on average" (the 19 exclude Apple, Costco and Dell, which ran legitimate discounts, plus Walmart at 48 % and Target at 49 %). Also: "21 out of 25 advertised sale prices more than half the time".
- "was never a hundred dollars" / "It was just the price": Checkbook: "The store probably offers that price—or an even lower one—much of the time" and "the higher 'regular' prices are rarely, if ever, what customers actually pay."
  - Caveat from Checkbook's method: products were picked from items on sale and representative of each chain; "on sale" follows each retailer's own labels; only items available 5+ consecutive weeks are summarised. "Fake" is Checkbook's characterisation, not a legal finding.
- Context (description only): Harvard Business School, Donald Ngwe (Working Knowledge, 2018-08-20): at outlet stores of a major US clothing brand, "for every $1 increase in the posted 'original price' for an item, consumers were willing to pay, on average, an extra 77 cents for that item."
  - https://www.library.hbs.edu/working-knowledge/bargain-hunters-beware-a-store-s-original-price-might-not-be-after-all
- Coverage: Philadelphia Inquirer (2025-12-05): https://www.inquirer.com/consumer/holiday-shopping-tips-fake-sales-low-prices-20251205.html

## Maths
```
"was $100, now $60"  -> claimed saving = 100 - 60 = $40 (40 % off)   [example]
if $60 is the usual price, real saving = 60 - 60 = $0
on sale 76 % of weeks: 0.76 × 24 weeks ≈ 18 of 24 weekly checks showed a "sale"
both characters pay $60 for the same jacket
```
