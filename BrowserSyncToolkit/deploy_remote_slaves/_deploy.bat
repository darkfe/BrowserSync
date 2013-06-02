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
	ECHO ==拷贝%IEDriverServer%
	COPY "%IEDriverServer%" "%LOCAL_DEPLOY_ROOT%\" /Y
	if not "%errorlevel%"=="0" (
		call taskkill /F /IM IEDriverServer.exe
		COPY "%IEDriverServer%" "\" /Y
		REM echo 若提示“另一个程序正在使用此文件，进程无法访问”，请手动关闭进程IEDriverServer.exe后，重新部署.
	) 
	ECHO ==拷贝%startup%
	COPY %startup% "%LOCAL_DEPLOY_ROOT%\" /Y
	ECHO ==拷贝%SafariDriver%
	COPY "%SafariDriver%" "%LOCAL_DEPLOY_ROOT%\" /Y
	goto :done
) ELSE (
	ECHO 正在使用NET USE命令，连接%MACHINE%
	CALL NET USE \\%MACHINE% /USER:%MACHINE%\%USERNAME% %PASSWORD% && goto :deploy_by_net_use
	goto :deploy_by_keludedeploy
)
pause
goto :eof

:deploy_by_net_use
ECHO 接下来要在%MACHINE%的%LOCAL_DEPLOY_ROOT%\下部署几个关键的文件，需要一点时间，请耐心等待……
ECHO ==拷贝%jar%
COPY "%jar%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO ==拷贝%chromedriver%
COPY "%chromedriver%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO **若提示“另一个程序正在使用此文件，进程无法访问”，请手动关闭%MACHINE%下的进程chromedriver.exe后，重新部署.
ECHO ==拷贝%IEDriverServer%
COPY "%IEDriverServer%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO **若提示“另一个程序正在使用此文件，进程无法访问”，请手动关闭%MACHINE%下的进程IEDriverServer.exe后，重新部署.
ECHO ==拷贝%startup%
COPY "%startup%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO ==拷贝%SafariDriver%
COPY "%SafariDriver%" "\\%MACHINE%\%DEPLOY_ROOT%\" /Y
ECHO 正在尝试删除与%MACHINE%的连接
CALL NET USE \\%MACHINE% /DELETE
goto :done

:deploy_by_keludedeploy
SET url=http://svn.test.taobao.net/repos/test-svnrepos/PC-AutomantionFramework/tools/Browsersync/BrowserSyncToolKit/deploy_remote_slaves/res
ECHO 正在尝试使用KeludeDeploy进行部署
ECHO *******************************************
ECHO 请务必保证远端已经部署并启动KeludeDeploy，命令行SVN同样需要可用
ECHO 部署详见：http://twork.taobao.net:8001/redmine/boards/42/topics/6667
ECHO 有问题，可以咨询罗宁
ECHO *******************************************
..\internal\KeludeDeploy.exe -x "svn co \"%url%\" c:\\ --force" %MACHINE%
goto :done

:copy
REM 暂时无法满足，57M的文件无法正常拷贝
ECHO ==拷贝%jar%
..\internal\KeludeDeploy.exe -p "%jar%" "c:\%jar_name%" %MACHINE%
ECHO ==拷贝%chromedriver%
..\internal\KeludeDeploy.exe -p "%chromedriver%" "c:\%chromedriver_name%" %MACHINE%
ECHO **若提示“Can not write target file.”，请手动关闭%MACHINE%下的进程%chromedriver_name%后，重新部署.
ECHO ==拷贝%IEDriverServer%
..\internal\KeludeDeploy.exe -p "%IEDriverServer%" "c:\%IEDriverServer_name%" %MACHINE%
ECHO **若提示“Can not write target file.”，请手动关闭%MACHINE%下的进程%IEDriverServer_name%后，重新部署.
ECHO ==拷贝%startup%
..\internal\KeludeDeploy.exe -p "%startup%" "c:\%startup_name%" %MACHINE%
ECHO ==拷贝%SafariDriver%
..\internal\KeludeDeploy.exe -p "%SafariDriver%" "c:\%SafariDriver_name%" %MACHINE%
goto :done

:done
ECHO.
ECHO 完成部署
pause
goto :eof

:error
echo usage:
echo 	ip - the ip of slave machine
echo 	username - the username of slave machine
echo 	password - the password of slave machine
pause