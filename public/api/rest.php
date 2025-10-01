<?php
/**
 * REST API endpoint for frontend applications
 * Provides secure API access for Vue.js and other frontends
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Define that we need database
define('REQUIRE_DATABASE', true);

// Bootstrap the application
require_once __DIR__ . '/../../backend/bootstrap.php';

use Core\Database;
use Core\Logger;
use Core\Response;
use Bitrix\CRest;
use Bitrix\TokenManager;

// Initialize services
$logger = new Logger('api');
$db = Database::getInstance();

try {
    // Handle CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        Response::success();
    }
    
    // Get request method and path
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $path = parse_url($uri, PHP_URL_PATH);
    
    // Remove base path to get endpoint
    $basePath = '/api/rest.php';
    $endpoint = str_replace($basePath, '', $path);
    $endpoint = trim($endpoint, '/');
    
    // Get request data
    $inputRaw = file_get_contents('php://input');
    $inputData = json_decode($inputRaw, true) ?? [];
    $queryParams = $_GET;
    
    // Merge data based on method
    $requestData = [];
    if ($method === 'GET') {
        $requestData = $queryParams;
    } else {
        $requestData = array_merge($queryParams, $inputData);
    }
    
    // Log API request
    $logger->debug('API request', [
        'method' => $method,
        'endpoint' => $endpoint,
        'has_data' => !empty($requestData)
    ]);
    
    // Check authentication
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $domain = $requestData['domain'] ?? $_SERVER['HTTP_X_BITRIX_DOMAIN'] ?? '';
    
    if (empty($domain)) {
        Response::unauthorized('Domain not specified');
    }
    
    // Verify domain exists in database
    $portal = $db->getPortal($domain);
    if (!$portal) {
        Response::unauthorized('Portal not found');
    }
    
    // Verify authentication token if provided
    if (!empty($authHeader)) {
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            
            // Verify token (you can implement JWT or custom token validation)
            if ($token !== $portal['application_token']) {
                Response::unauthorized('Invalid token');
            }
        }
    }
    
    // Set domain for CRest
    CRest::setDomain($domain);
    
    // Initialize token manager
    $tokenManager = new TokenManager($domain);
    
    // Route the request
    switch ($endpoint) {
        case '':
        case 'info':
            handleInfo($portal);
            break;
            
        case 'portal/settings':
            handlePortalSettings($method, $portal, $requestData, $db);
            break;
            
        case 'license/check':
            handleLicenseCheck($portal, $db);
            break;
            
        case 'license/activate':
            handleLicenseActivate($portal, $requestData, $db);
            break;
            
        case 'license/validate':
            handleLicenseValidate($requestData);
            break;
            
        case 'bitrix/call':
            handleBitrixCall($requestData, $tokenManager);
            break;
            
        case 'bitrix/batch':
            handleBitrixBatch($requestData, $tokenManager);
            break;
            
        case 'token/refresh':
            handleTokenRefresh($portal, $tokenManager, $db);
            break;
            
        case 'portal/validate':
            handlePortalValidate($portal, $tokenManager);
            break;
            
        case 'diagnostics/full':
            handleDiagnosticsFull($portal, $db, $tokenManager);
            break;
            
        case 'diagnostics/handlers':
            handleDiagnosticsHandlers($portal, $tokenManager);
            break;
            
        case 'diagnostics/storage':
            handleDiagnosticsStorage($portal, $db);
            break;
            
        case 'diagnostics/database':
            handleDiagnosticsDatabase($portal, $db);
            break;
            
        case 'logs/recent':
            handleRecentLogs($portal, $db);
            break;
            
        default:
            Response::notFound('Endpoint not found: ' . $endpoint);
    }
    
} catch (Exception $e) {
    $logger->error('API error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    Response::serverError('Internal Server Error');
}

/**
 * Handle info endpoint
 */
function handleInfo(array $portal): void
{
    $config = require CONFIG_PATH . '/app.php';
    
    Response::success([
        'app' => [
            'name' => $config['app']['name'],
            'version' => $config['app']['version'],
        ],
        'portal' => [
            'domain' => $portal['domain'],
            'member_id' => $portal['member_id'],
            'is_trial' => (bool)$portal['is_trial'],
            'created_at' => $portal['created_at']
        ]
    ]);
}

