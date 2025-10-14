<?php
/**
 * Health check endpoint
 * Provides quick system status for monitoring
 */

// Bootstrap the application
require_once __DIR__ . '/../backend/bootstrap.php';

use Core\Database;
use Core\Logger;
use Core\Response;

// Initialize services
$logger = new Logger('health');
$db = Database::getInstance();

// Health check data
$health = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

// Check database connection
try {
    if ($db && $db->getConnection()) {
        $conn = $db->getConnection();
        $conn->query('SELECT 1');
        $health['checks']['database'] = [
            'status' => 'ok',
            'message' => 'Database connection active'
        ];
    } else {
        throw new Exception('Database connection not available');
    }
} catch (Exception $e) {
    $health['status'] = 'degraded';
    $health['checks']['database'] = [
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ];
}

// Check file system
try {
    $testFile = STORAGE_PATH . '/health_check.tmp';
    file_put_contents($testFile, 'test');
    
    if (file_exists($testFile)) {
        unlink($testFile);
        $health['checks']['filesystem'] = [
            'status' => 'ok',
            'message' => 'File system is writable'
        ];
    } else {
        throw new Exception('Cannot write to storage directory');
    }
} catch (Exception $e) {
    $health['status'] = 'degraded';
    $health['checks']['filesystem'] = [
        'status' => 'error',
        'message' => 'File system check failed',
        'error' => $e->getMessage()
    ];
}

// Check PHP version
$phpVersion = PHP_VERSION;
$requiredVersion = '7.4.0';

if (version_compare($phpVersion, $requiredVersion, '>=')) {
    $health['checks']['php'] = [
        'status' => 'ok',
        'message' => 'PHP version is compatible',
        'version' => $phpVersion
    ];
} else {
    $health['status'] = 'degraded';
    $health['checks']['php'] = [
        'status' => 'warning',
        'message' => 'PHP version is below recommended',
        'version' => $phpVersion,
        'required' => $requiredVersion
    ];
}

// Check required PHP extensions
$requiredExtensions = ['curl', 'json', 'pdo', 'pdo_mysql', 'mbstring'];
$missingExtensions = [];

foreach ($requiredExtensions as $extension) {
    if (!extension_loaded($extension)) {
        $missingExtensions[] = $extension;
    }
}

if (empty($missingExtensions)) {
    $health['checks']['extensions'] = [
        'status' => 'ok',
        'message' => 'All required PHP extensions are loaded'
    ];
} else {
    $health['status'] = 'degraded';
    $health['checks']['extensions'] = [
        'status' => 'error',
        'message' => 'Missing required PHP extensions',
        'missing' => $missingExtensions
    ];
}

// Check memory usage
$memoryLimit = ini_get('memory_limit');
$memoryUsage = memory_get_usage(true);
$memoryPeak = memory_get_peak_usage(true);
$memoryPercent = 0;

if ($memoryLimit !== '-1') {
    $memoryLimitBytes = convertToBytes($memoryLimit);
    $memoryPercent = round(($memoryPeak / $memoryLimitBytes) * 100, 2);
}

if ($memoryPercent < 80) {
    $health['checks']['memory'] = [
        'status' => 'ok',
        'message' => 'Memory usage is normal',
        'usage' => formatBytes($memoryUsage),
        'peak' => formatBytes($memoryPeak),
        'limit' => $memoryLimit,
        'percent' => $memoryPercent . '%'
    ];
} else {
    $health['status'] = 'degraded';
    $health['checks']['memory'] = [
        'status' => 'warning',
        'message' => 'High memory usage',
        'usage' => formatBytes($memoryUsage),
        'peak' => formatBytes($memoryPeak),
        'limit' => $memoryLimit,
        'percent' => $memoryPercent . '%'
    ];
}

// Check disk space
$freeSpace = disk_free_space(STORAGE_PATH);
$totalSpace = disk_total_space(STORAGE_PATH);
$usedSpace = $totalSpace - $freeSpace;
$diskPercent = round(($usedSpace / $totalSpace) * 100, 2);

