@echo off
SET firefox_appdata=%APPDATA%\Mozilla\Firefox
:: e.g. Profiles/qtbvczsn.default-1350021717888 read from %APPDATA%\Mozilla\Firefox\profiles.ini
SET firefox_profiles=
:: get the firefox profiles path
for /f "tokens=2 delims==" %%1 in ('type "%firefox_appdata%\profiles.ini"^|findstr "Path"') do (
	SET firefox_profiles=%%1
)

SET gm_script_dir=%firefox_appdata%\%firefox_profiles%\gm_scripts
ECHO gm_script_dir=%gm_script_dir% > _Deploy_Config.log
SET injector_dir=%gm_script_dir%\browser_sync_injecter
ECHO injector_dir=%injector_dir% >> _Deploy_Config.log
if not exist "%injector_dir%" mkdir "%injector_dir%"

:: copy the injecter config
copy _browser_sync_config.xml "%injector_dir%" /y >> _Deploy_Config.log

echo It's done.
echo 部署日志参见：_Deploy_Config.log