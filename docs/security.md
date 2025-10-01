# Security Documentation

## Overview

Security is critical for Bitrix24 applications as they handle sensitive business data. This guide covers authentication, authorization, data protection, and security best practices.

## Authentication

### Application Token Validation

```php
// Every request must validate application_token
protected function validateAuth(): bool
{
    // Check required fields
    $requiredFields = ['domain', 'member_id', 'application_token'];
    foreach ($requiredFields as $field) {
        if (empty($this->auth[$field])) {
            $this->logger->warning('Missing auth field', [
                'field' => $field,
                'domain' => $this->domain
            ]);
            return false;
        }
    }
    
    // Verify application token matches database
    if ($this->portal) {
        if ($this->portal['application_token'] !== $this->auth['application_token']) {
            $this->logger->warning('Invalid application token', [
                'domain' => $this->domain,
                'received' => substr($this->auth['application_token'], 0, 10) . '...'
            ]);
            return false;
        }
    }
    
    return true;
}
```

### Token Management

```php
class SecureTokenManager extends TokenManager
{
    // Encrypt tokens before storing
    private function encryptToken(string $token): string
    {
        $key = $_ENV['ENCRYPTION_KEY'] ?? 'default-key-change-this';
        $iv = openssl_random_pseudo_bytes(16);
        $encrypted = openssl_encrypt($token, 'AES-256-CBC', $key, 0, $iv);
        return base64_encode($iv . $encrypted);
    }
    
    // Decrypt tokens when retrieving
    private function decryptToken(string $encryptedToken): string
    {
        $key = $_ENV['ENCRYPTION_KEY'] ?? 'default-key-change-this';
        $data = base64_decode($encryptedToken);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        return openssl_decrypt($encrypted, 'AES-256-CBC', $key, 0, $iv);
    }
    
    // Store tokens securely
    public function saveTokens(array $tokens): bool
    {
        $tokens['access_token'] = $this->encryptToken($tokens['access_token']);
        $tokens['refresh_token'] = $this->encryptToken($tokens['refresh_token']);
        
        return parent::saveTokens($tokens);
    }
}
```

### Session Security

```php
// Secure session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_only_cookies', 1);
ini_set('session.use_strict_mode', 1);

session_start([
    'cookie_lifetime' => 7200,
    'cookie_httponly' => true,
    'cookie_secure' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);

// Regenerate session ID periodically
if (!isset($_SESSION['last_regeneration'])) {
    $_SESSION['last_regeneration'] = time();
} elseif (time() - $_SESSION['last_regeneration'] > 300) {
    session_regenerate_id(true);
    $_SESSION['last_regeneration'] = time();
}
```

## Authorization

### Role-Based Access Control

```php
class AccessControl
{
    private $permissions = [
        'admin' => ['*'],
        'manager' => ['view_reports', 'edit_deals', 'view_contacts'],
        'user' => ['view_own_deals', 'edit_own_deals']
    ];
    
    public function checkPermission(string $role, string $permission): bool
    {
        if (!isset($this->permissions[$role])) {
            return false;
        }
        
        $rolePermissions = $this->permissions[$role];
        
        // Check for wildcard
        if (in_array('*', $rolePermissions)) {
            return true;
        }
        
        return in_array($permission, $rolePermissions);
    }
    
    public function authorize($user, string $action, $resource = null): bool
    {
        // Check user role
        $role = $this->getUserRole($user);
        
        // Check permission
        if (!$this->checkPermission($role, $action)) {
            return false;
        }
        
        // Check resource ownership if needed
        if ($resource && strpos($action, 'own_') !== false) {
            return $this->isResourceOwner($user, $resource);
        }
        
        return true;
    }
    
    private function getUserRole($user): string
    {
        if ($user['ADMIN'] ?? false) {
            return 'admin';
        }
        
        // Check department head
        if ($this->isDepartmentHead($user)) {
            return 'manager';
        }
        
        return 'user';
    }
    
    private function isDepartmentHead($user): bool
    {
        // Call Bitrix24 API to check
        $result = CRest::call('department.get', [
            'filter' => ['UF_HEAD' => $user['ID']]
        ]);
        
        return !empty($result['result']);
    }
    
    private function isResourceOwner($user, $resource): bool
    {
        return $resource['ASSIGNED_BY_ID'] == $user['ID'] ||
               $resource['CREATED_BY'] == $user['ID'];
    }
}
```

