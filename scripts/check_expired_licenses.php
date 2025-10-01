
#!/usr/bin/php
<?php
/**
 * Cron script to check expired licenses and unregister webhooks
 * Run daily via cron: 0 2 * * * /usr/bin/php /path/to/scripts/check_expired_licenses.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Define that we need database
define('REQUIRE_DATABASE', true);

// Bootstrap the application
require_once __DIR__ . '/../backend/bootstrap.php';

use Core\Database;
use Core\Logger;
use Bitrix\WebhookManager;

// Initialize services
$logger = new Logger('cron-license-check');
$db = Database::getInstance();

// Log start
$logger->info('Starting license check and webhook cleanup');

try {
    // Get database configuration
    $config = require CONFIG_PATH . '/database.php';
    $prefix = $config['prefix'] ?? 'app_';
    
    // Get all active portals
    $stmt = $db->getConnection()->query(
        "SELECT 
            p.id,
            p.domain,
            p.member_id,
            p.is_trial,
            p.trial_end_date,
            p.license_key,
            p.license_valid_until,
            p.is_active,
            p.is_blocked,
            p.user_id,
            p.access_token,
            p.refresh_token,
            p.application_token
        FROM {$prefix}portals p
        WHERE p.is_active = 1"
    );
    
    $portals = $stmt->fetchAll();
    
    $stats = [
        'total_checked' => 0,
        'expired_found' => 0,
        'webhooks_unregistered' => 0,
        'already_unregistered' => 0,
        'errors' => 0,
        'notifications_sent' => 0
    ];
    
    foreach ($portals as $portal) {
        $stats['total_checked']++;
        
        try {
            $logger->debug('Checking portal', [
                'domain' => $portal['domain'],
                'is_trial' => $portal['is_trial'],
                'trial_end' => $portal['trial_end_date'],
                'license_valid_until' => $portal['license_valid_until']
            ]);
            
            // Check if webhooks are already unregistered
            $settings = $db->getSettings($portal['id'], 'webhooks_unregistered');
            if (!empty($settings['webhooks_unregistered']) && $settings['webhooks_unregistered'] === '1') {
                $logger->debug('Webhooks already unregistered for portal', [
                    'domain' => $portal['domain']
                ]);
                $stats['already_unregistered']++;
                continue;
            }
            
            // Check license status
            $licenseStatus = $db->checkLicenseStatus($portal['domain']);
            
            if (!$licenseStatus['is_valid']) {
                $stats['expired_found']++;
                
                $logger->warning('Found expired license', [
                    'domain' => $portal['domain'],
                    'status' => $licenseStatus['status'],
                    'reason' => $licenseStatus['reason'] ?? 'Unknown'
                ]);
                
                // Initialize webhook manager
                $webhookManager = new WebhookManager($portal['domain']);
                
                // Unregister webhooks
                $reason = 'Automated cleanup - ';
                if ($licenseStatus['status'] === 'trial' && !$licenseStatus['is_valid']) {
                    $reason .= 'Trial expired';
                } elseif ($licenseStatus['status'] === 'expired') {
                    $reason .= 'License expired';
                } elseif ($licenseStatus['status'] === 'blocked') {
                    $reason .= 'Portal blocked';
                } else {
                    $reason .= $licenseStatus['reason'] ?? 'License invalid';
                }
                
                $unregistered = $webhookManager->unregisterAllWebhooks($reason);
                
                if ($unregistered) {
                    $stats['webhooks_unregistered']++;
                    
                    $logger->info('Successfully unregistered webhooks', [
                        'domain' => $portal['domain'],
                        'reason' => $reason
                    ]);
                    
                    // Send notification to portal admin
                    if ($portal['user_id'] && $portal['access_token']) {
                        try {
                            sendExpirationNotification($portal, $licenseStatus, $logger);
                            $stats['notifications_sent']++;
                        } catch (Exception $e) {
                            $logger->warning('Failed to send notification', [
                                'domain' => $portal['domain'],
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                    
                    // Block portal if not already blocked
                    if (!$portal['is_blocked']) {
                        $db->blockPortal($portal['domain'], $reason);
                        $logger->info('Portal blocked due to expired license', [
                            'domain' => $portal['domain']
                        ]);
                    }
                    
                } else {
                    $stats['errors']++;
                    $logger->error('Failed to unregister webhooks', [
                        'domain' => $portal['domain']
                    ]);
                }
            } else {
                // License is valid, check if portal was previously blocked
                if ($portal['is_blocked']) {
                    $logger->info('Found blocked portal with valid license', [
                        'domain' => $portal['domain']
                    ]);
                    
                    // This shouldn't happen, but if it does, unblock and re-register webhooks
                    $db->unblockPortal($portal['domain']);
                    
                    $webhookManager = new WebhookManager($portal['domain']);
                    $webhookManager->reregisterWebhooks();
                    
                    $logger->info('Portal unblocked and webhooks re-registered', [
                        'domain' => $portal['domain']
                    ]);
                }
            }
            
        } catch (Exception $e) {
            $stats['errors']++;
            $logger->error('Error processing portal', [
                'domain' => $portal['domain'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    
    // Log summary
    $logger->info('License check and webhook cleanup completed', $stats);
    
    // Send admin report if there were any actions
    if ($stats['expired_found'] > 0 || $stats['errors'] > 0) {
        sendAdminReport($stats, $logger);
    }
    
    // Perform additional maintenance
    performMaintenance($db, $logger);
    
} catch (Exception $e) {
    $logger->critical('Critical error in license check script', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Send alert to admin
    $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@example.com';
    mail(
        $adminEmail,
        'CRITICAL: License check script failed',
        "Error: " . $e->getMessage() . "\n\nTrace:\n" . $e->getTraceAsString(),
        'From: cron@' . gethostname()
    );
    
    exit(1);
}

/**
 * Send expiration notification to portal admin
 */
