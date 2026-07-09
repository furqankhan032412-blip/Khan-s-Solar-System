@echo off
title Khan's Solar System
cd /d "%~dp0"
echo Starting Khan's Solar System...
echo.
echo App: http://127.0.0.1:5173
echo API: http://127.0.0.1:4000/api/health
echo.
npm.cmd run dev
pause