### Secure Handler Example

```php
class SecureHandler extends BaseHandler
{
    private $accessControl;
    
    public function __construct(array $request)
    {
        parent::__construct($request);
        $this->accessControl = new AccessControl();
    }
    
    public function handle(): array
    {
        // Get current user
        $user = $this->getCurrentUser();
        if (!$user) {
            return ['error' => true, 'message' => 'Unauthorized', 'code' => 401];
        }
        
        // Check permission
        $action = $this->getEventData()['action'] ?? 'view';
        if (!$this->accessControl->authorize($user, $action)) {
            $this->logger->warning('Access denied', [
                'user_id' => $user['ID'],
                'action' => $action
            ]);
            return ['error' => true, 'message' => 'Access denied', 'code' => 403];
        }
        
        // Process authorized request
        return $this->processSecureAction($action);
    }
}
```

## Input Validation

### Validation Rules

```php
class InputValidator
{
    private $rules = [
        'domain' => ['required', 'regex:/^[a-z0-9\-]+\.bitrix24\.(com|ru|de|ua)$/'],
        'license_key' => ['required', 'regex:/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/'],
        'email' => ['email', 'max:255'],
        'user_id' => ['integer', 'min:1'],
        'deal_id' => ['integer', 'min:1'],
        'amount' => ['numeric', 'min:0'],
        'title' => ['string', 'max:255', 'no_html'],
        'description' => ['string', 'max:5000', 'safe_html']
    ];
    
    public function validate(array $data, array $rules): array
    {
        $errors = [];
        
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            
            foreach ($fieldRules as $rule) {
                $error = $this->validateRule($field, $value, $rule);
                if ($error) {
                    $errors[$field][] = $error;
                }
            }
        }
        
        return $errors;
    }
    
    private function validateRule($field, $value, $rule): ?string
    {
        if (is_string($rule)) {
            [$ruleName, $parameter] = array_pad(explode(':', $rule, 2), 2, null);
        } else {
            $ruleName = $rule;
            $parameter = null;
        }
        
        switch ($ruleName) {
            case 'required':
                if (empty($value)) {
                    return "$field is required";
                }
                break;
                
            case 'email':
                if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return "$field must be a valid email";
                }
                break;
                
            case 'integer':
                if ($value && !is_numeric($value)) {
                    return "$field must be an integer";
                }
                break;
                
            case 'min':
                if ($value < $parameter) {
                    return "$field must be at least $parameter";
                }
                break;
                
            case 'max':
                if (is_string($value) && strlen($value) > $parameter) {
                    return "$field must not exceed $parameter characters";
                }
                break;
                
            case 'regex':
                if ($value && !preg_match($parameter, $value)) {
                    return "$field format is invalid";
                }
                break;
                
            case 'no_html':
                if ($value && strip_tags($value) !== $value) {
                    return "$field must not contain HTML";
                }
                break;
                
            case 'safe_html':
                // Allow only safe HTML tags
                $allowed = '<p><br><strong><em><ul><ol><li><a>';
                if ($value && strip_tags($value, $allowed) !== $value) {
                    return "$field contains disallowed HTML tags";
                }
                break;
        }
        
        return null;
    }
}
```

### Sanitization

