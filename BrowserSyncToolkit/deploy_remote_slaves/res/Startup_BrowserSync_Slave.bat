@echo off
if "%~1"=="help" goto :help
set SLAVE_BROWSERS=%~1
echo SLAVE_BROWSERS=%SLAVE_BROWSERS%

::if "%MAVEN_HOME%"=="" (
::	ECHO ###The MAVEN_HOME is empty. It'll try to set by default.###
::	SET MAVEN_HOME=C:\Program Files\apache-maven-2.2.1
::)
::ECHO MAVEN_HOME=%MAVEN_HOME%
:: add the mvn to path
::SET path=%MAVEN_HOME%\bin;%path%
if "%JAVA_HOME%"=="" (
	rem ECHO ###The JAVA_HOME is empty. It'll try to set by default.###
	ECHO ###The JAVA_HOME is empty. Please set it to system environment.###
	goto :eof
	rem SET JAVA_HOME=C:\Program Files\Java\jdk1.6.0_07
)
ECHO JAVA_HOME=%JAVA_HOME%
:: add the java to path
SET path=%JAVA_HOME%\bin;%path%

java -version
call tasklist | findstr java.exe
if "%errorlevel%"=="0" (
    echo Kill the java.exe firstly.
	call taskkill /F /IM java.exe
)
:: retrive the jar location
:: get the mvn repo path
::for /f "tokens=2 delims=^>" %%1 in ('mvn help:effective-settings^|findstr "localRepository"') do (
::	for /f "tokens=1 delims=^<" %%1 in ("%%1") do set mvn_repo=%%1
::)
::echo %mvn_repo%
SET startup_file=c:\itest-webui-browsync-3.1-SNAPSHOT.jar
::SET startup_file=%mvn_repo%\com\taobao\itest\itest-webui-browsync\3.1-SNAPSHOT\itest-webui-browsync-3.1-SNAPSHOT.jar
if not exist "%startup_file%" goto :startup_file_error

:start
SET init_url=http://baike.corp.taobao.com/index.php/BrowserSync/Welcome
SET MASTER_BROWSER=none
SET start_command=java -DautomanX.functionality=browsersync -DautomanX.browsersync.init_url=%init_url% -DautomanX.browsersync.master_browser=%MASTER_BROWSER% -Ditest.driver=%SLAVE_BROWSERS% -jar %startup_file%
::SET start_command=java -Xdebug -Xrunjdwp:transport=dt_socket,address=11555,server=y,suspend=n -DautomanX.functionality=browsersync -DautomanX.browsersync.init_url=%init_url% -DautomanX.browsersync.master_browser=%MASTER_BROWSER% -Ditest.driver=%SLAVE_BROWSERS% -jar %startup_file%
ECHO The command is:
ECHO   %start_command%
%start_command%
rem 当再次启动时，或java.exe进程被关闭时，直接退出当前的窗口
exit
goto :eof

:startup_file_error
echo The Startup file should be %startup_file%

:help
echo Usage:
echo   SLAVE_BROWSERS - the slave browsers to be startup e.g. "ie,chrome"
echo Example: %0 "ie,chrome"