@echo off
chcp 65001 >nul
echo Создание файла .env для клиента...
(
echo DANGEROUSLY_DISABLE_HOST_CHECK=true
echo SKIP_PREFLIGHT_CHECK=true
echo GENERATE_SOURCEMAP=false
echo WDS_SOCKET_HOST=localhost
echo WDS_SOCKET_PORT=3000
) > client\.env
echo.
echo Файл client\.env создан!
echo.
echo Теперь запустите: npm run client
pause