function sendExpirationNotification(array $portal, array $licenseStatus, Logger $logger): void
{
    // Set domain for API calls
    \Bitrix\CRest::setDomain($portal['domain']);
    
    // Prepare message
    $appConfig = require CONFIG_PATH . '/app.php';
    $appName = $appConfig['app']['name'] ?? 'Bitrix24 App';
    
    $message = "⚠️ $appName - Service Suspended\n\n";
    
    if ($licenseStatus['status'] === 'trial') {
        $message .= "Your trial period has expired.\n\n";
        $message .= "To continue using the application, please purchase a license.\n";
    } else {
        $message .= "Your license has expired.\n\n";
        $message .= "Please renew your license to continue using the application.\n";
    }
    
    $message .= "\nApplication webhooks have been disabled to prevent unnecessary load.\n";
    $message .= "Your data remains safe and will be available once the license is renewed.\n\n";
    $message .= "Contact support if you need assistance.";
    
    // Send notification via Bitrix24 IM
    $result = \Bitrix\CRest::call('im.notify', [
        'to' => $portal['user_id'],
        'message' => $message,
        'type' => 'SYSTEM'
    ]);
    
    if (isset($result['error'])) {
        $logger->warning('Failed to send IM notification', [
            'domain' => $portal['domain'],
            'error' => $result['error']
        ]);
    }
}

/**
 * Send admin report
 */
function sendAdminReport(array $stats, Logger $logger): void
{
    $adminEmail = $_ENV['ADMIN_EMAIL'] ?? '';
    
    if (empty($adminEmail)) {
        return;
    }
    
    $subject = 'License Check Report - ' . date('Y-m-d');
    
    $message = "Daily License Check and Webhook Cleanup Report\n";
    $message .= "================================================\n\n";
    $message .= "Date: " . date('Y-m-d H:i:s') . "\n\n";
    
    $message .= "Statistics:\n";
    $message .= "-----------\n";
    $message .= "Total portals checked: {$stats['total_checked']}\n";
    $message .= "Expired licenses found: {$stats['expired_found']}\n";
    $message .= "Webhooks unregistered: {$stats['webhooks_unregistered']}\n";
    $message .= "Already unregistered: {$stats['already_unregistered']}\n";
    $message .= "Notifications sent: {$stats['notifications_sent']}\n";
    $message .= "Errors: {$stats['errors']}\n\n";
    
    if ($stats['errors'] > 0) {
        $message .= "⚠️ There were {$stats['errors']} errors during processing.\n";
        $message .= "Please check the logs for details.\n\n";
    }
    
    $message .= "This is an automated report from the license check cron job.\n";
    
    $headers = 'From: cron@' . gethostname() . "\r\n" .
               'Reply-To: noreply@' . gethostname() . "\r\n" .
               'X-Mailer: PHP/' . phpversion();
    
    mail($adminEmail, $subject, $message, $headers);
    
    $logger->info('Admin report sent', ['email' => $adminEmail]);
}

/**
 * Perform additional maintenance tasks
 */
function performMaintenance(Database $db, Logger $logger): void
{
    try {
        // Clean old logs (keep 30 days)
        $results = $db->performMaintenance(30);
        
        $logger->info('Maintenance completed', $results);
        
        // Clean expired cache
        $cleaned = $db->cleanExpiredCache();
        
        $logger->info('Cache cleaned', ['entries_removed' => $cleaned]);
        
        // Optimize tables (once a week - on Sunday)
        if (date('w') == 0) {
            $config = require CONFIG_PATH . '/database.php';
            $prefix = $config['prefix'] ?? 'app_';
            
            $tables = ['portals', 'settings', 'tokens', 'logs', 'cache', 'api_calls'];
            
            foreach ($tables as $table) {
                try {
                    $db->getConnection()->exec("OPTIMIZE TABLE {$prefix}{$table}");
                    $logger->info('Table optimized', ['table' => "{$prefix}{$table}"]);
                } catch (Exception $e) {
                    $logger->warning('Failed to optimize table', [
                        'table' => "{$prefix}{$table}",
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
        
    } catch (Exception $e) {
        $logger->error('Maintenance failed', [
            'error' => $e->getMessage()
        ]);
    }
}

// Exit successfully
exit(0);