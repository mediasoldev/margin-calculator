<?php

namespace Core;

/**
 * Response helper class
 */
class Response
{
    /**
     * Send JSON response
     */
    public static function json($data, int $code = 200): void
    {
        // Clean any existing output
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Set response code
        http_response_code($code);
        
        // Set headers
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Add CORS headers if configured
        self::setCorsHeaders();
        
        // Output JSON
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        
        // End execution
        exit;
    }
    
    /**
     * Send success response
     */
    public static function success($data = null, string $message = 'OK'): void
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::json($response, 200);
    }
    
    /**
     * Send error response
     */
    public static function error(string $message, int $code = 400, $details = null): void
    {
        $response = [
            'success' => false,
            'error' => true,
            'message' => $message,
        ];
        
        if ($details !== null) {
            $response['details'] = $details;
        }
        
        // Add debug info in development mode
        if (($_ENV['APP_DEBUG'] ?? 'false') === 'true') {
            $response['debug'] = [
                'file' => debug_backtrace()[0]['file'] ?? null,
                'line' => debug_backtrace()[0]['line'] ?? null,
            ];
        }
        
        self::json($response, $code);
    }
    
    /**
     * Send unauthorized response
     */
    public static function unauthorized(string $message = 'Unauthorized'): void
    {
        self::error($message, 401);
    }
    
    /**
     * Send forbidden response
     */
    public static function forbidden(string $message = 'Forbidden'): void
    {
        self::error($message, 403);
    }
    
    /**
     * Send not found response
     */
    public static function notFound(string $message = 'Not Found'): void
    {
        self::error($message, 404);
    }
    
    /**
     * Send method not allowed response
     */
    public static function methodNotAllowed(string $message = 'Method Not Allowed'): void
    {
        self::error($message, 405);
    }
    
    /**
     * Send validation error response
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): void
    {
        $response = [
            'success' => false,
            'error' => true,
            'message' => $message,
            'errors' => $errors,
        ];
        
        self::json($response, 422);
    }
    
    /**
     * Send server error response
     */
    public static function serverError(string $message = 'Internal Server Error', $details = null): void
    {
        // Log the error
        $logger = new Logger('error');
        $logger->error($message, ['details' => $details]);
        
        // Send response
        self::error($message, 500, ($_ENV['APP_DEBUG'] ?? 'false') === 'true' ? $details : null);
    }
    
    /**
     * Send redirect response
     */
    public static function redirect(string $url, int $code = 302): void
    {
        header("Location: $url", true, $code);
        exit;
    }
    
    /**
     * Send file download response
     */
    public static function download(string $filePath, string $filename = null): void
    {
        if (!file_exists($filePath)) {
            self::notFound('File not found');
        }
        
        $filename = $filename ?: basename($filePath);
        $filesize = filesize($filePath);
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
        
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Set headers
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . $filesize);
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Output file
        readfile($filePath);
        exit;
    }
    
    /**
     * Send HTML response
     */
    public static function html(string $content, int $code = 200): void
    {
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Set response code
        http_response_code($code);
        
        // Set headers
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        
        // Output HTML
        echo $content;
        exit;
    }
    
    /**
     * Send plain text response
     */
    public static function text(string $content, int $code = 200): void
    {
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Set response code
        http_response_code($code);
        
        // Set headers
        header('Content-Type: text/plain; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        
        // Output text
        echo $content;
        exit;
    }
    
    /**
     * Send XML response
     */
    public static function xml($data, int $code = 200): void
    {
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Set response code
        http_response_code($code);
        
        // Set headers
        header('Content-Type: application/xml; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        
        // Convert array to XML if needed
        if (is_array($data)) {
            $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><response></response>');
            self::arrayToXml($data, $xml);
            $data = $xml->asXML();
        }
        
        // Output XML
        echo $data;
        exit;
    }
    
    /**
     * Convert array to XML
     */
    private static function arrayToXml(array $data, \SimpleXMLElement &$xml): void
    {
        foreach ($data as $key => $value) {
            if (is_numeric($key)) {
                $key = 'item' . $key;
            }
            
            if (is_array($value)) {
                $subnode = $xml->addChild($key);
                self::arrayToXml($value, $subnode);
            } else {
                $xml->addChild($key, htmlspecialchars($value));
            }
        }
    }
    
    /**
     * Set CORS headers
     */
    private static function setCorsHeaders(): void
    {
        $config = require CONFIG_PATH . '/app.php';
        $corsConfig = $config['api']['cors'] ?? [];
        
        if (!($corsConfig['enabled'] ?? false)) {
            return;
        }
        
        // Get allowed origins
        $origins = $corsConfig['origins'] ?? ['*'];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array('*', $origins)) {
            header('Access-Control-Allow-Origin: *');
        } elseif (in_array($origin, $origins)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        // Set other CORS headers
        $methods = implode(', ', $corsConfig['methods'] ?? ['GET', 'POST']);
        $headers = implode(', ', $corsConfig['headers'] ?? ['Content-Type']);
        
        header("Access-Control-Allow-Methods: $methods");
        header("Access-Control-Allow-Headers: $headers");
        
        if ($corsConfig['credentials'] ?? false) {
            header('Access-Control-Allow-Credentials: true');
        }
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('Access-Control-Max-Age: 86400'); // 24 hours
            http_response_code(200);
            exit;
        }
    }
    
    /**
     * Stream response (for large files or real-time data)
     */
    public static function stream(\Closure $callback, string $contentType = 'text/plain'): void
    {
        // Disable output buffering
        @ini_set('output_buffering', 'off');
        @ini_set('zlib.output_compression', false);
        
        while (@ob_end_flush());
        
        // Set headers
        header("Content-Type: $contentType; charset=utf-8");
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // For nginx
        
        // Call the callback function
        $callback();
        
        exit;
    }
    
    /**
     * Send Server-Sent Events (SSE) response
     */
    public static function sse(\Closure $callback): void
    {
        self::stream(function() use ($callback) {
            // SSE specific headers
            header('Content-Type: text/event-stream');
            header('Connection: keep-alive');
            
            $callback();
        });
    }
    
    /**
     * Send chunked response
     */
    public static function chunked(\Generator $generator): void
    {
        // Set headers for chunked transfer
        header('Transfer-Encoding: chunked');
        header('Content-Type: application/json; charset=utf-8');
        
        // Send chunks
        foreach ($generator as $chunk) {
            $data = json_encode($chunk) . "\n";
            echo sprintf("%x\r\n%s\r\n", strlen($data), $data);
            ob_flush();
            flush();
        }
        
        // Send final chunk
        echo "0\r\n\r\n";
        exit;
    }
}