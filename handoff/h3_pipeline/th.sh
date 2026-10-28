cd /home/user/reel-render/reels
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
n=thunder
true
rm -f $n.done; sh rq.sh $n 9309 9310
sh enc_hq.sh $n && cp up/$n.mp4 ../jobs/$n/$n.mp4 && python3 -I qa.py $n > /tmp/claude-0/qa_$n.log 2>&1
python3 -I contact.py $n 4 12 up; cp contact_$n.jpg ../jobs/$n/contact.jpg
ffmpeg -v error -y -i ../jobs/$n/$n.mp4 -t 8 -vf scale=720:1280 -c:v libx264 -crf 22 -c:a aac -b:a 128k ../jobs/$n/preview_$n.mp4
PORT=9325 python3 -I thumb.py $n
rm -rf frames/$n
touch /tmp/claude-0/th.done
cd /home/user/reel-render && python3 -I reels/brand.py thunder --ep 83 && python3 -I reels/qa.py thunder > /tmp/claude-0/qa2_thunder.log 2>&1
touch /tmp/claude-0/th2.done