/**
 * Handle portal settings endpoint
 */
function handlePortalSettings(string $method, array $portal, array $data, Database $db): void
{
    global $logger;
    
    if ($method === 'GET') {
        // Get settings
        $key = $data['key'] ?? null;
        $settings = $db->getSettings($portal['id'], $key);
        
        Response::success([
            'settings' => $settings
        ]);
        
    } elseif ($method === 'POST' || $method === 'PUT') {
        // Save settings
        if (empty($data['key']) || !isset($data['value'])) {
            Response::error('Missing key or value', 400);
        }
        
        $saved = $db->saveSetting($portal['id'], $data['key'], $data['value']);
        
        if ($saved) {
            $logger->info('Settings saved', [
                'portal_id' => $portal['id'],
                'key' => $data['key']
            ]);
            
            Response::success([
                'saved' => true,
                'key' => $data['key']
            ]);
        } else {
            Response::error('Failed to save settings', 500);
        }
        
    } elseif ($method === 'DELETE') {
        // Delete setting
        if (empty($data['key'])) {
            Response::error('Missing key', 400);
        }
        
        // Set to null to delete
        $deleted = $db->saveSetting($portal['id'], $data['key'], null);
        
        Response::success([
            'deleted' => $deleted,
            'key' => $data['key']
        ]);
        
    } else {
        Response::methodNotAllowed();
    }
}

/**
 * Handle Bitrix24 API call
 */
function handleBitrixCall(array $data, TokenManager $tokenManager): void
{
    global $logger;
    
    if (empty($data['method'])) {
        Response::error('Missing method parameter', 400);
    }
    
    $method = $data['method'];
    $params = $data['params'] ?? [];
    
    // Ensure valid token
    if (!$tokenManager->validateTokens()) {
        Response::error('Invalid or expired tokens', 401);
    }
    
    // Make API call
    $result = CRest::call($method, $params);
    
    // Log API call
    $logger->debug('Bitrix24 API call via REST', [
        'method' => $method,
        'has_error' => isset($result['error'])
    ]);
    
    // Check for errors
    if (isset($result['error'])) {
        Response::error(
            $result['error_description'] ?? $result['error'],
            400,
            $result
        );
    }
    
    // Return result
    Response::success([
        'result' => $result['result'] ?? null,
        'total' => $result['total'] ?? null,
        'next' => $result['next'] ?? null
    ]);
}

/**
 * Handle Bitrix24 batch API call
 */
function handleBitrixBatch(array $data, TokenManager $tokenManager): void
{
    global $logger;
    
    if (empty($data['commands']) || !is_array($data['commands'])) {
        Response::error('Missing or invalid commands parameter', 400);
    }
    
    $commands = $data['commands'];
    $halt = $data['halt'] ?? false;
    
    // Ensure valid token
    if (!$tokenManager->validateTokens()) {
        Response::error('Invalid or expired tokens', 401);
    }
    
    // Make batch API call
    $result = CRest::callBatch($commands, $halt ? 1 : 0);
    
    // Log API call
    $logger->debug('Bitrix24 batch API call via REST', [
        'commands_count' => count($commands),
        'halt' => $halt,
        'has_error' => isset($result['error'])
    ]);
    
    // Check for errors
    if (isset($result['error'])) {
        Response::error(
            $result['error_description'] ?? $result['error'],
            400,
            $result
        );
    }
    
    // Return result
    Response::success([
        'result' => $result['result'] ?? [],
        'result_error' => $result['result_error'] ?? [],
        'result_total' => $result['result_total'] ?? [],
        'result_next' => $result['result_next'] ?? []
    ]);
}

/**
 * Handle token refresh
 */
function handleTokenRefresh(array $portal, TokenManager $tokenManager, Database $db): void
{
    global $logger;
    
    // Refresh tokens
    $refreshed = $tokenManager->refreshTokens();
    
    if ($refreshed) {
        // Get updated tokens
        $tokens = $tokenManager->getTokens();
        
        $logger->info('Tokens refreshed via API', [
            'domain' => $portal['domain']
        ]);
        
        Response::success([
            'refreshed' => true,
            'expires_at' => $tokens['expires_at'] ?? null
        ]);
    } else {
        Response::error('Failed to refresh tokens', 500);
    }
}