```php
class Sanitizer
{
    public static function sanitize($value, string $type = 'text')
    {
        switch ($type) {
            case 'text':
                return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
                
            case 'html':
                return self::sanitizeHtml($value);
                
            case 'email':
                return filter_var($value, FILTER_SANITIZE_EMAIL);
                
            case 'url':
                return filter_var($value, FILTER_SANITIZE_URL);
                
            case 'integer':
                return (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
                
            case 'float':
                return (float) filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                
            case 'filename':
                return preg_replace('/[^a-zA-Z0-9\-\_\.]/', '', $value);
                
            case 'sql':
                return addslashes($value);
                
            default:
                return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
    }
    
    private static function sanitizeHtml(string $html): string
    {
        // Allow only safe HTML tags
        $allowedTags = '<p><br><strong><em><ul><ol><li><a><h1><h2><h3><h4><h5><h6>';
        $html = strip_tags($html, $allowedTags);
        
        // Remove dangerous attributes
        $html = preg_replace('/on\w+\s*=\s*"[^"]*"/i', '', $html);
        $html = preg_replace('/on\w+\s*=\s*\'[^\']*\'/i', '', $html);
        $html = preg_replace('/javascript:/i', '', $html);
        
        return $html;
    }
    
    public static function sanitizeArray(array $data, array $types = []): array
    {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            $type = $types[$key] ?? 'text';
            
            if (is_array($value)) {
                $sanitized[$key] = self::sanitizeArray($value, $types);
            } else {
                $sanitized[$key] = self::sanitize($value, $type);
            }
        }
        
        return $sanitized;
    }
}
```

## SQL Injection Prevention

### Using Prepared Statements

```php
class SecureDatabase extends Database
{
    // Always use prepared statements
    public function query(string $sql, array $params = []): PDOStatement
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->logger->error('Database query error', [
                'sql' => $sql,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    // Safe insert
    public function insert(string $table, array $data): int
    {
        $columns = array_keys($data);
        $placeholders = array_fill(0, count($columns), '?');
        
        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $this->escapeIdentifier($table),
            implode(', ', array_map([$this, 'escapeIdentifier'], $columns)),
            implode(', ', $placeholders)
        );
        
        $stmt = $this->query($sql, array_values($data));
        return $this->connection->lastInsertId();
    }
    
    // Safe update
    public function update(string $table, array $data, array $where): int
    {
        $setParts = [];
        $params = [];
        
        foreach ($data as $column => $value) {
            $setParts[] = $this->escapeIdentifier($column) . ' = ?';
            $params[] = $value;
        }
        
        $whereParts = [];
        foreach ($where as $column => $value) {
            $whereParts[] = $this->escapeIdentifier($column) . ' = ?';
            $params[] = $value;
        }
        
        $sql = sprintf(
            'UPDATE %s SET %s WHERE %s',
            $this->escapeIdentifier($table),
            implode(', ', $setParts),
            implode(' AND ', $whereParts)
        );
        
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    // Escape identifiers (table/column names)
    private function escapeIdentifier(string $identifier): string
    {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }
}
```

## XSS Prevention

### Output Escaping

```php
class XSSProtection
{
    // Escape for HTML context
    public static function escapeHtml($value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    // Escape for JavaScript context
    public static function escapeJs($value): string
    {
        return json_encode($value, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    }
    
    // Escape for URL context
    public static function escapeUrl($value): string
    {
        return rawurlencode($value);
    }
    
    // Escape for CSS context
    public static function escapeCss($value): string
    {
        return preg_replace('/[^a-zA-Z0-9\-\_]/', '', $value);
    }
    
    // Escape for HTML attribute context
    public static function escapeAttr($value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}

// Usage in templates
?>
<div class="user-name"><?php echo XSSProtection::escapeHtml($userName); ?></div>
<script>
    var userData = <?php echo XSSProtection::escapeJs($userData); ?>;
</script>
<a href="/user/<?php echo XSSProtection::escapeUrl($userId); ?>">Profile</a>
<div class="<?php echo XSSProtection::escapeCss($className); ?>">Content</div>
<input value="<?php echo XSSProtection::escapeAttr($inputValue); ?>" />
```

### Content Security Policy

```php
// Set CSP headers
header("Content-Security-Policy: " . implode('; ', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://api.bitrix24.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.bitrix24.com",
    "frame-ancestors https://*.bitrix24.com",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
]));
```

## CSRF Protection

### Token Generation and Validation

