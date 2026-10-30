#!/bin/sh
# What If ep 3 Shorts (run from whatif/shorts/train-3yr). Times are sentence boundaries from timeline/sentences.json.
P=../../aitrends-2d-studio/projects/train-3yr; V=$P/out/What_If_You_Trained_Every_Day_for_3_Years.mp4; WJ=$P/timeline/words.json
python make_short.py $WJ $V 0.0 32.2 "Train every day for 3 years. Does your hair fall out?" train1_promise.mp4
python make_short.py $WJ $V 33.7 57.9 "Day 1 of 100 push-ups a day" train2_day1.mp4
python make_short.py $WJ $V 339.0 373.9 "3 years of training. ONE punch." train3_punch.mp4
