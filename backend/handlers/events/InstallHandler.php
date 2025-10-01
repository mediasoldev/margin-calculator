<?php

namespace Handlers\Events;

use Handlers\BaseHandler;
use Exception;

/**
 * Handler for application installation event
 */
class InstallHandler extends BaseHandler
{
    /**
     * Handle application installation
     */
    public function handle(): array
    {
        try {
            // Extract all auth data
            $authData = [
                'domain' => $this->auth['domain'] ?? '',
                'member_id' => $this->auth['member_id'] ?? '',
                'user_id' => $this->auth['user_id'] ?? 0,
                'access_token' => $this->auth['access_token'] ?? '',
                'refresh_token' => $this->auth['refresh_token'] ?? '',
                'application_token' => $this->auth['application_token'] ?? '',
                'server_endpoint' => $this->auth['server_endpoint'] ?? '',
                'client_endpoint' => $this->auth['client_endpoint'] ?? '',
                'expires_in' => $this->auth['expires_in'] ?? 3600,
            ];
            
            // Validate required fields
            $requiredFields = ['domain', 'member_id', 'access_token', 'refresh_token', 'application_token'];
            foreach ($requiredFields as $field) {
                if (empty($authData[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            
            // Set default client endpoint if not provided
            if (empty($authData['client_endpoint'])) {
                $authData['client_endpoint'] = "https://{$authData['domain']}/rest/";
            }
            
            // Calculate token expiration time
            $authData['expires_at'] = time() + $authData['expires_in'];
            
            // Check if portal already exists
            $existingPortal = $this->db->getPortalByMemberId($authData['member_id']);
            


            if ($existingPortal) {
                // Portal exists - this is a reinstallation
                $this->logger->info('Portal reinstallation detected', [
                    'domain' => $authData['domain'],
                    'member_id' => $authData['member_id'],
                    'was_active' => $existingPortal['is_active']
                ]);
                
                // Update portal data
                $authData['is_active'] = 1;
                $authData['reinstall_count'] = ($existingPortal['reinstall_count'] ?? 0) + 1;
                
                // Check if trial can be used
                if ($existingPortal['trial_used']) {
                    // Trial already used, check for license
                    if (!$existingPortal['license_key']) {
                        $this->logger->warning('Trial already used, no license found', [
                            'domain' => $authData['domain'],
                            'trial_end_date' => $existingPortal['trial_end_date']
                        ]);
                        
                        // Still allow installation but mark as expired
                        $authData['is_blocked'] = 1;
                        $authData['block_reason'] = 'Trial expired, license required';
                    }
                } else if ($existingPortal['is_trial']) {
                    // Continue with existing trial
                    $authData['trial_end_date'] = $existingPortal['trial_end_date'];
                }
                
            } else {
                // New portal installation
                $this->logger->info('New portal installation', [
                    'domain' => $authData['domain'],
                    'member_id' => $authData['member_id']
                ]);
                
                // Set trial period for new installation
                $trialDays = $this->config['portal_defaults']['trial_days'] ?? 14;
                $authData['is_trial'] = 1;
                $authData['trial_used'] = 0;
                $authData['trial_end_date'] = date('Y-m-d H:i:s', strtotime("+{$trialDays} days"));
                $authData['installed_at'] = date('Y-m-d H:i:s');
                $authData['installed_by'] = $authData['user_id'];
            }
            


            // Save portal to database
            if (!$this->db) {
                throw new Exception('Database not initialized');
            }
            
            $saved = $this->db->savePortal($authData['domain'], $authData);

            if (!$saved) {
                throw new Exception('Failed to save portal data');
            }

            // Get portal ID for settings
            $portal = $this->db->getPortal($authData['domain']);
            if (!$portal) {
                throw new Exception('Failed to retrieve saved portal');
            }
            
            // Save installation/update timestamp
            $this->db->saveSetting($portal['id'], 
                $existingPortal ? 'last_reinstalled_at' : 'first_installed_at', 
                date('Y-m-d H:i:s')
            );
            $this->db->saveSetting($portal['id'], 
                $existingPortal ? 'last_reinstalled_by' : 'first_installed_by', 
                $authData['user_id']
            );
            
            // Set default settings for new installation
            if (!$existingPortal) {
                $this->saveDefaultSettings($portal['id']);
            }
            
            // Register event handlers in Bitrix24
            $this->registerEventHandlers();
            
            // Get current user info
            $userInfo = $this->getCurrentUser();
            
            // Determine installation status
            $installationStatus = 'active';
            $message = 'Application installed successfully';
            
            if ($existingPortal && $existingPortal['trial_used'] && !$existingPortal['license_key']) {
                $installationStatus = 'trial_expired';
                $message = 'Application installed but trial has expired. License required.';
            }
            
            // Log successful installation
            $this->logger->info('Application installed successfully', [
                'domain' => $authData['domain'],
                'member_id' => $authData['member_id'],
                'user_id' => $authData['user_id'],
                'user_name' => $userInfo ? $userInfo['NAME'] . ' ' . $userInfo['LAST_NAME'] : 'Unknown',
                'installation_status' => $installationStatus,
                'is_reinstall' => !empty($existingPortal)
            ]);
            
            // Send appropriate notification
            if ($authData['user_id']) {
                if ($existingPortal && $existingPortal['trial_used'] && !$existingPortal['license_key']) {
                    $this->sendLicenseRequiredNotification($authData['user_id']);
                } else {
                    $this->sendWelcomeNotification($authData['user_id']);
                }
            }
            
            return [
                'success' => true,
                'message' => $message,
                'data' => [
                    'portal_id' => $portal['id'],
                    'domain' => $authData['domain'],
                    'member_id' => $authData['member_id'],
                    'installation_status' => $installationStatus,
                    'is_trial' => $portal['is_trial'] ?? false,
                    'trial_days_remaining' => $this->calculateRemainingDays($portal['trial_end_date'] ?? null),
                    'is_reinstall' => !empty($existingPortal),
                    'license_required' => ($existingPortal && $existingPortal['trial_used'] && !$existingPortal['license_key'])
                ]
            ];
            
        } catch (Exception $e) {
            $this->logger->error('Installation failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'error' => true,
                'message' => 'Installation failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Calculate remaining trial days
     */
    private function calculateRemainingDays(?string $endDate): int
    {
        if (!$endDate) {
            return 0;
        }
        
        $end = strtotime($endDate);
        $now = time();
        
        if ($end <= $now) {
            return 0;
        }
        
        return (int) ceil(($end - $now) / 86400);
    }
    
    /**
     * Save default settings for new portal
     */
    private function saveDefaultSettings(int $portalId): void
    {
        $defaults = $this->config['portal_defaults'] ?? [];
        
        // Save features
        if (isset($defaults['features'])) {
            $this->db->saveSetting($portalId, 'features', json_encode($defaults['features']));
        }
        
        // Save trial information
        if (isset($defaults['trial_days'])) {
            $trialEndDate = date('Y-m-d H:i:s', strtotime("+{$defaults['trial_days']} days"));
            $this->db->saveSetting($portalId, 'trial_end_date', $trialEndDate);
        }
        
        // Save max users limit
        if (isset($defaults['max_users'])) {
            $this->db->saveSetting($portalId, 'max_users', $defaults['max_users']);
        }
        
        // Application version
        $this->db->saveSetting($portalId, 'app_version', $this->config['app']['version'] ?? '1.0.0');
        
        // Default language (from Bitrix24)
        $this->db->saveSetting($portalId, 'language', $this->auth['language'] ?? 'en');
        
        // Default timezone
        $this->db->saveSetting($portalId, 'timezone', $this->config['app']['timezone'] ?? 'UTC');
    }
        
    /**
     * Register event handlers in Bitrix24 with intelligent sync
     */
    private function registerEventHandlers(): void
    {
        try {
            // Використовуємо WebhookManager для інтелектуальної синхронізації
            $webhookManager = new \Bitrix\WebhookManager($this->domain);
            
            $this->logger->info('Starting webhook synchronization during installation', [
                'domain' => $this->domain
            ]);
            
            // Виконати синхронізацію
            $syncResult = $webhookManager->syncWebhooks();
            
            if ($syncResult['success']) {
                $this->logger->info('Event handlers synchronized successfully', [
                    'added' => $syncResult['added'],
                    'removed' => $syncResult['removed'],
                    'kept' => $syncResult['kept']
                ]);
                
                // Зберегти інформацію про синхронізацію
                if ($this->portal) {
                    $this->db->saveSetting($this->portal['id'], 'last_webhook_sync', json_encode([
                        'timestamp' => date('Y-m-d H:i:s'),
                        'added' => $syncResult['added'],
                        'removed' => $syncResult['removed'],
                        'kept' => $syncResult['kept']
                    ]));
                }
            } else {
                $this->logger->error('Event handler synchronization failed', [
                    'errors' => $syncResult['errors']
                ]);
                
                // Не провалюємо інсталяцію через помилки вебхуків
                // Користувач зможе синхронізувати їх пізніше
            }
            
        } catch (Exception $e) {
            // Log but don't fail installation
            $this->logger->error('Failed to synchronize event handlers', [
                'error' => $e->getMessage()
            ]);
        }
    }

    
    /**
     * Get existing event handlers
     */
    private function getExistingHandlers(): array
    {
        $result = $this->callBitrixMethod('event.get');
        
        if (isset($result['result']) && is_array($result['result'])) {
            return $result['result'];
        }
        
        return [];
    }
    
    /**
     * Unregister event handlers
     */
    private function unregisterHandlers(array $handlers): void
    {
        $commands = [];
        $webhookUrl = $this->getWebhookUrl();
        
        foreach ($handlers as $index => $handler) {
            // Only unregister our handlers
            if (isset($handler['handler']) && $handler['handler'] === $webhookUrl) {
                $commands["unreg_$index"] = [
                    'method' => 'event.unbind',
                    'params' => [
                        'event' => $handler['event'],
                        'handler' => $handler['handler']
                    ]
                ];
            }
        }
        
        if (!empty($commands)) {
            $this->callBitrixBatch($commands, false);
        }
    }
    
    /**
     * Get webhook URL for event handlers
     */
    private function getWebhookUrl(): string
    {
        $appUrl = $this->config['app']['url'] ?? '';
        
        if (empty($appUrl)) {
            // Try to determine from current request
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $appUrl = "$protocol://$host";
        }
        
        return rtrim($appUrl, '/') . $this->config['webhook']['endpoint'];
    }
    
    /**
     * Send license required notification
     */
    private function sendLicenseRequiredNotification(int $userId): void
    {
        try {
            $appName = $this->config['app']['name'] ?? 'Bitrix24 App';
            
            $message = "⚠️ $appName - License Required\n\n";
            $message .= "Your trial period has expired.\n";
            $message .= "To continue using the application, please purchase a license.\n\n";
            $message .= "Contact support for licensing options.";
            
            $this->sendNotification($userId, $message);
            
        } catch (Exception $e) {
            $this->logger->warning('Failed to send license notification', [
                'error' => $e->getMessage()
            ]);
        }
    }
}