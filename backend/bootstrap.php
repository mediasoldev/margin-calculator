<?php
/**
 * Bootstrap file for Bitrix24 App Template
 * Initializes autoloading, environment and database
 */

// Define paths
define('BACKEND_PATH', __DIR__);
define('ROOT_PATH', dirname(__DIR__));
define('STORAGE_PATH', ROOT_PATH . '/storage');
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('CONFIG_PATH', BACKEND_PATH . '/config');

// Check PHP version
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    die('PHP 7.4 or higher is required');
}

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', STORAGE_PATH . '/logs/php_errors.log');

// Set default timezone
date_default_timezone_set('UTC');

// Autoloader for namespaced classes
spl_autoload_register(function ($class) {
    // Define namespace to path mapping
    $namespaces = [
        'Core\\' => BACKEND_PATH . '/lib/Core/',
        'Bitrix\\' => BACKEND_PATH . '/lib/Bitrix/',
        'Handlers\\' => BACKEND_PATH . '/handlers/',
        'App\\' => BACKEND_PATH . '/app/',
    ];
    
    foreach ($namespaces as $prefix => $basePath) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relativeClass = substr($class, $len);
            $file = $basePath . str_replace('\\', '/', $relativeClass) . '.php';
            
            if (file_exists($file)) {
                require_once $file;
                return;
            }
        }
    }
});

// Load environment variables
function loadEnv($path = null) {
    $envFile = $path ?: ROOT_PATH . '/.env';
    
    if (!file_exists($envFile)) {
        // Try to use .env.example if .env doesn't exist
        $exampleFile = ROOT_PATH . '/.env.example';
        if (file_exists($exampleFile)) {
            error_log('Warning: .env file not found, using .env.example');
            $envFile = $exampleFile;
        } else {
            error_log('Warning: No .env file found');
            return false;
        }
    }
    
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse key=value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }
            
            // Set environment variables
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
            // putenv("$key=$value");
        }
    }
    
    return true;
}

// Load environment variables
loadEnv();

// Initialize database connection
use Core\Database;

try {
    // Load database configuration
    $dbConfig = require CONFIG_PATH . '/database.php';
    
    // Initialize database and create tables if needed
    Database::init($dbConfig);
    
} catch (Exception $e) {
    // Log error but don't die - some operations might not need database
    error_log('Database initialization error: ' . $e->getMessage());
    
    // Only die if we're in a context that requires database
    if (defined('REQUIRE_DATABASE') && REQUIRE_DATABASE) {
        die('Database connection failed. Please check configuration.');
    }
}

// Initialize logger
use Core\Logger;

Logger::init([
    'path' => STORAGE_PATH . '/logs',
    'level' => $_ENV['LOG_LEVEL'] ?? 'info'
]);

// Set custom error handler
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    if (error_reporting() === 0) {
        return false;
    }
    
    $logger = new Core\Logger('error');
    $logger->error("PHP Error", [
        'code' => $errno,
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ]);
    
    return true;
});

// Set custom exception handler
set_exception_handler(function ($exception) {
    $logger = new Core\Logger('exception');
    $logger->error("Uncaught Exception", [
        'message' => $exception->getMessage(),
        'code' => $exception->getCode(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString()
    ]);
    
    // Send error response if not in CLI
    if (php_sapi_name() !== 'cli') {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json');
        
        $response = [
            'error' => true,
            'message' => 'Internal server error'
        ];
        
        // Show detailed error in debug mode
        if (($_ENV['APP_DEBUG'] ?? false) === 'true') {
            $response['details'] = [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine()
            ];
        }
        
        echo json_encode($response);
    }
    
    exit(1);
});

// Create necessary directories if they don't exist
$directories = [
    STORAGE_PATH . '/logs',
    STORAGE_PATH . '/cache',
    STORAGE_PATH . '/temp'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Return true to indicate successful bootstrap
return true;