# Sources and maths: mortgage-year-ten (draft, for MAIN QA)

**Hypothetical example, not advice.** Real loans differ by rate, fees, taxes, insurance and down payment. The example covers principal and interest only.

- **"about seven percent" (30-year) and Saver's 15-year rate:** Freddie Mac Primary Mortgage Market Survey, week of 2026-11-12: 30-year fixed **7.11 %**, 15-year fixed **6.45 %**. (I fetched this page directly.)
  https://www.freddiemac.com/pmms
- **"$400,000" loan size:** a round number just under the NAR median existing-home price in October 2026, **$416,700**. (I fetched this page directly.)
  https://www.nar.realtor/newsroom/existing-home-sales-decreased-5-5-percent-october-nar-report
- How fixed-rate amortisation works (early payments are mostly interest): CFPB, "What is amortization and how could it affect my loan?"
  https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-loan-en-1959/

## Maths (standard fixed-rate amortisation, monthly compounding)

```python
def pay(P, r, n):          # monthly payment
    i = r / 12
    return P * i / (1 - (1 + i) ** -n)
def bal(P, r, n, k):       # balance after k payments
    i = r / 12; m = pay(P, r, n)
    return P * (1 + i) ** k - m * ((1 + i) ** k - 1) / i

P = 400_000
# Spender: 30 years at 7.11 %
pay(P, .0711, 360)               # 2,690.83   -> "about twenty-seven hundred dollars"
P * .0711 / 12                   # 2,370.00 interest in payment 1
2690.83 - 2370.00                # 320.83     -> "only three hundred twenty pays off the house"
2690.83 * 120                    # 322,899    -> "paid three hundred twenty-three thousand" (10 years)
bal(P, .0711, 360, 120)          # 344,133    -> "still owes three hundred forty-four thousand"
2690.83 * 360                    # 968,697    -> "almost a million dollars" (interest 568,697)
# Saver: 15 years at 6.45 %
pay(P, .0645, 180)               # 3,473.44   -> "paid more monthly" (+782.61 a month)
bal(P, .0645, 180, 120)          # 177,736    -> "owes under half" (< 200,000)
3473.44 * 180                    # 625,220    (interest 225,220; on screen only, not in the VO)
```

Note for MAIN: the 15-year payment is about $783 a month higher; the description says so, so the comparison is fair and isn't a recommendation.
