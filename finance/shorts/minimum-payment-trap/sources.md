# Sources and maths: minimum-payment-trap (FORMAT v1 story)

The story VO (finance/FORMAT_V1.md) keeps F1's verified example; only the telling changed. Line-by-line:

| VO line | figure | where it comes from |
|---|---|---|
| "He'll be paying for it for nineteen years." | 230 months = 19.2 years | the simulation below (minimum = interest + 1 %, $25 floor) |
| "Five thousand dollars, on a card at twenty-two percent." | $5,000, 22 % APR | stated example; 22 % ≈ the Fed G.19 average (22.36 %) |
| "He pays only the minimum." / on screen "MINIMUM DUE $142" | first minimum $141.67 | 5,000 × 0.22/12 = $91.67 interest + $50.00 (1 %) |
| "Most of it is interest, so the money he owes barely moves." / "OWE $4,950" | $91.67 of $141.67 (65 %) is interest; the balance drops $50 | first month of the simulation |
| "Nineteen years later, he's paid over eight thousand dollars extra." / "+$8,100 EXTRA" | $8,099.71 interest | simulation (rounded to $8,100 on screen, "over eight thousand" in the VO) |
| "Pay two hundred a month instead? Done in under three years." | 34 months = 2.8 years, $1,749.90 interest | simulation, flat $200 |
| "So if you only pay the minimum, you end up like Spender." | | hedge: one stated example; your statement's minimum payment warning shows your own payoff time |

Hook text on frame 0: "19 YEARS TO PAY OFF A TV" (the same example). EXAMPLE is shown in the corner from the price
tag to the payoff.

## F1 details (unchanged)

## The stated example (shown on screen as "EXAMPLE")
- Balance **$5,000**, APR **22%** (monthly rate 22% / 12 = 1.8333%), no new purchases, no fees.
- Minimum payment = **that month's interest + 1% of the balance**, with a **$25 floor** (a common issuer formula; real
  formulas differ by card and are set in the card agreement).
- Interest each month = balance × 0.22 / 12, rounded to the cent; the payment comes off after interest is added.

Simulation (Python, in this file's appendix) gives:

| strategy | months | years | total paid | interest paid |
|---|---|---|---|---|
| minimum only (1% + interest, $25 floor) | 230 | **19.2** | $13,099.71 | **$8,099.71** |
| flat $200 a month | 34 | **2.8** | $6,749.90 | $1,749.90 |

So the VO's "about nineteen years", "over eight thousand in interest" and "under three years" hold for this example.
First month check: interest = 5,000 × 0.018333 = $91.67; minimum = 91.67 + 50.00 = $141.67, of which only $50 cuts the
balance. As the balance falls, the minimum falls with it, which is why the payoff crawls.

## Sources
- **APR ≈ 22% ("near the U.S. average")**: Federal Reserve, Consumer Credit G.19 (release of Nov 6, 2026), "Interest
  rate on credit card plans, accounts assessed interest": 22.36% in the latest quarter shown; recent quarters 21.5–22.9%.
  https://www.federalreserve.gov/releases/g19/current/default.htm
- **"It can take years, even decades"** to pay off a balance with minimums: CFPB, *Understanding minimum payments*
  (Building Blocks teacher guide). https://files.consumerfinance.gov/f/documents/cfpb_building_block_activities_understanding-minimum-payments_guide.pdf
- **"Your statement has a minimum payment warning"**: card statements must show how long payoff takes with minimum
  payments only and the "Minimum Payment Warning" (Regulation Z §1026.7(b)(12), from the CARD Act).
  CFPB, Regulation Z §1026.7 Periodic statement: https://www.consumerfinance.gov/rules-policy/regulations/1026/7/
  CFPB, Appendix M1 to Part 1026, Repayment disclosures (how issuers calculate the estimate): https://www.consumerfinance.gov/rules-policy/regulations/1026/m1/
  CFPB Ask: the statement box with the 3-year payment: https://www.consumerfinance.gov/ask-cfpb/a-box-on-my-credit-card-bill-says-that-i-will-pay-off-the-balance-in-three-years-if-i-pay-a-certain-amount-what-does-that-mean-do-i-have-to-pay-that-much-if-i-pay-that-much-and-make-new-purchases-will-i-still-owe-nothing-after-three-years-en-36/

## Hedges
- "Your minimum payment can take nineteen years": "can", because it is one stated example (given in the next line); your own statement's warning box gives your real figure.
- Not advice on which card or lender to use; no brands on screen.

## Appendix: the simulation
```python
def sim(bal, apr, fixed=None, floor=25.0):
    m = paid = 0; i = apr / 12
    while bal > 0.005:
        intr = round(bal * i, 2)
        p = fixed if fixed else max(floor, round(bal * 0.01 + intr, 2))
        p = min(p, bal + intr); bal = bal + intr - p; paid += p; m += 1
    return m, paid
sim(5000, 0.22)        # (230, 13099.71)
sim(5000, 0.22, 200)   # (34, 6749.90)
```
