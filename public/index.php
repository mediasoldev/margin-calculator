<?php
/**
 * Main application entry point
 * Handles embedded application display in Bitrix24
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Define that we need database
define('REQUIRE_DATABASE', true);

// Bootstrap the application
require_once __DIR__ . '/backend/bootstrap.php';

use Core\Database;
use Core\Logger;
use Bitrix\TokenManager;

// Initialize services
$logger = new Logger('app');
$db = Database::getInstance();

// Get parameters from Bitrix24
$params = [
    'DOMAIN' => $_REQUEST['DOMAIN'] ?? '',
    'PROTOCOL' => $_REQUEST['PROTOCOL'] ?? '1',
    'LANG' => $_REQUEST['LANG'] ?? 'en',
    'APP_SID' => $_REQUEST['APP_SID'] ?? '',
    'AUTH_ID' => $_REQUEST['AUTH_ID'] ?? '',
    'AUTH_EXPIRES' => $_REQUEST['AUTH_EXPIRES'] ?? '',
    'REFRESH_ID' => $_REQUEST['REFRESH_ID'] ?? '',
    'MEMBER_ID' => $_REQUEST['member_id'] ?? '',
    'USER_ID' => $_REQUEST['USER_ID'] ?? '',
    'PLACEMENT' => $_REQUEST['PLACEMENT'] ?? '',
    'PLACEMENT_OPTIONS' => $_REQUEST['PLACEMENT_OPTIONS'] ?? [],
];

// Validate required parameters
if (empty($params['DOMAIN'])) {
    die('Error: Domain not specified. Please access this application through Bitrix24.');
}

// Load portal data from database
$portal = $db->getPortal($params['DOMAIN']);

if (!$portal) {
    // Portal not installed, redirect to installation
    header('Location: /install/index.php?' . http_build_query($_REQUEST));
    exit;
}

// Check license status
$licenseStatus = $db->checkLicenseStatus($params['DOMAIN']);

// ✅ Form complete license object
$licenseData = [
    // Main license info
    'license_key' => $portal['license_key'] ?? null,
    'is_valid' => $licenseStatus['is_valid'] ?? false,
    'is_active' => (bool)$portal['is_active'],
    'is_trial' => (bool)$portal['is_trial'],
    'trial_used' => (bool)$portal['trial_used'],
    
    // Dates
    'trial_end_date' => $portal['trial_end_date'] ?? null,
    'license_valid_until' => $portal['license_valid_until'] ?? null,
    'license_activated_at' => $portal['license_activated_at'] ?? null,
    'expires_at' => $portal['is_trial'] 
        ? $portal['trial_end_date'] 
        : $portal['license_valid_until'],
    
    // License details
    'licensed_to' => $params['DOMAIN'],
    'license_activated_by' => $portal['license_activated_by'] ?? null,
    'type' => $portal['is_trial'] ? 'Trial' : 'Professional',
    
    // Status info from checkLicenseStatus
    'status_message' => $licenseStatus['message'] ?? '',
    'days_remaining' => $licenseStatus['days_remaining'] ?? 0,
    
    // Block status
    'is_blocked' => (bool)$portal['is_blocked'],
    'block_reason' => $portal['block_reason'] ?? null,
    
    // Features and limits
    'max_users' => isset($portal['max_users']) ? (int)$portal['max_users'] : null,
    'features' => isset($settings['features']) ? json_decode($settings['features'], true) : ['all'],
    
    // Installation info
    'installed_at' => $portal['installed_at'] ?? null,
    'created_at' => $portal['created_at'] ?? null,
];

// Log license status
if (!$licenseStatus['is_valid']) {
    $logger->warning('License invalid - user will be redirected to license page', [
        'domain' => $params['DOMAIN'],
        'license_status' => $licenseStatus
    ]);
}

// Update tokens if new ones provided
if (!empty($params['AUTH_ID']) && !empty($params['REFRESH_ID'])) {
    $db->updateTokens($params['DOMAIN'], [
        'access_token' => $params['AUTH_ID'],
        'refresh_token' => $params['REFRESH_ID'],
        'expires_in' => $params['AUTH_EXPIRES'] ?? 3600,
    ]);
}

// Load portal settings
$settings = $db->getSettings($portal['id']);

// Generate secure session token for API access
session_start();
$sessionToken = bin2hex(random_bytes(32));
$_SESSION['api_token'] = $sessionToken;
$_SESSION['domain'] = $params['DOMAIN'];
$_SESSION['user_id'] = $params['USER_ID'];
$_SESSION['portal_id'] = $portal['id'];
$_SESSION['token_created'] = time();
$_SESSION['token_expires'] = time() + 3600; // 1 hour

// Prepare data for frontend
$appData = [
    'domain' => $params['DOMAIN'],
    'protocol' => $params['PROTOCOL'] === '1',
    'lang' => $params['LANG'],
    'app_sid' => $params['APP_SID'],
    'auth_id' => $params['AUTH_ID'],
    'auth_expires' => $params['AUTH_EXPIRES'],
    'refresh_id' => $params['REFRESH_ID'],
    'member_id' => $portal['member_id'],
    'user_id' => $params['USER_ID'],
    'placement' => $params['PLACEMENT'],
    'placement_options' => $params['PLACEMENT_OPTIONS'],
    'is_admin' => false, // Will be determined by JS
    'settings' => $settings,
    'api_endpoint' => '/api/rest.php',
    'session_token' => $sessionToken,
    
    // ✅ Complete license object
    'license' => $licenseData,
];

// Log application access
$logger->info('Application accessed', [
    'domain' => $params['DOMAIN'],
    'user_id' => $params['USER_ID'],
    'placement' => $params['PLACEMENT'],
    'license_valid' => $licenseStatus['is_valid'],
    'is_trial' => $portal['is_trial']
]);

?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($params['LANG']); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Bitrix24 App - Margin Calculator</title>
    
    <!-- Pass data to JavaScript -->
    <script>
        window.APP_DATA = <?php echo json_encode($appData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;
        console.log('[PHP] APP_DATA initialized:', {
            domain: window.APP_DATA.domain,
            hasSessionToken: !!window.APP_DATA.session_token,
            licenseValid: window.APP_DATA.license?.is_valid,
            isTrial: window.APP_DATA.license?.is_trial,
            daysRemaining: window.APP_DATA.license?.days_remaining
        });
    </script>
    
    <!-- Bitrix24 JS SDK -->
    <script src="//api.bitrix24.com/api/v1/"></script>
    
</head>
<body>
    
    <!-- Include main HTML file -->
    <?php require_once __DIR__ . '/index.html'; ?>
</body>
</html>