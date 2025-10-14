<!-- install/index.php -->
<?php
/**
 * Installation entry point
 * Receives parameters from Bitrix24 and initiates installation process
 */


// Define that we need database
define('REQUIRE_DATABASE', true);

// Bootstrap the application
require_once __DIR__ . '/../backend/bootstrap.php';


// Get installation parameters from Bitrix24
$installParams = [
    'DOMAIN' => $_REQUEST['DOMAIN'] ?? '',
    'LANG' => $_REQUEST['LANG'] ?? '',
    'PROTOCOL' => $_REQUEST['PROTOCOL'] ?? '',
    'AUTH_ID' => $_REQUEST['AUTH_ID'] ?? '',
    'AUTH_EXPIRES' => $_REQUEST['AUTH_EXPIRES'] ?? '',
    'APP_SID' => $_REQUEST['APP_SID'] ?? '',
    'REFRESH_ID' => $_REQUEST['REFRESH_ID'] ?? '',
    'MEMBER_ID' => $_REQUEST['member_id'] ?? '',
    'INSTALL_OPTIONS' => $_REQUEST['INSTALL_OPTIONS'] ?? [],
    'PLACEMENT' => $_REQUEST['PLACEMENT'] ?? 'DEFAULT',
    'PLACEMENT_OPTIONS' => $_REQUEST['PLACEMENT_OPTIONS'] ?? [],
];


// Validate required parameters
$requiredParams = ['DOMAIN', 'LANG', 'PROTOCOL', 'APP_SID'];
$missingParams = [];

foreach ($requiredParams as $param) {
    if (empty($installParams[$param])) {
        $missingParams[] = $param;
    }
}

if (!empty($missingParams)) {
    // Log error
    error_log('Installation failed - missing parameters: ' . implode(', ', $missingParams));
    error_log('Request data: ' . print_r($_REQUEST, true));
    
    // Show error message
    die('Installation error: Missing required parameters. Please try again or contact support.');
}

// Pass parameters to JavaScript
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Installing Application...</title>
    
    <script>
        // Pass installation parameters to JavaScript
        window.INSTALL_PARAMS = <?php echo json_encode($installParams, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;
    </script>
    

</head>
<body>

    <!-- Load the main installation HTML file -->
    <?php require_once __DIR__ . '/install.html'; ?>
    
</body>
</html>