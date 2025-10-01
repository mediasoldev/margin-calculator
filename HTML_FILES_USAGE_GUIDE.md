# 📄 Гайд по використанню HTML файлів у проекті

## 🎯 Огляд всіх HTML файлів та їх призначення

### 1️⃣ **public/install/install.html** - UI Інсталяції
**Коли використовується:** Автоматично при встановленні застосунку з Bitrix24
**Для чого:** Показує прогрес інсталяції користувачу

```html
<!-- Відкривається автоматично при інсталяції -->
<!-- URL: https://your-site.com/bitrix24-app/install/ -->
```

**Як тестувати:**
```bash
# Відкрийте в браузері для перегляду UI
https://your-site.com/bitrix24-app/install/install.html

# АБО встановіть застосунок з Bitrix24
Застосунки → Розробникам → Ваш застосунок → Встановити
```

---

### 2️⃣ **public/index.html** - Основний інтерфейс застосунку
**Коли використовується:** Кожен раз коли користувач відкриває застосунок
**Для чого:** Головний робочий інтерфейс вашого застосунку

```html
<!-- Це те, що бачить користувач після відкриття застосунку -->
<!-- URL: https://your-site.com/bitrix24-app/ -->
```

**Як модифікувати для вашого застосунку:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Мій Bitrix24 Застосунок</title>
    <script src="//api.bitrix24.com/api/v1/"></script>
    <!-- Додайте Vue.js або React тут -->
</head>
<body>
    <div id="app">
        <!-- Ваш інтерфейс тут -->
        <h1>Мій CRM Помічник</h1>
        
        <!-- Приклад функціоналу -->
        <div class="features">
            <button onclick="syncDeals()">Синхронізувати угоди</button>
            <button onclick="generateReport()">Створити звіт</button>
            <button onclick="bulkUpdate()">Масове оновлення</button>
        </div>
        
        <div id="results"></div>
    </div>
    
    <script>
        // Ваш JavaScript код
        BX24.init(function() {
            // Ініціалізація
        });
    </script>
</body>
</html>
```

---

### 3️⃣ **public/stats.html** - Дашборд статистики API
**Коли використовується:** Для моніторингу та аналізу роботи застосунку
**Для чого:** Адмін-панель для перегляду статистики

```html
<!-- Адмінська панель статистики -->
<!-- URL: https://your-site.com/bitrix24-app/stats.html -->
```

**Як використовувати:**
```javascript
// stats.html підключається до stats.php API
// Показує:
// - Кількість API викликів
// - Швидкість відповіді
// - Помилки
// - Rate limits
// - Графіки використання

// Відкрийте для моніторингу:
https://your-site.com/bitrix24-app/stats.html
```

**Додайте базову автентифікацію для захисту:**
```nginx
location /bitrix24-app/stats.html {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## 🧪 ТЕСТОВІ HTML СТОРІНКИ (створіть для розробки)

### 4️⃣ **test/api-test.html** - Тестування API endpoints
```html
<!DOCTYPE html>
<html>
<head>
    <title>API Tester</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .test { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>🧪 API Endpoint Tester</h1>
    
    <div class="test">
        <h2>Test Health Check</h2>
        <button onclick="testHealth()">Run Test</button>
        <div id="health-result"></div>
    </div>
    
    <div class="test">
        <h2>Test License Check</h2>
        <input type="text" id="domain" placeholder="domain.bitrix24.com">
        <button onclick="testLicense()">Check License</button>
        <div id="license-result"></div>
    </div>
    
    <div class="test">
        <h2>Test Webhook</h2>
        <button onclick="testWebhook()">Send Test Webhook</button>
        <div id="webhook-result"></div>
    </div>
    
    <script>
        async function testHealth() {
            const response = await fetch('/bitrix24-app/api/health.php');
            const data = await response.json();
            
            document.getElementById('health-result').innerHTML = 
                `<pre class="${data.status === 'ok' ? 'success' : 'error'}">${JSON.stringify(data, null, 2)}</pre>`;
        }
        
        async function testLicense() {
            const domain = document.getElementById('domain').value;
            const response = await fetch(`/bitrix24-app/api/rest.php/license/check?domain=${domain}`);
            const data = await response.json();
            
            document.getElementById('license-result').innerHTML = 
                `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
        
        async function testWebhook() {
            const response = await fetch('/bitrix24-app/api/webhook.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    event: 'TEST_EVENT',
                    auth: {
                        domain: 'test.bitrix24.com',
                        member_id: 'test123',
                        application_token: 'test_token'
                    }
                })
            });
            const data = await response.json();
            
            document.getElementById('webhook-result').innerHTML = 
                `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    </script>
</body>
</html>
```

---