```php
class CSRFProtection
{
    private static $tokenName = 'csrf_token';
    
    // Generate CSRF token
    public static function generateToken(): string
    {
        if (!isset($_SESSION[self::$tokenName])) {
            $_SESSION[self::$tokenName] = bin2hex(random_bytes(32));
        }
        return $_SESSION[self::$tokenName];
    }
    
    // Validate CSRF token
    public static function validateToken(string $token): bool
    {
        if (!isset($_SESSION[self::$tokenName])) {
            return false;
        }
        
        return hash_equals($_SESSION[self::$tokenName], $token);
    }
    
    // Get token field HTML
    public static function getTokenField(): string
    {
        $token = self::generateToken();
        return '<input type="hidden" name="' . self::$tokenName . '" value="' . $token . '">';
    }
    
    // Middleware for validation
    public static function middleware(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $token = $_POST[self::$tokenName] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            
            if (!self::validateToken($token)) {
                http_response_code(403);
                die('CSRF validation failed');
            }
        }
    }
}

// Usage in forms
?>
<form method="POST" action="/api/endpoint">
    <?php echo CSRFProtection::getTokenField(); ?>
    <input type="text" name="data" />
    <button type="submit">Submit</button>
</form>
```

### AJAX CSRF Protection

```javascript
// Include CSRF token in AJAX requests
class SecureAPI {
    constructor() {
        this.csrfToken = this.getCSRFToken();
    }
    
    getCSRFToken() {
        // Get from meta tag
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : '';
    }
    
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        };
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 403) {
            throw new Error('CSRF validation failed');
        }
        
        return response;
    }
}
```

## File Upload Security

### Secure File Upload Handler

```php
class SecureFileUpload
{
    private $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    private $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    private $maxFileSize = 10485760; // 10MB
    private $uploadPath = STORAGE_PATH . '/uploads/';
    
    public function upload(array $file): array
    {
        // Validate file upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Upload failed with error code: ' . $file['error']);
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            throw new Exception('File size exceeds maximum allowed');
        }
        
        // Validate extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedExtensions)) {
            throw new Exception('File type not allowed');
        }
        
        // Validate MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $this->allowedMimeTypes)) {
            throw new Exception('Invalid file type');
        }
        
        // Check for malicious content
        if ($this->containsMaliciousContent($file['tmp_name'])) {
            throw new Exception('File contains potentially malicious content');
        }
        
        // Generate safe filename
        $filename = $this->generateSafeFilename($file['name']);
        $destination = $this->uploadPath . $filename;
        
        // Create directory if not exists
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new Exception('Failed to move uploaded file');
        }
        
        // Set proper permissions
        chmod($destination, 0644);
        
        return [
            'filename' => $filename,
            'original_name' => $file['name'],
            'size' => $file['size'],
            'mime_type' => $mimeType,
            'path' => $destination
        ];
    }
    
    private function containsMaliciousContent(string $filepath): bool
    {
        $content = file_get_contents($filepath);
        
        // Check for PHP tags
        if (preg_match('/<\?php/i', $content)) {
            return true;
        }
        
        // Check for script tags
        if (preg_match('/<script[^>]*>/i', $content)) {
            return true;
        }
        
        // Check for common shells
        $shellPatterns = [
            '/eval\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/passthru\s*\(/i',
            '/shell_exec\s*\(/i',
            '/base64_decode\s*\(/i'
        ];
        
        foreach ($shellPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
    
    private function generateSafeFilename(string $originalName): string
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitize basename
        $basename = preg_replace('/[^a-zA-Z0-9\-\_]/', '', $basename);
        $basename = substr($basename, 0, 50); // Limit length
        
        // Generate unique filename
        $filename = $basename . '_' . uniqid() . '.' . $extension;
        
        // Ensure no path traversal
        $filename = basename($filename);
        
        return $filename;
    }
}
```

## API Security

### Rate Limiting

