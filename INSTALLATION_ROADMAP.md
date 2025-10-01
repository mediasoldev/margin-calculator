# 🚀 Покрокова Дорожня Карта Встановлення Bitrix24 App

## 📋 Передумови

### Що вам потрібно мати:
- ✅ Діючий сервер з доменом
- ✅ PHP 7.4+ (перевірте: `php -v`)
- ✅ MySQL/MariaDB (перевірте: `mysql --version`)
- ✅ SSL сертифікат (HTTPS обов'язковий!)
- ✅ Доступ до Bitrix24 порталу як адміністратор

## 🎯 ЕТАП 1: Підготовка сервера (15 хв)

### 1.1. Перевірка PHP модулів
```bash
# Перевірте наявність модулів
php -m | grep -E "pdo|mysql|curl|json|mbstring|openssl"

# Якщо чогось не вистачає, встановіть:
sudo apt-get update
sudo apt-get install php-mysql php-curl php-json php-mbstring php-xml
```

### 1.2. Створення структури каталогів
```bash
# Припустимо ваш сайт в /var/www/your-site.com
cd /var/www/your-site.com

# Створіть каталог для застосунку
mkdir bitrix24-app
cd bitrix24-app

# Створіть структуру проекту
mkdir -p public/install public/api
mkdir -p backend/{config,lib/{Core,Bitrix},handlers/events}
mkdir -p storage/{logs,cache,temp}
mkdir -p scripts
mkdir -p docs
```

### 1.3. Встановлення прав доступу
```bash
# Дайте права веб-серверу
sudo chown -R www-data:www-data storage/
sudo chmod -R 775 storage/
```

## 🎯 ЕТАП 2: Створення конфігурації (20 хв)

### 2.1. Створіть базу даних
```bash
# Увійдіть в MySQL
mysql -u root -p

# Створіть БД та користувача
CREATE DATABASE bitrix24_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bitrix_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON bitrix24_app.* TO 'bitrix_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2. Створіть файл .env
```bash
cd /var/www/your-site.com/bitrix24-app
nano .env
```

Вставте і відредагуйте:
```env
# Application
APP_ENV=development
APP_DEBUG=true
APP_URL=https://your-site.com/bitrix24-app
APP_TIMEZONE=Europe/Kiev

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bitrix24_app
DB_USER=bitrix_user
DB_PASS=your_strong_password_here
DB_CHARSET=utf8mb4
DB_PREFIX=app_

# Bitrix24 (поки залиште порожнім - заповните після реєстрації)
BITRIX_APP_ID=
BITRIX_APP_SECRET=

# Logging
LOG_LEVEL=debug
LOG_PATH=storage/logs

# Admin email
ADMIN_EMAIL=your-email@example.com
```

### 2.3. Налаштуйте веб-сервер

#### Для Nginx:
```nginx
# /etc/nginx/sites-available/your-site.com
# Додайте цей location блок в існуючий server блок

location /bitrix24-app {
    alias /var/www/your-site.com/bitrix24-app/public;
    index index.php;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        include fastcgi_params;
    }
    
    location ~ /\. {
        deny all;
    }
}

# Перезавантажте nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### Для Apache:
```apache
# Додайте в .htaccess в корені bitrix24-app
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php/$1 [L]
```

## 🎯 ЕТАП 3: Встановлення файлів застосунку (30 хв)

### 3.1. Завантажте основні файли

Створіть файли з документації в відповідних каталогах:

```bash
# Список файлів для створення:
# backend/bootstrap.php
# backend/config/app.php
# backend/config/database.php
# backend/config/routes.php
# backend/lib/Core/Database.php
# backend/lib/Core/Logger.php
# backend/lib/Core/Response.php
# backend/lib/Bitrix/CRest.php
# backend/lib/Bitrix/TokenManager.php
# backend/lib/Bitrix/WebhookManager.php
# backend/handlers/BaseHandler.php
# backend/handlers/events/InstallHandler.php
# backend/handlers/events/UninstallHandler.php
# backend/handlers/events/LicenseHandler.php
# public/index.php
# public/install/index.php
# public/install/install.html
# public/install/install.js
# public/api/webhook.php
# public/api/rest.php
# public/api/health.php
# scripts/check_expired_licenses.php
```

### 3.2. Створіть простий тестовий index.php
```bash
nano public/index.php
```

