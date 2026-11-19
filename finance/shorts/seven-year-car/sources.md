# Sources and maths: seven-year-car (MAIN-written; BLEEP STYLE TEST)

**Hypothetical example, not advice.** 9 % APR and the $35,000 price are illustrative assumptions; real rates depend on credit, lender, new vs used. No lender or brand named.

- Loan maths: standard amortisation (monthly payment = P·r / (1 − (1+r)^−n)). Check with any loan calculator, e.g. CFPB auto loan resources: https://www.consumerfinance.gov/consumer-tools/auto-loans/

## Maths
```python
P=35000; r=0.09/12
pay = lambda n: P*r/(1-(1+r)**-n)
pay(48)  # 870.98  -> Saver, 4 years
pay(84)  # 563.12  -> "only five sixty-three a month"
pay(48)*48-P  # 6,807  -> "about sixty-eight hundred"
pay(84)*84-P  # 12,302 -> "over twelve thousand" / hook "twelve thousand dollars in interest"
# balance on the 84-mo loan after 48 payments = 17,708 -> "almost eighteen thousand"
12302/6807 = 1.81 -> "almost double"
```

## Bleep
Line 4 is voiced as "Are you freaking kidding me?"; "freaking" is replaced by a 1 kHz tone 16.24-16.78 s (voice.orig.wav is the clean take). No real profanity is spoken anywhere. STYLE_LOG style = "S7 bleep gag".
