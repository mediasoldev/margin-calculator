<?php

namespace Handlers\Events;

use Handlers\BaseHandler;
use Exception;

/**
 * Handler for application uninstallation event
 */
class UninstallHandler extends BaseHandler
{
    /**
     * Handle application uninstallation
     */
    public function handle(): array
    {
        try {
            // Get domain from auth
            $domain = $this->auth['domain'] ?? '';
            $userId = $this->auth['user_id'] ?? null;
            
            if (empty($domain)) {
                throw new Exception('Domain not provided');
            }
            
            // Get portal data before deactivation
            $portal = $this->getPortalData();
            
            if (!$portal) {
                $this->logger->warning('Portal not found for uninstallation', [
                    'domain' => $domain
                ]);
                
                // Return success anyway - maybe it was already deactivated
                return [
                    'success' => true,
                    'message' => 'Portal not found or already uninstalled'
                ];
            }
            
            // Save uninstall information for analytics
            $this->saveUninstallInfo($portal);
            
            // Unregister event handlers
            $this->unregisterEventHandlers();
            
            // IMPORTANT: Deactivate portal instead of deleting!
            // We NEVER delete portal records to prevent trial abuse
            $deactivated = $this->db->deactivatePortal($domain, $userId);
            
            if (!$deactivated) {
                throw new Exception('Failed to deactivate portal');
            }
            
            // Log successful uninstallation
            $this->logger->info('Application uninstalled successfully', [
                'domain' => $domain,
                'member_id' => $portal['member_id'],
                'installed_days' => $this->calculateInstalledDays($portal),
                'user_id' => $userId,
                'was_trial' => $portal['is_trial'] ?? false,
                'had_license' => !empty($portal['license_key'])
            ]);
            
            return [
                'success' => true,
                'message' => 'Application uninstalled successfully',
                'data' => [
                    'domain' => $domain,
                    'uninstalled_at' => date('Y-m-d H:i:s'),
                    'portal_deactivated' => true  // NOT deleted!
                ]
            ];
            
        } catch (Exception $e) {
            $this->logger->error('Uninstallation failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'error' => true,
                'message' => 'Uninstallation failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Save uninstall information for analytics
     */
    private function saveUninstallInfo(array $portal): void
    {
        try {
            // Create uninstall log entry
            $uninstallData = [
                'domain' => $portal['domain'],
                'member_id' => $portal['member_id'],
                'installed_at' => $portal['created_at'],
                'uninstalled_at' => date('Y-m-d H:i:s'),
                'installed_days' => $this->calculateInstalledDays($portal),
                'uninstalled_by' => $this->auth['user_id'] ?? null,
                'was_trial' => $portal['is_trial'] ?? true,
                'license_key' => $portal['license_key'] ?? null
            ];
            
            // Get portal settings
            $settings = [];
            if ($this->portal) {
                $settings = $this->db->getSettings($portal['id']);
            }
            
            // Add usage statistics if available
            if (!empty($settings)) {
                $uninstallData['settings'] = json_encode($settings);
            }
            
            // Log uninstall data for future analysis
            $this->logger->info('Uninstall analytics', $uninstallData);
            
            // You could save this to a separate analytics table if needed
            // $this->db->saveUninstallRecord($uninstallData);
            
        } catch (Exception $e) {
            // Don't fail uninstall if analytics fail
            $this->logger->warning('Failed to save uninstall analytics', [
                'error' => $e->getMessage()
            ]);
        }
    }
    

    /**
     * Unregister ALL event handlers during uninstall
     * ВАЖЛИВО: При деінсталяції видаляємо ВСІ вебхуки, не тільки наші!
     */
    private function unregisterEventHandlers(): void
    {
        try {
            // Get ALL registered event handlers for this app
            $result = $this->callBitrixMethod('event.get');
            
            if (!isset($result['result']) || !is_array($result['result'])) {
                $this->logger->info('No event handlers to unregister');
                return;
            }
            
            $handlers = $result['result'];
            
            if (empty($handlers)) {
                $this->logger->info('No event handlers found');
                return;
            }
            
            // ВАЖЛИВО: При деінсталяції видаляємо ВСІ вебхуки
            // що зареєстровані цим додатком, незалежно від URL
            $commands = [];
            $totalHandlers = 0;
            
            foreach ($handlers as $index => $handler) {
                // Видаляємо ВСІ вебхуки без перевірки URL
                // тому що при деінсталяції додаток повинен почистити ВСЕ за собою
                $commands["unbind_$index"] = [
                    'method' => 'event.unbind',
                    'params' => [
                        'event' => $handler['event'],
                        'handler' => $handler['handler'],
                        'auth_type' => $handler['auth_type'] ?? 0
                    ]
                ];
                $totalHandlers++;
                
                // Batch по 50 команд (ліміт Bitrix24)
                if (count($commands) >= 50) {
                    $this->executeBatchUnbind($commands);
                    $commands = [];
                }
            }
            
            // Виконати залишкові команди
            if (!empty($commands)) {
                $this->executeBatchUnbind($commands);
            }
            
            $this->logger->info('All event handlers unregistered during uninstall', [
                'total_handlers' => $totalHandlers,
                'domain' => $this->domain
            ]);
            
        } catch (Exception $e) {
            // Log but don't fail uninstallation
            $this->logger->error('Failed to unregister event handlers', [
                'error' => $e->getMessage()
            ]);
        }
    }
        
    /**
     * Execute batch unbind commands
     */
    private function executeBatchUnbind(array $commands): void
    {
        if (empty($commands)) {
            return;
        }
        
        try {
            $batchResult = $this->callBitrixBatch($commands, false);
            
            $unregistered = 0;
            $failed = 0;
            
            if (isset($batchResult['result'])) {
                foreach ($batchResult['result'] as $key => $res) {
                    if (isset($res['error'])) {
                        $failed++;
                        
                        // Логуємо тільки якщо це не помилка "вже видалено"
                        if ($res['error'] !== 'EVENT_NOT_FOUND') {
                            $this->logger->warning('Failed to unregister event in batch', [
                                'key' => $key,
                                'error' => $res['error_description'] ?? $res['error']
                            ]);
                        }
                    } else {
                        $unregistered++;
                    }
                }
            }
            
            if ($unregistered > 0 || $failed > 0) {
                $this->logger->info('Batch unbind completed', [
                    'unregistered' => $unregistered,
                    'failed' => $failed
                ]);
            }
            
        } catch (Exception $e) {
            $this->logger->error('Batch unbind failed', [
                'error' => $e->getMessage()
            ]);
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
     * Calculate how many days the app was installed
     */
    private function calculateInstalledDays(array $portal): int
    {
        if (empty($portal['created_at'])) {
            return 0;
        }
        
        $installed = strtotime($portal['created_at']);
        $now = time();
        
        $days = floor(($now - $installed) / (60 * 60 * 24));
        
        return max(0, $days);
    }
    
    /**
     * Clean up any remaining data
     */
    private function cleanupData(): void
    {
        try {
            // Clean up any cached data
            if ($this->portal) {
                $cacheKey = "portal_{$this->portal['id']}_*";
                // If you have cache implementation, clean it here
                // $this->cache->deletePattern($cacheKey);
            }
            
            // Clean up any temporary files
            $tempPath = STORAGE_PATH . '/temp/' . $this->domain;
            if (is_dir($tempPath)) {
                $this->recursiveDelete($tempPath);
            }
            
        } catch (Exception $e) {
            // Don't fail uninstall if cleanup fails
            $this->logger->warning('Failed to cleanup data', [
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Recursively delete directory
     */
    private function recursiveDelete(string $dir): bool
    {
        if (!is_dir($dir)) {
            return false;
        }
        
        $files = array_diff(scandir($dir), ['.', '..']);
        
        foreach ($files as $file) {
            $path = "$dir/$file";
            
            if (is_dir($path)) {
                $this->recursiveDelete($path);
            } else {
                unlink($path);
            }
        }
        
        return rmdir($dir);
    }
}