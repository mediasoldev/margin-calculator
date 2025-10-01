<?php

namespace Handlers\Events;

use Handlers\BaseHandler;
use Exception;

/**
 * Handler for application update event
 */
class UpdateHandler extends BaseHandler
{
    /**
     * Handle application update
     */
    public function handle(): array
    {
        try {
            $domain = $this->auth['domain'] ?? '';
            
            if (empty($domain)) {
                throw new Exception('Domain not provided');
            }
            
            // Get current portal data
            $portal = $this->getPortalData();
            
            if (!$portal) {
                // Portal doesn't exist, treat as new installation
                $installHandler = new InstallHandler($this->request);
                return $installHandler->handle();
            }
            
            // Update auth data
            $updateData = [
                'access_token' => $this->auth['access_token'] ?? $portal['access_token'],
                'refresh_token' => $this->auth['refresh_token'] ?? $portal['refresh_token'],
                'application_token' => $this->auth['application_token'] ?? $portal['application_token'],
                'expires_at' => time() + ($this->auth['expires_in'] ?? 3600),
                'user_id' => $this->auth['user_id'] ?? $portal['user_id']
            ];
            
            // Save updated data
            $saved = $this->db->savePortal($domain, $updateData);
            
            if (!$saved) {
                throw new Exception('Failed to update portal data');
            }
            
            // Update application version
            $this->db->saveSetting($portal['id'], 'app_version', $this->config['app']['version'] ?? '1.0.0');
            $this->db->saveSetting($portal['id'], 'updated_at', date('Y-m-d H:i:s'));
            $this->db->saveSetting($portal['id'], 'updated_by', $this->auth['user_id'] ?? null);
            
            // Re-register event handlers (in case new events were added)
            $this->updateEventHandlers();
            
            // Apply any database migrations if needed
            $this->applyMigrations($portal);
            
            // Log successful update
            $this->logger->info('Application updated successfully', [
                'domain' => $domain,
                'member_id' => $portal['member_id'],
                'user_id' => $this->auth['user_id'] ?? null,
                'version' => $this->config['app']['version'] ?? '1.0.0'
            ]);
            
            return [
                'success' => true,
                'message' => 'Application updated successfully',
                'data' => [
                    'domain' => $domain,
                    'version' => $this->config['app']['version'] ?? '1.0.0',
                    'updated_at' => date('Y-m-d H:i:s')
                ]
            ];
            
        } catch (Exception $e) {
            $this->logger->error('Update failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'error' => true,
                'message' => 'Update failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Update event handlers with intelligent sync
     */
    private function updateEventHandlers(): void
    {
        try {
            // Використовуємо WebhookManager для інтелектуальної синхронізації
            $webhookManager = new \Bitrix\WebhookManager($this->domain);
            
            $this->logger->info('Updating webhooks during application update', [
                'domain' => $this->domain
            ]);
            
            // Виконати синхронізацію
            $syncResult = $webhookManager->syncWebhooks();
            
            if ($syncResult['success']) {
                $this->logger->info('Event handlers updated successfully', [
                    'added' => count($syncResult['added']),
                    'removed' => count($syncResult['removed']),
                    'kept' => count($syncResult['kept'])
                ]);
            } else {
                $this->logger->error('Event handler update had errors', [
                    'errors' => $syncResult['errors']
                ]);
            }
            
        } catch (Exception $e) {
            $this->logger->error('Failed to update event handlers', [
                'error' => $e->getMessage()
            ]);
        }
    }

    
    /**
     * Get current event handlers
     */
    private function getCurrentHandlers(): array
    {
        $result = $this->callBitrixMethod('event.get');
        
        if (!isset($result['result']) || !is_array($result['result'])) {
            return [];
        }
        
        $handlers = [];
        $webhookUrl = $this->getWebhookUrl();
        
        foreach ($result['result'] as $handler) {
            // Only include our handlers
            if (isset($handler['handler']) && 
                (strpos($handler['handler'], $webhookUrl) !== false || 
                 strpos($handler['handler'], 'webhook.php') !== false)) {
                $handlers[$handler['event']] = $handler['handler'];
            }
        }
        
        return $handlers;
    }
    
    /**
     * Get webhook URL
     */
    private function getWebhookUrl(): string
    {
        $appUrl = $this->config['app']['url'] ?? '';
        
        if (empty($appUrl)) {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $appUrl = "$protocol://$host";
        }
        
        return rtrim($appUrl, '/') . $this->config['webhook']['endpoint'];
    }
    
    /**
     * Apply database migrations if needed
     */
    private function applyMigrations(array $portal): void
    {
        try {
            // Get current version from settings
            $settings = $this->db->getSettings($portal['id'], 'app_version');
            $currentVersion = $settings['app_version'] ?? '1.0.0';
            $newVersion = $this->config['app']['version'] ?? '1.0.0';
            
            // Compare versions
            if (version_compare($currentVersion, $newVersion, '<')) {
                $this->logger->info('Applying migrations', [
                    'from_version' => $currentVersion,
                    'to_version' => $newVersion
                ]);
                
                // Apply version-specific migrations here
                // Example:
                // if (version_compare($currentVersion, '1.1.0', '<')) {
                //     $this->migrateTo110($portal);
                // }
                // if (version_compare($currentVersion, '1.2.0', '<')) {
                //     $this->migrateTo120($portal);
                // }
            }
            
        } catch (Exception $e) {
            $this->logger->error('Failed to apply migrations', [
                'error' => $e->getMessage()
            ]);
        }
    }
}