<?php

namespace Bitrix;

use Core\Database;
use Core\Logger;

/**
 * Track and monitor Bitrix24 API calls
 */
class ApiCallTracker
{
    private static ?ApiCallTracker $instance = null;
    private array $calls = [];
    private float $startTime;
    private ?Database $db;
    private Logger $logger;
    private array $statistics = [
        'total_calls' => 0,
        'successful_calls' => 0,
        'failed_calls' => 0,
        'total_time' => 0,
        'methods' => []
    ];
    
    /**
     * Private constructor for singleton
     */
    private function __construct()
    {
        $this->startTime = microtime(true);
        $this->db = Database::getInstance();
        $this->logger = new Logger('api_tracker');
    }
    
    /**
     * Get instance
     */
    public static function getInstance(): ApiCallTracker
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * Track API call start
     */
    public function trackCallStart(string $method, array $params = []): string
    {
        $callId = uniqid('api_', true);
        
        $this->calls[$callId] = [
            'id' => $callId,
            'method' => $method,
            'params' => $this->sanitizeParams($params),
            'start_time' => microtime(true),
            'memory_start' => memory_get_usage(true)
        ];
        
        $this->statistics['total_calls']++;
        
        if (!isset($this->statistics['methods'][$method])) {
            $this->statistics['methods'][$method] = [
                'count' => 0,
                'success' => 0,
                'failed' => 0,
                'total_time' => 0,
                'avg_time' => 0,
                'min_time' => PHP_FLOAT_MAX,
                'max_time' => 0
            ];
        }
        
        $this->statistics['methods'][$method]['count']++;
        
        return $callId;
    }
    
    /**
     * Track API call end
     */
    public function trackCallEnd(string $callId, $result = null, bool $success = true): void
    {
        if (!isset($this->calls[$callId])) {
            return;
        }
        
        $call = &$this->calls[$callId];
        $endTime = microtime(true);
        
        $call['end_time'] = $endTime;
        $call['duration'] = ($endTime - $call['start_time']) * 1000; // Convert to milliseconds
        $call['memory_end'] = memory_get_usage(true);
        $call['memory_used'] = $call['memory_end'] - $call['memory_start'];
        $call['success'] = $success;
        $call['result_size'] = $this->calculateResultSize($result);
        
        // Update statistics
        if ($success) {
            $this->statistics['successful_calls']++;
            $this->statistics['methods'][$call['method']]['success']++;
        } else {
            $this->statistics['failed_calls']++;
            $this->statistics['methods'][$call['method']]['failed']++;
            
            // Log error details
            if (is_array($result) && isset($result['error'])) {
                $call['error'] = $result['error'];
                $call['error_description'] = $result['error_description'] ?? '';
            }
        }
        
        $methodStats = &$this->statistics['methods'][$call['method']];
        $methodStats['total_time'] += $call['duration'];
        $methodStats['avg_time'] = $methodStats['total_time'] / $methodStats['count'];
        $methodStats['min_time'] = min($methodStats['min_time'], $call['duration']);
        $methodStats['max_time'] = max($methodStats['max_time'], $call['duration']);
        
        $this->statistics['total_time'] += $call['duration'];
        
        // Log slow queries
        if ($call['duration'] > 1000) { // More than 1 second
            $this->logger->warning('Slow API call detected', [
                'method' => $call['method'],
                'duration' => $call['duration'] . 'ms',
                'params' => $call['params']
            ]);
        }
        
        // Save to database if enabled
        $this->saveToDatabaseIfNeeded($call);
    }
    
