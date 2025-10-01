# Database Documentation

## Overview

The application uses MySQL/MariaDB database with automatic table creation on first run. The database layer is implemented through a singleton Database class that provides all necessary operations for portal management, settings, tokens, and logging.

## Database Schema

### Tables Structure

```sql
-- app_portals (NEVER DELETE RECORDS - only deactivate!)
CREATE TABLE app_portals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    member_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INT DEFAULT NULL,
    
    -- Authentication
    access_token TEXT,
    refresh_token TEXT,
    application_token VARCHAR(255),
    expires_at INT DEFAULT NULL,
    server_endpoint VARCHAR(255),
    client_endpoint VARCHAR(255),
    
    -- Trial/License
    is_trial TINYINT(1) DEFAULT 1,
    trial_used TINYINT(1) DEFAULT 0,
    trial_end_date TIMESTAMP NULL,
    license_key VARCHAR(255) DEFAULT NULL,
    license_valid_until TIMESTAMP NULL,
    license_activated_at TIMESTAMP NULL,
    license_activated_by INT DEFAULT NULL,
    
    -- Status
    is_active TINYINT(1) DEFAULT 1,
    is_blocked TINYINT(1) DEFAULT 0,
    block_reason VARCHAR(255) DEFAULT NULL,
    
    -- Installation tracking
    installed_at TIMESTAMP NULL,
    installed_by INT DEFAULT NULL,
    uninstalled_at TIMESTAMP NULL,
    uninstalled_by INT DEFAULT NULL,
    reinstall_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_domain (domain),
    INDEX idx_member_id (member_id),
    INDEX idx_is_active (is_active),
    INDEX idx_license_valid_until (license_valid_until)
);

-- app_settings
CREATE TABLE app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portal_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_portal_setting (portal_id, setting_key),
    FOREIGN KEY (portal_id) REFERENCES app_portals(id) ON DELETE CASCADE,
    INDEX idx_portal_id (portal_id),
    INDEX idx_setting_key (setting_key)
);

-- app_tokens (history/audit)
CREATE TABLE app_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portal_id INT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (portal_id) REFERENCES app_portals(id) ON DELETE CASCADE,
    INDEX idx_portal_id (portal_id),
    INDEX idx_created_at (created_at)
);

-- app_logs
CREATE TABLE app_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portal_id INT DEFAULT NULL,
    level VARCHAR(20) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    context JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (portal_id) REFERENCES app_portals(id) ON DELETE CASCADE,
    INDEX idx_portal_id (portal_id),
    INDEX idx_level (level),
    INDEX idx_channel (channel),
    INDEX idx_created_at (created_at)
);

-- app_api_calls (for slow/failed calls tracking)
CREATE TABLE app_api_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    call_id VARCHAR(36) NOT NULL UNIQUE,
    portal_id INT DEFAULT NULL,
    method VARCHAR(100) NOT NULL,
    params JSON DEFAULT NULL,
    start_time DOUBLE NOT NULL,
    end_time DOUBLE DEFAULT NULL,
    duration INT DEFAULT NULL,
    memory_used INT DEFAULT NULL,
    success TINYINT(1) DEFAULT 0,
    error TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (portal_id) REFERENCES app_portals(id) ON DELETE CASCADE,
    INDEX idx_call_id (call_id),
    INDEX idx_portal_id (portal_id),
    INDEX idx_method (method),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at)
);

-- app_cache
CREATE TABLE app_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_value LONGTEXT,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_expires_at (expires_at)
);

-- app_queue (for async processing)
CREATE TABLE app_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portal_id INT DEFAULT NULL,
    type VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    error TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (portal_id) REFERENCES app_portals(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);
```

## Database Class

### Initialization

```php
use Core\Database;

// Initialize database (auto-creates tables)
Database::init($config);

// Get instance anywhere
$db = Database::getInstance();
```

### Configuration

```php
// backend/config/database.php
return [
    'host' => 'localhost',
    'port' => 3306,
    'name' => 'bitrix_app',
    'user' => 'root',
    'pass' => 'password',
    'charset' => 'utf8mb4',
    'prefix' => 'app_',
    'auto_create_tables' => true
];
```

## Portal Operations

### Never Delete Portals!

**CRITICAL**: Portal records are NEVER deleted to prevent trial abuse. Always use deactivation.

```php
// ❌ WRONG - Never do this!
$db->deletePortal($domain);

// ✅ CORRECT - Deactivate instead
$db->deactivatePortal($domain, $userId);
```

