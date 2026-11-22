# Monster YouTube Automator: one-time Windows setup. Run in PowerShell from the monster folder:
#   powershell -ExecutionPolicy Bypass -File setup_windows.ps1
# Installs free local tools only. Nothing here signs in to anything or uploads anything.
$ErrorActionPreference = "Stop"
function Need($id) { winget install --id $id --exact --accept-source-agreements --accept-package-agreements --silent }
# Kokoro needs Python 3.12 specifically (3.13+ can't build its spaCy dependency): check for 3.12, not just any Python
py -3.12 --version 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Need "Python.Python.3.12" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Need "OpenJS.NodeJS.LTS" }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Need "Gyan.FFmpeg" }
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) { Need "Ollama.Ollama" }
if (-not (Get-Command espeak-ng -ErrorAction SilentlyContinue)) { Need "eSpeak-NG.eSpeak-NG" }   # Kokoro fallback phonemizer for rare words

# pick up PATH changes from the installs above in THIS shell (winget doesn't refresh it)
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu
.\.venv\Scripts\pip install -r requirements.txt

Push-Location renderer; npm ci; Pop-Location

# Local text model sized for an 8 GB RTX 4060 (doctor prints its own recommendation from the measured VRAM).
ollama pull qwen2.5:7b
Write-Host "`nSet runtime.ollama_model in config\channel_profiles.json (e.g. qwen2.5:7b), then run:"
Write-Host "  .\.venv\Scripts\python -m mya doctor"
Write-Host "  .\.venv\Scripts\python -m pytest -q tests"