```php
<?php
// public/index.php - Простий тестовий застосунок
require_once __DIR__ . '/../backend/bootstrap.php';

use Core\Database;
use Core\Logger;

$logger = new Logger('app');

// Отримати параметри від Bitrix24
$domain = $_REQUEST['DOMAIN'] ?? '';
$authId = $_REQUEST['AUTH_ID'] ?? '';
$authExpires = $_REQUEST['AUTH_EXPIRES'] ?? '';
$appSid = $_REQUEST['APP_SID'] ?? '';
$refreshId = $_REQUEST['REFRESH_ID'] ?? '';
$memberId = $_REQUEST['member_id'] ?? '';

// Перевірка чи це інсталяція
if (empty($domain)) {
    die('Please install this app from Bitrix24 marketplace');
}

// Підготовка даних для фронтенду
$appData = [
    'domain' => $domain,
    'auth_id' => $authId,
    'auth_expires' => $authExpires,
    'app_sid' => $appSid,
    'refresh_id' => $refreshId,
    'member_id' => $memberId
];
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bitrix24 Test App</title>
    <script src="//api.bitrix24.com/api/v1/"></script>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
        .success { color: green; }
        .error { color: red; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🎉 Bitrix24 Test Application</h1>
    
    <div class="info">
        <strong>Domain:</strong> <?php echo htmlspecialchars($domain); ?><br>
        <strong>Portal ID:</strong> <?php echo htmlspecialchars($memberId); ?>
    </div>
    
    <div id="user-info" class="info">
        <strong>Loading user info...</strong>
    </div>
    
    <div>
        <h2>Test Functions:</h2>
        <button onclick="testGetDeals()">Get Deals</button>
        <button onclick="testGetContacts()">Get Contacts</button>
        <button onclick="testCreateTask()">Create Test Task</button>
    </div>
    
    <div id="results" class="info" style="display:none;">
        <h3>Results:</h3>
        <pre id="results-content"></pre>
    </div>

    <script>
        window.APP_DATA = <?php echo json_encode($appData); ?>;
        
        // Initialize BX24
        BX24.init(function() {
            console.log('BX24 initialized');
            BX24.fitWindow();
            
            // Get current user
            BX24.callMethod('user.current', {}, function(result) {
                if (result.error()) {
                    document.getElementById('user-info').innerHTML = 
                        '<span class="error">Error loading user: ' + result.error() + '</span>';
                } else {
                    var user = result.data();
                    document.getElementById('user-info').innerHTML = 
                        '<span class="success">✓ Logged in as: ' + user.NAME + ' ' + user.LAST_NAME + '</span>';
                }
            });
        });
        
        function testGetDeals() {
            BX24.callMethod('crm.deal.list', {
                select: ['ID', 'TITLE', 'OPPORTUNITY'],
                filter: { '>OPPORTUNITY': 0 },
                order: { 'ID': 'DESC' },
                limit: 5
            }, function(result) {
                showResults(result.error() ? result.error() : result.data());
            });
        }
        
        function testGetContacts() {
            BX24.callMethod('crm.contact.list', {
                select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL'],
                order: { 'ID': 'DESC' },
                limit: 5
            }, function(result) {
                showResults(result.error() ? result.error() : result.data());
            });
        }
        
        function testCreateTask() {
            BX24.callMethod('tasks.task.add', {
                fields: {
                    TITLE: 'Test Task from App - ' + new Date().toLocaleString(),
                    DESCRIPTION: 'This is a test task created from Bitrix24 app',
                    RESPONSIBLE_ID: 1
                }
            }, function(result) {
                if (result.error()) {
                    showResults('Error: ' + result.error());
                } else {
                    showResults('Task created! ID: ' + result.data().task.id);
                }
            });
        }
        
        function showResults(data) {
            document.getElementById('results').style.display = 'block';
            document.getElementById('results-content').textContent = JSON.stringify(data, null, 2);
        }
    </script>
</body>
</html>
```

## 🎯 ЕТАП 4: Реєстрація в Bitrix24 (15 хв)

### 4.1. Увійдіть в свій Bitrix24 портал
```
https://your-company.bitrix24.ua/
```

### 4.2. Перейдіть до розділу розробника
```
Застосунки → Розробникам → Додати застосунок
або
Applications → Developer resources → Add application
```

### 4.3. Заповніть форму:
- **Тип**: `Серверний застосунок` / `Online application`
- **Назва**: `Test App`
- **URL обробника**: `https://your-site.com/bitrix24-app/install/`
- **URL для установки**: `https://your-site.com/bitrix24-app/install/`

### 4.4. Збережіть CLIENT_ID та CLIENT_SECRET
Додайте їх в .env файл:
```env
BITRIX_APP_ID=local.5f3b9a1b2c7e8.12345678
BITRIX_APP_SECRET=ABcdEFghIJklMNopQRstUVwxYZ1234567890
```

## 🎯 ЕТАП 5: Перший тестовий запуск (10 хв)

### 5.1. Перевірте health endpoint
```bash
# В браузері відкрийте:
https://your-site.com/bitrix24-app/api/health.php

# Або через curl:
curl https://your-site.com/bitrix24-app/api/health.php
```

Ви повинні побачити:
```json
{
  "status": "ok",
  "checks": {
    "database": {"status": "ok"},
    "filesystem": {"status": "ok"}
  }
}
```

### 5.2. Встановіть застосунок в Bitrix24
1. Перейдіть в `Застосунки → Розробникам`
2. Знайдіть ваш застосунок
3. Натисніть `Встановити`
4. Дочекайтесь завершення інсталяції

