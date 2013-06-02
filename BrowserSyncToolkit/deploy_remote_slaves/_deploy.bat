@ECHO OFF
if "%~1"=="" goto :error
if "%~2"=="" goto :error
if "%~3"=="" goto :error

SET DEPLOY_ROOT=c$
SET LOCAL_DEPLOY_ROOT=%DEPLOY_ROOT:$=:%

:deploy
SET MACHINE=%~1
SET USERNAME=%~2
SET PASSWORD=%~3
echo It's deploying to %MACHINE% (USERNAME=%USERNAME%, PASSWORD=%PASSWORD%)
SET jar_name=itest-webui-browsync-3.1-SNAPSHOT.jar
SET jar=res\%jar_name%
SET chromedriver_name=chromedriver.exe
SET chromedriver=res\%chromedriver_name%
SET IEDriverServer_name=IEDriverServer.exe
SET IEDriverServer=res\%IEDriverServer_name%
SET SafariDriver_name=SafariDriver.safariextz
SET SafariDriver=res\%SafariDriver_name%
SET startup_name=Startup_BrowserSync_Slave.bat
SET startup=res\%startup_name%

IF /I "%MACHINE%"=="localhost" (
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
	ECHO ==����%IEDriverServer%
	COPY "%IEDriverServer%" "%LOCAL_DEPLOY_ROOT%\" /Y
	if not "%errorlevel%"=="0" (
		call taskkill /F /IM IEDriverServer.exe
		COPY "%IEDriverServer%" "\" /Y
		REM echo ����ʾ����һ����������ʹ�ô��ļ��������޷����ʡ������ֶ��رս���IEDriverServer.exe�����²���.
	) 
	ECHO ==����%startup%
	COPY %startup% "%LOCAL_DEPLOY_ROOT%\" /Y
	ECHO ==����%SafariDriver%
	COPY "%SafariDriver%" "%LOCAL_DEPLOY_ROOT%\" /Y
	goto :done
) ELSE (
	ECHO ����ʹ��NET USE�������%MACHINE%
	CALL NET USE \\%MACHINE% /USER:%MACHINE%\%USERNAME% %PASSWORD% && goto :deploy_by_net_use
	goto :deploy_by_keludedeploy
)
pause
goto :eof

:deploy_by_net_use
ECHO ������Ҫ��%MACHINE%��%LOCAL_DEPLOY_ROOT%\�²��𼸸��ؼ����ļ�����Ҫһ��ʱ�䣬�����ĵȴ�����
ECHO ==����%jar%
COPY "%jar%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO ==����%chromedriver%
COPY "%chromedriver%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO **����ʾ����һ����������ʹ�ô��ļ��������޷����ʡ������ֶ��ر�%MACHINE%�µĽ���chromedriver.exe�����²���.
ECHO ==����%IEDriverServer%
COPY "%IEDriverServer%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO **����ʾ����һ����������ʹ�ô��ļ��������޷����ʡ������ֶ��ر�%MACHINE%�µĽ���IEDriverServer.exe�����²���.
ECHO ==����%startup%
COPY "%startup%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO ==����%SafariDriver%
COPY "%SafariDriver%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO ���ڳ���ɾ����%MACHINE%������
CALL NET USE \\%MACHINE% /DELETE
goto :done

:deploy_by_keludedeploy
SET url=http://svn.test.taobao.net/repos/test-svnrepos/PC-AutomantionFramework/tools/Browsersync/BrowserSyncToolKit/deploy_remote_slaves/res
ECHO ���ڳ���ʹ��KeludeDeploy���в���
ECHO *******************************************
ECHO ����ر�֤Զ���Ѿ���������KeludeDeploy��������SVNͬ����Ҫ����
ECHO ���������http://twork.taobao.net:8001/redmine/boards/42/topics/6667
ECHO �����⣬������ѯ����
ECHO *******************************************
..\internal\KeludeDeploy.exe -x "svn co \"%url%\" c:\\ --force" %MACHINE%
goto :done

:copy
REM ��ʱ�޷����㣬57M���ļ��޷���������
ECHO ==����%jar%
..\internal\KeludeDeploy.exe -p "%jar%" "c:\%jar_name%" %MACHINE%
ECHO ==����%chromedriver%
..\internal\KeludeDeploy.exe -p "%chromedriver%" "c:\%chromedriver_name%" %MACHINE%
ECHO **����ʾ��Can not write target file.�������ֶ��ر�%MACHINE%�µĽ���%chromedriver_name%�����²���.
ECHO ==����%IEDriverServer%
..\internal\KeludeDeploy.exe -p "%IEDriverServer%" "c:\%IEDriverServer_name%" %MACHINE%
ECHO **����ʾ��Can not write target file.�������ֶ��ر�%MACHINE%�µĽ���%IEDriverServer_name%�����²���.
ECHO ==����%startup%
..\internal\KeludeDeploy.exe -p "%startup%" "c:\%startup_name%" %MACHINE%
ECHO ==����%SafariDriver%
..\internal\KeludeDeploy.exe -p "%SafariDriver%" "c:\%SafariDriver_name%" %MACHINE%
goto :done

:done
ECHO.
ECHO ��ɲ���
pause
goto :eof

:error
echo usage:
echo 	ip - the ip of slave machine
echo 	username - the username of slave machine
echo 	password - the password of slave machine
pause