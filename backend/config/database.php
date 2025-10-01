<?php
/**
 * Database configuration
 */

return [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? 3306,
    'name' => $_ENV['DB_NAME'] ?? 'bitrix_app',
    'user' => $_ENV['DB_USER'] ?? 'root',
    'pass' => $_ENV['DB_PASS'] ?? '',
    'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => $_ENV['DB_PREFIX'] ?? 'app_',
    
    // Connection options
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ],
    
    // Connection pool settings
    'pool' => [
        'min_connections' => 1,
        'max_connections' => 10,
        'connection_timeout' => 30,
        'idle_timeout' => 60,
    ],
    
    // Auto-create tables on first run
    'auto_create_tables' => true,
    
    // Tables structure
    'tables' => [
        'portals' => 'portals',
        'settings' => 'settings',
        'tokens' => 'tokens',
        'logs' => 'logs',
        'cache' => 'cache',
    ]
];