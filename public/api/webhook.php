<?php
/**
 * Webhook endpoint for Bitrix24 events
 * Receives and processes all incoming events from Bitrix24
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
require_once __DIR__ . '/../backend/bootstrap.php';

use Core\Logger;
use Core\Response;

// Initialize logger
$logger = new Logger('webhook');

try {
    // Get request data
    $inputRaw = file_get_contents('php://input');
    $inputData = json_decode($inputRaw, true);
    
    // Log raw request
    $logger->debug('Incoming webhook request', [
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'unknown',
        'content_length' => strlen($inputRaw),
        'has_post' => !empty($_POST),
        'has_request' => !empty($_REQUEST),
        'has_json' => !empty($inputData)
    ]);
    
    // Merge data from different sources
    $requestData = [];
    
    // Priority: JSON body > POST > GET
    if (!empty($inputData) && is_array($inputData)) {
        $requestData = $inputData;
    } elseif (!empty($_POST)) {
        $requestData = $_POST;
    } elseif (!empty($_REQUEST)) {
        $requestData = $_REQUEST;
    }
    
    // Validate request data
    if (empty($requestData)) {
        $logger->warning('Empty webhook request');
        Response::error('Bad Request: No data received', 400);
    }
    
    // Check for event
    $event = $requestData['event'] ?? '';
    if (empty($event)) {
        $logger->warning('Missing event in webhook request', [
            'data_keys' => array_keys($requestData)
        ]);
        Response::error('Bad Request: Missing event parameter', 400);
    }
    
    // Check for auth data
    $auth = $requestData['auth'] ?? [];
    if (empty($auth) || empty($auth['domain'])) {
        $logger->warning('Missing or invalid auth in webhook request', [
            'event' => $event,
            'has_auth' => !empty($auth),
            'auth_keys' => array_keys($auth)
        ]);
        Response::error('Bad Request: Missing or invalid auth data', 400);
    }

    // Log the event
    $logger->info('Processing webhook event', [
        'event' => $event,
        'domain' => $auth['domain'] ?? 'unknown',
        'member_id' => $auth['member_id'] ?? 'unknown',
        'user_id' => $auth['user_id'] ?? null
    ]);
    
    // Load routes configuration
    $routes = require CONFIG_PATH . '/routes.php';
    
    // Normalize event name (convert to lowercase)
    $eventNormalized = strtolower($event);
    
    // Find handler for the event
    $handlerClass = null;
    
    
    if (isset($routes[$eventNormalized])) {
        $handlerClass = $routes[$eventNormalized];
    } elseif (isset($routes['default'])) {
        $handlerClass = $routes['default'];
        $logger->info('Using default handler for unknown event', [
            'event' => $event
        ]);
    }

    // Check if handler class exists
    if (!$handlerClass || !class_exists($handlerClass)) {
        $logger->error('Handler class not found', [
            'event' => $event,
            'handler_class' => $handlerClass
        ]);
        Response::error('Handler not found for event: ' . $event, 404);
    }
    

    // Create handler instance
    try {
        $handler = new $handlerClass($requestData);
    } catch (Exception $e) {
        $logger->error('Failed to instantiate handler', [
            'event' => $event,
            'handler_class' => $handlerClass,
            'error' => $e->getMessage()
        ]);
        Response::serverError('Failed to process event');
    }
    
    // Check if handler has the required method
    if (!method_exists($handler, 'process')) {
        $logger->error('Handler missing process method', [
            'event' => $event,
            'handler_class' => $handlerClass
        ]);
        Response::serverError('Invalid handler configuration');
    }
    
//  die(print_r($handler , 1) . " | handlerClass - " . $handlerClass . " | class_exists(handlerClass) - " . class_exists($handlerClass));

    // Process the event
    try {
        $handler->process();
    } catch (Exception $e) {
        $logger->error('Handler processing failed', [
            'event' => $event,
            'handler_class' => $handlerClass,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        Response::serverError('Event processing failed');
    }

} catch (Exception $e) {
    // Log unexpected error
    if (isset($logger)) {
        $logger->critical('Unexpected webhook error', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
    } else {
        error_log('Critical webhook error: ' . $e->getMessage());
    }
    
    // Send error response
    Response::serverError('Internal Server Error');
}