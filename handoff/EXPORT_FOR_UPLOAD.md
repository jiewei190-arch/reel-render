# Prompt for the PC session: put every video in one folder so the owner can upload by hand (Oct 28)

Don't post, schedule, delete or change anything on any account. This only copies files on this computer.

1. Get the latest files: in the reel-render folder, run `git pull origin claude/reel-studio-handoff-f70dcj`. If there's no clone yet, clone https://github.com/jiewei190-arch/reel-render and check out that branch.
2. Run: `python handoff/export_uploads.py "%USERPROFILE%\Desktop\Reels to upload"` on Windows, or `python3 handoff/export_uploads.py ~/Desktop/"Reels to upload"` on a Mac. To export only some episodes, add the first and last EP numbers at the end, e.g. `... 1 20`.
3. This creates one folder per episode, in posting order (EP001_glowstick, EP002_faces, …, EP104_fog). Each folder holds:
   - `tiktok_youtube.mp4`: TikTok and YouTube (has the episode badge);
   - `instagram.mp4`: Instagram (no badge);
   - `cover.jpg`: the cover/thumbnail;
   - `caption.txt`: the caption to paste.
4. Tell the owner the folder path and the "N episodes copied" line it prints, plus any "missing" line.
