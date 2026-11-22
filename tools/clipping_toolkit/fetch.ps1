# Re-download the clipping toolkit at the pinned commits. Usage: fetch.ps1 [target-dir] [-Latest]
param([string]$Dest = "$HOME\clipping-toolkit", [switch]$Latest)
$list = Join-Path $PSScriptRoot "repos.txt"; New-Item -ItemType Directory -Force $Dest | Out-Null; $ok = 0; $bad = 0
foreach ($line in Get-Content $list) {
  if ($line -match '^\s*(#|$)') { continue }
  $repo, $sha = $line -split '\s+'; $dir = Join-Path $Dest ($repo -replace '/', '_')
  if (-not (Test-Path "$dir\.git")) { git init -q $dir; git -C $dir remote add origin "https://github.com/$repo.git" }
  $ref = if ($Latest) { "HEAD" } else { $sha }
  git -C $dir fetch -q --depth 1 origin $ref
  if ($LASTEXITCODE -eq 0) { git -C $dir checkout -q --force FETCH_HEAD }
  if ($LASTEXITCODE -eq 0) { "ok   $repo"; $ok++ } else { "FAIL $repo"; $bad++ }
}
"$ok ok, $bad failed -> $Dest"
