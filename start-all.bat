@echo off
chcp 65001 >nul
echo ========================================
echo Запуск проекта "Поддержка предпринимателей"
echo ========================================
echo.
echo Запуск Backend сервера (порт 5000)...
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Запуск Frontend сервера (порт 3000)...
start "Frontend Server" cmd /k "npm run client"
echo.
echo ========================================
echo Оба сервера запущены!
echo.
echo Backend API: http://localhost:5000
echo Frontend сайт: http://localhost:3000
echo.
echo Откройте браузер: http://localhost:3000
echo ========================================
pause