### 5.3. Відкрийте застосунок
1. Перейдіть в `Застосунки → Встановлені`
2. Знайдіть ваш застосунок
3. Відкрийте його

## 🎯 ЕТАП 6: Налаштування Cron (5 хв)

### 6.1. Відкрийте crontab
```bash
crontab -e
```

### 6.2. Додайте задачу для перевірки ліцензій
```cron
# Щоденна перевірка о 2:00 ночі
0 2 * * * /usr/bin/php /var/www/your-site.com/bitrix24-app/scripts/check_expired_licenses.php >> /var/log/bitrix24-license.log 2>&1
```

## 🎯 ЕТАП 7: Тестування (20 хв)

### 7.1. Тест Trial періоду
```bash
# Перевірте статус ліцензії
mysql -u bitrix_user -p bitrix24_app -e "
SELECT domain, is_trial, trial_end_date, license_key 
FROM app_portals WHERE domain = 'your.bitrix24.ua';
"
```

### 7.2. Тест API викликів
В застосунку натисніть кнопки:
- `Get Deals` - отримає список угод
- `Get Contacts` - отримає список контактів  
- `Create Test Task` - створить тестове завдання

### 7.3. Тест webhook
```bash
# Відправте тестовий webhook
curl -X POST https://your-site.com/bitrix24-app/api/webhook.php \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ONCRMDEALUPDATE",
    "auth": {
      "domain": "your.bitrix24.ua",
      "member_id": "test123",
      "application_token": "test_token"
    },
    "data": {
      "FIELDS": {
        "ID": 123
      }
    }
  }'
```

### 7.4. Перевірка логів
```bash
# Перегляд логів
tail -f storage/logs/app-*.log
tail -f storage/logs/webhook-*.log
```

## 🎯 ЕТАП 8: Створення простого функціоналу (30 хв)

### 8.1. Створіть простий обробник для Deal
```php
// backend/handlers/events/CRM/DealUpdateHandler.php
<?php
namespace Handlers\Events\CRM;

use Handlers\BaseHandler;

class DealUpdateHandler extends BaseHandler {
    public function handle(): array {
        $dealId = $this->getEventField('ID');
        
        // Отримати дані угоди
        $deal = $this->callBitrixMethod('crm.deal.get', ['id' => $dealId]);
        
        // Логувати
        $this->logger->info('Deal updated', [
            'id' => $dealId,
            'title' => $deal['result']['TITLE'] ?? ''
        ]);
        
        // Додати коментар до угоди
        $this->addCrmComment('deal', $dealId, 
            'Угода оновлена через застосунок о ' . date('H:i:s'));
        
        return [
            'success' => true,
            'data' => ['processed' => true]
        ];
    }
}
```

### 8.2. Зареєструйте обробник
```php
// backend/config/routes.php
return [
    'oncrmdealupdate' => \Handlers\Events\CRM\DealUpdateHandler::class,
    // інші обробники...
];
```

## ✅ ЧЕКЛИСТ ПЕРЕВІРКИ

```markdown
[ ] PHP 7.4+ встановлено
[ ] MySQL база створена
[ ] .env файл налаштований
[ ] Структура каталогів створена
[ ] Права доступу встановлені (storage/ - 775)
[ ] SSL сертифікат працює
[ ] Застосунок зареєстрований в Bitrix24
[ ] CLIENT_ID та SECRET додані в .env
[ ] Health check повертає "ok"
[ ] Застосунок встановлюється без помилок
[ ] Застосунок відкривається в Bitrix24
[ ] API виклики працюють
[ ] Логи пишуться в storage/logs/
[ ] Cron задача додана
[ ] Trial період активний (14 днів)
```

## 🚨 ЯКЩО ЩОСЬ НЕ ПРАЦЮЄ

### Помилка 500
```bash
# Перевірте логи PHP
tail -f /var/log/php/error.log

# Перевірте права доступу
ls -la storage/
```

### База даних не підключається
```bash
# Перевірте з'єднання
mysql -u bitrix_user -p bitrix24_app -e "SELECT 1;"

# Перевірте .env
cat .env | grep DB_
```

### Застосунок не встановлюється
- Перевірте чи URL доступний ззовні
- Перевірте SSL сертифікат
- Перегляньте логи: `tail -f storage/logs/webhook-*.log`

### "Portal not found"
```bash
# Перевірте чи портал в БД
mysql -u bitrix_user -p bitrix24_app -e "SELECT * FROM app_portals;"
```

## 📞 КОНТАКТИ ДЛЯ ДОПОМОГИ

- Bitrix24 документація: https://dev.1c-bitrix.ru/rest_help/
- Форум розробників: https://dev.1c-bitrix.ru/community/forums/

## 🎉 ВІТАЄМО!

Якщо все працює - ваш перший Bitrix24 застосунок готовий! 

Тепер ви можете:
1. Додавати нові обробники подій
2. Створювати власний інтерфейс
3. Інтегрувати з CRM, завданнями, контактами
4. Автоматизувати бізнес-процеси

---

**Час на все встановлення: ~2 години**