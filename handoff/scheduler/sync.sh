#!/bin/bash
cd /home/claude/reel-render && git pull -q --rebase --autostash origin claude/reel-studio-handoff-f70dcj 2>&1|grep -v Updating|tail -2
for r in $( (awk -F, 'NR>1{print $4}' handoff/schedule_tt_yt.csv handoff/schedule_batchN.csv; awk -F, 'NR>1{print $4}' handoff/schedule_nov.csv handoff/carousels.csv) | sort -u); do
  [ -d jobs/$r ] || continue
  for f in jobs/$r/${r}_ep.mp4 jobs/$r/thumb_$r.jpg; do [ -f $f ] && { cmp -s $f /mnt/user-data/uploads/ep/$(basename $f) || { cp $f /mnt/user-data/uploads/ep/; echo "restaged $f"; }; }; done
  f=jobs/$r/$r.mp4; [ -f $f ] && { cmp -s $f /mnt/user-data/uploads/reels/$r.mp4 || { cp $f /mnt/user-data/uploads/reels/; echo "restaged plain $r"; }; }
  if [ -d jobs/$r/carousel ]; then mkdir -p /mnt/user-data/uploads/car/$r; for c in jobs/$r/carousel/*.jpg; do cmp -s $c /mnt/user-data/uploads/car/$r/$(basename $c) || cp $c /mnt/user-data/uploads/car/$r/; done; fi
done
git log --oneline -1
