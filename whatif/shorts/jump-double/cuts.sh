#!/bin/sh
# What If ep 2 Shorts (run from whatif/shorts/jump-double). Times are sentence boundaries from timeline/sentences.json.
P=../../aitrends-2d-studio/projects/jump-double; V=$P/out/What_If_Every_Day_Your_Jump_Doubled.mp4; WJ=$P/timeline/words.json
python make_short.py $WJ $V 0.0 23.6 "What if your jump DOUBLED every day?" jump1_doubling.mp4
python make_short.py $WJ $V 31.85 61.1 "Day 3: a 12-foot dunk" jump2_dunk.mp4
python make_short.py $WJ $V 300.97 338.8 "Day 25: the jump you never come back from" jump3_escape.mp4
