@echo off
REM ��װ������õĽű�
set location=%~dp0
ECHO ����ؼ��ļ�������
cd %location%
CALL %location%\_deploy_local.bat

ECHO ��Firefox,��װGreaseMonkey
CALL ..\injecter\install_gm.bat