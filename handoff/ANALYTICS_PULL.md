# Prompt for the PC session: weekly analytics read (paste into Claude in Chrome on the owner's PC)

Read-only. Don't post, edit, delete or change any setting. Never enter passwords; if a page asks you to log in, stop and tell the owner. Never open the Facebook Page "Jiesuke".

1. Pull the latest handoff branch (claude/reel-studio-handoff-f70dcj) of jiewei190-arch/reel-render and open handoff/metrics.csv.
2. For every reel posted at least 48 hours ago that isn't in metrics.csv yet (episode numbers are in handoff/episodes.csv; the reel's title is in its caption):
   - **TikTok** (TikTok Studio, Analytics, per post): views, average watch time, watched full video %, likes, comments, shares, saves (favorites), new followers, traffic source split (For You / search / profile / other).
   - **YouTube** (YouTube Studio, Content, Shorts, per Short): views, "stayed to watch" %, average view duration, average % viewed, likes, comments, shares, subscribers gained, and the point where the retention graph falls fastest (seconds).
   - **Instagram** (Insights, per Reel): plays, average watch time, likes, comments, shares, saves, follows.
3. Add one row per reel per platform to handoff/metrics.csv (columns in its header). Leave a cell empty if the platform doesn't show it. Put anything notable (a comment worth answering, a reel that was suppressed or got a warning) in notes.
4. Also copy the 5 best viewer questions from comments into handoff/topics_backlog.md under "Viewer questions".
5. Commit "Analytics read <date>" and push to the handoff branch. Tell the owner it's done.
