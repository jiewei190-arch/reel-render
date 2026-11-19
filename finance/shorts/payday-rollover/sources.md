# Sources and maths: payday-rollover (for MAIN QA)

**Hypothetical example, not advice.** Payday loan fees and limits are set by state law and vary (about $10 to $30 per $100); some states ban these loans.

- **"$60 every two weeks" on $400 ($15 per $100, two-week term):** CFPB, *What are the costs and fees for a payday loan?*: state limits range from $10 to $30 per $100 borrowed; a typical two-week loan at $15 per $100 equals an APR of almost 400 %.
  https://www.consumerfinance.gov/ask-cfpb/what-are-the-costs-and-fees-for-a-payday-loan-en-1589/
  CFPB, *Payday Loans: Highlights from CFPB Research*: median fee $15 per $100, median term 14 days, median loan $350, APR 391 %.
  https://files.consumerfinance.gov/f/documents/Payday_Loans_Highlights_From_CFPB_Research.pdf
- **"pays only the fee... rolled over", "again and again":** CFPB: more than 80 % of payday loans are rolled over or reborrowed within 30 days; rolling over means paying the fee and carrying the same principal.
  https://www.consumerfinance.gov/about-us/newsroom/the-cfpb-finds-payday-and-deposit-advance-loans-can-trap-consumers-in-debt/
- **"about five months":** Pew, *Payday Lending in America* (2012): the average borrower is in debt about five months of the year, takes about eight $375 loans and pays about $520 in interest. (Older data; the CFPB figures above are the primary source.)
  https://www.pewtrusts.org/en/research-and-analysis/reports/2012/07/19/who-borrows-where-they-borrow-and-why

## Maths
```
fee per 2-week rollover = 400 * 15/100          = $60
5 months ≈ 21.7 weeks  ≈ 10 two-week periods
fees after 10 rollovers = 10 * 60               = $600   ("six hundred dollars in fees")
principal still owed    = $400                  (rollovers pay only the fee)
total if then repaid    = 600 + 400             = $1,000 (end board "TOTAL $1,000")
Saver                   = $400 once, $0 fees
APR check: 15% per 14 days * 365/14             = 391 %
on-screen counter "FEES PAID" counts to $540 (9 fees) before the $600 slam (10th fee)
```
