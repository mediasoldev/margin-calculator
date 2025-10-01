<?php

namespace Handlers\Events;

use Handlers\BaseHandler;
use Bitrix\WebhookManager;
use Exception;

/**
 * Handler for license management operations
 * UPDATED: Added webhook re-registration after license activation
 */
class LicenseHandler extends BaseHandler
{
    /**
     * Handle license operations
     */
    public function handle(): array
    {
        try {
            // Get operation type from request
            $operation = $this->getEventData()['operation'] ?? 'check';
            
            switch ($operation) {
                case 'check':
                    return $this->checkLicenseOperation();
                    
                case 'activate':
                    return $this->activateLicenseOperation();
                    
                case 'validate':
                    return $this->validateLicenseKey();
                    
                case 'extend':
                    return $this->extendLicense();
                    
                case 'deactivate':
                    return $this->deactivateLicense();
                    
                default:
                    return [
                        'error' => true,
                        'message' => 'Unknown license operation: ' . $operation,
                        'code' => 400
                    ];
            }
            
        } catch (Exception $e) {
            $this->logger->error('License operation failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => true,
                'message' => 'License operation failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Check license status
     */
    private function checkLicenseOperation(): array
    {
        $status = $this->db->checkLicenseStatus($this->domain);
        
        // Check webhook status
        $webhookStatus = 'registered';
        if ($this->portal) {
            $settings = $this->db->getSettings($this->portal['id'], 'webhooks_unregistered');
            if (!empty($settings['webhooks_unregistered']) && $settings['webhooks_unregistered'] === '1') {
                $webhookStatus = 'unregistered';
            }
        }
        
        $this->logger->info('License check performed', [
            'domain' => $this->domain,
            'status' => $status['status'],
            'is_valid' => $status['is_valid'],
            'webhook_status' => $webhookStatus
        ]);
        
        return [
            'success' => true,
            'message' => 'License status retrieved',
            'data' => array_merge($status, [
                'webhook_status' => $webhookStatus
            ])
        ];
    }
    
    /**
     * Activate license
     * UPDATED: Added webhook re-registration
     */
    private function activateLicenseOperation(): array
    {
        $data = $this->getEventData();
        $licenseKey = $data['license_key'] ?? '';
        
        if (empty($licenseKey)) {
            return [
                'error' => true,
                'message' => 'License key is required',
                'code' => 400
            ];
        }
        
        // Validate license key format
        if (!$this->isValidLicenseFormat($licenseKey)) {
            return [
                'error' => true,
                'message' => 'Invalid license key format',
                'code' => 400
            ];
        }
        
        // Check license key with license server (if implemented)
        $licenseData = $this->verifyLicenseWithServer($licenseKey);
        
        if (!$licenseData['valid']) {
            return [
                'error' => true,
                'message' => $licenseData['message'] ?? 'Invalid license key',
                'code' => 400
            ];
        }
        
        // Activate license in database
        $validUntil = $licenseData['valid_until'] ?? date('Y-m-d H:i:s', strtotime('+1 year'));
        $activated = $this->db->activateLicense(
            $this->domain,
            $licenseKey,
            $validUntil,
            $this->auth['user_id'] ?? null
        );
        
        if (!$activated) {
            return [
                'error' => true,
                'message' => 'Failed to activate license',
                'code' => 500
            ];
        }
        
        // NEW: Re-register webhooks if they were unregistered
        $webhooksReregistered = false;
        if ($this->portal) {
            $settings = $this->db->getSettings($this->portal['id'], 'webhooks_unregistered');
            if (!empty($settings['webhooks_unregistered']) && $settings['webhooks_unregistered'] === '1') {
                $this->logger->info('Re-registering webhooks after license activation', [
                    'domain' => $this->domain
                ]);
                
                $webhookManager = new WebhookManager($this->domain);
                $webhooksReregistered = $webhookManager->reregisterWebhooks();
                
                if ($webhooksReregistered) {
                    $this->logger->info('Webhooks successfully re-registered', [
                        'domain' => $this->domain
                    ]);
                } else {
                    $this->logger->warning('Failed to re-register webhooks', [
                        'domain' => $this->domain
                    ]);
                }
            }
        }
        
        // Unblock portal if it was blocked
        if ($this->portal && $this->portal['is_blocked']) {
            $this->db->unblockPortal($this->domain);
            $this->logger->info('Portal unblocked after license activation', [
                'domain' => $this->domain
            ]);
        }
        
        // Send confirmation notification
        if ($this->auth['user_id']) {
            $this->sendLicenseActivatedNotification($this->auth['user_id'], $validUntil, $webhooksReregistered);
        }
        
        $this->logger->info('License activated successfully', [
            'domain' => $this->domain,
            'license_key' => substr($licenseKey, 0, 8) . '...',
            'valid_until' => $validUntil,
            'webhooks_reregistered' => $webhooksReregistered
        ]);
        
        return [
            'success' => true,
            'message' => 'License activated successfully',
            'data' => [
                'valid_until' => $validUntil,
                'days_valid' => $this->calculateDaysUntil($validUntil),
                'webhooks_reregistered' => $webhooksReregistered
            ]
        ];
    }
    
    /**
     * Deactivate license and unregister webhooks
     * NEW METHOD
     */
    private function deactivateLicense(): array
    {
        // Only admin can deactivate
        if (!$this->isAdmin()) {
            return [
                'error' => true,
                'message' => 'Only administrators can deactivate license',
                'code' => 403
            ];
        }
        
        // Clear license
        $this->db->query(
            "UPDATE app_portals SET 
                license_key = NULL, 
                license_valid_until = NULL,
                is_blocked = 1,
                block_reason = 'License manually deactivated'
            WHERE domain = ?",
            [$this->domain]
        );
        
        // Unregister webhooks
        $webhookManager = new WebhookManager($this->domain);
        $unregistered = $webhookManager->unregisterAllWebhooks('License manually deactivated');
        
        $this->logger->warning('License manually deactivated', [
            'domain' => $this->domain,
            'user_id' => $this->auth['user_id'],
            'webhooks_unregistered' => $unregistered
        ]);
        
        return [
            'success' => true,
            'message' => 'License deactivated',
            'data' => [
                'webhooks_unregistered' => $unregistered
            ]
        ];
    }
    
    /**
     * Validate license key format
     */
    private function isValidLicenseFormat(string $key): bool
    {
        // Example format: XXXX-XXXX-XXXX-XXXX
        // Adjust pattern based on your license key format
        $pattern = '/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/';
        return preg_match($pattern, $key) === 1;
    }
    
    /**
     * Verify license with external server
     */
    private function verifyLicenseWithServer(string $licenseKey): array
    {
        // TODO: Implement actual license verification with your license server
        // This is a placeholder implementation
        
        $this->logger->debug('License verification (placeholder)', [
            'license_key' => substr($licenseKey, 0, 8) . '...'
        ]);
        
        // Example response structure
        return [
            'valid' => true,
            'valid_until' => date('Y-m-d H:i:s', strtotime('+1 year')),
            'features' => ['all'],
            'message' => 'License is valid'
        ];
        
        /* Real implementation example:
        try {
            $licenseServerUrl = $this->config['license_server']['url'] ?? '';
            $licenseServerKey = $this->config['license_server']['api_key'] ?? '';
            
            $ch = curl_init($licenseServerUrl . '/verify');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'license_key' => $licenseKey,
                'domain' => $this->domain,
                'member_id' => $this->portal['member_id'] ?? ''
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $licenseServerKey
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                return [
                    'valid' => false,
                    'message' => 'License server error'
                ];
            }
            
            return json_decode($response, true);
            
        } catch (Exception $e) {
            $this->logger->error('License server error', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'valid' => false,
                'message' => 'Failed to verify license'
            ];
        }
        */
    }
    
    /**
     * Validate license key without activating
     */
    private function validateLicenseKey(): array
    {
        $data = $this->getEventData();
        $licenseKey = $data['license_key'] ?? '';
        
        if (empty($licenseKey)) {
            return [
                'error' => true,
                'message' => 'License key is required',
                'code' => 400
            ];
        }
        
        // Check format
        if (!$this->isValidLicenseFormat($licenseKey)) {
            return [
                'success' => false,
                'data' => [
                    'valid' => false,
                    'message' => 'Invalid license key format'
                ]
            ];
        }
        
        // Verify with server
        $licenseData = $this->verifyLicenseWithServer($licenseKey);
        
        return [
            'success' => true,
            'message' => 'License validation completed',
            'data' => [
                'valid' => $licenseData['valid'],
                'message' => $licenseData['message'] ?? '',
                'valid_until' => $licenseData['valid_until'] ?? null
            ]
        ];
    }
    
    /**
     * Extend existing license
     */
    private function extendLicense(): array
    {
        $data = $this->getEventData();
        $extensionKey = $data['extension_key'] ?? '';
        $additionalDays = $data['days'] ?? 365;
        
        if (empty($extensionKey)) {
            return [
                'error' => true,
                'message' => 'Extension key is required',
                'code' => 400
            ];
        }
        
        // Get current portal
        $portal = $this->getPortalData();
        
        if (!$portal || !$portal['license_key']) {
            return [
                'error' => true,
                'message' => 'No active license found to extend',
                'code' => 400
            ];
        }
        
        // Verify extension key
        // TODO: Implement actual verification
        
        // Calculate new expiry date
        $currentExpiry = strtotime($portal['license_valid_until']);
        $newExpiry = date('Y-m-d H:i:s', $currentExpiry + ($additionalDays * 86400));
        
        // Update license
        $updated = $this->db->activateLicense(
            $this->domain,
            $portal['license_key'], // Keep existing key
            $newExpiry,
            $this->auth['user_id'] ?? null
        );
        
        if (!$updated) {
            return [
                'error' => true,
                'message' => 'Failed to extend license',
                'code' => 500
            ];
        }
        
        // Re-register webhooks if they were unregistered
        $webhooksReregistered = false;
        if ($portal['is_blocked'] || 
            (!empty($settings['webhooks_unregistered']) && $settings['webhooks_unregistered'] === '1')) {
            $webhookManager = new WebhookManager($this->domain);
            $webhooksReregistered = $webhookManager->reregisterWebhooks();
            
            // Unblock portal
            $this->db->unblockPortal($this->domain);
        }
        
        $this->logger->info('License extended', [
            'domain' => $this->domain,
            'new_expiry' => $newExpiry,
            'additional_days' => $additionalDays,
            'webhooks_reregistered' => $webhooksReregistered
        ]);
        
        return [
            'success' => true,
            'message' => 'License extended successfully',
            'data' => [
                'valid_until' => $newExpiry,
                'days_added' => $additionalDays,
                'total_days' => $this->calculateDaysUntil($newExpiry),
                'webhooks_reregistered' => $webhooksReregistered
            ]
        ];
    }
    
    /**
     * Calculate days until date
     */
    private function calculateDaysUntil(string $date): int
    {
        $target = strtotime($date);
        $now = time();
        
        if ($target <= $now) {
            return 0;
        }
        
        return (int) ceil(($target - $now) / 86400);
    }
    
    /**
     * Send license activated notification
     * UPDATED: Added webhook status info
     */
    private function sendLicenseActivatedNotification(int $userId, string $validUntil, bool $webhooksReregistered): void
    {
        try {
            $appName = $this->config['app']['name'] ?? 'Bitrix24 App';
            $days = $this->calculateDaysUntil($validUntil);
            
            $message = "✅ $appName - License Activated\n\n";
            $message .= "Your license has been successfully activated.\n";
            $message .= "Valid until: " . date('F j, Y', strtotime($validUntil)) . "\n";
            $message .= "Days remaining: $days\n\n";
            
            if ($webhooksReregistered) {
                $message .= "✅ Application webhooks have been restored.\n";
                $message .= "All features are now fully operational.\n\n";
            }
            
            $message .= "Thank you for your purchase!";
            
            $this->sendNotification($userId, $message);
            
        } catch (Exception $e) {
            $this->logger->warning('Failed to send license notification', [
                'error' => $e->getMessage()
            ]);
        }
    }
}