```php
class RateLimiter
{
    private $db;
    private $limits = [
        'default' => ['requests' => 120, 'window' => 60],
        'auth' => ['requests' => 5, 'window' => 300],
        'api' => ['requests' => 60, 'window' => 60]
    ];
    
    public function __construct(Database $db)
    {
        $this->db = $db;
    }
    
    public function checkLimit(string $identifier, string $type = 'default'): bool
    {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        $window = $limit['window'];
        $maxRequests = $limit['requests'];
        
        // Clean old entries
        $this->db->query(
            'DELETE FROM app_rate_limits WHERE created_at < DATE_SUB(NOW(), INTERVAL ? SECOND)',
            [$window]
        );
        
        // Count recent requests
        $stmt = $this->db->query(
            'SELECT COUNT(*) as count FROM app_rate_limits 
             WHERE identifier = ? AND type = ? 
             AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)',
            [$identifier, $type, $window]
        );
        
        $result = $stmt->fetch();
        $count = $result['count'] ?? 0;
        
        if ($count >= $maxRequests) {
            return false;
        }
        
        // Log request
        $this->db->query(
            'INSERT INTO app_rate_limits (identifier, type, created_at) VALUES (?, ?, NOW())',
            [$identifier, $type]
        );
        
        return true;
    }
    
    public function getRemainingRequests(string $identifier, string $type = 'default'): array
    {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        $window = $limit['window'];
        $maxRequests = $limit['requests'];
        
        $stmt = $this->db->query(
            'SELECT COUNT(*) as count FROM app_rate_limits 
             WHERE identifier = ? AND type = ? 
             AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)',
            [$identifier, $type, $window]
        );
        
        $result = $stmt->fetch();
        $count = $result['count'] ?? 0;
        
        return [
            'limit' => $maxRequests,
            'remaining' => max(0, $maxRequests - $count),
            'reset' => time() + $window
        ];
    }
}

// Usage in API endpoint
$rateLimiter = new RateLimiter($db);
$identifier = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

if (!$rateLimiter->checkLimit($identifier, 'api')) {
    $limits = $rateLimiter->getRemainingRequests($identifier, 'api');
    
    header('X-RateLimit-Limit: ' . $limits['limit']);
    header('X-RateLimit-Remaining: ' . $limits['remaining']);
    header('X-RateLimit-Reset: ' . $limits['reset']);
    
    Response::error('Rate limit exceeded', 429);
}
```

### API Key Authentication

```php
class APIKeyAuth
{
    private $db;
    
    public function authenticate(string $apiKey): ?array
    {
        // Hash API key for storage
        $hashedKey = hash('sha256', $apiKey);
        
        $stmt = $this->db->query(
            'SELECT * FROM app_api_keys 
             WHERE key_hash = ? AND active = 1 
             AND (expires_at IS NULL OR expires_at > NOW())',
            [$hashedKey]
        );
        
        $keyData = $stmt->fetch();
        
        if (!$keyData) {
            return null;
        }
        
        // Update last used
        $this->db->query(
            'UPDATE app_api_keys SET last_used = NOW(), usage_count = usage_count + 1 WHERE id = ?',
            [$keyData['id']]
        );
        
        return $keyData;
    }
    
    public function generateAPIKey(int $portalId, string $name, ?string $expiresAt = null): string
    {
        // Generate secure random key
        $apiKey = bin2hex(random_bytes(32));
        $hashedKey = hash('sha256', $apiKey);
        
        $this->db->query(
            'INSERT INTO app_api_keys (portal_id, name, key_hash, expires_at, created_at) 
             VALUES (?, ?, ?, ?, NOW())',
            [$portalId, $name, $hashedKey, $expiresAt]
        );
        
        return $apiKey; // Return unhashed key to user once
    }
}
```

## Security Headers

### Comprehensive Security Headers

```php
class SecurityHeaders
{
    public static function apply(): void
    {
        // Prevent clickjacking
        header('X-Frame-Options: SAMEORIGIN');
        
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Enable XSS protection
        header('X-XSS-Protection: 1; mode=block');
        
        // Referrer policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Permissions policy
        header('Permissions-Policy: geolocation=(), camera=(), microphone=()');
        
        // HSTS (if using HTTPS)
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
        
        // CSP
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://api.bitrix24.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "connect-src 'self' https://*.bitrix24.com",
            "font-src 'self' data:",
            "object-src 'none'",
            "media-src 'self'",
            "frame-src https://*.bitrix24.com",
            "frame-ancestors https://*.bitrix24.com",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        ];
        header('Content-Security-Policy: ' . implode('; ', $csp));
    }
}

// Apply headers in bootstrap
SecurityHeaders::apply();
```

## Logging and Monitoring

### Security Event Logging

