<?php

namespace Handlers;

use Core\Database;
use Core\Logger;
use Core\Response;
use Bitrix\CRest;
use Bitrix\TokenManager;
use Bitrix\WebhookManager;
use Exception;

/**
 * Base handler for all event handlers
 * UPDATED: Added automatic webhook unregistration for expired licenses
 */
abstract class BaseHandler
{
    protected array $request;
    protected string $domain;
    protected array $auth;
    protected ?Database $db;
    protected Logger $logger;
    protected ?array $portal = null;
    protected ?TokenManager $tokenManager = null;
    protected ?WebhookManager $webhookManager = null;
    protected array $config;
    
    /**
     * Constructor
     */
    public function __construct(array $request)
    {
        $this->request = $request;
        $this->auth = $request['auth'] ?? [];
        $this->domain = $this->auth['domain'] ?? '';
        
        // Initialize services
        $this->db = Database::getInstance();
        $this->logger = new Logger('handler');
        $this->config = require CONFIG_PATH . '/app.php';
        
        // Set domain for CRest
        if ($this->domain) {
            CRest::setDomain($this->domain);
        }
        
        // Load portal data if available
        if ($this->db && $this->domain) {
            $this->portal = $this->db->getPortal($this->domain);
        }
        
        // Initialize token manager
        if ($this->domain) {
            $this->tokenManager = new TokenManager($this->domain);
        }
        
        // Initialize webhook manager
        if ($this->domain) {
            $this->webhookManager = new WebhookManager($this->domain);
        }
        
        // Log incoming request
        $this->logRequest();
    }
    
    /**
     * Main handler method - must be implemented by child classes
     */
    abstract public function handle(): array;
    
