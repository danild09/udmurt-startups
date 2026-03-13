// Скрипт для проверки готовности сервера к запуску
const fs = require('fs');
const path = require('path');

console.log('Проверка готовности сервера...\n');

// Проверка зависимостей
const packageJson = require('./package.json');
const requiredDeps = Object.keys(packageJson.dependencies || {});
const nodeModulesPath = path.join(__dirname, 'node_modules');

let allDepsInstalled = true;
requiredDeps.forEach(dep => {
  const depPath = path.join(nodeModulesPath, dep);
  if (!fs.existsSync(depPath)) {
    console.log(`❌ Отсутствует: ${dep}`);
    allDepsInstalled = false;
  }
});

if (allDepsInstalled) {
  console.log('✅ Все зависимости установлены');
} else {
  console.log('\n⚠️  Запустите: npm install');
  process.exit(1);
}

// Проверка файлов сервера
const serverFiles = [
  'server/index.js',
  'server/database/init.js',
  'server/routes/auth.js',
  'server/routes/content.js',
  'server/routes/guide.js',
  'server/routes/market.js',
  'server/routes/contacts.js'
];

let allFilesExist = true;
serverFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Отсутствует файл: ${file}`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✅ Все файлы сервера на месте');
} else {
  console.log('\n⚠️  Некоторые файлы отсутствуют');
  process.exit(1);
}

// Проверка .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Файл .env отсутствует (будет использован порт по умолчанию)');
} else {
  console.log('✅ Файл .env найден');
}

console.log('\n✅ Сервер готов к запуску!');
console.log('Запустите: npm start или node server/index.js');

