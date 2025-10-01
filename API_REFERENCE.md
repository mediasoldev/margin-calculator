<!-- API_REFERENCE.md -->
# API Reference

## REST API Endpoints

### Base URL
```
https://your-domain.com/api/
```

### Authentication
```http
Authorization: Bearer {application_token}
X-Bitrix-Domain: {domain}
```

---

## Portal Management

### Get Portal Info
```http
GET /api/rest.php/info?domain={domain}
```
Response:
```json
{
  "success": true,
  "data": {
    "app": {"name": "...", "version": "1.0.0"},
    "portal": {"domain": "...", "member_id": "...", "is_trial": true}
  }
}
```

### Check Portal Status
```http
GET /api/rest.php/portal/validate?domain={domain}
```
Response:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "license_status": {"status": "trial", "is_valid": true, "days_remaining": 10},
    "is_blocked": false
  }
}
```

---

## License Management

### Check License
```http
GET /api/rest.php/license/check?domain={domain}
```

### Activate License
```http
POST /api/rest.php/license/activate
Content-Type: application/json

{
  "domain": "example.bitrix24.com",
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "valid_until": "2025-12-31 23:59:59"
}
```

### Validate License Key
```http
POST /api/rest.php/license/validate
Content-Type: application/json

{
  "license_key": "XXXX-XXXX-XXXX-XXXX"
}
```

---

## Settings

### Get Settings
```http
GET /api/rest.php/portal/settings?domain={domain}&key={optional_key}
```

### Save Settings
```http
POST /api/rest.php/portal/settings
Content-Type: application/json

{
  "domain": "example.bitrix24.com",
  "key": "feature_enabled",
  "value": "true"
}
```

### Delete Setting
```http
DELETE /api/rest.php/portal/settings
Content-Type: application/json

{
  "domain": "example.bitrix24.com",
  "key": "feature_enabled"
}
```

---

## Bitrix24 API Proxy

### Single Call
```http
POST /api/rest.php/bitrix/call
Content-Type: application/json

{
  "domain": "example.bitrix24.com",
  "method": "crm.deal.get",
  "params": {"id": 123}
}
```

### Batch Call
```http
POST /api/rest.php/bitrix/batch
Content-Type: application/json

{
  "domain": "example.bitrix24.com",
  "commands": {
    "deal": {"method": "crm.deal.get", "params": {"id": 123}},
    "contact": {"method": "crm.contact.get", "params": {"id": 456}}
  },
  "halt": false
}
```

---

## Diagnostics

### Full Diagnostics
```http
GET /api/rest.php/diagnostics/full?domain={domain}
```
Returns: portal status, license, tokens, database stats, settings, system info

### Event Handlers
```http
GET /api/rest.php/diagnostics/handlers?domain={domain}
```
Returns: registered events, placements, scope

### Storage Info
```http
GET /api/rest.php/diagnostics/storage?domain={domain}
```
Returns: table sizes, record counts

### Database Stats
```http
GET /api/rest.php/diagnostics/database?domain={domain}
```

### Recent Logs
```http
GET /api/rest.php/logs/recent?domain={domain}
```
Returns: last 50 error logs

---

## Monitoring

### Health Check
```http
GET /api/health.php
```
Response:
```json
{
  "status": "ok|degraded|error",
  "timestamp": "2025-01-01 12:00:00",
  "checks": {
    "database": {"status": "ok"},
    "filesystem": {"status": "ok"},
    "php": {"status": "ok", "version": "8.0.0"},
    "memory": {"status": "ok", "usage": "50MB", "percent": "25%"},
    "disk": {"status": "ok", "free": "10GB"},
    "errors": {"status": "ok", "count": 0}
  }
}
```

### API Statistics
```http
GET /api/stats.php?action={action}

Actions:
- summary     → Overall statistics
- performance → Performance report
- methods     → Methods statistics
- recent      → Recent API calls
- failed      → Failed calls list
- slow        → Slow calls (>500ms)
- rate-limits → Rate limit status
- export      → Export data (format=json|csv)
- realtime    → SSE stream
```

---

## Webhook Events

### Endpoint
```http
POST /api/webhook.php
Content-Type: application/json
```

### Installation Event
```json
{
  "event": "ONAPPINSTALL",
  "auth": {
    "domain": "example.bitrix24.com",
    "member_id": "abc123...",
    "user_id": 1,
    "access_token": "...",
    "refresh_token": "...",
    "application_token": "...",
    "expires_in": 3600,
    "server_endpoint": "oauth.bitrix.info",
    "client_endpoint": "https://example.bitrix24.com/rest/"
  }
}
```

### Uninstallation Event
```json
{
  "event": "ONAPPUNINSTALL",
  "auth": {
    "domain": "example.bitrix24.com",
    "member_id": "abc123...",
    "user_id": 1,
    "application_token": "..."
  }
}
```

### Custom Event
```json
{
  "event": "ONCRMDEALUPDATE",
  "auth": {...},
  "data": {
    "FIELDS": {
      "ID": 123,
      "TITLE": "Deal Name",
      "STAGE_ID": "WON"
    }
  }
}
```

---

## PHP Classes

### Database
```php
use Core\Database;

