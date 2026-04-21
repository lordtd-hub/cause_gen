@echo off
set "DEFAULT_CODEX_BUNDLED_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not "%CODEX_BUNDLED_PYTHON%"=="" (
  set "PYTHON_CANDIDATE=%CODEX_BUNDLED_PYTHON%"
) else (
  set "PYTHON_CANDIDATE=%DEFAULT_CODEX_BUNDLED_PYTHON%"
)

if exist "%PYTHON_CANDIDATE%" (
  "%PYTHON_CANDIDATE%" %*
  exit /b %ERRORLEVEL%
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo [cause-gen] Bundled Codex Python not found. Falling back to python on PATH.
  python %*
  exit /b %ERRORLEVEL%
)

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  echo [cause-gen] Bundled Codex Python not found. Falling back to py -3.
  py -3 %*
  exit /b %ERRORLEVEL%
)

echo Bundled Codex Python was not found at:
echo   %PYTHON_CANDIDATE%
echo No fallback python executable was found on PATH.
echo Set CODEX_BUNDLED_PYTHON to the correct python.exe on this machine or install Python/Codex runtime.
exit /b 1
