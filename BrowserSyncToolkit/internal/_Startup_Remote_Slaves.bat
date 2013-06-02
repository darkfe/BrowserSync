@echo off
if "%~1"=="" goto :error
if "%~2"=="" goto :error

:start
ECHO Start the remote slave browser(s)
SET MACHINE=%~1
SET INPUT_SLAVE_BROWSERS=%~2 %~3 %~4 %~5 %~6 %~7 %~8 %~9

SET SLAVE_BROWSERS=
@echo off&setlocal enabledelayedexpansion
SET for_index=0
for %%i in (%INPUT_SLAVE_BROWSERS%) do (
    IF !for_index!==0 (
	    SET SLAVE_BROWSERS=%%i
	) ELSE (
		SET SLAVE_BROWSERS=!SLAVE_BROWSERS!,%%i
	)
	SET for_index=!for_index! + 1
)

::ECHO %MACHINE% is starting, the following browser(s) will start - %SLAVE_BROWSERS%.

SET start_portal_file=c:\Startup_BrowserSync_Slave.bat

if /i NOT "%MACHINE%"=="localhost" goto :send_command_to_remote
:start_local
if not exist "%start_portal_file%" goto :start_portal_file_error
start "BrowserSync WebDriver Server" %start_portal_file% "%SLAVE_BROWSERS%"
goto :eof

:send_command_to_remote
ECHO It's processing the following command: 
echo KeludeDeploy.exe -x "%start_portal_file% \"%SLAVE_BROWSERS%\"" %MACHINE%
internal\KeludeDeploy.exe -x "start \"BrowserSync WebDriver Server\" %start_portal_file% \"%SLAVE_BROWSERS%\"" %MACHINE%
goto :eof

:start_portal_file_error
echo The Start portal file should be %start_portal_file%, you need to perform the deploy.
goto :eof

:error
echo usage:
echo 	ip - the ip of slave machine
echo 	slave browsers - the browsers of slave to be startup, seperate by empty space
pause