# Sources and maths: same-car-more

Stated example (on screen as EXAMPLE): borrow **$30,000** at **7 % APR** (an illustrative rate), fixed monthly payments,
no fees, no down payment, no trade-in. Payment = P·i / (1 − (1+i)^−n), i = 0.07/12.

| term | monthly payment | total interest | VO |
|---|---|---|---|
| 36 months (3 years) | **$926.31** | **$3,347.26** | "about 926 a month, and 3,347 in interest" |
| 60 months | $594.04 | $5,642.16 | (not said) |
| 84 months (7 years) | **$452.78** | **$8,033.55** | "just 453 a month", "about 8,034 dollars" |

Difference: 8,033.55 − 3,347.26 = **$4,686.29** → "4,700 dollars more" (rounded; on screen ≈ $4,686).

```python
pay = lambda P, r, n: P * (r/12) / (1 - (1 + r/12)**-n)
[(n, round(pay(30000, .07, n), 2), round(pay(30000, .07, n) * n - 30000, 2)) for n in (36, 84)]
```

Sources:
- CFPB, "How do I compare auto loan offers?": a longer term lowers the monthly payment but increases the total
  interest (their own sample: $20,000 at 4.75 %, 3 years $1,498 interest vs 6 years $3,024).
  https://www.consumerfinance.gov/ask-cfpb/how-do-i-compare-auto-loan-offers-en-753/
- CFPB, "Know Before You Owe: auto loans" shopping sheet announcement (archived newsroom page): "Consumers should know
  that if they lower the monthly payment by taking out a longer loan, they are paying more in interest." (the VO:
  "The C.F.P.B. agrees: a longer loan means more interest").
  https://www.consumerfinance.gov/about-us/newsroom/consumer-financial-protection-bureau-unveils-new-know-you-owe-auto-loans-shopping-sheet
- Context for the example rate: Federal Reserve G.19 publishes auto loan rates (new-car loan rates in the 6–8 % range
  in recent releases). https://www.federalreserve.gov/releases/g19/current/default.htm

Hedges: 7 % is "an example rate"; real offers differ (credit, lender, new/used, fees). No lender or car brand shown.