$db = Database::getInstance();

// Portal operations
$portal = $db->getPortal($domain);
$portal = $db->getPortalByMemberId($memberId);
$saved = $db->savePortal($domain, $data);
$deactivated = $db->deactivatePortal($domain, $userId);

// License
$canUseTrial = $db->canUseTrial($memberId);
$activated = $db->activateLicense($domain, $licenseKey, $validUntil);
$status = $db->checkLicenseStatus($domain);
$blocked = $db->blockPortal($domain, $reason);

// Settings
$settings = $db->getSettings($portalId, $key);
$saved = $db->saveSetting($portalId, $key, $value);

// Maintenance
$diagnostics = $db->getDiagnostics();
$results = $db->performMaintenance($daysToKeepLogs);
$cleaned = $db->cleanExpiredCache();
```

### Logger
```php
use Core\Logger;

$logger = new Logger('channel_name');

// Log levels
$logger->emergency('System unusable', $context);
$logger->alert('Action must be taken', $context);
$logger->critical('Critical conditions', $context);
$logger->error('Error conditions', $context);
$logger->warning('Warning conditions', $context);
$logger->notice('Normal significant', $context);
$logger->info('Informational', $context);
$logger->debug('Debug messages', $context);

// Static methods
$logs = Logger::getRecentLogs($domain, $limit, $level);
$stats = Logger::getLogStatistics($domain);
```

### Response
```php
use Core\Response;

// JSON responses
Response::json($data, 200);
Response::success($data, 'Success message');
Response::error('Error message', 400, $details);

// HTTP status responses
Response::unauthorized('Unauthorized');
Response::forbidden('Forbidden');
Response::notFound('Not found');
Response::methodNotAllowed();
Response::validationError($errors);
Response::serverError('Internal error', $details);

// Other formats
Response::html($content, 200);
Response::text($content, 200);
Response::xml($data, 200);
Response::redirect($url, 302);
Response::download($filePath, $filename);
```

### CRest (Bitrix24 API)
```php
use Bitrix\CRest;

CRest::setDomain($domain);

// API calls
$result = CRest::call('crm.deal.get', ['id' => 123]);
$result = CRest::callBatch([
    'deal' => ['method' => 'crm.deal.get', 'params' => ['id' => 123]],
    'contact' => ['method' => 'crm.contact.get', 'params' => ['id' => 456]]
], $halt = 0);

// Installation
$result = CRest::installApp();
```

### TokenManager
```php
use Bitrix\TokenManager;

$tm = new TokenManager($domain);

// Token operations
$tokens = $tm->getTokens();
$accessToken = $tm->getValidAccessToken(); // Auto-refreshes if expired
$isExpired = $tm->isExpired();
$refreshed = $tm->refreshTokens();
$valid = $tm->validateTokens();
$revoked = $tm->revokeTokens();
$remaining = $tm->getRemainingLifetime(); // Seconds

// Save/Exchange
$saved = $tm->saveTokens($tokensArray);
$exchanged = $tm->exchangeCode($code, $serverEndpoint);

// From webhook auth
$tm = TokenManager::fromAuth($_REQUEST['auth']);
```

### ApiCallTracker
```php
use Bitrix\ApiCallTracker;

$tracker = ApiCallTracker::getInstance();

// Track calls
$callId = $tracker->trackCallStart('crm.deal.get', $params);
$tracker->trackCallEnd($callId, $result, $success);

// Get statistics
$stats = $tracker->getStatistics();
$recent = $tracker->getRecentCalls($limit);
$failed = $tracker->getFailedCalls();
$slow = $tracker->getSlowCalls($thresholdMs);
$rateLimits = $tracker->checkRateLimits();

// Method statistics
$methodStats = $tracker->getMethodStatistics($method);
$report = $tracker->getPerformanceReport();

// Export/Reset
$json = $tracker->exportStatistics();
$tracker->resetStatistics();
```

### BaseHandler
```php
namespace Handlers\Events;