```php
class SecurityLogger extends Logger
{
    public function logSecurityEvent(string $event, array $context = []): void
    {
        $context['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $context['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $context['timestamp'] = time();
        
        // Add to security log
        $this->channel('security')->warning($event, $context);
        
        // Alert on critical events
        if ($this->isCriticalEvent($event)) {
            $this->sendAlert($event, $context);
        }
    }
    
    private function isCriticalEvent(string $event): bool
    {
        $criticalEvents = [
            'authentication_failed_multiple',
            'sql_injection_attempt',
            'xss_attempt',
            'unauthorized_access',
            'rate_limit_abuse'
        ];
        
        return in_array($event, $criticalEvents);
    }
    
    private function sendAlert(string $event, array $context): void
    {
        // Send email alert
        $message = "Security Alert: $event\n";
        $message .= "Details: " . json_encode($context, JSON_PRETTY_PRINT);
        
        mail(
            $_ENV['SECURITY_ALERT_EMAIL'] ?? 'admin@example.com',
            'Security Alert: ' . $event,
            $message,
            'From: security@' . $_SERVER['HTTP_HOST']
        );
    }
}
```

## Best Practices

### 1. Principle of Least Privilege
- Grant minimum necessary permissions
- Use role-based access control
- Regularly review and audit permissions

### 2. Defense in Depth
- Multiple layers of security
- Don't rely on single security measure
- Validate at every level

### 3. Secure by Default
- Deny by default, allow by exception
- Use secure defaults for all configurations
- Require explicit enabling of risky features

### 4. Regular Security Audits
```bash
# Security audit checklist
- [ ] Review authentication mechanisms
- [ ] Check authorization rules
- [ ] Audit database queries for SQL injection
- [ ] Test input validation
- [ ] Review file upload handling
- [ ] Check for XSS vulnerabilities
- [ ] Verify CSRF protection
- [ ] Review API security
- [ ] Check security headers
- [ ] Review logging and monitoring
- [ ] Test rate limiting
- [ ] Verify encryption usage
```

### 5. Security Testing
```php
// Automated security tests
class SecurityTest extends PHPUnit\Framework\TestCase
{
    public function testSQLInjection()
    {
        $maliciousInput = "'; DROP TABLE users; --";
        $result = $this->api->post('/search', ['query' => $maliciousInput]);
        
        $this->assertEquals(400, $result->getStatusCode());
        $this->assertDatabaseHas('users', ['id' => 1]); // Table still exists
    }
    
    public function testXSSPrevention()
    {
        $xssPayload = '<script>alert("XSS")</script>';
        $result = $this->api->post('/comment', ['text' => $xssPayload]);
        
        $this->assertStringNotContainsString('<script>', $result->getBody());
    }
    
    public function testCSRFProtection()
    {
        // Request without CSRF token
        $result = $this->api->post('/update', ['data' => 'test']);
        
        $this->assertEquals(403, $result->getStatusCode());
    }
}
```

## Incident Response

### Security Incident Handler

```php
class IncidentResponse
{
    public function handleIncident(string $type, array $details): void
    {
        // 1. Log incident
        $this->logIncident($type, $details);
        
        // 2. Take immediate action
        switch ($type) {
            case 'brute_force':
                $this->blockIP($details['ip']);
                break;
            case 'data_breach':
                $this->lockdownApplication();
                break;
            case 'malware_detected':
                $this->quarantineFile($details['file']);
                break;
        }
        
        // 3. Notify administrators
        $this->notifyAdmins($type, $details);
        
        // 4. Create incident report
        $this->createReport($type, $details);
    }
    
    private function blockIP(string $ip): void
    {
        $this->db->query(
            'INSERT INTO app_blocked_ips (ip, reason, blocked_at) VALUES (?, ?, NOW())',
            [$ip, 'Brute force attempt']
        );
    }
    
    private function lockdownApplication(): void
    {
        // Set maintenance mode
        file_put_contents(STORAGE_PATH . '/maintenance.lock', time());
        
        // Revoke all active sessions
        $this->db->query('UPDATE app_portals SET access_token = NULL, refresh_token = NULL');
    }
}
```


## Webhook Security

### Automatic Cleanup for Security

**Security Benefit**: Expired portals cannot:
- Receive sensitive event data
- Consume API quotas
- Access system after expiration

**Implementation**:
- Automatic webhook unregistration on expiration
- No manual intervention reduces human error
- Audit trail of all webhook operations
- Encrypted webhook configuration storage

