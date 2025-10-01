# Webhook Cleanup Automation Setup

## Overview

To prevent unnecessary load from expired portals, the system automatically unregisters webhooks when licenses expire. This is done through:
1. Real-time checking during webhook requests
2. Daily cron job for cleanup

## Files Added/Modified

### New Files
- `backend/lib/Bitrix/WebhookManager.php` - Centralized webhook management
- `scripts/check_expired_licenses.php` - Cron script for daily cleanup

### Modified Files
- `backend/handlers/BaseHandler.php` - Added automatic webhook unregistration
- `backend/handlers/events/LicenseHandler.php` - Added webhook re-registration on license activation
- `backend/lib/Core/Database.php` - Added `checkLicenseStatus()` improvements and new methods

## Cron Setup

### 1. Make Script Executable
```bash
chmod +x scripts/check_expired_licenses.php
```

### 2. Add to Crontab
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /usr/bin/php /path/to/your/app/scripts/check_expired_licenses.php >> /var/log/license-check.log 2>&1

# Or run every 6 hours for more frequent checks
0 */6 * * * /usr/bin/php /path/to/your/app/scripts/check_expired_licenses.php >> /var/log/license-check.log 2>&1
```

### 3. Test Script Manually
```bash
# Run manually to test
php scripts/check_expired_licenses.php

# Check logs
tail -f storage/logs/cron-license-check-*.log
```

## How It Works

### Automatic Webhook Unregistration Flow

```
1. Portal makes webhook request
   ↓
2. BaseHandler checks license
   ↓
3. If expired AND webhooks still registered:
   - WebhookManager unregisters all webhooks
   - Saves webhook config for restoration
   - Marks portal as webhooks_unregistered
   - Sends notification to admin
   ↓
4. Returns 402 Payment Required
```

### Daily Cleanup Flow

```
1. Cron runs check_expired_licenses.php
   ↓
2. Gets all active portals
   ↓
3. For each portal:
   - Check license status
   - If expired and webhooks registered:
     * Unregister webhooks
     * Block portal
     * Send notification
   ↓
4. Send admin report
```

### License Activation Flow

```
1. License activated via API/webhook
   ↓
2. LicenseHandler activates license
   ↓
3. If webhooks were unregistered:
   - WebhookManager re-registers saved webhooks
   - Unblocks portal
   - Clears webhooks_unregistered flag
   ↓
4. Portal fully operational
```

## Database Changes

New settings stored in `app_settings` table:
- `webhooks_unregistered` - '1' if webhooks are unregistered
- `webhooks_unregistered_at` - Timestamp of unregistration
- `webhooks_unregistered_reason` - Reason for unregistration
- `saved_webhooks` - JSON of webhook configuration for restoration
- `webhooks_saved_at` - When webhooks were saved

## Monitoring

### Check License Statistics
```sql
-- Get overview
SELECT 
    COUNT(*) as total_portals,
    SUM(is_active) as active,
    SUM(is_trial AND trial_end_date > NOW()) as active_trials,
    SUM(is_trial AND trial_end_date < NOW() AND license_key IS NULL) as expired_trials,
    SUM(license_key IS NOT NULL AND license_valid_until > NOW()) as active_licenses,
    SUM(license_key IS NOT NULL AND license_valid_until < NOW()) as expired_licenses,
    SUM(is_blocked) as blocked
FROM app_portals;

-- Check webhook status
SELECT 
    p.domain,
    p.is_trial,
    p.trial_end_date,
    p.license_valid_until,
    p.is_blocked,
    s.setting_value as webhooks_unregistered
FROM app_portals p
LEFT JOIN app_settings s ON p.id = s.portal_id AND s.setting_key = 'webhooks_unregistered'
WHERE p.is_active = 1;
```

### Check Logs
```bash
# View webhook cleanup logs
grep "webhook" storage/logs/cron-license-check-*.log

# View handler logs for webhook operations
grep "unregister" storage/logs/handler-*.log

# Check for errors
grep "ERROR" storage/logs/webhooks-*.log
```

## Configuration

### Environment Variables
Add to `.env` if you want email reports:
```bash
# Admin email for reports
ADMIN_EMAIL=admin@your-domain.com

# License check frequency (hours)
LICENSE_CHECK_INTERVAL=6
```

### Application Config
In `backend/config/app.php`, ensure webhook endpoint is set:
```php
'webhook' => [
    'endpoint' => '/api/webhook.php',
    'allowed_events' => [
        // Your events
    ]
]
```

## Testing

### Test Webhook Unregistration
```bash
# 1. Set a portal's trial to expired
mysql -u root -p bitrix_app -e "
UPDATE app_portals 
SET trial_end_date = DATE_SUB(NOW(), INTERVAL 1 DAY) 
WHERE domain = 'test.bitrix24.com';
"

# 2. Run the cron script
php scripts/check_expired_licenses.php

# 3. Check if webhooks were unregistered
mysql -u root -p bitrix_app -e "
SELECT * FROM app_settings 
WHERE portal_id = (SELECT id FROM app_portals WHERE domain = 'test.bitrix24.com')
AND setting_key = 'webhooks_unregistered';
"
```

### Test Webhook Re-registration
```bash
# Activate license via API
curl -X POST https://your-domain.com/api/rest.php/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test.bitrix24.com",
    "license_key": "TEST-1234-5678-90AB"
  }'

# Check logs for re-registration
tail -f storage/logs/webhooks-*.log | grep "re-register"
```

## Troubleshooting

### Webhooks Not Being Unregistered

1. Check if cron is running:
```bash
# Check cron logs
grep CRON /var/log/syslog

# Check last run time
ls -la /var/log/license-check.log
```

2. Check database connection in script:
```bash
php -r "require 'scripts/check_expired_licenses.php';"
```

3. Verify Bitrix24 API access:
```bash
# Test API call
curl -X POST https://your.bitrix24.com/rest/1/token/event.get/
```

### Webhooks Not Re-registering

1. Check saved webhook data:
```sql
SELECT setting_value 
FROM app_settings 
WHERE setting_key = 'saved_webhooks' 
AND portal_id = (SELECT id FROM app_portals WHERE domain = 'your.bitrix24.com');
```

2. Clear the unregistered flag manually:
```sql
UPDATE app_settings 
SET setting_value = '0' 
WHERE setting_key = 'webhooks_unregistered' 
AND portal_id = (SELECT id FROM app_portals WHERE domain = 'your.bitrix24.com');
```

## Important Notes

1. **Never manually delete webhook records** - Always use WebhookManager
2. **Webhooks are saved before deletion** - Can be restored when license renewed
3. **Portal records are never deleted** - Only deactivated/blocked
4. **Trial can only be used once** - trial_used flag is permanent
5. **Notifications are sent** - Users are informed when service is suspended

## Performance Impact

- Webhook unregistration is done asynchronously via cron
- Real-time checks only happen on webhook requests from expired portals
- Batch operations used for efficiency
- Typically takes < 1 second per portal to process

## Security Considerations

- Only portal admins can manually deactivate licenses
- Webhook configurations are encrypted in database
- API tokens are validated before any operations
- All operations are logged for audit trail