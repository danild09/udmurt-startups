# Исправление ошибки фронтенда

## Проблема
При запуске `npm run client` возникает ошибка:
```
Invalid options object. Dev Server has been initialized using an options object that does not match the API schema.
 - options.allowedHosts[0] should be a non-empty string.
```

## Решение

### Вариант 1: Автоматический (рекомендуется)

1. **Запустите скрипт:**
   ```bash
   create-client-env.bat
   ```
   Или дважды кликните на файл `create-client-env.bat`

2. **Запустите фронтенд:**
   ```bash
   npm run client
   ```

---

### Вариант 2: Ручной

1. **Создайте файл `client/.env`** со следующим содержимым:
   ```
   DANGEROUSLY_DISABLE_HOST_CHECK=true
   SKIP_PREFLIGHT_CHECK=true
   GENERATE_SOURCEMAP=false
   WDS_SOCKET_HOST=localhost
   WDS_SOCKET_PORT=3000
   ```

2. **Запустите фронтенд:**
   ```bash
   npm run client
   ```

---

### Вариант 3: Через PowerShell

Откройте PowerShell в папке проекта и выполните:
```powershell
cd client
"DANGEROUSLY_DISABLE_HOST_CHECK=true" | Out-File -FilePath .env -Encoding utf8
"SKIP_PREFLIGHT_CHECK=true" | Out-File -FilePath .env -Append -Encoding utf8
"GENERATE_SOURCEMAP=false" | Out-File -FilePath .env -Append -Encoding utf8
cd ..
npm run client
```

---

## Что делают эти настройки?

- `DANGEROUSLY_DISABLE_HOST_CHECK=true` - отключает проверку хоста (решает проблему с allowedHosts)
- `SKIP_PREFLIGHT_CHECK=true` - пропускает предварительные проверки
- `GENERATE_SOURCEMAP=false` - ускоряет сборку, отключая source maps
- `WDS_SOCKET_HOST` и `WDS_SOCKET_PORT` - настройки для Webpack Dev Server

---

## Если проблема сохраняется

1. **Удалите `node_modules` и переустановите:**
   ```bash
   cd client
   rmdir /s /q node_modules
   npm install
   cd ..
   ```

2. **Проверьте версию Node.js:**
   ```bash
   node --version
   ```
   Должна быть >= 14.0.0

3. **Попробуйте обновить react-scripts:**
   ```bash
   cd client
   npm install react-scripts@latest
   cd ..
   ```

---

## Ожидаемый результат

После исправления вы должны увидеть:
```
Compiled successfully!

You can now view udmurt-entrepreneurs-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Сайт автоматически откроется в браузере на `http://localhost:3000`