### 5️⃣ **test/license-test.html** - Тестування ліцензійної системи
```html
<!DOCTYPE html>
<html>
<head>
    <title>License System Test</title>
    <script src="//api.bitrix24.com/api/v1/"></script>
    <style>
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .license-status { padding: 20px; margin: 20px 0; border-radius: 5px; }
        .trial { background: #fff3cd; }
        .licensed { background: #d4edda; }
        .expired { background: #f8d7da; }
        button { padding: 10px 20px; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 License System Test</h1>
        
        <div id="status" class="license-status">
            Loading status...
        </div>
        
        <div>
            <h2>Test Actions:</h2>
            <button onclick="checkStatus()">Check Status</button>
            <button onclick="simulateExpired()">Simulate Expired</button>
            <button onclick="activateLicense()">Activate License</button>
            <button onclick="checkWebhooks()">Check Webhooks</button>
        </div>
        
        <div>
            <h3>Activate License:</h3>
            <input type="text" id="license-key" placeholder="XXXX-XXXX-XXXX-XXXX">
            <button onclick="activateKey()">Activate</button>
        </div>
        
        <pre id="results"></pre>
    </div>
    
    <script>
        const APP_DATA = window.APP_DATA || {
            domain: 'test.bitrix24.com',
            app_sid: 'test_token'
        };
        
        async function checkStatus() {
            const response = await fetch(`/bitrix24-app/api/rest.php/license/check?domain=${APP_DATA.domain}`);
            const data = await response.json();
            
            updateUI(data.license_status);
            showResults(data);
        }
        
        function updateUI(status) {
            const statusDiv = document.getElementById('status');
            statusDiv.className = 'license-status ' + status.status;
            statusDiv.innerHTML = `
                <h2>Status: ${status.status.toUpperCase()}</h2>
                <p>Valid: ${status.is_valid ? '✅' : '❌'}</p>
                <p>Days Remaining: ${status.days_remaining || 0}</p>
                <p>Expires: ${status.expires_at || 'N/A'}</p>
            `;
        }
        
        async function simulateExpired() {
            // This would need backend endpoint to simulate
            alert('Check console for SQL to run:\n\nUPDATE app_portals SET trial_end_date = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE domain = "' + APP_DATA.domain + '";');
        }
        
        async function activateKey() {
            const key = document.getElementById('license-key').value;
            
            const response = await fetch('/bitrix24-app/api/rest.php/license/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + APP_DATA.app_sid
                },
                body: JSON.stringify({
                    domain: APP_DATA.domain,
                    license_key: key
                })
            });
            
            const data = await response.json();
            showResults(data);
            
            if (data.success) {
                alert('License activated successfully!');
                checkStatus();
            }
        }
        
        async function checkWebhooks() {
            const response = await fetch(`/bitrix24-app/api/rest.php/diagnostics/handlers?domain=${APP_DATA.domain}`);
            const data = await response.json();
            showResults(data);
        }
        
        function showResults(data) {
            document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
        
        // Check on load
        checkStatus();
    </script>
</body>
</html>
```

---

### 6️⃣ **test/webhook-test.html** - Симулятор вебхуків
```html
<!DOCTYPE html>
<html>
<head>
    <title>Webhook Simulator</title>
    <style>
        .webhook-form { background: #f5f5f5; padding: 20px; margin: 20px 0; }
        textarea { width: 100%; height: 200px; font-family: monospace; }
        .response { background: #f0f0f0; padding: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>🪝 Webhook Event Simulator</h1>
    
    <div class="webhook-form">
        <h2>Select Event Type:</h2>
        <select id="event-type" onchange="loadTemplate()">
            <option value="ONCRMDEALUPDATE">Deal Update</option>
            <option value="ONCRMCONTACTADD">Contact Add</option>
            <option value="ONTASKADD">Task Add</option>
            <option value="LICENSE">License Check</option>
        </select>
        
        <h3>Event Data:</h3>
        <textarea id="event-data">{
    "event": "ONCRMDEALUPDATE",
    "auth": {
        "domain": "test.bitrix24.com",
        "member_id": "abc123",
        "application_token": "test_token",
        "access_token": "test",
        "refresh_token": "test"
    },
    "data": {
        "FIELDS": {
            "ID": 123,
            "TITLE": "Test Deal"
        }
    }
}</textarea>
        
        <button onclick="sendWebhook()">Send Webhook</button>
    </div>
    
    <div class="response">
        <h3>Response:</h3>
        <pre id="response"></pre>
    </div>
    
    <script>
        function loadTemplate() {
            const type = document.getElementById('event-type').value;
            const templates = {
                'ONCRMDEALUPDATE': {
                    event: 'ONCRMDEALUPDATE',
                    data: {
                        FIELDS: {
                            ID: 123,
                            TITLE: 'Updated Deal',
                            STAGE_ID: 'NEW'
                        }
                    }
                },
                'ONCRMCONTACTADD': {
                    event: 'ONCRMCONTACTADD',
                    data: {
                        FIELDS: {
                            ID: 456,
                            NAME: 'John',
                            LAST_NAME: 'Doe',
                            EMAIL: [{VALUE: 'john@example.com', VALUE_TYPE: 'WORK'}]
                        }
                    }
                },
                'ONTASKADD': {
                    event: 'ONTASKADD',
                    data: {
                        FIELDS: {
                            ID: 789,
                            TITLE: 'New Task',
                            RESPONSIBLE_ID: 1
                        }
                    }
                },
                'LICENSE': {
                    event: 'LICENSE',
                    data: {
                        operation: 'check'
                    }
                }
            };
            
            const template = templates[type];
            template.auth = {
                domain: 'test.bitrix24.com',
                member_id: 'abc123',
                application_token: 'test_token',
                access_token: 'test',
                refresh_token: 'test'
            };
            
            document.getElementById('event-data').value = JSON.stringify(template, null, 4);
        }
        
        async function sendWebhook() {
            const data = document.getElementById('event-data').value;
            
            try {
                const response = await fetch('/bitrix24-app/api/webhook.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: data
                });
                
                const result = await response.json();
                document.getElementById('response').textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('response').textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

---

## 🚀 ЯК ВИКОРИСТОВУВАТИ ДЛЯ РОЗРОБКИ

### 1. Структура для тестування:
```
bitrix24-app/
├── public/
│   ├── index.html          # Основний застосунок
│   ├── stats.html          # Статистика (для адміна)
│   └── install/
│       └── install.html    # UI інсталяції
└── test/                   # Створіть цю папку для тестів
    ├── api-test.html       # Тестування API
    ├── license-test.html   # Тестування ліцензій  
    ├── webhook-test.html   # Симулятор вебхуків
    └── ui-test.html        # Тестування UI компонентів
