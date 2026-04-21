$pythonPath = if ($env:CODEX_BUNDLED_PYTHON) {
  $env:CODEX_BUNDLED_PYTHON
} else {
  Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
}

if (Test-Path -LiteralPath $pythonPath) {
  & $pythonPath @args
  exit $LASTEXITCODE
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCommand) {
  Write-Warning "[cause-gen] Bundled Codex Python not found. Falling back to python on PATH."
  & $pythonCommand.Source @args
  exit $LASTEXITCODE
}

$pyCommand = Get-Command py -ErrorAction SilentlyContinue
if ($pyCommand) {
  Write-Warning "[cause-gen] Bundled Codex Python not found. Falling back to py -3."
  & $pyCommand.Source -3 @args
  exit $LASTEXITCODE
}

Write-Error "Bundled Codex Python was not found at $pythonPath and no fallback Python executable was found on PATH."
exit 1