    /**
     * Get current statistics
     */
    public function getStatistics(): array
    {
        $totalTime = (microtime(true) - $this->startTime) * 1000;
        
        return array_merge($this->statistics, [
            'uptime' => $totalTime,
            'calls_per_second' => $this->statistics['total_calls'] > 0 ? 
                round($this->statistics['total_calls'] / ($totalTime / 1000), 2) : 0,
            'success_rate' => $this->statistics['total_calls'] > 0 ?
                round(($this->statistics['successful_calls'] / $this->statistics['total_calls']) * 100, 2) : 0,
            'avg_call_time' => $this->statistics['total_calls'] > 0 ?
                round($this->statistics['total_time'] / $this->statistics['total_calls'], 2) : 0
        ]);
    }
    
    /**
     * Get recent calls
     */
    public function getRecentCalls(int $limit = 10): array
    {
        return array_slice(array_reverse($this->calls), 0, $limit);
    }
    
    /**
     * Get calls by method
     */
    public function getCallsByMethod(string $method): array
    {
        return array_filter($this->calls, function($call) use ($method) {
            return $call['method'] === $method;
        });
    }
    
    /**
     * Get failed calls
     */
    public function getFailedCalls(): array
    {
        return array_filter($this->calls, function($call) {
            return isset($call['success']) && !$call['success'];
        });
    }
    
    /**
     * Get slow calls
     */
    public function getSlowCalls(float $thresholdMs = 500): array
    {
        return array_filter($this->calls, function($call) use ($thresholdMs) {
            return isset($call['duration']) && $call['duration'] > $thresholdMs;
        });
    }
    
    /**
     * Check rate limits
     */
    public function checkRateLimits(): array
    {
        $now = time();
        $oneMinuteAgo = $now - 60;
        $recentCalls = 0;
        
        foreach ($this->calls as $call) {
            if (isset($call['start_time']) && $call['start_time'] > $oneMinuteAgo) {
                $recentCalls++;
            }
        }
        
        // Bitrix24 allows 2 requests per second (120 per minute)
        $limit = 120;
        $remaining = max(0, $limit - $recentCalls);
        $percentUsed = ($recentCalls / $limit) * 100;
        
        return [
            'limit' => $limit,
            'used' => $recentCalls,
            'remaining' => $remaining,
            'percent_used' => round($percentUsed, 2),
            'is_near_limit' => $percentUsed > 80,
            'is_at_limit' => $recentCalls >= $limit
        ];
    }
    
    /**
     * Get method statistics
     */
    public function getMethodStatistics(string $method = null): array
    {
        if ($method) {
            return $this->statistics['methods'][$method] ?? [];
        }
        
        return $this->statistics['methods'];
    }
    
    /**
     * Reset statistics
     */
    public function resetStatistics(): void
    {
        $this->calls = [];
        $this->statistics = [
            'total_calls' => 0,
            'successful_calls' => 0,
            'failed_calls' => 0,
            'total_time' => 0,
            'methods' => []
        ];
        $this->startTime = microtime(true);
        
        $this->logger->info('API call statistics reset');
    }
    
    /**
     * Export statistics to JSON
     */
    public function exportStatistics(): string
    {
        $export = [
            'timestamp' => date('Y-m-d H:i:s'),
            'statistics' => $this->getStatistics(),
            'rate_limits' => $this->checkRateLimits(),
            'recent_calls' => $this->getRecentCalls(20),
            'failed_calls' => $this->getFailedCalls(),
            'slow_calls' => $this->getSlowCalls()
        ];
        
        return json_encode($export, JSON_PRETTY_PRINT);
    }
    