```

### 2. Workflow розробки:

#### Крок 1: Тестування API
```bash
# Відкрийте API тестер
https://your-site.com/bitrix24-app/test/api-test.html

# Перевірте всі endpoints
- Health check
- License status  
- Webhook processing
```

#### Крок 2: Розробка функціоналу
```bash
# Працюйте з основним index.html
# Додавайте Vue.js/React компоненти
# Тестуйте в iframe Bitrix24
```

#### Крок 3: Моніторинг
```bash
# Відкривайте stats.html для моніторингу
https://your-site.com/bitrix24-app/stats.html

# Дивіться:
- Скільки API викликів
- Які помилки
- Performance metrics
```

---

## 💡 ПРАКТИЧНІ ІДЕЇ ВИКОРИСТАННЯ

### Ідея 1: Адмін панель
```html
<!-- admin.html - Панель адміністратора -->
<iframe src="stats.html" width="100%" height="400"></iframe>
<iframe src="test/api-test.html" width="100%" height="400"></iframe>
```

### Ідея 2: Debug режим
```javascript
// В index.html додайте debug panel
if (window.location.hash === '#debug') {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="debug-panel" style="position:fixed; bottom:0; left:0; right:0; background:#000; color:#0f0; padding:10px; font-family:monospace;">
            <div>Domain: ${APP_DATA.domain}</div>
            <div>Token: ${APP_DATA.app_sid.substr(0,10)}...</div>
            <div>License: <span id="debug-license">checking...</span></div>
        </div>
    `);
}
```

### Ідея 3: Швидке тестування
```bash
# Створіть скрипт test.sh
#!/bin/bash
echo "🧪 Running all tests..."

# Health check
curl -s https://your-site.com/bitrix24-app/api/health.php | jq .

# License check  
curl -s "https://your-site.com/bitrix24-app/api/rest.php/license/check?domain=test.bitrix24.com" | jq .

# Open test pages
open https://your-site.com/bitrix24-app/test/api-test.html
open https://your-site.com/bitrix24-app/stats.html

echo "✅ Test pages opened in browser"
```

---

## 📱 МОБІЛЬНЕ ТЕСТУВАННЯ

```html
<!-- mobile-test.html - Для тестування на мобільних -->
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mobile Test</title>
    <style>
        body { margin: 0; padding: 10px; }
        button { 
            width: 100%; 
            padding: 20px; 
            margin: 10px 0;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <h1>📱 Mobile Test</h1>
    <button onclick="location.href='index.html'">Open App</button>
    <button onclick="location.href='test/api-test.html'">Test API</button>
    <button onclick="location.href='stats.html'">View Stats</button>
</body>
</html>
```

---

## ✅ ПІДСУМОК

**Використовуйте HTML файли так:**

1. **index.html** - основний робочий інтерфейс
2. **stats.html** - моніторинг і статистика
3. **install.html** - автоматично при інсталяції
4. **test/*.html** - створіть для тестування під час розробки

**Порада:** Створіть папку `/test/` з усіма тестовими HTML файлами і додайте її в `.gitignore`, щоб не потрапила в production!