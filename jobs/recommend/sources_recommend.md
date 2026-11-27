# Sources: recommend (How your feed picks your next video)
Researched Oct 27 2026. Pages and the paper were opened and checked.

| Claim (script) | Source |
|---|---|
| From millions of videos, a funnel narrows to a few hundred candidates, then a few dozen are shown | Covington, Adams & Sargin, "Deep Neural Networks for YouTube Recommendations", RecSys 2016 (Google): Fig. 2 funnel "millions -> hundreds -> dozens"; candidate generation "retrieves a small subset (hundreds) of videos from a large corpus". https://research.google/pubs/pub45530/ (PDF: static.googleusercontent.com/media/research.google.com/en//pubs/archive/45530.pdf) |
| Candidates use what viewers with similar habits watched | Same paper: candidate generation "provides broad personalization via collaborative filtering"; YouTube blog (Goodrow 2021): "Our system then compares your viewing habits with those that are similar to you." |
| A second system scores each candidate | Same paper: separate ranking network that "assign[s] an independent score to each video" |
| In 2011 YouTube learned a click doesn't mean you watched | YouTube Official Blog, Cristos Goodrow, "On YouTube's recommendation system", Sep 15 2021: "we learned back in 2011 that clicking on a video doesn't mean you actually watched it." https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/ (watch time was added as a signal in 2012) |
| In the 2016 paper the score predicted watch time | Covington et al. 2016: ranking model predicts "expected watch time (rather than click probability)" |
| Ranking by clicks rewarded clickbait, videos people didn't finish | Same paper: "Ranking by click-through rate often promotes deceptive videos that the user does not complete ('clickbait')" |
| YouTube also uses surveys asking if a video was worth their time | YouTube blog 2021: surveys measure "valued watchtime" |
| Share, like, dislike are signals | YouTube blog 2021: signals include "clicks, watchtime, survey responses, sharing, likes, and dislikes" |
| Instagram's key Reels predictions: watch to the end, like, reshare (and go to the audio page) | Instagram, Adam Mosseri, "Instagram Ranking Explained", May 31 2023 https://about.instagram.com/blog/announcements/instagram-ranking-explained |
| Recent activity feeds the next recommendations | Same Instagram page ("Your activity ... engaged with recently"); YouTube blog 2021 |
| YouTube lets you pause or delete your watch history | YouTube blog 2021: "You can pause, edit, or delete your YouTube search and watch history whenever you want." |

## Softened / careful wording
1. The funnel numbers ("millions", "a few hundred", "a few dozen") come from YouTube's 2016 paper and are attributed in the voiceover ("YouTube's engineers described a funnel", "In their 2016 paper"). Today's system is newer and its details are not public.
2. The hook "only a few dozen reach your screen" restates the 2016 paper's funnel.
3. The slider percentages on the Instagram scene are labelled "(example numbers)" on screen. They are not real data.
4. The betting wheel's categories and the scores on the conveyor belt are illustrations.
5. "Instagram says ..." attributes the Reels signals to Instagram's own explainer.