/**
 * Handle portal validation
 */
function handlePortalValidate(array $portal, TokenManager $tokenManager): void
{
    global $db;
    
    // Get license status
    $licenseStatus = $db->checkLicenseStatus($portal['domain']);
    
    // Validate tokens
    $tokensValid = $tokenManager->validateTokens();
    
    // Get remaining lifetime
    $remaining = $tokenManager->getRemainingLifetime();
    
    Response::success([
        'valid' => $tokensValid && $licenseStatus['is_valid'],
        'domain' => $portal['domain'],
        'member_id' => $portal['member_id'],
        'license_status' => $licenseStatus,
        'is_trial' => (bool)$portal['is_trial'],
        'is_active' => (bool)$portal['is_active'],
        'is_blocked' => (bool)$portal['is_blocked'],
        'block_reason' => $portal['block_reason'] ?? null,
        'token_remaining_seconds' => $remaining,
        'token_expires_at' => $portal['expires_at'] ?? null
    ]);
}

/**
 * Handle license check
 */
function handleLicenseCheck(array $portal, Database $db): void
{
    $status = $db->checkLicenseStatus($portal['domain']);
    
    Response::success([
        'license_status' => $status,
        'portal' => [
            'domain' => $portal['domain'],
            'member_id' => $portal['member_id'],
            'is_trial' => (bool)$portal['is_trial'],
            'trial_used' => (bool)$portal['trial_used'],
            'has_license' => !empty($portal['license_key'])
        ]
    ]);
}

/**
 * Handle license activation
 */
function handleLicenseActivate(array $portal, array $data, Database $db): void
{
    global $logger;
    
    if (empty($data['license_key'])) {
        Response::error('License key is required', 400);
    }
    
    $licenseKey = $data['license_key'];
    $validUntil = $data['valid_until'] ?? null;
    $userId = $data['user_id'] ?? null;
    
    // Validate license key format
    $pattern = '/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/';
    if (!preg_match($pattern, $licenseKey)) {
        Response::error('Invalid license key format', 400);
    }
    
    // TODO: Verify with license server
    // For now, just activate it
    
    $activated = $db->activateLicense(
        $portal['domain'],
        $licenseKey,
        $validUntil,
        $userId
    );
    
    if ($activated) {
        $logger->info('License activated via API', [
            'domain' => $portal['domain'],
            'license_key' => substr($licenseKey, 0, 8) . '...'
        ]);
        
        Response::success([
            'activated' => true,
            'valid_until' => $validUntil,
            'message' => 'License activated successfully'
        ]);
    } else {
        Response::error('Failed to activate license', 500);
    }
}

/**
 * Handle full diagnostics request
 */
function handleDiagnosticsFull(array $portal, Database $db, TokenManager $tokenManager): void
{
    global $logger;
    
    $diagnostics = [
        'portal' => [
            'domain' => $portal['domain'],
            'member_id' => $portal['member_id'],
            'is_active' => (bool)$portal['is_active'],
            'is_blocked' => (bool)$portal['is_blocked'],
            'is_trial' => (bool)$portal['is_trial'],
            'trial_used' => (bool)$portal['trial_used'],
            'trial_end_date' => $portal['trial_end_date'],
            'has_license' => !empty($portal['license_key']),
            'license_valid_until' => $portal['license_valid_until'],
            'installed_at' => $portal['installed_at'],
            'reinstall_count' => $portal['reinstall_count'] ?? 0
        ],
        'license' => $db->checkLicenseStatus($portal['domain']),
        'tokens' => [
            'valid' => $tokenManager->validateTokens(),
            'expires_in' => $tokenManager->getRemainingLifetime(),
            'last_refresh' => $portal['updated_at']
        ],
        'database' => getDatabaseStats($db),
        'settings' => $db->getSettings($portal['id']),
        'system' => [
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true),
            'execution_time' => round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 3)
        ]
    ];
    
    $logger->info('Diagnostics requested', [
        'domain' => $portal['domain'],
        'user_id' => $_REQUEST['user_id'] ?? null
    ]);
    
    Response::success($diagnostics);
}

/**
 * Handle diagnostics handlers request
 */
