<?php
/**
 * API Statistics endpoint
 * Provides detailed statistics about API usage
 */

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Bootstrap the application
require_once __DIR__ . '/../backend/bootstrap.php';

use Core\Database;
use Core\Logger;
use Core\Response;
use Bitrix\ApiCallTracker;

// Initialize services
$logger = new Logger('api_stats');
$db = Database::getInstance();
$tracker = ApiCallTracker::getInstance();

// Get request parameters
$action = $_GET['action'] ?? 'summary';
$domain = $_GET['domain'] ?? '';
$format = $_GET['format'] ?? 'json';

// Check authentication if domain is specified
if ($domain) {
    $portal = $db->getPortal($domain);
    if (!$portal) {
        Response::unauthorized('Portal not found');
    }
    
    // Verify token if provided
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($authHeader) {
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            if ($token !== $portal['application_token']) {
                Response::unauthorized('Invalid token');
            }
        }
    }
}

try {
    switch ($action) {
        case 'summary':
            handleSummary();
            break;
            
        case 'performance':
            handlePerformance();
            break;
            
        case 'methods':
            handleMethods();
            break;
            
        case 'recent':
            handleRecentCalls();
            break;
            
        case 'failed':
            handleFailedCalls();
            break;
            
        case 'slow':
            handleSlowCalls();
            break;
            
        case 'rate-limits':
            handleRateLimits();
            break;
            
        case 'export':
            handleExport($format);
            break;
            
        case 'database':
            handleDatabaseStats($domain);
            break;
            
        case 'realtime':
            handleRealtime();
            break;
            
        default:
            Response::error('Unknown action: ' . $action, 400);
    }
} catch (Exception $e) {
    $logger->error('Statistics error', [
        'action' => $action,
        'error' => $e->getMessage()
    ]);
    
    Response::serverError('Failed to get statistics');
}

/**
 * Handle summary statistics
 */