if ($diskPercent < 80) {
    $health['checks']['disk'] = [
        'status' => 'ok',
        'message' => 'Disk space is sufficient',
        'free' => formatBytes($freeSpace),
        'total' => formatBytes($totalSpace),
        'percent_used' => $diskPercent . '%'
    ];
} else {
    $health['status'] = 'degraded';
    $health['checks']['disk'] = [
        'status' => 'warning',
        'message' => 'Low disk space',
        'free' => formatBytes($freeSpace),
        'total' => formatBytes($totalSpace),
        'percent_used' => $diskPercent . '%'
    ];
}

// Check recent errors
try {
    $recentErrors = Logger::getLogStatistics();
    $errorCount = 0;
    
    foreach ($recentErrors as $stat) {
        if ($stat['level'] === 'error' || $stat['level'] === 'critical') {
            $errorCount += $stat['count'];
        }
    }
    
    if ($errorCount === 0) {
        $health['checks']['errors'] = [
            'status' => 'ok',
            'message' => 'No recent errors'
        ];
    } else {
        $health['checks']['errors'] = [
            'status' => 'warning',
            'message' => 'Recent errors detected',
            'count' => $errorCount,
            'period' => 'last 24 hours'
        ];
    }
} catch (Exception $e) {
    $health['checks']['errors'] = [
        'status' => 'unknown',
        'message' => 'Could not check error logs'
    ];
}

// Check active portals
if ($db) {
    try {
        $diagnostics = $db->getDiagnostics();
        $portalStats = $diagnostics['statistics']['portals'] ?? [];
        
        $health['checks']['portals'] = [
            'status' => 'ok',
            'message' => 'Portal statistics',
            'total' => $portalStats['total_records'] ?? 0,
            'active' => $portalStats['active'] ?? 0,
            'trial' => $portalStats['trial'] ?? 0,
            'licensed' => $portalStats['licensed'] ?? 0
        ];
    } catch (Exception $e) {
        $health['checks']['portals'] = [
            'status' => 'error',
            'message' => 'Could not get portal statistics'
        ];
    }
}

// Overall status determination
$criticalErrors = 0;
$warnings = 0;

foreach ($health['checks'] as $check) {
    if ($check['status'] === 'error') {
        $criticalErrors++;
    } elseif ($check['status'] === 'warning') {
        $warnings++;
    }
}

if ($criticalErrors > 0) {
    $health['status'] = 'error';
    $health['message'] = "System has $criticalErrors critical issues";
} elseif ($warnings > 0) {
    $health['status'] = 'degraded';
    $health['message'] = "System has $warnings warnings";
} else {
    $health['status'] = 'ok';
    $health['message'] = 'All systems operational';
}

// Add response time
$health['response_time'] = round((microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']) * 1000, 2) . 'ms';

// Send appropriate HTTP status code
$httpStatus = 200;
if ($health['status'] === 'error') {
    $httpStatus = 503; // Service Unavailable
} elseif ($health['status'] === 'degraded') {
    $httpStatus = 200; // Still return 200 for degraded
}

// Log health check
$logger->debug('Health check performed', [
    'status' => $health['status'],
    'checks_count' => count($health['checks']),
    'response_time' => $health['response_time']
]);

// Send response
http_response_code($httpStatus);
header('Content-Type: application/json');
echo json_encode($health, JSON_PRETTY_PRINT);

/**
 * Convert memory string to bytes
 */
function convertToBytes(string $value): int
{
    $value = trim($value);
    $last = strtolower($value[strlen($value) - 1]);
    $value = (int)$value;
    
    switch ($last) {
        case 'g':
            $value *= 1024;
        case 'm':
            $value *= 1024;
        case 'k':
            $value *= 1024;
    }
    
    return $value;
}

/**
 * Format bytes to human readable
 */
function formatBytes(int $bytes, int $precision = 2): string
{
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}