### Portal Management

```php
// Get portal by domain
$portal = $db->getPortal('example.bitrix24.com');

// Get portal by member_id (permanent identifier)
$portal = $db->getPortalByMemberId('abc123...');

// Save/update portal
$saved = $db->savePortal($domain, [
    'access_token' => 'new_token',
    'refresh_token' => 'new_refresh',
    'expires_at' => time() + 3600
]);

// Deactivate portal (on uninstall)
$deactivated = $db->deactivatePortal($domain, $userId);
// Sets: is_active = 0, uninstalled_at = NOW()

// Block portal
$blocked = $db->blockPortal($domain, 'License expired');
// Sets: is_blocked = 1, block_reason = reason

// Unblock portal
$unblocked = $db->unblockPortal($domain);
```

### Portal Lifecycle

```
NEW INSTALL → Save portal with trial
    ↓
USE APP → Update tokens, settings
    ↓
UNINSTALL → Deactivate (is_active = 0)
    ↓
REINSTALL → Check trial_used flag
    ↓
IF trial_used = 1 → Require license
```

## License Management

### License Operations

```php
// Check if can use trial
$canUseTrial = $db->canUseTrial($memberId);
// Returns: false if trial_used = 1

// Activate license
$activated = $db->activateLicense(
    $domain,
    'XXXX-XXXX-XXXX-XXXX',
    '2026-12-31 23:59:59',
    $userId
);

// Check license status
$status = $db->checkLicenseStatus($domain);
/* Returns:
[
    'status' => 'trial|licensed|expired|blocked',
    'is_valid' => true|false,
    'expires_at' => '2025-02-14 12:00:00',
    'days_remaining' => 10,
    'reason' => 'Trial expired'
]
*/
```

### License Status Logic

```php
private function checkLicenseStatus($domain): array
{
    $portal = $this->getPortal($domain);
    
    // Check if blocked
    if ($portal['is_blocked']) {
        return [
            'status' => 'blocked',
            'is_valid' => false,
            'reason' => $portal['block_reason']
        ];
    }
    
    // Check if licensed
    if ($portal['license_key']) {
        $validUntil = strtotime($portal['license_valid_until']);
        if ($validUntil > time()) {
            return [
                'status' => 'licensed',
                'is_valid' => true,
                'expires_at' => $portal['license_valid_until'],
                'days_remaining' => ceil(($validUntil - time()) / 86400)
            ];
        } else {
            return [
                'status' => 'expired',
                'is_valid' => false,
                'reason' => 'License expired'
            ];
        }
    }
    
    // Check trial
    if ($portal['is_trial']) {
        $trialEnd = strtotime($portal['trial_end_date']);
        if ($trialEnd > time()) {
            return [
                'status' => 'trial',
                'is_valid' => true,
                'expires_at' => $portal['trial_end_date'],
                'days_remaining' => ceil(($trialEnd - time()) / 86400)
            ];
        }
    }
    
    return [
        'status' => 'expired',
        'is_valid' => false,
        'reason' => 'Trial expired, license required'
    ];
}
```

## Settings Management

### Working with Settings

```php
// Get all settings for portal
$settings = $db->getSettings($portalId);

// Get specific setting
$value = $db->getSettings($portalId, 'feature_enabled');

// Save setting (creates or updates)
$saved = $db->saveSetting($portalId, 'feature_enabled', 'true');

// Save JSON data
$features = ['crm' => true, 'tasks' => false];
$saved = $db->saveSetting($portalId, 'features', json_encode($features));

// Delete setting (set to null)
$deleted = $db->saveSetting($portalId, 'old_setting', null);
```

### Common Settings Keys

```php
// System settings
'app_version'           // Current app version
'first_installed_at'    // Initial installation date
'last_reinstalled_at'   // Last reinstallation
'language'              // User language
'timezone'              // Portal timezone

// Feature flags
'features'              // JSON: enabled features
'max_users'             // User limit (0 = unlimited)
'automation_enabled'    // Automation feature

// Sync/processing
'last_sync'             // Last synchronization
'last_processed'        // Last processed entity
'sync_status'           // Current sync status

// Custom data
'custom_fields'         // JSON: custom field mappings
'webhook_secret'        // Webhook verification
'api_limits'            // Custom API limits
```

## Token Management

### Token Operations

