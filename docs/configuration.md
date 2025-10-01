# Configuration Documentation

## Overview

The application uses environment variables (.env file) and PHP configuration files for settings management. Configuration is loaded during bootstrap and available throughout the application.

## Environment Variables (.env)

### Creating .env File

```bash
# Copy example file
cp .env.example .env

# Edit with your settings
nano .env
```

### Environment Variables Reference

```bash
# Application Environment
APP_ENV=development|production|staging
APP_DEBUG=true|false
APP_URL=https://your-domain.com
APP_TIMEZONE=Europe/Kiev|UTC|America/New_York

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bitrix_app
DB_USER=your_username
DB_PASS=your_password
DB_CHARSET=utf8mb4
DB_PREFIX=app_

# Bitrix24 OAuth Credentials
BITRIX_APP_ID=your.app.client.id.here
BITRIX_APP_SECRET=your.app.client.secret.here

# Logging Configuration
LOG_LEVEL=debug|info|warning|error|critical
LOG_PATH=storage/logs
LOG_MAX_FILES=30
LOG_SINGLE_FILE=false

# Cache Configuration
CACHE_ENABLED=false|true
CACHE_DRIVER=file|redis|memcached
CACHE_TTL=3600
CACHE_PREFIX=app_

# Security Settings
VERIFY_SSL=true|false
ALLOWED_DOMAINS=domain1.com,domain2.com
CORS_ORIGINS=*|https://example.com
SESSION_LIFETIME=7200

# Rate Limiting
RATE_LIMIT_ENABLED=true|false
RATE_LIMIT_PER_SECOND=2
RATE_LIMIT_BURST=10

# Email Configuration (Optional)
MAIL_DRIVER=smtp|sendmail|mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls|ssl
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="Bitrix24 App"

# Redis Configuration (if using Redis cache)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
REDIS_DATABASE=0

# Memcached Configuration (if using Memcached)
MEMCACHED_HOST=127.0.0.1
MEMCACHED_PORT=11211
```

## PHP Configuration Files

### Application Configuration (app.php)

Location: `backend/config/app.php`

```php
return [
    // Application info
    'app' => [
        'name' => 'Bitrix24 App Template',
        'version' => '1.0.0',
        'description' => 'Your application description',
        'url' => $_ENV['APP_URL'] ?? '',
        'debug' => ($_ENV['APP_DEBUG'] ?? 'false') === 'true',
        'timezone' => $_ENV['APP_TIMEZONE'] ?? 'UTC',
    ],
    
    // Bitrix24 OAuth
    'bitrix' => [
        'client_id' => $_ENV['BITRIX_APP_ID'] ?? '',
        'client_secret' => $_ENV['BITRIX_APP_SECRET'] ?? '',
        'oauth_url' => 'https://oauth.bitrix.info/oauth/token/',
        'scope' => [
            'crm',        // CRM access
            'task',       // Tasks access
            'tasks',      // Tasks extended
            'user',       // User info
            'entity',     // Entity storage
            'placement',  // UI placements
            'im',         // Instant messaging
            'log',        // Activity stream
            'sonet_group',// Workgroups
            'department', // Company structure
            'disk',       // Disk storage
            'calendar',   // Calendar access
        ],
    ],
    
    // Webhook configuration
    'webhook' => [
        'endpoint' => '/api/webhook.php',
        'allowed_events' => [
            // Application lifecycle
            'ONAPPINSTALL',
            'ONAPPUNINSTALL',
            'ONAPPUPDATE',
            'ONAPPPAYMENT',
            
            // CRM Deal events
            'ONCRMDEALUPDATE',
            'ONCRMDEALDELETE',
            'ONCRMDEALADD',
            
            // Add more as needed
        ],
        'verify_signature' => false, // Enable if using webhook signatures
        'signature_key' => $_ENV['WEBHOOK_SIGNATURE_KEY'] ?? '',
    ],
    
    // Security settings
    'security' => [
        'check_auth' => true,
        'verify_ssl' => ($_ENV['VERIFY_SSL'] ?? 'true') === 'true',
        'allowed_domains' => array_filter(explode(',', $_ENV['ALLOWED_DOMAINS'] ?? '')),
        'token_lifetime' => 3600,
        'session_lifetime' => $_ENV['SESSION_LIFETIME'] ?? 7200,
        'csrf_protection' => true,
        'xss_protection' => true,
    ],
    
    // Rate limiting
    'rate_limit' => [
        'enabled' => ($_ENV['RATE_LIMIT_ENABLED'] ?? 'true') === 'true',
        'requests_per_second' => $_ENV['RATE_LIMIT_PER_SECOND'] ?? 2,
        'burst_limit' => $_ENV['RATE_LIMIT_BURST'] ?? 10,
        'storage' => 'database', // database|redis|memory
    ],
    
    // Portal defaults
    'portal_defaults' => [
        'trial_days' => 14,
        'max_users' => 0, // 0 = unlimited
        'features' => [
            'crm' => true,
            'tasks' => true,
            'reports' => true,
            'automation' => true,
            'api_access' => true,
        ],
        'api_limits' => [
            'calls_per_minute' => 120,
            'batch_size' => 50,
        ]
    ],
    
    // License server (if implemented)
    'license_server' => [
        'enabled' => false,
        'url' => 'https://license.your-domain.com',
        'api_key' => $_ENV['LICENSE_SERVER_KEY'] ?? '',
        'timeout' => 30,
    ]
];
```