function handleSummary(): void
{
    global $tracker, $db;
    
    $stats = $tracker->getStatistics();
    $rateLimits = $tracker->checkRateLimits();
    $dbStats = [];
    
    if ($db) {
        $diagnostics = $db->getDiagnostics();
        $dbStats = $diagnostics['statistics'] ?? [];
    }
    
    $summary = [
        'api_calls' => [
            'total' => $stats['total_calls'],
            'successful' => $stats['successful_calls'],
            'failed' => $stats['failed_calls'],
            'success_rate' => $stats['success_rate'] . '%',
            'avg_response_time' => round($stats['avg_call_time'], 2) . 'ms',
            'total_time' => round($stats['total_time'], 2) . 'ms'
        ],
        'rate_limits' => [
            'status' => $rateLimits['is_at_limit'] ? 'LIMIT_REACHED' : 
                       ($rateLimits['is_near_limit'] ? 'NEAR_LIMIT' : 'NORMAL'),
            'used' => $rateLimits['used'],
            'limit' => $rateLimits['limit'],
            'remaining' => $rateLimits['remaining'],
            'percent' => $rateLimits['percent_used'] . '%'
        ],
        'database' => $dbStats,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    Response::success($summary);
}

/**
 * Handle performance report
 */
function handlePerformance(): void
{
    global $tracker;
    
    $report = $tracker->getPerformanceReport();
    
    Response::success($report);
}

/**
 * Handle methods statistics
 */
function handleMethods(): void
{
    global $tracker;
    
    $method = $_GET['method'] ?? null;
    $methodStats = $tracker->getMethodStatistics($method);
    
    if ($method && empty($methodStats)) {
        Response::notFound('Method not found in statistics');
    }
    
    // Format statistics
    $formatted = [];
    foreach ($methodStats as $methodName => $stats) {
        $formatted[] = [
            'method' => $methodName,
            'calls' => $stats['count'],
            'success' => $stats['success'],
            'failed' => $stats['failed'],
            'success_rate' => $stats['count'] > 0 ? 
                round(($stats['success'] / $stats['count']) * 100, 2) : 0,
            'avg_time' => round($stats['avg_time'], 2),
            'min_time' => round($stats['min_time'], 2),
            'max_time' => round($stats['max_time'], 2),
            'total_time' => round($stats['total_time'], 2)
        ];
    }
    
    // Sort by call count
    usort($formatted, function($a, $b) {
        return $b['calls'] - $a['calls'];
    });
    
    Response::success([
        'methods' => $formatted,
        'total_methods' => count($formatted)
    ]);
}

/**
 * Handle recent calls
 */
function handleRecentCalls(): void
{
    global $tracker;
    
    $limit = (int)($_GET['limit'] ?? 20);
    $limit = min(100, max(1, $limit));
    
    $recentCalls = $tracker->getRecentCalls($limit);
    
    Response::success([
        'calls' => $recentCalls,
        'count' => count($recentCalls),
        'limit' => $limit
    ]);
}

/**
 * Handle failed calls
 */
function handleFailedCalls(): void
{
    global $tracker;
    
    $failedCalls = $tracker->getFailedCalls();
    
    // Group by error type
    $errorTypes = [];
    foreach ($failedCalls as $call) {
        $error = $call['error'] ?? 'unknown';
        if (!isset($errorTypes[$error])) {
            $errorTypes[$error] = [
                'error' => $error,
                'count' => 0,
                'methods' => []
            ];
        }
        $errorTypes[$error]['count']++;
        $errorTypes[$error]['methods'][] = $call['method'];
    }
    
    Response::success([
        'failed_calls' => array_values($failedCalls),
        'total_failed' => count($failedCalls),
        'error_types' => array_values($errorTypes)
    ]);
}

/**
 * Handle slow calls
 */
function handleSlowCalls(): void
{
    global $tracker;
    
    $threshold = (float)($_GET['threshold'] ?? 500);
    $slowCalls = $tracker->getSlowCalls($threshold);
    
    // Sort by duration
    usort($slowCalls, function($a, $b) {
        return $b['duration'] <=> $a['duration'];
    });
    
    Response::success([
        'slow_calls' => array_values($slowCalls),
        'total_slow' => count($slowCalls),
        'threshold_ms' => $threshold
    ]);
}

/**
 * Handle rate limits check
 */
function handleRateLimits(): void
{
    global $tracker;
    
    $limits = $tracker->checkRateLimits();
    
    // Add recommendations
    $recommendations = [];
    
    if ($limits['is_at_limit']) {
        $recommendations[] = 'Rate limit reached! Requests may be throttled.';
        $recommendations[] = 'Consider implementing request queuing.';
    } elseif ($limits['is_near_limit']) {
        $recommendations[] = 'Approaching rate limit. Reduce request frequency.';
        $recommendations[] = 'Consider batch operations where possible.';
    }
    
    Response::success([
        'rate_limits' => $limits,
        'recommendations' => $recommendations,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Handle export
 */
function handleExport(string $format): void
{
    global $tracker;
    
    if ($format === 'csv') {
        handleCSVExport();
    } else {
        $export = $tracker->exportStatistics();
        
        if ($format === 'download') {
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="api_stats_' . date('Y-m-d_His') . '.json"');
            echo $export;
            exit;
        } else {
            Response::success(json_decode($export, true));
        }
    }
}

/**
 * Handle CSV export
 */
function handleCSVExport(): void
{
    global $tracker;
    
    $methodStats = $tracker->getMethodStatistics();
    
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="api_methods_' . date('Y-m-d_His') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Header
    fputcsv($output, [
        'Method',
        'Total Calls',
        'Successful',
        'Failed',
        'Success Rate %',
        'Avg Time (ms)',
        'Min Time (ms)',
        'Max Time (ms)',
        'Total Time (ms)'
    ]);
    
    // Data
    foreach ($methodStats as $method => $stats) {
        fputcsv($output, [
            $method,
            $stats['count'],
            $stats['success'],
            $stats['failed'],
            $stats['count'] > 0 ? round(($stats['success'] / $stats['count']) * 100, 2) : 0,
            round($stats['avg_time'], 2),
            round($stats['min_time'], 2),
            round($stats['max_time'], 2),
            round($stats['total_time'], 2)
        ]);
    }
    
    fclose($output);
    exit;
}

/**
 * Handle database statistics
 */
function handleDatabaseStats(string $domain): void
{
    global $db;
    
    if (!$db) {
        Response::error('Database not available', 503);
    }
    
    $conn = $db->getConnection();
    $config = require CONFIG_PATH . '/database.php';
    $prefix = $config['prefix'] ?? 'app_';
    
    $stats = [
        'api_calls' => [],
        'by_date' => [],
        'by_hour' => []
    ];
    
    try {
        // Get API calls from database
        $stmt = $conn->query(
            "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN success = 1 THEN 1 END) as successful,
                COUNT(CASE WHEN success = 0 THEN 1 END) as failed,
                AVG(duration) as avg_duration,
                MIN(duration) as min_duration,
                MAX(duration) as max_duration
            FROM {$prefix}api_calls 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );
        
        $stats['api_calls'] = $stmt->fetch();
        
        // Group by date
        $stmt = $conn->query(
            "SELECT 
                DATE(created_at) as date,
                COUNT(*) as calls,
                AVG(duration) as avg_duration
            FROM {$prefix}api_calls 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC"
        );
        
        $stats['by_date'] = $stmt->fetchAll();
        
        // Group by hour for today
        $stmt = $conn->query(
            "SELECT 
                HOUR(created_at) as hour,
                COUNT(*) as calls,
                AVG(duration) as avg_duration
            FROM {$prefix}api_calls 
            WHERE DATE(created_at) = CURDATE()
            GROUP BY HOUR(created_at)
            ORDER BY hour"
        );
        
        $stats['by_hour'] = $stmt->fetchAll();
        
        // Top methods from database
        $stmt = $conn->query(
            "SELECT 
                method,
                COUNT(*) as calls,
                AVG(duration) as avg_duration
            FROM {$prefix}api_calls 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY method
            ORDER BY calls DESC
            LIMIT 10"
        );
        
        $stats['top_methods'] = $stmt->fetchAll();
        
    } catch (Exception $e) {
        Response::error('Failed to get database statistics: ' . $e->getMessage());
    }
    
    Response::success($stats);
}

/**
 * Handle realtime statistics
 */
function handleRealtime(): void
{
    global $tracker;
    
    // Set up Server-Sent Events
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no'); // For nginx
    
    $lastEventId = $_SERVER['HTTP_LAST_EVENT_ID'] ?? 0;
    $eventId = $lastEventId + 1;
    
    // Send data every 2 seconds
    while (true) {
        $stats = $tracker->getStatistics();
        $rateLimits = $tracker->checkRateLimits();
        
        $data = [
            'timestamp' => microtime(true),
            'total_calls' => $stats['total_calls'],
            'success_rate' => $stats['success_rate'],
            'calls_per_second' => $stats['calls_per_second'],
            'rate_limit_usage' => $rateLimits['percent_used']
        ];
        
        echo "id: $eventId\n";
        echo "event: stats\n";
        echo "data: " . json_encode($data) . "\n\n";
        
        ob_flush();
        flush();
        
        $eventId++;
        
        // Check if client disconnected
        if (connection_aborted()) {
            break;
        }
        
        sleep(2);
    }
}