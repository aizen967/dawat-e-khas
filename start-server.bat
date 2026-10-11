@echo off
title Dawat Restaurant Web Server
cd /d "%~dp0"
echo Starting Dawat Restaurant Server...
set "PATH=C:\Program Files\nodejs;%PATH%"
npm start
pause
