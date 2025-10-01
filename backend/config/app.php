<?php
/**
 * Application configuration
 */

return [
    // Application info
    'app' => [
        'name' => 'Bitrix24 App Template',
        'version' => '1.0.0',
        'description' => 'Universal template for Bitrix24 applications',
        'url' => $_ENV['APP_URL'] ?? '',
        'debug' => ($_ENV['APP_DEBUG'] ?? 'false') === 'true',
        'timezone' => $_ENV['APP_TIMEZONE'] ?? 'UTC',
    ],
    
    // Bitrix24 OAuth credentials
    'bitrix' => [
        'client_id' => $_ENV['BITRIX_APP_ID'] ?? '',
        'client_secret' => $_ENV['BITRIX_APP_SECRET'] ?? '',
        'oauth_url' => 'https://oauth.bitrix.info/oauth/token/',
        'scope' => [
            'crm',
            'task',
            'tasks',
            'user',
            'entity',
            'placement',
            'im',
            'log',
            'sonet_group',
            'department'
        ],
    ],
    
    // Webhook endpoints
    'webhook' => [
        'endpoint' => '/api/webhook.php',
        'allowed_events' => [
            'ONAPPINSTALL',
            'ONAPPUNINSTALL',
            'ONAPPUPDATE',

            // 'ONCRMDEALUPDATE',
            // 'ONCRMDEALDELETE',
            // 'ONCRMDEALADD',
            // 'ONCRMCONTACTUPDATE',
            // 'ONCRMCONTACTDELETE',
            // 'ONCRMCONTACTADD',
            // 'ONCRMCOMPANYUPDATE',
            // 'ONCRMCOMPANYDELETE',
            // 'ONCRMCOMPANYADD',
            // 'ONCRMLEADUPDATE',
            // 'ONCRMLEADDELETE',
            // 'ONCRMLEADADD',
            // 'ONTASKUPDATE',
            // 'ONTASKDELETE',
            // 'ONTASKADD'
        ]
    ],
    
    // Security settings
    'security' => [
        'check_auth' => true,
        'verify_ssl' => ($_ENV['VERIFY_SSL'] ?? 'true') === 'true',
        'allowed_domains' => explode(',', $_ENV['ALLOWED_DOMAINS'] ?? ''),
        'token_lifetime' => 3600, // 1 hour in seconds
    ],
    
    // Rate limiting
    'rate_limit' => [
        'enabled' => ($_ENV['RATE_LIMIT_ENABLED'] ?? 'true') === 'true',
        'requests_per_second' => 2,
        'burst_limit' => 10,
    ],
    
    // Logging
    'logging' => [
        'enabled' => true,
        'level' => $_ENV['LOG_LEVEL'] ?? 'info',
        'path' => $_ENV['LOG_PATH'] ?? 'storage/logs',
        'max_files' => 30, // Keep logs for 30 days
        'channels' => [
            'app' => 'app.log',
            'error' => 'error.log',
            'bitrix' => 'bitrix.log',
            'webhook' => 'webhook.log',
            'api' => 'api.log',
        ]
    ],
    
    // Cache settings
    'cache' => [
        'enabled' => ($_ENV['CACHE_ENABLED'] ?? 'false') === 'true',
        'driver' => $_ENV['CACHE_DRIVER'] ?? 'file', // file, redis, memcached
        'ttl' => 3600, // Default TTL in seconds
        'path' => STORAGE_PATH . '/cache',
    ],
    
    // API settings
    'api' => [
        'prefix' => '/api',
        'version' => 'v1',
        'format' => 'json', // json or xml
        'cors' => [
            'enabled' => true,
            'origins' => explode(',', $_ENV['CORS_ORIGINS'] ?? '*'),
            'methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
            'credentials' => true,
        ]
    ],
    
    // Placement settings for embedded apps
    'placement' => [
        'default_width' => '100%',
        'default_height' => '600',
        'auto_resize' => true,
    ],
    
    // Default portal settings
    'portal_defaults' => [
        'trial_days' => 14,
        'max_users' => 0, // 0 = unlimited
        'features' => [
            'crm' => true,
            'tasks' => true,
            'reports' => true,
            'automation' => true,
        ]
    ]
];