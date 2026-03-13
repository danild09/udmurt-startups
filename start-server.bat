@echo off
chcp 65001 >nul
echo Проверка установки зависимостей...
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install
)

echo Запуск сервера...
node server/index.js
pause

