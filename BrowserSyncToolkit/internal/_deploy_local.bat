@ECHO OFF
SET LOCAL_DEPLOY_ROOT=c:

:deploy
echo It's deploying to localhost
SET jar=..\deploy_remote_slaves\res\itest-webui-browsync-3.1-SNAPSHOT.jar
SET chromedriver=..\deploy_remote_slaves\res\chromedriver.exe
SET IEDriverServer=..\deploy_remote_slaves\res\IEDriverServer.exe
SET SafariDriver=..\deploy_remote_slaves\res\SafariDriver.safariextz
SET startup=..\deploy_remote_slaves\res\Startup_BrowserSync_Slave.bat

ECHO 接下来要在localhost的%LOCAL_DEPLOY_ROOT%\下部署几个关键的文件，需要一点时间，请耐心等待……
ECHO ==拷贝%jar%
COPY "%jar%" "%LOCAL_DEPLOY_ROOT%\" /Y
ECHO ==拷贝%chromedriver%
COPY "%chromedriver%" "%LOCAL_DEPLOY_ROOT%\" /Y
if not "%errorlevel%"=="0" (
	call taskkill /F /IM chromedriver.exe
	COPY "%chromedriver%" "\" /Y
	REM echo 若提示“另一个程序正在使用此文件，进程无法访问”，请手动关闭进程chromedriver.exe后，重新部署.
) 
ECHO 拷贝%IEDriverServer%
COPY "%IEDriverServer%" "%LOCAL_DEPLOY_ROOT%\" /Y
if not "%errorlevel%"=="0" (
	call taskkill /F /IM IEDriverServer.exe
	COPY "%IEDriverServer%" "\" /Y
	REM echo 若提示“另一个程序正在使用此文件，进程无法访问”，请手动关闭进程IEDriverServer.exe后，重新部署.
) 
ECHO ==拷贝%startup%
COPY %startup% "%LOCAL_DEPLOY_ROOT%\" /Y
ECHO ==拷贝%SafariDriver%
COPY %SafariDriver% "%LOCAL_DEPLOY_ROOT%\" /Y

ECHO.
ECHO 完成部署
goto :eof
:error
echo usage:
echo 	ip - the ip of slave machine
echo 	username - the username of slave machine
echo 	password - the password of slave machine
pause