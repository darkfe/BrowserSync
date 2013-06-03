@echo off
SET zipper=7z.exe
if not exist %zipper% goto :zipper_error

SET make_sfx=MakeSFX.exe
if not exist %make_sfx% goto :self_extractor_error

SET package="..\BrowserSyncToolKit"
if not exist %package% goto :package_error

SET main_version=1.2.2

:svn_revision
:: svn update fisrstly
svn up %package%

:: get the mvn repo path
SET svn_revision=
for /f "tokens=2 delims=:" %%1 in ('svn info %package%^|findstr "Last\ Changed\ Rev"') do (
	SET svn_revision=%%1
)
:: 兼容中文的svn命令行处理
if "%svn_revision%"=="" (
    for /f "tokens=2 delims=:" %%1 in ('svn info %package%^|findstr "最后修改的版本"') do (
	    SET svn_revision=%%1
	)
)

:: 错误兼容
if "%svn_revision%"=="" set svn_revision=unknown	

SET svn_revision=%svn_revision: =%
echo Last Changed Rev of %package% is %svn_revision%
SET version=v%main_version%.%svn_revision%

:svn_export
SET pkg_name=BrowserSyncToolKit
if exist %pkg_name% (
    echo Remove the old directory: %pkg_name%
	rmdir %pkg_name% /s /q
)
echo It's exporting to BrowserSyncToolKit
svn export %package% %pkg_name% --force

:add_license
(
echo Version: %version% 
echo Time: %date%
echo Author: Jazz Huang - 乐东
echo Email: ledong.hxd@alibaba-inc.com
) >>%pkg_name%\ReleaseNote.txt

:zipper_zip
if exist %pkg_name%.zip (
	del %pkg_name%.zip /s /q
)
%zipper% a %pkg_name%.zip %pkg_name% 

:self_extractor
SET defaultpath=c:\%pkg_name%
SET install_file=install_%pkg_name%-%version%.exe
if exist %install_file% del %install_file%
::%make_sfx% /zip="%pkg_name%.zip" /sfx="install_%pkg_name%.exe" /title="安装%pkg_name%" /website="http://www.taobaotest.com/blogs/2185" /intro="欢迎使用BrowserSync." /defaultpath "%defaultpath%" /overwrite /openexplorerwindow /autoextract
%make_sfx% /zip="%pkg_name%.zip" /sfx="%install_file%" /title="安装%pkg_name%" /website="http://baike.corp.taobao.com/index.php/BrowserSync" /intro="欢迎使用BrowserSync.\n%version%\n建议安装至%defaultpath%下\n请直接选择c:\进行安装。\n注：安装过程包括BrowserSync工具包安装、本地部署及GM安装，注入脚本请到injecter目录下手动安装\n如有疑问，请联系：乐东、静茜" /overwrite /openexplorerwindow /exec="%defaultpath%\internal\_install.bat"
goto :success

:zipper_error
echo The zipper should be %zipper%.
goto :done

:package_error
echo The BrowserSyncToolKit folder should be %package%.
goto :done

:self_extractor_error
echo The make sfx should be %make_sfx%.
goto :done

:success
echo Successful! The target file is %install_file%.
goto :done

:done
echo It's done.
@pause