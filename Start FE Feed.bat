@echo off
REM ── FE Feed launcher ──────────────────────────────────────────
REM Serves the app over http://localhost:8000 (needed for offline/
REM install features) and opens it in your default browser.
title FE Feed
cd /d "%~dp0app"

echo.
echo   FE Feed is starting...
echo   Keep this window open while you study.
echo   Open in your phone's browser on the same Wi-Fi via your PC's IP.
echo.

REM Launch the browser shortly after the server comes up
start "" /b cmd /c "timeout /t 1 >nul & start "" http://localhost:8000/"

REM Try py launcher first, then python
py -3 -m http.server 8000 2>nul || python -m http.server 8000
