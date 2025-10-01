# Troubleshooting Guide

## Common Issues and Solutions

### Installation Problems

#### Issue: Installation fails with "Missing required parameters"

**Symptoms:**
- Installation page shows error
- Blank screen during installation
- Error in logs: "Missing required parameters"

**Solution:**
```bash
# Check installation logs
tail -f storage/logs/webhook-*.log

# Verify required parameters are passed from Bitrix24
# Required: DOMAIN, AUTH_ID, AUTH_EXPIRES, APP_SID, REFRESH_ID

# Test webhook manually
curl -X POST https://your-domain.com/api/webhook.php \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ONAPPINSTALL",
    "auth": {
      "domain": "test.bitrix24.com",
      "member_id": "test123",
      "application_token": "test_token",
      "access_token": "access",
      "refresh_token": "refresh"
    }
  }'
```

#### Issue: "Portal not found" error

**Symptoms:**
- Application shows "Portal not found"
- Cannot access application after installation

**Diagnosis:**
```sql
-- Check if portal exists
SELECT * FROM app_portals WHERE domain = 'your.bitrix24.com';

-- Check member_id
SELECT * FROM app_portals WHERE member_id = 'your_member_id';
```

**Solution:**
```php
// Force reinstallation
// 1. Clear browser cache
// 2. Uninstall from Bitrix24
// 3. Check database:
SELECT is_active, trial_used FROM app_portals WHERE domain = 'your.bitrix24.com';

// 4. If trial_used = 1, you need a license
// 5. Reinstall application
```

#### Issue: Event handlers not registering

**Symptoms:**
- Events not triggering
- No webhook calls received

**Solution:**
```php
// Check registered handlers via API
BX24.callMethod('event.get', {}, function(result) {
    console.log('Registered events:', result.data());
});

// Or via diagnostics
curl https://your-domain.com/api/rest.php/diagnostics/handlers?domain=your.bitrix24.com

// Re-register handlers manually
BX24.callMethod('event.bind', {
    event: 'ONCRMDEALUPDATE',
    handler: 'https://your-domain.com/api/webhook.php'
});
```

### Database Connection Issues

#### Issue: "Database connection failed"

**Symptoms:**
- Error 500 on all pages
- "Database connection failed" message

**Diagnosis:**
```bash
# Test database connection
mysql -u your_user -p -h localhost bitrix_app -e "SELECT 1"

# Check credentials in .env
cat .env | grep DB_

# Check error log
tail -f storage/logs/error-*.log
```

**Solution:**
```bash
# 1. Verify MySQL is running
systemctl status mysql

# 2. Check credentials
mysql -u root -p
SHOW DATABASES;
SHOW GRANTS FOR 'your_user'@'localhost';

# 3. Fix permissions
GRANT ALL PRIVILEGES ON bitrix_app.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;

# 4. Update .env
DB_HOST=localhost
DB_NAME=bitrix_app
DB_USER=your_user
DB_PASS=your_password
```

#### Issue: Tables not created automatically

**Symptoms:**
- "Table doesn't exist" errors
- Application fails to start

**Solution:**
```php
// Force table creation
<?php
require_once 'backend/bootstrap.php';

use Core\Database;

$config = require 'backend/config/database.php';
Database::init($config);

// Check tables
$db = Database::getInstance();
$tables = $db->getConnection()->query("SHOW TABLES")->fetchAll();
print_r($tables);
```

Manual table creation:
```sql
-- Run SQL from database.md schema section
CREATE TABLE IF NOT EXISTS app_portals (...);
CREATE TABLE IF NOT EXISTS app_settings (...);
-- etc.
```

### Token and Authentication Issues

#### Issue: "Invalid or expired tokens"

**Symptoms:**
- API calls fail with 401 error
- "Invalid authentication" errors

**Diagnosis:**
```php
// Check token expiration
$portal = $db->getPortal($domain);
$isExpired = $portal['expires_at'] < time();
echo "Token expired: " . ($isExpired ? 'YES' : 'NO');
echo "Expires at: " . date('Y-m-d H:i:s', $portal['expires_at']);
```

