@echo off
chcp 65001 >nul
echo ========================================
echo Исправление проблем с сервером
echo ========================================
echo.

echo Шаг 1: Остановка всех процессов Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo Процессы Node.js остановлены
) else (
    echo Процессы Node.js не найдены (это нормально)
)
echo.

echo Шаг 2: Удаление старой базы данных...
if exist "server\database\database.sqlite" (
    del "server\database\database.sqlite"
    echo База данных удалена
) else (
    echo База данных не найдена
)
echo.

echo Шаг 3: Тестирование базы данных...
node test-db.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Ошибка при тестировании базы данных!
    echo Попробуйте запустить: node test-db.js
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ Все проверки пройдены!
echo.
echo Теперь запустите сервер: npm run dev
echo ========================================
pause