function handleDiagnosticsHandlers(array $portal, TokenManager $tokenManager): void
{
    // Ensure valid token
    if (!$tokenManager->validateTokens()) {
        Response::error('Invalid or expired tokens', 401);
    }
    
    // Get event handlers
    $result = CRest::call('event.get');
    $handlers = $result['result'] ?? [];
    
    // Get placements
    $placementsResult = CRest::call('placement.get');
    $placements = $placementsResult['result'] ?? [];
    
    // Get scope
    $scopeResult = CRest::call('scope');
    $scope = $scopeResult['result'] ?? [];
    
    Response::success([
        'event_handlers' => $handlers,
        'placements' => $placements,
        'scope' => $scope
    ]);
}

/**
 * Handle diagnostics storage request
 */
function handleDiagnosticsStorage(array $portal, Database $db): void
{
    $conn = $db->getConnection();
    $config = require CONFIG_PATH . '/database.php';
    $prefix = $config['prefix'] ?? 'app_';
    
    $storage = [];
    
    // Get table sizes
    $tables = [
        'portals' => "SELECT COUNT(*) as count FROM {$prefix}portals",
        'settings' => "SELECT COUNT(*) as count FROM {$prefix}settings WHERE portal_id = ?",
        'tokens' => "SELECT COUNT(*) as count FROM {$prefix}tokens WHERE portal_id = ?",
        'logs' => "SELECT COUNT(*) as count FROM {$prefix}logs WHERE portal_id = ?",
        'cache' => "SELECT COUNT(*) as count FROM {$prefix}cache"
    ];
    
    foreach ($tables as $name => $query) {
        $stmt = $conn->prepare($query);
        if (strpos($query, '?') !== false) {
            $stmt->execute([$portal['id']]);
        } else {
            $stmt->execute();
        }
        $result = $stmt->fetch();
        $storage[$name] = $result['count'] ?? 0;
    }
    
    // Get storage usage
    $stmt = $conn->query("SELECT 
        table_name AS 'Table',
        round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size_MB'
        FROM information_schema.TABLES 
        WHERE table_schema = DATABASE()
        AND table_name LIKE '{$prefix}%'");
    
    $storage['sizes'] = $stmt->fetchAll();
    
    Response::success($storage);
}

/**
 * Handle diagnostics database request  
 */
function handleDiagnosticsDatabase(array $portal, Database $db): void
{
    $conn = $db->getConnection();
    
    $stats = [
        'connection' => true,
        'version' => $conn->getAttribute(\PDO::ATTR_SERVER_VERSION),
        'driver' => $conn->getAttribute(\PDO::ATTR_DRIVER_NAME),
        'portal_data' => [
            'id' => $portal['id'],
            'records_count' => getDatabaseStats($db)
        ]
    ];
    
    Response::success($stats);
}

/**
 * Handle recent logs request
 */
function handleRecentLogs(array $portal, Database $db): void
{
    $conn = $db->getConnection();
    $config = require CONFIG_PATH . '/database.php';
    $prefix = $config['prefix'] ?? 'app_';
    
    // Get last 50 error logs
    $stmt = $conn->prepare(
        "SELECT level, channel, message, context, created_at 
        FROM {$prefix}logs 
        WHERE portal_id = ? 
        AND level IN ('error', 'critical', 'alert', 'emergency')
        ORDER BY created_at DESC 
        LIMIT 50"
    );
    $stmt->execute([$portal['id']]);
    $logs = $stmt->fetchAll();
    
    $errors = array_map(function($log) {
        return [
            'timestamp' => $log['created_at'],
            'level' => $log['level'],
            'channel' => $log['channel'],
            'message' => $log['message'],
            'context' => json_decode($log['context'], true)
        ];
    }, $logs);
    
    Response::success(['errors' => $errors]);
}

/**
 * Get database statistics
 */
function getDatabaseStats(Database $db): array
{
    $conn = $db->getConnection();
    $config = require CONFIG_PATH . '/database.php';
    $prefix = $config['prefix'] ?? 'app_';
    
    $stats = [];
    $tables = ['portals', 'settings', 'tokens', 'logs', 'cache'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $conn->query("SELECT COUNT(*) as count FROM {$prefix}{$table}");
            $result = $stmt->fetch();
            $stats[$table] = $result['count'] ?? 0;
        } catch (\Exception $e) {
            $stats[$table] = 'error';
        }
    }
    
    return $stats;
}