**Solution:**
```php
// Force token refresh
use Bitrix\TokenManager;

$tm = new TokenManager($domain);
$refreshed = $tm->refreshTokens();

if (!$refreshed) {
    // Need to reinstall application
    echo "Please reinstall the application from Bitrix24";
}
```

#### Issue: "Invalid application token"

**Symptoms:**
- Webhook calls rejected
- 401 Unauthorized errors

**Solution:**
```sql
-- Check application token
SELECT application_token FROM app_portals WHERE domain = 'your.bitrix24.com';

-- Compare with incoming request
-- Token should match auth['application_token'] from Bitrix24
```

### License Issues

#### Issue: "Trial expired, license required"

**Symptoms:**
- Application blocked after 14 days
- Cannot access application features

**Diagnosis:**
```sql
-- Check license status
SELECT 
    is_trial,
    trial_used,
    trial_end_date,
    license_key,
    license_valid_until,
    is_blocked,
    block_reason
FROM app_portals 
WHERE domain = 'your.bitrix24.com';
```

**Solution:**
```php
// Option 1: Activate license via API
curl -X POST https://your-domain.com/api/rest.php/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "your.bitrix24.com",
    "license_key": "XXXX-XXXX-XXXX-XXXX"
  }'

// Option 2: Manually activate in database
UPDATE app_portals 
SET 
    is_trial = 0,
    license_key = 'XXXX-XXXX-XXXX-XXXX',
    license_valid_until = DATE_ADD(NOW(), INTERVAL 1 YEAR),
    is_blocked = 0,
    block_reason = NULL
WHERE domain = 'your.bitrix24.com';
```

#### Issue: Cannot reinstall after trial

**Symptoms:**
- Trial already used message
- Cannot use application after reinstall

**Explanation:**
```sql
-- The system tracks trial usage by member_id
-- member_id is permanent for each Bitrix24 portal
SELECT member_id, trial_used FROM app_portals WHERE member_id = 'xxx';
-- If trial_used = 1, trial cannot be reused
```

**Solution:**
- Purchase and activate a license
- For development/testing only:
```sql
-- ONLY for testing, not for production!
UPDATE app_portals 
SET trial_used = 0, 
    trial_end_date = DATE_ADD(NOW(), INTERVAL 14 DAY)
WHERE member_id = 'test_member_id';
```

### API and Webhook Issues

#### Issue: Rate limit exceeded

**Symptoms:**
- API calls fail with "QUERY_LIMIT_EXCEEDED"
- Slow response times

**Diagnosis:**
```bash
# Check rate limit status
curl https://your-domain.com/api/stats.php?action=rate-limits

# Monitor API calls
curl https://your-domain.com/api/stats.php?action=summary
```

**Solution:**
```php
// Implement delay between calls
usleep(500000); // 0.5 second = 2 calls/sec max

// Use batch operations
$commands = [];
for ($i = 0; $i < 50; $i++) {
    $commands["cmd_$i"] = [
        'method' => 'crm.deal.get',
        'params' => ['id' => $ids[$i]]
    ];
}
$result = CRest::callBatch($commands);

// Implement queuing system
class RateLimitedQueue {
    public function process($items) {
        foreach ($items as $item) {
            $this->processItem($item);
            usleep(500000); // Respect rate limit
        }
    }
}
```

#### Issue: Webhook not receiving events

**Symptoms:**
- Events not triggering handlers
- No entries in webhook logs

**Diagnosis:**
```bash
# Test webhook directly
curl -X POST https://your-domain.com/api/webhook.php \
  -H "Content-Type: application/json" \
  -d '{"event":"test","auth":{"domain":"test.bitrix24.com"}}'

# Check webhook logs
tail -f storage/logs/webhook-*.log

# Check web server logs
tail -f /var/log/nginx/error.log
tail -f /var/log/apache2/error.log
```

**Solution:**
1. Check webhook URL is accessible:
```bash
curl -I https://your-domain.com/api/webhook.php
# Should return 200 or 405 (method not allowed for GET)
```

2. Check SSL certificate:
```bash
openssl s_client -connect your-domain.com:443
```

