@echo off
set firefox_path=
for /f "tokens=1 delims=" %%1 in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe" /V PATH^|findstr "PATH"') do (
	REM echo get the path item: %%1
	for /f "tokens=2 delims=REG_SZ" %%1 in ("%%1") do set firefox_path=%%1
)
if not "%firefox_path%"=="" (
	if not "%firefox_path:~0,1%"==" " (
		REM �����Կո�ͷ������windows XPƽ̨��
		set firefox_path=%firefox_path:~1%
	) else (
		goto :intercept
	)
)
REM echo firefox_path_in_XP=%firefox_path%
goto :eof
REM ɾ��������ߵĿո�
:intercept
if "%firefox_path:~0,1%"==" " set "firefox_path=%firefox_path:~1%"&goto intercept
REM echo firefox_path_in_win7=%firefox_path%

REM ɾ�������ұߵĿո�
REM :intercept
REM if "%firefox_path:~-1%"==" " set "firefox_path=%firefox_path:~0,~1%"&goto intercept
REM echo firefox_path=%firefox_path%