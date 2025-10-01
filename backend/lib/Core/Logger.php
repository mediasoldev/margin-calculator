<?php

namespace Core;

/**
 * Logger class for application logging
 */
class Logger
{
    private string $channel;
    private static array $config = [];
    private static bool $initialized = false;
    
    // Log levels
    const EMERGENCY = 'emergency';
    const ALERT = 'alert';
    const CRITICAL = 'critical';
    const ERROR = 'error';
    const WARNING = 'warning';
    const NOTICE = 'notice';
    const INFO = 'info';
    const DEBUG = 'debug';
    
    // Numeric levels for comparison
    private static array $levels = [
        self::EMERGENCY => 0,
        self::ALERT => 1,
        self::CRITICAL => 2,
        self::ERROR => 3,
        self::WARNING => 4,
        self::NOTICE => 5,
        self::INFO => 6,
        self::DEBUG => 7,
    ];
    
    /**
     * Constructor
     */
    public function __construct(string $channel = 'app')
    {
        $this->channel = $channel;
        
        if (!self::$initialized) {
            self::init();
        }
    }


    /**
     * Get recent logs from database
     */
    public static function getRecentLogs(string $domain = null, int $limit = 100, string $level = null): array
    {
        try {
            $db = Database::getInstance();
            if (!$db) {
                return [];
            }
            
            $conn = $db->getConnection();
            if (!$conn) {
                return [];
            }
            
            $config = require CONFIG_PATH . '/database.php';
            $prefix = $config['prefix'] ?? 'app_';
            
            $query = "SELECT * FROM {$prefix}logs WHERE 1=1";
            $params = [];
            
            if ($domain) {
                $portal = $db->getPortal($domain);
                if ($portal) {
                    $query .= " AND portal_id = :portal_id";
                    $params['portal_id'] = $portal['id'];
                }
            }
            
            if ($level) {
                $query .= " AND level = :level";
                $params['level'] = $level;
            }
            
            $query .= " ORDER BY created_at DESC LIMIT :limit";
            
            $stmt = $conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll();
            
        } catch (\Exception $e) {
            error_log("Failed to get recent logs: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get log statistics
     */
    public static function getLogStatistics(string $domain = null): array
    {
        try {
            $db = Database::getInstance();
            if (!$db) {
                return [];
            }
            
            $conn = $db->getConnection();
            if (!$conn) {
                return [];
            }
            
            $config = require CONFIG_PATH . '/database.php';
            $prefix = $config['prefix'] ?? 'app_';
            
            $query = "SELECT 
                level,
                COUNT(*) as count,
                MAX(created_at) as last_occurrence
                FROM {$prefix}logs 
                WHERE 1=1";
            
            if ($domain) {
                $portal = $db->getPortal($domain);
                if ($portal) {
                    $query .= " AND portal_id = " . $portal['id'];
                }
            }
            
            $query .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY level";
            
            $stmt = $conn->query($query);
            return $stmt->fetchAll();
            
        } catch (\Exception $e) {
            error_log("Failed to get log statistics: " . $e->getMessage());
            return [];
        }
    }

    
    /**
     * Initialize logger with configuration
     */
    public static function init(array $config = []): void
    {
        self::$config = array_merge([
            'path' => STORAGE_PATH . '/logs',
            'level' => self::INFO,
            'format' => 'json', // json or text
            'max_files' => 30,
            'date_format' => 'Y-m-d H:i:s',
            'filename_format' => 'Y-m-d',
        ], $config);
        
        // Create logs directory if it doesn't exist
        if (!is_dir(self::$config['path'])) {
            mkdir(self::$config['path'], 0755, true);
        }
        
        self::$initialized = true;
    }
    
    /**
     * Log emergency message
     */
    public function emergency(string $message, array $context = []): void
    {
        $this->log(self::EMERGENCY, $message, $context);
    }
    
    /**
     * Log alert message
     */
    public function alert(string $message, array $context = []): void
    {
        $this->log(self::ALERT, $message, $context);
    }
    
    /**
     * Log critical message
     */
    public function critical(string $message, array $context = []): void
    {
        $this->log(self::CRITICAL, $message, $context);
    }
    
    /**
     * Log error message
     */
    public function error(string $message, array $context = []): void
    {
        $this->log(self::ERROR, $message, $context);
    }
    
    /**
     * Log warning message
     */
    public function warning(string $message, array $context = []): void
    {
        $this->log(self::WARNING, $message, $context);
    }
    
    /**
     * Log notice message
     */
    public function notice(string $message, array $context = []): void
    {
        $this->log(self::NOTICE, $message, $context);
    }
    
    /**
     * Log info message
     */
    public function info(string $message, array $context = []): void
    {
        $this->log(self::INFO, $message, $context);
    }
    
    /**
     * Log debug message
     */
    public function debug(string $message, array $context = []): void
    {
        $this->log(self::DEBUG, $message, $context);
    }
    
    /**
     * Main log method
     */
    public function log(string $level, string $message, array $context = []): void
    {
        // Check if we should log this level
        if (!$this->shouldLog($level)) {
            return;
        }
        
        // Prepare log entry
        $entry = $this->prepareEntry($level, $message, $context);
        
        // Write to file
        $this->write($entry);
        
        // Also save to database if available
        $this->saveToDatabase($level, $message, $context);
    }
    
    /**
     * Check if message should be logged based on level
     */
    private function shouldLog(string $level): bool
    {
        $configLevel = self::$config['level'] ?? self::INFO;
        
        if (!isset(self::$levels[$level]) || !isset(self::$levels[$configLevel])) {
            return false;
        }
        
        return self::$levels[$level] <= self::$levels[$configLevel];
    }
    
    /**
     * Prepare log entry
     */
    private function prepareEntry(string $level, string $message, array $context): array
    {
        $entry = [
            'timestamp' => date(self::$config['date_format']),
            'level' => strtoupper($level),
            'channel' => $this->channel,
            'message' => $message,
        ];
        
        // Add context if not empty
        if (!empty($context)) {
            $entry['context'] = $context;
        }
        
        // Add additional info
        $entry['extra'] = [
            'pid' => getmypid(),
            'memory' => memory_get_usage(true),
        ];
        
        // Add request info if available
        if (php_sapi_name() !== 'cli') {
            $entry['request'] = [
                'method' => $_SERVER['REQUEST_METHOD'] ?? null,
                'uri' => $_SERVER['REQUEST_URI'] ?? null,
                'ip' => $this->getClientIp(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            ];
        }
        
        return $entry;
    }
    
    /**
     * Write log entry to file
     */
    private function write(array $entry): void
    {
        // Determine file path
        $date = date(self::$config['filename_format']);
        $filename = sprintf(
            '%s/%s-%s.log',
            self::$config['path'],
            $this->channel,
            $date
        );
        
        // Format entry
        if (self::$config['format'] === 'json') {
            $line = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
        } else {
            $line = $this->formatTextLine($entry) . PHP_EOL;
        }
        
        // Write to file
        $result = @file_put_contents($filename, $line, FILE_APPEND | LOCK_EX);
        
        if ($result === false) {
            error_log("Failed to write to log file: $filename");
        }
        
        // Clean old files
        $this->cleanOldFiles();
    }
    
    /**
     * Format entry as text line
     */
    private function formatTextLine(array $entry): string
    {
        $parts = [
            $entry['timestamp'],
            '[' . $entry['level'] . ']',
            '[' . $entry['channel'] . ']',
            $entry['message'],
        ];
        
        if (!empty($entry['context'])) {
            $parts[] = json_encode($entry['context'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        
        return implode(' ', $parts);
    }
    
    /**
     * Save log entry to database
     */
    private function saveToDatabase(string $level, string $message, array $context): void
    {
        try {
            $db = Database::getInstance();
            if (!$db) {
                return;
            }
            
            $conn = $db->getConnection();
            if (!$conn) {
                return;
            }
            
            // Get portal_id from context if available
            $portalId = null;
            if (isset($context['portal_id'])) {
                $portalId = $context['portal_id'];
                unset($context['portal_id']); // Remove from context before saving
            } elseif (isset($context['domain'])) {
                $portal = $db->getPortal($context['domain']);
                $portalId = $portal['id'] ?? null;
            }
            
            $config = require CONFIG_PATH . '/database.php';
            $prefix = $config['prefix'] ?? 'app_';
            
            $stmt = $conn->prepare(
                "INSERT INTO {$prefix}logs (portal_id, level, channel, message, context) 
                VALUES (:portal_id, :level, :channel, :message, :context)"
            );
            
            $stmt->execute([
                'portal_id' => $portalId,
                'level' => $level,
                'channel' => $this->channel,
                'message' => $message,
                'context' => !empty($context) ? json_encode($context) : null,
            ]);
            
        } catch (\Exception $e) {
            // Silently fail - we don't want logging to break the application
            error_log("Failed to save log to database: " . $e->getMessage());
        }
    }
    
    /**
     * Clean old log files
     */
    private function cleanOldFiles(): void
    {
        $maxFiles = self::$config['max_files'] ?? 30;
        if ($maxFiles <= 0) {
            return;
        }
        
        // Run cleanup only occasionally (1% chance)
        if (mt_rand(1, 100) > 1) {
            return;
        }
        
        $pattern = sprintf(
            '%s/%s-*.log',
            self::$config['path'],
            $this->channel
        );
        
        $files = glob($pattern);
        if (!$files || count($files) <= $maxFiles) {
            return;
        }
        
        // Sort files by modification time
        usort($files, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        // Delete oldest files
        $toDelete = count($files) - $maxFiles;
        for ($i = 0; $i < $toDelete; $i++) {
            @unlink($files[$i]);
        }
    }
    
    /**
     * Get client IP address
     */
    private function getClientIp(): ?string
    {
        $keys = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',             // Proxy
            'HTTP_X_FORWARDED_FOR',       // Load balancer
            'HTTP_X_FORWARDED',           // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',   // Cluster
            'HTTP_FORWARDED_FOR',         // Proxy
            'HTTP_FORWARDED',             // Proxy
            'REMOTE_ADDR'                 // Default
        ];
        
        foreach ($keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                
                // Handle comma-separated IPs
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, 
                    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? null;
    }
    
    /**
     * Log Bitrix24 API call
     */
    public function logApiCall(string $method, array $params = [], $result = null): void
    {
        $context = [
            'method' => $method,
            'params' => $params,
        ];
        
        if ($result !== null) {
            if (is_array($result) && isset($result['error'])) {
                $context['error'] = $result['error'];
                $this->error("Bitrix24 API call failed: $method", $context);
            } else {
                $context['success'] = true;
                $this->debug("Bitrix24 API call: $method", $context);
            }
        } else {
            $this->debug("Bitrix24 API call started: $method", $context);
        }
    }
}