3. Check firewall:
```bash
# Allow Bitrix24 IPs (check current list)
iptables -A INPUT -s bitrix24.com -p tcp --dport 443 -j ACCEPT
```

### Performance Issues

#### Issue: Slow application response

**Symptoms:**
- Long loading times
- Timeout errors

**Diagnosis:**
```sql
-- Check slow queries
SELECT * FROM app_api_calls 
WHERE duration > 1000 
ORDER BY duration DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    table_name,
    round(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES 
WHERE table_schema = 'bitrix_app'
ORDER BY size_mb DESC;
```

**Solution:**
```php
// 1. Enable caching
$data = getCached('expensive_operation', function() {
    return $this->expensiveOperation();
}, 3600);

// 2. Optimize queries
// Bad: N+1 problem
foreach ($dealIds as $id) {
    $deal = CRest::call('crm.deal.get', ['id' => $id]);
}

// Good: Batch operation
$commands = [];
foreach ($dealIds as $id) {
    $commands["deal_$id"] = ['method' => 'crm.deal.get', 'params' => ['id' => $id]];
}
$deals = CRest::callBatch($commands);

// 3. Add indexes
ALTER TABLE app_logs ADD INDEX idx_portal_created (portal_id, created_at);

// 4. Clean old data
DELETE FROM app_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
OPTIMIZE TABLE app_logs;
```

### Logging and Debugging

#### Issue: No logs being created

**Symptoms:**
- Empty logs directory
- Cannot debug issues

**Solution:**
```bash
# Check permissions
ls -la storage/logs/
# Should be writable by web server

# Fix permissions
chmod 755 storage/
chmod 755 storage/logs/
chown www-data:www-data storage/logs/

# Test logging
<?php
require_once 'backend/bootstrap.php';
use Core\Logger;

$logger = new Logger('test');
$logger->info('Test log entry');

// Check file created
ls -la storage/logs/test-*.log
```

#### Issue: Logs growing too large

**Symptoms:**
- Disk space issues
- Slow log queries

**Solution:**
```php
// 1. Implement log rotation
// Add to crontab:
// 0 2 * * * php /path/to/maintenance.php

// maintenance.php
$db = Database::getInstance();
$db->performMaintenance(30); // Keep 30 days

// 2. Use appropriate log levels
$logger->debug('Detailed debug info'); // Only in development
$logger->info('Important events');    // Production
$logger->error('Errors only');        // Always

// 3. Clean manually if needed
TRUNCATE TABLE app_logs;
```

### Frontend Issues

#### Issue: BX24 is not defined

**Symptoms:**
- JavaScript errors in console
- Application doesn't load

**Solution:**
```html
<!-- Ensure BX24 SDK is loaded before your scripts -->
<script src="//api.bitrix24.com/api/v1/"></script>
<script>
    // Wait for BX24 to be ready
    BX24.init(function() {
        // Your code here
        console.log('BX24 ready');
    });
</script>
```

#### Issue: CORS errors

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- API calls blocked

**Solution:**
```php
// Add CORS headers in PHP
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Or in .htaccess
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
```

### Health Check

#### Quick System Check

```bash
# Run health check
curl https://your-domain.com/api/health.php

# Should return JSON with system status
{
    "status": "ok",
    "checks": {
        "database": {"status": "ok"},
        "filesystem": {"status": "ok"},
        "php": {"status": "ok"},
        "memory": {"status": "ok"}
    }
}
```

#### Full Diagnostics

```bash
# Get complete diagnostics
curl https://your-domain.com/api/rest.php/diagnostics/full?domain=your.bitrix24.com

# Check specific components
curl https://your-domain.com/api/rest.php/diagnostics/handlers?domain=your.bitrix24.com
curl https://your-domain.com/api/rest.php/diagnostics/storage?domain=your.bitrix24.com
curl https://your-domain.com/api/rest.php/diagnostics/database?domain=your.bitrix24.com
```

## Error Messages Reference

### HTTP Status Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Check authentication token |
| 402 | Payment Required | License expired, activate license |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check endpoint URL |
| 405 | Method Not Allowed | Use correct HTTP method |
| 422 | Validation Error | Check input data format |
| 500 | Internal Server Error | Check server logs |
| 503 | Service Unavailable | Check database/service status |

