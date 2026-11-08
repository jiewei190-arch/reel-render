#!/bin/sh
# I.Awaken stoptime Shorts (run from iawaken/clips/stoptime). Join + verify the episode first:
#   cat ../../out/stoptime/video.part-* > video.mp4 && sha256sum -c ../../out/stoptime/video.sha256
# Segment times are episode seconds (words.json is in episode time: offset 0, checked by cross-correlating
# input/voiceover.wav with the final mix at 20 s, 150 s and 300 s).
V=${V:-video.mp4}; WJ=../../../whatif/aitrends-2d-studio/projects/stop-time/timeline/words.json
python3 make_clip.py $WJ $V 'Frozen time is PITCH BLACK' clip1.mp4 2.90-13.45 39.66-44.30 58.14-74.25
python3 make_clip.py $WJ $V "You can't BREATHE frozen air" clip2.mp4 89.84-98.06 98.94-102.02 127.30-144.26
python3 make_clip.py $WJ $V 'Never lift a FROZEN cat' clip3.mp4 158.52-175.72 191.04-198.42 204.62-208.24