### Database Configuration (database.php)

Location: `backend/config/database.php`

```php
return [
    // Connection settings
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? 3306,
    'name' => $_ENV['DB_NAME'] ?? 'bitrix_app',
    'user' => $_ENV['DB_USER'] ?? 'root',
    'pass' => $_ENV['DB_PASS'] ?? '',
    'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => $_ENV['DB_PREFIX'] ?? 'app_',
    
    // PDO options
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_PERSISTENT => false, // Set true for persistent connections
    ],
    
    // Connection pool
    'pool' => [
        'min_connections' => 1,
        'max_connections' => 10,
        'connection_timeout' => 30,
        'idle_timeout' => 60,
        'retry_attempts' => 3,
        'retry_delay' => 1000, // milliseconds
    ],
    
    // Auto-maintenance
    'auto_create_tables' => true,
    'auto_migrate' => false,
    'backup_before_migrate' => true,
    
    // Table names (without prefix)
    'tables' => [
        'portals' => 'portals',
        'settings' => 'settings',
        'tokens' => 'tokens',
        'logs' => 'logs',
        'cache' => 'cache',
        'api_calls' => 'api_calls',
        'queue' => 'queue',
    ],
    
    // Maintenance settings
    'maintenance' => [
        'clean_logs_after' => 30, // days
        'clean_tokens_after' => 90,
        'clean_cache_after' => 7,
        'clean_api_calls_after' => 7,
        'optimize_tables' => true,
    ]
];
```

### Routes Configuration (routes.php)

Location: `backend/config/routes.php`

```php
return [
    // System events
    'onappinstall' => \Handlers\Events\InstallHandler::class,
    'onappuninstall' => \Handlers\Events\UninstallHandler::class,
    'onappupdate' => \Handlers\Events\UpdateHandler::class,
    'onapppayment' => \Handlers\Events\PaymentHandler::class,
    
    // License management
    'license' => \Handlers\Events\LicenseHandler::class,
    'onlicense' => \Handlers\Events\LicenseHandler::class,
    
    // CRM events - can group by entity
    'crm' => [
        'deal' => [
            'add' => \Handlers\Events\CRM\DealAddHandler::class,
            'update' => \Handlers\Events\CRM\DealUpdateHandler::class,
            'delete' => \Handlers\Events\CRM\DealDeleteHandler::class,
        ],
        'contact' => [
            'add' => \Handlers\Events\CRM\ContactAddHandler::class,
            'update' => \Handlers\Events\CRM\ContactUpdateHandler::class,
            'delete' => \Handlers\Events\CRM\ContactDeleteHandler::class,
        ],
    ],
    
    // Direct mapping for Bitrix24 events
    'oncrmdealupdate' => \Handlers\Events\CRM\DealUpdateHandler::class,
    'oncrmdealadd' => \Handlers\Events\CRM\DealAddHandler::class,
    
    // Diagnostics
    'diagnostics' => \Handlers\Events\DiagnosticsHandler::class,
    
    // Default handler for unknown events
    'default' => \Handlers\Events\DefaultHandler::class,
];
```

## Logging Configuration

### Log Levels

```php
// Available log levels (from most to least severe)
emergency   // System is unusable
alert       // Action must be taken immediately
critical    // Critical conditions
error       // Error conditions
warning     // Warning conditions
notice      // Normal but significant condition
info        // Informational messages
debug       // Debug-level messages
```

### Configuring Log Channels

