# Sources and maths: atm-fee-twenty (for MAIN QA)

**Hypothetical example, not advice.** Fees differ by bank, ATM and city; about 39 % of the surveyed accounts charged no out-of-network fee of their own, and some banks refund ATM fees.

- **"$4.86 on average":** Bankrate 2025 Checking Account and ATM Fee Study (fielded June 2 - July 3, 2025; 10 banks and thrifts in each of 25 large US markets): the average total cost of an out-of-network ATM withdrawal is **$4.86** (record high, 3rd year running) = **$3.22** operator surcharge + **$1.64** fee from your own bank. Range by metro: $4.37 (Boston) to $5.37 (Atlanta).
  - https://www.bankrate.com/banking/checking/checking-account-survey/
  - https://www.bankrate.com/press-releases/atm-fees-hit-record-high-for-third-consecutive-year/
- **"The bank's own machine" costs $0:** in-network withdrawals at your own bank's ATMs are typically free (Bankrate, How much are ATM fees?): https://www.bankrate.com/banking/how-much-are-atm-fees/
- **"Twice a week":** an illustrative assumption for this example only (not a statistic).

## Maths
```
fee per out-of-network withdrawal  = $3.22 + $1.64 = $4.86          (Bankrate 2025 average)
share of a $20 withdrawal          = 4.86 / 20 = 0.243 = 24.3 %     -> "about a quarter of the cash"
per week (2 withdrawals)           = 2 x 4.86  = $9.72              -> on-screen "$9.72/WK"
per year                           = 104 x 4.86 = $505.44           -> "over five hundred dollars a year", on-screen $505
Saver (own bank's ATM, in network) = $0
```
