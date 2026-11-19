# Sources and maths: wedding-or-keys (draft, for MAIN QA)

**Hypothetical example, not advice.** Costs vary a lot by city and couple; down payments vary by buyer and loan type.

- **"thirty-four thousand" / "about the average wedding":** The Knot 2026 Real Weddings Study (10,474 US couples married in 2025): average ceremony + reception **$34,200**, excluding the engagement ring. **Average cost per guest $292**, average guest count 117.
  https://www.theknot.com/content/average-wedding-cost
  - MAIN: theknot.com returned 403 to my cloud fetch; the figures above come from search excerpts of that page. Please open it once to confirm.
  - Cross-check: Zola's 2026 report puts the average at $36,000 (WTOP, Aug 2026; fetched directly), so "about thirty-four thousand" is, if anything, low.
    https://wtop.com/news/2026/08/this-is-how-much-the-average-wedding-costs/
- **"about two hundred ninety dollars" per guest:** The Knot, $292 per guest (same page).
- **"First-time buyers put down about nine percent":** NAR 2026 Profile of Home Buyers and Sellers: first-time buyer median down payment **9 %** (fetched directly).
  https://www.nar.realtor/newsroom/first-time-home-buyer-share-inches-up-to-22-median-age-remains-at-record-high-of-40
- **"a typical home":** NAR median existing-home price, October 2026: **$416,700** (fetched directly).
  https://www.nar.realtor/newsroom/existing-home-sales-decreased-5-5-percent-october-nar-report
- **"five-hour party":** an assumption for the example (spoken under "in this example"), not a statistic.

## Maths

```python
wedding  = 34_200
per_min  = wedding / (5 * 60)     # 114.0   -> "about a hundred fourteen dollars a minute"
down     = 0.09 * 416_700         # 37,503  -> "that's thirty-seven thousand"
share    = wedding / down         # 0.912   -> "ninety percent of a down payment"
gap      = down - wedding         # 3,303   (on screen: "$3,300 SHORT", not in the VO)
```
