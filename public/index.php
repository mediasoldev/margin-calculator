<!-- public/index.php -->
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

// If license is not valid, show license required page
if (!$licenseStatus['is_valid']) {
    // Allow access to license activation page
    if (isset($_GET['action']) && $_GET['action'] === 'activate_license') {
        // Continue to show license activation form
    } else {
        // Show license expired/required message
        // showLicenseRequiredPage($licenseStatus, $params);

        print_r('<h3>Show license expired</h3>');
        // exit;
    }
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
    'is_trial' => (bool)$portal['is_trial'],
    'trial_end_date' => $portal['trial_end_date'] ?? null,
];

// Log application access
$logger->info('Application accessed', [
    'domain' => $params['DOMAIN'],
    'user_id' => $params['USER_ID'],
    'placement' => $params['PLACEMENT']
]);

?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($params['LANG']); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Bitrix24 App</title>
    
    <!-- Pass data to JavaScript -->
    <script>
        window.APP_DATA = <?php echo json_encode($appData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;
    </script>
    
    <!-- Bitrix24 JS SDK -->
    <script src="//api.bitrix24.com/api/v1/"></script>
    

</head>
<body>
    <!-- Include main HTML file -->
    <?php require_once __DIR__ . '/index.html'; ?>
</body>
</html>