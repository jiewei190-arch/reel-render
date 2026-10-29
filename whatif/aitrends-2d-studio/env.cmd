@echo off
rem Kit-only environment: ffmpeg/ffprobe shims + venv python first on PATH.
set "PATH=%~dp0bin;%~dp0.venv\Scripts;%PATH%"
