cd /home/user/reel-render/reels
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
n=newroad; V=$1
sh rq.sh $n 9313 9314 && sh enc_hq.sh $n && mkdir -p ../story/newroad && cp up/$n.mp4 ../story/newroad/${n}_$V.mp4 && cp up/$n.mp4 ../jobs/$n/$n.mp4 2>/dev/null; mkdir -p ../jobs/$n; cp up/$n.mp4 ../jobs/$n/$n.mp4
python3 -I qa.py $n > /tmp/claude-0/qa_nr_$V.log 2>&1; cp /tmp/claude-0/qa_nr_$V.log ../story/newroad/qa_$V.txt
rm -rf frames/$n
touch /tmp/claude-0/nr_$V.done
