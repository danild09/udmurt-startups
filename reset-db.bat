@echo off
chcp 65001 >nul
echo Удаление старой базы данных...
if exist "server\database\database.sqlite" (
    del "server\database\database.sqlite"
    echo База данных удалена
) else (
    echo База данных не найдена
)
echo.
echo Теперь запустите сервер: npm run dev
pause