    /**
     * Save call to database if needed
     */
    private function saveToDatabaseIfNeeded(array $call): void
    {
        // Only save failed or slow calls to database
        if (!$call['success'] || $call['duration'] > 1000) {
            try {
                if ($this->db) {
                    $conn = $this->db->getConnection();
                    $config = require CONFIG_PATH . '/database.php';
                    $prefix = $config['prefix'] ?? 'app_';
                    
                    // Create table if not exists
                    $conn->exec("CREATE TABLE IF NOT EXISTS {$prefix}api_calls (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        call_id VARCHAR(50),
                        method VARCHAR(255),
                        params TEXT,
                        duration FLOAT,
                        memory_used INT,
                        success TINYINT(1),
                        error TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_method (method),
                        INDEX idx_created (created_at)
                    )");
                    
                    $stmt = $conn->prepare(
                        "INSERT INTO {$prefix}api_calls 
                        (call_id, method, params, duration, memory_used, success, error) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)"
                    );
                    
                    $stmt->execute([
                        $call['id'],
                        $call['method'],
                        json_encode($call['params']),
                        $call['duration'],
                        $call['memory_used'],
                        $call['success'] ? 1 : 0,
                        isset($call['error']) ? json_encode($call['error']) : null
                    ]);
                }
            } catch (\Exception $e) {
                $this->logger->error('Failed to save API call to database', [
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
    
    /**
     * Sanitize params for logging
     */
    private function sanitizeParams(array $params): array
    {
        $sanitized = [];
        
        foreach ($params as $key => $value) {
            // Hide sensitive data
            if (in_array(strtolower($key), ['password', 'token', 'secret', 'auth'])) {
                $sanitized[$key] = '***HIDDEN***';
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizeParams($value);
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Calculate result size
     */
    private function calculateResultSize($result): int
    {
        if (is_string($result)) {
            return strlen($result);
        } elseif (is_array($result) || is_object($result)) {
            return strlen(json_encode($result));
        }
        
        return 0;
    }
    
    /**
     * Get performance report
     */
    public function getPerformanceReport(): array
    {
        $stats = $this->getStatistics();
        $rateLimits = $this->checkRateLimits();
        
        $report = [
            'summary' => [
                'total_calls' => $stats['total_calls'],
                'success_rate' => $stats['success_rate'] . '%',
                'avg_response_time' => $stats['avg_call_time'] . 'ms',
                'calls_per_second' => $stats['calls_per_second'],
                'uptime' => $this->formatTime($stats['uptime'])
            ],
            'rate_limits' => [
                'status' => $rateLimits['is_at_limit'] ? 'AT_LIMIT' : 
                           ($rateLimits['is_near_limit'] ? 'NEAR_LIMIT' : 'OK'),
                'usage' => $rateLimits['percent_used'] . '%',
                'calls_in_last_minute' => $rateLimits['used']
            ],
            'top_methods' => $this->getTopMethods(5),
            'slowest_methods' => $this->getSlowestMethods(5),
            'most_failed_methods' => $this->getMostFailedMethods(5)
        ];
        
        return $report;
    }
    
    /**
     * Get top methods by call count
     */
    private function getTopMethods(int $limit): array
    {
        $methods = $this->statistics['methods'];
        uasort($methods, function($a, $b) {
            return $b['count'] - $a['count'];
        });
        
        return array_slice($methods, 0, $limit, true);
    }
    
    /**
     * Get slowest methods
     */
    private function getSlowestMethods(int $limit): array
    {
        $methods = $this->statistics['methods'];
        uasort($methods, function($a, $b) {
            return $b['avg_time'] <=> $a['avg_time'];
        });
        
        return array_slice($methods, 0, $limit, true);
    }
    
    /**
     * Get most failed methods
     */
    private function getMostFailedMethods(int $limit): array
    {
        $methods = $this->statistics['methods'];
        $methods = array_filter($methods, function($m) {
            return $m['failed'] > 0;
        });
        
        uasort($methods, function($a, $b) {
            return $b['failed'] - $a['failed'];
        });
        
        return array_slice($methods, 0, $limit, true);
    }
    
    /**
     * Format time in human readable format
     */
    private function formatTime(float $milliseconds): string
    {
        $seconds = $milliseconds / 1000;
        
        if ($seconds < 60) {
            return round($seconds, 2) . 's';
        } elseif ($seconds < 3600) {
            return round($seconds / 60, 2) . 'min';
        } else {
            return round($seconds / 3600, 2) . 'h';
        }
    }
}