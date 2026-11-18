# Sources and maths: interest-only

Stated example (on screen as EXAMPLE): **$20,000** borrowed at a made-up **8 % APR**, monthly payments, **5 years (60 months)**,
no fees.

| route | monthly | paid over 5 yrs | interest | still owed |
|---|---|---|---|---|
| interest only | 20,000 × 0.08/12 = **$133.33** ("about 133") | **$8,000.00** | $8,000.00 | **$20,000** |
| fully amortizing | **$405.53** ("about 406") | $24,331.67 | **$4,331.67** ("about 4,332") | **$0** |

```python
r, n, P = .08/12, 60, 20000
P*r                         # 133.33
pm = P*r/(1-(1+r)**-n)      # 405.53
pm*n - P                    # 4331.67
```

Sources:
- CFPB, What is an interest-only loan?: https://www.consumerfinance.gov/ask-cfpb/what-is-an-interest-only-loan-en-102/
  (with interest-only payments the amount you owe does not go down; when the interest-only period ends, payments rise or the balance is due)
- CFPB, What is amortization?: https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-en-102/

Hedges: a made-up rate and loan; real interest-only loans (often mortgages or HELOCs) switch to higher payments or a
balloon after the interest-only period. "Interest-only can mean" (not "always").