class CustomHandler extends BaseHandler 
{
    public function handle(): array 
    {
        // Access properties
        $this->domain;         // Portal domain
        $this->auth;          // Auth array
        $this->portal;        // Portal data
        $this->db;           // Database instance
        $this->logger;       // Logger instance
        $this->tokenManager; // TokenManager
        
        // Helper methods
        $data = $this->getEventData();
        $field = $this->getEventField('ID');
        $portal = $this->getPortalData();
        
        // API calls
        $result = $this->callBitrixMethod('crm.deal.get', ['id' => 123]);
        $result = $this->callBitrixBatch($commands, $haltOnError);
        
        // Settings
        $settings = $this->getSettings($key);
        $saved = $this->saveSetting($key, $value);
        $hasFeature = $this->hasFeature('crm');
        
        // User operations
        $user = $this->getCurrentUser();
        $isAdmin = $this->isAdmin();
        $sent = $this->sendNotification($userId, $message);
        
        // CRM operations
        $taskId = $this->createTask($fields);
        $added = $this->addCrmComment($entityType, $entityId, $message);
        $entity = $this->getCrmEntity($entityType, $entityId);
        $updated = $this->updateCrmEntity($entityType, $entityId, $fields);
        
        return [
            'success' => true,
            'data' => [...],
            'message' => 'Success'
        ];
    }
}
```

---

## Database Schema

### Tables Structure
```sql
-- app_portals (NEVER DELETE RECORDS!)
domain, member_id (UNIQUE), user_id, tokens, 
is_trial, trial_used, trial_end_date,
license_key, license_valid_until,
is_active, is_blocked, block_reason,
installed_at, uninstalled_at, reinstall_count

-- app_settings
portal_id (FK), setting_key, setting_value

-- app_tokens (history)
portal_id (FK), access_token, refresh_token, expires_at

-- app_logs
portal_id (FK), level, channel, message, context (JSON)

-- app_api_calls (slow/failed only)
call_id, method, params, duration, memory_used, success, error

-- app_cache
cache_key (PK), cache_value, expires_at
```

---

## Error Codes

### HTTP Status
- `200` Success
- `400` Bad Request
- `401` Unauthorized
- `402` License Required
- `403` Forbidden
- `404` Not Found
- `405` Method Not Allowed
- `422` Validation Error
- `500` Server Error
- `503` Service Unavailable

### Bitrix24 Errors
- `expired_token` → Auto-refreshes
- `invalid_token` → Need reinstall
- `QUERY_LIMIT_EXCEEDED` → Rate limit (2/sec)
- `ERROR_METHOD_NOT_FOUND` → Check scope
- `NO_AUTH_FOUND` → Setup error

---

## Rate Limits

### Bitrix24 API
- **Limit**: 2 requests/second (120/minute)
- **Monitoring**: `/api/stats.php?action=rate-limits`
- **Auto-warning**: At 80% usage
- **Recovery**: Automatic queuing

### Internal Limits
```php
// Check before making calls
$tracker = ApiCallTracker::getInstance();
$limits = $tracker->checkRateLimits();

if ($limits['is_at_limit']) {
    // Wait or queue request
    sleep(1);
}
```

---

## Testing

### Test Endpoints
```bash
# Health check
curl https://your-domain.com/api/health.php

# Portal validation
curl -H "Authorization: Bearer TOKEN" \
     https://your-domain.com/api/rest.php/portal/validate?domain=example.bitrix24.com

# API statistics
curl https://your-domain.com/api/stats.php?action=summary
```

### Test from UI
1. Open main app → Diagnostics tab
2. Use "Test Actions" section
3. Check console for detailed output

---

## Common Patterns

### License Check in Handler
```php
$licenseStatus = $this->checkLicense();
if (!$licenseStatus['is_valid']) {
    return ['error' => true, 'message' => 'License expired'];
}
```

### Safe API Call with Retry
```php
$result = $this->callBitrixMethod('method', $params);
if (isset($result['error']) && $result['error'] === 'expired_token') {
    $this->tokenManager->refreshTokens();
    $result = $this->callBitrixMethod('method', $params);
}
```

### Transaction Pattern
```php
$this->db->beginTransaction();
try {
    // Multiple operations
    $this->db->savePortal($domain, $data);
    $this->db->saveSetting($portalId, $key, $value);
    $this->db->commit();
} catch (Exception $e) {
    $this->db->rollback();
    throw $e;
}
```


## Webhook Management API

### Classes

#### WebhookManager
- `getRegisteredWebhooks()` - Get all portal webhooks
- `unregisterAllWebhooks($reason)` - Remove all webhooks
- `reregisterWebhooks()` - Restore saved webhooks
- `registerDefaultWebhooks()` - Register from config
- `shouldUnregisterWebhooks()` - Check if cleanup needed

### Database Methods
- `checkLicenseStatus()` - Now includes `should_unregister_webhooks` flag
- `getPortalsNeedingWebhookCleanup()` - Get expired portals with active webhooks
- `getLicenseStatistics()` - Includes webhook statistics
