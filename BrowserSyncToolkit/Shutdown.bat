@echo off
title "BrowserSync Injection Server"
echo *************************************************************
echo ****Shutdown the BrowserSync Injection Server!****
echo *************************************************************
echo Reset the proxy of internet setting.
::regedit /S internal\proxy\remove.reg
call internal\node.exe -e "require('./internal/proxy/proxy').shutdown()"

::echo :TODO call the proxy setting effect immediately

call tasklist | findstr node.exe
if "%errorlevel%"=="0" (
    echo Kill the node.exe
    call taskkill /F /IM node.exe
)

call tasklist | findstr java.exe
if "%errorlevel%"=="0" (
    echo Kill the java.exe
    call taskkill /F /IM java.exe
)

call tasklist | findstr IEDriverServer.exe
if "%errorlevel%"=="0" (
    echo Kill the IEDriverServer.exe
    call taskkill /F /IM IEDriverServer.exe
)

call tasklist | findstr chromedriver.exe
if "%errorlevel%"=="0" (
    echo Kill the chromedriver.exe
    call taskkill /F /IM chromedriver.exe
)

pause