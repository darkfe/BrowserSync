@ECHO OFF
SET LOCAL_DEPLOY_ROOT=c:

:deploy
echo It's deploying to localhost
SET jar=..\deploy_remote_slaves\res\itest-webui-browsync-3.1-SNAPSHOT.jar
SET chromedriver=..\deploy_remote_slaves\res\chromedriver.exe
SET IEDriverServer=..\deploy_remote_slaves\res\IEDriverServer.exe
SET SafariDriver=..\deploy_remote_slaves\res\SafariDriver.safariextz
SET startup=..\deploy_remote_slaves\res\Startup_BrowserSync_Slave.bat

ECHO ������Ҫ��localhost��%LOCAL_DEPLOY_ROOT%\�²��𼸸��ؼ����ļ�����Ҫһ��ʱ�䣬�����ĵȴ�����
ECHO ==����%jar%
COPY "%jar%" "%LOCAL_DEPLOY_ROOT%\" /Y
ECHO ==����%chromedriver%
COPY "%chromedriver%" "%LOCAL_DEPLOY_ROOT%\" /Y
if not "%errorlevel%"=="0" (
	call taskkill /F /IM chromedriver.exe
	COPY "%chromedriver%" "\" /Y
	REM echo ����ʾ����һ����������ʹ�ô��ļ��������޷����ʡ������ֶ��رս���chromedriver.exe�����²���.
) 
ECHO ����%IEDriverServer%
COPY "%IEDriverServer%" "%LOCAL_DEPLOY_ROOT%\" /Y
if not "%errorlevel%"=="0" (
	call taskkill /F /IM IEDriverServer.exe
	COPY "%IEDriverServer%" "\" /Y
	REM echo ����ʾ����һ����������ʹ�ô��ļ��������޷����ʡ������ֶ��رս���IEDriverServer.exe�����²���.
) 
ECHO ==����%startup%
COPY %startup% "%LOCAL_DEPLOY_ROOT%\" /Y
ECHO ==����%SafariDriver%
COPY %SafariDriver% "%LOCAL_DEPLOY_ROOT%\" /Y

ECHO.
ECHO ��ɲ���
goto :eof
:error
echo usage:
echo 	ip - the ip of slave machine
echo 	username - the username of slave machine
echo 	password - the password of slave machine
pause