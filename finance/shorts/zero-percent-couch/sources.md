# Sources and maths: zero-percent-couch (for MAIN QA)

**Hypothetical example, not advice.** This is a *deferred-interest* promotion ("no interest if paid in full"), not a true 0 % APR offer. Terms, APRs and how payments are applied vary by card.

- **How deferred interest works (interest charged back to the purchase date if any promo balance is left):** CFPB, *How to understand special promotional financing offers on credit cards*: a $400 TV, $25 a month for 12 months, $100 left → with deferred interest you owe $165 ($100 + $65 interest); with a true zero-interest promotion you owe $100.
  https://www.consumerfinance.gov/about-us/blog/how-understand-special-promotional-financing-offers-credit-cards/
  CFPB (2017), letters urging retail card issuers to move to true 0 % promotions; warns of "high, retroactive interest charges".
  https://www.consumerfinance.gov/about-us/newsroom/consumer-financial-protection-bureau-encourages-retail-credit-card-companies-consider-more-transparent-promotions/
- **"about thirty percent":** CFPB, *The High Cost of Retail Credit Cards* (Dec 2024): private-label cards at the top retailers averaged a 32.66 % APR; 90 % of retail cards have a max APR above 30 %. CFPB *Consumer Credit Card Market Report* (Dec 2025): the 2024 average APR for private-label cards was 31.3 %.
  https://www.consumerfinance.gov/data-research/research-reports/issue-spotlight-the-high-cost-of-retail-credit-cards/
  https://files.consumerfinance.gov/f/documents/cfpb_consumer-credit-card-market-report_2025-12.pdf
- **Context (not in the VO):** CFPB data cited by Bankrate: only about 80 % of deferred-interest card balances were paid in full before the promo ended (2020). https://www.bankrate.com/credit-cards/zero-interest/deferred-interest-promotion-dangers/

## Maths (monthly accrual on the declining balance, payment at each month end)
```python
for apr in (0.30, 0.313, 0.3266):
    b, i = 1200, 0
    for m in range(12):
        i += b * apr / 12   # interest accrues (deferred) on the balance that month
        b -= 95             # Spender pays $95
    print(apr, round(i, 2), b)
# 0.30   -> 203.25 interest, 60 left
# 0.313  -> 212.06
# 0.3266 -> 221.27
```
- Spender: 12 × $95 = $1,140 paid, $60 short → about $200 of deferred interest is charged back (≈ $203 at 30 %). "Sixty dollar gap just cost about two hundred dollars in interest."
- Spender's total ≈ 1,140 + 60 + 203 = $1,403 (end board "TOTAL ~$1,400"). Saver: 12 × $100 = $1,200, $0 interest.
- Daily accrual gives the same ≈ $203. Some issuers allocate payments differently; the amount varies.
