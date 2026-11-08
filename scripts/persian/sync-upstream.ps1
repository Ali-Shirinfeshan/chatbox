# Requires the original Git checkout, not the incomplete ZIP.
# Preserves Persian commits via a normal merge, never a reset/force-push.
$ErrorActionPreference = 'Stop'
$repo = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Run this in the original Chatbox Git repository.' }
Set-Location $repo
$pending = @(git status --porcelain)
if ($pending.Count -ne 0) {
  throw "Working tree is not clean. First commit all Persian and RTL changes on your personal branch (and keep a backup). Nothing was changed."
}
$branch = (git branch --show-current).Trim()
if (!$branch) { throw 'Detached HEAD: create your own personal branch before syncing.' }
$backup = 'backup/persian-before-sync-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
git branch $backup
if ($LASTEXITCODE -ne 0) { throw 'Failed to create backup branch.' }
$upstream = git remote get-url upstream 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add upstream https://github.com/chatboxai/chatbox.git
} elseif ($upstream -ne 'https://github.com/chatboxai/chatbox.git' -and $upstream -ne 'git@github.com:chatboxai/chatbox.git') {
  throw "Unexpected upstream remote: $upstream"
}
git fetch upstream main
if ($LASTEXITCODE -ne 0) { throw 'Upstream fetch failed. Backup branch is safe.' }
git merge --no-ff --no-commit upstream/main
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Merge conflicts detected. Persian changes are still available; resolve conflicts manually. DO NOT reset --hard.'
  Write-Host "Backup branch: $backup"
  exit 1
}
# Do not auto-commit before review/tests. Manual merge review is mandatory.
Write-Host 'Upstream changes staged for review. Run pnpm test and pnpm check, then git commit.'
Write-Host "Previous state backup: $backup; branch: $branch"