```php
// Update tokens
$db->updateTokens($domain, [
    'access_token' => 'new_access_token',
    'refresh_token' => 'new_refresh_token',
    'expires_in' => 3600
]);

// Get valid tokens
$tokens = $db->getTokens($domain);

// Check if expired
$isExpired = ($tokens['expires_at'] < time());

// Token history (for audit)
$history = $db->getConnection()->query(
    "SELECT * FROM app_tokens 
     WHERE portal_id = ? 
     ORDER BY created_at DESC 
     LIMIT 10",
    [$portalId]
)->fetchAll();
```

## Logging

### Database Logging

```php
use Core\Logger;

// Logger automatically saves to database
$logger = new Logger('channel_name');

$logger->info('Operation completed', [
    'portal_id' => $portalId,
    'user_id' => $userId,
    'data' => ['key' => 'value']
]);

$logger->error('Operation failed', [
    'error' => $exception->getMessage(),
    'trace' => $exception->getTraceAsString()
]);
```

### Retrieving Logs

```php
// Get recent logs
$logs = Logger::getRecentLogs($domain, 50, 'error');

// Get log statistics
$stats = Logger::getLogStatistics($domain);

// Direct query for specific analysis
$errors = $db->getConnection()->query(
    "SELECT * FROM app_logs 
     WHERE portal_id = ? 
     AND level = 'error' 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
     ORDER BY created_at DESC",
    [$portalId]
)->fetchAll();
```

## Transactions

### Using Transactions

```php
$db->beginTransaction();

try {
    // Multiple operations
    $db->savePortal($domain, $data);
    $db->saveSetting($portalId, 'key', 'value');
    $db->activateLicense($domain, $licenseKey, $validUntil);
    
    // If all successful
    $db->commit();
    
} catch (Exception $e) {
    // Rollback on error
    $db->rollback();
    
    $logger->error('Transaction failed', [
        'error' => $e->getMessage()
    ]);
    
    throw $e;
}
```

## Cache Management

### Using Cache

```php
// Save to cache
$db->saveCache('key_name', $data, 3600); // TTL in seconds

// Get from cache
$data = $db->getCache('key_name');

// Delete from cache
$db->deleteCache('key_name');

// Clean expired cache
$deleted = $db->cleanExpiredCache();
```

### Cache Pattern

```php
function getCachedData($key, $generator, $ttl = 3600)
{
    $db = Database::getInstance();
    
    // Try cache first
    $cached = $db->getCache($key);
    if ($cached !== null) {
        return $cached;
    }
    
    // Generate data
    $data = $generator();
    
    // Save to cache
    $db->saveCache($key, $data, $ttl);
    
    return $data;
}

// Usage
$portalData = getCachedData(
    "portal_{$portalId}_full",
    function() use ($portalId) {
        return $this->loadFullPortalData($portalId);
    },
    7200 // 2 hours
);
```

## Maintenance

### Database Maintenance

```php
// Perform maintenance (keep 30 days of logs)
$results = $db->performMaintenance(30);
/* Returns:
[
    'logs_deleted' => 1523,
    'tokens_deleted' => 45,
    'cache_cleaned' => 78,
    'api_calls_deleted' => 234
]
*/

// Clean specific tables
$db->cleanOldLogs(30);           // Keep 30 days
$db->cleanOldTokens(90);         // Keep 90 days
$db->cleanExpiredCache();        // Remove expired
$db->cleanOldApiCalls(7);        // Keep 7 days
```

### Scheduled Maintenance (Cron)

```php
// daily_maintenance.php
<?php
require_once __DIR__ . '/backend/bootstrap.php';

use Core\Database;
use Core\Logger;

$db = Database::getInstance();
$logger = new Logger('maintenance');

// Run maintenance
$results = $db->performMaintenance(30);

// Log results
$logger->info('Maintenance completed', $results);

// Additional cleanup
$db->getConnection()->exec(
    "DELETE FROM app_queue 
     WHERE status = 'completed' 
     AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
);

// Optimize tables
$tables = ['app_logs', 'app_api_calls', 'app_cache'];
foreach ($tables as $table) {
    $db->getConnection()->exec("OPTIMIZE TABLE $table");
}
```

## Diagnostics

### Database Diagnostics

```php
$diagnostics = $db->getDiagnostics();
/* Returns:
[
    'connection' => ['status' => 'ok', 'ping' => true],
    'tables' => [
        'app_portals' => ['exists' => true, 'rows' => 125],
        'app_settings' => ['exists' => true, 'rows' => 450],
        // ...
    ],
    'statistics' => [
        'portals' => [
            'total_records' => 125,
            'active' => 98,
            'inactive' => 27,
            'trial' => 45,
            'licensed' => 53,
            'expired' => 12,
            'blocked' => 3
        ],
        'database_size' => '45.2 MB',
        'index_size' => '12.1 MB'
    ]
]
*/
```

