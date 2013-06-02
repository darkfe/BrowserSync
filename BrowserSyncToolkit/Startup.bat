@echo off
title "BrowserSync Secondary Servers"
echo *************************************************************
echo ****Startup the BrowserSync Secondary Servers!****
echo *************************************************************
call tasklist | findstr node.exe
if "%errorlevel%"=="0" (
    echo Kill the node.exe
    call taskkill /F /IM node.exe
)

cscript internal\_Startup_Remote_Slaves.js

call internal\node.exe internal\index.js


