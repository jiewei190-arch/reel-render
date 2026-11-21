# AWS Lambda setup (one time, about 15 minutes)

You do every step in the AWS website yourself. Never paste keys into a chat; they only go in `bot\.env`.

## 1. Create the account
1. Go to **aws.amazon.com**, then **Create an AWS Account**. Add a card and verify your phone.
2. At the top right, pick the region **US East (N. Virginia) us-east-1**.

## 2. Set a spending alert first (so a mistake can never surprise you)
1. Search **Billing and Cost Management**, then **Budgets**, then **Create budget**.
2. Pick **Monthly cost budget**, amount **$20** (raise it later), and your email. Create it.

## 3. Create the role the render machines use
1. Search **IAM**, then **Policies**, then **Create policy**, then the **JSON** tab.
2. Delete what's there, paste the whole contents of `bot\aws\role-policy.json`, **Next**,
   and name it exactly **remotion-lambda-policy**. Create it.
3. Go to **IAM**, then **Roles**, then **Create role**.
   - Choose **AWS service** and **Lambda**, then **Next**.
   - Tick **remotion-lambda-policy**, then **Next**.
   - Name it exactly **remotion-lambda-role**. Create it.

## 4. Create the user the bot logs in as
1. Go to **IAM**, then **Users**, then **Create user**. Name it **remotion-user**, then **Next**.
2. Pick **Attach policies directly**, then **Next**, then **Create user**. Don't tick any policy here.
3. Open **remotion-user**, then **Add permissions**, then **Create inline policy**, then the **JSON** tab.
   Paste the whole contents of `bot\aws\user-policy.json`. Name it **remotion-user-policy** and create it.
4. Still in **remotion-user**, go to **Security credentials**, then **Create access key**.
   Choose **Application running outside AWS** and create it.

## 5. Put the key in bot\.env (on the PC, yourself)
Add these three lines to `bot\.env`, filling in the two values from the AWS page:
```
REMOTION_AWS_ACCESS_KEY_ID=...
REMOTION_AWS_SECRET_ACCESS_KEY=...
REMOTION_AWS_REGION=us-east-1
```

## 6. Let the bot finish it (Creator can run these)
```
python -m reelbot lambda setup
python -m reelbot lambda quotas --increase
```
- `setup` checks the permissions and deploys the render function.
- `quotas --increase` asks AWS to let us run more machines at once. New accounts start low, and the
  increase is free; AWS usually approves it in a day or two. Renders work before then, just slower.

## 7. First test
```
python -m reelbot render <slug> --on lambda
```
- The bot prints how long the render took and roughly what it cost. Compare that video with the PC version before
  switching anything over.
- To make Lambda the default, add `REELBOT_RENDER_ON=lambda` to `bot\.env`.
- `REELBOT_LAMBDA_BLUR=0` skips motion blur. That's about 4x cheaper, but motion looks a little less smooth.