### Bitrix24 API Errors

| Error | Description | Solution |
|-------|-------------|----------|
| expired_token | Access token expired | Token auto-refreshes, retry |
| invalid_token | Token is invalid | Reinstall application |
| QUERY_LIMIT_EXCEEDED | Rate limit hit | Add delay between calls |
| ERROR_METHOD_NOT_FOUND | Method doesn't exist | Check method name and scope |
| NO_AUTH_FOUND | Missing authentication | Check auth data passed |
| ACCESS_DENIED | No permission | Check user permissions |

## Debug Mode

### Enable Debug Mode

```bash
# In .env file
APP_DEBUG=true
LOG_LEVEL=debug

# In PHP code
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

### Debug Checklist

1. **Check logs:**
```bash
tail -f storage/logs/*.log
```

2. **Check database:**
```sql
SELECT * FROM app_logs WHERE level = 'error' ORDER BY created_at DESC LIMIT 20;
```

3. **Check PHP errors:**
```bash
tail -f /var/log/php/error.log
```

4. **Check web server:**
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/apache2/error.log
```

5. **Test endpoints:**
```bash
# Health check
curl https://your-domain.com/api/health.php

# API test
curl https://your-domain.com/api/rest.php/info?domain=test.bitrix24.com

# Webhook test
curl -X POST https://your-domain.com/api/webhook.php \
  -H "Content-Type: application/json" \
  -d '{"event":"test","auth":{"domain":"test"}}'
```

## Common Development Mistakes

### 1. Deleting Portal Records

❌ **Wrong:**
```php
$db->query("DELETE FROM app_portals WHERE domain = ?", [$domain]);
```

✅ **Correct:**
```php
$db->deactivatePortal($domain, $userId);
```

### 2. Not Handling Token Expiration

❌ **Wrong:**
```php
$result = CRest::call('method', $params);
```

✅ **Correct:**
```php
$result = CRest::call('method', $params);
if (isset($result['error']) && $result['error'] === 'expired_token') {
    $tokenManager->refreshTokens();
    $result = CRest::call('method', $params);
}
```

### 3. Ignoring Rate Limits

❌ **Wrong:**
```php
foreach ($items as $item) {
    CRest::call('method', ['id' => $item['id']]);
}
```

✅ **Correct:**
```php
foreach ($items as $item) {
    CRest::call('method', ['id' => $item['id']]);
    usleep(500000); // Respect rate limit
}
```

## Getting Help

### 1. Check Documentation
- Read through all .md files in docs/
- Check API_REFERENCE.md
- Review DEVELOPMENT_GUIDE.md

### 2. Enable Verbose Logging
```php
$logger = new Logger('debug');
$logger->debug('Detailed information', [
    'all' => 'variables',
    'and' => 'context'
]);
```

### 3. Use Diagnostics Tools
- Health check: `/api/health.php`
- Statistics: `/api/stats.php`
- Diagnostics: `/api/rest.php/diagnostics/full`

### 4. Test in Isolation
Create minimal test case:
```php
<?php
require_once 'backend/bootstrap.php';

// Test specific functionality
$db = Database::getInstance();
$portal = $db->getPortal('test.bitrix24.com');
var_dump($portal);
```

### 5. Contact Support
When reporting issues, provide:
- Error messages from logs
- Steps to reproduce
- Environment details (PHP version, OS)
- Relevant database records
- Health check output


## Webhook Management Issues

### Issue: Webhooks not automatically unregistering

**Symptoms:**
- Expired portals still sending webhook requests
- Server load from expired portals

**Solution:**
```bash
# Check cron is running
systemctl status cron

# Run cleanup manually
php scripts/check_expired_licenses.php

# Check webhook status
mysql -e "SELECT p.domain, s.setting_value as webhooks_unregistered 
FROM app_portals p 
LEFT JOIN app_settings s ON p.id = s.portal_id 
WHERE s.setting_key = 'webhooks_unregistered'"
```

Issue: Webhooks not restoring after license activation
Solution:
php// Force webhook re-registration
$webhookManager = new WebhookManager($domain);
$webhookManager->reregisterWebhooks();