    /**
     * Process the request and return response
     * UPDATED: Added webhook unregistration logic
     */
    public function process(): void
    {
        try {
            // Validate authentication
            if (!$this->validateAuth()) {
                Response::unauthorized('Invalid authentication');
                return;
            }
            
            // Check license (except for installation/uninstallation)
            $skipLicenseCheck = [
                'Handlers\Events\InstallHandler',
                'Handlers\Events\UninstallHandler',
                'Handlers\Events\LicenseHandler'
            ];
            
            if (!in_array(static::class, $skipLicenseCheck)) {
                $licenseStatus = $this->checkLicense();
                
                if (!$licenseStatus['is_valid']) {
                    // NEW: Check if we need to unregister webhooks
                    $this->handleExpiredLicense($licenseStatus);
                    
                    Response::error(
                        'License expired or invalid',
                        402,
                        $licenseStatus
                    );
                    return;
                }
            }
            
            // Call handler
            $result = $this->handle();
            
            // Send response
            if (isset($result['error']) && $result['error']) {
                Response::error($result['message'] ?? 'Unknown error', $result['code'] ?? 400);
            } else {
                Response::success($result['data'] ?? null, $result['message'] ?? 'OK');
            }
            
        } catch (Exception $e) {
            $this->logger->error('Handler exception', [
                'handler' => static::class,
                'domain' => $this->domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            Response::serverError('Internal server error', 
                $this->config['app']['debug'] ? $e->getMessage() : null);
        }
    }
    
    /**
     * Handle expired license - unregister webhooks if needed
     * NEW METHOD
     */
    protected function handleExpiredLicense(array $licenseStatus): void
    {
        try {
            // Check if webhooks should be unregistered
            if (!$this->webhookManager) {
                return;
            }
            
            // Check if webhooks are already unregistered
            if ($this->portal) {
                $settings = $this->db->getSettings($this->portal['id'], 'webhooks_unregistered');
                if (!empty($settings['webhooks_unregistered']) && $settings['webhooks_unregistered'] === '1') {
                    // Already unregistered
                    return;
                }
            }
            
            // Determine reason
            $reason = 'License expired';
            if ($licenseStatus['status'] === 'trial' && !$licenseStatus['is_valid']) {
                $reason = 'Trial period expired';
            } elseif ($licenseStatus['status'] === 'blocked') {
                $reason = $licenseStatus['reason'] ?? 'Portal blocked';
            }
            
            $this->logger->warning('License invalid, unregistering webhooks', [
                'domain' => $this->domain,
                'status' => $licenseStatus['status'],
                'reason' => $reason
            ]);
            
            // Unregister all webhooks
            $unregistered = $this->webhookManager->unregisterAllWebhooks($reason);
            
            if ($unregistered) {
                $this->logger->info('Webhooks successfully unregistered due to expired license', [
                    'domain' => $this->domain,
                    'reason' => $reason
                ]);
                
                // Send notification to admin if possible
                if ($this->portal && $this->portal['user_id']) {
                    $this->sendLicenseExpiredNotification($this->portal['user_id'], $reason);
                }
            } else {
                $this->logger->error('Failed to unregister webhooks', [
                    'domain' => $this->domain
                ]);
            }
            
        } catch (Exception $e) {
            $this->logger->error('Error handling expired license', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Send notification about license expiration and webhook removal
     * NEW METHOD
     */
    protected function sendLicenseExpiredNotification(int $userId, string $reason): void
    {
        try {
            $appName = $this->config['app']['name'] ?? 'Bitrix24 App';
            
            $message = "⚠️ $appName - Service Suspended\n\n";
            $message .= "Reason: $reason\n\n";
            $message .= "The application webhooks have been unregistered to prevent unnecessary load.\n";
            $message .= "To resume service, please activate a valid license.\n\n";
            $message .= "All your data remains safe and will be available once the license is renewed.";
            
            $this->sendNotification($userId, $message);
            
        } catch (Exception $e) {
            $this->logger->warning('Failed to send license expiration notification', [
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Check license status
     * UPDATED: Added more detailed logging
     */
    protected function checkLicense(): array
    {
        if (!$this->db || !$this->domain) {
            return ['is_valid' => false, 'status' => 'no_database'];
        }
        
        $licenseStatus = $this->db->checkLicenseStatus($this->domain);
        
        // Log if license is invalid
        if (!$licenseStatus['is_valid']) {
            $this->logger->warning('License check failed', [
                'domain' => $this->domain,
                'status' => $licenseStatus['status'],
                'reason' => $licenseStatus['reason'] ?? null,
                'days_remaining' => $licenseStatus['days_remaining'] ?? 0
            ]);
        }
        
        return $licenseStatus;
    }
    
    /**
     * Validate authentication
     */
    protected function validateAuth(): bool
    {
        // Skip auth check if disabled in config
        if (!($this->config['security']['check_auth'] ?? true)) {
            return true;
        }
        
        // Check if we have auth data
        if (empty($this->auth)) {
            $this->logger->warning('Missing auth data', [
                'domain' => $this->domain,
                'handler' => static::class
            ]);
            return false;
        }
        
        // Validate required fields
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
        
        // Verify application token if portal exists
        if (!$this->auth['application_token']) {
                return false;
        }
        
        return true;
    }
    
    // ... [Rest of the methods remain the same] ...
    
    /**
     * Get portal data from database
     */
    protected function getPortalData(): ?array
    {
        if ($this->portal === null && $this->db && $this->domain) {
            $this->portal = $this->db->getPortal($this->domain);
        }
        
        return $this->portal;
    }
    
    /**
     * Call Bitrix24 API method
     */
    protected function callBitrixMethod(string $method, array $params = []): array
    {
        try {
            // Ensure we have valid token
            if ($this->tokenManager && !$this->tokenManager->validateTokens()) {
                throw new Exception('Invalid or expired tokens');
            }
            
            // Make API call
            $result = CRest::call($method, $params);
            
            // Log API call
            $this->logger->debug('Bitrix24 API call', [
                'method' => $method,
                'domain' => $this->domain,
                'success' => !isset($result['error'])
            ]);
            
            return $result;
            
        } catch (Exception $e) {
            $this->logger->error('Bitrix24 API call failed', [
                'method' => $method,
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => true,
                'error_description' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Call Bitrix24 batch API
     */
    protected function callBitrixBatch(array $commands, bool $haltOnError = true): array
    {
        try {
            // Ensure we have valid token
            if ($this->tokenManager && !$this->tokenManager->validateTokens()) {
                throw new Exception('Invalid or expired tokens');
            }
            
            // Make batch API call
            $result = CRest::callBatch($commands, $haltOnError ? 1 : 0);
            
            // Log API call
            $this->logger->debug('Bitrix24 batch API call', [
                'commands_count' => count($commands),
                'domain' => $this->domain,
                'success' => !isset($result['error'])
            ]);
            
            return $result;
            
        } catch (Exception $e) {
            $this->logger->error('Bitrix24 batch API call failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => true,
                'error_description' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Log incoming request
     */
    protected function logRequest(): void
    {
        $this->logger->info('Incoming request', [
            'handler' => static::class,
            'event' => $this->request['event'] ?? 'unknown',
            'domain' => $this->domain,
            'user_id' => $this->auth['user_id'] ?? null,
            'data_keys' => array_keys($this->request['data'] ?? [])
        ]);
    }
    
    /**
     * Get event data
     */
    protected function getEventData(): array
    {
        return $this->request['data'] ?? [];
    }
    
    /**
     * Get specific field from event data
     */
    protected function getEventField(string $field, $default = null)
    {
        $data = $this->getEventData();
        return $data['FIELDS'][$field] ?? $data[$field] ?? $default;
    }
    
    /**
     * Get portal settings
     */
    protected function getSettings(?string $key = null): array
    {
        if (!$this->portal || !$this->db) {
            return [];
        }
        
        return $this->db->getSettings($this->portal['id'], $key);
    }
    
    /**
     * Save portal setting
     */
    protected function saveSetting(string $key, $value): bool
    {
        if (!$this->portal || !$this->db) {
            return false;
        }
        
        return $this->db->saveSetting($this->portal['id'], $key, $value);
    }
    
    /**
     * Check if portal has specific feature enabled
     */
    protected function hasFeature(string $feature): bool
    {
        $settings = $this->getSettings('features');
        $features = $settings['features'] ?? [];
        
        if (is_string($features)) {
            $features = json_decode($features, true) ?? [];
        }
        
        return $features[$feature] ?? false;
    }
    
    /**
     * Get current user info from Bitrix24
     */
    protected function getCurrentUser(): ?array
    {
        $result = $this->callBitrixMethod('user.current');
        
        if (isset($result['result'])) {
            return $result['result'];
        }
        
        return null;
    }
    
    /**
     * Check if current user is admin
     */
    protected function isAdmin(): bool
    {
        $user = $this->getCurrentUser();
        return $user['ADMIN'] ?? false;
    }
    
    /**
     * Send notification to Bitrix24 user
     */
    protected function sendNotification(int $userId, string $message): bool
    {
        $result = $this->callBitrixMethod('im.notify', [
            'to' => $userId,
            'message' => $message,
            'type' => 'SYSTEM'
        ]);
        
        return !isset($result['error']);
    }
    
    /**
     * Create task in Bitrix24
     */
    protected function createTask(array $fields): ?int
    {
        $result = $this->callBitrixMethod('tasks.task.add', [
            'fields' => $fields
        ]);
        
        if (isset($result['result']['task']['id'])) {
            return (int)$result['result']['task']['id'];
        }
        
        return null;
    }
    
    /**
     * Add comment to CRM entity
     */
    protected function addCrmComment(string $entityType, int $entityId, string $message): bool
    {
        $result = $this->callBitrixMethod('crm.timeline.comment.add', [
            'fields' => [
                'ENTITY_TYPE' => $entityType,
                'ENTITY_ID' => $entityId,
                'COMMENT' => $message
            ]
        ]);
        
        return !isset($result['error']);
    }
    
    /**
     * Get CRM entity
     */
    protected function getCrmEntity(string $entityType, int $entityId): ?array
    {
        $method = 'crm.' . strtolower($entityType) . '.get';
        $result = $this->callBitrixMethod($method, ['id' => $entityId]);
        
        if (isset($result['result'])) {
            return $result['result'];
        }
        
        return null;
    }
    
    /**
     * Update CRM entity
     */
    protected function updateCrmEntity(string $entityType, int $entityId, array $fields): bool
    {
        $method = 'crm.' . strtolower($entityType) . '.update';
        $result = $this->callBitrixMethod($method, [
            'id' => $entityId,
            'fields' => $fields
        ]);
        
        return !isset($result['error']);
    }
}