@echo off
REM 安装程序调用的脚本
set location=%~dp0
ECHO 部署关键文件到本地
cd %location%
CALL %location%\_deploy_local.bat