## Query Examples

### Portal Statistics

```sql
-- Portal distribution
SELECT 
    COUNT(*) as total,
    SUM(is_active) as active,
    SUM(is_trial) as trials,
    SUM(license_key IS NOT NULL) as licensed,
    SUM(is_blocked) as blocked
FROM app_portals;

-- Expiring licenses (next 30 days)
SELECT 
    domain,
    license_valid_until,
    DATEDIFF(license_valid_until, NOW()) as days_left
FROM app_portals
WHERE license_key IS NOT NULL
    AND license_valid_until BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
ORDER BY license_valid_until ASC;

-- Trial usage analysis
SELECT 
    DATE(created_at) as install_date,
    COUNT(*) as installs,
    SUM(trial_used) as trials_used,
    SUM(license_key IS NOT NULL) as converted
FROM app_portals
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY DATE(created_at)
ORDER BY install_date DESC;
```

### Performance Monitoring

```sql
-- Slow API calls
SELECT 
    method,
    COUNT(*) as calls,
    AVG(duration) as avg_ms,
    MAX(duration) as max_ms,
    SUM(success = 0) as failures
FROM app_api_calls
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY method
HAVING avg_ms > 500
ORDER BY avg_ms DESC;

-- Error frequency
SELECT 
    DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
    COUNT(*) as errors
FROM app_logs
WHERE level IN ('error', 'critical')
    AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY hour
ORDER BY hour DESC;
```

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DB_NAME="bitrix_app"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump --single-transaction \
    --routines --triggers \
    $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Keep only 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Recovery

```bash
# Restore from backup
gunzip < backup_20250131_120000.sql.gz | mysql bitrix_app

# Verify
mysql bitrix_app -e "SELECT COUNT(*) FROM app_portals"
```

## Best Practices

1. **Never delete portal records** - Always deactivate
2. **Use transactions** for multiple related operations
3. **Index frequently queried columns**
4. **Use prepared statements** to prevent SQL injection
5. **Cache expensive queries** with appropriate TTL
6. **Log database errors** for monitoring
7. **Regular maintenance** to clean old data
8. **Monitor slow queries** using app_api_calls
9. **Backup regularly** with tested recovery
10. **Use connection pooling** for high load

## Migration Examples

### Adding New Column

```php
// migration_add_column.php
$db = Database::getInstance();
$conn = $db->getConnection();

try {
    // Check if column exists
    $result = $conn->query(
        "SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'app_portals' 
         AND COLUMN_NAME = 'new_feature'"
    );
    
    if (!$result->fetch()) {
        // Add column
        $conn->exec(
            "ALTER TABLE app_portals 
             ADD COLUMN new_feature TINYINT(1) DEFAULT 0 
             AFTER is_blocked"
        );
        
        echo "Column added successfully\n";
    } else {
        echo "Column already exists\n";
    }
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
```

## Webhook Management Tables

### Settings for Webhook Management
These settings are stored in `app_settings` table:

| Key | Description | Values |
|-----|-------------|--------|
| webhooks_unregistered | Webhook status | '0' or '1' |
| webhooks_unregistered_at | When unregistered | Timestamp |
| webhooks_unregistered_reason | Why unregistered | Text |
| saved_webhooks | Backup of webhook config | JSON |
| webhooks_saved_at | When config saved | Timestamp |

### New Methods Added
```php
// Check if webhooks should be unregistered
$db->getPortalsNeedingWebhookCleanup();

// Get license statistics including webhook status
$db->getLicenseStatistics();
```

### Data Migration

```php
// migration_update_data.php
$db = Database::getInstance();
$conn = $db->getConnection();

$conn->beginTransaction();

try {
    // Update existing data
    $conn->exec(
        "UPDATE app_portals 
         SET new_feature = 1 
         WHERE license_key IS NOT NULL"
    );
    
    // Log migration
    $conn->exec(
        "INSERT INTO app_logs (level, channel, message) 
         VALUES ('info', 'migration', 'Updated new_feature column')"
    );
    
    $conn->commit();
    echo "Data migrated successfully\n";
    
} catch (Exception $e) {
    $conn->rollback();
    echo "Migration failed: " . $e->getMessage() . "\n";
}
```