```php
// backend/config/logging.php (if needed)
return [
    'default' => $_ENV['LOG_CHANNEL'] ?? 'app',
    
    'channels' => [
        'app' => [
            'driver' => 'daily',
            'path' => storage_path('logs/app.log'),
            'level' => $_ENV['LOG_LEVEL'] ?? 'info',
            'days' => 30,
        ],
        
        'error' => [
            'driver' => 'single',
            'path' => storage_path('logs/error.log'),
            'level' => 'error',
        ],
        
        'webhook' => [
            'driver' => 'daily',
            'path' => storage_path('logs/webhook.log'),
            'level' => 'info',
            'days' => 7,
        ],
        
        'api' => [
            'driver' => 'daily',
            'path' => storage_path('logs/api.log'),
            'level' => 'warning',
            'days' => 14,
        ],
        
        'bitrix' => [
            'driver' => 'daily',
            'path' => storage_path('logs/bitrix.log'),
            'level' => 'info',
            'days' => 7,
        ],
    ]
];
```

## Cache Configuration

### File Cache

```php
// Default cache configuration
'cache' => [
    'enabled' => true,
    'driver' => 'file',
    'path' => STORAGE_PATH . '/cache',
    'ttl' => 3600, // 1 hour default
    'prefix' => 'app_',
]
```

### Redis Cache

```bash
# .env configuration
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DATABASE=0
```

```php
// Redis implementation
class RedisCache {
    private $redis;
    
    public function __construct() {
        $this->redis = new Redis();
        $this->redis->connect(
            $_ENV['REDIS_HOST'],
            $_ENV['REDIS_PORT']
        );
        
        if ($_ENV['REDIS_PASSWORD']) {
            $this->redis->auth($_ENV['REDIS_PASSWORD']);
        }
    }
    
    public function get($key) {
        return $this->redis->get($key);
    }
    
    public function set($key, $value, $ttl = 3600) {
        return $this->redis->setex($key, $ttl, $value);
    }
}
```

### Memcached Cache

```bash
# .env configuration
CACHE_DRIVER=memcached
MEMCACHED_HOST=127.0.0.1
MEMCACHED_PORT=11211
```

## API Configuration

### CORS Settings

```php
// backend/config/cors.php
return [
    'enabled' => true,
    
    'origins' => [
        '*', // Allow all origins
        // Or specific origins:
        // 'https://example.bitrix24.com',
        // 'https://another.bitrix24.com',
    ],
    
    'methods' => [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
    ],
    
    'headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Bitrix-Domain',
    ],
    
    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
    ],
    
    'credentials' => true,
    'max_age' => 86400, // 24 hours
];
```

### API Rate Limiting

```php
// backend/config/ratelimit.php
return [
    'enabled' => true,
    
    // Global limits
    'global' => [
        'requests_per_minute' => 120,
        'requests_per_hour' => 5000,
    ],
    
    // Per-endpoint limits
    'endpoints' => [
        'bitrix/call' => [
            'requests_per_minute' => 60,
        ],
        'bitrix/batch' => [
            'requests_per_minute' => 30,
        ],
        'license/activate' => [
            'requests_per_hour' => 10,
        ],
    ],
    
    // IP-based limits
    'ip_limits' => [
        'requests_per_minute' => 60,
        'requests_per_hour' => 1000,
    ],
    
    // Response headers
    'headers' => [
        'limit' => 'X-RateLimit-Limit',
        'remaining' => 'X-RateLimit-Remaining',
        'reset' => 'X-RateLimit-Reset',
    ]
];
```

## Multi-Environment Configuration

### Development Environment

```bash
# .env.development
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_HOST=localhost
DB_NAME=bitrix_dev

LOG_LEVEL=debug
CACHE_ENABLED=false
RATE_LIMIT_ENABLED=false
```

### Staging Environment

```bash
# .env.staging
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging.your-domain.com

DB_HOST=staging-db.local
DB_NAME=bitrix_staging

LOG_LEVEL=info
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Production Environment

```bash
# .env.production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.your-domain.com

DB_HOST=prod-db.cluster.local
DB_NAME=bitrix_prod

LOG_LEVEL=warning
CACHE_ENABLED=true
CACHE_DRIVER=redis
RATE_LIMIT_ENABLED=true
```

### Loading Environment-Specific Config

```php
// In bootstrap.php
$environment = $_ENV['APP_ENV'] ?? 'production';
$envFile = ROOT_PATH . '/.env.' . $environment;

if (file_exists($envFile)) {
    loadEnv($envFile);
} else {
    loadEnv(ROOT_PATH . '/.env');
}
```

## Custom Configuration Files

### Creating Custom Config

```php
// backend/config/custom.php
return [
    'feature_flags' => [
        'new_ui' => true,
        'advanced_reports' => false,
        'ai_integration' => false,
    ],
    
    'integrations' => [
        'slack' => [
            'enabled' => false,
            'webhook_url' => $_ENV['SLACK_WEBHOOK_URL'] ?? '',
        ],
        'telegram' => [
            'enabled' => false,
            'bot_token' => $_ENV['TELEGRAM_BOT_TOKEN'] ?? '',
        ],
    ],
    
    'business_rules' => [
        'auto_assign_deals' => true,
        'notification_delay' => 300, // seconds
        'max_retries' => 3,
    ]
];
```

### Loading Custom Config

```php
class Config {
    private static $configs = [];
    
