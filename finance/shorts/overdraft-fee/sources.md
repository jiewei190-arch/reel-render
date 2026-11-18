# Sources and maths: overdraft-fee

All figures are from the CFPB's 2014 overdraft study (large banks it supervises; data from 2011–2012). Fees and policies
differ by bank and have changed since; the Short says "in a C.F.P.B. study" and the on-screen tag says CFPB 2014 DATA.

| claim (VO) | source figure | maths |
|---|---|---|
| "the typical debit overdraft was just 24 dollars" | "In the case of debit card transactions, the median amount that leads to an overdraft fee is $24" | median = typical |
| "The typical fee? 34 dollars." | "The median overdraft fee at the banks studied was $34." | |
| "Swipe 24 dollars, pay 58." | the two medians above | $24 + $34 = $58 |
| "more than half were paid back within three days" | "More than half of all episodes last three days or fewer, and 76.1 percent last a week or less." | |
| "That's an A.P.R. of about 17,000 percent." | "If a consumer were to borrow $24 for three days and pay a $34 finance charge, such a loan would carry a 17,000 percent APR." | 34/24 = 141.7 % per 3 days × 365/3 = 17,236 % (simple APR) → "about 17,000" / HUD ≈17,000% |
| "By law, debit overdraft coverage is opt-in." | Regulation E (12 CFR 1005.17): no overdraft fees on ATM and one-time debit card transactions unless the consumer has opted in; checks and automatic payments are not covered by the opt-in | |

```python
34 / 24 * 365 / 3 * 100   # 17236.1  (% APR)
```

Sources:
- CFPB press release, "CFPB Finds Small Debit Purchases Lead to Expensive Overdraft Charges" (Jul 31, 2014):
  https://www.consumerfinance.gov/about-us/newsroom/cfpb-finds-small-debit-purchases-lead-to-expensive-overdraft-charges/
- CFPB Data Point: Checking account overdraft (July 2014): https://files.consumerfinance.gov/f/201407_cfpb_report_data-point_overdrafts.pdf
- CFPB, Understanding the overdraft "opt-in" choice: https://www.consumerfinance.gov/about-us/blog/understanding-overdraft-opt-choice/
- Regulation E § 1005.17: https://www.consumerfinance.gov/rules-policy/regulations/1005/17/

Hedges: medians from one study and period, not today's fee at any given bank; "loan" is the CFPB's own comparison.
