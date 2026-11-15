"""Print a YouTube video's transcript with timestamps (local research only; don't commit the output).
Usage: python get_transcript.py VIDEO_ID   (needs: pip install youtube-transcript-api, MIT)
"""
import sys
from youtube_transcript_api import YouTubeTranscriptApi

for s in YouTubeTranscriptApi().fetch(sys.argv[1]):
    print(f"[{int(s.start // 60)}:{int(s.start % 60):02d}] {s.text}")