    public static function load($name) {
        if (!isset(self::$configs[$name])) {
            $file = CONFIG_PATH . '/' . $name . '.php';
            if (file_exists($file)) {
                self::$configs[$name] = require $file;
            }
        }
        return self::$configs[$name] ?? [];
    }
    
    public static function get($key, $default = null) {
        $keys = explode('.', $key);
        $config = self::load(array_shift($keys));
        
        foreach ($keys as $k) {
            if (isset($config[$k])) {
                $config = $config[$k];
            } else {
                return $default;
            }
        }
        
        return $config;
    }
}

// Usage
$featureEnabled = Config::get('custom.feature_flags.new_ui', false);
$slackEnabled = Config::get('custom.integrations.slack.enabled');
```

## Performance Tuning

### PHP Configuration

```ini
; php.ini optimizations
memory_limit = 256M
max_execution_time = 300
post_max_size = 50M
upload_max_filesize = 50M
max_input_time = 300
max_input_vars = 10000

; OPcache settings
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
opcache.revalidate_freq = 0
opcache.fast_shutdown = 1
```

### MySQL Configuration

```ini
# my.cnf optimizations
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2

query_cache_type = 1
query_cache_size = 128M
query_cache_limit = 2M

max_connections = 200
thread_cache_size = 50
table_open_cache = 400
```

### Web Server Configuration

#### Nginx

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    root /var/www/bitrix24-app/public;
    index index.php;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Timeouts for long-running scripts
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

#### Apache

```apache
# .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php/$1 [L]
</IfModule>

# Security
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# PHP settings
<IfModule mod_php7.c>
    php_value memory_limit 256M
    php_value max_execution_time 300
    php_value post_max_size 50M
    php_value upload_max_filesize 50M
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

## Security Configuration

### Security Headers

```php
// In bootstrap.php or index.php
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: same-origin');
header('Content-Security-Policy: default-src \'self\' https://*.bitrix24.com');
```

### Input Validation

```php
// backend/config/validation.php
return [
    'rules' => [
        'domain' => 'required|regex:/^[a-z0-9\-]+\.bitrix24\.(com|ru|de|ua)$/',
        'license_key' => 'required|regex:/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/',
        'email' => 'email|max:255',
        'user_id' => 'integer|min:1',
    ],
    
    'messages' => [
        'domain.required' => 'Domain is required',
        'domain.regex' => 'Invalid domain format',
        'license_key.regex' => 'Invalid license key format',
    ]
];
```

## Deployment Configuration

### Environment Detection

```php
// Detect environment automatically
function detectEnvironment() {
    $domain = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    if (strpos($domain, 'localhost') !== false) {
        return 'development';
    } elseif (strpos($domain, 'staging') !== false) {
        return 'staging';
    } else {
        return 'production';
    }
}

$_ENV['APP_ENV'] = $_ENV['APP_ENV'] ?? detectEnvironment();
```

### Configuration Caching

```php
class ConfigCache {
    private static $cacheFile = STORAGE_PATH . '/cache/config.php';
    
    public static function cache() {
        $configs = [
            'app' => require CONFIG_PATH . '/app.php',
            'database' => require CONFIG_PATH . '/database.php',
            'routes' => require CONFIG_PATH . '/routes.php',
        ];
        
        $content = '<?php return ' . var_export($configs, true) . ';';
        file_put_contents(self::$cacheFile, $content);
    }
    
    public static function load() {
        if (file_exists(self::$cacheFile)) {
            return require self::$cacheFile;
        }
        return null;
    }
    
    public static function clear() {
        if (file_exists(self::$cacheFile)) {
            unlink(self::$cacheFile);
        }
    }
}

// Use cached config in production
if ($_ENV['APP_ENV'] === 'production') {
    $cachedConfig = ConfigCache::load();
    if ($cachedConfig) {
        // Use cached configuration
    }
}
```


### Automatic Cleanup Settings
```php
// backend/config/app.php
'webhook_management' => [
    'auto_unregister' => true,  // Enable automatic unregistration
    'cleanup_interval' => 6,    // Hours between cleanup runs
    'save_before_unregister' => true,  // Save webhook config
    'notify_on_unregister' => true,    // Send notifications
    'admin_report' => true,     // Send daily reports
]
Cron Configuration
bash# Webhook cleanup (required!)
0 */6 * * * php /path/to/scripts/check_expired_licenses.php
```
