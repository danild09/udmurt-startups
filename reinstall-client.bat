@echo off
chcp 65001 >nul
echo ========================================
echo Переустановка зависимостей клиента
echo ========================================
echo.

cd client

echo Удаление node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✅ node_modules удален
) else (
    echo node_modules не найден
)

echo.
echo Удаление package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✅ package-lock.json удален
)

echo.
echo Установка зависимостей...
call npm install

echo.
echo ========================================
echo ✅ Готово! Теперь запустите: npm run client
echo ========================================
cd ..
pause

