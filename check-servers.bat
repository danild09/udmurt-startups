@echo off
chcp 65001 >nul
echo ========================================
echo Проверка статуса серверов
echo ========================================
echo.

echo Проверка Backend (порт 5000)...
netstat -ano | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend сервер работает на порту 5000
    echo    API доступен: http://localhost:5000
) else (
    echo ❌ Backend сервер не запущен
)
echo.

echo Проверка Frontend (порт 3000)...
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend сервер работает на порту 3000
    echo    Сайт доступен: http://localhost:3000
) else (
    echo ❌ Frontend сервер не запущен
)
echo.

echo ========================================
echo Процессы Node.js:
tasklist | findstr node.exe
echo ========================================
pause

